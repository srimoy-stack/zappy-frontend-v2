/**
 * Zyappy Restaurant Commerce Operations Dashboard Types
 */

export interface SalesChannel {
    channel: string;
    orders: number;
    sales: number;
    percentage: number;
}

export interface RecentOrder {
    id: string;
    time: string;
    orderNumber: string;
    customer: string;
    channel: 'POS' | 'Online' | 'Uber' | 'Zomato' | 'Swiggy';
    status: 'completed' | 'pending' | 'cancelled' | 'refunded' | 'prep' | 'ready' | 'transit';
    total: number;
    items?: Array<{ name: string; qty: number; price: number; modifiers?: string[] }>;
    prepTimeRemaining?: number; // in minutes
    storeName?: string;
    syncStatus?: 'synced' | 'pending' | 'failed';
    failReason?: string;
}

export interface StoreInfo {
    id: string;
    name: string;
    revenue: number;
    orders: number;
    activeStaff: number;
    prepTime: number; // average in minutes
    status: 'online' | 'offline' | 'degraded';
    inventoryAlerts: number;
    delayedOrders: number;
    healthScore: number; // 0 - 100
    runtimeHealth: {
        latency: number;
        posConnected: boolean;
        lastSync: string;
    };
}

export interface OperationalAlert {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
    storeName?: string;
    type: 'pos_disconnect' | 'sync_fail' | 'payment_fail' | 'menu_publish_fail' | 'delay';
    status: 'active' | 'resolved' | 'acknowledged';
}

export interface HeatmapPoint {
    hour: string;
    day: string;
    salesVolume: number; // 0 to 10 scale for color intensity
}

export interface TopProduct {
    name: string;
    salesCount: number;
    revenue: number;
    modifierAttachment: Array<{ name: string; attachmentRate: number }>;
}

export interface ComboPerformance {
    comboName: string;
    attachmentRate: number;
    ordersCount: number;
    revenue: number;
}

export interface DashboardKpis {
    grossSales: number;
    netSales: number;
    orders: number;
    averageOrderValue: number;
    refunds: number;
    cancellations: number;
    liveCustomers: number;
    onlineRevenue: number;
    posRevenue: number;
    activeStores: number;
    delayedOrders: number;
    kitchenLoad: number; // 0 - 100
    deliverySuccessRate: number; // 0 - 100
}

export interface DashboardData {
    kpis: DashboardKpis;
    salesByChannel: SalesChannel[];
    recentOrders: RecentOrder[];
    stores: StoreInfo[];
    alerts: OperationalAlert[];
    heatmap: HeatmapPoint[];
    topProducts: TopProduct[];
    combos: ComboPerformance[];
}
