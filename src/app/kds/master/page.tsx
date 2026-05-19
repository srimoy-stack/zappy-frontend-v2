'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { KDSHeader } from '@/modules/kds/components/KDSHeader';
import { KDSFooter } from '@/modules/kds/components/KDSFooter';
import { KDSSidebar } from '@/modules/kds/components/KDSSidebar';
import { useKDSStore } from '@/modules/kds/store/kdsStore';
import { useFilterStore } from '@/modules/kds/store/useFilterStore';

import { AlertCircle } from 'lucide-react';
import { OrderTicket } from '@/modules/kds/components/ticket/OrderTicket';
import { isOrderVisibleOnStation } from '@/modules/kds/utils/routingUtils';

import { ProductionSummary } from '@/modules/kds/components/board/ProductionSummary';
import { RoutingConfig } from '@/modules/kds/components/board/RoutingConfig';
import { SoundConfig } from '@/modules/kds/components/sound/SoundConfig';
import { OrderDetailModal } from '@/modules/kds/components/modals/OrderDetailModal';
import { useKDSActionAuth } from '@/modules/kds/hooks/useKDSActionAuth';
import { KDSPermissionGuard } from '@/modules/kds/components/security/KDSPermissionGuard';

export default function KDSMasterPage() {
    const { autoInitNetworkListener, cleanupFulfilledOrders } = useKDSStore();


    const ordersMap = useKDSStore((state) => state.orders);
    const fulfilledOrders = useKDSStore((state) => state.fulfilledOrders);
    const recallFulfilledOrder = useKDSStore((state) => state.recallFulfilledOrder);

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { requireAuth, AuthModalElement } = useKDSActionAuth();

    const handleRecall = (id: string) => {
        requireAuth('Recall Order', () => recallFulfilledOrder(id));
    };

    const {
        viewMode,
        fulfillment: fulfillmentFilter,
        source: sourceFilter,
        stage: stageFilter,
        showRecentlyFulfilled,
        currentPage,
        setCurrentPage
    } = useFilterStore();

    const {
        enable_station_routing,
        selectedStationId,
        kds_stations,
        category_station_map,
        allow_item_station_override,
        item_station_map,
        master_screen_view_mode
    } = useKDSStore();

    // Apply Global Filters
    const filteredOrders = useMemo(() => {
        const config = {
            enable_station_routing,
            selectedStationId,
            kds_stations,
            allow_item_station_override,
            item_station_map,
            master_screen_view_mode
        };

        const applyGlobalFilters = (order: any) => {
            const matchesFulfillment = fulfillmentFilter === 'ALL' || order.fulfillment_type === fulfillmentFilter;
            const matchesSource = sourceFilter === 'ALL' || order.order_source === sourceFilter;

            let matchesStage = true;
            if (stageFilter === 'DELAYED') {
                matchesStage = order.isDelayed;
            } else if (stageFilter !== 'ALL' && stageFilter !== 'COMPLETED') {
                matchesStage = order.stage === stageFilter;
            } else if (stageFilter === 'COMPLETED') {
                // Technically fulfilledOrders are already completed, but we check just in case
                matchesStage = order.stage === 'COMPLETED';
            }

            return matchesFulfillment && matchesSource && matchesStage;
        };

        // Completed orders live in a separate array
        if (stageFilter === 'COMPLETED') {
            return fulfilledOrders.filter(o =>
                applyGlobalFilters(o) && isOrderVisibleOnStation(o, config)
            ) as typeof fulfilledOrders;
        }

        return Object.values(ordersMap).filter(order => {
            if (!applyGlobalFilters(order)) return false;

            // Station Filtering Logic 
            return isOrderVisibleOnStation(order, config);
        });
    }, [ordersMap, fulfilledOrders, fulfillmentFilter, sourceFilter, stageFilter, enable_station_routing, selectedStationId, kds_stations, category_station_map, allow_item_station_override, item_station_map, master_screen_view_mode]);

    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const [totalPages, setTotalPages] = useState(1);
    const layoutInfo = useMemo(() => {
        if (containerWidth === 0 || containerHeight === 0) {
            return { cols: 1, rows: 1, itemsPerPage: 1 };
        }

        const gap = 24;
        const padding = 48;
        const targetTicketWidth = viewMode === 'KANBAN' ? 340 :
            viewMode === 'GRID' ? 420 : 240;
        const minTicketHeight = viewMode === 'COMPACT' ? 260 : 460;

        const cols = Math.max(1, Math.floor((containerWidth - padding) / (targetTicketWidth + gap)));
        const rows = viewMode === 'KANBAN' ? 1 :
            viewMode === 'GRID' ? 2 :
                Math.max(1, Math.floor((containerHeight - padding) / (minTicketHeight + gap)));

        return { cols, rows, itemsPerPage: cols * rows };
    }, [viewMode, containerWidth, containerHeight, filteredOrders.length]);

    // Update total pages when layout or orders change
    useEffect(() => {
        setTotalPages(Math.max(1, Math.ceil(filteredOrders.length / layoutInfo.itemsPerPage)));
    }, [filteredOrders.length, layoutInfo.itemsPerPage]);

    const updatePageInfo = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setContainerWidth(el.clientWidth);
        setContainerHeight(el.clientHeight);
    }, []);

    // Sync page number when user manually scrolls (touch swipe)
    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el || containerWidth === 0) return;
        const page = Math.round(el.scrollLeft / containerWidth);
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    }, [currentPage, containerWidth, setCurrentPage]);

    useEffect(() => {
        autoInitNetworkListener();
        const interval = setInterval(() => cleanupFulfilledOrders(), 60000);
        return () => clearInterval(interval);
    }, [autoInitNetworkListener, cleanupFulfilledOrders]);

    // Update page info when filtered orders change
    useEffect(() => {
        // Small delay to let DOM update first
        const t = setTimeout(() => updatePageInfo(), 50);
        return () => clearTimeout(t);
    }, [filteredOrders, updatePageInfo]);

    // Observe resize changes
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(() => updatePageInfo());
        observer.observe(el);
        return () => observer.disconnect();
    }, [updatePageInfo]);

    // Scroll to page when currentPage changes via footer buttons
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const containerWidth = el.clientWidth;
        el.scrollTo({ left: currentPage * containerWidth, behavior: 'smooth' });
    }, [currentPage]);

    // Apply Station Default View Layout on mount
    const setViewMode = useFilterStore(state => state.setViewMode);
    const kdsStations = useKDSStore(state => state.kds_stations);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (selectedStationId && selectedStationId !== 'ALL') {
            const station = kdsStations.find(s => s.station_id === selectedStationId);
            if (station?.default_view_mode) {
                // Delay slightly to ensure store is hydrated and ready
                timer = setTimeout(() => {
                    setViewMode(station.default_view_mode as any);
                }, 100);
            }
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [selectedStationId, kdsStations, setViewMode]);

    // Bootstrap service now handles initial data seeding.


    const selectedOrder = selectedOrderId ? ordersMap[selectedOrderId] : null;

    const boardPages = useMemo(() => {
        if (!['KANBAN', 'GRID', 'COMPACT'].includes(viewMode) || containerWidth === 0 || containerHeight === 0) return [];

        const { itemsPerPage } = layoutInfo;
        const pages = [];
        for (let i = 0; i < filteredOrders.length; i += itemsPerPage) {
            pages.push(filteredOrders.slice(i, i + itemsPerPage));
        }
        return pages;
    }, [filteredOrders, viewMode, containerWidth, containerHeight, layoutInfo]);

    return (
        <div className="flex flex-col h-screen overflow-hidden kds-root bg-[#F3F4F6]">
            <KDSSidebar />

            {/* Conditional Header */}
            {['KANBAN', 'GRID', 'COMPACT'].includes(viewMode) && <KDSHeader />}

            <main className="flex-1 overflow-hidden relative flex flex-col">
                <div className="flex-1 overflow-hidden relative">
                    <div className="flex flex-col h-full">
                        {viewMode === 'SUMMARY' || viewMode === 'ALL_DAY' ? (
                            <ProductionSummary />
                        ) : viewMode === 'ROUTING' ? (
                            <RoutingConfig />
                        ) : viewMode === 'SOUND_SETTINGS' ? (
                            <SoundConfig />
                        ) : (
                            <>
                                {['KANBAN', 'GRID', 'COMPACT'].includes(viewMode) ? (
                                    /* PAGED BOARD VIEW: Continuous horizontal row of tickets */
                                    <div
                                        ref={scrollContainerRef}
                                        onScroll={handleScroll}
                                        className="flex-1 h-full overflow-x-auto overflow-y-hidden flex scroll-smooth snap-x snap-mandatory custom-scrollbar"
                                    >
                                        <div className="flex h-full min-w-full">
                                            {boardPages.map((page, pageIdx) => (
                                                <div
                                                    key={pageIdx}
                                                    className="w-full h-full shrink-0 p-6 snap-start overscroll-contain"
                                                >
                                                    <div
                                                        className="grid gap-6 h-full items-start"
                                                        style={{
                                                            gridTemplateColumns: `repeat(${layoutInfo.cols}, minmax(0, 1fr))`,
                                                            gridTemplateRows: `repeat(${layoutInfo.rows}, minmax(200px, 1fr))`,
                                                            gridAutoFlow: 'column'
                                                        }}
                                                    >
                                                        {page.map(order => (
                                                            <div key={order.id} className="h-full min-h-0">
                                                                <OrderTicket
                                                                    orderId={order.id}
                                                                    onViewDetail={setSelectedOrderId}
                                                                    compact={viewMode === 'COMPACT'}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {filteredOrders.length === 0 && (Object.keys(ordersMap).length > 0 || stageFilter === 'COMPLETED') && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                                        <AlertCircle size={48} className="mb-4 text-gray-400" />
                                        <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm">No orders match current filters</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {['KANBAN', 'GRID', 'COMPACT'].includes(viewMode) && !Object.keys(ordersMap).length && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-gray-300 font-black uppercase tracking-[0.4em] text-lg">Waiting for orders</span>
                        </div>
                    )}
                </div>

                {/* RECENTLY COMPLETED STRIP */}
                {['KANBAN', 'GRID', 'COMPACT'].includes(viewMode) && fulfilledOrders.length > 0 && showRecentlyFulfilled && (
                    <div className="h-[74px] bg-white border-t border-gray-200 flex items-center px-6 gap-6 overflow-x-auto scrollbar-hide shrink-0 animate-in slide-in-from-bottom duration-300 transition-all">
                        <div className="flex items-center gap-2 pr-4 border-r border-gray-100 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recently Completed</span>
                        </div>
                        <div className="flex gap-4">
                            {fulfilledOrders.slice().reverse().slice(0, 10).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center gap-3 bg-gray-50 border border-gray-200 pl-3 pr-1.5 py-1.5 rounded-lg hover:border-gray-300 transition-all shrink-0 group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-gray-900 leading-tight">#{order.orderNumber}</span>
                                        <span className="text-[9px] font-bold text-gray-400">
                                            {formatTimeOnly(order.updatedAt)}
                                        </span>
                                    </div>
                                    <KDSPermissionGuard permission="KDS_RECALL">
                                        <button
                                            onClick={() => handleRecall(order.id)}
                                            className="p-2 hover:bg-black hover:text-white rounded-md transition-all text-gray-400"
                                            title="Recall Order"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                        </button>
                                    </KDSPermissionGuard>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            {['KANBAN', 'GRID', 'COMPACT', 'SUMMARY', 'ALL_DAY'].includes(viewMode) && <KDSFooter totalPages={totalPages} />}

            {/* Global Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={!!selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}
            {AuthModalElement}
        </div>
    );
}

function formatTimeOnly(dateIso: string) {
    return new Date(dateIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
