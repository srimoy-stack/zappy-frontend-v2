'use client';

import { useState, useEffect } from 'react';
import {
    Building2, Users, CheckCircle2, AlertTriangle, Clock,
    ArrowUpRight, Loader2, Mail, Phone, BarChart3,
    Shield, Zap, Globe, Server, RefreshCw,
    ChevronRight, ArrowUp, Minus, Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils';
import { apiClient } from '@/shared/api/apiClient';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardStats {
    range: string;
    totalTenants: number; active: number; draft: number; suspended: number;
    provisioned: number; configuring: number; newTenants: number;
    totalUsers: number; platformUsers: number; newUsers: number;
    activeModules: number;
    moduleAdoption: { module: string; tenants: number; pct: number }[];
    campaignUsage: {
        totalCampaigns: number; sent: number; scheduled: number; draft: number;
        totalEmailsSent: number; totalOpened: number; totalClicked: number;
        tenantsUsingCampaigns: number;
    };
    callUsage: {
        totalCalls: number; totalMinutes: number; avgDurationSeconds: number;
        totalCost: number; inbound: number; outbound: number; webCall: number;
        tenantsUsingCalls: number;
    };
    growthTrend: { date: string; count: number }[];
    topTenants: { id: string; name: string; slug: string; status: string; usersCount: number; created: string }[];
    recentActivity: { id: string; event: string; detail: string; time: string; type: 'success' | 'warning' | 'info' }[];
    recentTenants: { id: string; name: string; slug: string; status: string; created: string }[];
}

type DateRange = '7d' | '30d' | '90d' | 'all';

// ─── Shared Components ──────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color, trend, href }: {
    label: string; value: string | number; icon: any; color: string;
    trend?: { value: number; label: string }; href?: string;
}) {
    const router = useRouter();
    return (
        <button onClick={() => href && router.push(href)}
            className={cn('bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left transition-all group relative overflow-hidden',
                href && 'hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 cursor-pointer')}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.03] pointer-events-none"><Icon size={80} /></div>
            <div className="flex items-center justify-between mb-2">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color)}><Icon size={16} /></div>
                {href && <ArrowUpRight size={12} className="text-slate-300 group-hover:text-slate-600 transition-colors" />}
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
            <span className="text-2xl font-black text-slate-900 block mt-0.5 tabular-nums">{value}</span>
            {trend && trend.value > 0 && (
                <div className="flex items-center gap-1 mt-1.5 text-emerald-600">
                    <ArrowUp size={10} />
                    <span className="text-[10px] font-black">+{trend.value}</span>
                    <span className="text-[9px] font-bold text-slate-400 ml-0.5">{trend.label}</span>
                </div>
            )}
        </button>
    );
}

