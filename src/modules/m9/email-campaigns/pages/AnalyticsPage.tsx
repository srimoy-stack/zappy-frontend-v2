'use client';

import React, { useMemo, useCallback } from 'react';
import {
    BarChart3,
    Download,
    AlertCircle,
    ChevronDown,
    Filter,
    RotateCcw,
    Calendar,
    Send,
    CheckCircle2,
    Clock,
    XCircle,
    Pause,
    Loader2,
    ShieldAlert,
    TrendingUp,
    TrendingDown,
    Minus,
    Users,
    Mail,
    Search,
    ChevronLeft,
    ChevronRight,
    MousePointerClick,
    Activity,
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { AnalyticsFilters } from '../types/analytics.types';
import { CampaignStatus } from '../types/campaign.types';
import { downloadCSV, CampaignMetricRow } from '../utils/exportCSV';
import { ToastContainer, useToast } from '../components/Toast';

// ============================================================================
// STATUS BADGE CONFIG
// ============================================================================

const STATUS_CONFIG: Record<
    CampaignStatus,
    { label: string; className: string; icon: React.ReactNode }
> = {
    sent: {
        label: 'Sent',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    sending: {
        label: 'Sending',
        className: 'bg-blue-50 text-blue-700 ring-blue-200/60',
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    scheduled: {
        label: 'Scheduled',
        className: 'bg-violet-50 text-violet-700 ring-violet-200/60',
        icon: <Clock className="w-3 h-3" />,
    },
    draft: {
        label: 'Draft',
        className: 'bg-slate-100 text-slate-600 ring-slate-200/60',
        icon: <Minus className="w-3 h-3" />,
    },
    paused: {
        label: 'Paused',
        className: 'bg-amber-50 text-amber-700 ring-amber-200/60',
        icon: <Pause className="w-3 h-3" />,
    },
    failed: {
        label: 'Failed',
        className: 'bg-red-50 text-red-700 ring-red-200/60',
        icon: <XCircle className="w-3 h-3" />,
    },
    blocked: {
        label: 'Blocked',
        className: 'bg-rose-50 text-rose-700 ring-rose-200/60',
        icon: <ShieldAlert className="w-3 h-3" />,
    },
};

// ============================================================================
// TABLE COLUMNS
// ============================================================================

const COLUMNS = [
    { key: 'campaign_name', label: 'Campaign Name', width: 'min-w-[220px]' },
    { key: 'status', label: 'Status', width: 'min-w-[120px]' },
    { key: 'sent', label: 'Sent', width: 'min-w-[100px]' },
    { key: 'delivered', label: 'Delivered', width: 'min-w-[110px]' },
    { key: 'open_rate', label: 'Open Rate', width: 'min-w-[110px]' },
    { key: 'click_rate', label: 'Click Rate', width: 'min-w-[110px]' },
    { key: 'unsubscribe_rate', label: 'Unsub Rate', width: 'min-w-[110px]' },
    { key: 'bounce_rate', label: 'Bounce Rate', width: 'min-w-[110px]' },
] as const;

// ============================================================================
// HELPER: Format number
// ============================================================================

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
    return n.toLocaleString();
}

// ============================================================================
// HELPER: Rate color
// ============================================================================

function rateColor(rate: number, type: 'open' | 'click' | 'unsub' | 'bounce'): string {
    if (rate === 0) return 'text-slate-400';

    switch (type) {
        case 'open':
            if (rate >= 30) return 'text-emerald-600';
            if (rate >= 20) return 'text-amber-600';
            return 'text-red-600';
        case 'click':
            if (rate >= 10) return 'text-emerald-600';
            if (rate >= 5) return 'text-amber-600';
            return 'text-red-600';
        case 'unsub':
            if (rate <= 0.3) return 'text-emerald-600';
            if (rate <= 0.8) return 'text-amber-600';
            return 'text-red-600';
        case 'bounce':
            if (rate <= 2) return 'text-emerald-600';
            if (rate <= 4) return 'text-amber-600';
            return 'text-red-600';
        default:
            return 'text-slate-700';
    }
}

function rateIcon(rate: number, type: 'open' | 'click' | 'unsub' | 'bounce'): React.ReactNode {
    if (rate === 0) return <Minus className="w-3 h-3 text-slate-300" />;

    const isGood = (
        (type === 'open' && rate >= 30) ||
        (type === 'click' && rate >= 10) ||
        (type === 'unsub' && rate <= 0.3) ||
        (type === 'bounce' && rate <= 2)
    );
    const isBad = (
        (type === 'open' && rate < 20) ||
        (type === 'click' && rate < 5) ||
        (type === 'unsub' && rate > 0.8) ||
        (type === 'bounce' && rate > 4)
    );

    if (isGood) return <TrendingUp className="w-3 h-3" />;
    if (isBad) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
}

// ============================================================================
// HELPER: Format date for display
// ============================================================================

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(dateStr));
    } catch {
        return '—';
    }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AnalyticsPage (M9 – Marketing / Customer Engagement)
 *
 * Production-grade campaign analytics table with:
 * - API-sourced metrics (NEVER client-calculated)
 * - Date range picker + campaign dropdown filter
 * - CSV export of visible data
 * - Skeleton loading, empty state, error + retry
 * - Dense M9 table design with rate-color indicators
 */
