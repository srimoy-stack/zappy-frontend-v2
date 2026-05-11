import React from 'react';
import { formatCurrency } from '@/utils';
import { SalesChannel } from '../../types/dashboard';
import { EmptyState } from '@/components/feedback';

interface SalesByChannelTableProps {
    data: SalesChannel[];
    isLoading?: boolean;
}

export const SalesByChannelTable: React.FC<SalesByChannelTableProps> = ({
    data,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white divide-y divide-slate-100">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 animate-pulse">
                        <div className="h-4 bg-slate-50 rounded w-24"></div>
                        <div className="h-4 bg-slate-50 rounded w-12 ml-auto"></div>
                        <div className="h-4 bg-slate-50 rounded w-20"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white">
                <EmptyState
                    title="No sales data"
                    description="Sales data will appear here"
                />
            </div>
        );
    }

    return (
        <div className="bg-white">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Channel
                        </th>
                        <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Orders
                        </th>
                        <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Sales
                        </th>
                        <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Spread
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.map((row) => (
                        <tr key={row.channel} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-tight">
                                {row.channel}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-500 text-right">
                                {row.orders}
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-slate-900 text-right tracking-tight">
                                {formatCurrency(row.sales)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className="text-[11px] font-black text-blue-600">{row.percentage.toFixed(1)}%</span>
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${row.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
