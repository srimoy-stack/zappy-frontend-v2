'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity, Store as StoreIcon, Users, MapPin, Clock, Calendar,
    CheckCircle2, Navigation, Shield, ShoppingBag, Truck, Monitor,
    ChefHat, Package, BarChart2, CreditCard, TrendingUp, AlertTriangle,
    Hash, DollarSign, Layers, Tag, RefreshCw, Zap, Pencil, Save, X, Loader2
} from 'lucide-react';
import { cn } from '@/utils';
import type { Store, StoreDetailConfig, StoreUser, StorePageData, CreateStoreDTO } from '@/shared/types/store';
import { evaluateGoLiveReadiness } from '@/shared/types/store';
import { StoreStatusBadge } from '../shared/StoreStatusBadge';
import { GoLiveChecklist } from '../shared/GoLiveChecklist';
import {
    validateStoreName,
    validateStoreEmail,
    validateStorePhone,
    validateStoreAddress,
    validateStorePostalCode
} from '../../utils/storeValidation';

interface StoreOverviewTabProps {
    store: Store;
    config?: StoreDetailConfig;
    users?: StoreUser[];
    pageData?: StorePageData;
    onPublish?: () => void;
    isPublishing?: boolean;
    onSaveGeneral?: (dto: Partial<CreateStoreDTO>) => Promise<void>;
}

// ─── Helper Forms components ──────────────────────────────────────────────────

function EditField({ label, value, onChange, type = 'text', placeholder, disabled, mono, error }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; disabled?: boolean; mono?: boolean;
    error?: string;
}) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} disabled={disabled}
                className={cn(
                    "w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-950 focus:border-2 outline-none transition-all",
                    error ? "border-rose-500 focus:border-rose-500 bg-rose-50/20" : "border-slate-50",
                    disabled && "opacity-50 cursor-not-allowed", mono && "font-mono"
                )} />
            {error && <span className="text-[11px] font-semibold text-rose-500 block mt-0.5">{error}</span>}
        </div>
    );
}

function SelectField({ label, value, onChange, options, disabled }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
}) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <div className="relative">
                <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-950 focus:border-2 outline-none transition-all appearance-none">
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, accent, sub }: {
    label: string; value: string | number; icon: any; accent: string; sub?: string;
}) {
    return (
        <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden group">
            <div className={cn('absolute top-0 left-0 right-0 h-0.5', accent)} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{value ?? '—'}</p>
                    {sub && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub}</p>}
                </div>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform', accent.replace('bg-gradient-to-r', 'bg').split(' ')[0])}>
                    <Icon size={17} className="text-white" />
                </div>
            </div>
        </div>
    );
}

function ModulePill({ name, enabled, icon: Icon }: { name: string; enabled: boolean; icon: any }) {
    return (
        <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all',
            enabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-100 text-slate-400'
        )}>
            <Icon size={13} className={enabled ? 'text-emerald-500' : 'text-slate-300'} />
            {name}
            {enabled
                ? <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                : <span className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-300" />
            }
        </div>
    );
}

