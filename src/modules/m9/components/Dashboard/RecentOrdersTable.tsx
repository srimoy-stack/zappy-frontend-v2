import React from 'react';
import { formatCurrency, cn } from '@/utils';
import { RecentOrder } from '../../types/dashboard';
import { EmptyState } from '@/components/feedback';
import {
    Smartphone,
    Globe,
    Bike,
    CheckCircle2,
    Clock,
    XCircle,
    RefreshCcw as RefundIcon
} from 'lucide-react';

interface RecentOrdersTableProps {
    data: RecentOrder[];
    isLoading?: boolean;
    onOrderClick?: (orderId: string) => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
    data,
    isLoading = false,
    onOrderClick,
}) => {
    const getStatusStyles = (status: RecentOrder['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'cancelled':
                return 'bg-slate-50 text-slate-500 border-slate-100';
            case 'refunded':
                return 'bg-rose-50 text-rose-700 border-rose-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getStatusIcon = (status: RecentOrder['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-3 h-3" />;
            case 'pending': return <Clock className="w-3 h-3" />;
            case 'cancelled': return <XCircle className="w-3 h-3" />;
            case 'refunded': return <RefundIcon className="w-3 h-3" />;
        }
    };

    const getChannelIcon = (channel: string) => {
        switch (channel.toUpperCase()) {
            case 'POS': return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
            case 'ONLINE': return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
            case 'UBER': return <Bike className="w-3.5 h-3.5 text-rose-500" />;
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 p-4 animate-pulse">
                        <div className="h-4 bg-slate-50 rounded w-16"></div>
                        <div className="h-4 bg-slate-50 rounded w-20"></div>
                        <div className="h-4 bg-slate-50 rounded w-32"></div>
                        <div className="h-4 bg-slate-50 rounded w-16 ml-auto"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white">
                <EmptyState
                    title="No recent orders"
                    description="Recent orders will appear here"
                />
            </div>
        );
    }

    return (
        <div className="bg-white">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Time
                        </th>
                        <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Order ID
                        </th>
                        <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Customer
                        </th>
                        <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Channel
                        </th>
                        <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Status
                        </th>
                        <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Amount
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.slice(0, 5).map((order) => (
                        <tr
                            key={order.id}
                            onClick={() => onOrderClick?.(order.id)}
                            className={cn(
                                "group transition-colors",
                                onOrderClick && 'cursor-pointer hover:bg-slate-50/80'
                            )}
                        >
                            <td className="px-6 py-4 text-[11px] font-bold text-slate-400">
                                {order.time}
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-slate-900 tracking-tight">
                                {order.orderNumber}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs font-bold text-slate-600 truncate max-w-[120px] block">
                                    {order.customer}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {getChannelIcon(order.channel)}
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                        {order.channel}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className={cn(
                                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider',
                                    getStatusStyles(order.status)
                                )}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900 font-black text-right tracking-tight">
                                {formatCurrency(order.total)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