export const AnalyticsPage: React.FC = () => {
    const {
        rows,
        campaignOptions,
        loading,
        error,
        filters,
        summary,
        updateFilter,
        resetFilters,
        refetch,
        // Destructure all new hook properties
        contactActivity,
        contactSearch,
        setContactSearch,
        setContactPage,
        contactLoading,
    } = useAnalytics();

    const toast = useToast();

    // ── Check if filters are non-default ───────────────────────────────
    const hasActiveFilters = useMemo(
        () => filters.campaign_id !== 'all',
        [filters]
    );

    // ── CSV export ─────────────────────────────────────────────────────
    const handleExportCSV = useCallback(() => {
        if (rows.length === 0) {
            toast.info('Nothing to export', 'No analytics data to export with current filters.');
            return;
        }

        const csvRows: CampaignMetricRow[] = rows.map((r) => ({
            campaignName: r.campaign_name,
            status: r.status,
            sent: r.sent,
            delivered: r.delivered,
            openRate: r.open_rate,
            clickRate: r.click_rate,
            unsubscribeRate: r.unsubscribe_rate,
            bounceRate: r.bounce_rate,
        }));

        downloadCSV(csvRows);
        toast.success('Export complete', `${csvRows.length} campaign${csvRows.length !== 1 ? 's' : ''} exported.`);
    }, [rows, toast]);

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className="max-w-[1600px] mx-auto space-y-4 pb-10 px-2 lg:px-4">
            {/* ── Toast Notifications ─────────────────────────────────── */}
            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            Campaign performance metrics
                        </p>
                    </div>
                </div>

                <button
                    id="btn-export-csv"
                    onClick={handleExportCSV}
                    disabled={loading || rows.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* ── Summary Tiles ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    {
                        label: 'Total Sent',
                        value: summary.totalSent,
                        icon: Send,
                        color: 'bg-slate-50 text-slate-700 ring-slate-200',
                        iconBg: 'bg-slate-200 text-slate-700',
                    },
                    {
                        label: 'Delivered',
                        value: summary.totalDelivered,
                        icon: CheckCircle2,
                        color: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                        iconBg: 'bg-emerald-200 text-emerald-700',
                    },
                    {
                        label: 'Opened',
                        value: summary.totalOpened,
                        icon: Mail,
                        color: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
                        iconBg: 'bg-indigo-200 text-indigo-700',
                    },
                    {
                        label: 'Clicked',
                        value: summary.totalClicked,
                        icon: MousePointerClick,
                        color: 'bg-blue-50 text-blue-700 ring-blue-200',
                        iconBg: 'bg-blue-200 text-blue-700',
                    },
                    {
                        label: 'Bounced',
                        value: summary.totalBounced,
                        icon: XCircle,
                        color: 'bg-red-50 text-red-700 ring-red-200',
                        iconBg: 'bg-red-200 text-red-700',
                    },
                    {
                        label: 'Unsubscribed',
                        value: summary.totalUnsubscribed,
                        icon: Users,
                        color: 'bg-amber-50 text-amber-700 ring-amber-200',
                        iconBg: 'bg-amber-200 text-amber-700',
                    },
                ].map((tile) => {
                    const Icon = tile.icon;
                    return (
                        <div
                            key={tile.label}
                            className={`flex flex-col gap-2 px-4 py-3 rounded-xl ring-1 ${tile.color} transition-all hover:shadow-md cursor-default`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`p-1.5 rounded-lg ${tile.iconBg}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                    {tile.label.split(' ')[0]}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">
                                    {tile.label}
                                </p>
                                <p className="text-xl font-black tabular-nums tracking-tight">
                                    {loading ? '…' : formatNumber(tile.value)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Error State ─────────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">Failed to load analytics</p>
                        <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    </div>
                    <button
                        onClick={refetch}
                        className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Filters + Table Card ─────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters bar */}
                <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    {/* Filter icon */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Filter className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            Filters
                        </span>
                    </div>

                    {/* Date from */}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <input
                            id="filter-date-from"
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => updateFilter('date_from', e.target.value)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    <span className="text-[10px] font-bold text-slate-400">to</span>

                    {/* Date to */}
                    <div className="flex items-center gap-1.5">
                        <input
                            id="filter-date-to"
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => updateFilter('date_to', e.target.value)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    {/* Campaign dropdown */}
                    <div className="relative ml-auto">
                        <select
                            id="filter-campaign"
                            value={filters.campaign_id}
                            onChange={(e) =>
                                updateFilter(
                                    'campaign_id',
                                    e.target.value as AnalyticsFilters['campaign_id']
                                )
                            }
                            className="appearance-none px-3 py-1.5 pr-8 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all min-w-[200px]"
                        >
                            <option value="all">All Campaigns</option>
                            {campaignOptions.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Reset */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors uppercase tracking-wider"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </button>
                    )}
                </div>

                {/* Summary bar */}
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Showing:{' '}
                        <span className="text-slate-900">
                            {loading ? '…' : rows.length}
                        </span>{' '}
                        campaign{rows.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                        {filters.date_from} → {filters.date_to}
                    </span>
                </div>

                {/* ── Loading State (Skeleton) ─────────────────────────── */}
                {loading && (
                    <div>
                        {/* Skeleton table header */}
                        <div className="grid grid-cols-8 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-100">
                            {COLUMNS.map((col) => (
                                <div
                                    key={col.key}
                                    className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse"
                                />
                            ))}
                        </div>
                        {/* Skeleton rows */}
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-8 gap-4 px-4 py-2.5 border-b border-slate-50"
                            >
                                <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
                                <div className="h-6 bg-slate-100 rounded-full w-16 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-12 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-14 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-10 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-10 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-10 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-10 animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────── */}
                {!loading && !error && rows.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                        <div className="p-5 bg-indigo-50 rounded-2xl mb-5">
                            <BarChart3 className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">
                            No analytics data available
                        </h2>
                        <p className="text-sm text-slate-400 mt-1.5 max-w-sm text-center">
                            {hasActiveFilters
                                ? 'No campaigns match your current filters. Try adjusting the date range or campaign selection.'
                                : 'Once campaigns are sent, performance metrics will appear here.'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}

                {/* ── Table ────────────────────────────────────────────── */}
                {!loading && rows.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {COLUMNS.map((col) => (
                                        <th
                                            key={col.key}
                                            className={`px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ${col.width}`}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row) => {
                                    const statusCfg =
                                        STATUS_CONFIG[row.status] ?? STATUS_CONFIG.draft;

                                    return (
                                        <tr
                                            key={row.id}
                                            className="group hover:bg-slate-50/70 transition-colors duration-150"
                                        >
                                            {/* Campaign Name */}
                                            <td className="px-4 py-2.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                                        {row.campaign_name}
                                                    </span>
                                                    {row.sent_at && (
                                                        <span className="text-[10px] text-slate-400 mt-0.5">
                                                            Sent {formatDate(row.sent_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-2.5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${statusCfg.className}`}
                                                >
                                                    {statusCfg.icon}
                                                    {statusCfg.label}
                                                </span>
                                            </td>

                                            {/* Sent */}
                                            <td className="px-4 py-2.5">
                                                <span className="text-sm font-semibold text-slate-800 tabular-nums">
                                                    {formatNumber(row.sent)}
                                                </span>
                                            </td>

                                            {/* Delivered */}
                                            <td className="px-4 py-2.5">
                                                <span className="text-sm font-semibold text-slate-800 tabular-nums">
                                                    {formatNumber(row.delivered)}
                                                </span>
                                            </td>

                                            {/* Open Rate */}
                                            <td className="px-4 py-2.5">
                                                <MetricCell
                                                    rate={row.open_rate}
                                                    type="open"
                                                />
                                            </td>

                                            {/* Click Rate */}
                                            <td className="px-4 py-2.5">
                                                <MetricCell
                                                    rate={row.click_rate}
                                                    type="click"
                                                />
                                            </td>

                                            {/* Unsubscribe Rate */}
                                            <td className="px-4 py-2.5">
                                                <MetricCell
                                                    rate={row.unsubscribe_rate}
                                                    type="unsub"
                                                />
                                            </td>

                                            {/* Bounce Rate */}
                                            <td className="px-4 py-2.5">
                                                <MetricCell
                                                    rate={row.bounce_rate}
                                                    type="bounce"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ── Contact Activity Section ─────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
                <div className="px-4 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <Activity className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Contact Activity</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                Per-contact engagement history
                            </p>
                        </div>
                    </div>

                    {/* Search Activity */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search email..."
                            value={contactSearch}
                            onChange={(e) => setContactSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        />
                    </div>
                </div>

                {/* Activity Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Sent</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Open</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Click</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Sent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {contactLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3"><div className="h-3.5 bg-slate-100 rounded-full w-40 animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-3.5 bg-slate-100 rounded-full w-24 animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-3.5 bg-slate-100 rounded-full w-24 animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-3.5 bg-slate-100 rounded-full w-24 animate-pulse" /></td>
                                        <td className="px-4 py-3 text-right"><div className="h-3.5 bg-slate-100 rounded-full w-8 animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : contactActivity?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                                        No activity found.
                                    </td>
                                </tr>
                            ) : (
                                contactActivity?.data.map((contact) => (
                                    <tr key={contact.email} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">{contact.name || 'Unknown'}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{contact.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{formatDate(contact.last_sent)}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{formatDate(contact.last_open)}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{formatDate(contact.last_click)}</td>
                                        <td className="px-4 py-3 text-right text-xs font-black text-indigo-600 tabular-nums">
                                            {contact.total_emails_received}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Activity Pagination */}
                {contactActivity && contactActivity.last_page > 1 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Page {contactActivity.current_page} of {contactActivity.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setContactPage(p => Math.max(1, p - 1))}
                                disabled={contactActivity.current_page === 1}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                            <button
                                onClick={() => setContactPage(p => Math.min(contactActivity!.last_page, p + 1))}
                                disabled={contactActivity.current_page === contactActivity.last_page}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Animation Keyframes ──────────────────────────────────── */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(16px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(16px); }
                }
                @keyframes shrinkWidth {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `,
                }}
            />
        </div>
    );
};

// ============================================================================
// SUB-COMPONENT: Metric Cell with color + trend icon
// ============================================================================

const MetricCell: React.FC<{
    rate: number;
    type: 'open' | 'click' | 'unsub' | 'bounce';
}> = ({ rate, type }) => {
    const color = rateColor(rate, type);
    const icon = rateIcon(rate, type);

    if (rate === 0) {
        return (
            <span className="text-sm text-slate-300 tabular-nums">
                —
            </span>
        );
    }

    return (
        <div className={`flex items-center gap-1.5 ${color}`}>
            {icon}
            <span className="text-sm font-semibold tabular-nums">
                {rate.toFixed(type === 'unsub' || type === 'bounce' ? 2 : 1)}%
            </span>
        </div>
    );
};

export default AnalyticsPage;
