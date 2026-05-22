'use client';

import React from 'react';
import {
    Activity, Store as StoreIcon, Users, MapPin, Clock, Calendar,
    CheckCircle2, Navigation, Shield,
} from 'lucide-react';
import { cn } from '@/utils';
import type { Store, StoreDetailConfig, StoreUser } from '@/shared/types/store';
import { evaluateGoLiveReadiness } from '@/shared/types/store';
import { StoreStatusBadge } from '../shared/StoreStatusBadge';
import { GoLiveChecklist } from '../shared/GoLiveChecklist';

interface StoreOverviewTabProps {
    store: Store;
    config?: StoreDetailConfig;
    users?: StoreUser[];
    onPublish?: () => void;
    isPublishing?: boolean;
}

function StatCard({ label, value, icon: Icon, color, accent }: {
    label: string; value: string | number; icon: any; color?: string; accent?: string;
}) {
    return (
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 overflow-hidden">
            <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80', accent || 'bg-gradient-to-r from-slate-300 to-slate-400')} />
            <div className="flex items-start gap-4 pt-1">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300', color || 'bg-slate-100 text-slate-500')}>
                    <Icon size={19} />
                </div>
                <div className="min-w-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] block">{label}</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block tracking-tight">{value || '—'}</span>
                </div>
            </div>
        </div>
    );
}

export function StoreOverviewTab({ store, config, users, onPublish, isPublishing }: StoreOverviewTabProps) {
    const readiness = evaluateGoLiveReadiness(store, config, users);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Status" value={store.status} icon={Activity}
                    color={store.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : store.status === 'Draft' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}
                    accent={store.status === 'Active' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : store.status === 'Draft' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-slate-300 to-slate-400'} />
                <StatCard label="Users" value={store.usersCount ?? users?.length ?? 0} icon={Users}
                    color="bg-violet-100 text-violet-600" accent="bg-gradient-to-r from-violet-400 to-purple-500" />
                <StatCard label="Delivery Radius" value={store.deliveryRadiusKm ? `${store.deliveryRadiusKm} km` : '—'} icon={Navigation}
                    color="bg-blue-100 text-blue-600" accent="bg-gradient-to-r from-blue-400 to-indigo-500" />
                <StatCard label="Tax Profile" value={store.taxProfile} icon={Shield}
                    color="bg-amber-100 text-amber-600" accent="bg-gradient-to-r from-amber-400 to-orange-500" />
            </div>

            {/* Go-Live Readiness */}
            {store.status === 'Draft' && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-amber-500" />
                        <CheckCircle2 size={14} />
                        Go-Live Readiness
                    </h3>
                    <GoLiveChecklist
                        checks={readiness.checks}
                        status={readiness.status}
                        score={readiness.score}
                        onPublish={onPublish}
                        isPublishing={isPublishing}
                    />
                </section>
            )}

            {/* Store Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-slate-900" />
                        <StoreIcon size={14} />
                        Store Identity
                    </h3>
                    <div className="space-y-0">
                        <InfoRow label="Store Name" value={store.name} icon={StoreIcon} />
                        <InfoRow label="Code" value={store.code} mono />
                        <InfoRow label="Status" value={store.status} />
                        <InfoRow label="Manager" value={store.adminName} icon={Users} muted={!store.adminName} />
                        <InfoRow label="Manager Email" value={store.adminEmail} muted={!store.adminEmail} />
                    </div>
                </section>

                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-emerald-500" />
                        <MapPin size={14} />
                        Location
                    </h3>
                    <div className="space-y-0">
                        <InfoRow label="Address" value={store.address} icon={MapPin} muted={!store.address} />
                        <InfoRow label="City" value={store.city} />
                        <InfoRow label="Province" value={store.province} />
                        <InfoRow label="Postal Code" value={store.postalCode} mono muted={!store.postalCode} />
                        <InfoRow label="Timezone" value={store.timezone} icon={Clock} />
                    </div>
                </section>
            </div>

            {/* Timeline */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                    <span className="w-1 h-5 rounded-full bg-slate-400" />
                    <Calendar size={14} />
                    Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    <InfoRow label="Created" value={store.createdAt} icon={Calendar} />
                    <InfoRow label="Phone" value={store.phone} muted={!store.phone} />
                    <InfoRow label="Email" value={store.email} muted={!store.email} />
                </div>
            </section>
        </div>
    );
}

// ─── Shared sub-component ───────────────────────────────────────────────────

function InfoRow({ label, value, icon: Icon, mono, muted }: {
    label: string; value: string | number | undefined; icon?: any; mono?: boolean; muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-3.5 border-b border-slate-50/80 last:border-0 group hover:bg-slate-50/40 -mx-2 px-2 rounded-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-2.5">
                {Icon && <Icon size={13} className="text-slate-400 group-hover:text-slate-600 transition-colors" />}
                {label}
            </span>
            <span className={cn(
                'text-sm font-bold text-slate-900 max-w-[60%] text-right truncate',
                mono && 'font-mono text-xs bg-slate-100 px-2 py-0.5 rounded',
                muted && 'text-slate-400 font-medium'
            )}>
                {value || '—'}
            </span>
        </div>
    );
}
