import React from 'react';
import { Download, Filter, ChevronDown, Calendar, Store, CreditCard } from 'lucide-react';
import { cn } from '@/utils';



interface FinancesHeaderProps {
    activeTab: 'payments' | 'refunds' | 'payouts';
    onTabChange: (tab: 'payments' | 'refunds' | 'payouts') => void;
    onExport: (format: 'csv' | 'excel' | 'pdf') => void;
    // New Filter Props
    paymentMethodFilter: string;
    onPaymentMethodFilterChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    storeFilter: string;
    onStoreFilterChange: (value: string) => void;
    dateRangeFilter: string;
    onDateRangeFilterChange: (value: string) => void;
    availableStores: string[];
}

export const FinancesHeader: React.FC<FinancesHeaderProps> = ({
    activeTab,
    onTabChange,
    onExport,
    paymentMethodFilter,
    onPaymentMethodFilterChange,
    statusFilter,
    onStatusFilterChange,
    storeFilter,
    onStoreFilterChange,
    dateRangeFilter,
    onDateRangeFilterChange,
    availableStores
}) => {
    const [showExportMenu, setShowExportMenu] = React.useState(false);

    return (
        <div className="space-y-6">
            {/* Page Title & Main Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finances</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Operational Money Management & Reconciliation
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export Data
                            <ChevronDown className={cn("w-3 h-3 transition-transform", showExportMenu && "rotate-180")} />
                        </button>

                        {showExportMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-1">
                                    <button
                                        onClick={() => { onExport('csv'); setShowExportMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                                    >
                                        Export as CSV
                                    </button>
                                    <button
                                        onClick={() => { onExport('excel'); setShowExportMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                                    >
                                        Export as Excel
                                    </button>
                                    <button
                                        onClick={() => { onExport('pdf'); setShowExportMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                                    >
                                        Export as PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-50/50 border border-slate-200 rounded-xl">
                {/* Date Filter */}
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors pointer-events-none">
                        <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <select
                        value={dateRangeFilter}
                        onChange={(e) => onDateRangeFilterChange(e.target.value)}
                        className="pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-400 transition-all appearance-none cursor-pointer hover:bg-slate-50"
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>

                {/* Store Filter */}
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Store className="w-3.5 h-3.5" />
                    </div>
                    <select
                        value={storeFilter}
                        onChange={(e) => onStoreFilterChange(e.target.value)}
                        className="pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-400 transition-all appearance-none cursor-pointer hover:bg-slate-50 min-w-[140px]"
                    >
                        <option value="all">All Stores</option>
                        {availableStores.map(store => (
                            <option key={store} value={store}>{store}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>

                <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                {/* Status Filter */}
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Filter className="w-3.5 h-3.5" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-400 transition-all appearance-none cursor-pointer hover:bg-slate-50"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>

                {/* Payment Method Filter */}
                {activeTab === 'payments' && (
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <select
                            value={paymentMethodFilter}
                            onChange={(e) => onPaymentMethodFilterChange(e.target.value)}
                            className="pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-400 transition-all appearance-none cursor-pointer hover:bg-slate-50"
                        >
                            <option value="all">All Methods</option>
                            <option value="Card">Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Wallet">Wallet</option>
                            <option value="Online">Online</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => onTabChange('payments')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-xs font-black transition-all",
                        activeTab === 'payments'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    Payments Ledger
                </button>
                <button
                    onClick={() => onTabChange('refunds')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-xs font-black transition-all",
                        activeTab === 'refunds'
                            ? "bg-white text-rose-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    Refunds
                </button>
                <button
                    onClick={() => onTabChange('payouts')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-xs font-black transition-all",
                        activeTab === 'payouts'
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    Payout Summary
                </button>
            </div>
        </div>
    );
};
