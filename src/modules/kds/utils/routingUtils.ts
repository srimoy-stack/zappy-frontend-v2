import { KDSItem, KDSOrder, KDSStation } from '../types/kds';

export interface RoutingConfig {
    enable_station_routing: boolean;
    selectedStationId: string | 'ALL';
    kds_stations: KDSStation[];
    allow_item_station_override: boolean;
    item_station_map: Record<string, string>;
    master_screen_view_mode: 'FULL_ORDER' | 'STATION_ONLY';
}

/**
 * Determines if a specific item should be displayed on the current station/view.
 */
export function isItemVisibleOnStation(item: KDSItem, config: RoutingConfig): boolean {
    const {
        enable_station_routing,
        selectedStationId,
        master_screen_view_mode
    } = config;

    // 1. If global routing is disabled OR "Universal View" is selected, everything is visible.
    if (!enable_station_routing || selectedStationId === 'ALL') {
        return true;
    }

    // 2. If we are in "Full Order" view mode, we show all items regardless of station, 
    // BUT only if the order itself contains AT LEAST ONE item for this station.
    if (master_screen_view_mode === 'FULL_ORDER') {
        return true;
    }

    // 3. Granular Item Routing (STATION_ONLY mode)
    const itemStationId = getItemStation(item, config);
    return itemStationId === selectedStationId;
}

/**
 * Gets the station ID for a specific item based on config.
 * Resolves station by checking if item's category is in station's routing_category_ids.
 */
export function getItemStation(item: KDSItem, config: RoutingConfig): string {
    const { kds_stations, allow_item_station_override, item_station_map } = config;

    // 1. Check explicit item override first
    if (allow_item_station_override) {
        const itemOverride = item_station_map[item.name];
        if (itemOverride) return itemOverride;
    }

    // 2. Find station that handles this category
    if (item.categoryId && kds_stations) {
        const station = kds_stations.find(s => s.routing_category_ids?.includes(item.categoryId!));
        if (station) return station.station_id;
    }

    // 3. Fallback to 'kitchen'
    return 'kitchen';
}

/**
 * Determines if an entire order should be displayed on the current station/view.
 * An order is visible if:
 * - Universal View is selected
 * - OR it contains at least one item mapped to the current station.
 */
export function isOrderVisibleOnStation(order: KDSOrder, config: RoutingConfig): boolean {
    const { enable_station_routing, selectedStationId } = config;

    if (!enable_station_routing || selectedStationId === 'ALL') {
        return true;
    }

    return order.items.some(item => getItemStation(item, config) === selectedStationId);
}
