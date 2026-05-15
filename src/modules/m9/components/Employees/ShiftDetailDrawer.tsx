import React from 'react';
import { Shift } from '../../types/employees';
import { X, Calendar, User, Store, DollarSign, Calculator } from 'lucide-react';
import { format } from 'date-fns';

interface ShiftDetailDrawerProps {
    shift: Shift | null;
    onClose: () => void;
}

export const ShiftDetailDrawer: React.FC<ShiftDetailDrawerProps> = ({ shift, onClose }) => {
    if (!shift) return null;

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Shift Details</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-8">
                            {/* Shift Title */}
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <Calendar className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{format(new Date(shift.date), 'MMMM d, yyyy')}</h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase mt-1">
                                        Shift ID: {shift.id}
                                    </span>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="grid grid-cols-2 gap-6">
                                <ShiftInfoItem
                                    icon={<User className="w-4 h-4 text-slate-400" />}
                                    label="Assigned User"
                                    value={shift.userName}
                                />
                                <ShiftInfoItem
                                    icon={<Store className="w-4 h-4 text-slate-400" />}
                                    label="Store Location"
                                    value={shift.storeName}
                                />
                            </div>

                            {/* Cash Reconciliation Card */}
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                                <div className="bg-slate-100/50 px-4 py-3 border-b border-slate-200/60">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-slate-500" />
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cash Summary</span>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <CashRow label="Opening Cash" value={formatCurrency(shift.openingCash)} />
                                    <CashRow label="Closing Cash" value={formatCurrency(shift.closingCash)} />
                                    <div className="pt-3 border-t border-slate-200">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Calculator className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-900">Total Variance</span>
                                            </div>
                                            <span className={`text-sm font-bold tabular-nums ${shift.cashVariance > 0
                                                    ? 'text-emerald-600'
                                                    : shift.cashVariance < 0
                                                        ? 'text-rose-600'
                                                        : 'text-slate-600'
                                                }`}>
                                                {shift.cashVariance > 0 ? '+' : ''}
                                                {formatCurrency(shift.cashVariance)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Integrity Message */}
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                                    Shift data is finalized at closing and synced with the Cash Variance Report.
                                    This record is immutable and serves as the official audit soul.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShiftInfoItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {icon}
            {label}
        </div>
        <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
);

const CashRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-sm font-medium text-slate-700 tabular-nums">{value}</span>
    </div>
);
