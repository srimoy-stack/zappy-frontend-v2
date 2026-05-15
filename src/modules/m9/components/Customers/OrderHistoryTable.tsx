import React from 'react';
import { CustomerOrder } from '../../types/customers';
import { Calendar, MapPin, ShoppingBag, RotateCcw, Clock } from 'lucide-react';

interface OrderHistoryTableProps {
    orders: CustomerOrder[];
    onReorder: (order: CustomerOrder) => void;
}

export const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ orders, onReorder }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getChannelBadge = (channel: string) => {
        const badges = {
            'POS': 'bg-blue-100 text-blue-700 border-blue-200',
            'ONLINE': 'bg-purple-100 text-purple-700 border-purple-200',
            'UBER': 'bg-green-100 text-green-700 border-green-200',
            'APP': 'bg-orange-100 text-orange-700 border-orange-200'
        };
        return badges[channel as keyof typeof badges] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            Date & Order ID
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            Store
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            Channel
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            Items
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">
                            Total
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                No order history available
                            </td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr
                                key={order.id}
                                className="hover:bg-slate-50/50 transition-colors"
                            >
                                {/* Date & Order ID */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {formatDate(order.date)}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium ml-5">
                                            #{order.id}
                                        </div>
                                    </div>
                                </td>

                                {/* Store */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {order.storeName}
                                    </div>
                                </td>

                                {/* Channel */}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getChannelBadge(order.channel)}`}>
                                        <ShoppingBag className="w-3 h-3" />
                                        {order.channel}
                                    </span>
                                </td>

                                {/* Items */}
                                <td className="px-6 py-4">
                                    <p className="text-sm text-slate-700 max-w-md truncate" title={order.itemsSummary}>
                                        {order.itemsSummary}
                                    </p>
                                </td>

                                {/* Total */}
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-bold text-slate-900">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-center">
                                    {order.isReorderable ? (
                                        <button
                                            onClick={() => onReorder(order)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Reorder Last
                                        </button>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold cursor-not-allowed">
                                            <Clock className="w-3.5 h-3.5" />
                                            Historical
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
