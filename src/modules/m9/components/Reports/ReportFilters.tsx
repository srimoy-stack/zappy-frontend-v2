import React from 'react';
import { Calendar, Store, Tag, Filter, RotateCcw } from 'lucide-react';
import { useRouteAccess } from '@/hooks/useRouteAccess';

interface ReportFiltersProps {
    onFilterChange: (filters: any) => void;
    filters: any;
    showStoreFilter?: boolean;
    showChannelFilter?: boolean;
    showItemFilter?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
    onFilterChange,
    filters,
    showStoreFilter = true,
    showChannelFilter = true
}) => {
    const { role } = useRouteAccess();
    const isAdmin = role === 'ADMIN';

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-widest">Report Filters</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range - MANDATORY */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Date Range:</label>
                    <div className="flex items-center gap-2 px-3 h-10 bg-slate-50 border border-slate-200 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none w-full"
                        />
                        <span className="text-slate-300">-</span>
                        <input
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none w-full"
                        />
                    </div>
                </div>

                {/* Store Filter - Only for Admin */}
                {showStoreFilter && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Store:</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <select
                                disabled={!isAdmin}
                                value={filters.storeId || ''}
                                onChange={(e) => onFilterChange({ ...filters, storeId: e.target.value })}
                                className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                            >
                                <option value="">All Stores</option>
                                <option value="store-01">Flagship Store</option>
                                <option value="store-02">Warehouse Ops</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Channel Filter */}
                {showChannelFilter && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Channel:</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={filters.channel?.[0] || ''}
                                onChange={(e) => onFilterChange({ ...filters, channel: e.target.value ? [e.target.value] : [] })}
                                className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="">All Channels</option>
                                <option value="POS">POS</option>
                                <option value="ONLINE">Online</option>
                                <option value="UBER">Uber Eats</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-end gap-2">
                    <button
                        onClick={() => onFilterChange({ startDate: null, endDate: null, storeId: '', channel: [] })}
                        className="flex h-10 items-center gap-2 px-4 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};
