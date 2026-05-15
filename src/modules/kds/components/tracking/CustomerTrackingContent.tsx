'use client';

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useKDSStore } from '@/modules/kds/store/kdsStore';
import { getTrackingStateByToken } from '@/modules/kds/services/customerStatusService';

// ─────────────────────────────────────────────────────────────────────────────
//  Customer Tracking Page — Real-time order status for customers
//
//  Accessible via: /kds/track/[token]
//
//  Features:
//    • Real-time stage progress via Zustand store
//    • Animated progress visualisation
//    • ETA countdown timer
//    • Delay notifications with updated ETA
//    • Responsive & mobile-first design
//    • Sound notification when order is READY
// ─────────────────────────────────────────────────────────────────────────────

interface CustomerTrackingPageProps {
    trackingToken: string;
}

const STAGE_SEQUENCE = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'] as const;

const STAGE_CONFIG: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
    NEW: { label: 'Order Received', icon: '📋', color: '#64748B', bgColor: '#F1F5F9' },
    ACCEPTED: { label: 'Accepted', icon: '✅', color: '#059669', bgColor: '#ECFDF5' },
    PREPARING: { label: 'Being Prepared', icon: '🍳', color: '#D97706', bgColor: '#FFFBEB' },
    READY: { label: 'Ready for Pickup!', icon: '🎉', color: '#2563EB', bgColor: '#EFF6FF' },
    COMPLETED: { label: 'Completed', icon: '💚', color: '#7C3AED', bgColor: '#F5F3FF' },
    CANCELLED: { label: 'Cancelled', icon: '❌', color: '#DC2626', bgColor: '#FEF2F2' },
};

