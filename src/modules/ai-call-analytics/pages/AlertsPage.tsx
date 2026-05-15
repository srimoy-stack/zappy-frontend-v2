'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Bell, AlertTriangle, ChevronLeft, ChevronRight, ExternalLink,
    Shield, Phone, User, XCircle,
} from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { useDateRange } from '../components/DateRangeContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { DataStatusBar } from '../components/DataStatusBar';
import type { AlertFilters, AlertSeverity, AlertType } from '../types/callAnalytics.types';

const SEVERITY_STYLES: Record<AlertSeverity, { bg: string; text: string; border: string; dot: string }> = {
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
};

const ALERT_ICONS: Record<AlertType, React.FC<{ className?: string }>> = {
    call_failed: XCircle,
    angry_customer: AlertTriangle,
    human_requested: User,
    call_not_completed: Phone,
};

interface Props {
    onViewCall?: (callId: number) => void;
}

export default function AlertsPage({ onViewCall }: Props) {
    const { dateFrom, dateTo } = useDateRange();
    const [filters, setFilters] = useState<AlertFilters>({ page: 1, limit: 20 });

    // Merge global date range
    const mergedFilters = useMemo<AlertFilters>(() => ({
        ...filters,
        date_from: filters.date_from || dateFrom || undefined,
        date_to: filters.date_to || dateTo || undefined,
    }), [filters, dateFrom, dateTo]);

    const { data: alerts, meta, loading, isRefreshing, error, lastUpdated, refetch } = useAlerts(mergedFilters);

    const totalPages = useMemo(() => Math.ceil(meta.total / meta.limit), [meta.total, meta.limit]);

    const highCount = useMemo(() => alerts.filter((a) => a.severity === 'high').length, [alerts]);
    const mediumCount = useMemo(() => alerts.filter((a) => a.severity === 'medium').length, [alerts]);

    // Reset page on global date change
    useEffect(() => {
        setFilters((p) => ({ ...p, page: 1 }));
    }, [dateFrom, dateTo]);

    return (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Bell className="h-6 w-6 text-slate-600" /> Alerts
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor critical events and take action</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {highCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {highCount} High
                        </span>
                    )}
                    {mediumCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {mediumCount} Medium
                        </span>
                    )}
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

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <select
                    value={filters.severity || ''}
                    onChange={(e) => setFilters((p) => ({ ...p, severity: e.target.value as AlertSeverity | '', page: 1 }))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">All Severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                </select>
                <select
                    value={filters.alert_type || ''}
                    onChange={(e) => setFilters((p) => ({ ...p, alert_type: e.target.value as AlertType | '', page: 1 }))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">All Types</option>
                    <option value="call_failed">Call Failed</option>
                    <option value="angry_customer">Angry Customer</option>
                    <option value="human_requested">Human Requested</option>
                    <option value="call_not_completed">Call Not Completed</option>
                </select>
            </div>

            {/* Error */}
            {error && <ErrorBanner message={error} onRetry={refetch} autoRetrySeconds={10} dismissible />}

            {/* Alert List */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm animate-pulse">
                            <div className="h-10 w-10 rounded-lg bg-slate-100" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-slate-100" />
                                <div className="flex gap-2">
                                    <div className="h-3 w-16 rounded-full bg-slate-100" />
                                    <div className="h-3 w-20 rounded bg-slate-100" />
                                    <div className="h-3 w-12 rounded bg-slate-100" />
                                </div>
                            </div>
                            <div className="h-3 w-16 rounded bg-slate-100" />
                        </div>
                    ))}
                </div>
            ) : alerts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                    <Shield className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-600">All clear</p>
                    <p className="text-sm text-slate-400 mt-1">No alerts matching your criteria</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {alerts.map((alert) => {
                        const style = SEVERITY_STYLES[alert.severity];
                        const Icon = ALERT_ICONS[alert.alert_type] || AlertTriangle;

                        return (
                            <div
                                key={alert.id}
                                id={`alert-item-${alert.id}`}
                                onClick={() => onViewCall?.(alert.ai_call_id)}
                                className={`flex items-center justify-between rounded-xl border ${style.border} bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md cursor-pointer group`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.bg} shrink-0`}>
                                        <Icon className={`h-5 w-5 ${style.text}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{alert.message}</p>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                                {alert.severity}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {alert.alert_type.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                Call #{alert.ai_call_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs text-slate-400 hidden sm:inline">
                                        {new Date(alert.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {meta.total > meta.limit && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="text-xs text-slate-500">
                        {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                    </span>
                    <div className="flex items-center gap-1">
                        <button disabled={meta.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-xs font-medium text-slate-600 px-2">{meta.page} / {totalPages}</span>
                        <button disabled={meta.page >= totalPages} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
