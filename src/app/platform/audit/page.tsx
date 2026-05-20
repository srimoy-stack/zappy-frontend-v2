'use client';

import { useState, useMemo } from 'react';
import {
    FileText, Search, ArrowDownToLine, Building2, Store, Users, ShoppingCart,
    DollarSign, Shield, LogIn, AlertTriangle, ChevronDown, ChevronUp,
    TrendingUp, Activity, Clock, Filter, Eye, BarChart3, Zap, User,
} from 'lucide-react';
import { cn } from '@/utils';
import {
    MOCK_AUDIT_ENTRIES, MOCK_BRAND_METRICS, ACTION_CATEGORIES,
    type AuditEntry, type BrandMetrics,
} from '@/modules/platform/data/auditMockData';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) { return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`; }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }); }
function fmtFull(iso: string) { return `${fmtDate(iso)}, ${fmtTime(iso)}`; }
function timeAgo(iso: string) {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60000) return 'Just now';
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
    return `${Math.floor(ms / 86400000)}d ago`;
}

const STATUS_STYLES: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
};

type ViewTab = 'timeline' | 'brands' | 'security';

// ─── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, accent }: {
    label: string; value: string | number; sub?: string; icon: any; accent: string;
}) {
    return (
        <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-2xl', accent)} />
            <div className="flex items-start gap-3 pt-1">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                    <Icon size={18} />
                </div>
                <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] block">{label}</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight block">{value}</span>
                    {sub && <span className="text-[10px] font-semibold text-slate-400">{sub}</span>}
                </div>
            </div>
        </div>
    );
}

function ActionBadge({ action }: { action: string }) {
    const cat = ACTION_CATEGORIES[action] || { label: action, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
    return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border', cat.bg, cat.color)}>
            {action.replace(/_/g, ' ')}
        </span>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PlatformAuditPage() {
    const [activeTab, setActiveTab] = useState<ViewTab>('timeline');
    const [search, setSearch] = useState('');
    const [brandFilter, setBrandFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const entries = MOCK_AUDIT_ENTRIES;
    const metrics = MOCK_BRAND_METRICS;

    // Aggregate KPIs
    const totals = useMemo(() => {
        const totalOrders = metrics.reduce((s, b) => s + b.todayOrders, 0);
        const totalRevenue = metrics.reduce((s, b) => s + b.todayRevenue, 0);
        const totalLogins = metrics.reduce((s, b) => s + b.loginCount7d, 0);
        const failedLogins = metrics.reduce((s, b) => s + b.failedLogins7d, 0);
        const activeBrands = metrics.filter(b => b.status === 'Operational').length;
        const totalStores = metrics.reduce((s, b) => s + b.totalStores, 0);
        return { totalOrders, totalRevenue, totalLogins, failedLogins, activeBrands, totalStores };
    }, [metrics]);

    // Filtered entries
    const filtered = useMemo(() => {
        return entries.filter(e => {
            if (brandFilter !== 'all' && e.brandId !== brandFilter) return false;
            if (actionFilter !== 'all' && e.action !== actionFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return e.details.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) ||
                    e.action.toLowerCase().includes(q) || e.brandName.toLowerCase().includes(q) ||
                    (e.storeName || '').toLowerCase().includes(q);
            }
            return true;
        });
    }, [entries, brandFilter, actionFilter, search]);

    const uniqueActions = [...new Set(entries.map(e => e.action))].sort();

    const TABS: { id: ViewTab; label: string; icon: any }[] = [
        { id: 'timeline', label: 'Activity Timeline', icon: Activity },
        { id: 'brands', label: 'Brand Analytics', icon: BarChart3 },
        { id: 'security', label: 'Security & Access', icon: Shield },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Audit Command Center</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Multi-tenant activity tracking, compliance, and operational intelligence</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 transition-all">
                    <ArrowDownToLine size={14} /> Export Report
                </button>
            </div>

            {/* ── KPI Strip ───────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <KpiCard label="Active Brands" value={totals.activeBrands} sub={`of ${metrics.length} total`} icon={Building2} accent="bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <KpiCard label="Total Stores" value={totals.totalStores} icon={Store} accent="bg-gradient-to-r from-blue-400 to-blue-600" />
                <KpiCard label="Today's Orders" value={totals.totalOrders} icon={ShoppingCart} accent="bg-gradient-to-r from-violet-400 to-violet-600" />
                <KpiCard label="Today's Revenue" value={fmtCurrency(totals.totalRevenue)} icon={DollarSign} accent="bg-gradient-to-r from-amber-400 to-orange-500" />
                <KpiCard label="Logins (7d)" value={totals.totalLogins} icon={LogIn} accent="bg-gradient-to-r from-cyan-400 to-cyan-600" />
                <KpiCard label="Failed Logins" value={totals.failedLogins} sub="last 7 days" icon={AlertTriangle} accent={totals.failedLogins > 10 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-slate-300 to-slate-400'} />
            </div>

            {/* ── Tab Navigation ───────────────────────────────────── */}
            <div className="border-b border-slate-200">
                <div className="flex items-center gap-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={cn('flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all',
                                activeTab === tab.id ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600')}>
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ──────────────────────────────────────── */}
            {activeTab === 'timeline' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition-all" />
                        </div>
                        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none pr-8">
                            <option value="all">All Brands</option>
                            {metrics.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none pr-8">
                            <option value="all">All Actions</option>
                            {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                        </select>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} events</span>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-2">
                        {filtered.map(entry => {
                            const isExpanded = expandedId === entry.id;
                            return (
                                <div key={entry.id} className={cn('bg-white rounded-2xl border shadow-sm overflow-hidden transition-all',
                                    isExpanded ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-100 hover:border-slate-200')}>
                                    <button onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/50 transition-colors">
                                        {/* Status dot */}
                                        <div className={cn('w-2 h-2 rounded-full shrink-0',
                                            entry.status === 'success' ? 'bg-emerald-500' : entry.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500')} />
                                        {/* Time */}
                                        <div className="w-20 shrink-0 text-right">
                                            <span className="text-xs font-black text-slate-900 block">{timeAgo(entry.timestamp)}</span>
                                            <span className="text-[9px] font-semibold text-slate-400">{fmtTime(entry.timestamp)}</span>
                                        </div>
                                        {/* Action Badge */}
                                        <ActionBadge action={entry.action} />
                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{entry.details}</p>
                                        </div>
                                        {/* Brand + Store */}
                                        <div className="hidden lg:flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{entry.brandName}</span>
                                            {entry.storeName && <span className="text-[10px] font-semibold text-slate-400">→ {entry.storeName}</span>}
                                        </div>
                                        {/* Actor */}
                                        <span className="hidden md:block text-[10px] font-semibold text-slate-400 w-32 truncate text-right">{entry.actor}</span>
                                        <ChevronDown size={12} className={cn('text-slate-300 shrink-0 transition-transform', isExpanded && 'rotate-180')} />
                                    </button>
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Actor</span><span className="font-bold text-slate-900">{entry.actor}</span></div>
                                                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Role</span><span className="font-bold text-slate-900">{entry.actorRole}</span></div>
                                                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Entity</span><span className="font-mono font-bold text-slate-900">{entry.entity}{entry.entityId ? ` / ${entry.entityId}` : ''}</span></div>
                                                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Timestamp</span><span className="font-bold text-slate-900">{fmtFull(entry.timestamp)}</span></div>
                                                {entry.ip && <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">IP Address</span><span className="font-mono font-bold text-slate-900">{entry.ip}</span></div>}
                                                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span><span className={cn('inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase border', STATUS_STYLES[entry.status])}>{entry.status}</span></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'brands' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/80">
                                        {['Brand', 'Status', 'Stores', 'Users', 'Today Orders', 'Today Revenue', 'Week Revenue', 'Logins (7d)', 'Last Active'].map(h => (
                                            <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {metrics.map(b => (
                                        <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                                                        <Building2 className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-slate-900 block">{b.name}</span>
                                                        <span className="text-[10px] font-mono text-slate-400">{b.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border',
                                                    b.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    b.status === 'Suspended' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200')}>
                                                    <div className={cn('w-1.5 h-1.5 rounded-full', b.status === 'Operational' ? 'bg-emerald-500 animate-pulse' : b.status === 'Suspended' ? 'bg-rose-500' : 'bg-blue-500')} />
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-black text-slate-900">{b.totalStores}</td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-black text-slate-900">{b.activeUsers}</span>
                                                <span className="text-[10px] text-slate-400"> / {b.totalUsers}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-black text-slate-900">{b.todayOrders}</td>
                                            <td className="px-5 py-4 text-sm font-black text-emerald-600">{fmtCurrency(b.todayRevenue)}</td>
                                            <td className="px-5 py-4 text-sm font-black text-slate-900">{fmtCurrency(b.weekRevenue)}</td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-black text-slate-900">{b.loginCount7d}</span>
                                                {b.failedLogins7d > 0 && (
                                                    <span className="text-[10px] font-black text-rose-500 ml-1">({b.failedLogins7d} failed)</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-semibold text-slate-500">{timeAgo(b.lastLogin)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Security Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><AlertTriangle size={18} /></div>
                                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Failed Logins (7d)</span><span className="text-2xl font-black text-slate-900">{totals.failedLogins}</span></div>
                            </div>
                            <div className="space-y-2">
                                {metrics.filter(b => b.failedLogins7d > 0).sort((a, b) => b.failedLogins7d - a.failedLogins7d).map(b => (
                                    <div key={b.id} className="flex items-center justify-between py-1.5">
                                        <span className="text-xs font-semibold text-slate-600">{b.name}</span>
                                        <span className={cn('text-xs font-black', b.failedLogins7d > 5 ? 'text-rose-600' : 'text-amber-600')}>{b.failedLogins7d} attempts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Eye size={18} /></div>
                                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Impersonations (7d)</span><span className="text-2xl font-black text-slate-900">{entries.filter(e => e.action === 'IMPERSONATION_STARTED').length}</span></div>
                            </div>
                            <div className="space-y-2">
                                {entries.filter(e => e.action.includes('IMPERSONATION')).map(e => (
                                    <div key={e.id} className="flex items-center justify-between py-1.5">
                                        <span className="text-xs font-semibold text-slate-600">{e.brandName}</span>
                                        <span className="text-[10px] font-semibold text-slate-400">{timeAgo(e.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Shield size={18} /></div>
                                <div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tenant Lifecycle</span><span className="text-2xl font-black text-slate-900">{entries.filter(e => e.entity === 'TENANT').length}</span></div>
                            </div>
                            <div className="space-y-2">
                                {entries.filter(e => e.entity === 'TENANT').map(e => (
                                    <div key={e.id} className="flex items-center justify-between py-1.5">
                                        <div className="flex items-center gap-2">
                                            <ActionBadge action={e.action} />
                                            <span className="text-xs font-semibold text-slate-600">{e.brandName}</span>
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-400">{timeAgo(e.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Security Events Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900">Security Event Log</h3>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Login attempts, impersonation sessions, and access anomalies</p>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {entries.filter(e => ['USER_LOGIN', 'USER_LOGIN_FAILED', 'IMPERSONATION_STARTED', 'IMPERSONATION_ENDED'].includes(e.action)).map(e => (
                                <div key={e.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                                    <div className={cn('w-2 h-2 rounded-full shrink-0', e.status === 'success' ? 'bg-emerald-500' : e.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500')} />
                                    <span className="text-xs font-black text-slate-900 w-16">{timeAgo(e.timestamp)}</span>
                                    <ActionBadge action={e.action} />
                                    <span className="text-xs font-semibold text-slate-600 flex-1 truncate">{e.details}</span>
                                    <span className="text-[10px] font-semibold text-slate-400 w-28 text-right truncate">{e.actor}</span>
                                    {e.ip && <span className="text-[10px] font-mono text-slate-400">{e.ip}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
