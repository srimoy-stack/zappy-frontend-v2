import React from 'react';
import { KpiCard } from './KpiCard';
import { formatCurrency } from '@/utils';
import {
    TrendingUp,
    Wallet,
    ShoppingBag,
    BarChart3,
    RotateCcw,
    Scale
} from 'lucide-react';

interface KpiRowProps {
    data: {
        grossSales: number;
        netSales: number;
        orders: number;
        averageOrderValue: number;
        refunds: number;
        cashVariance: number;
    } | null;
    isLoading?: boolean;
}

export const KpiRow: React.FC<KpiRowProps> = ({ data, isLoading = false }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-l border-t border-slate-100">
            <KpiCard
                label="Gross Sales"
                value={data ? formatCurrency(data.grossSales) : '$0.00'}
                icon={TrendingUp}
                iconColor="bg-blue-500"
                isLoading={isLoading}
            />
            <KpiCard
                label="Net Sales"
                value={data ? formatCurrency(data.netSales) : '$0.00'}
                icon={Wallet}
                iconColor="bg-emerald-500"
                isLoading={isLoading}
            />
            <KpiCard
                label="Orders"
                value={data ? data.orders.toString() : '0'}
                icon={ShoppingBag}
                iconColor="bg-amber-500"
                isLoading={isLoading}
            />
            <KpiCard
                label="Avg Ticket"
                value={data ? formatCurrency(data.averageOrderValue) : '$0.00'}
                icon={BarChart3}
                iconColor="bg-purple-500"
                isLoading={isLoading}
            />
            <KpiCard
                label="Refunds"
                value={data ? formatCurrency(data.refunds) : '$0.00'}
                icon={RotateCcw}
                iconColor="bg-rose-500"
                isLoading={isLoading}
            />
            <KpiCard
                label="Cash Var"
                value={data ? formatCurrency(data.cashVariance) : '$0.00'}
                icon={Scale}
                iconColor="bg-slate-500"
                isLoading={isLoading}
            />
        </div>
    );
};
