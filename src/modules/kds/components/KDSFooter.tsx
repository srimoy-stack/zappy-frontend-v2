'use client';

import React, { useMemo } from 'react';
import { useKDSStore } from '../store/kdsStore';
import { useFilterStore } from '../store/useFilterStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KDSOrder } from '../types/kds';

interface KDSFooterProps {
    totalPages?: number;
}

export const KDSFooter: React.FC<KDSFooterProps> = ({ totalPages = 1 }) => {
    const ordersMap = useKDSStore((state) => state.orders);
    const fulfilledOrders = useKDSStore((state) => state.fulfilledOrders);

    const { stage: currentStage, setStage, currentPage, setCurrentPage } = useFilterStore();
    const counts = useMemo(() => {
        const allOrders = Object.values(ordersMap);
        return {
            all: allOrders.length,
            queue: allOrders.filter((o: KDSOrder) => o.stage === 'NEW').length,
            preparing: allOrders.filter((o: KDSOrder) => o.stage === 'PREPARING').length,
            packing: allOrders.filter((o: KDSOrder) => o.stage === 'READY').length,
            delayed: allOrders.filter((o: KDSOrder) => o.isDelayed).length,
            completed: fulfilledOrders.length
        };
    }, [ordersMap, fulfilledOrders]);

    const FilterItem = ({ label, count, id, active }: { label: string, count: number, id: any, active: boolean }) => (
        <button
            onClick={() => setStage(id)}
            className={`flex items-center h-full px-4 border-b-4 transition-all active:scale-95 ${active ? 'border-black bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
        >
            <span className={`text-[11px] font-black flex items-center gap-2 uppercase tracking-tight ${active ? 'text-black' : 'text-gray-400'}`}>
                {label} <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>{count}</span>
            </span>
        </button>
    );

    const canGoPrev = currentPage > 0;
    const canGoNext = currentPage < totalPages - 1;

    return (
        <footer className="h-[74px] bg-white border-t border-gray-200 flex items-center justify-between px-8 shrink-0 z-50 select-none">
            {/* LEFT: Branding/Info */}
            <div className="w-1/4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">KDS Cluster</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">V2.4.0 • Live Transmission</span>
                </div>
            </div>

            {/* CENTER: Stage Filters */}
            <div className="flex items-center h-full gap-2">
                <FilterItem label="All" count={counts.all} id="ALL" active={currentStage === 'ALL'} />
                <FilterItem label="Queue" count={counts.queue} id="NEW" active={currentStage === 'NEW'} />
                <FilterItem label="Preparing" count={counts.preparing} id="PREPARING" active={currentStage === 'PREPARING'} />
                <FilterItem label="Packing" count={counts.packing} id="READY" active={currentStage === 'READY'} />
                <FilterItem label="Delayed" count={counts.delayed} id="DELAYED" active={currentStage === 'DELAYED'} />
                <FilterItem label="Done" count={counts.completed} id="COMPLETED" active={currentStage === 'COMPLETED'} />
            </div>

            {/* RIGHT: Pagination */}
            <div className="flex items-center justify-end gap-3 w-1/4">
                {totalPages > 1 ? (
                    <div className="flex items-center bg-gray-100 border border-gray-200 rounded-2xl p-1 shadow-inner">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={!canGoPrev}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${canGoPrev ? 'bg-white text-gray-900 shadow-sm active:scale-90' : 'text-gray-300 opacity-50 cursor-not-allowed'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-6 flex items-center">
                            <span className="text-sm font-black text-gray-900 tabular-nums">
                                {currentPage + 1} <span className="text-gray-400 mx-1">/</span> {totalPages}
                            </span>
                        </div>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={!canGoNext}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${canGoNext ? 'bg-white text-gray-900 shadow-sm active:scale-90' : 'text-gray-300 opacity-50 cursor-not-allowed'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="h-12 flex items-center px-4 bg-gray-50 border border-gray-100 rounded-2xl">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Single Page Mode</span>
                    </div>
                )}
            </div>
        </footer>
    );
};