function InfoRow({ label, value, icon: Icon, mono, muted }: {
    label: string; value: string | number | undefined; icon?: any; mono?: boolean; muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-50/80 last:border-0 group hover:bg-slate-50/40 -mx-2 px-2 rounded-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-2.5">
                {Icon && <Icon size={13} className="text-slate-400" />}
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

function SectionHeader({ color, icon: Icon, title }: { color: string; icon: any; title: string }) {
    return (
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5 flex items-center gap-2.5">
            <span className={cn('w-1 h-5 rounded-full', color)} />
            <Icon size={14} />
            {title}
        </h3>
    );
}

const MODULE_META: Record<string, { label: string; icon: any }> = {
    pos:       { label: 'Point of Sale', icon: Monitor },
    kds:       { label: 'Kitchen Display', icon: ChefHat },
    kiosk:     { label: 'Self-Service Kiosk', icon: Zap },
    orders:    { label: 'Order Management', icon: ShoppingBag },
    payments:  { label: 'Payments', icon: CreditCard },
    inventory: { label: 'Inventory', icon: Package },
    reports:   { label: 'Reports', icon: BarChart2 },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function StoreOverviewTab({ store, config, users, pageData, onPublish, isPublishing, onSaveGeneral }: StoreOverviewTabProps) {
    const readiness = evaluateGoLiveReadiness(store, config, users);
    const summary = pageData?.summary;
    const modules = pageData?.modules;
    const catalog = pageData?.catalog;
    const inventory = pageData?.inventory;

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [name, setName] = useState(store.name);
    const [storeCode, setStoreCode] = useState(store.code || '');
    const [address, setAddress] = useState(store.address || '');
    const [city, setCity] = useState(store.city || '');
    const [province, setProvince] = useState(store.province || '');
    const [postalCode, setPostalCode] = useState(store.postalCode || '');
    const [timezone, setTimezone] = useState(store.timezone || '');
    const [phone, setPhone] = useState(store.phone || '');
    const [email, setEmail] = useState(store.email || '');
    const [businessType, setBusinessType] = useState(store.businessType || 'single_store');
    const [currency, setCurrency] = useState(store.currency || 'USD');
    const [paymentTerms, setPaymentTerms] = useState(store.paymentTerms || 'net_15');
    const [country, setCountry] = useState(store.country || 'Canada');

    useEffect(() => {
        setName(store.name);
        setStoreCode(store.code || '');
        setAddress(store.address || '');
        setCity(store.city || '');
        setProvince(store.province || '');
        setPostalCode(store.postalCode || '');
        setTimezone(store.timezone || '');
        setPhone(store.phone || '');
        setEmail(store.email || '');
        setBusinessType(store.businessType || 'single_store');
        setCurrency(store.currency || 'USD');
        setPaymentTerms(store.paymentTerms || 'net_15');
        setCountry(store.country || 'Canada');
        setErrors({});
    }, [store, isEditing]);

    const isDirty = name !== store.name ||
        storeCode !== (store.code || '') ||
        address !== (store.address || '') ||
        city !== (store.city || '') ||
        province !== (store.province || '') ||
        postalCode !== (store.postalCode || '') ||
        timezone !== (store.timezone || '') ||
        phone !== (store.phone || '') ||
        email !== (store.email || '') ||
        businessType !== (store.businessType || 'single_store') ||
        currency !== (store.currency || 'USD') ||
        paymentTerms !== (store.paymentTerms || 'net_15') ||
        country !== (store.country || 'Canada');

    const handleCancel = () => {
        if (isDirty) {
            if (!confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                return;
            }
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!onSaveGeneral) return;

        const e: Record<string, string> = {};
        const nameErr = validateStoreName(name);
        if (nameErr) e.name = nameErr;

        const codeErr = validateStoreCode(storeCode);
        if (codeErr) e.code = codeErr;

        const emailErr = validateStoreEmail(email);
        if (emailErr) e.email = emailErr;

        const phoneErr = validateStorePhone(phone);
        if (phoneErr) e.phone = phoneErr;

        const addressErr = validateStoreAddress(address);
        if (addressErr) e.address = addressErr;

        const postalErr = validateStorePostalCode(postalCode);
        if (postalErr) e.postalCode = postalErr;

        if (!city || city.trim().length < 2) e.city = 'City is required';
        if (!province) e.province = 'Province/State is required';
        if (!timezone) e.timezone = 'Timezone is required';
        if (!country) e.country = 'Country is required';

        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }

        setErrors({});
        setIsSaving(true);
        try {
            await onSaveGeneral({
                name,
                storeCode: storeCode.trim().toUpperCase(),
                address,
                city,
                province,
                postalCode,
                timezone,
                phone,
                email,
                businessType,
                currency,
                paymentTerms,
                country,
            });
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to save store:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const fmt = (n: number) => n?.toLocaleString() ?? '0';
    const fmtCurrency = (n: number) => {
        const currency = (store.currency || 'USD').toUpperCase();
        const locale = currency === 'CAD' ? 'en-CA' : 'en-US';
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n || 0);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── KPI Strip ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
                <KpiCard label="Total Orders" value={fmt(summary?.total_orders ?? 0)}
                    icon={ShoppingBag} accent="bg-gradient-to-r from-emerald-400 to-teal-500"
                    sub={`${fmt(summary?.open_orders ?? 0)} open`} />
                <KpiCard label="Revenue" value={fmtCurrency(summary?.total_revenue ?? 0)}
                    icon={DollarSign} accent="bg-gradient-to-r from-violet-400 to-purple-600" />
                <KpiCard label="Completed" value={fmt(summary?.completed_orders ?? 0)}
                    icon={CheckCircle2} accent="bg-gradient-to-r from-blue-400 to-indigo-500" />
                <KpiCard label="Cancelled" value={fmt(summary?.cancelled_orders ?? 0)}
                    icon={AlertTriangle} accent="bg-gradient-to-r from-rose-400 to-red-500" />
                <KpiCard label="Inventory" value={fmt(inventory?.items_count ?? summary?.inventory_items ?? 0)}
                    icon={Package} accent="bg-gradient-to-r from-amber-400 to-orange-500"
                    sub={`${fmt(inventory?.low_stock_count ?? summary?.low_stock_items ?? 0)} low stock`} />
                <KpiCard label="Menu Items" value={fmt(catalog?.brand_items_count ?? summary?.brand_menu_items ?? 0)}
                    icon={Layers} accent="bg-gradient-to-r from-cyan-400 to-sky-500"
                    sub={`${fmt(catalog?.store_items_count ?? summary?.store_menu_items ?? 0)} store-specific`} />
                <KpiCard label="Staff" value={fmt(summary?.assigned_users ?? users?.length ?? 0)}
                    icon={Users} accent="bg-gradient-to-r from-slate-500 to-slate-700" />
            </div>

            {/* ── Go-Live Readiness ────────────────────────────────────── */}
            {store.status === 'Draft' && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <SectionHeader color="bg-amber-500" icon={CheckCircle2} title="Go-Live Readiness" />
                    <GoLiveChecklist
                        checks={readiness.checks}
                        status={readiness.status}
                        score={readiness.score}
                        onPublish={onPublish}
                        isPublishing={isPublishing}
                    />
                </section>
            )}

            {/* ── Active Modules ───────────────────────────────────────── */}
            {modules && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <SectionHeader color="bg-emerald-500" icon={Zap} title="Active Modules" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
                        {Object.entries(modules).map(([key, mod]) => {
                            const meta = MODULE_META[key] || { label: key, icon: Zap };
                            return (
                                <ModulePill key={key} name={meta.label} enabled={mod.enabled} icon={meta.icon} />
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Store Identity + Location or Edit Mode ────────────────── */}
            {isEditing ? (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in duration-300 text-left">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <StoreIcon size={16} className="text-emerald-500" />
                            Edit Store Details
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={handleCancel} disabled={isSaving}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50">
                                {isSaving ? (
                                    <Loader2 size={13} className="animate-spin text-white" />
                                ) : (
                                    <Save size={13} className="text-white" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <EditField label="Store Name" value={name} onChange={setName} placeholder="e.g. Downtown Toronto" disabled={isSaving} error={errors.name} />
                        <EditField label="Store Code" value={storeCode} onChange={setStoreCode} disabled={isSaving} error={errors.code} mono={true} placeholder="e.g. STORE-001" />
                        <SelectField label="Business Type" value={businessType} onChange={(val) => setBusinessType(val as any)} disabled={isSaving}
                            options={[
                                { value: 'single_store', label: 'Single Store' },
                                { value: 'multi_store', label: 'Multi-Store Branch' }
                            ]} />
                        <EditField label="Phone Number" value={phone} onChange={setPhone} placeholder="e.g. (555) 555-5555" disabled={isSaving} error={errors.phone} />
                        <EditField label="Email Address" value={email} onChange={setEmail} placeholder="e.g. store@example.com" disabled={isSaving} error={errors.email} />
                        <SelectField label="Timezone" value={timezone} onChange={setTimezone} disabled={isSaving}
                            options={[
                                { value: 'America/Toronto', label: 'America/Toronto (EST)' },
                                { value: 'America/Chicago', label: 'America/Chicago (CST)' },
                                { value: 'America/Denver', label: 'America/Denver (MST)' },
                                { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
                                { value: 'America/Halifax', label: 'America/Halifax (AST)' },
                                { value: 'America/Vancouver', label: 'America/Vancouver (PST)' },
                                { value: 'America/Winnipeg', label: 'America/Winnipeg (CST)' },
                                { value: 'America/Edmonton', label: 'America/Edmonton (MST)' },
                            ]} />
                        <div className="md:col-span-2 lg:col-span-3">
                            <EditField label="Street Address" value={address} onChange={setAddress} placeholder="e.g. 123 Main St, Unit 4" disabled={isSaving} error={errors.address} />
                        </div>
                        <EditField label="City" value={city} onChange={setCity} placeholder="e.g. Toronto" disabled={isSaving} error={errors.city} />
                        <SelectField label="Province" value={province} onChange={setProvince} disabled={isSaving}
                            options={[
                                { value: 'Ontario', label: 'Ontario' },
                                { value: 'British Columbia', label: 'British Columbia' },
                                { value: 'Quebec', label: 'Quebec' },
                                { value: 'Alberta', label: 'Alberta' },
                                { value: 'Manitoba', label: 'Manitoba' },
                                { value: 'Saskatchewan', label: 'Saskatchewan' },
                                { value: 'Nova Scotia', label: 'Nova Scotia' },
                                { value: 'New Brunswick', label: 'New Brunswick' },
                            ]} />
                        <EditField label="Postal Code" value={postalCode} onChange={setPostalCode} placeholder="e.g. M5V 2N2" disabled={isSaving} mono={true} error={errors.postalCode} />
                    </div>
                </section>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative group">
                        <div className="flex items-center justify-between mb-5">
                            <SectionHeader color="bg-slate-900" icon={StoreIcon} title="Store Identity" />
                            {onSaveGeneral && (
                                <button onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
                                    <Pencil size={11} /> Edit Details
                                </button>
                            )}
                        </div>
                        <div className="space-y-0">
                            <InfoRow label="Store Name" value={store.name} icon={StoreIcon} />
                            <InfoRow label="Store Code" value={store.code} mono />
                            <InfoRow label="Status" value={store.status} />
                            <InfoRow label="Business Type" value={store.businessType?.replace('_', ' ')} muted={!store.businessType} />
                            <InfoRow label="Currency" value={store.currency} />
                            <InfoRow label="Payment Terms" value={store.paymentTerms} />
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <SectionHeader color="bg-emerald-500" icon={MapPin} title="Location" />
                        <div className="space-y-0">
                            <InfoRow label="Address" value={store.address} icon={MapPin} muted={!store.address} />
                            <InfoRow label="City" value={store.city} />
                            <InfoRow label="Province" value={store.province} />
                            <InfoRow label="Postal Code" value={store.postalCode} mono muted={!store.postalCode} />
                            <InfoRow label="Country" value={store.country} />
                            <InfoRow label="Timezone" value={store.timezone} icon={Clock} />
                        </div>
                    </section>
                </div>
            )}

            {/* ── Delivery & Hours + Payments & Tax ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <SectionHeader color="bg-blue-500" icon={Truck} title="Delivery & Hours" />
                    <div className="space-y-0">
                        <InfoRow label="Delivery Radius"
                            value={store.deliveryRadiusKm ? `${store.deliveryRadiusKm} km` : undefined}
                            icon={Navigation} muted={!store.deliveryRadiusKm} />
                        {pageData?.store?.delivery_provider && (
                            <InfoRow label="Delivery Provider" value={pageData.store.delivery_provider} />
                        )}
                        {pageData?.store?.delivery_base_fee != null && (
                            <InfoRow label="Base Delivery Fee" value={fmtCurrency(pageData.store.delivery_base_fee)} />
                        )}
                        {pageData?.store?.delivery_min_order_amount != null && (
                            <InfoRow label="Min Order for Delivery" value={fmtCurrency(pageData.store.delivery_min_order_amount)} />
                        )}
                        {pageData?.store?.free_delivery_over_amount != null && (
                            <InfoRow label="Free Delivery Over" value={fmtCurrency(pageData.store.free_delivery_over_amount)} />
                        )}
                        {pageData?.store?.pos_opening_time && (
                            <InfoRow label="POS Hours"
                                value={`${pageData.store.pos_opening_time} – ${pageData.store.pos_closing_time}`}
                                icon={Clock} />
                        )}
                        {pageData?.store?.online_opening_time && (
                            <InfoRow label="Online Hours"
                                value={`${pageData.store.online_opening_time} – ${pageData.store.online_closing_time}`} />
                        )}
                    </div>
                </section>

                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <SectionHeader color="bg-violet-500" icon={CreditCard} title="Payments & Tax" />
                    <div className="space-y-0">
                        {pageData?.store?.payment_provider && (
                            <InfoRow label="Payment Provider" value={pageData.store.payment_provider} />
                        )}
                        <InfoRow label="Tax Profile" value={store.taxProfile} icon={Shield} />
                        {pageData?.store?.tip_calculation_mode && (
                            <InfoRow label="Tip Calculation" value={pageData.store.tip_calculation_mode?.replace('_', ' ')} />
                        )}
                        {pageData && pageData.store?.tip_presets?.length > 0 && (
                            <InfoRow label="Tip Presets" value={pageData.store.tip_presets.map((t: number) => `${t}%`).join(', ')} />
                        )}
                        {pageData?.store?.tips_enabled != null && (
                            <InfoRow label="Tips Enabled" value={pageData.store.tips_enabled ? 'Yes' : 'No'} />
                        )}
                        {pageData?.store?.split_payments_enabled != null && (
                            <InfoRow label="Split Payments" value={pageData.store.split_payments_enabled ? 'Enabled' : 'Disabled'} />
                        )}
                        <InfoRow label="Payment Terms" value={store.paymentTerms} />
                    </div>
                </section>
            </div>

            {/* ── Catalog & Inventory Stats ────────────────────────────── */}
            {(catalog || inventory) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <SectionHeader color="bg-cyan-500" icon={Layers} title="Catalog" />
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Categories', value: catalog?.categories_count ?? 0, icon: Tag },
                                { label: 'Brand Items', value: catalog?.brand_items_count ?? 0, icon: ShoppingBag },
                                { label: 'Store Items', value: catalog?.store_items_count ?? 0, icon: Hash },
                                { label: 'Price Overrides', value: catalog?.price_overrides_count ?? 0, icon: TrendingUp },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="bg-slate-50 rounded-2xl p-4 text-center">
                                    <Icon size={18} className="text-slate-400 mx-auto mb-2" />
                                    <p className="text-xl font-black text-slate-900">{fmt(value)}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <SectionHeader color="bg-amber-500" icon={Package} title="Inventory" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-2xl p-6 text-center">
                                <Package size={22} className="text-slate-400 mx-auto mb-2" />
                                <p className="text-3xl font-black text-slate-900">{fmt(inventory?.items_count ?? 0)}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Total Items</p>
                            </div>
                            <div className={cn(
                                'rounded-2xl p-6 text-center',
                                (inventory?.low_stock_count ?? 0) > 0 ? 'bg-rose-50' : 'bg-emerald-50'
                            )}>
                                <AlertTriangle size={22} className={cn('mx-auto mb-2',
                                    (inventory?.low_stock_count ?? 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                                )} />
                                <p className={cn('text-3xl font-black',
                                    (inventory?.low_stock_count ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                                )}>{fmt(inventory?.low_stock_count ?? 0)}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Low Stock</p>
                            </div>
                        </div>
                        {(inventory?.low_stock_count ?? 0) > 0 && (
                            <div className="mt-4 flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                                <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                                <p className="text-xs font-bold text-rose-700">
                                    {inventory?.low_stock_count} items need restocking
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* ── Recent Orders ────────────────────────────────────────── */}
            {pageData?.recent_orders && pageData.recent_orders.length > 0 && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
                    <SectionHeader color="bg-emerald-500" icon={ShoppingBag} title="Recent Orders" />
                    <div className="overflow-x-auto -mx-8 px-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Order No</th>
                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Source</th>
                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Payment</th>
                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pageData.recent_orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-3.5 text-xs font-mono font-bold text-slate-900">
                                            #{order.order_number}
                                        </td>
                                        <td className="py-3.5 text-xs font-bold text-slate-600 capitalize">
                                            {order.order_type?.replace('_', ' ')}
                                        </td>
                                        <td className="py-3.5 text-xs font-bold text-slate-500 capitalize">
                                            {order.source}
                                        </td>
                                        <td className="py-3.5 text-xs">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                order.status === 'completed' || order.status === 'delivered' || order.status === 'ready'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : order.status === 'cancelled'
                                                    ? 'bg-rose-50 text-rose-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-xs">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                order.payment_status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : order.payment_status === 'refunded'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            )}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-xs font-black text-slate-900 text-right">
                                            {fmtCurrency(order.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ── Contact & Timeline ───────────────────────────────────── */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <SectionHeader color="bg-slate-400" icon={Calendar} title="Contact & Timeline" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    <InfoRow label="Phone" value={store.phone} muted={!store.phone} />
                    <InfoRow label="Email" value={store.email} muted={!store.email} />
                    <InfoRow label="Created" value={store.createdAt} icon={Calendar} muted={!store.createdAt} />
                </div>
            </section>
        </div>
    );
}
