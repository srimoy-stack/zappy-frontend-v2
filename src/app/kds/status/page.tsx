'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useKDSStore } from '@/modules/kds/store/kdsStore';

export default function CustomerStatusPage() {

    const ordersMap = useKDSStore((state) => state.orders);
    const orders = useMemo(() => Object.values(ordersMap), [ordersMap]);

    // Initial data seeded by bootstrap service.


    const preparingOrders = useMemo(() =>
        orders.filter(o => ['NEW', 'ACCEPTED', 'PREPARING'].includes(o.stage))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        , [orders]);

    // Sound Notification logic
    const lastReadyIds = useRef<Set<string>>(new Set());
    const readyOrders = useMemo(() =>
        orders.filter(o => o.stage === 'READY')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        , [orders]);

    useEffect(() => {
        if (!readyOrders.length) {
            lastReadyIds.current = new Set();
            return;
        }

        const currentReadyIds = new Set(readyOrders.map(o => o.id));
        const newReady = readyOrders.filter(o => !lastReadyIds.current.has(o.id));

        // Only play if it's not the initial mount load
        if (newReady.length > 0 && lastReadyIds.current.size > 0) {
            try {
                const audio = new Audio('/sounds/confirm.mp3');
                audio.volume = 1.0;
                audio.play().catch(() => {
                    console.log('Autoplay blocked: User must interact with page first.');
                });
            } catch (e) {
                console.error('Audio Error:', e);
            }
        }

        lastReadyIds.current = currentReadyIds;
    }, [readyOrders]);

    return (
        <div className="min-h-screen bg-white flex flex-col p-12 font-sans overflow-hidden">
            {/* Split Screen Layout */}
            <div className="flex-1 flex gap-12">

                {/* PREPARING SECTION */}
                <div className="flex-1 flex flex-col">
                    <h2 className="text-5xl font-bold text-[#1a1a1a] mb-12 uppercase tracking-tight">
                        Being prepared
                    </h2>

                    <div className="grid grid-cols-4 lg:grid-cols-5 gap-6">
                        {preparingOrders.map((order) => (
                            <div
                                key={order.id}
                                className="h-32 bg-white border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center p-4 gap-1"
                            >
                                <span className="text-4xl font-extrabold text-[#1a1a1a] leading-none mb-1">
                                    {order.orderNumber}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase truncate w-full text-center">
                                    {order.customerName || 'Guest'}
                                </span>
                                <div className="mt-1 px-2 py-0.5 bg-gray-50 rounded-full">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">
                                        {order.stage === 'PREPARING' ? 'Cooking' : 'In Queue'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {preparingOrders.length === 0 && (
                            <div className="col-span-12 py-20">
                                <p className="text-gray-200 text-3xl font-bold uppercase">No pending orders</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* VERTICAL DIVIDER */}
                <div className="w-px bg-gray-100 shrink-0" />

                {/* READY SECTION */}
                <div className="w-[45%] flex flex-col">
                    <h2 className="text-5xl font-bold text-[#1a1a1a] mb-12 uppercase tracking-tight">
                        Ready for pickup
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {readyOrders.map((order, idx) => (
                            <div
                                key={order.id}
                                className={`rounded-2xl flex flex-col items-center justify-center transition-all p-6 ${idx === 0
                                    ? 'col-span-2 row-span-2 h-[22rem] bg-[#2ECC71] text-white'
                                    : 'h-32 bg-[#2ECC71] text-white'
                                    }`}
                            >
                                <span className={`${idx === 0 ? 'text-[9rem]' : 'text-4xl'} font-extrabold leading-none`}>
                                    {order.orderNumber}
                                </span>
                                <span className={`${idx === 0 ? 'text-lg' : 'text-[10px]'} font-bold uppercase mt-2 opacity-90 truncate w-full text-center`}>
                                    {order.customerName || 'Guest'}
                                </span>
                                <div className={`mt-2 px-3 py-1 bg-white/20 rounded-full`}>
                                    <span className={`${idx === 0 ? 'text-xs' : 'text-[8px]'} font-bold uppercase`}>
                                        Ready for Pickup
                                    </span>
                                </div>
                            </div>
                        ))}
                        {readyOrders.length === 0 && (
                            <div className="col-span-12 py-20">
                                <p className="text-gray-200 text-3xl font-bold uppercase">Ready orders will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER / BRANDING */}
            <div className="mt-12 flex justify-between items-end border-t border-gray-100 pt-8 opacity-40">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Powered by</span>
                    <span className="text-2xl font-bold text-black tracking-tighter">ZYAPPY</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Live Status Cluster</span>
                    <span className="text-sm font-bold text-gray-600 uppercase">Master Station Connected</span>
                </div>
            </div>
        </div>
    );
}
