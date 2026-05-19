'use client';


import {
    Building2, Users, Store, LayoutGrid, Activity, TrendingUp,
    CheckCircle2, AlertTriangle, Clock, ArrowUpRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TENANT_STATUS_CONFIG, TenantStatus } from '@/shared/types/tenant';
import { cn } from '@/utils';

// ─── Mock Platform Stats (replace with API) ─────────────────────────────────

const STATS = {
    totalTenants: 24,
    operational: 18,
    provisioned: 3,
    configuring: 2,
    suspended: 1,
    totalStores: 156,
    totalUsers: 412,
    platformUsers: 6,
    activeModules: 14,
};

const RECENT_ACTIVITY = [
    { id: '1', event: 'Tenant onboarded', detail: 'QuickBite Foods — 3 modules enabled', time: '2 hours ago', type: 'success' as const },
    { id: '2', event: 'Module enabled', detail: 'Email Campaigns → Acme Pizza Co.', time: '5 hours ago', type: 'info' as const },
    { id: '3', event: 'User provisioned', detail: 'Sarah Chen as Store Manager', time: '8 hours ago', type: 'info' as const },
    { id: '4', event: 'Tenant suspended', detail: 'Burger Nation Inc. — billing inquiry', time: '1 day ago', type: 'warning' as const },
    { id: '5', event: 'Impersonation session', detail: 'Support accessed Acme Pizza admin', time: '2 days ago', type: 'warning' as const },
];

function StatCard({ label, value, icon: Icon, color, href }: { label: string; value: number | string; icon: any; color: string; href?: string }) {
    const router = useRouter();
    return (
        <button
            onClick={() => href && router.push(href)}
            className={cn(
                'bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left transition-all group',
                href && 'hover:shadow-md hover:border-slate-200 cursor-pointer'
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                    <Icon size={18} />
                </div>
                {href && <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />}
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
            <span className="text-3xl font-black text-slate-900 block mt-1">{value}</span>
        </button>
    );
}

function StatusBreakdown() {
    const statuses: { status: TenantStatus; count: number }[] = [
        { status: 'Operational', count: STATS.operational },
        { status: 'Provisioned', count: STATS.provisioned },
        { status: 'Configuring', count: STATS.configuring },
        { status: 'Suspended', count: STATS.suspended },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tenant Status Breakdown</h3>
            <div className="space-y-3">
                {statuses.map(({ status, count }) => {
                    const config = TENANT_STATUS_CONFIG[status];
                    const pct = Math.round((count / STATS.totalTenants) * 100);
                    return (
                        <div key={status} className="flex items-center gap-3">
                            <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border', config.bgColor, config.color, config.borderColor)}>
                                {config.label}
                            </span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn('h-full rounded-full transition-all', config.bgColor)} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm font-black text-slate-900 tabular-nums w-8 text-right">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function PlatformDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Dashboard</h1>
                <p className="text-slate-500 font-medium mt-1">Multi-tenant governance overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Tenants" value={STATS.totalTenants} icon={Building2} color="bg-slate-900 text-white" href="/platform/tenants" />
                <StatCard label="Stores" value={STATS.totalStores} icon={Store} color="bg-blue-100 text-blue-600" />
                <StatCard label="Tenant Users" value={STATS.totalUsers} icon={Users} color="bg-violet-100 text-violet-600" />
                <StatCard label="Platform Users" value={STATS.platformUsers} icon={Users} color="bg-amber-100 text-amber-600" href="/platform/users" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Breakdown */}
                <StatusBreakdown />

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recent Platform Activity</h3>
                    <div className="space-y-3">
                        {RECENT_ACTIVITY.map(event => (
                            <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className={cn(
                                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                                    event.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    event.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                    'bg-blue-100 text-blue-600'
                                )}>
                                    {event.type === 'success' ? <CheckCircle2 size={14} /> :
                                     event.type === 'warning' ? <AlertTriangle size={14} /> :
                                     <Activity size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-black text-slate-900 block">{event.event}</span>
                                    <span className="text-xs text-slate-500 font-medium block mt-0.5">{event.detail}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                                    <Clock size={10} /> {event.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Module Registry Summary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Registry</h3>
                    <span className="text-xs font-bold text-slate-500">{STATS.activeModules} modules registered</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">
                        Registry-driven architecture active — all navigation, entitlements, and route guards derive from <code className="bg-emerald-100 px-1 rounded text-[10px]">moduleRegistry.ts</code>
                    </span>
                </div>
            </div>
        </div>
    );
}
