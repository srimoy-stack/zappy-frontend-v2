'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Scale } from 'lucide-react';
import { InventoryItem } from '../../types/inventory';
import { inventoryItemService } from '../../services/inventoryService';
import { useToast } from '../../../shop/context/ToastContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    item: InventoryItem;
}

export const SelfAdjustModal: React.FC<Props> = ({ isOpen, onClose, onSave, item }) => {
    const { showToast } = useToast();
    const [adjustedQuantity, setAdjustedQuantity] = useState<string>(item.currentStock.toString());
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setAdjustedQuantity(item.currentStock.toString());
            setReason('');
            setError(null);
        }
    }, [isOpen, item]);

    const validate = (): string | null => {
        const val = parseFloat(adjustedQuantity);
        if (isNaN(val)) return 'Adjusted quantity must be a number';
        if (val < 0) return 'Adjusted quantity cannot be negative';
        if (val === item.currentStock) return 'Adjusted quantity is the same as system quantity';
        return null;
    };

    const handleSave = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await inventoryItemService.selfAdjustStock(
                item.id,
                parseFloat(adjustedQuantity),
                reason,
                'USER001', // Mock user
                'Admin User' // Mock user name
            );
            showToast('Inventory adjusted successfully', 'success');
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to adjust inventory');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-violet-600 rounded-2xl shadow-lg shadow-violet-200">
                            <Scale size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Self Adjust</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Manual Stock Correction</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle size={18} className="shrink-0" />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Item Name (Read-only) */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Item Name</label>
                            <div className="text-base font-black text-slate-900">{item.name}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* System Quantity (Read-only) */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">System Quantity</label>
                                <div className="text-lg font-black text-slate-400 tabular-nums">
                                    {item.currentStock.toFixed(2)} <span className="text-xs font-bold text-slate-400">{item.baseUnit}</span>
                                </div>
                            </div>

                            {/* Unit (Read-only) */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Unit</label>
                                <div className="text-lg font-black text-slate-900">{item.baseUnit}</div>
                            </div>
                        </div>

                        {/* Adjusted Quantity (Editable) */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Adjusted Quantity *</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="any"
                                    value={adjustedQuantity}
                                    onChange={(e) => setAdjustedQuantity(e.target.value)}
                                    className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xl font-black text-slate-900 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:text-slate-200"
                                    placeholder="0.00"
                                    autoFocus
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 uppercase tracking-widest pointer-events-none">
                                    {item.baseUnit}
                                </div>
                            </div>
                            <p className="mt-2 text-[11px] text-slate-400 font-bold italic px-1">
                                Caution: This will overwrite the current system inventory.
                            </p>
                        </div>

                        {/* Reason (Optional) */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Reason / Note</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all resize-none min-h-[100px]"
                                placeholder="Why are you adjusting this stock?"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/30">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-2xl transition-all border border-transparent hover:border-slate-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || adjustedQuantity === '' || parseFloat(adjustedQuantity) === item.currentStock}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-none"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} strokeWidth={2.5} />
                                Save Adjustment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
