import React from 'react';
import { KpiCard } from './KpiCard';
import { formatCurrency } from '@/utils';
import {
    TrendingUp,
    Wallet,
    ShoppingBag,
    BarChart3,
    RotateCcw,
    Scale,
    Building2,
    Clock,
    Flame,
    Users,
    Percent,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import { DashboardKpis } from '../../types/dashboard';

interface KpiRowProps {
    data: DashboardKpis | null;
    isLoading?: boolean;
}

export const KpiRow: React.FC<KpiRowProps> = ({ data, isLoading = false }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
            <KpiCard
                label="Gross Revenue"
                value={data ? formatCurrency(data.grossSales) : '$0.00'}
                trend={{ percentage: 5.2, isPositive: true, timeframe: 'vs yesterday' }}
                icon={TrendingUp}
                iconColor="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20 border-blue-600/10"
                isLoading={isLoading}
                sparklineData={[15, 22, 18, 35, 42, 38, 55, 62]}
            />
            <KpiCard
                label="Net Revenue"
                value={data ? formatCurrency(data.netSales) : '$0.00'}
                trend={{ percentage: 4.8, isPositive: true, timeframe: 'vs yesterday' }}
                icon={Wallet}
                iconColor="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20 border-emerald-600/10"
                isLoading={isLoading}
                sparklineData={[12, 18, 15, 28, 36, 32, 48, 52]}
            />
            <KpiCard
                label="Order Volume"
                value={data ? data.orders.toString() : '0'}
                trend={{ percentage: 12.4, isPositive: true, timeframe: 'vs target' }}
                icon={ShoppingBag}
                iconColor="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20 border-indigo-600/10"
                isLoading={isLoading}
                sparklineData={[30, 45, 38, 62, 70, 68, 85, 95]}
            />
            <KpiCard
                label="Avg Ticket (AOV)"
                value={data ? formatCurrency(data.averageOrderValue) : '$0.00'}
                target="92% optimal"
                icon={BarChart3}
                iconColor="bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/20 border-purple-600/10"
                isLoading={isLoading}
                sparklineData={[25, 26, 26, 25, 27, 26, 27, 26]}
            />
            <KpiCard
                label="Active Kitchen Load"
                value={data ? `${data.kitchenLoad}%` : '0%'}
                trend={{ percentage: 8.2, isPositive: data ? data.kitchenLoad > 80 : false, timeframe: 'vs hourly prep cap' }}
                icon={Flame}
                iconColor={data && data.kitchenLoad > 80 
                    ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20 border-rose-600/10" 
                    : "bg-gradient-to-br from-orange-400 to-amber-500 shadow-amber-500/20 border-amber-600/10"
                }
                isLoading={isLoading}
                sparklineData={[40, 55, 62, 50, 70, 82, 85, 78]}
            />
            <KpiCard
                label="Delayed Orders"
                value={data ? data.delayedOrders.toString() : '0'}
                trend={{ percentage: 15.0, isPositive: false, timeframe: 'vs tolerance cap' }}
                icon={Clock}
                iconColor={data && data.delayedOrders > 0
                    ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20 border-rose-600/10 animate-pulse"
                    : "bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/20 border-slate-600/10"
                }
                isLoading={isLoading}
                sparklineData={[1, 2, 0, 4, 3, 5, 2, 0]}
            />
        </div>
    );
};
