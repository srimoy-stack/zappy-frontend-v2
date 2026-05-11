import React from 'react';
import { cn } from '@/utils';
import { ReportTableColumn } from '../../types/reports';
import { AlertCircle } from 'lucide-react';

interface ReportTableProps {
    columns: ReportTableColumn[];
    data: any[];
    isLoading: boolean;
    totals?: Record<string, any>;
}

export const ReportTable: React.FC<ReportTableProps> = ({
    columns,
    data,
    isLoading,
    totals
}) => {
    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center bg-white border border-slate-200 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-slate-50 rounded-full">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">No Data Available</h3>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters to see results.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse table-auto">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        "px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap",
                                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                    )}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                {columns.map((col) => (
                                    <td
                                        key={`${idx}-${col.key}`}
                                        className={cn(
                                            "px-4 py-3 text-xs font-medium text-slate-700 whitespace-nowrap",
                                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                                            // Highlight numeric values slightly
                                            col.align === 'right' && "font-bold text-slate-900"
                                        )}
                                    >
                                        {col.format ? col.format(row[col.key]) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    {totals && (
                        <tfoot className="bg-slate-100/50 border-t-2 border-slate-200">
                            <tr>
                                {columns.map((col) => (
                                    <td
                                        key={`total-${col.key}`}
                                        className={cn(
                                            "px-4 py-3 text-xs font-black text-slate-900 uppercase tracking-wide whitespace-nowrap",
                                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                        )}
                                    >
                                        {totals[col.key] !== undefined
                                            ? (col.format ? col.format(totals[col.key]) : totals[col.key])
                                            : (columns[0] && col.key === columns[0].key ? 'Totals' : '')}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};