export function CustomerTrackingContent({ trackingToken }: CustomerTrackingPageProps) {
    const ordersMap = useKDSStore((state) => state.orders);
    const [, setTick] = useState(0);

    // Real-time countdown timer
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const order = useMemo(() => {
        return Object.values(ordersMap).find(o => o.trackingToken === trackingToken) || null;
    }, [ordersMap, trackingToken]);

    const trackingState = useMemo(() => {
        if (!order) return null;
        return getTrackingStateByToken(trackingToken);
    }, [order, trackingToken]);

    // Sound notification when order becomes READY
    const wasReadyRef = useRef(false);
    useEffect(() => {
        if (order?.stage === 'READY' && !wasReadyRef.current) {
            wasReadyRef.current = true;
            try {
                const audio = new Audio('/sounds/confirm.mp3');
                audio.volume = 1.0;
                audio.play().catch(() => { });
            } catch { }
        }
        if (order?.stage !== 'READY') {
            wasReadyRef.current = false;
        }
    }, [order?.stage]);

    if (!order || !trackingState) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
                    <div className="text-6xl mb-6">🔍</div>
                    <h1 className="text-2xl font-black text-slate-900 mb-3">Order Not Found</h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        This tracking link may have expired or the order doesn&apos;t exist.
                        Please check your confirmation message for the correct link.
                    </p>
                    <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Tracking Token
                        </span>
                        <p className="text-xs font-mono text-slate-600 mt-1 break-all">{trackingToken}</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentStageIdx = STAGE_SEQUENCE.indexOf(order.stage as typeof STAGE_SEQUENCE[number]);
    const isCancelled = order.stage === 'CANCELLED';
    const isReady = order.stage === 'READY';
    const isCompleted = order.stage === 'COMPLETED';

    // ETA calculation
    let etaDisplay = '';
    let etaCountdown = '';
    if (order.estimatedReadyTime && !isCompleted && !isCancelled) {
        const readyTime = new Date(order.estimatedReadyTime);
        const now = new Date();
        const diffMs = readyTime.getTime() - now.getTime();
        const diffMins = Math.max(0, Math.floor(diffMs / 60000));
        const diffSecs = Math.max(0, Math.floor((diffMs % 60000) / 1000));
        etaDisplay = readyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        etaCountdown = diffMs <= 0
            ? 'Any moment now!'
            : `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
    }

    const stageConfig = STAGE_CONFIG[order.stage] ?? { label: 'Order Received', icon: '📋', color: '#64748B', bgColor: '#F1F5F9' };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
            {/* Top Brand Bar */}
            <div className="h-1 bg-gradient-to-r from-[#1FA4A9] via-[#1FA4A9]/60 to-transparent" />

            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
                {/* Order Header */}
                <div className="w-full text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Order
                        </span>
                        <span className="text-lg font-black text-slate-900">
                            #{order.orderNumber}
                        </span>
                    </div>
                    {order.customerName && (
                        <p className="text-slate-500 text-sm font-medium">
                            Hi, {order.customerName}! 👋
                        </p>
                    )}
                </div>

                {/* Main Status Card */}
                <div
                    className="w-full rounded-3xl shadow-2xl overflow-hidden mb-8 transition-all duration-500"
                    style={{ backgroundColor: stageConfig.bgColor }}
                >
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
                            {stageConfig.icon}
                        </div>
                        <h1 className="text-3xl font-black mb-2" style={{ color: stageConfig.color }}>
                            {isCancelled ? 'Order Cancelled' :
                                isReady ? 'Your Order is Ready!' :
                                    isCompleted ? 'Order Completed' :
                                        stageConfig.label}
                        </h1>
                        {!isCancelled && !isCompleted && (
                            <p className="text-slate-500 text-sm">
                                {isReady
                                    ? 'Please proceed to the counter for pickup'
                                    : 'We\'re working on your order right now'}
                            </p>
                        )}
                    </div>

                    {/* ETA Section */}
                    {!isReady && !isCompleted && !isCancelled && etaCountdown && (
                        <div className="mx-6 mb-6 p-6 bg-white rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                        Estimated Ready
                                    </span>
                                    <span className="text-sm text-slate-600 font-bold mt-1 block">
                                        {etaDisplay}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-slate-900 tabular-nums block">
                                        {etaCountdown}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                        remaining
                                    </span>
                                </div>
                            </div>
                            {order.isDelayed && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                                    <span className="text-amber-500 text-lg">⏳</span>
                                    <div>
                                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                                            Slight Delay
                                        </span>
                                        <p className="text-xs text-amber-600 mt-0.5">
                                            {order.delayReason || 'Your order needs a little extra time. Updated ETA above.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ready Pickup CTA */}
                    {isReady && (
                        <div className="mx-6 mb-6 p-6 bg-white rounded-2xl shadow-sm text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🏃</span>
                            </div>
                            <p className="text-lg font-bold text-slate-900">Head to the counter!</p>
                            <p className="text-sm text-slate-500 mt-1">Your order is freshly prepared and waiting</p>
                        </div>
                    )}
                </div>

                {/* Progress Steps */}
                {!isCancelled && (
                    <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between">
                            {STAGE_SEQUENCE.map((stage, idx) => {
                                const isActive = idx <= currentStageIdx;
                                const isCurrent = idx === currentStageIdx;
                                const config = STAGE_CONFIG[stage];
                                const isLast = idx === STAGE_SEQUENCE.length - 1;

                                return (
                                    <React.Fragment key={stage}>
                                        <div className="flex flex-col items-center gap-2">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${isCurrent
                                                    ? 'scale-125 shadow-lg ring-4 ring-offset-2'
                                                    : isActive ? 'scale-100' : 'scale-90 opacity-40'
                                                    }`}
                                                style={{
                                                    backgroundColor: isActive ? config?.bgColor ?? '#F1F5F9' : '#F1F5F9',
                                                    ...(isCurrent ? { '--tw-ring-color': (config?.color ?? '#1FA4A9') + '40' } as React.CSSProperties : {}),
                                                }}
                                            >
                                                {config?.icon ?? '⏳'}
                                            </div>
                                            <span className={`text-[8px] font-bold uppercase tracking-widest text-center leading-tight ${isActive ? 'text-slate-700' : 'text-slate-300'
                                                }`}>
                                                {config?.label ?? stage}
                                            </span>
                                        </div>
                                        {!isLast && (
                                            <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-slate-100">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{
                                                        width: idx < currentStageIdx ? '100%' : '0%',
                                                        backgroundColor: '#1FA4A9',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Order Details Summary */}
                <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Order Summary
                    </h3>
                    <div className="space-y-3">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.isCompleted ? 'bg-emerald-50' : 'bg-slate-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${item.isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-slate-700 border border-slate-200'
                                    }`}>
                                    {item.isCompleted ? '✓' : item.quantity || 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={`text-sm font-bold ${item.isCompleted ? 'text-emerald-700 line-through' : 'text-slate-900'
                                        }`}>
                                        {item.name}
                                    </span>
                                    {item.variant && (
                                        <span className="text-[10px] font-bold text-slate-400 ml-2">({item.variant})</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Updates Timeline */}
                {trackingState && trackingState.statusHistory.length > 0 && (
                    <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                            Updates
                        </h3>
                        <div className="space-y-4">
                            {trackingState.statusHistory.slice(0, 5).map((update, idx) => (
                                <div key={update.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full shrink-0 ${update.trigger === 'READY' ? 'bg-blue-500' :
                                            update.trigger === 'DELAY' ? 'bg-amber-500' :
                                                update.trigger === 'CANCELLED' ? 'bg-red-500' :
                                                    'bg-emerald-500'
                                            }`} />
                                        {idx < trackingState.statusHistory.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-slate-100 mt-1" />
                                        )}
                                    </div>
                                    <div className="pb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-slate-600 uppercase">
                                                {update.trigger}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold">
                                                {new Date(update.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {update.message.slice(0, 120)}
                                            {update.message.length > 120 ? '...' : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Branding */}
                <div className="text-center py-6 opacity-40">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                        Powered by
                    </span>
                    <span className="text-lg font-bold text-slate-900 tracking-tighter">ZYAPPY</span>
                </div>
            </div>
        </div>
    );
}
