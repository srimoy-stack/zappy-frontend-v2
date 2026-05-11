import React from 'react';
import { X, Receipt, Building2, Calendar, CreditCard, BadgeCheck, ArrowUpRight } from 'lucide-react';
import { PaymentRecord, RefundRecord } from '../../types/finances';
import { formatCurrency, cn } from '@/utils';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: PaymentRecord | RefundRecord | null;
    type: 'payment' | 'refund';
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction,
    type
}) => {
    if (!isOpen || !transaction) return null;

    const isPayment = type === 'payment';
    const data = transaction as any; // Type assertion for shared/specific fields

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden m-4 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                            isPayment ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        )}>
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                                {isPayment ? 'Payment Details' : 'Refund Details'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400">{data.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Amount Hero */}
                    <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                        <h2 className={cn(
                            "text-3xl font-black tracking-tight",
                            isPayment ? "text-slate-900" : "text-rose-600"
                        )}>
                            {isPayment ? '' : '-'}{formatCurrency(data.amount || data.grossAmount)}
                        </h2>
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            isPayment && data.status === 'Paid' ? "bg-emerald-50 text-emerald-700" :
                                isPayment && data.status === 'Pending' ? "bg-amber-50 text-amber-700" :
                                    !isPayment ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
                        )}>
                            <BadgeCheck className="w-3 h-3" />
                            {isPayment ? data.status : (data.type + ' Refund')}
                        </div>
                    </div>

                    {/* Grid Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Building2 className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Store Location</span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate">{data.store}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Date & Time</span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate">{data.date}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Receipt className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Order Reference</span>
                            </div>
                            <button className="flex items-center gap-1 text-xs font-black text-blue-600 hover:underline">
                                {data.orderNumber}
                                <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                        {isPayment && (
                            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Method</span>
                                </div>
                                <p className="text-xs font-bold text-slate-900">{data.method}</p>
                            </div>
                        )}
                        {!isPayment && (
                            <div className="p-3 bg-slate-50 rounded-xl space-y-1 col-span-2">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Approval</span>
                                </div>
                                <p className="text-xs font-bold text-slate-900">Approved by {data.approvedBy}</p>
                            </div>
                        )}
                    </div>

                    {/* Financial Breakdown (For Payments) */}
                    {isPayment && (
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                                Fee Breakdown
                            </h4>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Gross Amount</span>
                                <span className="font-bold text-slate-900">{formatCurrency(data.grossAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Processing Fee</span>
                                <span className="font-bold text-rose-500">-{formatCurrency(data.fee)}</span>
                            </div>
                            <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Net Payout</span>
                                <span className="text-sm font-black text-emerald-600">{formatCurrency(data.netAmount)}</span>
                            </div>
                        </div>
                    )}

                    {!isPayment && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                            <h4 className="text-[11px] font-black text-rose-800 uppercase tracking-wide mb-1">
                                Refund Reason
                            </h4>
                            <p className="text-xs font-medium text-rose-700">{data.reason}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                    {isPayment && data.status === 'Paid' && (
                        <button
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-black/10"
                            onClick={() => alert("Printing receipt...")}
                        >
                            Print Receipt
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
