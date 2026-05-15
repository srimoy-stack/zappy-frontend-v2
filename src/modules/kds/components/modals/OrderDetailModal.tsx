'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Printer, ChevronLeft, CheckCircle2, AlertCircle, Clock, MessageSquare, Zap } from 'lucide-react';
import { KDSOrder, KitchenStage } from '../../types/kds';
import { useKDSStore } from '../../store/kdsStore';
import { useAuth } from '@/app/providers/AuthProvider';
import { KDSRole } from '../../utils/kdsAccess';
import { useKDSActionAuth } from '../../hooks/useKDSActionAuth';
import { DelayOrderModal } from './DelayOrderModal';
import { CustomerMessagingModal } from './CustomerMessagingModal';
import { CustomerStatusPanel } from './CustomerStatusPanel';
import { KDSPermissionGuard } from '../security/KDSPermissionGuard';
import { useKDSSound } from '../sound/useKDSSound';
import { getItemStation } from '../../utils/routingUtils';
import { sendStatusUpdate, StatusTrigger } from '../../services/customerStatusService';


interface OrderDetailModalProps {
    order: KDSOrder;
    isOpen: boolean;
    onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const {
        updateItemCompletion,
        cancelOrder,
        delayOrder,
        overrideStage,
        sendCustomerMessage,
        advanceStage,
        acceptOrder,
        item_station_map,
        allow_item_station_override,
        kds_stations,
    } = useKDSStore.getState();
    const { requireAuth, AuthModalElement } = useKDSActionAuth();
    const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
    const [activePanel, setActivePanel] = useState<'NONE' | 'STATUS' | 'MESSAGING'>('NONE');
    const [statusPanelTrigger, setStatusPanelTrigger] = useState<StatusTrigger | undefined>(undefined);
    const [messagingTemplate, setMessagingTemplate] = useState<'ACCEPTED' | 'PREPARING' | 'DELAYED' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'CUSTOM'>('ACCEPTED');

    const { role } = useAuth();
    const { playSound } = useKDSSound();


    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    const [shouldCloseAfterMessage, setShouldCloseAfterMessage] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const toggleItemSelection = useCallback((itemId: string) => {
        setSelectedItemIds(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) { next.delete(itemId); } else { next.add(itemId); }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedItemIds(prev => {
            if (prev.size === order.items.length) return new Set();
            return new Set(order.items.map(item => item.id));
        });
    }, [order.items]);

    const handleCancel = () => {
        requireAuth('Void Order', () => {
            const reason = prompt('REASON FOR CANCELLATION? (Required)');
            if (reason && confirm(`CANCEL ORDER #${order.orderNumber}?`)) {
                cancelOrder(order.id, role as KDSRole || 'KDS_USER', reason);
                // Req 8.3: Auto-trigger CANCELLED status update
                sendStatusUpdate(order.id, 'CANCELLED', 'LINK_ONLY', undefined, undefined, true);
                setStatusPanelTrigger('CANCELLED');
                setActivePanel('STATUS');
                setShouldCloseAfterMessage(true);
            }
        });
    };

    const handleDelayConfirm = (minutes: number, reason?: string) => {
        requireAuth('Delay Order', () => {
            delayOrder(order.id, minutes, role as KDSRole || 'KDS_USER', reason);
            // Req 8.3: Auto-trigger DELAY status update
            sendStatusUpdate(order.id, 'DELAY', 'LINK_ONLY', undefined, minutes, true);
            setStatusPanelTrigger('DELAY');
            setActivePanel('STATUS');
        });
    };

    const handleOverrideStage = (stage: KitchenStage) => {
        requireAuth(`Override to ${stage}`, () => {
            overrideStage(order.id, stage, role as KDSRole || 'KDS_USER');
        });
    };


    const handleAccept = () => {
        requireAuth('Accept Order', () => {
            acceptOrder(order.id);
            // Req 8.3: Auto-trigger ACCEPT status update — "ready in 10 mins"
            sendStatusUpdate(order.id, 'ACCEPT', 'LINK_ONLY', undefined, undefined, true);
            setStatusPanelTrigger('ACCEPT');
            setActivePanel('STATUS');
        });
    };

