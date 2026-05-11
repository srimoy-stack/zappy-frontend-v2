import React from 'react';
import { CashVarianceRecord } from '../../types/cash-variance';
import { ChevronRight, AlertCircle, CheckCircle2, MinusCircle, Loader2 } from 'lucide-react';

interface CashVarianceTableProps {
    data: CashVarianceRecord[];
    isLoading: boolean;
    onRowClick: (record: CashVarianceRecord) => void;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export const CashVarianceTable: React.FC<CashVarianceTableProps> = ({
    data,
    isLoading,
    onRowClick,
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Balanced':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Over':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Short':
                return 'bg-rose-50 text-rose-700 border-rose-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getVarianceStyles = (variance: number) => {
        if (variance === 0) return 'text-slate-500';
        if (variance > 0) return 'text-emerald-600 font-bold';
        return 'text-rose-600 font-bold';
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 h-96 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading reconciliation data...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Store</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Opening Cash</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Closing Cash</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Expected Cash</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Variance</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick(row)}
                                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                                >
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-slate-900">{new Date(row.date).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{row.id}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-slate-700">{row.userName}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {row.storeName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-900 text-right font-mono">
                                        {formatCurrency(row.openingCash)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-900 text-right font-mono">
                                        {formatCurrency(row.closingCash)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-900 text-right font-mono">
                                        {formatCurrency(row.expectedCash)}
                                    </td>
                                    <td className={`px-4 py-3 text-sm text-right font-mono ${getVarianceStyles(row.variance)}`}>
                                        {row.variance > 0 ? '+' : ''}{formatCurrency(row.variance)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusStyles(row.status)}`}>
                                            {row.status === 'Balanced' && <CheckCircle2 className="w-3 h-3" />}
                                            {row.status === 'Over' && <AlertCircle className="w-3 h-3" />}
                                            {row.status === 'Short' && <MinusCircle className="w-3 h-3" />}
                                            {row.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="p-1.5 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-slate-50 rounded-full">
                                            <AlertCircle className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">No variance records found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                    Showing {data.length} of {totalItems} records
                </span>
                <div className="flex items-center gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-1 px-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onPageChange(i + 1)}
                                className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${currentPage === i + 1
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
