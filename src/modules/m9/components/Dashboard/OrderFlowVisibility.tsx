import React, { useState } from 'react';
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    RefreshCcw, 
    Smartphone, 
    Globe, 
    Bike, 
    ShoppingBag, 
    ChevronRight, 
    X, 
    Activity, 
    ShieldCheck, 
    AlertCircle,
    User,
    ArrowUpRight
} from 'lucide-react';
import { RecentOrder } from '../../types/dashboard';
import { cn, formatCurrency } from '@/utils';

interface OrderFlowVisibilityProps {
    orders: RecentOrder[];
    onRetryOrderSync: (orderId: string) => void;
    isLoading: boolean;
}

export const OrderFlowVisibility: React.FC<OrderFlowVisibilityProps> = ({
    orders,
    onRetryOrderSync,
    isLoading
}) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'delayed' | 'cancelled' | 'high_value' | 'failed_payment'>('all');
    const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);

    const getStatusStyles = (status: RecentOrder['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'pending':
            case 'prep':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'ready':
                return 'bg-teal-50 text-teal-700 border-teal-100';
            case 'cancelled':
                return 'bg-slate-50 text-slate-500 border-slate-100';
            case 'refunded':
                return 'bg-rose-50 text-rose-700 border-rose-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getChannelIcon = (channel: string) => {
        switch (channel.toUpperCase()) {
            case 'POS': 
                return <Smartphone className="w-3.5 h-3.5 text-indigo-500" />;
            case 'ONLINE': 
                return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
            case 'UBER': 
            case 'ZOMATO':
            case 'SWIGGY':
                return <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />;
            default: 
                return <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />;
        }
    };

    const getSyncBadge = (status?: RecentOrder['syncStatus']) => {
        switch (status) {
            case 'synced':
                return <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">Synced</span>;
            case 'failed':
                return <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase">Sync Fail</span>;
            default:
                return <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 uppercase">Pending</span>;
        }
    };

    // Filter logic
    const filteredOrders = orders.filter((order) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'delayed') return order.prepTimeRemaining !== undefined && order.prepTimeRemaining <= 3 && order.status === 'prep';
        if (activeFilter === 'cancelled') return order.status === 'cancelled';
        if (activeFilter === 'high_value') return order.total >= 50.00;
        if (activeFilter === 'failed_payment') return order.syncStatus === 'failed';
        return true;
    });

    return (
        <div className="space-y-4 relative">
            {/* Navigation & Tab Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" /> Realtime Transaction Stream
                </h2>

                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={cn(
                            "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                            activeFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        All Transactions
                    </button>
                    <button
                        onClick={() => setActiveFilter('delayed')}
                        className={cn(
                            "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                            activeFilter === 'delayed' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Delayed
                    </button>
                    <button
                        onClick={() => setActiveFilter('cancelled')}
                        className={cn(
                            "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                            activeFilter === 'cancelled' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Cancelled
                    </button>
                    <button
                        onClick={() => setActiveFilter('high_value')}
                        className={cn(
                            "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                            activeFilter === 'high_value' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        High Value
                    </button>
                    <button
                        onClick={() => setActiveFilter('failed_payment')}
                        className={cn(
                            "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                            activeFilter === 'failed_payment' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Sync Failures
                    </button>
                </div>
            </div>

            {/* Table layout */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Channel</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">POS Sync</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            [1, 2, 3].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={7} className="px-6 py-5"><div className="h-4 bg-slate-50 rounded w-full" /></td>
                                </tr>
                            ))
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No orders in stream matching filters</p>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr 
                                    key={order.id} 
                                    onClick={() => setSelectedOrder(order)}
                                    className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                                >
                                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                        {order.time}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-xs font-black text-slate-900 tracking-tight">
                                            {order.orderNumber}
                                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity duration-300" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600 block max-w-[120px] truncate">
                                            {order.customer}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {getChannelIcon(order.channel)}
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{order.channel}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider",
                                            getStatusStyles(order.status)
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-slate-900 tracking-tight">
                                        {formatCurrency(order.total)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getSyncBadge(order.syncStatus)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* SLIDE OVER DETAIL DRAWER */}
            {selectedOrder && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" 
                        onClick={() => setSelectedOrder(null)} 
                    />
                    {/* Slide-over panel */}
                    <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-slate-900">{selectedOrder.orderNumber} Details</h3>
                                    {getSyncBadge(selectedOrder.syncStatus)}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Fulfillment outlet: {selectedOrder.storeName || 'Main Outlet'}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-slate-150 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 p-6 space-y-6">
                            {/* General details */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-4.5 rounded-2xl border border-slate-100/50">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Timestamp</span>
                                    <span className="text-xs font-bold text-slate-800">{selectedOrder.time}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Fulfillment</span>
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">{selectedOrder.channel} Delivery</span>
                                </div>
                            </div>

                            {/* Itemized summary */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
                                    Itemized list
                                </h4>
                                <div className="space-y-3.5">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start gap-4">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-black text-indigo-600">{item.qty}x</span>
                                                    <span className="text-xs font-black text-slate-800">{item.name}</span>
                                                </div>
                                                {item.modifiers && item.modifiers.length > 0 && (
                                                    <div className="text-[9px] font-semibold text-slate-400 mt-1 pl-5">
                                                        {item.modifiers.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{formatCurrency(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900 tracking-tight">
                                    <span>Total Ticket</span>
                                    <span>{formatCurrency(selectedOrder.total)}</span>
                                </div>
                            </div>

                            {/* Customer profile card */}
                            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100/50 space-y-3">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Customer Details
                                </h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xs">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-slate-800">{selectedOrder.customer}</span>
                                        <span className="text-[9px] font-semibold text-slate-400 block uppercase">Loyalty tier: Registered Guest</span>
                                    </div>
                                </div>
                            </div>

                            {/* POS Integration logs */}
                            <div className="space-y-3.5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
                                    POS Sync Audit trail
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-600 shrink-0">1</div>
                                            <div className="w-0.5 h-6 bg-slate-200" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">Order Created</span>
                                            <span className="text-[9px] font-bold text-slate-400 block">Gateway verified payment successfully</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border",
                                                selectedOrder.syncStatus === 'failed'
                                                    ? "bg-rose-50 border-rose-200 text-rose-600"
                                                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                                            )}>2</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">POS Server Sync</span>
                                            <span className="text-[9px] font-bold text-slate-400 block">
                                                {selectedOrder.syncStatus === 'failed' 
                                                    ? `Failed: ${selectedOrder.failReason || 'Timeout connecting to local terminal'}`
                                                    : 'Successfully mapped order payload into POS SQLite instance'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Actions */}
                        {selectedOrder.syncStatus === 'failed' && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                                <button 
                                    onClick={() => {
                                        onRetryOrderSync(selectedOrder.id);
                                        setSelectedOrder(null);
                                    }}
                                    className="w-full py-3 text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <RefreshCcw className="w-3.5 h-3.5" />
                                    Retry POS Payload Sync
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
