import React from 'react';
import { X, Clock, MapPin, User, Hash, CreditCard, Tag, AlertCircle } from 'lucide-react';
import { TransactionEvent } from '../../types/sales-activity';
import { formatCurrency } from '@/utils';
import { cn } from '@/utils';

interface TransactionDetailModalProps {
    transaction: TransactionEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    transaction,
    isOpen,
    onClose
}) => {
    if (!isOpen || !transaction) return null;

    const isRefund = transaction.type === 'REFUND' || transaction.type === 'PARTIAL_REFUND';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Transaction Details</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Audit Log ID: {transaction.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Main Info */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border mb-2 inline-block",
                                isRefund
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            )}>
                                {transaction.type.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-2 text-slate-900 font-black text-2xl">
                                {formatCurrency(transaction.totalAmount)}
                                <span className="text-xs font-medium text-slate-400 mt-1">{transaction.currency}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                            <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-black text-slate-600 uppercase tracking-wider shadow-sm">
                                {transaction.status}
                            </span>
                        </div>
                    </div>

                    {/* Audit Details */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <DetailItem icon={Clock} label="Timestamp" value={transaction.timestamp} />
                        <DetailItem icon={Hash} label="Invoice No." value={transaction.invoiceNo} />
                        <DetailItem icon={MapPin} label="Location" value={transaction.location} />
                        <DetailItem icon={User} label="User/Employee" value={transaction.userName || 'System'} />
                        <DetailItem icon={Tag} label="Channel" value={transaction.channel} />
                        <DetailItem icon={CreditCard} label="Payment Method" value={transaction.paymentMethod || '—'} />
                    </div>

                    {/* Linked Record Section */}
                    {transaction.originalTransactionId && (
                        <div className="mt-4 p-4 border border-blue-100 bg-blue-50/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-blue-900">Referenced Payment</p>
                                <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                                    This transaction is a refund for payment processed under Transaction ID:
                                    <span className="font-mono ml-1">{transaction.originalTransactionId}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest"
                    >
                        Close Detail
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex gap-3">
        <div className="p-2 bg-slate-50 rounded-lg shrink-0 border border-slate-100">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{label}</span>
            <span className="text-xs font-bold text-slate-700 block truncate">{value}</span>
        </div>
    </div>
);
