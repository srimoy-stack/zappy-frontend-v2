import React from 'react';
import { PaymentRecord } from '../../types/finances';
import { formatCurrency, cn } from '@/utils';
import { CreditCard, Banknote, Wallet, Globe, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface PaymentsLedgerTableProps {
    data: PaymentRecord[];
    isLoading?: boolean;
    onTransactionClick?: (record: PaymentRecord) => void;
}

export const PaymentsLedgerTable: React.FC<PaymentsLedgerTableProps> = ({ data, isLoading, onTransactionClick }) => {
    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'Card': return <CreditCard className="w-3.5 h-3.5" />;
            case 'Cash': return <Banknote className="w-3.5 h-3.5" />;
            case 'Wallet': return <Wallet className="w-3.5 h-3.5" />;
            case 'Online': return <Globe className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Paid': return <CheckCircle2 className="w-3 h-3" />;
            case 'Pending': return <Clock className="w-3 h-3" />;
            case 'Failed': return <XCircle className="w-3 h-3" />;
            default: return null;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400">Loading ledger...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order #</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Fee</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Net</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {data.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4 text-xs font-bold text-slate-500">{record.date}</td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => onTransactionClick?.(record)}
                                    className="text-xs font-black text-blue-600 hover:underline decoration-2"
                                >
                                    {record.orderNumber}
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg w-fit">
                                    {getMethodIcon(record.method)}
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{record.method}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                                    getStatusStyles(record.status)
                                )}>
                                    {getStatusIcon(record.status)}
                                    {record.status}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">{formatCurrency(record.grossAmount)}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-400 text-right">{formatCurrency(record.fee)}</td>
                            <td className="px-6 py-4 text-sm font-black text-emerald-600 text-right">{formatCurrency(record.netAmount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
