'use client';

import { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { ACTION_LABELS } from '../types/audit.types';
import {
    ScrollText, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Loader2,
    AlertTriangle, Clock, Activity, Calendar, X, Eye
} from 'lucide-react';

export default function AuditLogPage() {
    const {
        entries, summary, filters, page, totalPages, total,
        loading, error, setPage, updateFilters, clearFilters, refresh,
    } = useAuditLogs();
    const [selectedEntry, setSelectedEntry] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
    };

    const getActionInfo = (action: string) => {
        return ACTION_LABELS[action] || { label: action, color: '#94a3b8', icon: '📋' };
    };

    const hasActiveFilters = filters.action || filters.entity_type || filters.date_from || filters.date_to || filters.search;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <ScrollText className="text-indigo-600" size={28} />
                        Audit Trail
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Immutable record of all compliance-related actions
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                            showFilters || hasActiveFilters
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Filter size={16} />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                    </button>
                    <button
                        onClick={refresh}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Activity size={18} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{summary.total_entries.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Total Events</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Clock size={18} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{summary.today_entries.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Today</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Calendar size={18} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{summary.week_entries.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">This Week</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700 text-sm">Filter Audit Logs</h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                <X size={12} /> Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Search</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => updateFilters({ search: e.target.value })}
                                    placeholder="Search actions..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-400 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Action</label>
                            <select
                                value={filters.action}
                                onChange={(e) => updateFilters({ action: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-400 outline-none"
                            >
                                <option value="">All Actions</option>
                                {summary?.actions.map((a) => (
                                    <option key={a} value={a}>{getActionInfo(a).label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Entity Type</label>
                            <select
                                value={filters.entity_type}
                                onChange={(e) => updateFilters({ entity_type: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-400 outline-none"
                            >
                                <option value="">All Types</option>
                                {summary?.entity_types.map((t) => (
                                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Date Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => updateFilters({ date_from: e.target.value })}
                                    className="w-full px-2 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-400 outline-none"
                                />
                                <input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => updateFilters({ date_to: e.target.value })}
                                    className="w-full px-2 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-xl mb-6">
                    <AlertTriangle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                    <span className="ml-3 text-slate-500">Loading audit logs…</span>
                </div>
            ) : entries.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                    <ScrollText size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600">No audit entries found</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        {hasActiveFilters
                            ? 'Try adjusting your filters'
                            : 'Audit entries will appear here as compliance actions occur'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Entries Table */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actor</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => {
                                    const info = getActionInfo(entry.action);
                                    return (
                                        <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-lg">{info.icon}</span>
                                                    <span
                                                        className="text-xs font-bold px-2.5 py-1 rounded-lg"
                                                        style={{ backgroundColor: info.color + '15', color: info.color }}
                                                    >
                                                        {info.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {entry.entity_type}
                                                </span>
                                                {entry.entity_id && (
                                                    <span className="text-xs text-slate-400 ml-1.5">#{entry.entity_id}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                                                    entry.actor_type === 'system'
                                                        ? 'bg-slate-100 text-slate-600'
                                                        : entry.actor_type === 'webhook'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {entry.actor_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs text-slate-500">{formatDate(entry.created_at)}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                                    <button
                                                        onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                                                        className="text-indigo-500 hover:text-indigo-700 transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Metadata Drawer */}
                    {selectedEntry && (
                        <div className="mt-4 bg-slate-800 text-slate-100 rounded-2xl p-5 shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-slate-200">
                                    Metadata — {getActionInfo(selectedEntry.action).label}
                                </h4>
                                <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                            <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(selectedEntry.metadata, null, 2)}
                            </pre>
                            {selectedEntry.ip_address && (
                                <p className="text-xs text-slate-500 mt-3">IP: {selectedEntry.ip_address}</p>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-5">
                        <p className="text-sm text-slate-500">
                            Showing page {page} of {totalPages} ({total.toLocaleString()} total entries)
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page >= totalPages}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Immutability Notice */}
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="text-base">🔒</span>
                    <strong>Immutable Log:</strong> Audit entries cannot be modified or deleted. All compliance actions are permanently recorded.
                </p>
            </div>
        </div>
    );
}
