'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (minutes: number, reason?: string) => void;
    orderNumber: string;
}

export const DelayOrderModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, orderNumber }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [minutes, setMinutes] = useState<number>(5);
    const [customMinutes, setCustomMinutes] = useState<string>('');
    const [reason, setReason] = useState<string>('');

    if (!isOpen || !mounted) return null;

    const handleConfirm = () => {
        const finalMinutes = customMinutes ? parseInt(customMinutes) : minutes;
        if (isNaN(finalMinutes) || finalMinutes <= 0) {
            alert('Please enter a valid delay time');
            return;
        }
        onConfirm(finalMinutes, reason || undefined);
        onClose();
        // Reset local state
        setCustomMinutes('');
        setReason('');
    };

    const presets = [5, 10, 15, 20, 30];

    return createPortal(
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white">
                    <h2 className="text-2xl font-black tracking-tight">Delay Order #{orderNumber}</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Adjust preparation time</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Preset Buttons */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Delay (Minutes)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {presets.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        setMinutes(p);
                                        setCustomMinutes('');
                                    }}
                                    className={`h-14 rounded-xl font-black text-lg transition-all ${minutes === p && !customMinutes
                                        ? 'bg-[#1FA4A9] text-white shadow-lg scale-105'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    +{p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Input */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Custom Amount</label>
                        <input
                            type="number"
                            placeholder="Enter minutes..."
                            value={customMinutes}
                            onChange={(e) => {
                                setCustomMinutes(e.target.value);
                                setMinutes(0);
                            }}
                            className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA4A9] outline-none font-bold text-lg transition-all"
                        />
                    </div>

                    {/* Reason Field */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for Delay (Optional)</label>
                        <textarea
                            placeholder="e.g. Kitchen backup, missing ingredient..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full h-24 p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA4A9] outline-none font-medium text-sm transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-sm text-slate-500 hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-[2] h-14 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        Confirm Delay
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
