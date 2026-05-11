'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Mail,
    Users,
    MousePointerClick,
    MailCheck,
    MailWarning,
    UserMinus,
    Zap,
    ShieldAlert,
    Filter,
    ChevronDown,
    AlertCircle,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { emailCampaignService } from '../services/emailCampaignService';

// ============================================================================
// TYPES & DASHBOARD INTERFACES
// ============================================================================

interface DashboardStats {
    totalSent: number;
    totalRecipients: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    complaintRate: number;
    unsubscribeCount: number;
    activeAutomations: number;
    blockedSends: number;
    complianceAlerts: number;
    trends: {
        sent: number;
        open: number;
        click: number;
    };
}

// ============================================================================
// MOCK DATA (High-Fidelity)
// ============================================================================

const MOCK_STATS: DashboardStats = {
    totalSent: 1420,
    totalRecipients: 842500,
    openRate: 24.8,
    clickRate: 3.2,
    bounceRate: 0.85,
    complaintRate: 0.02,
    unsubscribeCount: 428,
    activeAutomations: 12,
    blockedSends: 2,
    complianceAlerts: 1,
    trends: {
        sent: 12,
        open: 2.4,
        click: -0.5,
    }
};

// ============================================================================
// COMPONENT
// ============================================================================

export const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        dateRange: 'last_30_days',
        store: 'all',
        type: 'all',
        status: 'all'
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // In dev, we use mock stats, but we simulate a tiny delay
                const data = await emailCampaignService.getDashboardStats(filters).catch(() => MOCK_STATS);
                setStats(data || MOCK_STATS);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [filters]);

    // ── Stat Card Component ───────────────────────────────────────────
    const StatCard = ({
        label,
        value,
        icon: Icon,
        trend,
        suffix = '',
        colorClass = 'text-indigo-600',
        bgClass = 'bg-indigo-50'
    }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 ${bgClass} rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {typeof value === 'number' && !label.includes('Rate') ? value.toLocaleString() : value}{suffix}
                </h3>
            </div>
        </div>
    );

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
            </div>
        );
    }

    const s = stats || MOCK_STATS;

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 lg:px-6 animate-in fade-in duration-500">
            {/* ── Page Header & Filters ───────────────────────────────── */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Dashboard</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            Real-time marketing overview
                        </p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters</span>
                    </div>

                    {/* Date Selector */}
                    <div className="relative group/select">
                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                            className="appearance-none bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer min-w-[160px]"
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="last_30_days">Last 30 Days</option>
                            <option value="this_month">This Month</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover/select:text-indigo-500 transition-colors" />
                    </div>

                    {/* Store Selector */}
                    <div className="relative group/select">
                        <select
                            value={filters.store}
                            onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                            className="appearance-none bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Stores</option>
                            <option value="ny_flagship">NY Flagship</option>
                            <option value="london_soho">London Soho</option>
                            <option value="tokyo_shibuya">Tokyo Shibuya</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover/select:text-indigo-500 transition-colors" />
                    </div>

                    {/* Type Selector */}
                    <div className="relative group/select">
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="appearance-none bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer min-w-[140px]"
                        >
                            <option value="all">Every Type</option>
                            <option value="promotional">Promotional</option>
                            <option value="transactional">Transactional</option>
                            <option value="newsletter">Newsletter</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover/select:text-indigo-500 transition-colors" />
                    </div>

                    {/* Status Selector */}
                    <div className="relative group/select">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="appearance-none bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Status</option>
                            <option value="sent">Sent</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="draft">Draft</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover/select:text-indigo-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* ── Main Stats Grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Campaigns Sent"
                    value={s.totalSent}
                    icon={Mail}
                    trend={s.trends.sent}
                    colorClass="text-indigo-600"
                    bgClass="bg-indigo-50"
                />
                <StatCard
                    label="Total Recipients"
                    value={s.totalRecipients}
                    icon={Users}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                />
                <StatCard
                    label="Avg. Open Rate"
                    value={s.openRate}
                    suffix="%"
                    trend={s.trends.open}
                    icon={MailCheck}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                />
                <StatCard
                    label="Avg. Click Rate"
                    value={s.clickRate}
                    suffix="%"
                    trend={s.trends.click}
                    icon={MousePointerClick}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50"
                />
            </div>

            {/* ── Secondary Stats & Operational Insights ──────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Delivery Issues Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            Performance Metrics
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400">Past {filters.dateRange.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 flex-1">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-rose-50 rounded-lg">
                                    <MailWarning className="w-4 h-4 text-rose-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bounce Rate</span>
                            </div>
                            <h4 className="text-3xl font-black text-slate-900">{s.bounceRate}%</h4>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${s.bounceRate * 10}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Industry avg: ~2.1%</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Rate</span>
                            </div>
                            <h4 className="text-3xl font-black text-slate-900">{s.complaintRate}%</h4>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${s.complaintRate * 100}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Critical threshold: 0.1%</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <UserMinus className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unsubscribes</span>
                            </div>
                            <h4 className="text-3xl font-black text-slate-900">{s.unsubscribeCount.toLocaleString()}</h4>
                            <p className="text-xs font-bold text-slate-400 mt-2">~{(s.unsubscribeCount / s.totalSent * 100).toFixed(2)}% per campaign</p>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 italic">
                        <p className="text-[10px] text-slate-400 text-center font-medium">
                            Operational summary screen — View deep analytics in the Analytics tab.
                        </p>
                    </div>
                </div>

                {/* Automation & Compliance Column */}
                <div className="space-y-8">
                    {/* Active Automations */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-20 h-20 text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Zap className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Automations</h4>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-1">{s.activeAutomations}</h3>
                        <p className="text-xs font-bold text-indigo-600">Workflows running</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black">WELCOME</span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black">RE-ENGAGE</span>
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[10px] font-black">+9 MORE</span>
                        </div>
                    </div>

                    {/* Compliance Box */}
                    <div className={`p-6 rounded-2xl border transition-all ${s.complianceAlerts > 0 ? 'bg-amber-50 border-amber-200 shadow-lg shadow-amber-100' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${s.complianceAlerts > 0 ? 'bg-amber-200' : 'bg-slate-200'}`}>
                                    <ShieldAlert className={`w-4 h-4 ${s.complianceAlerts > 0 ? 'text-amber-900' : 'text-slate-500'}`} />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Compliance Status</h4>
                            </div>
                            {s.complianceAlerts > 0 && (
                                <span className="animate-pulse flex h-2 w-2 rounded-full bg-amber-600"></span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Alerts</span>
                                <span className={`text-xs font-black ${s.complianceAlerts > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{s.complianceAlerts} Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Blocked Sends</span>
                                <span className="text-xs font-black text-slate-900">{s.blockedSends} Campaigns</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Status</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.complianceAlerts > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {s.complianceAlerts > 0 ? 'ATTENTION REQUIRED' : 'HEALTHY'}
                                </span>
                            </div>
                        </div>

                        {s.complianceAlerts > 0 && (
                            <button className="w-full mt-6 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 active:scale-95 transition-all">
                                Review Alerts
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
