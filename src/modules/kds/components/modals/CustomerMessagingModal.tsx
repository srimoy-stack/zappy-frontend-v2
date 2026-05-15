'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { KDSOrder } from '../../types/kds';
import { Mail, MessageSquare, Send, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    order: KDSOrder;
    onClose: () => void;
    onSend: (channel: 'SMS' | 'EMAIL' | 'BOTH', message: string) => void;
    role?: 'KDS_USER' | 'STORE_MANAGER';
    initialTemplate?: TemplateKey;
    isEmbedded?: boolean;
}

type TemplateKey = 'ACCEPTED' | 'PREPARING' | 'DELAYED' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'CUSTOM';

export const CustomerMessagingModal: React.FC<Props> = ({ isOpen, order, onClose, onSend, role = 'KDS_USER', initialTemplate, isEmbedded = false }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [channel, setChannel] = useState<'SMS' | 'EMAIL' | 'BOTH'>('SMS');
    const [template, setTemplate] = useState<TemplateKey>(initialTemplate || 'ACCEPTED');
    const [message, setMessage] = useState('');

    const trackingUrl = `https://track.zyappy.com/${order.trackingToken}`;

    const templates: Record<TemplateKey, string> = {
        ACCEPTED: `Your order #${order.orderNumber} has been accepted and is being prepared. Est. ready in ${order.prepTimeMinutes} mins. Track here: ${trackingUrl}`,
        PREPARING: `Chef is working on your order #${order.orderNumber}. Follow live: ${trackingUrl}`,
        DELAYED: `Sorry, order #${order.orderNumber} is slightly delayed. New ETA: ${new Date(order.estimatedReadyTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Watch progress: ${trackingUrl}`,
        READY: `Great news! Order #${order.orderNumber} is ready for pickup! Link: ${trackingUrl}`,
        COMPLETED: `Order #${order.orderNumber} is picked up/delivered. Enjoy! Rate us here: ${trackingUrl}`,
        CANCELLED: `Order #${order.orderNumber} has been cancelled. Questions? Call us. Order link: ${trackingUrl}`,
        CUSTOM: '',
    };

    useEffect(() => {
        if (template !== 'CUSTOM') {
            setMessage(templates[template]);
        }
    }, [template, order.estimatedReadyTime]);

    if (!isOpen || !mounted) return null;

    const canEditCustom = role === 'STORE_MANAGER';

    const handleSend = () => {
        if (!message.trim()) {
            alert('Message cannot be empty');
            return;
        }
        onSend(channel, message);
        onClose();
    };

    const content = (
        <div className={`bg-white h-full flex flex-col overflow-hidden ${isEmbedded ? '' : 'w-full max-w-lg rounded-2xl shadow-2xl transition-all'}`}>
            {/* Header */}
            <div className={`p-6 bg-slate-900 text-white flex justify-between items-center ${isEmbedded ? 'rounded-t-[2.5rem]' : ''}`}>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Messaging Center</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Order #{order.orderNumber}</p>
                </div>
                {!isEmbedded && (
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="p-6 space-y-6 overflow-y-auto grow">
                {/* Channel Selection */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Channel</label>
                    <div className="grid grid-cols-3 gap-3">
                        <ChannelButton
                            active={channel === 'SMS'}
                            onClick={() => setChannel('SMS')}
                            icon={<MessageSquare size={18} />}
                            label="SMS"
                        />
                        <ChannelButton
                            active={channel === 'EMAIL'}
                            onClick={() => setChannel('EMAIL')}
                            icon={<Mail size={18} />}
                            label="Email"
                        />
                        <ChannelButton
                            active={channel === 'BOTH'}
                            onClick={() => setChannel('BOTH')}
                            icon={<div className="flex gap-1"><MessageSquare size={14} /><Mail size={14} /></div>}
                            label="Both"
                        />
                    </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Template</label>
                    <select
                        value={template}
                        onChange={(e) => setTemplate(e.target.value as TemplateKey)}
                        className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA4A9] outline-none font-bold text-sm bg-slate-50 cursor-pointer"
                    >
                        <option value="ACCEPTED">Order Accepted</option>
                        <option value="PREPARING">In Preparation</option>
                        <option value="DELAYED">Order Delayed</option>
                        <option value="READY">Order Ready</option>
                        <option value="COMPLETED">Order Completed</option>
                        <option value="CANCELLED">Order Cancelled</option>
                        <option value="CUSTOM">Custom Message</option>
                    </select>
                </div>

                {/* Message Textarea */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Content</label>
                        {template === 'CUSTOM' && !canEditCustom && (
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">
                                Manager Approval Required
                            </span>
                        )}
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={template !== 'CUSTOM' || !canEditCustom}
                        placeholder={template === 'CUSTOM' ? "Type your custom message here..." : ""}
                        className={`w-full h-32 p-4 rounded-xl border-2 outline-none font-medium text-sm transition-all resize-none ${template === 'CUSTOM' && !canEditCustom
                            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-white border-slate-100 focus:border-[#1FA4A9]'
                            }`}
                    />
                </div>
                {/* Tracking Link Section */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Tracking Link</label>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={`https://track.zyappy.com/${order.trackingToken}`}
                            className="flex-1 h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 font-mono text-xs text-[#1FA4A9] outline-none"
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`https://track.zyappy.com/${order.trackingToken}`);
                                alert('Tracking link copied');
                            }}
                            className="px-4 bg-slate-200 text-slate-700 font-black rounded-xl uppercase text-[10px] hover:bg-slate-300 transition-all"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-sm text-slate-500 hover:bg-slate-200 transition-all"
                >
                    {isEmbedded ? 'Back' : 'Cancel'}
                </button>
                <button
                    onClick={handleSend}
                    className="flex-[2] h-14 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                    <Send size={18} />
                    Send Notification
                </button>
            </div>
        </div>
    );

    if (isEmbedded) return content;

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            {content}
        </div>,
        document.body
    );
};

const ChannelButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border-2 ${active
            ? 'bg-[#1FA4A9]/10 border-[#1FA4A9] text-[#1FA4A9]'
            : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
            }`}
    >
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);
