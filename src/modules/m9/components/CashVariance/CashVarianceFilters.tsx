import React from 'react';
import { Calendar, Store, Filter, RotateCcw } from 'lucide-react';
import { CashVarianceFilters as Filters } from '../../types/cash-variance';
import { useRouteAccess } from '@/hooks/useRouteAccess';

interface CashVarianceFiltersProps {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
    onClear: () => void;
}

export const CashVarianceFilters: React.FC<CashVarianceFiltersProps> = ({
    filters,
    onFilterChange,
    onClear
}) => {
    const { role } = useRouteAccess();
    const isAdmin = role === 'ADMIN';

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">Audit Filters</span>
                </div>
                <button
                    onClick={onClear}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Date Range */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                        />
                        <input
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                        />
                    </div>
                </div>

                {/* Store Selector (Admin Only) */}
                {isAdmin && (
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5" />
                            Store
                        </label>
                        <select
                            value={filters.storeId || ''}
                            onChange={(e) => onFilterChange({ ...filters, storeId: e.target.value || undefined })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all appearance-none"
                        >
                            <option value="">All Stores</option>
                            <option value="store-01">Downtown Store</option>
                            <option value="store-02">Westside Mall</option>
                        </select>
                    </div>
                )}

                {/* Status Selector */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5" />
                        Variance Status
                    </label>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange({ ...filters, status: (e.target.value as any) || undefined })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all appearance-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="Balanced">Balanced</option>
                        <option value="Over">Over</option>
                        <option value="Short">Short</option>
                    </select>
                </div>

                {/* Variance Only Toggle */}
                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={filters.varianceOnly}
                                onChange={(e) => onFilterChange({ ...filters, varianceOnly: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                            Show Variances Only
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};