    const handleFulfill = () => {
        const itemIds = selectedItemIds.size > 0
            ? Array.from(selectedItemIds)
            : order.items.filter(i => !i.isCompleted).map(i => i.id);

        if (itemIds.length > 0) {
            updateItemCompletion(order.id, itemIds, true);
            playSound('BUMP_ORDER');
        }

        if (selectedItemIds.size === 0 || selectedItemIds.size === order.items.filter(i => !i.isCompleted).length) {
            // Req 8.3: Auto-trigger READY status update
            sendStatusUpdate(order.id, 'READY', 'LINK_ONLY', undefined, undefined, true);
            setStatusPanelTrigger('READY');
            setActivePanel('STATUS');
            setShouldCloseAfterMessage(true);
        }
        setSelectedItemIds(new Set());
    };
    const handleSendMessage = (channel: 'SMS' | 'EMAIL' | 'BOTH', message: string) => {
        requireAuth('Send Message', () => {
            sendCustomerMessage(order.id, channel, message);
        });
    };

    const handleMessageClose = () => {
        setActivePanel('NONE');
        if (shouldCloseAfterMessage) {
            onClose();
            setShouldCloseAfterMessage(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 lg:p-12">
            {/* BACKDROP */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* MODAL CONTAINER */}
            <div className={`relative w-full ${activePanel !== 'NONE' ? 'max-w-[1550px]' : 'max-w-6xl'} max-h-[95vh] bg-[#F3F4F6] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-all`}>
                {/* HEADER */}
                <div className="h-[80px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onClose}
                            className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                            title="Close"
                        >
                            <ChevronLeft size={24} className="text-gray-900" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-bold text-gray-900">ORDER #{order.orderNumber}</h2>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-white ${order.stage === 'RECALLED' ? 'bg-teal-600' :
                                    order.stage === 'NEW' ? 'bg-[#374151]' :
                                        order.stage === 'READY' ? 'bg-blue-600' :
                                            'bg-[#E67E22]'
                                    }`}>
                                    {order.stage === 'RECALLED' ? 'RECALLED' :
                                        order.stage === 'NEW' ? 'IN QUEUE' :
                                            order.stage === 'READY' ? 'READY' :
                                                'PREPARING'}
                                </span>
                            </div>
                            <p className="text-gray-400 text-[11px] font-bold uppercase mt-1">
                                {order.customerName || 'GUEST CUSTOMER'} • REF: {order.external_order_id || order.id.slice(0, 8)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <KDSPermissionGuard permission="KDS.CUSTOMER_MESSAGE">
                            <button
                                onClick={() => {
                                    setStatusPanelTrigger(undefined);
                                    setActivePanel('STATUS');
                                }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase transition-all ${activePanel === 'STATUS'
                                    ? 'bg-[#1FA4A9] text-white'
                                    : 'bg-gradient-to-r from-[#1FA4A9]/10 to-blue-50 text-[#1FA4A9] border-2 border-[#1FA4A9]/20 hover:bg-[#1FA4A9] hover:text-white'
                                    }`}
                            >
                                <Zap size={18} /> Customer Status
                            </button>
                        </KDSPermissionGuard>
                        <KDSPermissionGuard permission="KDS.CUSTOMER_MESSAGE">
                            <button
                                onClick={() => {
                                    // Map order stage to template
                                    const stageMap: Record<string, any> = {
                                        'NEW': 'ACCEPTED',
                                        'ACCEPTED': 'ACCEPTED',
                                        'PREPARING': 'PREPARING',
                                        'READY': 'READY',
                                        'COMPLETED': 'COMPLETED',
                                        'CANCELLED': 'CANCELLED'
                                    };
                                    setMessagingTemplate(stageMap[order.stage] || 'CUSTOM');
                                    setActivePanel('MESSAGING');
                                }}

                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase transition-all ${activePanel === 'MESSAGING'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-50 text-blue-600 border-2 border-blue-100 hover:bg-blue-600 hover:text-white'
                                    }`}
                            >
                                <MessageSquare size={18} /> Message Guest
                            </button>
                        </KDSPermissionGuard>
                        <KDSPermissionGuard permission="KDS.PRINT">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-xs uppercase hover:border-black transition-all"
                            >
                                <Printer size={18} /> Print Label
                            </button>
                        </KDSPermissionGuard>
                        <KDSPermissionGuard permission="KDS.DELAY_ORDER">
                            <button
                                onClick={() => setIsDelayModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 border-2 border-amber-100 rounded-xl font-bold text-xs uppercase hover:bg-amber-600 hover:text-white transition-all"
                            >
                                <Clock size={18} /> Delay
                            </button>
                        </KDSPermissionGuard>
                        <KDSPermissionGuard permission="KDS.CANCEL_ORDER">
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border-2 border-red-100 rounded-xl font-bold text-xs uppercase hover:bg-red-600 hover:text-white transition-all"
                            >
                                <Trash2 size={18} /> Void
                            </button>
                        </KDSPermissionGuard>
                    </div>
                </div>

                {/* MODAL CONTENT */}
                <div className="flex-1 flex flex-col p-6 lg:p-8 min-h-0 overflow-x-auto custom-scrollbar">
                    <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

                        {/* LEFT: ITEM GRID */}
                        <div className="flex-[1.5] min-w-[440px] flex flex-col bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-sm min-h-0 shrink-0">
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-black rounded-full" />
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Production List</h3>
                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg ml-2">
                                        {order.items.length} ITEMS
                                    </span>
                                </div>
                                <button
                                    onClick={handleSelectAll}
                                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                                >
                                    {selectedItemIds.size === order.items.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-4">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleItemSelection(item.id)}
                                        className={`flex items-start gap-4 p-4 rounded-2xl border-4 transition-all cursor-pointer group hover:scale-[1.01] ${selectedItemIds.has(item.id)
                                            ? 'border-black bg-gray-50'
                                            : 'border-transparent bg-gray-50/30 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 transition-all ${item.isCompleted
                                            ? 'bg-emerald-500 text-white'
                                            : selectedItemIds.has(item.id) ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-900 border-2 border-slate-100'
                                            }`}>
                                            {item.isCompleted ? '✓' : item.quantity}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h4 className={`text-xl font-bold uppercase leading-tight ${item.isCompleted ? 'text-gray-300 line-through' : 'text-gray-900 group-hover:text-black'
                                                    }`}>
                                                    {item.name}
                                                </h4>
                                                {item.variant && (
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                                                        {item.variant}
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded border border-gray-200 uppercase">
                                                    {kds_stations.find(s => s.station_id === getItemStation(item, {
                                                        enable_station_routing: true,
                                                        selectedStationId: 'ALL',
                                                        kds_stations,
                                                        allow_item_station_override,
                                                        item_station_map,
                                                        master_screen_view_mode: 'FULL_ORDER'
                                                    }))?.station_name || 'Kitchen'}
                                                </span>
                                            </div>
                                            {item.modifiers.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {item.modifiers.map((mod, idx) => (
                                                        <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all ${mod.placement && mod.placement !== 'FULL'
                                                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                                                            : 'bg-white border-gray-100 text-gray-700'
                                                            }`}>
                                                            {mod.quantity && mod.quantity > 1 && (
                                                                <span className="bg-black text-white px-1.5 rounded-md text-[9px] font-black">
                                                                    {mod.quantity}x
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] font-black uppercase tracking-tight">{mod.name}</span>
                                                            {mod.placement && mod.placement !== 'FULL' && (
                                                                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-amber-300 text-[10px] font-black text-amber-600 shadow-sm ml-1">
                                                                    {mod.placement === 'LEFT' ? 'HALF L' :
                                                                        mod.placement === 'RIGHT' ? 'HALF R' :
                                                                            mod.placement === 'MIDDLE' || mod.placement === 'CENTER' ? 'MIDDLE' : mod.placement}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedItemIds.has(item.id) ? 'bg-black border-black' : 'border-gray-300'
                                            }`}>
                                            {selectedItemIds.has(item.id) && <CheckCircle2 size={16} className="text-white" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: METADATA & ACTIONS */}
                        <div className="lg:w-[320px] flex flex-col gap-5 shrink-0 min-h-0">
                            {/* Prep Flags: Notes & Allergies */}
                            <div className="space-y-4">
                                {order.notes && (
                                    <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-amber-500 p-2 rounded-xl text-white">
                                                <AlertCircle size={20} />
                                            </div>
                                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Order Notes</span>
                                        </div>
                                        <p className="text-xl font-bold text-slate-800 leading-tight">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}

                                {order.allergies && order.allergies.length > 0 && (
                                    <div className="bg-red-50 p-6 rounded-[2rem] border-2 border-red-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Allergy Alerts</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {order.allergies.map((allergy, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-white border border-red-200 text-red-600 text-[11px] font-bold rounded-lg uppercase">
                                                    {allergy}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Identity Card */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4">Channel Details</h4>
                                    <div className="grid grid-cols-2 gap-y-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-gray-300 uppercase">Elapsed</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                {(() => {
                                                    const elapsed = Date.now() - new Date(order.createdAt).getTime();
                                                    const m = Math.floor(elapsed / 60000);
                                                    const s = Math.floor((elapsed % 60000) / 1000);
                                                    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                                })()}
                                                <span className="text-xs ml-1">MIN</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[9px] font-bold text-gray-300 uppercase">Channel</span>
                                            <span className="text-lg font-bold text-gray-900 uppercase">{order.order_source}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-gray-300 uppercase">Service</span>
                                            <span className="text-lg font-bold text-gray-900 uppercase">{order.fulfillment_type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[9px] font-bold text-gray-300 uppercase">Items</span>
                                            <span className="text-lg font-bold text-gray-900">{order.items.length}</span>
                                        </div>
                                    </div>

                                    <KDSPermissionGuard permission="KDS.STAGE_UPDATE">
                                        <div className="mt-6 pt-6 border-t border-gray-50">
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Manual Stage Override</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(['NEW', 'ACCEPTED', 'PREPARING', 'READY'] as KitchenStage[]).map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleOverrideStage(s)}
                                                        className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${order.stage === s
                                                            ? 'bg-black text-white'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </KDSPermissionGuard>
                                </div>

                                <div className="pt-8 border-t border-gray-100">
                                    <KDSPermissionGuard permission="KDS.STAGE_UPDATE">
                                        <button
                                            onClick={() => {
                                                if (order.stage === 'NEW') {
                                                    handleAccept();
                                                } else if (order.stage === 'READY') {
                                                    advanceStage(order.id);
                                                    // Req 8.3: Auto-trigger COMPLETED status update
                                                    sendStatusUpdate(order.id, 'COMPLETED', 'LINK_ONLY', undefined, undefined, true);
                                                    setStatusPanelTrigger('COMPLETED');
                                                    setActivePanel('STATUS');
                                                    setShouldCloseAfterMessage(true);
                                                } else {
                                                    handleFulfill();
                                                }
                                            }}
                                            className={`w-full h-20 rounded-3xl font-black text-xl uppercase shadow-2xl transition-all active:scale-[0.98] ${order.stage === 'NEW'
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : order.stage === 'READY'
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-black text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            {order.stage === 'NEW'
                                                ? 'Accept Order (10m Prep)'
                                                : order.stage === 'READY'
                                                    ? 'Complete Order'
                                                    : selectedItemIds.size > 0 ? `Fulfill Selected (${selectedItemIds.size})` : 'Fulfill All Items'}
                                        </button>
                                    </KDSPermissionGuard>
                                    <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest mt-4">
                                        Order will move to READY status upon fulfillment
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* DYNAMIC PANEL COLUMN (Status/Messaging) */}
                        {activePanel !== 'NONE' && (
                            <div className="lg:w-[380px] flex flex-col bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-xl animate-in slide-in-from-right duration-500 shrink-0">
                                {activePanel === 'STATUS' && (
                                    <CustomerStatusPanel
                                        isOpen={true}
                                        order={order}
                                        onClose={() => setActivePanel('NONE')}
                                        initialTrigger={statusPanelTrigger}
                                        isEmbedded={true}
                                    />
                                )}
                                {activePanel === 'MESSAGING' && (
                                    <CustomerMessagingModal
                                        isOpen={true}
                                        order={order}
                                        onClose={handleMessageClose}
                                        onSend={handleSendMessage}

                                        role={role as any}
                                        initialTemplate={messagingTemplate}
                                        isEmbedded={true}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {AuthModalElement}
                <DelayOrderModal
                    isOpen={isDelayModalOpen}
                    onClose={() => setIsDelayModalOpen(false)}
                    onConfirm={handleDelayConfirm}
                    orderNumber={order.orderNumber}
                />
            </div>
        </div>,
        document.body
    );
};
