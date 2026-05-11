'use client';

import React from 'react';
import {
    Phone, CheckCircle, XCircle, AlertTriangle, Clock, Frown, Activity,
    Bell, PhoneIncoming, PhoneOutgoing, Globe,
    Timer, TrendingUp, TrendingDown, BarChart3, Microscope,
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useAlerts } from '../hooks/useAlerts';
import { useTrends } from '../hooks/useTrends';
import { useDateRange } from '../components/DateRangeContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/SkeletonCard';
import { SkeletonChart } from '../components/SkeletonChart';
import { DataStatusBar } from '../components/DataStatusBar';
import { CallVolumeTrend } from '../components/charts/CallVolumeTrend';
import { SuccessFailureTrend } from '../components/charts/SuccessFailureTrend';
import { SentimentDonut } from '../components/charts/SentimentDonut';
import { IntentBreakdown } from '../components/charts/IntentBreakdown';
import { AlertsTrend } from '../components/charts/AlertsTrend';

const fmtDur = (s: number) => { if (!s) return '0s'; const m = Math.floor(s / 60), r = s % 60; return m > 0 ? `${m}m ${r}s` : `${s}s`; };
const fmtPct = (n: number, d: number) => d ? `${((n / d) * 100).toFixed(1)}%` : '0%';

