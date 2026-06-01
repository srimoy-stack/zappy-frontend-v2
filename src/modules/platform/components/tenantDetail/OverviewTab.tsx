'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    Building2, Mail, Phone, MapPin, Globe, Coins, Shield, Calendar,
    Users, Store, LayoutGrid, Activity, Pencil, X, Save, Loader2,
    CheckCircle2, Bot, PhoneCall, Clock, DollarSign, ImageIcon, Upload, Hash,
} from 'lucide-react';
import type { Brand } from '@/shared/types/tenant';
import { TENANT_STATUS_CONFIG, TenantStatus } from '@/shared/types/tenant';
import { updateTenant, brandToEditPayload, type TenantEditPayload } from '@/modules/platform/services/tenant.service';
import { cn } from '@/utils';

// ─── Props ──────────────────────────────────────────────────────────────────

interface OverviewTabProps {
    brand: Brand;
    tenantId: string;
    onBrandUpdate?: (updated: Partial<Brand>) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TIMEZONES = [
    'America/Toronto', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Halifax', 'America/Vancouver', 'America/Winnipeg',
    'Asia/Kolkata', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney',
];
const CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'JPY'];
const PROVINCES = ['Ontario', 'British Columbia', 'Quebec', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick'];
const PAYMENT_TYPES = [
    { value: 'PREPAID', label: 'Prepaid' },
    { value: 'NET_DAYS', label: 'Net Days' },
    { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
];
const STORE_STRATEGIES = [
    { value: 'SINGLE_STORE', label: 'Single Store' },
    { value: 'FRANCHISE', label: 'Multi-Store / Franchise' },
];

// ─── Reusable Sub-components ────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, accent }: {
    label: string; value: string | number; icon: any; color?: string; accent?: string;
}) {
    return (
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 overflow-hidden">
            {/* Gradient accent bar */}
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

function SectionHeader({ icon: Icon, title, accentColor }: { icon: any; title: string; accentColor?: string }) {
    return (
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
            <span className={cn('w-1 h-5 rounded-full', accentColor || 'bg-slate-900')} />
            <Icon size={14} />
            {title}
        </h3>
    );
}

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

function EditField({ label, value, onChange, type = 'text', icon: Icon, placeholder, disabled, mono }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; icon?: any; placeholder?: string; disabled?: boolean; mono?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />}
                <input type={type} value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} disabled={disabled}
                    className={cn(
                        "w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all",
                        Icon && "pl-11", disabled && "opacity-50 cursor-not-allowed", mono && "font-mono"
                    )} />
            </div>
        </div>
    );
}

