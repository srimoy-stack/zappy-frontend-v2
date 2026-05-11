'use client';

import { useParams } from 'next/navigation';
import { useTrackingOrder } from '@/modules/kds/hooks/useTrackingOrder';
import { getRemainingSeconds } from '@/modules/kds/utils/slaUtils';
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Utensils } from 'lucide-react';
import { SourceBadge } from '@/modules/kds/components/ticket/SourceBadge';
import { KDSOrder, KitchenStage } from '@/modules/kds/types/kds';

export default function OrderTrackingPage() {
    const params = useParams();
    const token = params.token as string;
    const { order } = useTrackingOrder(token);

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Order Not Found</h1>
                    <p className="text-slate-500 font-medium">This tracking link may be invalid or expired. Please check your confirmation SMS/Email.</p>
                </div>
            </div>
        );
    }

    return <TrackingContent order={order} />;
}

function XCircle({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
        </svg>
    );
}

function TrackingContent({ order }: { order: KDSOrder }) {
    const [prevStage, setPrevStage] = useState(order.stage);

    useEffect(() => {
        if (order.stage !== prevStage) {
            setPrevStage(order.stage);
            if (order.stage === 'READY') {
                // Celebration logic placeholder
            }
        }
    }, [order.stage, prevStage]);

    const stages: KitchenStage[] = ['ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];

    // Map internal stages to display timeline indices
    const getStageIndex = (stage: KitchenStage): number => {
        switch (stage) {
            case 'NEW':
            case 'ACCEPTED':
                return 0;
            case 'PREPARING':
                return 1;
            case 'READY':
                return 2;
            case 'COMPLETED':
                return 3;
            case 'RECALLED':
            case 'CANCELLED':
            default:
                return 0;
        }
    };

    const currentStageIndex = getStageIndex(order.stage);

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-[#1FA4A9]/20 overflow-x-hidden">
            {/* Background Ambient Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#1FA4A9]/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full animate-bounce [animation-duration:10s]" />
            </div>

            <div className="max-w-xl mx-auto pt-16 px-6 relative z-10">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-10">
                    <div className="animate-in fade-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-[#1FA4A9] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1FA4A9]">Live Update Active</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-2">
                            Order #{order.orderNumber}
                        </h1>
                        <p className="text-slate-400 font-bold flex items-center gap-2">
                            {order.storeName || 'Zyappy Flagship Store'}
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-slate-500">{order.fulfillment_type.replace(/_/g, ' ')}</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-right duration-700">
                        <SourceBadge source={order.order_source} />
                    </div>
                </div>

                {/* Delay Alert */}
                {order.isDelayed && (
                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-5 animate-in zoom-in duration-500 backdrop-blur-md">
                        <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="font-black text-red-100 text-base uppercase tracking-tight">Slight Delay Noticed</p>
                            <p className="text-xs text-red-200/80 font-bold mt-0.5">
                                {order.delayReason || "We're taking a little extra care with your order today."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Status Glass Card */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 mb-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1FA4A9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {order.stage === 'READY' ? (
                        <div className="text-center py-6 animate-in zoom-in duration-700">
                            <div className="w-24 h-24 bg-[#1FA4A9] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(31,164,169,0.4)] animate-bounce">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Order is Ready!</h2>
                            <p className="text-[#1FA4A9] font-black uppercase tracking-widest text-sm">Please come to the counter</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-8 divide-x divide-white/5">
                            <div className="pr-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#1FA4A9] block mb-2">estimated ready</span>
                                <div className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                    {order.estimatedReadyTime.includes('T')
                                        ? new Date(order.estimatedReadyTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                                        : order.estimatedReadyTime}
                                </div>
                            </div>
                            <div className="pl-8">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">time remaining</span>
                                <CustomerTimer createdAt={order.createdAt} prepTimeMinutes={order.prepTimeMinutes} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Interactive Stepper */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 mb-10 shadow-xl">
                    <div className="relative h-2 bg-white/5 rounded-full mb-12 overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-[#1FA4A9] shadow-[0_0_15px_rgba(31,164,169,0.8)] transition-all duration-[2000ms] ease-out rounded-full"
                            style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex justify-between px-2">
                        {stages.map((st, idx) => {
                            const isPast = idx < currentStageIndex;
                            const isCurrent = idx === currentStageIndex;
                            const isFuture = idx > currentStageIndex;

                            return (
                                <div key={st} className="flex flex-col items-center gap-4 group">
                                    <div className={`
                                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative
                                        ${isCurrent ? 'bg-[#1FA4A9] text-white shadow-[0_0_20px_rgba(31,164,169,0.5)] scale-110' :
                                            isPast ? 'bg-white/10 text-[#1FA4A9]' : isFuture ? 'bg-white/5 text-slate-700' : 'bg-white/5 text-slate-500'}
                                    `}>
                                        {isPast ? <CheckCircle2 size={22} /> :
                                            isCurrent ? <Utensils size={22} className="animate-pulse" /> :
                                                <Clock size={20} />}

                                        {isCurrent && (
                                            <div className="absolute -inset-2 bg-[#1FA4A9]/20 rounded-[1.5rem] -z-10 animate-ping [animation-duration:3s]" />
                                        )}
                                    </div>
                                    <span className={`
                                        text-[10px] font-black uppercase tracking-widest transition-colors duration-300
                                        ${isCurrent ? 'text-[#1FA4A9]' : isPast ? 'text-slate-400' : 'text-slate-700'}
                                    `}>
                                        {st === 'READY' ? 'PICKUP' : st}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Details Header */}
                <div className="flex items-center gap-3 mb-6 px-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Order Summary</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Items Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 mb-16">
                    <div className="space-y-8">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-6 group animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="w-14 h-14 bg-[#1FA4A9]/10 border border-[#1FA4A9]/20 rounded-2xl flex items-center justify-center shrink-0 font-black text-[#1FA4A9] text-xl group-hover:bg-[#1FA4A9] group-hover:text-white transition-all duration-300">
                                    {item.quantity || 1}x
                                </div>
                                <div className="flex-1 pt-1">
                                    <h4 className="font-extrabold text-white text-xl tracking-tight mb-1">{item.name}</h4>
                                    {item.variant && (
                                        <span className="inline-block bg-slate-800 text-slate-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-md mb-3">
                                            {item.variant}
                                        </span>
                                    )}

                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5 mt-3">
                                            {item.modifiers.map((mod: any, mIdx: number) => (
                                                <div key={mIdx} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-slate-400">
                                                    <div className="w-1 h-1 rounded-full bg-[#1FA4A9]" />
                                                    {mod.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Content */}
                <div className="space-y-6 text-center pb-20">
                    <div className="flex justify-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        {/* Source Specific Logos would go here */}
                    </div>
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
                        Live Tracking Connected
                    </p>
                    <div className="h-1 w-20 bg-[#1FA4A9] mx-auto rounded-full opacity-20" />
                </div>
            </div>
        </div>
    );
}

function CustomerTimer({ createdAt, prepTimeMinutes }: { createdAt: string; prepTimeMinutes: number }) {
    const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds(createdAt, prepTimeMinutes));

    useEffect(() => {
        const timer = setInterval(() => {
            setRemainingSeconds(getRemainingSeconds(createdAt, prepTimeMinutes));
        }, 1000);
        return () => clearInterval(timer);
    }, [createdAt, prepTimeMinutes]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-3xl font-black text-[#1FA4A9] tabular-nums">
            {formatTime(remainingSeconds)}
        </div>
    );
}
