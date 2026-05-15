/**
 * M9 Home Dashboard Types
 */

export interface KpiData {
    label: string;
    value: string;
    secondaryInfo?: string;
    isNegative?: boolean;
}

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
    channel: string;
    status: 'completed' | 'pending' | 'cancelled' | 'refunded';
    total: number;
}

export interface DashboardData {
    kpis: {
        grossSales: number;
        netSales: number;
        orders: number;
        averageOrderValue: number;
        refunds: number;
        cashVariance: number;
    };
    salesByChannel: SalesChannel[];
    recentOrders: RecentOrder[];
}
