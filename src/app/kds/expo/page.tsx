'use client';

import { useState, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { Inbox, AlertTriangle } from 'lucide-react';
import { KDSHeader } from '@/modules/kds/components/KDSHeader';
import { ExpoCard } from '@/modules/kds/components/expo/ExpoCard';
import { useKDSStore } from '@/modules/kds/store/kdsStore';
import { useFilterStore } from '@/modules/kds/store/useFilterStore';
import { FulfillmentType } from '@/modules/kds/types/kds';
import { emitEvent } from '@/modules/kds/services/kdsEventDispatcher';
import { getSLAState } from '@/modules/kds/utils/slaUtils';
import { useKDSActionAuth } from '@/modules/kds/hooks/useKDSActionAuth';



// ─────────────────────────────────────────────────────────────────────────────
//  KDS Expo Page — Read-only display of READY orders
//  - Large display optimised for expo / handoff station
//  - Sorted by ready time (earliest first → most urgent on top-left)
//  - Overdue orders highlighted with red border + animated header
//  - Actions: Handed Over (removes order), Print Receipt (placeholder)
//  - No editing allowed
// ─────────────────────────────────────────────────────────────────────────────

export default function KDSExpoPage() {
    const { fulfillment: filter, setFulfillment: setFilter } = useFilterStore();
    const { removeOrder } = useKDSStore();
    const { requireAuth, AuthModalElement } = useKDSActionAuth();

    const [handingOverId, setHandingOverId] = useState<string | null>(null);

    // Initial data seeded by bootstrap service.


    // ── Subscribe: READY only, sorted by createdAt (earliest = most urgent) ───
    const orders = useKDSStore(useShallow(state =>
        Object.values(state.orders)
            .filter(o =>
                o.stage === 'READY' &&
                (filter === 'ALL' || o.fulfillment_type === filter)
            )
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    ));

    // ── Derived counts for the header bar ────────────────────────────────────
    const overdueCount = useMemo(
        () => orders.filter(o => getSLAState(o.createdAt, o.prepTimeMinutes) === 'OVERDUE').length,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [orders.map(o => o.id).join(',')]
    );

    // ── Hand Over ─────────────────────────────────────────────────────────────
    const handleHandOver = async (orderId: string) => {
        requireAuth('Complete Order', async () => {
            if (handingOverId) return; // prevent double-tap
            setHandingOverId(orderId);

            // Emit domain event
            emitEvent('order.handed_over', { orderId }, { idempotencyKey: `handover-${orderId}` });

            // Visual confirmation delay, then remove from board
            await new Promise(r => setTimeout(r, 600));
            removeOrder(orderId);
            setHandingOverId(null);
        });
    };

    // ── Print Receipt ─────────────────────────────────────────────────────────
    const handlePrint = (orderId: string) => {
        requireAuth('Print Receipt', () => {
            const order = useKDSStore.getState().orders[orderId];
            if (!order) return;

            emitEvent('order.receipt_printed', { orderId, orderNumber: order.orderNumber });

            // Placeholder — in production: call thermal printer API / window.print()
            console.log(`[Expo] Print receipt for order #${order.orderNumber}`);
            alert(`🖨 Receipt sent to printer for Order #${order.orderNumber}`);
        });
    };

    const fulfillmentFilters: (FulfillmentType | 'ALL')[] = [
        'ALL', 'PICKUP', 'STORE_DELIVERY', 'UBER_DIRECT_DELIVERY'
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
            <KDSHeader />

            {/* ── Sub-header ── */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-[15px] font-black text-white uppercase tracking-[0.25em]">
                        Expo Display
                    </h1>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Ready Orders · Handoff Station
                    </span>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    {fulfillmentFilters.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === type
                                ? 'bg-white text-slate-900 shadow-lg'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {type.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                {/* Live counters */}
                <div className="flex items-center gap-3">
                    {overdueCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 rounded-lg">
                            <AlertTriangle size={13} className="text-white animate-bounce" />
                            <span className="text-white text-[11px] font-black uppercase tracking-widest">
                                {overdueCount} Overdue
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg shadow-lg shadow-green-900/40">
                        <span className="text-white text-sm font-black tracking-widest">
                            {orders.length} READY
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Main grid ── */}
            <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
                {orders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 select-none">
                        <div className="w-28 h-28 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center">
                            <Inbox size={40} className="text-slate-700" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-[22px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                No Ready Orders
                            </p>
                            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                                Waiting for kitchen...
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                        {orders.map(order => (
                            <ExpoCard
                                key={order.id}
                                order={order}
                                onHandOver={handleHandOver}
                                onPrint={handlePrint}
                                isHandingOver={handingOverId === order.id}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Footer status strip ── */}
            <div className="shrink-0 bg-slate-900 border-t border-slate-800 px-8 py-2 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Expo — Read Only Mode
                </span>
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                    Sorted by order time · Earliest first
                </span>
            </div>
            {AuthModalElement}
        </div>
    );
}
