'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, History, RotateCcw, Search, Clock, PackageCheck } from 'lucide-react';
import { useKDSStore } from '../../store/kdsStore';
import { useKDSActionAuth } from '../../hooks/useKDSActionAuth';


interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { fulfilledOrders, recallFulfilledOrder } = useKDSStore();
    const { requireAuth, AuthModalElement } = useKDSActionAuth();
    const [searchQuery, setSearchQuery] = useState('');


    if (!isOpen || !mounted) return null;

    const filteredOrders = fulfilledOrders.filter(order =>
        order.orderNumber.includes(searchQuery) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleRecall = (orderId: string) => {
        requireAuth('Recall Order', () => {
            recallFulfilledOrder(orderId);
        });
    };


    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/60 backdrop-blur-md"
                onClick={onClose}
            />


            <div className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-xl flex flex-col max-h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
                                <History size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Fulfillment History</h2>
                                <p className="text-gray-400 text-[10px] font-bold uppercase leading-none">Recently completed orders</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH BY ORDER # OR NAME..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-gray-900 font-bold uppercase text-[11px] h-10 focus:ring-1 focus:ring-black transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <PackageCheck size={48} className="mb-4" />
                            <p className="font-bold uppercase text-[10px]">No records found</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="group bg-white border border-gray-100 p-4 rounded-lg flex items-center justify-between hover:border-gray-300 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Order</span>
                                        <span className="text-lg font-bold text-gray-900 leading-tight">#{order.orderNumber}</span>
                                    </div>

                                    <div className="h-8 w-px bg-gray-100" />

                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Customer</span>
                                        <span className="text-[11px] font-bold text-gray-800 uppercase">{order.customerName || 'Guest'}</span>
                                    </div>

                                    <div className="h-8 w-px bg-gray-100" />

                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Done At</span>
                                        <div className="flex items-center gap-1.5 text-gray-900 font-bold text-[11px]">
                                            <Clock size={12} className="text-gray-400" />
                                            {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRecall(order.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold uppercase text-[10px] transition-all hover:bg-gray-800"
                                >
                                    <RotateCcw size={14} />
                                    Recall
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-900 font-bold uppercase text-[10px] rounded hover:bg-gray-50 transition-colors"
                    >
                        Close History
                    </button>
                </div>
            </div>
            {AuthModalElement}
        </div>,
        document.body
    );
};

