import React from 'react';
import { RefundRecord } from '../../types/finances';
import { formatCurrency, cn } from '@/utils';
import { RotateCcw, UserCheck, AlertCircle } from 'lucide-react';

interface RefundsTableProps {
    data: RefundRecord[];
    isLoading?: boolean;
    onTransactionClick?: (record: RefundRecord) => void;
}

export const RefundsTable: React.FC<RefundsTableProps> = ({ data, isLoading, onTransactionClick }) => {
    if (isLoading) {
        return <div className="p-8 text-center text-slate-400">Loading refunds...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order #</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Refund Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Approved By</th>
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
                                <div className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                                    record.type === 'Full' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                )}>
                                    <RotateCcw className="w-3 h-3" />
                                    {record.type} Refund
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-rose-600 text-right">
                                -{formatCurrency(record.amount)}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">{record.reason}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                        <UserCheck className="w-3 h-3 text-slate-500" />
                                    </div>
                                    <span className="text-xs font-black text-slate-900">{record.approvedBy}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
