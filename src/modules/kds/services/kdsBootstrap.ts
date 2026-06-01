/**
 * kdsBootstrap.ts
 *
 * Handles the KDS bootstrap flow:
 *   1. Calls GET /api/kds/bootstrap with session credentials
 *   2. Hydrates kdsAccessStore (user identity + permissions)
 *   3. Hydrates kdsStore (stations, routing rules, open orders)
 *   4. Hydrates useSoundStore (sound configuration)
 *
 * This is called ONCE when the KDS layout mounts, AFTER session validation.
 * The bootstrap endpoint is expected to return everything the KDS needs to
 * render its first frame — no additional API calls should be needed.
 */

import { useKDSStore } from '../store/kdsStore';
import { useKDSAccessStore } from '../store/kdsAccessStore';
import { useSoundStore } from '../store/useSoundStore';
import { KDSOrder, KDSStation } from '../types/kds';
import { configureDispatcher } from '../services/kdsEventDispatcher';

// ─────────────────────────────────────────────────────────────────────────────
//  Bootstrap Response Type
// ─────────────────────────────────────────────────────────────────────────────

export interface KDSBootstrapResponse {
    user: {
        user_id: string;
        role_id: string;
        brand_id: string;
        store_id: string;
        permissions: string[];
    };
    station: {
        station_id: string | 'ALL';
        station_name: string;
        is_station_mode: boolean;
    } | null;
    routing_rules: {
        enable_station_routing: boolean;
        allow_item_station_override: boolean;
        stations: KDSStation[];
        category_station_map: Record<string, string>;
        item_station_map: Record<string, string>;
        master_screen_view_mode: 'FULL_ORDER' | 'STATION_ONLY';
        order_ready_rule: 'ALL_STATIONS_COMPLETE' | 'EXPO_CONFIRMS_READY';
        station_prep_time_override_enabled: boolean;
        station_delay_affects_global_eta: boolean;
        station_print_mode: 'PRINT_BY_STATION' | 'PRINT_FULL_ORDER';
    };
    sound_config: {
        sound_scope: 'STATION_ONLY' | 'ALL_DEVICES';
        volume: number;
        new_order: boolean;
        delayed: boolean;
        overdue: boolean;
    };
    open_orders: KDSOrder[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Bootstrap Execution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute the full KDS bootstrap sequence.
 * Returns the raw response for inspection, or throws on failure.
 */
export async function executeKDSBootstrap(): Promise<KDSBootstrapResponse> {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
    const url = `${apiBase}/kds/bootstrap`;

    let data: KDSBootstrapResponse;

    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include', // Include session cookies
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // If the backend is unavailable, fall back to mock data
            if (response.status === 404 || response.status >= 500) {
                console.warn(
                    `[KDSBootstrap] Backend returned ${response.status}, using fallback bootstrap data.`
                );
                data = getFallbackBootstrapData();
            } else {
                throw new Error(`Bootstrap failed with status ${response.status}`);
            }
        } else {
            data = await response.json();
        }
    } catch (err) {
        // Network error (backend not running) — use fallback
        console.warn('[KDSBootstrap] Network error, using fallback bootstrap data:', err);
        data = getFallbackBootstrapData();
    }