export default function DashboardPage() {
    const { dateFrom, dateTo } = useDateRange();
    const dateFilters = { date_from: dateFrom || undefined, date_to: dateTo || undefined };
    const { data: stats, loading, isRefreshing, error, lastUpdated, refetch } = useStats(dateFilters);
    const { data: alerts, error: alertsError } = useAlerts({ ...dateFilters, limit: 5 });
    const trends = useTrends(dateFilters);

    return (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-10">

            {/* ━━ Header Bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
                    </div>
                    <p className="text-sm text-slate-500">AI call performance overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                        <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                        Live
                    </span>
                </div>
            </div>

            <DataStatusBar lastUpdated={lastUpdated} isRefreshing={isRefreshing} error={error} totalRecords={stats?.total_calls ?? 0} analyzedRecords={stats?.analyzed_calls} analysisCoverage={stats?.analysis_coverage_pct} onRefresh={refetch} />

            {error && <div className="mt-4"><ErrorBanner message={error} onRetry={refetch} autoRetrySeconds={15} dismissible /></div>}

            {/* ━━ KPI Hero Row ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : stats ? (
                <div className="mt-6 space-y-5">
                    {/* Row 1 — Hero KPIs (gradient cards) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <HeroCard icon={Phone} label="Total Calls" value={stats.total_calls.toLocaleString()} sub={`${stats.analyzed_calls} analyzed`} from="#6366f1" to="#8b5cf6" />
                        <HeroCard icon={TrendingUp} label="Success Rate" value={fmtPct(stats.successful_calls, stats.analyzed_calls)} sub={`${stats.successful_calls} of ${stats.analyzed_calls} analyzed`} from="#10b981" to="#059669" />
                        <HeroCard icon={Timer} label="Avg Duration" value={fmtDur(stats.avg_duration)} from="#8b5cf6" to="#a78bfa" />
                        <HeroCard icon={Microscope} label="Analysis Coverage" value={`${stats.analysis_coverage_pct}%`} sub={`${stats.analyzed_calls} of ${stats.total_calls} calls`} from="#06b6d4" to="#0891b2" />
                    </div>

                    {/* Row 2 — Call Type + Status Mini Cards */}
                    <div className="grid grid-cols-6 gap-3">
                        <Chip icon={CheckCircle} label="Successful" value={stats.successful_calls} color="#10b981" />
                        <Chip icon={XCircle} label="Failed" value={stats.failed_calls} color="#ef4444" />
                        <Chip icon={AlertTriangle} label="Partial" value={stats.partial_calls} color="#f59e0b" />
                        <Chip icon={PhoneIncoming} label="Inbound" value={stats.inbound_calls} color="#3b82f6" />
                        <Chip icon={PhoneOutgoing} label="Outbound" value={stats.outbound_calls} color="#6366f1" />
                        <Chip icon={Globe} label="Web" value={stats.web_calls} color="#8b5cf6" />
                    </div>

                    {/* Row 3 — Attention indicators (horizontal bar cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <AttentionBar icon={Frown} label="Negative Sentiment" count={stats.negative_sentiment_count} total={stats.analyzed_calls} color="#ef4444" />
                        <AttentionBar icon={Clock} label="Follow-ups Needed" count={stats.follow_up_required_count} total={stats.analyzed_calls} color="#f59e0b" />
                        <AttentionBar icon={TrendingDown} label="Failure Rate" count={stats.failed_calls} total={stats.analyzed_calls} color="#ef4444" />
                    </div>
                </div>
            ) : null}

            {/* ━━ Charts Grid ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="mt-8">
                <SectionHeader icon={Activity} title="Trends & Insights" />

                {trends.loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
                        <SkeletonChart title="" /><SkeletonChart title="" />
                    </div>
                ) : trends.error ? (
                    <div className="mt-4"><ErrorBanner message={trends.error} dismissible /></div>
                ) : trends.hasData ? (
                    <div className="mt-4 space-y-5">
                        {/* Full-width volume chart */}
                        <CallVolumeTrend data={trends.callVolume} />

                        {/* Two-column: Success + Sentiment */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <SuccessFailureTrend data={trends.successBreakdown} />
                            <SentimentDonut data={trends.sentimentDistribution} />
                        </div>

                        {/* Two-column: Intent + Alerts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <IntentBreakdown data={trends.intentBreakdown} />
                            {trends.alertsTrend.length > 0 ? (
                                <AlertsTrend data={trends.alertsTrend} />
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center p-10">
                                    <div className="text-center">
                                        <CheckCircle className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400">No alerts — all clear</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                        <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">No data for selected period</p>
                    </div>
                )}
            </section>

            {/* ━━ Recent Alerts ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="mt-8">
                <SectionHeader icon={Bell} title="Recent Alerts" badge={alerts.length > 0 ? alerts.length : undefined} />
                {alertsError && <div className="mt-3"><ErrorBanner message={alertsError} dismissible /></div>}
                <div className="mt-4">
                    {alerts.length === 0 && !alertsError ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                            <CheckCircle className="h-7 w-7 text-emerald-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">All systems healthy</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {alerts.map(a => {
                                const hi = a.severity === 'high';
                                return (
                                    <div key={a.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm ${hi ? 'border-red-100 bg-gradient-to-r from-red-50/80 to-white' : 'border-amber-100 bg-gradient-to-r from-amber-50/80 to-white'}`}>
                                        <span className={`h-2 w-2 rounded-full shrink-0 ${hi ? 'bg-red-500' : 'bg-amber-500'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${hi ? 'text-red-600' : 'text-amber-600'} w-14`}>{a.severity}</span>
                                        <span className="text-sm text-slate-700 flex-1">{a.message}</span>
                                        <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{new Date(a.created_at).toLocaleTimeString()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

// ━━ Components ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SectionHeader({ icon: I, title, badge }: { icon: React.FC<{className?:string; style?: React.CSSProperties}>; title: string; badge?: number }) {
    return (
        <div className="flex items-center gap-2">
            <I className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            {badge !== undefined && badge > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">{badge}</span>
            )}
        </div>
    );
}

function HeroCard({ icon: I, label, value, sub, from, to }: {
    icon: React.FC<{className?:string; style?: React.CSSProperties}>; label: string; value: string; sub?: string; from: string; to: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
            <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/5" />
            <div className="relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 mb-3">
                    <I className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="text-[26px] font-extrabold tracking-tight leading-none">{value}</div>
                <p className="text-white/80 text-xs font-medium mt-1.5">{label}</p>
                {sub && <p className="text-white/50 text-[10px] mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function Chip({ icon: I, label, value, color }: {
    icon: React.FC<{className?:string; style?: React.CSSProperties}>; label: string; value: number; color: string;
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-default">
            <div className="flex items-center gap-1.5 mb-1">
                <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
                    <I className="h-3 w-3" style={{ color }} />
                </div>
                <span className="text-[10px] text-slate-500 font-medium truncate">{label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
        </div>
    );
}

function AttentionBar({ icon: I, label, count, total, color }: {
    icon: React.FC<{className?:string; style?: React.CSSProperties}>; label: string; count: number; total: number; color: string;
}) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    const isHigh = pct >= 15;
    return (
        <div className={`rounded-xl border bg-white p-4 transition-all hover:shadow-sm ${isHigh ? 'border-red-100' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <I className="h-3.5 w-3.5" style={{ color: isHigh ? color : '#94a3b8' }} />
                    {label}
                </span>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold" style={{ color: isHigh ? color : '#334155' }}>{count}</span>
                    <span className="text-[10px] text-slate-400">/ {total}</span>
                </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: isHigh ? color : '#cbd5e1' }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right">{pct.toFixed(1)}%</p>
        </div>
    );
}
