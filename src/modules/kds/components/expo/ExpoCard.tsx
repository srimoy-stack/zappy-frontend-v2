'use client';

import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle2, Clock, AlertTriangle, Package, Bike, ExternalLink } from 'lucide-react';
import { KDSOrder } from '../../types/kds';
import { getSLAState, getRemainingSeconds } from '../../utils/slaUtils';
import { SourceBadge } from '../ticket/SourceBadge';
import { KDSPermissionGuard } from '../security/KDSPermissionGuard';

// ─────────────────────────────────────────────────────────────────────────────
//  Live Timer Hook (per-card, 1s tick)
// ─────────────────────────────────────────────────────────────────────────────

function useExpoTimer(createdAt: string, prepTimeMinutes: number) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const slaState = getSLAState(createdAt, prepTimeMinutes);
    const remainingSeconds = getRemainingSeconds(createdAt, prepTimeMinutes);
    const elapsedMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);

    return { slaState, remainingSeconds, elapsedMinutes, tick };
}

function formatSeconds(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Fulfillment icon helper
// ─────────────────────────────────────────────────────────────────────────────

function FulfillmentIcon({ type }: { type: KDSOrder['fulfillment_type'] }) {
    if (type === 'PICKUP') return <Package size={18} className="shrink-0" />;
    if (type === 'UBER_DIRECT_DELIVERY') return <ExternalLink size={18} className="shrink-0" />;
    return <Bike size={18} className="shrink-0" />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ExpoCard
// ─────────────────────────────────────────────────────────────────────────────

interface ExpoCardProps {
    order: KDSOrder;
    onHandOver: (orderId: string) => void;
    onPrint: (orderId: string) => void;
    isHandingOver: boolean;
}

export const ExpoCard: React.FC<ExpoCardProps> = ({
    order,
    onHandOver,
    onPrint,
    isHandingOver
}) => {
    const { slaState, remainingSeconds, elapsedMinutes } = useExpoTimer(
        order.createdAt,
        order.prepTimeMinutes
    );

    const isOverdue = slaState === 'OVERDUE';
    const isWarning = slaState === 'WARNING';

    // ── Border & background driven entirely by SLA state ─────────────────────
    const cardBorderClass = isOverdue
        ? 'border-red-500 border-[4px]'
        : isWarning
            ? 'border-amber-400 border-[3px]'
            : 'border-green-500 border-[3px]';

    const headerBgClass = isOverdue
        ? 'bg-red-600'
        : isWarning
            ? 'bg-amber-500'
            : 'bg-green-600';

    const timerTextClass = isOverdue
        ? 'text-red-600'
        : isWarning
            ? 'text-amber-600'
            : 'text-green-600';

    return (
        <div
            className={`
                flex flex-col rounded-2xl overflow-hidden bg-white shadow-2xl transition-all duration-500
                ${cardBorderClass}
                ${isOverdue ? 'animate-pulse-border' : ''}
            `}
        >
            {/* ── Header bar ─────────────────────────────────────────────── */}
            <div className={`${headerBgClass} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    {isOverdue && (
                        <AlertTriangle size={18} className="text-white animate-bounce shrink-0" />
                    )}
                    <span className="text-white font-black text-[13px] uppercase tracking-[0.2em]">
                        {isOverdue ? 'OVERDUE' : isWarning ? 'NEARING LIMIT' : 'READY'}
                    </span>
                </div>
                <SourceBadge source={order.order_source} />
            </div>

            {/* ── Order number + fulfillment ──────────────────────────────── */}
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-start justify-between">
                <div>
                    <div className="text-[56px] font-black text-slate-900 leading-none tracking-tighter">
                        #{order.orderNumber}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-slate-500">
                        <FulfillmentIcon type={order.fulfillment_type} />
                        <span className="text-sm font-black uppercase tracking-widest">
                            {order.fulfillment_type.replace(/_/g, ' ')}
                        </span>
                    </div>
                    {order.customerName && (
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {order.customerName}
                        </p>
                    )}
                </div>

                {/* SLA Timer */}
                <div className={`flex flex-col items-end gap-0.5 p-3 rounded-xl border-2 transition-all ${isOverdue ? 'border-red-300 bg-red-50' : isWarning ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'
                    }`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isOverdue ? 'Overdue by' : 'Remaining'}
                    </span>
                    <span className={`text-3xl font-black tabular-nums ${timerTextClass}`}>
                        {isOverdue
                            ? `+${elapsedMinutes - order.prepTimeMinutes}m`
                            : formatSeconds(remainingSeconds)
                        }
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                        Elapsed: {elapsedMinutes}m
                    </span>
                </div>
            </div>

            {/* ── Item List ──────────────────────────────────────────────── */}
            <div className="px-6 py-4 flex-1 overflow-y-auto max-h-[260px] space-y-2">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0">
                        <span className="text-lg font-black text-slate-300 leading-none mt-1 shrink-0">
                            {idx + 1}.
                        </span>
                        <div className="flex flex-col">
                            <span className="text-[22px] font-black text-slate-900 leading-tight">
                                {item.name}
                            </span>
                            {item.variant && (
                                <span className="text-sm font-semibold text-slate-400 italic">
                                    {item.variant}
                                </span>
                            )}
                            {item.modifiers.length > 0 && (
                                <div className="mt-1 space-y-0.5">
                                    {item.modifiers.map((mod, mIdx) => (
                                        <div key={mIdx} className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                                            <span className="text-blue-400 text-xs">+</span>
                                            <span>{mod.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Delay Tag ──────────────────────────────────────────────── */}
            {order.isDelayed && (
                <div className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                    <Clock size={13} className="text-red-500 shrink-0" />
                    <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">
                        Delayed
                    </span>
                    {order.delayReason && (
                        <span className="text-[11px] font-medium text-red-500 truncate">
                            — {order.delayReason}
                        </span>
                    )}
                </div>
            )}

            {/* ── Actions ────────────────────────────────────────────────── */}
            {/* Editing is NOT allowed. Only Hand Over and Print Receipt. */}
            <div className="px-5 pb-5 pt-3 flex items-center gap-3 border-t border-slate-100 bg-slate-50/60">
                <KDSPermissionGuard permission="KDS.PRINT">
                    <button
                        onClick={() => onPrint(order.id)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-[12px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                        title="Print receipt"
                    >
                        <Printer size={16} />
                        Receipt
                    </button>
                </KDSPermissionGuard>

                <KDSPermissionGuard permission="KDS.STAGE_UPDATE">
                    <button
                        onClick={() => onHandOver(order.id)}
                        disabled={isHandingOver}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white
                            text-[13px] font-black uppercase tracking-widest transition-all active:scale-[0.98]
                            shadow-lg disabled:opacity-60
                            ${isOverdue
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                            }
                        `}
                    >
                        {isHandingOver ? (
                            <span className="animate-pulse">Confirming...</span>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Handed Over
                            </>
                        )}
                    </button>
                </KDSPermissionGuard>
            </div>
        </div>
    );
};
