import React, { useState } from 'react';
import { 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Building2, 
    Smartphone, 
    UserCheck, 
    Clock, 
    Activity,
    MoreHorizontal
} from 'lucide-react';
import { StoreInfo } from '../../types/dashboard';
import { formatCurrency, cn } from '@/utils';

interface StorePerformanceProps {
    stores: StoreInfo[];
    onPingPOS: (storeId: string) => void;
    onMuteAlerts: (storeId: string) => void;
    onRestartNode: (storeId: string) => void;
    isLoading: boolean;
}

export const StorePerformance: React.FC<StorePerformanceProps> = ({
    stores,
    onPingPOS,
    onMuteAlerts,
    onRestartNode,
    isLoading
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const itemsPerPage = 3;

    // Filters
    const filteredStores = stores.filter((store) => {
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = 
            statusFilter === 'all' || 
            (statusFilter === 'online' && store.status === 'online') || 
            (statusFilter === 'offline' && store.status === 'offline');
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
    const paginatedStores = filteredStores.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusBadge = (status: StoreInfo['status']) => {
        switch (status) {
            case 'online':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                    </span>
                );
            case 'offline':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Offline
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Degraded
                    </span>
                );
        }
    };

    const getHealthScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 75) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Filter Bar */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-indigo-500" /> Store Performance Matrix
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-tight">Active operations by physical outlet</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search store..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9 pr-4 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 w-52 transition-all"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                            onClick={() => {
                                setStatusFilter('all');
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                                statusFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => {
                                setStatusFilter('online');
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                                statusFilter === 'online' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Online
                        </button>
                        <button
                            onClick={() => {
                                setStatusFilter('offline');
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                                statusFilter === 'offline' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Offline
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/20">
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Store Outlet</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Orders</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Kitchen Load</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Health score</th>
                            <th className="px-6 py-4.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            [1, 2, 3].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-slate-50 rounded w-full" /></td>
                                </tr>
                            ))
                        ) : paginatedStores.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No outlets match filter criteria</p>
                                </td>
                            </tr>
                        ) : (
                            paginatedStores.map((store) => (
                                <tr key={store.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 shadow-sm shrink-0 border border-slate-200">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-black text-slate-800">{store.name}</span>
                                                <div className="flex items-center gap-2 mt-0.5 text-[9px] font-semibold text-slate-400">
                                                    <span className="flex items-center gap-0.5"><UserCheck className="w-3 h-3" /> {store.activeStaff} Staff</span>
                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {store.prepTime}m Prep</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(store.revenue)}</span>
                                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5 uppercase">Gross</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-black text-slate-800">{store.orders}</span>
                                        <span className="text-[9px] font-bold text-rose-500 block mt-0.5 uppercase">
                                            {store.delayedOrders > 0 && `${store.delayedOrders} Delayed`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        store.prepTime > 12 ? "bg-amber-500" : "bg-emerald-500"
                                                    )}
                                                    style={{ width: `${Math.min(100, (store.orders / 150) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">POS Latency: {store.runtimeHealth.latency}ms</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(store.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider",
                                                getHealthScoreColor(store.healthScore)
                                            )}>
                                                {store.healthScore}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="relative inline-block">
                                            <button 
                                                onClick={() => setActiveDropdown(activeDropdown === store.id ? null : store.id)}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>

                                            {activeDropdown === store.id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                                                    <div className="absolute right-0 bottom-full mb-1 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-left p-1.5">
                                                        <button
                                                            onClick={() => {
                                                                onPingPOS(store.id);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-[9px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1.5"
                                                        >
                                                            <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Ping POS
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                onMuteAlerts(store.id);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-[9px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1.5"
                                                        >
                                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Mute Alerts
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                onRestartNode(store.id);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-[9px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1.5"
                                                        >
                                                            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Restart Node
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 bg-slate-50/30">
                <span>Showing {paginatedStores.length} of {filteredStores.length} Outlets</span>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || totalPages === 0}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>Page {currentPage} of {totalPages || 1}</span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
