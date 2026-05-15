'use client';

import { useState, useEffect, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Printer, Eye, Zap } from 'lucide-react';
import { printOrder } from '../../services/printService';
import { kdsToast } from '../toast/KDSToast';
import { useKDSStore, KDSState } from '../../store/kdsStore';
import { useKDSSound } from '../sound/useKDSSound';
import { getSLAState } from '../../utils/slaUtils';

import { isItemVisibleOnStation, getItemStation } from '../../utils/routingUtils';
import { KDSPermissionGuard } from '../security/KDSPermissionGuard';
import { useKDSActionAuth } from '../../hooks/useKDSActionAuth';

interface Props {
    orderId: string;
    onViewDetail: (orderId: string) => void;
    compact?: boolean;
}

export const OrderTicket = memo(({ orderId, onViewDetail, compact }: Props) => {
    const {
        order,
        enable_station_routing,
        selectedStationId,
        allow_item_station_override,
        item_station_map,
        master_screen_view_mode,
        kds_stations
    } = useKDSStore(useShallow((state: KDSState) => ({
        order: state.orders[orderId] ?? state.fulfilledOrders.find(o => o.id === orderId),
        enable_station_routing: state.enable_station_routing,
        selectedStationId: state.selectedStationId,
        allow_item_station_override: state.allow_item_station_override,
        item_station_map: state.item_station_map,
        master_screen_view_mode: state.master_screen_view_mode,
        kds_stations: state.kds_stations
    })));

    const [isProcessing, setIsProcessing] = useState(false);
    const { advanceStage } = useKDSStore.getState();
    const { playSound } = useKDSSound();
    const { requireAuth, AuthModalElement } = useKDSActionAuth();

    const [timer, setTimer] = useState("00:00:00");

    useEffect(() => {
        if (!order) return;
        const interval = setInterval(() => {
            const diff = Date.now() - new Date(order.createdAt).getTime();
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setTimer(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [order?.createdAt]);

    if (!order) return null;

    const visibleItems = order.items.filter(item =>
        isItemVisibleOnStation(item, {
            enable_station_routing,
            selectedStationId,
            kds_stations,
            allow_item_station_override,
            item_station_map,
            master_screen_view_mode
        })
    );

    if (visibleItems.length === 0) return null;

    const slaState = getSLAState(order.createdAt, order.prepTimeMinutes);

    const isFulfilled = order.stage === 'COMPLETED';
    const isRecalled = order.stage === 'RECALLED';

    const getStatusInfo = () => {
        if (isFulfilled) return { label: 'COMPLETED', color: 'bg-emerald-600', text: 'text-emerald-600' };
        if (isRecalled) return { label: 'RECALLED', color: 'bg-teal-500', text: 'text-teal-500' };
        if (slaState === 'OVERDUE') return { label: 'DELAYED', color: 'bg-red-500', text: 'text-red-500' };
        if (slaState === 'WARNING') return { label: 'WARNING', color: 'bg-amber-500', text: 'text-amber-500' };
        if (order.stage === 'NEW') return { label: 'IN QUEUE', color: 'bg-gray-800', text: 'text-gray-800' };
        if (order.stage === 'READY') return { label: 'READY', color: 'bg-blue-600', text: 'text-blue-600' };
        return { label: 'PREPARING', color: 'bg-emerald-500', text: 'text-emerald-500' };
    };

    const status = getStatusInfo();

    const handleAdvance = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsProcessing(true);
        advanceStage(orderId);
        playSound('BUMP_ORDER');
        setTimeout(() => setIsProcessing(false), 500);
    };

    const handlePrint = async (e: React.MouseEvent) => {
        e.stopPropagation();
        requireAuth('Print Label', async () => {
            const state = useKDSStore.getState();
            const result = await printOrder(orderId, (id) => state.orders[id], {
                station_print_mode: state.station_print_mode,
                selectedStationId: state.selectedStationId,
                enable_station_routing: state.enable_station_routing,
                kds_stations: state.kds_stations,
                item_station_map: state.item_station_map,
                allow_item_station_override: state.allow_item_station_override
            });

            if (result.status === 'SUCCESS') kdsToast.success(result.message);
        });
    };

    return (
        <div
            className={`kds-ticket bg-white flex flex-col border-2 relative h-full animate-ticket transition-all group overflow-hidden ${isProcessing ? 'opacity-50' : ''
                } ${slaState === 'OVERDUE' ? 'border-red-500/20' : 'border-gray-100 hover:border-gray-300'
                } ${compact ? 'shadow-sm' : 'shadow-md'}`}
        >
            {/* TICKET TOP BAR */}
            <div className={`${compact ? 'h-0.5' : 'h-1'} w-full ${status.color}`} />

            {/* HEADER */}
            <div className={`${compact ? 'p-2' : 'p-4'} flex flex-col gap-1 border-b border-gray-50`}>
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 leading-none`}>
                            #{order.orderNumber}
                        </span>
                        <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-bold text-gray-400 mt-1 uppercase`}>
                            {order.customerName || 'GUEST'}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className={`flex items-center gap-1.5 ${compact ? 'px-1.5 py-0' : 'px-2 py-0.5'} rounded-md ${compact ? 'text-[7px]' : 'text-[9px]'} font-bold text-white ${status.color}`}>
                            <Zap size={compact ? 8 : 10} className="animate-pulse" />
                            {status.label}
                        </div>
                        <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-bold text-gray-300 mt-1 uppercase`}>
                            Due {new Date(new Date(order.createdAt).getTime() + order.prepTimeMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* ITEMS CONTAINER */}
            <div
                className="p-5 space-y-4 flex-1 overflow-y-auto scrollbar-hide cursor-pointer select-none"
                onClick={() => onViewDetail(orderId)}
            >
                {visibleItems.map((item) => {
                    const itemStationId = getItemStation(item, {
                        enable_station_routing,
                        selectedStationId,
                        kds_stations,
                        allow_item_station_override,
                        item_station_map,
                        master_screen_view_mode
                    });
                    const isForOtherStation = selectedStationId !== 'ALL' && itemStationId !== selectedStationId;
                    const stationName = kds_stations.find(s => s.station_id === itemStationId)?.station_name || itemStationId;

                    return (
                        <div key={item.id} className={`flex gap-4 items-start transition-opacity ${isForOtherStation ? 'opacity-30' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${item.isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-900 border border-gray-200/50'
                                }`}>
                                {item.quantity}
                            </div>
                            <div className="min-w-0 pt-0.5 flex-1">
                                <div className="flex items-center justify-between gap-4">
                                    <h4 className={`text-sm font-black leading-tight uppercase tracking-tight ${item.isCompleted ? 'text-gray-300 line-through' : 'text-gray-900'
                                        }`}>
                                        {item.name}
                                    </h4>
                                    {(selectedStationId === 'ALL' || master_screen_view_mode === 'FULL_ORDER') && (
                                        <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 border border-gray-200 uppercase whitespace-nowrap">
                                            {stationName}
                                        </span>
                                    )}
                                </div>
                                {item.modifiers.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5 font-bold uppercase tracking-tight">
                                        {item.modifiers.map((m, idx) => (
                                            <div key={idx} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] border shrink-0 ${m.placement && m.placement !== 'FULL' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-400'
                                                }`}>
                                                <span>{m.quantity && m.quantity > 1 ? `${m.quantity}x ` : ''}{m.name}</span>
                                                {m.placement && m.placement !== 'FULL' && (
                                                    <span className="bg-white border border-amber-300 px-1 rounded text-[7px] font-black text-amber-600">
                                                        {m.placement === 'LEFT' ? 'L' : m.placement === 'RIGHT' ? 'R' : m.placement === 'MIDDLE' || m.placement === 'CENTER' ? 'M' : m.placement}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {order.notes && (
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={10} className="text-amber-500 fill-amber-500" />
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Kitchen Note:</span>
                        </div>
                        <p className="text-[11px] font-black text-amber-900 leading-tight bg-amber-50 p-3 rounded-xl border border-amber-200">
                            {order.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto flex gap-3 select-none">
                {isFulfilled ? (
                    <div className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-200 shadow-sm">
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">✓ Completed</span>
                        <span className="text-[10px] font-bold text-emerald-400 font-mono bg-white px-2 py-0.5 rounded-full border border-emerald-100">{timer}</span>
                    </div>
                ) : (
                    <>
                        {order.stage === 'NEW' ? (
                            <KDSPermissionGuard permission="KDS.ACCEPT_ORDER">
                                <button
                                    onClick={handleAdvance}
                                    disabled={isProcessing}
                                    className="flex-1 h-12 rounded-2xl flex items-center justify-between px-6 text-white transition-all active:scale-[0.96] shadow-md border-b-4 bg-gray-800 border-gray-950 hover:bg-black active:border-b-0"
                                >
                                    <span className="text-[11px] font-black uppercase tracking-widest">Confirm</span>
                                    <span className="text-[11px] font-black font-mono bg-black/20 px-2 py-1 rounded-lg border border-white/10">{timer}</span>
                                </button>
                            </KDSPermissionGuard>
                        ) : (
                            (order.stage !== 'READY' ? (
                                <KDSPermissionGuard permission="KDS.STAGE_UPDATE">
                                    <button
                                        onClick={handleAdvance}
                                        disabled={isProcessing}
                                        className={`flex-1 h-12 rounded-2xl flex items-center justify-between px-6 text-white transition-all active:scale-[0.96] shadow-md border-b-4 active:border-b-0 ${order.stage === 'ACCEPTED' ? 'bg-emerald-600 border-emerald-800 hover:bg-emerald-700' :
                                            order.stage === 'RECALLED' ? 'bg-teal-600 border-teal-800 hover:bg-teal-700' :
                                                order.stage === 'PREPARING' ? 'bg-[#E67E22] border-[#D35400] hover:bg-[#D35400]' :
                                                    'bg-blue-600 border-blue-800 hover:bg-blue-700'
                                            }`}
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-widest">
                                            {order.stage === 'ACCEPTED' ? 'Start' :
                                                order.stage === 'RECALLED' ? 'Re-Queue' :
                                                    order.stage === 'PREPARING' ? 'Ready' : 'Done'}
                                        </span>
                                        <span className="text-[11px] font-black font-mono bg-black/20 px-2 py-1 rounded-lg border border-white/10">{timer}</span>
                                    </button>
                                </KDSPermissionGuard>
                            ) : (
                                <KDSPermissionGuard permission="KDS.STAGE_UPDATE">
                                    <button
                                        onClick={handleAdvance}
                                        disabled={isProcessing}
                                        className="flex-1 h-12 rounded-2xl flex items-center justify-between px-6 bg-blue-600 border-blue-800 text-white hover:bg-blue-700 transition-all active:scale-[0.96] shadow-md border-b-4 active:border-b-0"
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-widest">Complete</span>
                                        <span className="text-[11px] font-black font-mono bg-black/20 px-2 py-1 rounded-lg border border-white/10">{timer}</span>
                                    </button>
                                </KDSPermissionGuard>
                            ))
                        )}
                    </>
                )}
                <KDSPermissionGuard permission="KDS.PRINT">
                    <button
                        onClick={handlePrint}
                        className="w-14 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
                        title="Print"
                    >
                        <Printer size={20} />
                    </button>
                </KDSPermissionGuard>
                <button
                    onClick={() => onViewDetail(orderId)}
                    className="w-14 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all active:scale-90 shadow-sm"
                    title="Expand"
                >
                    <Eye size={20} />
                </button>
            </div>
            {AuthModalElement}
        </div>
    );
});
