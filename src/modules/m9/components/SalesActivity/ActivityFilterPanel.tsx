import React from 'react';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { ActivityFilters, PaymentStatus, SalesChannel } from '../../types/sales-activity';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

interface ActivityFilterPanelProps {
    filters: ActivityFilters;
    onFilterChange: (filters: ActivityFilters) => void;
    onClear: () => void;
}

export const ActivityFilterPanel: React.FC<ActivityFilterPanelProps> = ({
    filters,
    onFilterChange,
    onClear
}) => {
    const { role } = useRouteAccess();
    const isAdmin = role === 'ADMIN';

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Filters</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Row 1 */}
                <FilterField label="Business Location">
                    <select
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        disabled={!isAdmin}
                    >
                        <option>All</option>
                        <option>Flagship Store</option>
                        <option>Warehouse Ops</option>
                    </select>
                </FilterField>

                <FilterField label="Customer">
                    <select className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option>All</option>
                    </select>
                </FilterField>

                <FilterField label="Payment Status">
                    <select
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={filters.paymentStatus?.[0] || ''}
                        onChange={(e) => onFilterChange({ ...filters, paymentStatus: e.target.value ? [e.target.value as PaymentStatus] : undefined })}
                    >
                        <option value="">All</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                        <option value="Due">Due</option>
                        <option value="Refunded">Refunded</option>
                    </select>
                </FilterField>

                <FilterField label="Date Range">
                    <div className="flex items-center gap-2 px-3 h-10 bg-slate-50 border border-slate-200 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="01/01/2023 - 31/12/2023"
                            className="bg-transparent text-xs font-medium focus:outline-none w-full placeholder:text-slate-300"
                            readOnly
                        />
                    </div>
                </FilterField>

                {/* Row 2 */}
                <FilterField label="User">
                    <select className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option>All</option>
                    </select>
                </FilterField>

                <FilterField label="Shipping Status">
                    <select className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option>All</option>
                    </select>
                </FilterField>

                <FilterField label="Payment Method">
                    <select className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option>All</option>
                        <option>Cash</option>
                        <option>Card</option>
                        <option>Online</option>
                    </select>
                </FilterField>

                <FilterField label="Order Source">
                    <select
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={filters.channel?.[0] || ''}
                        onChange={(e) => onFilterChange({ ...filters, channel: e.target.value ? [e.target.value as SalesChannel] : [] })}
                    >
                        <option value="">All</option>
                        <option value="POS">POS</option>
                        <option value="ONLINE">Online</option>
                        <option value="UBER">Uber Eats</option>
                        <option value="PHONE">Phone</option>
                    </select>
                </FilterField>

                <div className="flex items-end justify-end">
                    <button
                        onClick={onClear}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};

const FilterField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}:</label>
        <div className="relative">
            {children}
        </div>
    </div>
);
