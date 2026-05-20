'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2,
    Building2, MapPin, Phone, Mail, Globe, Clock, DollarSign,
    Bot, PhoneCall, Shield, Hash, Coins, ImageIcon, Upload,
    User, Send, Smartphone, Server, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils';
import { apiClient } from '@/shared/api/apiClient';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TenantEditData {
    name: string;
    legal_name: string;
    slug: string;
    status: string;
    contact_email: string;
    contact_phone: string;
    timezone: string;
    currency: string;
    vapi_assistant_id: string;
    settings: {
        tradeName?: string;
        address?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        country?: string;
        paymentTermType?: string;
        netDays?: number;
        vapi?: { assistantId?: string; phoneNumber?: string };
        email?: { provider?: string; senderName?: string; senderEmail?: string; host?: string; port?: number; encryption?: string; replyTo?: string };
        sms?: { provider?: string; senderId?: string };
        [key: string]: any;
    };
    enabledModules?: string[];
    modules?: Array<{ module_key: string; enabled: boolean }>;
    users?: Array<{ id: number; name: string; email: string; role: string }>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TIMEZONES = [
    'Eastern Standard Time (EST)', 'Central Standard Time (CST)',
    'Mountain Standard Time (MST)', 'Pacific Standard Time (PST)',
    'Atlantic Standard Time (AST)', 'India Standard Time (IST)',
    'Greenwich Mean Time (GMT)', 'Central European Time (CET)',
];
const CURRENCIES = ['CAD ($)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)', 'AUD ($)', 'JPY (¥)'];
const PROVINCES = ['Ontario', 'British Columbia', 'Quebec', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick'];
const PAYMENT_TYPES = [
    { value: 'PREPAID', label: 'Prepaid' },
    { value: 'NET_DAYS', label: 'Net Days' },
    { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
];

const PHASE_1_IDS = new Set(['email-campaigns', 'ai-call-analytics']);

const ALL_MODULES = [
    { id: 'email-campaigns', label: 'Email Campaigns', description: 'Campaign orchestration, templates & analytics', comingSoon: false },
    { id: 'ai-call-analytics', label: 'AI Call Analytics', description: 'Vapi-powered call analysis & insights', comingSoon: false },
    { id: 'pos', label: 'Point of Sale', description: 'Full POS terminal operations', comingSoon: true },
    { id: 'sales-activity', label: 'Sales Activity', description: 'Sales tracking & performance', comingSoon: true },
    { id: 'reports', label: 'Reports', description: 'Business intelligence & reporting', comingSoon: true },
    { id: 'items', label: 'Items & Menu', description: 'Menu management & item catalog', comingSoon: true },
    { id: 'inventory', label: 'Inventory', description: 'Stock management & tracking', comingSoon: true },
    { id: 'customers', label: 'Customers', description: 'CRM & customer management', comingSoon: true },
    { id: 'online-ordering', label: 'Online Ordering', description: 'Digital ordering platform', comingSoon: true },
    { id: 'kds', label: 'Kitchen Display', description: 'Kitchen display system', comingSoon: true },
    { id: 'finances', label: 'Finances', description: 'Financial management & accounting', comingSoon: true },
    { id: 'integrations', label: 'Integrations', description: 'Third-party integrations', comingSoon: true },
];

// ─── Reusable Field Components ──────────────────────────────────────────────

function InputField({ label, icon: Icon, value, onChange, type = 'text', placeholder = '', disabled = false, mono = false }: {
    label: string; icon: any; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; disabled?: boolean; mono?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
                    className={cn("w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all", disabled && "opacity-60 cursor-not-allowed", mono && "font-mono")} />
            </div>
        </div>
    );
}

function SelectField({ label, icon: Icon, value, onChange, options }: {
    label: string; icon: any; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] | string[];
}) {
    const opts = typeof options[0] === 'string'
        ? (options as string[]).map(o => ({ value: o, label: o }))
        : options as { value: string; label: string }[];
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select value={value || ''} onChange={(e) => onChange(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none">
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        </div>
    );
}

function SectionCard({ icon: Icon, title, iconBg, iconColor, children }: {
    icon: any; title: string; iconBg: string; iconColor: string; children: React.ReactNode;
}) {
    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", iconBg, iconColor)}><Icon size={20} /></div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-5">
                {children}
            </div>
        </section>
    );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function BrandConfigPage() {
    const params = useParams();
    const router = useRouter();
    const tenantId = params?.tenantId as string;

    const [data, setData] = useState<TenantEditData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!tenantId) return;
        (async () => {
            try {
                const { data: t } = await apiClient.get(`/tenants/${tenantId}`);
                setData({
                    name: t.name || '',
                    legal_name: t.legal_name || '',
                    slug: t.slug || '',
                    status: t.status || 'draft',
                    contact_email: t.contact_email || '',
                    contact_phone: t.contact_phone || '',
                    timezone: t.timezone || 'Eastern Standard Time (EST)',
                    currency: t.currency || 'CAD ($)',
                    vapi_assistant_id: t.vapi_assistant_id || '',
                    settings: t.settings || {},
                    enabledModules: t.enabledModules || [],
                    modules: t.modules || [],
                    users: t.users || [],
                });
            } catch (err) {
                console.error('Failed to load tenant', err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [tenantId]);

    const handleSave = async () => {
        if (!data) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await apiClient.patch(`/tenants/${tenantId}`, {
                name: data.name,
                legal_name: data.legal_name,
                contact_email: data.contact_email,
                contact_phone: data.contact_phone,
                timezone: data.timezone,
                currency: data.currency,
                vapi_assistant_id: data.vapi_assistant_id || null,
                settings: data.settings,
            });
            setMessage({ type: 'success', text: 'Brand configuration saved successfully!' });
            setTimeout(() => setMessage(null), 4000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err?.message || 'Failed to save' });
        } finally {
            setIsSaving(false);
        }
    };

    const set = (key: keyof TenantEditData, value: any) => setData(prev => prev ? ({ ...prev, [key]: value }) : null);
    const setSetting = (key: string, value: any) => setData(prev => prev ? ({ ...prev, settings: { ...prev.settings, [key]: value } }) : null);
    const setVapi = (key: string, value: string) => setData(prev => prev ? ({ ...prev, settings: { ...prev.settings, vapi: { ...prev.settings.vapi, [key]: value } } }) : null);
    const setEmail = (key: string, value: string) => setData(prev => prev ? ({ ...prev, settings: { ...prev.settings, email: { ...prev.settings.email, [key]: value } } }) : null);
    const setSms = (key: string, value: string) => setData(prev => prev ? ({ ...prev, settings: { ...prev.settings, sms: { ...prev.settings.sms, [key]: value } } }) : null);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Configuration...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm font-bold text-slate-400">Failed to load tenant data</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-28 px-2 pt-2">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.push(`/platform/tenants/${tenantId}`)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ArrowLeft size={18} className="text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Brand — {data.name}</h1>
                    <p className="text-sm font-medium text-slate-500">
                        Modify all tenant configuration •{' '}
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">{data.slug}</span>
                        <span className="ml-2 capitalize px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">{data.status}</span>
                    </p>
                </div>
            </div>

            {message && (
                <div className={cn("p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                    message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700")}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── 1. Brand Identity ───────────────────────────── */}
                <SectionCard icon={Building2} title="Brand Identity" iconBg="bg-slate-900" iconColor="text-emerald-400">
                    <InputField label="Brand / Display Name" icon={Building2} value={data.name} onChange={(v) => set('name', v)} />
                    <InputField label="Legal Name" icon={Shield} value={data.legal_name} onChange={(v) => set('legal_name', v)} />
                    <InputField label="Trade Name" icon={Hash} value={data.settings.tradeName || ''} onChange={(v) => setSetting('tradeName', v)} />
                    <InputField label="Slug (read-only)" icon={Globe} value={data.slug} onChange={() => {}} disabled />
                </SectionCard>

                {/* ── 2. Global Headquarters ──────────────────────── */}
                <SectionCard icon={MapPin} title="Global Headquarters" iconBg="bg-blue-50" iconColor="text-blue-600">
                    <InputField label="Address Line 1" icon={MapPin} value={data.settings.addressLine1 || data.settings.address || ''} onChange={(v) => setSetting('addressLine1', v)} placeholder="Street address or P.O. box" />
                    <InputField label="Address Line 2" icon={MapPin} value={data.settings.addressLine2 || ''} onChange={(v) => setSetting('addressLine2', v)} placeholder="Apartment, suite, unit" />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="City" icon={Building2} value={data.settings.city || ''} onChange={(v) => setSetting('city', v)} />
                        <SelectField label="Province / State" icon={Globe} value={data.settings.province || 'Ontario'} onChange={(v) => setSetting('province', v)} options={PROVINCES} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Postal / Zip Code" icon={Hash} value={data.settings.postalCode || ''} onChange={(v) => setSetting('postalCode', v)} mono />
                        <InputField label="Country" icon={Globe} value={data.settings.country || 'Canada'} onChange={() => {}} disabled />
                    </div>
                </SectionCard>

                {/* ── 3. Operational Config ───────────────────────── */}
                <SectionCard icon={Clock} title="Operational Config" iconBg="bg-amber-50" iconColor="text-amber-600">
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="System Timezone" icon={Clock} value={data.timezone} onChange={(v) => set('timezone', v)} options={TIMEZONES} />
                        <SelectField label="Base Currency" icon={DollarSign} value={data.currency} onChange={(v) => set('currency', v)} options={CURRENCIES} />
                    </div>
                    <InputField label="Primary Contact Email" icon={Mail} value={data.contact_email} onChange={(v) => set('contact_email', v)} type="email" />
                    <InputField label="Primary Contact Phone" icon={Phone} value={data.contact_phone} onChange={(v) => set('contact_phone', v)} type="tel" />
                </SectionCard>

                {/* ── 4. Payment Terms ────────────────────────────── */}
                <SectionCard icon={Coins} title="Default Payment Terms" iconBg="bg-green-50" iconColor="text-green-600">
                    <div className="grid grid-cols-3 gap-3">
                        {PAYMENT_TYPES.map((pt) => (
                            <button key={pt.value} type="button" onClick={() => setSetting('paymentTermType', pt.value)}
                                className={cn("flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest",
                                    data.settings.paymentTermType === pt.value
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')}>
                                {pt.label}
                            </button>
                        ))}
                    </div>
                    {data.settings.paymentTermType === 'NET_DAYS' && (
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Net Days (Maturity Period)</label>
                            <div className="flex items-center gap-4">
                                <input type="number" value={data.settings.netDays ?? 30} onChange={(e) => setSetting('netDays', parseInt(e.target.value) || 0)} min="1"
                                    className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-lg font-black text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Days after invoice</span>
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* ── 5. AI Call Analytics (Vapi) ─────────────────── */}
                <SectionCard icon={Bot} title="AI Call Analytics (Vapi)" iconBg="bg-purple-50" iconColor="text-purple-600">
                    <InputField label="Vapi Assistant ID" icon={Bot} value={data.vapi_assistant_id} onChange={(v) => set('vapi_assistant_id', v)} placeholder="a255bd5e-..." />
                    <InputField label="Vapi Phone Number" icon={PhoneCall} value={data.settings.vapi?.phoneNumber || ''} onChange={(v) => setVapi('phoneNumber', v)} placeholder="+1320..." />
                </SectionCard>

                {/* ── 6. Email Configuration ──────────────────────── */}
                <SectionCard icon={Mail} title="Email Configuration" iconBg="bg-sky-50" iconColor="text-sky-600">
                    <SelectField label="Email Provider" icon={Server} value={data.settings.email?.provider || 'smtp'} onChange={(v) => setEmail('provider', v)}
                        options={[{ value: 'smtp', label: 'Standard SMTP' }, { value: 'sendgrid', label: 'SendGrid API' }, { value: 'ses', label: 'Amazon SES' }, { value: 'inherit', label: 'Inherit from Platform' }]} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Sender Name" icon={User} value={data.settings.email?.senderName || ''} onChange={(v) => setEmail('senderName', v)} />
                        <InputField label="Sender Email" icon={Mail} value={data.settings.email?.senderEmail || ''} onChange={(v) => setEmail('senderEmail', v)} type="email" />
                    </div>
                    <InputField label="Reply-To Email" icon={Mail} value={data.settings.email?.replyTo || ''} onChange={(v) => setEmail('replyTo', v)} type="email" />
                </SectionCard>

                {/* ── 7. SMS Configuration ────────────────────────── */}
                <SectionCard icon={Smartphone} title="SMS Configuration" iconBg="bg-violet-50" iconColor="text-violet-600">
                    <SelectField label="SMS Provider" icon={Server} value={data.settings.sms?.provider || 'inherit'} onChange={(v) => setSms('provider', v)}
                        options={[{ value: 'inherit', label: 'Inherit from Platform' }, { value: 'twilio', label: 'Twilio' }, { value: 'vonage', label: 'Vonage' }, { value: 'aws-sns', label: 'AWS SNS' }]} />
                    <InputField label="Sender ID / From Number" icon={Phone} value={data.settings.sms?.senderId || ''} onChange={(v) => setSms('senderId', v)} placeholder="ACME-MSG" />
                </SectionCard>

                {/* ── 8. Identity Assets (Logos) ────────────────── */}
                <SectionCard icon={ImageIcon} title="Identity Assets" iconBg="bg-pink-50" iconColor="text-pink-600">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo (Light Mode)</p>
                            <div className="aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center group hover:border-slate-900 hover:bg-slate-50 cursor-pointer transition-all">
                                <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-slate-900 transition-colors" />
                                <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">Upload PNG/SVG</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo (Dark Mode)</p>
                            <div className="aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900 flex flex-col items-center justify-center group hover:border-slate-700 cursor-pointer transition-all">
                                <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-white transition-colors" />
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Upload PNG/SVG</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* ── 9. Module Entitlements ────────────────────── */}
                <SectionCard icon={Shield} title="Module Entitlements" iconBg="bg-rose-50" iconColor="text-rose-600">
                    <div className="space-y-3">
                        {ALL_MODULES.map(mod => {
                            const isEnabled = (data.enabledModules || []).includes(mod.id);
                            return (
                                <div key={mod.id} className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                    mod.comingSoon
                                        ? "bg-slate-50 border-slate-100 opacity-60"
                                        : isEnabled
                                            ? "bg-emerald-50 border-emerald-200"
                                            : "bg-white border-slate-200"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", mod.comingSoon ? "bg-slate-300" : isEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{mod.label}</p>
                                            <p className="text-[10px] text-slate-400">{mod.description}</p>
                                        </div>
                                    </div>
                                    {mod.comingSoon ? (
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Coming Soon</span>
                                    ) : (
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                            isEnabled ? "text-emerald-700 bg-emerald-100" : "text-slate-400 bg-slate-100"
                                        )}>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>

                {/* ── 10. Users ────────────────────────────────── */}
                <SectionCard icon={User} title={`Users (${data.users?.length || 0})`} iconBg="bg-indigo-50" iconColor="text-indigo-600">
                    {(data.users || []).length > 0 ? data.users!.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div>
                                <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">{u.role}</span>
                        </div>
                    )) : (
                        <p className="text-sm text-slate-400">No users assigned</p>
                    )}
                </SectionCard>
            </div>

            {/* ── Sticky Save Bar ─────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 flex items-center justify-between z-50">
                <span className="text-xs font-bold text-slate-400">
                    Tenant ID: <span className="font-mono">{tenantId}</span> • Status: <span className="capitalize">{data.status}</span>
                </span>
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-200 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