function SelectField({ label, value, onChange, options, icon: Icon }: {
    label: string; value: string; onChange: (v: string) => void;
    options: string[] | { value: string; label: string }[]; icon?: any;
}) {
    const opts = typeof options[0] === 'string'
        ? (options as string[]).map(o => ({ value: o, label: o }))
        : options as { value: string; label: string }[];
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />}
                <select value={value} onChange={e => onChange(e.target.value)}
                    className={cn(
                        "w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none",
                        Icon && "pl-11"
                    )}>
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        </div>
    );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function OverviewTab({ brand, tenantId, onBrandUpdate }: OverviewTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const lightLogoRef = useRef<HTMLInputElement>(null);
    const darkLogoRef = useRef<HTMLInputElement>(null);

    // ── Single edit payload — mirrors OnboardingBrandData exactly ──
    const [form, setForm] = useState<TenantEditPayload>(() => brandToEditPayload(brand));
    const set = (key: keyof TenantEditPayload, value: any) => setForm(prev => ({ ...prev, [key]: value }));

    const handleFileUpload = useCallback((file: File, field: 'lightLogo' | 'darkLogo') => {
        const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) { alert('Upload PNG, SVG, JPEG, or WebP.'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('File must be under 5MB.'); return; }
        const reader = new FileReader();
        reader.onload = (e) => set(field, e.target?.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleCancel = () => {
        setForm(brandToEditPayload(brand));
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await updateTenant(tenantId, form);
            onBrandUpdate?.(updated);
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            alert(err?.response?.data?.detail || err?.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Stats Row ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Status" value={brand.status} icon={Activity}
                    color={brand.status === 'Operational' ? 'bg-emerald-100 text-emerald-600' : brand.status === 'Suspended' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}
                    accent={brand.status === 'Operational' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : brand.status === 'Suspended' ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'} />
                <StatCard label="Stores" value={brand.totalStores} icon={Store} color="bg-blue-100 text-blue-600" accent="bg-gradient-to-r from-blue-400 to-indigo-500" />
                <StatCard label="Users" value={brand.totalUsers || 0} icon={Users} color="bg-violet-100 text-violet-600" accent="bg-gradient-to-r from-violet-400 to-purple-500" />
                <StatCard label="Active Modules" value={brand.enabledModules?.length || brand.modulesPurchasedCount} icon={LayoutGrid} color="bg-amber-100 text-amber-600" accent="bg-gradient-to-r from-amber-400 to-orange-500" />
            </div>

            {/* ── Onboarding Progress ──────────────────────────────── */}
            {(brand.onboardingProgress !== undefined && brand.onboardingProgress < 100) && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Onboarding Progress</span>
                        <span className="text-sm font-black text-slate-900">{brand.onboardingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${brand.onboardingProgress}%` }} />
                    </div>
                </div>
            )}

            {/* ── Edit Toggle ──────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3">
                {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                        <CheckCircle2 size={14} /> Saved successfully
                    </span>
                )}
                {isEditing ? (
                    <>
                        <button onClick={handleCancel}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all">
                            <X size={14} /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-900 transition-all">
                        <Pencil size={14} /> Edit Brand Details
                    </button>
                )}
            </div>

            {/* ── Brand Identity + Location ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <SectionHeader icon={Building2} title="Brand Identity" accentColor="bg-slate-900" />
                    {isEditing ? (
                        <div className="space-y-4">
                            <EditField label="Display Name" value={form.brandName} onChange={v => set('brandName', v)} icon={Building2} />
                            <EditField label="Legal Name" value={form.brandLegalName} onChange={v => set('brandLegalName', v)} icon={Shield} />
                            <EditField label="Trade Name" value={form.tradeName} onChange={v => set('tradeName', v)} />
                            <EditField label="Slug (read-only)" value={brand.slug} onChange={() => {}} disabled mono />
                        </div>
                    ) : (
                        <div className="space-y-0">
                            <InfoRow label="Legal Name" value={form.brandLegalName} icon={Shield} />
                            <InfoRow label="Display Name" value={form.brandName} icon={Building2} />
                            <InfoRow label="Trade Name" value={form.tradeName} />
                            <InfoRow label="Slug" value={brand.slug} mono />
                            <InfoRow label="Plan" value={brand.plan} />
                        </div>
                    )}
                </section>

                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <SectionHeader icon={MapPin} title="Global Headquarters" accentColor="bg-emerald-500" />
                    {isEditing ? (
                        <div className="space-y-4">
                            <EditField label="Address Line 1" value={form.addressLine1} onChange={v => set('addressLine1', v)} icon={MapPin} placeholder="Street address or P.O. box" />
                            <EditField label="Address Line 2" value={form.addressLine2} onChange={v => set('addressLine2', v)} icon={MapPin} placeholder="Apartment, suite, unit" />
                            <div className="grid grid-cols-2 gap-4">
                                <EditField label="City" value={form.city} onChange={v => set('city', v)} icon={Building2} />
                                <SelectField label="Province / State" value={form.province} onChange={v => set('province', v)} options={PROVINCES} icon={Globe} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <EditField label="Postal / Zip Code" value={form.postalCode} onChange={v => set('postalCode', v)} icon={Hash} mono />
                                <EditField label="Country" value={form.country} onChange={() => {}} disabled icon={Globe} />
                            </div>
                            <EditField label="Contact Email" value={form.contactEmail} onChange={v => set('contactEmail', v)} type="email" icon={Mail} />
                            <EditField label="Contact Phone" value={form.contactPhone} onChange={v => set('contactPhone', v)} type="tel" icon={Phone} />
                        </div>
                    ) : (
                        <div className="space-y-0">
                            <InfoRow label="Address" value={[form.addressLine1, form.addressLine2].filter(Boolean).join(', ') || brand.address} icon={MapPin} />
                            <InfoRow label="City" value={form.city} icon={Building2} />
                            <InfoRow label="Province" value={form.province} icon={Globe} />
                            <InfoRow label="Postal Code" value={form.postalCode} mono />
                            <InfoRow label="Contact Email" value={form.contactEmail} icon={Mail} />
                            <InfoRow label="Contact Phone" value={form.contactPhone} icon={Phone} />
                        </div>
                    )}
                </section>
            </div>

            {/* ── System Configuration ─────────────────────────── */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <SectionHeader icon={Globe} title="Operational Configuration" accentColor="bg-blue-500" />
                {isEditing ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <SelectField label="Timezone" value={form.timezone} onChange={v => set('timezone', v)} options={TIMEZONES} icon={Clock} />
                            <SelectField label="Currency" value={form.currency} onChange={v => set('currency', v)} options={CURRENCIES} icon={DollarSign} />
                            <SelectField label="Store Architecture" value={form.storeStrategy} onChange={v => set('storeStrategy', v)} options={STORE_STRATEGIES} icon={Building2} />
                            {form.storeStrategy === 'FRANCHISE' && (
                                <EditField label="Max Stores Limit" value={String(form.maxStores)} onChange={v => set('maxStores', parseInt(v) || 1)} type="number" />
                            )}
                        </div>
                        {/* Payment Terms — same as onboarding */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Default Payment Terms</label>
                            <div className="grid grid-cols-3 gap-3">
                                {PAYMENT_TYPES.map(pt => (
                                    <button key={pt.value} type="button" onClick={() => set('paymentTermType', pt.value)}
                                        className={cn("p-4 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest",
                                            form.paymentTermType === pt.value
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')}>
                                        {pt.label}
                                    </button>
                                ))}
                            </div>
                            {form.paymentTermType === 'NET_DAYS' && (
                                <div className="mt-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Net Days (Maturity)</label>
                                    <div className="flex items-center gap-4">
                                        <input type="number" value={form.netDays} onChange={e => set('netDays', parseInt(e.target.value) || 0)} min="1"
                                            className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-lg font-black text-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all" />
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Days after invoice</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <InfoRow label="Timezone" value={form.timezone} icon={Globe} />
                        <InfoRow label="Currency" value={form.currency} icon={Coins} />
                        <InfoRow label="Payment Terms" value={form.paymentTermType === 'NET_DAYS' ? `Net ${form.netDays} Days` : form.paymentTermType === 'PREPAID' ? 'Prepaid' : 'Due on Receipt'} />
                        <InfoRow label="Architecture" value={form.storeStrategy === 'FRANCHISE' ? 'Franchise' : 'Single Store'} icon={Building2} />
                        <InfoRow label="Max Stores" value={form.storeStrategy === 'FRANCHISE' ? form.maxStores : 1} />
                    </div>
                )}
            </section>

            {/* ── Identity Assets (Logos) ──────────────────────── */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <SectionHeader icon={ImageIcon} title="Identity Assets" accentColor="bg-pink-500" />
                <input ref={lightLogoRef} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'lightLogo'); e.target.value = ''; }} />
                <input ref={darkLogoRef} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'darkLogo'); e.target.value = ''; }} />
                <div className="grid grid-cols-2 gap-6">
                    {(['lightLogo', 'darkLogo'] as const).map(field => {
                        const isDark = field === 'darkLogo';
                        const val = form[field];
                        return (
                            <div key={field} className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Brand Logo ({isDark ? 'Dark' : 'Light'} Mode)
                                </p>
                                {val ? (
                                    <div className={cn("relative aspect-[3/1] rounded-2xl border overflow-hidden group",
                                        isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200")}>
                                        <img src={val} alt={`${field} logo`} className="w-full h-full object-contain p-4" />
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                                                <button type="button" onClick={() => set(field, null)} className="p-2 bg-red-500 rounded-xl text-white shadow-lg"><X size={16} /></button>
                                                <button type="button" onClick={() => (isDark ? darkLogoRef : lightLogoRef).current?.click()} className="p-2 bg-white rounded-xl text-slate-900 shadow-lg"><Upload size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div onClick={() => isEditing && (isDark ? darkLogoRef : lightLogoRef).current?.click()}
                                        className={cn("aspect-[3/1] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all",
                                            isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50/50",
                                            isEditing ? "cursor-pointer hover:border-slate-500" : "cursor-default")}>
                                        <Upload className={cn("w-5 h-5 mb-1", isDark ? "text-slate-500" : "text-slate-400")} />
                                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>
                                            {isEditing ? 'Click to upload' : 'No logo set'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── AI Call Analytics (Vapi) ─────────────────────── */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <SectionHeader icon={Bot} title="AI Call Analytics (Vapi)" accentColor="bg-purple-500" />
                {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <EditField label="Vapi Assistant ID" value={form.vapiAssistantId || ''} onChange={v => set('vapiAssistantId', v)} icon={Bot} placeholder="asst_abc123..." mono />
                        <EditField label="Vapi Phone Number" value={form.vapiPhoneNumber || ''} onChange={v => set('vapiPhoneNumber', v)} icon={PhoneCall} placeholder="+1320..." />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        <InfoRow label="Assistant ID" value={form.vapiAssistantId || undefined} icon={Bot} mono muted={!form.vapiAssistantId} />
                        <InfoRow label="Phone Number" value={form.vapiPhoneNumber || undefined} icon={PhoneCall} muted={!form.vapiPhoneNumber} />
                    </div>
                )}
            </section>

            {/* ── Timeline (always read-only) ─────────────────── */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <SectionHeader icon={Calendar} title="Timeline" accentColor="bg-slate-400" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    <InfoRow label="Created" value={brand.createdDate} icon={Calendar} />
                    <InfoRow label="Created By" value={brand.createdBy} />
                    <InfoRow label="Last Activity" value={brand.lastActivity} icon={Activity} muted={!brand.lastActivity} />
                </div>
            </section>
        </div>
    );
}
