'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Download, ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { useCalls } from '../hooks/useCalls';
import { useStats } from '../hooks/useStats';
import { useAlerts } from '../hooks/useAlerts';
import { useDateRange } from '../components/DateRangeContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { DataStatusBar } from '../components/DataStatusBar';
import { AdvancedFilterBar } from '../components/AdvancedFilterBar';
import { InsightCards } from '../components/InsightCards';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonTable } from '../components/SkeletonTable';
import { exportCalls } from '../utils/exportCalls';
import { aiCallService } from '../services/aiCallService';
import type { CallFilters } from '../types/callAnalytics.types';

type SortKey = 'call_datetime' | 'duration_seconds' | 'sentiment' | 'success_status';
type SortDir = 'asc' | 'desc';

const SENTIMENT_ORDER = { positive: 3, neutral: 2, negative: 1 };
const SUCCESS_ORDER = { successful: 3, partial: 2, failed: 1 };

export default function CallsPage({ onViewDetail }: { onViewDetail?: (id: number) => void }) {
    const { dateFrom, dateTo } = useDateRange();
    const [filters, setFilters] = useState<CallFilters>({ page: 1, limit: 20 });
    const [sortKey, setSortKey] = useState<SortKey>('call_datetime');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [exportStatus, setExportStatus] = useState<'idle' | 'downloading' | 'done'>('idle');

    // Merge global date range into filters
    const mergedFilters = useMemo<CallFilters>(() => ({
        ...filters,
        date_from: filters.date_from || dateFrom || undefined,
        date_to: filters.date_to || dateTo || undefined,
    }), [filters, dateFrom, dateTo]);

    const { data: calls, meta, loading, isRefreshing, error, lastUpdated, refetch } = useCalls(mergedFilters);
    const { data: stats } = useStats({ date_from: mergedFilters.date_from, date_to: mergedFilters.date_to, location_id: mergedFilters.location_id });
    const { data: alerts } = useAlerts({ limit: 100 });

    // Reset page when global date changes
    useEffect(() => {
        setFilters((p) => ({ ...p, page: 1 }));
    }, [dateFrom, dateTo]);

    const toggleSort = useCallback((key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    }, [sortKey]);

    // Client-side sorting on the current page
    const sortedCalls = useMemo(() => {
        const sorted = [...calls];
        sorted.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case 'call_datetime':
                    cmp = new Date(a.call_datetime).getTime() - new Date(b.call_datetime).getTime();
                    break;
                case 'duration_seconds':
                    cmp = (a.duration_seconds ?? 0) - (b.duration_seconds ?? 0);
                    break;
                case 'sentiment':
                    cmp = (SENTIMENT_ORDER[a.sentiment] ?? 0) - (SENTIMENT_ORDER[b.sentiment] ?? 0);
                    break;
                case 'success_status':
                    cmp = (SUCCESS_ORDER[a.success_status] ?? 0) - (SUCCESS_ORDER[b.success_status] ?? 0);
                    break;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return sorted;
    }, [calls, sortKey, sortDir]);

    const totalPages = useMemo(() => Math.ceil(meta.total / meta.limit), [meta.total, meta.limit]);

    const fmt = (s: number | null) => {
        if (!s) return '—';
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    };
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
        return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-600" /> : <ArrowDown className="h-3 w-3 text-blue-600" />;
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Call Records</h1>
                    <p className="text-sm text-slate-500 mt-1">Browse, filter, and export analyzed calls</p>
                </div>
                <div className="flex items-center gap-2">
                    {exportStatus === 'done' && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium animate-fade-in">
                            <Check className="h-3.5 w-3.5" /> Download started
                        </span>
                    )}
                    <button
                        id="export-csv-btn"
                        onClick={() => {
                            setExportStatus('downloading');
                            const { url } = aiCallService.getExportUrl({
                                date_from: mergedFilters.date_from,
                                date_to: mergedFilters.date_to,
                                location_id: mergedFilters.location_id,
                                call_status: mergedFilters.call_status,
                                sentiment: mergedFilters.sentiment,
                                customer_intent: mergedFilters.customer_intent,
                                success_status: mergedFilters.success_status,
                            });
                            window.open(url, '_blank');
                            setExportStatus('done');
                            setTimeout(() => setExportStatus('idle'), 3000);
                        }}
                        disabled={exportStatus === 'downloading'}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                        <Download className="h-4 w-4" /> CSV (Full)
                    </button>
                    <button
                        id="export-json-btn"
                        onClick={() => exportCalls(calls, 'json')}
                        disabled={calls.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                        <Download className="h-4 w-4" /> JSON
                    </button>
                </div>
            </div>

            {/* Data Status Bar */}
            <DataStatusBar
                lastUpdated={lastUpdated}
                isRefreshing={isRefreshing}
                error={error}
                totalRecords={meta.total}
                onRefresh={refetch}
            />

            {/* Advanced Filter Bar */}
            <AdvancedFilterBar filters={filters} onChange={setFilters} />

            {/* Insight Cards */}
            <InsightCards stats={stats} alertCount={alerts.length} />

            {/* Error */}
            {error && <ErrorBanner message={error} onRetry={refetch} autoRetrySeconds={15} dismissible />}

            {/* Table */}
            {loading ? (
                <SkeletonTable rows={10} columns={10} />
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ minWidth: '860px' }}>
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 w-10"></th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Caller</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 cursor-pointer select-none" onClick={() => toggleSort('sentiment')}>
                                        <span className="flex items-center gap-1">Sentiment <SortIcon col="sentiment" /></span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 cursor-pointer select-none" onClick={() => toggleSort('success_status')}>
                                        <span className="flex items-center gap-1">Result <SortIcon col="success_status" /></span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 cursor-pointer select-none" onClick={() => toggleSort('duration_seconds')}>
                                        <span className="flex items-center gap-1">Duration <SortIcon col="duration_seconds" /></span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 cursor-pointer select-none" onClick={() => toggleSort('call_datetime')}>
                                        <span className="flex items-center gap-1">Date <SortIcon col="call_datetime" /></span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Ended</th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-600 w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCalls.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-16 text-center">
                                            <div className="text-slate-400">
                                                <p className="text-base font-medium">No calls found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters or check back later</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedCalls.map((call) => (
                                        <tr
                                            key={call.id}
                                            id={`call-row-${call.id}`}
                                            onClick={() => onViewDetail?.(call.id)}
                                            className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 py-3">
                                                <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                                                    call.status_color === 'green' ? 'bg-emerald-500' :
                                                    call.status_color === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                                                }`} />
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 font-medium text-xs">{call.caller_number || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                    call.call_type === 'inboundPhoneCall' ? 'bg-blue-50 text-blue-700' :
                                                    call.call_type === 'outboundPhoneCall' ? 'bg-purple-50 text-purple-700' :
                                                    call.call_type === 'webCall' ? 'bg-cyan-50 text-cyan-700' :
                                                    'bg-slate-50 text-slate-500'
                                                }`}>
                                                    {call.call_type === 'inboundPhoneCall' ? 'Inbound' :
                                                     call.call_type === 'outboundPhoneCall' ? 'Outbound' :
                                                     call.call_type === 'webCall' ? 'Web' : '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge type="call_status" value={call.call_status} /></td>
                                            <td className="px-4 py-3">
                                                {call.has_analysis ? <StatusBadge type="sentiment" value={call.sentiment} /> : <span className="text-[10px] text-slate-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {call.has_analysis ? <StatusBadge type="success_status" value={call.success_status} /> : <span className="text-[10px] text-slate-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 tabular-nums text-xs">{fmt(call.duration_seconds)}</td>
                                            <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{fmtDate(call.call_datetime)}</td>
                                            <td className="px-4 py-3 text-slate-500 text-[11px] max-w-[120px] truncate capitalize">
                                                {call.ended_reason?.replace(/-/g, ' ') || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => onViewDetail?.(call.id)}
                                                    className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.total > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50">
                            <span className="text-xs text-slate-500">
                                {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                            </span>
                            <div className="flex items-center gap-1">
                                <button disabled={meta.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 transition-colors">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-xs font-medium text-slate-600 px-2">{meta.page} / {totalPages}</span>
                                <button disabled={meta.page >= totalPages} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 transition-colors">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