function RangeSelector({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
    const options: { value: DateRange; label: string }[] = [
        { value: '7d', label: '7D' }, { value: '30d', label: '30D' },
        { value: '90d', label: '90D' }, { value: 'all', label: 'All' },
    ];
    return (
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
            {options.map(o => (
                <button key={o.value} onClick={() => onChange(o.value)}
                    className={cn('px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
                        range === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600')}>
                    {o.label}
                </button>
            ))}
        </div>
    );
}

// ─── Section: Tenant Health ─────────────────────────────────────────────────

function TenantDistribution({ stats }: { stats: DashboardStats }) {
    const items = [
        { label: 'Active', count: stats.active, color: 'bg-emerald-500' },
        { label: 'Draft', count: stats.draft, color: 'bg-slate-400' },
        { label: 'Provisioned', count: stats.provisioned, color: 'bg-blue-500' },
        { label: 'Configuring', count: stats.configuring, color: 'bg-amber-500' },
        { label: 'Suspended', count: stats.suspended, color: 'bg-rose-500' },
    ];
    const total = stats.totalTenants || 1;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Tenant Distribution</h3>
            <div className="flex h-3 rounded-full overflow-hidden mb-5 bg-slate-100">
                {items.filter(i => i.count > 0).map(item => (
                    <div key={item.label} className={cn('h-full transition-all duration-700', item.color)}
                        style={{ width: `${(item.count / total) * 100}%` }} />
                ))}
            </div>
            <div className="space-y-2.5">
                {items.map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
                            <span className="text-xs font-bold text-slate-600">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 tabular-nums">{item.count}</span>
                            <span className="text-[10px] font-bold text-slate-400 tabular-nums w-10 text-right">
                                {Math.round((item.count / total) * 100)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GrowthChart({ data }: { data: DashboardStats['growthTrend'] }) {
    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center h-full">
                <p className="text-sm text-slate-400 font-medium">No growth data for this period</p>
            </div>
        );
    }
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Onboarding Trend</h3>
            <div className="flex items-end gap-[3px] h-28">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {d.date}: {d.count} tenant{d.count !== 1 ? 's' : ''}
                        </div>
                        <div className="w-full bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t transition-all duration-300 hover:from-indigo-600 hover:to-violet-500"
                            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }} />
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-[9px] font-bold text-slate-400">{data[0]?.date}</span>
                <span className="text-[9px] font-bold text-slate-400">{data[data.length - 1]?.date}</span>
            </div>
        </div>
    );
}

// ─── Section: Service Adoption ──────────────────────────────────────────────

function ServiceUsageCards({ campaign, call, totalTenants }: {
    campaign: DashboardStats['campaignUsage']; call: DashboardStats['callUsage']; totalTenants: number;
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Campaigns — platform adoption */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Mail size={16} /></div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">Email Campaigns</h4>
                            <p className="text-[10px] text-slate-400 font-bold">
                                {campaign.tenantsUsingCampaigns}/{totalTenants} tenants active
                            </p>
                        </div>
                    </div>
                    {campaign.tenantsUsingCampaigns > 0 && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase">
                            {Math.round((campaign.tenantsUsingCampaigns / Math.max(totalTenants, 1)) * 100)}% adoption
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <MiniStat label="Campaigns" value={campaign.totalCampaigns} />
                    <MiniStat label="Sent" value={campaign.sent} accent="emerald" />
                    <MiniStat label="Scheduled" value={campaign.scheduled} accent="amber" />
                    <MiniStat label="Drafts" value={campaign.draft} accent="slate" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="Emails Sent" value={campaign.totalEmailsSent.toLocaleString()} accent="blue" />
                    <MiniStat label="Opened" value={campaign.totalOpened.toLocaleString()} accent="violet" />
                    <MiniStat label="Clicked" value={campaign.totalClicked.toLocaleString()} accent="indigo" />
                </div>
            </div>

            {/* AI Call Analytics — platform adoption */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><Phone size={16} /></div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">AI Call Analytics</h4>
                            <p className="text-[10px] text-slate-400 font-bold">
                                {call.tenantsUsingCalls}/{totalTenants} tenants active
                            </p>
                        </div>
                    </div>
                    {call.tenantsUsingCalls > 0 && (
                        <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-[9px] font-black uppercase">
                            {Math.round((call.tenantsUsingCalls / Math.max(totalTenants, 1)) * 100)}% adoption
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <MiniStat label="Total Calls" value={call.totalCalls} />
                    <MiniStat label="Minutes" value={call.totalMinutes} accent="blue" />
                    <MiniStat label="Avg Duration" value={`${call.avgDurationSeconds}s`} accent="violet" />
                    <MiniStat label="Cost" value={`$${call.totalCost}`} accent="emerald" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="Inbound" value={call.inbound} accent="blue" />
                    <MiniStat label="Outbound" value={call.outbound} accent="amber" />
                    <MiniStat label="Web Calls" value={call.webCall} accent="indigo" />
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
    const bg = accent ? `bg-${accent}-50` : 'bg-slate-50';
    const text = accent ? `text-${accent}-700` : 'text-slate-900';
    return (
        <div className={cn('rounded-xl p-2.5 text-center', bg)}>
            <span className={cn('text-base font-black block tabular-nums leading-tight', text)}>{value}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
    );
}

// ─── Section: Module Adoption ───────────────────────────────────────────────

function ModuleAdoption({ modules, totalTenants }: { modules: DashboardStats['moduleAdoption']; totalTenants: number }) {
    const labels: Record<string, string> = {
        'email-campaigns': 'Email Campaigns',
        'ai-call-analytics': 'AI Call Analytics',
        'pos': 'Point of Sale', 'inventory': 'Inventory', 'crm': 'CRM',
    };
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Module Adoption Rate</h3>
            {modules.length === 0 && <p className="text-sm text-slate-400">No modules provisioned yet</p>}
            <div className="space-y-4">
                {modules.map(m => (
                    <div key={m.module}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700">{labels[m.module] || m.module}</span>
                            <span className="text-[10px] font-black text-slate-500 tabular-nums">{m.tenants} of {totalTenants} • {m.pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                                style={{ width: `${Math.max(m.pct, 2)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Section: Top Tenants ───────────────────────────────────────────────────

function TopTenants({ tenants }: { tenants: DashboardStats['topTenants'] }) {
    const router = useRouter();
    const sc: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-600', draft: 'bg-slate-100 text-slate-600',
        suspended: 'bg-rose-50 text-rose-600', provisioned: 'bg-blue-50 text-blue-600',
        configuring: 'bg-amber-50 text-amber-600',
    };
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top Tenants by Users</h3>
            {tenants.length === 0 && <p className="text-sm text-slate-400">No tenants yet</p>}
            <div className="space-y-1.5">
                {tenants.map((t, i) => (
                    <button key={t.id} onClick={() => router.push(`/platform/tenants/${t.id}`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                        <span className="text-[10px] font-black text-slate-300 w-4">{i + 1}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                            {t.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-black text-slate-900 block truncate">{t.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{t.slug}</span>
                        </div>
                        <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase', sc[t.status] || sc.draft)}>{t.status}</span>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-slate-900 tabular-nums">{t.usersCount}</span>
                            <Users size={11} className="text-slate-300" />
                        </div>
                        <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Section: Recent Activity ───────────────────────────────────────────────

function RecentActivity({ events }: { events: DashboardStats['recentActivity'] }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Audit Trail</h3>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
                {events.length === 0 && <p className="text-sm text-slate-400">No activity recorded yet</p>}
                {events.map(event => (
                    <div key={event.id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                            event.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            event.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600')}>
                            {event.type === 'success' ? <CheckCircle2 size={12} /> :
                             event.type === 'warning' ? <AlertTriangle size={12} /> : <Activity size={12} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-black text-slate-900 block truncate">{event.event}</span>
                            <span className="text-[10px] text-slate-500 font-medium block truncate">{event.detail}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 shrink-0 whitespace-nowrap">
                            <Clock size={9} /> {event.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Section: System Health ─────────────────────────────────────────────────

function SystemHealth() {
    const services = [
        { label: 'API', icon: Globe, status: 'operational' },
        { label: 'Database', icon: Server, status: 'operational' },
        { label: 'Queue', icon: Zap, status: 'operational' },
    ];
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</h3>
                <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
                </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {services.map(svc => (
                    <div key={svc.label} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                        <svc.icon size={16} className="mx-auto mb-1 text-emerald-600" />
                        <span className="text-[9px] font-black uppercase tracking-widest block text-slate-700">{svc.label}</span>
                        <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">● Live</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const MOCK_DASHBOARD_STATS: DashboardStats = {
    range: '30d',
    totalTenants: 3, active: 2, draft: 1, suspended: 0,
    provisioned: 0, configuring: 0, newTenants: 1,
    totalUsers: 15, platformUsers: 2, newUsers: 3,
    activeModules: 5,
    moduleAdoption: [
        { module: 'pos', tenants: 3, pct: 100 },
        { module: 'inventory', tenants: 2, pct: 66 },
        { module: 'email-campaigns', tenants: 1, pct: 33 },
    ],
    campaignUsage: {
        totalCampaigns: 12, sent: 8, scheduled: 2, draft: 2,
        totalEmailsSent: 1450, totalOpened: 890, totalClicked: 320,
        tenantsUsingCampaigns: 1,
    },
    callUsage: {
        totalCalls: 45, totalMinutes: 120, avgDurationSeconds: 160,
        totalCost: 15.50, inbound: 25, outbound: 20, webCall: 0,
        tenantsUsingCalls: 1,
    },
    growthTrend: [
        { date: 'May 1', count: 1 },
        { date: 'May 5', count: 2 },
        { date: 'May 10', count: 2 },
        { date: 'May 15', count: 3 },
    ],
    topTenants: [
        { id: 'brand-001', name: 'Acme Pizza Co.', slug: 'acme-pizza', status: 'active', usersCount: 10, created: '2025-06-15' },
        { id: 'brand-002', name: 'QuickBite Foods', slug: 'quickbite', status: 'configuring', usersCount: 5, created: '2025-08-22' },
    ],
    recentActivity: [
        { id: 'act-1', event: 'Tenant Created', detail: 'Acme Pizza Co. registered successfully', time: '2 mins ago', type: 'success' },
        { id: 'act-2', event: 'Settings Updated', detail: 'System-wide SMTP server configured', time: '1 hour ago', type: 'info' },
        { id: 'act-3', event: 'Module Enabled', detail: 'AI Call Analytics enabled for Acme Pizza Co.', time: '3 hours ago', type: 'success' },
    ],
    recentTenants: [
        { id: 'brand-001', name: 'Acme Pizza Co.', slug: 'acme-pizza', status: 'active', created: '2025-06-15' },
    ],
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function PlatformDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<DateRange>('30d');
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (selectedRange: DateRange) => {
        try {
            // TEMPORARILY STOPPED API HIT: Return mock stats directly
            // const { data } = await apiClient.get(`/platform/dashboard-stats?range=${selectedRange}`);
            setStats(MOCK_DASHBOARD_STATS);
        } catch (err) {
            console.error('Dashboard stats error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchStats(range); }, [range]);

    const handleRefresh = () => { setRefreshing(true); fetchStats(range); };
    const handleRangeChange = (r: DateRange) => { setRange(r); setLoading(true); };

    if (loading || !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                <span className="text-sm font-bold text-slate-400">Loading platform analytics...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* ── Header ────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                        System-wide governance • {range === 'all' ? 'All time' : `Last ${range}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <RangeSelector range={range} onChange={handleRangeChange} />
                    <button onClick={handleRefresh} disabled={refreshing}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50">
                        <RefreshCw size={16} className={cn('text-slate-500', refreshing && 'animate-spin')} />
                    </button>
                </div>
            </div>

            {/* ── KPI Overview ──────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <KpiCard label="Total Tenants" value={stats.totalTenants} icon={Building2} color="bg-slate-900 text-white"
                    trend={{ value: stats.newTenants, label: 'new' }} href="/platform/tenants" />
                <KpiCard label="Active" value={stats.active} icon={CheckCircle2} color="bg-emerald-100 text-emerald-600" />
                <KpiCard label="Suspended" value={stats.suspended} icon={AlertTriangle} color="bg-rose-100 text-rose-600" />
                <KpiCard label="Tenant Users" value={stats.totalUsers} icon={Users} color="bg-violet-100 text-violet-600"
                    trend={{ value: stats.newUsers, label: 'new' }} />
                <KpiCard label="Platform Admins" value={stats.platformUsers} icon={Shield} color="bg-amber-100 text-amber-600"
                    href="/platform/users" />
                <KpiCard label="Active Modules" value={stats.activeModules} icon={BarChart3} color="bg-indigo-100 text-indigo-600" />
            </div>

            {/* ── Tenant Health: Distribution + Growth ──────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TenantDistribution stats={stats} />
                <div className="lg:col-span-2">
                    <GrowthChart data={stats.growthTrend} />
                </div>
            </div>

            {/* ── Phase 1 Service Usage ─────────────────────────── */}
            <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phase 1 Service Usage</h2>
                <ServiceUsageCards campaign={stats.campaignUsage} call={stats.callUsage} totalTenants={stats.totalTenants} />
            </div>

            {/* ── Module Adoption + Top Tenants ──────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModuleAdoption modules={stats.moduleAdoption} totalTenants={stats.totalTenants} />
                <TopTenants tenants={stats.topTenants} />
            </div>

            {/* ── Audit Trail + System Health ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentActivity events={stats.recentActivity} />
                </div>
                <SystemHealth />
            </div>
        </div>
    );
}
