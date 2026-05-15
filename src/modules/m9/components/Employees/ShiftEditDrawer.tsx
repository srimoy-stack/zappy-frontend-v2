'use client';

import React, { useState, useEffect } from 'react';
import { Shift } from '../../types/employees';
import { X, DollarSign, FileText, Save, Info } from 'lucide-react';
import { format } from 'date-fns';

interface ShiftEditDrawerProps {
    shift: Shift | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedShift: Shift) => void;
    canEdit: boolean;
}

export const ShiftEditDrawer: React.FC<ShiftEditDrawerProps> = ({
    shift,
    isOpen,
    onClose,
    onSave,
    canEdit
}) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (shift) {
            setNotes(shift.notes || '');
        }
    }, [shift, isOpen]);

    if (!shift || !isOpen) return null;

    const handleSave = () => {
        onSave({ ...shift, notes });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                {canEdit ? 'Edit Shift Record' : 'Shift Details'}
                            </h2>
                            {!canEdit && <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded uppercase">Read Only</span>}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-8">
                            {/* Shift Info */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</p>
                                        <p className="text-sm font-bold text-slate-900">{shift.userName}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                        <p className="text-sm font-bold text-slate-900">{format(new Date(shift.date), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>

                                {/* Financial Values - DISPLAY ONLY PER SPEC */}
                                <div className="grid grid-cols-1 gap-4">
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        Cash Reconciliation (System Generated)
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <ValueBox label="Opening" value={shift.openingCash} />
                                        <ValueBox label="Closing" value={shift.closingCash} />
                                        <ValueBox
                                            label="Variance"
                                            value={shift.cashVariance}
                                            isVariance
                                        />
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                        <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-[11px] text-amber-700 leading-tight">
                                            Financial records are automatically calculated by the POS at shift close and cannot be modified.
                                        </p>
                                    </div>
                                </div>

                                {/* Editable Fields */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5" />
                                            Shift Notes
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            disabled={!canEdit}
                                            className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all disabled:opacity-60 resize-none"
                                            placeholder="Enter operational notes, incident reports, or reconciliation details..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {canEdit && (
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <button
                                onClick={handleSave}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-black/10"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ValueBox = ({ label, value, isVariance }: { label: string, value: number, isVariance?: boolean }) => (
    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{label}</p>
        <p className={`text-[13px] font-bold tabular-nums ${isVariance
            ? value > 0 ? 'text-emerald-600' : value < 0 ? 'text-rose-600' : 'text-slate-400'
            : 'text-slate-700'
            }`}>
            {isVariance && value > 0 ? '+' : ''}${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
    </div>
);
