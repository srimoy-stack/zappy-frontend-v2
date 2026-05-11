import React from 'react';
import { PayoutRecord } from '../../types/finances';
import { formatCurrency, cn } from '@/utils';
import { Calendar } from 'lucide-react';

interface PayoutSummaryTableProps {
    data: PayoutRecord[];
    isLoading?: boolean;
}

export const PayoutSummaryTable: React.FC<PayoutSummaryTableProps> = ({ data, isLoading }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400">Loading payout summary...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Period</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Gross</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Fees</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Refunds</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Net Paid Out</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {data.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-black text-slate-900 tracking-tight">{record.period}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-500 text-right">{formatCurrency(record.gross)}</td>
                            <td className="px-6 py-4 text-xs font-bold text-rose-400 text-right">-{formatCurrency(record.fees)}</td>
                            <td className="px-6 py-4 text-xs font-bold text-rose-400 text-right">-{formatCurrency(record.refunds)}</td>
                            <td className="px-6 py-4 text-base font-black text-slate-900 text-right tracking-tighter">{formatCurrency(record.netPaidOut)}</td>
                            <td className="px-6 py-4">
                                <div className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                                    getStatusStyles(record.status)
                                )}>
                                    {record.status}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
