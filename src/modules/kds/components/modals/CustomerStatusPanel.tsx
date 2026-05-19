'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Clock,
    CheckCircle2,
    Send,
    Bell,
    AlertTriangle,
    XCircle,
    Plus,
    Minus,
    ExternalLink,
    Copy,
    MessageSquare,
    Mail,
    Smartphone,
    Timer,
    Zap,
} from 'lucide-react';
import { KDSOrder } from '../../types/kds';
import {
    sendStatusUpdate,


    getStatusUpdatesForOrder,
    DELAY_INCREMENT_MINS,
    StatusTrigger,
    NotificationChannel,
    CustomerStatusUpdate,
} from '../../services/customerStatusService';
import { KDSPermissionGuard } from '../security/KDSPermissionGuard';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
    isOpen: boolean;
    order: KDSOrder;
    onClose: () => void;
    initialTrigger?: StatusTrigger;
    isEmbedded?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────

export const CustomerStatusPanel: React.FC<Props> = ({
    isOpen,
    order,
    onClose,
    initialTrigger,
    isEmbedded = false,
}) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [selectedTrigger, setSelectedTrigger] = useState<StatusTrigger>(initialTrigger || 'ACCEPT');
    const [channel, setChannel] = useState<NotificationChannel>('LINK_ONLY');
    const [delayMinutes, setDelayMinutes] = useState<number>(DELAY_INCREMENT_MINS);
    const [customMessage, setCustomMessage] = useState('');
    const [useCustomMessage, setUseCustomMessage] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
    const [statusHistory, setStatusHistory] = useState<CustomerStatusUpdate[]>([]);

    const trackingUrl = `https://track.zyappy.com/${order.trackingToken}`;

    // Determine the smart default trigger based on order stage
    useEffect(() => {
        if (initialTrigger) {
            setSelectedTrigger(initialTrigger);
            return;
        }
        switch (order.stage) {
            case 'NEW': setSelectedTrigger('ACCEPT'); break;
            case 'ACCEPTED':
            case 'PREPARING': setSelectedTrigger('DELAY'); break;
            case 'READY': setSelectedTrigger('READY'); break;
            case 'COMPLETED': setSelectedTrigger('COMPLETED'); break;
            case 'CANCELLED': setSelectedTrigger('CANCELLED'); break;
            default: setSelectedTrigger('ACCEPT');
        }
    }, [order.stage, initialTrigger]);

    // Load status history
    useEffect(() => {
        if (isOpen) {
            setStatusHistory(getStatusUpdatesForOrder(order.id));
        }
    }, [isOpen, order.id]);

    // Computed: estimated ready time
    const estimatedReadyDisplay = useMemo(() => {
        if (!order.estimatedReadyTime) return `~${order.prepTimeMinutes || 10} mins`;
        const readyTime = new Date(order.estimatedReadyTime);
        const now = new Date();
        const diffMs = readyTime.getTime() - now.getTime();
        const diffMins = Math.max(0, Math.ceil(diffMs / 60000));
        return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    }, [order.estimatedReadyTime, order.prepTimeMinutes]);

    const handleSend = useCallback(async () => {
        setIsSending(true);
        setSendResult(null);

        try {
            const result = await sendStatusUpdate(
                order.id,
                selectedTrigger,
                channel,
                useCustomMessage ? customMessage : undefined,
                selectedTrigger === 'DELAY' ? delayMinutes : undefined,
                false
            );

            setSendResult({
                success: result.success,
                message: result.statusMessage
            });

            if (result.success) {
                setStatusHistory(getStatusUpdatesForOrder(order.id));
                // Auto-close after 1.5s on success
                setTimeout(() => {
                    setSendResult(null);
                }, 2000);
            }
        } catch (err) {
            setSendResult({
                success: false,
                message: 'Failed to send status update.'
            });
        } finally {
            setIsSending(false);
        }
    }, [order.id, selectedTrigger, channel, useCustomMessage, customMessage, delayMinutes]);

    const handleIncrementDelay = useCallback(() => {
        setDelayMinutes(prev => prev + DELAY_INCREMENT_MINS);
    }, []);

    const handleDecrementDelay = useCallback(() => {
        setDelayMinutes(prev => Math.max(DELAY_INCREMENT_MINS, prev - DELAY_INCREMENT_MINS));
    }, []);

    const copyTrackingLink = useCallback(() => {
        navigator.clipboard.writeText(trackingUrl);
        setSendResult({ success: true, message: 'Tracking link copied!' });
        setTimeout(() => setSendResult(null), 1500);
    }, [trackingUrl]);

    if (!isOpen || !mounted) return null;

    const triggerOptions: { key: StatusTrigger; label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }[] = [
        { key: 'ACCEPT', label: 'Accepted', icon: <CheckCircle2 size={16} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
        { key: 'DELAY', label: 'Delayed', icon: <Clock size={16} />, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
        { key: 'READY', label: 'Ready', icon: <Bell size={16} />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
        { key: 'COMPLETED', label: 'Complete', icon: <CheckCircle2 size={16} />, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
        { key: 'CANCELLED', label: 'Cancel', icon: <XCircle size={16} />, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    ];

    const channelOptions: { key: NotificationChannel; label: string; icon: React.ReactNode }[] = [
        { key: 'LINK_ONLY', label: 'Link Only', icon: <ExternalLink size={14} /> },
        { key: 'SMS', label: 'SMS', icon: <Smartphone size={14} /> },
        { key: 'EMAIL', label: 'Email', icon: <Mail size={14} /> },
        { key: 'BOTH', label: 'Both', icon: <MessageSquare size={14} /> },
    ];

    const content = (
        <div
            className={`flex flex-col h-full bg-white ${isEmbedded ? '' : 'w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden'}`}
            style={isEmbedded ? {} : { maxHeight: '90vh' }}
        >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className={`relative overflow-hidden shrink-0 ${isEmbedded ? 'rounded-t-[2.5rem]' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-[#1FA4A9]/20" />
                <div className="relative p-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Zap size={20} className="text-[#1FA4A9]" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                Customer Status
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/10 rounded-lg text-white/90 text-xs font-bold">
                                #{order.orderNumber}
                            </span>
                            <span className="text-white/50 text-xs font-bold uppercase">
                                {order.customerName || 'Guest'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${order.isDelayed
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                {order.isDelayed ? 'DELAYED' : 'ON TRACK'}
                            </span>
                        </div>
                    </div>
                    {!isEmbedded && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X size={20} className="text-white/70" />
                        </button>
                    )}
                </div>

                {/* ETA Bar */}
                <div className="relative px-6 pb-4 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Timer size={14} className="text-[#1FA4A9]" />
                        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">ETA</span>
                    </div>
                    <span className="text-white text-lg font-black">
                        {estimatedReadyDisplay}
                    </span>
                    {order.estimatedReadyTime && (
                        <span className="text-white/40 text-xs font-bold">
                            ({new Date(order.estimatedReadyTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                    )}
                </div>
            </div>

            {/* ── Content ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Trigger Selection */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Status Update Trigger
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {triggerOptions.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setSelectedTrigger(opt.key)}
                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all ${selectedTrigger === opt.key
                                    ? `${opt.bgColor} ${opt.borderColor} ${opt.color} scale-[1.02] shadow-lg`
                                    : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                                    }`}
                            >
                                {opt.icon}
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {opt.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Delay Adjustment (only for DELAY trigger) */}
                {selectedTrigger === 'DELAY' && (
                    <KDSPermissionGuard permission="KDS_BUMP_ITEM">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Delay Adjustment (+{DELAY_INCREMENT_MINS} min increments)
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDecrementDelay}
                                    disabled={delayMinutes <= DELAY_INCREMENT_MINS}
                                    className="w-14 h-14 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Minus size={20} className="text-slate-600" />
                                </button>
                                <div className="flex-1 flex flex-col items-center">
                                    <span className="text-5xl font-black text-slate-900">+{delayMinutes}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Minutes</span>
                                </div>
                                <button
                                    onClick={handleIncrementDelay}
                                    className="w-14 h-14 rounded-xl bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-all"
                                >
                                    <Plus size={20} className="text-amber-600" />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {[5, 10, 15, 20, 30].map(mins => (
                                    <button
                                        key={mins}
                                        onClick={() => setDelayMinutes(mins)}
                                        className={`flex-1 h-10 rounded-lg text-xs font-black transition-all ${delayMinutes === mins
                                            ? 'bg-amber-500 text-white shadow-lg'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        +{mins}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </KDSPermissionGuard>
                )}

                {/* Channel Selection */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Notification Channel
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {channelOptions.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setChannel(opt.key)}
                                className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-wider ${channel === opt.key
                                    ? 'bg-[#1FA4A9]/10 border-[#1FA4A9] text-[#1FA4A9]'
                                    : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                                    }`}
                            >
                                {opt.icon}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Message Toggle */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Message Preview
                        </label>
                        <KDSPermissionGuard permission="KDS_ORDER_VIEW">
                            <button
                                onClick={() => setUseCustomMessage(!useCustomMessage)}
                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${useCustomMessage
                                    ? 'bg-[#1FA4A9] text-white'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                            >
                                {useCustomMessage ? 'Using Custom' : 'Customize'}
                            </button>
                        </KDSPermissionGuard>
                    </div>
                    {useCustomMessage ? (
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Type your custom status message..."
                            className="w-full h-24 p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA4A9] outline-none font-medium text-sm transition-all resize-none"
                        />
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {(() => {
                                    const customerName = order.customerName || 'Valued Customer';
                                    switch (selectedTrigger) {
                                        case 'ACCEPT': return `Hi ${customerName}! Your order #${order.orderNumber} has been accepted. Estimated ready in ${order.prepTimeMinutes || 10} mins.`;
                                        case 'DELAY': return `Hi ${customerName}, we're sorry — order #${order.orderNumber} needs +${delayMinutes} more minutes.`;
                                        case 'READY': return `Great news, ${customerName}! 🎉 Order #${order.orderNumber} is READY for pickup!`;
                                        case 'COMPLETED': return `Thank you, ${customerName}! Order #${order.orderNumber} has been fulfilled.`;
                                        case 'CANCELLED': return `We're sorry, ${customerName}. Order #${order.orderNumber} has been cancelled.`;
                                    }
                                })()}
                            </p>
                            <p className="text-[10px] text-[#1FA4A9] font-bold mt-2 truncate">
                                🔗 {trackingUrl}
                            </p>
                        </div>
                    )}
                </div>

                {/* Tracking Link */}
                <div className="flex items-center gap-3 p-4 bg-[#1FA4A9]/5 rounded-xl border border-[#1FA4A9]/10">
                    <ExternalLink size={16} className="text-[#1FA4A9] shrink-0" />
                    <input
                        readOnly
                        value={trackingUrl}
                        className="flex-1 bg-transparent text-sm font-mono text-[#1FA4A9] outline-none"
                    />
                    <button
                        onClick={copyTrackingLink}
                        className="px-3 py-1.5 bg-[#1FA4A9]/10 hover:bg-[#1FA4A9]/20 text-[#1FA4A9] rounded-lg transition-all"
                    >
                        <Copy size={14} />
                    </button>
                </div>

                {/* Status History */}
                {statusHistory.length > 0 && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Status Update History ({statusHistory.length})
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {statusHistory.map(update => (
                                <div
                                    key={update.id}
                                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                                >
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${update.trigger === 'READY' ? 'bg-blue-500' :
                                        update.trigger === 'DELAY' ? 'bg-amber-500' :
                                            update.trigger === 'CANCELLED' ? 'bg-red-500' :
                                                update.trigger === 'COMPLETED' ? 'bg-violet-500' :
                                                    'bg-emerald-500'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-600 uppercase">
                                                {update.trigger}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold">
                                                via {update.channel}
                                            </span>
                                            {update.isAutoTriggered && (
                                                <span className="text-[8px] bg-[#1FA4A9]/10 text-[#1FA4A9] px-1.5 py-0.5 rounded font-bold">AUTO</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                            {update.message.slice(0, 80)}...
                                        </p>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold shrink-0">
                                        {new Date(update.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Result Toast */}
                {sendResult && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 transition-all animate-in fade-in ${sendResult.success
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {sendResult.success ? (
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        ) : (
                            <AlertTriangle size={18} className="text-red-600 shrink-0" />
                        )}
                        <span className={`text-sm font-bold ${sendResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                            {sendResult.message}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-sm text-slate-500 hover:bg-slate-200 transition-all"
                >
                    {isEmbedded ? 'Back' : 'Close'}
                </button>
                <KDSPermissionGuard permission="KDS.CUSTOMER_MESSAGE">
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className={`flex-[2] h-14 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all ${isSending
                            ? 'bg-slate-300 text-slate-500 cursor-wait'
                            : selectedTrigger === 'CANCELLED'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : selectedTrigger === 'DELAY'
                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                    >
                        {isSending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Send {selectedTrigger} Update
                            </>
                        )}
                    </button>
                </KDSPermissionGuard>
            </div>
        </div>
    );

    if (isEmbedded) return content;

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: '90vh' }}
            >
                {content}
            </div>
        </div>,
        document.body
    );
};
