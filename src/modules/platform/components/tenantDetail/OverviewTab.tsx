'use client';

import React from 'react';
import { Building2, Mail, Phone, MapPin, Globe, Coins, Shield, Calendar, Users, Store, LayoutGrid, Activity } from 'lucide-react';
import type { Brand } from '@/shared/types/tenant';
import { TENANT_STATUS_CONFIG, TenantStatus } from '@/shared/types/tenant';
import { cn } from '@/utils';

interface OverviewTabProps {
    brand: Brand;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color?: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color || 'bg-slate-100 text-slate-500')}>
                <Icon size={18} />
            </div>
            <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{value || '—'}</span>
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | undefined; icon?: any }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                {Icon && <Icon size={12} className="text-slate-400" />}
                {label}
            </span>
            <span className="text-sm font-black text-slate-900">{value || '—'}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: TenantStatus }) {
    const config = TENANT_STATUS_CONFIG[status] || TENANT_STATUS_CONFIG.Draft;
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
            config.bgColor, config.color, config.borderColor
        )}>
            <div className={cn('w-1.5 h-1.5 rounded-full', status === 'Operational' ? 'bg-emerald-500 animate-pulse' : status === 'Suspended' ? 'bg-rose-500' : 'bg-current')} />
            {config.label}
        </span>
    );
}

export function OverviewTab({ brand }: OverviewTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Operational Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Status" value={brand.status} icon={Activity} color={
                    brand.status === 'Operational' ? 'bg-emerald-100 text-emerald-600' :
                    brand.status === 'Suspended' ? 'bg-rose-100 text-rose-600' :
                    'bg-blue-100 text-blue-600'
                } />
                <StatCard label="Stores" value={brand.totalStores} icon={Store} color="bg-blue-100 text-blue-600" />
                <StatCard label="Users" value={brand.totalUsers || 0} icon={Users} color="bg-violet-100 text-violet-600" />
                <StatCard label="Active Modules" value={brand.enabledModules?.length || brand.modulesPurchasedCount} icon={LayoutGrid} color="bg-amber-100 text-amber-600" />
            </div>

            {/* Identity + Legal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-l-4 border-slate-900 pl-3">
                        <Building2 size={14} /> Brand Identity
                    </h3>
                    <div className="space-y-0">
                        <InfoRow label="Legal Name" value={brand.brandLegalName} icon={Shield} />
                        <InfoRow label="Display Name" value={brand.brandName} />
                        <InfoRow label="Trade Name" value={brand.tradeName} />
                        <InfoRow label="Slug" value={brand.slug} />
                        <InfoRow label="Plan" value={brand.plan} />
                    </div>
                </section>

                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-l-4 border-slate-900 pl-3">
                        <MapPin size={14} /> Location & Contact
                    </h3>
                    <div className="space-y-0">
                        <InfoRow label="Address" value={brand.address} icon={MapPin} />
                        <InfoRow label="Province" value={brand.province} />
                        <InfoRow label="Contact Email" value={brand.primaryContact} icon={Mail} />
                        <InfoRow label="Contact Phone" value={brand.contactPhone} icon={Phone} />
                    </div>
                </section>
            </div>

            {/* Configuration */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-l-4 border-slate-900 pl-3">
                    <Globe size={14} /> System Configuration
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <InfoRow label="Timezone" value={brand.timezone} icon={Globe} />
                    <InfoRow label="Currency" value={brand.currency} icon={Coins} />
                    <InfoRow label="Payment Terms" value={brand.defaultPaymentTerms} />
                    <InfoRow label="Tax Scheme" value={brand.defaultTaxScheme} />
                </div>
            </section>

            {/* Timeline */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-l-4 border-slate-900 pl-3">
                    <Calendar size={14} /> Timeline
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <InfoRow label="Created" value={brand.createdDate} icon={Calendar} />
                    <InfoRow label="Created By" value={brand.createdBy} />
                    <InfoRow label="Last Activity" value={brand.lastActivity || 'No recent activity'} />
                </div>
            </section>
        </div>
    );
}
