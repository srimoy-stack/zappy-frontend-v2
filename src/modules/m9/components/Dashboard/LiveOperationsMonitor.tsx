import React from 'react';
import { 
    Clock, 
    Flame, 
    ChefHat, 
    Bike, 
    CheckSquare, 
    UtensilsCrossed, 
    AlertCircle,
    ShoppingBag,
    Smartphone,
    Globe
} from 'lucide-react';
import { RecentOrder } from '../../types/dashboard';
import { cn, formatCurrency } from '@/utils';

interface LiveOperationsMonitorProps {
    orders: RecentOrder[];
    kitchenLoad: number;
    isLoading: boolean;
}

export const LiveOperationsMonitor: React.FC<LiveOperationsMonitorProps> = ({
    orders,
    kitchenLoad,
    isLoading
}) => {
    // Filter active orders that are in prep, ready, or transit
    const activePrepOrders = orders.filter(
        o => o.status === 'prep' || o.status === 'pending' || o.status === 'ready' || o.status === 'transit'
    );

    const getStatusStyle = (status: RecentOrder['status']) => {
        switch (status) {
            case 'prep':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'ready':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'transit':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
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

    // Calculate queue sizes
    const prepCount = activePrepOrders.filter(o => o.status === 'prep' || o.status === 'pending').length;
    const readyCount = activePrepOrders.filter(o => o.status === 'ready').length;
    const transitCount = activePrepOrders.filter(o => o.status === 'transit').length;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* 1. Kitchen Load & Stream Status */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-orange-500" /> Kitchen Utilization
                        </h3>
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                            kitchenLoad > 80 
                                ? "bg-rose-50 text-rose-600 border border-rose-100" 
                                : kitchenLoad > 50 
                                ? "bg-amber-50 text-amber-600 border border-amber-100" 
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        )}>
                            {kitchenLoad > 80 ? 'Peak Load' : kitchenLoad > 50 ? 'Moderate' : 'Stable'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{kitchenLoad}%</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Active burner & prep-station load</p>
                            </div>
                            <ChefHat className="w-10 h-10 text-slate-100" strokeWidth={1.5} />
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    kitchenLoad > 80 ? "bg-gradient-to-r from-orange-500 to-rose-600" : kitchenLoad > 50 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"
                                )}
                                style={{ width: `${kitchenLoad}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-100 text-center">
                    <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cooking</span>
                        <span className="text-lg font-black text-slate-800 mt-1 block">{prepCount}</span>
                    </div>
                    <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ready</span>
                        <span className="text-lg font-black text-emerald-600 mt-1 block">{readyCount}</span>
                    </div>
                    <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dispatch</span>
                        <span className="text-lg font-black text-blue-600 mt-1 block">{transitCount}</span>
                    </div>
                </div>
            </div>

            {/* 2. Kitchen Prep Queue Stream */}
            <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <UtensilsCrossed className="w-4 h-4 text-indigo-500" /> Active Order tickets
                        </h3>
                        <div className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider">
                            Realtime Stream
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : activePrepOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <CheckSquare className="w-10 h-10 text-slate-200 mb-2" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prep Queue Empty</p>
                            <p className="text-[10px] text-slate-400/80 font-medium">All orders completed and dispatched</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                            {activePrepOrders.slice(0, 4).map((order) => {
                                const prepRemaining = order.prepTimeRemaining ?? 10;
                                const isDelayed = prepRemaining <= 3 && order.status === 'prep';
                                
                                return (
                                    <div 
                                        key={order.id} 
                                        className={cn(
                                            "p-4.5 rounded-2xl border transition-all hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4",
                                            isDelayed ? "border-rose-100 bg-rose-50/10 hover:bg-rose-50/20" : "border-slate-100"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                                                {getChannelIcon(order.channel)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-800">{order.orderNumber}</span>
                                                    <span className="text-[9px] font-semibold text-slate-400">{order.time}</span>
                                                    <span className="mx-1.5 w-1 h-1 bg-slate-200 rounded-full" />
                                                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[100px]">{order.customer}</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 flex flex-wrap gap-1">
                                                    {order.items?.map((item, idx) => (
                                                        <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                                                            {item.qty}x {item.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4.5 shrink-0 self-end md:self-auto">
                                            <div className="text-right">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                                    getStatusStyle(order.status)
                                                )}>
                                                    {order.status}
                                                </span>
                                                <p className="text-xs font-black text-slate-900 mt-1">{formatCurrency(order.total)}</p>
                                            </div>

                                            {/* Timer countdown progress bar */}
                                            {order.status === 'prep' && (
                                                <div className="w-24 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-[10px] font-black text-slate-600">
                                                        <Clock className={cn("w-3.5 h-3.5", isDelayed ? "text-rose-500 animate-pulse" : "text-slate-400")} />
                                                        <span className={isDelayed ? "text-rose-600 animate-pulse" : ""}>{prepRemaining}m left</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                                        <div 
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                isDelayed ? "bg-rose-500" : "bg-indigo-500"
                                                            )}
                                                            style={{ width: `${Math.max(10, (prepRemaining / 15) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="text-[10px] font-bold text-slate-400 mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-300" /> Auto-updates every 10s via active POS websocket</span>
                    <span className="text-slate-500 uppercase tracking-widest font-black">Total Queue: {activePrepOrders.length} active orders</span>
                </div>
            </div>
        </div>
    );
};
