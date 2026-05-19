import { KDSBootstrapResponse } from '../types/kds';
import { generateSeedOrders } from '../utils/orderSeedGenerator';
import { useKDSStore } from '../store/kdsStore';
import { useKDSAccessStore } from '../store/kdsAccessStore';
import { useSoundStore } from '../store/useSoundStore';
import { useFilterStore } from '../store/useFilterStore';
import { configureDispatcher } from './kdsEventDispatcher';
import { kdsApiService } from './kdsApiService';
import { kdsStreamService } from './kdsStreamService';

/**
 * Main bootstrap entry point.
 * Hydrates all KDS-related stores with the bootstrap data.
 * 
 * Requirement 10.1: Bootstrap / Config
 */
export async function bootstrapKDS(stationId?: string) {
    let data: KDSBootstrapResponse;

    try {
        data = await kdsApiService.bootstrap(stationId);
    } catch (error) {
        console.warn('[KDSBootstrap] API call failed, falling back to mock data:', error);
        // Fallback for development
        data = await getMockBootstrapData();
    }

    // 1. Hydrate Access Store
    const accessStore = useKDSAccessStore.getState();
    accessStore.setUserContext({
        userId: data.user_claims?.user_id || "guest",
        roleId: data.user_claims?.role_id || "KITCHEN_STAFF",
        brandId: data.station.brand_id || "brand-demo",
        storeId: data.station.store_id || "store-demo",
        permissions: data.user_claims?.permissions || ["KDS_ORDER_VIEW"],
    });

    accessStore.setStationContext({
        stationId: data.station.station_id,
        isStationMode: true,
    });

    // 2. Hydrate KDS Store (Orders + Routing Rules + Tickets)
    const kdsStore = useKDSStore.getState();
    if (data.orders && data.orders.length > 0) {
        kdsStore.batchUpdateOrders(data.orders);
    }

    // Requirement: Set open tickets
    if (data.open_tickets && data.open_tickets.length > 0) {
        // Assume store has a way to handle tickets specifically or add them as orders
        // For now, if tickets have snapshots (KDSItem[]), we can add them.
        data.open_tickets.forEach(ticket => {
            if (ticket.items && Array.isArray(ticket.items) && typeof ticket.items[0] !== 'string') {
                // It's a snapshot, we can treat it as a mini-order if needed
            }
        });
    }

    if (data.routing_rules) {
        kdsStore.setRoutingRules(data.routing_rules);
    }

    // 3. Hydrate Sound Store
    const soundStore = useSoundStore.getState();
    if (data.sound_config) {
        soundStore.setSettings({
            volume: data.sound_config.volume ?? 0.5,
            newOrder: data.sound_config.newOrder ?? true,
            delayed: data.sound_config.delayed ?? true,
            overdue: data.sound_config.overdue ?? true,
        });
    }

    // 4. Reset Filter Store
    useFilterStore.getState().resetFilters();

    // 5. Configure Event Dispatcher
    configureDispatcher({
        tenantId: data.station.brand_id || 'unknown',
        storeId: data.station.store_id || 'unknown',
    });

    // 6. Connect Real-time Feed (Requirement 10.3)
    kdsStreamService.connect(data.station.station_id);

    console.info(`[KDSBootstrap] Bootstrap complete for station: ${data.station.station_id}`);
    return data;
}

/**
 * Provides mock data for development when the backend is unavailable.
 */
async function getMockBootstrapData(): Promise<KDSBootstrapResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const mockOrders = generateSeedOrders();

    return {
        station: {
            station_id: "kitchen-main",
            station_name: "Kitchen",
            type: "KITCHEN",
            active: true,
            display_order: 1,
            routing_category_ids: ["BURGERS", "SIDES"],
            sound_config: {}
        },
        routing_rules: {
            enable_station_routing: true,
            item_station_map: {},
            allow_item_station_override: true
        },
        sound_config: { volume: 0.8 },
        open_tickets: [],
        orders: mockOrders,
        user_claims: {
            user_id: "mock-user-1",
            role_id: "STORE_MANAGER",
            permissions: ["KDS_ORDER_VIEW", "KDS_BUMP_ITEM", "KDS_REFIRE", "KDS_RECALL", "KDS_MARK_READY", "KDS_STATION_MANAGEMENT", "KDS_MASTER_VIEW", "KDS_SETTING_EDIT"]
        }
    };
}