    hydrateStores(data);
    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Store Hydration
// ─────────────────────────────────────────────────────────────────────────────

function hydrateStores(data: KDSBootstrapResponse): void {
    const { user, station, routing_rules, sound_config, open_orders } = data;

    // ── 1. Access Store — user identity ──────────────────────────────────────
    const accessStore = useKDSAccessStore.getState();

    accessStore.setUserContext({
        userId: user.user_id,
        roleId: user.role_id,
        brandId: user.brand_id,
        storeId: user.store_id,
        permissions: user.permissions,
    });

    // ── 1b. Access Store — station context ────────────────────────────────────
    if (station) {
        accessStore.setStationContext({
            stationId: station.station_id,
            isStationMode: station.is_station_mode,
        });
    }

    // ── 2. KDS Store — Routing config ─────────────────────────────────────────
    const kds = useKDSStore.getState();

    kds.setStationRouting(routing_rules.enable_station_routing);
    kds.setAllowItemOverride(routing_rules.allow_item_station_override);
    kds.setStations(routing_rules.stations);
    kds.updateCategoryStationMap(routing_rules.category_station_map);
    kds.updateItemStationMap(routing_rules.item_station_map);
    kds.setMasterViewMode(routing_rules.master_screen_view_mode);
    kds.setOrderReadyRule(routing_rules.order_ready_rule);
    kds.setStationPrepTimeEnabled(routing_rules.station_prep_time_override_enabled);
    kds.setStationDelayAffectsGlobalEta(routing_rules.station_delay_affects_global_eta);
    kds.setStationPrintMode(routing_rules.station_print_mode);
    kds.setSoundScope(sound_config.sound_scope);

    // Set selected station if bootstrap specifies a device-locked station
    if (station && station.station_id !== 'ALL') {
        kds.setSelectedStation(station.station_id);
    }

    // ── 3. KDS Store — Open orders bulk load ──────────────────────────────────
    if (open_orders.length > 0) {
        kds.batchUpdateOrders(open_orders);
    }

    // ── 4. Sound Store ────────────────────────────────────────────────────────
    const soundStore = useSoundStore.getState();
    soundStore.setVolume(sound_config.volume);
    if (sound_config.new_order !== soundStore.settings.newOrder) {
        soundStore.toggleEvent('newOrder');
    }
    if (sound_config.delayed !== soundStore.settings.delayed) {
        soundStore.toggleEvent('delayed');
    }
    if (sound_config.overdue !== soundStore.settings.overdue) {
        soundStore.toggleEvent('overdue');
    }

    // ── 5. Event Dispatcher configuration ─────────────────────────────────────
    configureDispatcher({
        tenantId: user.brand_id,
        storeId: user.store_id,
    });

    console.info(
        `[KDSBootstrap] ✅ Complete — user: ${user.user_id}, store: ${user.store_id}, ` +
        `station: ${station?.station_id ?? 'ALL'}, orders loaded: ${open_orders.length}`
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Fallback Data (used when backend is unavailable during development)
// ─────────────────────────────────────────────────────────────────────────────

function getFallbackBootstrapData(): KDSBootstrapResponse {
    return {
        user: {
            user_id: 'user-1',
            role_id: 'STORE_MANAGER',
            brand_id: 'tenant-demo',
            store_id: 'store-01',
            permissions: [
                'kds.orders.read',
                'kds.orders.advance_stage',
                'kds.orders.accept',
                'kds.orders.delay',
                'kds.orders.cancel',
                'kds.orders.override_stage',
                'kds.orders.hold',
                'kds.orders.recall',
                'kds.orders.print',
                'kds.orders.send_message',
                'kds.station.configure',
                'kds.sound.configure',
                'kds.stress_test',
            ],
        },
        station: null, // null = master/universal view
        routing_rules: {
            enable_station_routing: false,
            allow_item_station_override: true,
            stations: [
                { station_id: 'kitchen', station_name: 'Kitchen', active: true, display_order: 1, type: 'KITCHEN', routing_category_ids: ['burgers', 'sides', 'starters', 'wings'], sound_config: {} },
                { station_id: 'bar', station_name: 'Bar', active: true, display_order: 2, type: 'BAR', routing_category_ids: ['drinks'], sound_config: {} },
                { station_id: 'dessert', station_name: 'Dessert', active: true, display_order: 3, type: 'KITCHEN', routing_category_ids: ['desserts'], sound_config: {} },
                { station_id: 'drinks', station_name: 'Drinks', active: true, display_order: 4, type: 'BAR', routing_category_ids: ['drinks'], sound_config: {} },
                { station_id: 'expo', station_name: 'Expo (Expeditor)', active: true, display_order: 5, type: 'EXPO', routing_category_ids: [], sound_config: {} },
            ],

            category_station_map: {},
            item_station_map: {},
            master_screen_view_mode: 'FULL_ORDER',
            order_ready_rule: 'ALL_STATIONS_COMPLETE',
            station_prep_time_override_enabled: false,
            station_delay_affects_global_eta: true,
            station_print_mode: 'PRINT_BY_STATION',
        },
        sound_config: {
            sound_scope: 'STATION_ONLY',
            volume: 0.5,
            new_order: true,
            delayed: true,
            overdue: true,
        },
        open_orders: [],
    };
}
