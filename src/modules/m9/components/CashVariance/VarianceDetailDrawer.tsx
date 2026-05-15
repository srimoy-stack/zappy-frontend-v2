import React from 'react';
import {
    X,
    Calendar,
    User,
    Store,
    Info,
    Banknote,
    Layers,
    Clock,
    Hash,
    Receipt
} from 'lucide-react';
import { CashVarianceRecord } from '../../types/cash-variance';

interface VarianceDetailDrawerProps {
    record: CashVarianceRecord | null;
    isOpen: boolean;
    onClose: () => void;
}

export const VarianceDetailDrawer: React.FC<VarianceDetailDrawerProps> = ({
    record,
    isOpen,
    onClose
}) => {
    if (!record) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: record.currency || 'USD',
        }).format(amount);
    };

    const StatusBadge = () => {
        const styles = {
            'Balanced': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'Over': 'bg-blue-50 text-blue-700 border-blue-100',
            'Short': 'bg-rose-50 text-rose-700 border-rose-100',
        }[record.status];

        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles}`}>
                {record.status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Variance Audit</h2>
                            <StatusBadge />
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Hash className="w-3 h-3" />
                            Record ID: {record.id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Shift Metadata */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-4 bg-slate-900 rounded-full" />
                            Shift Metadata
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> Date
                                </span>
                                <p className="text-sm font-semibold text-slate-900">{new Date(record.date).toLocaleDateString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Timestamp
                                </span>
                                <p className="text-sm font-semibold text-slate-900">{new Date(record.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <User className="w-3 h-3" /> Assigned User
                                </span>
                                <p className="text-sm font-semibold text-slate-900">{record.userName}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Store className="w-3 h-3" /> Location
                                </span>
                                <p className="text-sm font-semibold text-slate-900">{record.storeName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reconciliation Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-4 bg-slate-900 rounded-full" />
                            Financial Breakdown
                        </h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                            {[
                                { label: 'Opening Cash', value: record.openingCash, icon: Banknote },
                                { label: 'Expected System Cash', value: record.expectedCash, icon: Info },
                                { label: 'Physical Closing Cash', value: record.closingCash, icon: Banknote, highlight: true },
                            ].map((item, idx) => (
                                <div key={idx} className={`p-4 flex items-center justify-between ${item.highlight ? 'bg-slate-50/50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                            <item.icon className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-mono font-bold text-slate-900">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                            <div className="p-4 bg-slate-900 flex items-center justify-between">
                                <span className="text-sm font-bold text-white uppercase tracking-wider">Final Variance</span>
                                <span className={`text-lg font-mono font-black ${record.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {record.variance > 0 ? '+' : ''}{formatCurrency(record.variance)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Breakdown (MOCK) */}
                    {record.paymentBreakdown && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-4 bg-slate-900 rounded-full" />
                                Payment Summary
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cash</p>
                                    <p className="text-sm font-bold text-slate-900">{formatCurrency(record.paymentBreakdown.cash)}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Card</p>
                                    <p className="text-sm font-bold text-slate-900">{formatCurrency(record.paymentBreakdown.card)}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Other</p>
                                    <p className="text-sm font-bold text-slate-900">{formatCurrency(record.paymentBreakdown.other)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audit Links */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-4 bg-slate-900 rounded-full" />
                            Audit Trail
                        </h3>
                        <div className="space-y-2">
                            <div className="p-4 border border-slate-100 rounded-xl flex items-center justify-between group hover:bg-slate-50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Receipt className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-600">Linked Sales Activity</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Read-Only</span>
                            </div>
                            <div className="p-4 border border-slate-100 rounded-xl flex items-center justify-between group hover:bg-slate-50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Layers className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-600">Shift Record (M9-T6)</span>
                                </div>
                                <span className="text-sm font-mono text-slate-400 font-medium">#{record.shiftId}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                        <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                            This record is immutable and locked for audit purposes.
                            Any discrepancies must be reported to the regional financial controller.
                            Calculations are performed by the core engine.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
