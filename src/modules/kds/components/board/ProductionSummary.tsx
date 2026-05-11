'use client';

import React, { useMemo } from 'react';
import { useKDSStore } from '../../store/kdsStore';
import { useFilterStore } from '../../store/useFilterStore';
import { ChefHat, Package, ChevronLeft, Menu } from 'lucide-react';
import { isItemVisibleOnStation } from '../../utils/routingUtils';

interface ProductionSummaryProps {
    compact?: boolean;
}

export const ProductionSummary: React.FC<ProductionSummaryProps> = ({ compact }) => {
    const ordersMap = useKDSStore((state) => state.orders);

    const {
        enable_station_routing,
        selectedStationId,
        kds_stations,
        category_station_map,
        item_station_map,
        allow_item_station_override,
        master_screen_view_mode,
        fulfilledOrders
    } = useKDSStore();

    const { fulfillment: fulfillmentFilter, source: sourceFilter } = useFilterStore();

    const orders = useMemo(() => Object.values(ordersMap), [ordersMap]);

    const summaryData = useMemo(() => {
        const aggregation: Record<string, { quantity: number, name: string, variant?: string }> = {};
        const allOrders = compact ? orders : [...orders, ...fulfilledOrders];

        // Apply global type/source filters to the summary as well
        const filteredRelevantOrders = allOrders.filter(order => {
            const matchesFulfillment = fulfillmentFilter === 'ALL' || order.fulfillment_type === fulfillmentFilter;
            const matchesSource = sourceFilter === 'ALL' || order.order_source === sourceFilter;
            return matchesFulfillment && matchesSource;
        });

        filteredRelevantOrders.forEach((order) => {
            if (compact && order.stage === 'COMPLETED') return;
            order.items.forEach((item) => {
                if (compact && item.isCompleted) return;

                const isVisible = isItemVisibleOnStation(item, {
                    enable_station_routing,
                    selectedStationId,
                    kds_stations,
                    item_station_map,
                    allow_item_station_override,
                    master_screen_view_mode
                });

                if (!isVisible) return;

                const key = `${item.name}-${item.variant || ''}`;
                if (!aggregation[key]) {
                    aggregation[key] = {
                        quantity: 0,
                        name: item.name,
                        variant: item.variant
                    };
                }
                aggregation[key].quantity += (item.quantity || 1);
            });
        });

        return Object.values(aggregation).sort((a, b) => b.quantity - a.quantity);
    }, [orders, fulfilledOrders, fulfillmentFilter, sourceFilter, enable_station_routing, selectedStationId, kds_stations, category_station_map, item_station_map, allow_item_station_override, master_screen_view_mode, compact]);

    const totalItems = summaryData.reduce((sum, item) => sum + item.quantity, 0);

    if (compact) {
        const loadPercentage = Math.min(100, (totalItems / 40) * 100);
        const loadColor = loadPercentage > 80 ? 'bg-red-500' : loadPercentage > 50 ? 'bg-amber-500' : 'bg-[#27ae60]';

        return (
            <div className="h-full w-full flex items-center bg-white/50 px-4 gap-4 overflow-hidden border-b border-black/5">
                <div className="shrink-0 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22] border border-[#E67E22]/20">
                            <ChefHat size={14} />
                        </div>
                        <div>
                            <h2 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider leading-none">Dashboard</h2>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${loadColor} transition-all duration-1000`}
                                        style={{ width: `${loadPercentage}%` }}
                                    />
                                </div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase">{Math.round(loadPercentage)}% Load</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
                    <div className="flex gap-2 h-full items-center py-2">
                        {summaryData.length === 0 ? (
                            <div className="flex items-center text-gray-400 font-bold uppercase text-[9px] tracking-widest px-4">
                                No Prep Required
                            </div>
                        ) : (
                            summaryData.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="shrink-0 bg-white border border-gray-200 rounded-xl flex items-center gap-3 px-3 py-2 hover:border-[#E67E22]/40 transition-colors group shadow-sm"
                                >
                                    <div className="min-w-0">
                                        <h3 className="text-[10px] font-bold text-gray-900 uppercase truncate max-w-[200px] group-hover:text-[#E67E22] transition-colors">{item.name}</h3>
                                        {item.variant && <span className="text-[7px] text-gray-500 font-bold uppercase block">{item.variant}</span>}
                                    </div>
                                    <div className="bg-gray-50 text-[#E67E22] w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold border border-gray-200 shrink-0">
                                        {item.quantity}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="shrink-0 flex flex-col items-end">
                    <span className="text-[11px] font-bold text-gray-900">{totalItems} <span className="text-gray-400">ITEMS</span></span>
                    <span className="text-[11px] font-bold text-blue-500">{summaryData.length} <span className="text-gray-400">SKUs</span></span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#F3F4F6] p-8 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => useFilterStore.getState().setViewMode('KANBAN')}
                        className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft size={24} className="text-gray-900" />
                    </button>
                    <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center text-[#E67E22] border border-gray-200 shadow-xl">
                        <ChefHat size={32} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">All-Day View</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mt-1">Real-time All-Day Aggregation</p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="bg-white border border-gray-200 px-8 py-4 rounded-3xl flex flex-col items-center min-w-[160px] shadow-sm">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Items</span>
                        <span className="text-3xl font-black text-gray-900">{totalItems}</span>
                    </div>
                    <div className="bg-white border border-gray-200 px-8 py-4 rounded-3xl flex flex-col items-center min-w-[160px] shadow-sm">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Unique SKUs</span>
                        <span className="text-3xl font-black text-blue-500">{summaryData.length}</span>
                    </div>
                    <button
                        onClick={() => useFilterStore.getState().setIsSidebarOpen(true)}
                        className="p-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg ml-2"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar snap-x snap-mandatory">
                <div
                    className="grid h-full gap-6 min-h-0"
                    style={{
                        gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                        gridAutoFlow: 'column',
                        gridAutoColumns: 'minmax(380px, 1fr)'
                    }}
                >
                    {summaryData.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center py-40 opacity-20 col-span-full">
                            <Package size={80} className="mb-4 text-gray-400" />
                            <p className="text-2xl font-bold uppercase tracking-[0.5em] text-gray-400">No Pending Items</p>
                        </div>
                    ) : (
                        summaryData.map((item, idx) => (
                            <div
                                key={idx}
                                className="group bg-white border border-gray-200 hover:border-[#E67E22]/30 p-6 rounded-[1.5rem] flex items-center justify-between transition-all shadow-sm hover:bg-gray-50 min-w-[380px] snap-start"
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-[#E74C3C] animate-pulse' : 'bg-[#E67E22]'}`} />
                                        <h3 className="text-xl font-bold text-gray-900 uppercase truncate tracking-tight group-hover:text-[#E67E22] transition-colors">
                                            {item.name}
                                        </h3>
                                    </div>
                                    {item.variant && (
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                                            {item.variant}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-none flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Qty</span>
                                    <div className="bg-gray-50 text-[#E67E22] w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                                        {item.quantity}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-[#27ae60] animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-[#27ae60] animate-pulse delay-75" />
                    <div className="w-1 h-1 rounded-full bg-[#27ae60] animate-pulse delay-150" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">Live Feed Active</span>
            </div>
        </div>
    );
};
