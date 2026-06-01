'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Receipt, DollarSign, Save, Loader2, CheckCircle2, Percent,
    Info, AlertTriangle, Shield, Building2, Package,
    Truck, Clock, FileText, ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils';
import type { Store, TaxConfig } from '@/shared/types/store';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TaxSavePayload {
    paymentTerms: string;
    taxInheritBrand: boolean;
    taxOverrideEnabled: boolean;
    taxConfig?: TaxConfig;
}

interface StoreTaxPaymentsTabProps {
    store: Store;
    onSave: (data: TaxSavePayload) => Promise<void>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TAX_SCHEMES = [
    { value: 'HST',      label: 'HST',          description: 'Harmonized Sales Tax',            regions: 'ON, NB, NL, NS, PE' },
    { value: 'GST',      label: 'GST',          description: 'Goods & Services Tax',             regions: 'AB, NT, NU, YT' },
    { value: 'GST+PST',  label: 'GST + PST',    description: 'Federal + Provincial Sales Tax',    regions: 'BC, MB, SK' },
    { value: 'GST+QST',  label: 'GST + QST',    description: 'Federal + Quebec Sales Tax',        regions: 'QC' },
    { value: 'PST',      label: 'PST Only',      description: 'Provincial Sales Tax Only',         regions: 'Regional' },
    { value: 'No Tax',   label: 'No Tax',        description: 'Tax Exempt / Zero Rated',           regions: 'Special' },
];

const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', 'Prepaid'];

const RATE_PRESETS: Record<string, number> = {
    'HST': 13,
    'GST': 5,
    'GST+PST': 12,
    'GST+QST': 14.975,
    'PST': 7,
    'No Tax': 0,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function deriveInitialProfile(store: Store): 'Inherit' | 'Override' {
    if (store.taxInheritBrand === true) return 'Inherit';
    if (store.taxOverrideEnabled === true) return 'Override';
    return store.taxProfile ?? 'Inherit';
}

function deriveInitialScheme(store: Store): string {
    return store.taxConfig?.scheme ?? store.taxScheme ?? 'HST';
}

function deriveInitialRate(store: Store): number {
    return store.taxConfig?.rate ?? store.taxRate ?? 13;
}

// ─── Validation ─────────────────────────────────────────────────────────────

interface ValidationErrors {
    taxRate?: string;
    taxScheme?: string;
}

function validate(
    profile: 'Inherit' | 'Override',
    scheme: string,
    rate: string,
): ValidationErrors {
    const errors: ValidationErrors = {};
    if (profile !== 'Override') return errors;

    if (!scheme) errors.taxScheme = 'Tax scheme is required';

    const parsedRate = parseFloat(rate);
    if (rate === '' || isNaN(parsedRate)) {
        errors.taxRate = 'Tax rate is required';
    } else if (parsedRate < 0) {
        errors.taxRate = 'Tax rate cannot be negative';
    } else if (parsedRate > 100) {
        errors.taxRate = 'Tax rate cannot exceed 100%';
    }

    return errors;
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, color, title }: { icon: React.ElementType; color: string; title: string }) {
    return (
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
            <span className={cn('w-1 h-5 rounded-full', color)} />
            <Icon size={14} /> {title}
        </h3>
    );
}

function ToggleSwitch({
    label, description, enabled, onChange, disabled,
}: { label: string; description: string; enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            className={cn(
                'w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group',
                disabled && 'opacity-50 cursor-not-allowed',
                enabled
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300',
            )}
        >
            <div className={cn(
                'w-10 h-6 rounded-full relative transition-colors duration-300 shrink-0',
                enabled ? 'bg-emerald-500' : 'bg-slate-300',
            )}>
                <div className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300',
                    enabled ? 'translate-x-[18px]' : 'translate-x-0.5',
                )} />
            </div>
            <div>
                <span className={cn('text-sm font-black block', enabled ? 'text-emerald-800' : 'text-slate-700')}>{label}</span>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">{description}</span>
            </div>
        </button>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function StoreTaxPaymentsTab({ store, onSave }: StoreTaxPaymentsTabProps) {
    // ── State ────────────────────────────────────────────────────────────
    const [taxProfile, setTaxProfile] = useState<'Inherit' | 'Override'>(deriveInitialProfile(store));
    const [taxScheme, setTaxScheme] = useState(deriveInitialScheme(store));
    const [taxRate, setTaxRate] = useState(String(deriveInitialRate(store)));
    const [deliveryFeeTax, setDeliveryFeeTax] = useState(store.taxConfig?.deliveryFeeTaxEnabled ?? false);
    const [packagingFeeTax, setPackagingFeeTax] = useState(store.taxConfig?.packagingFeeTaxEnabled ?? false);
    const [paymentTerms, setPaymentTerms] = useState(store.paymentTerms);

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // ── Derived state ────────────────────────────────────────────────────
    const hasUnsavedChanges = useMemo(() => {
        const origProfile = deriveInitialProfile(store);
        const origScheme = deriveInitialScheme(store);
        const origRate = deriveInitialRate(store);
        const origDeliveryTax = store.taxConfig?.deliveryFeeTaxEnabled ?? false;
        const origPackagingTax = store.taxConfig?.packagingFeeTaxEnabled ?? false;

        return (
            taxProfile !== origProfile ||
            taxScheme !== origScheme ||
            parseFloat(taxRate) !== origRate ||
            deliveryFeeTax !== origDeliveryTax ||
            packagingFeeTax !== origPackagingTax ||
            paymentTerms !== store.paymentTerms
        );
    }, [taxProfile, taxScheme, taxRate, deliveryFeeTax, packagingFeeTax, paymentTerms, store]);

    const selectedSchemeInfo = TAX_SCHEMES.find(s => s.value === taxScheme);
    const effectiveRate = parseFloat(taxRate) || 0;

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleSchemeChange = useCallback((newScheme: string) => {
        setTaxScheme(newScheme);
        const preset = RATE_PRESETS[newScheme];
        if (preset !== undefined) setTaxRate(String(preset));
        setErrors(prev => ({ ...prev, taxScheme: undefined }));
    }, []);

    const handleSave = async () => {
        const validationErrors = validate(taxProfile, taxScheme, taxRate);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setIsSaving(true);
        try {
            const payload: TaxSavePayload = {
                paymentTerms,
                taxInheritBrand: taxProfile === 'Inherit',
                taxOverrideEnabled: taxProfile === 'Override',
                taxConfig: taxProfile === 'Override'
                    ? {
                        scheme: taxScheme,
                        rate: parseFloat(taxRate) || 0,
                        deliveryFeeTaxEnabled: deliveryFeeTax,
                        packagingFeeTaxEnabled: packagingFeeTax,
                    }
                    : undefined,
            };
            await onSave(payload);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Unsaved Changes Banner */}
            {hasUnsavedChanges && (
                <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl animate-in fade-in duration-300">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-amber-700">You have unsaved changes</span>
                    <span className="text-[10px] font-medium text-amber-500 ml-auto flex items-center gap-1">
                        <Clock size={10} /> Draft
                    </span>
                </div>
            )}

            {/* ─── 1. Tax Source Selection ──────────────────────────────── */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <SectionHeader icon={Percent} color="bg-amber-500" title="Tax Configuration" />

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Inherit */}
                    <button type="button" onClick={() => setTaxProfile('Inherit')}
                        className={cn(
                            'p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group',
                            taxProfile === 'Inherit'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md',
                        )}>
                        <div className="flex items-center gap-3 mb-3">
                            <Building2 size={20} className={taxProfile === 'Inherit' ? 'text-emerald-400' : 'text-slate-400'} />
                            <span className="text-sm font-black">Inherit from Brand</span>
                        </div>
                        <span className={cn('text-xs font-medium block', taxProfile === 'Inherit' ? 'text-slate-300' : 'text-slate-400')}>
                            Use your brand-level tax scheme and rate. Changes at the brand level automatically apply to this store.
                        </span>
                        {taxProfile === 'Inherit' && (
                            <div className="absolute top-3 right-3">
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                        )}
                    </button>

                    {/* Override */}
                    <button type="button" onClick={() => setTaxProfile('Override')}
                        className={cn(
                            'p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group',
                            taxProfile === 'Override'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md',
                        )}>
                        <div className="flex items-center gap-3 mb-3">
                            <Shield size={20} className={taxProfile === 'Override' ? 'text-amber-400' : 'text-slate-400'} />
                            <span className="text-sm font-black">Override Store Taxes</span>
                        </div>
                        <span className={cn('text-xs font-medium block', taxProfile === 'Override' ? 'text-slate-300' : 'text-slate-400')}>
                            Set a custom tax scheme, rate, and fee-level controls specific to this store location.
                        </span>
                        {taxProfile === 'Override' && (
                            <div className="absolute top-3 right-3">
                                <CheckCircle2 size={18} className="text-amber-400" />
                            </div>
                        )}
                    </button>
                </div>

                {/* Inherit Info Banner */}
                {taxProfile === 'Inherit' && (
                    <div className="flex items-start gap-3 p-5 bg-blue-50 border border-blue-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-black text-blue-800 mb-1">Inherited from Brand</p>
                            <p className="text-[11px] font-medium text-blue-600 leading-relaxed">
                                This store&apos;s tax configuration is managed at the brand level. Any changes made to the brand&apos;s
                                tax scheme will automatically cascade to this store. To customize taxes for this location,
                                switch to &quot;Override Store Taxes&quot;.
                            </p>
                        </div>
                    </div>
                )}

                {/* Override Configuration Panel */}
                {taxProfile === 'Override' && (
                    <div className="space-y-5 p-6 bg-amber-50/60 border border-amber-200 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                        {/* Scheme & Rate */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">
                                    Tax Scheme <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={taxScheme}
                                    onChange={e => handleSchemeChange(e.target.value)}
                                    className={cn(
                                        'w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 outline-none transition-all appearance-none',
                                        errors.taxScheme ? 'border-rose-300 bg-rose-50/50' : 'border-amber-100',
                                    )}
                                >
                                    {TAX_SCHEMES.map(s => (
                                        <option key={s.value} value={s.value}>{s.label} — {s.description}</option>
                                    ))}
                                </select>
                                {errors.taxScheme && (
                                    <p className="text-[10px] text-rose-500 font-bold">{errors.taxScheme}</p>
                                )}
                                {selectedSchemeInfo && (
                                    <p className="text-[10px] font-medium text-amber-600 flex items-center gap-1">
                                        <ChevronRight size={10} />
                                        Typical for: {selectedSchemeInfo.regions}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">
                                    Tax Rate (%) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number" step="0.01" min="0" max="100"
                                    value={taxRate}
                                    onChange={e => {
                                        setTaxRate(e.target.value);
                                        setErrors(prev => ({ ...prev, taxRate: undefined }));
                                    }}
                                    className={cn(
                                        'w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 outline-none transition-all',
                                        errors.taxRate ? 'border-rose-300 bg-rose-50/50' : 'border-amber-100',
                                    )}
                                />
                                {errors.taxRate && (
                                    <p className="text-[10px] text-rose-500 font-bold">{errors.taxRate}</p>
                                )}
                            </div>
                        </div>

                        {/* Fee-Level Tax Toggles */}
                        <div className="pt-4 border-t border-amber-200/60">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">
                                Fee-Level Tax Application
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <ToggleSwitch
                                    label="Delivery Fee Tax"
                                    description="Apply tax to delivery service fees"
                                    enabled={deliveryFeeTax}
                                    onChange={setDeliveryFeeTax}
                                />
                                <ToggleSwitch
                                    label="Packaging Fee Tax"
                                    description="Apply tax to packaging & container fees"
                                    enabled={packagingFeeTax}
                                    onChange={setPackagingFeeTax}
                                />
                            </div>
                        </div>

                        {/* Tax Impact Note */}
                        <div className="flex items-start gap-3 p-4 bg-white/70 border border-amber-200/50 rounded-xl">
                            <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                                <strong>Tax Impact:</strong> When delivery or packaging fee tax is enabled, the respective
                                fee amounts will be included in the tax base for this store. This affects total order
                                amounts for customers ordering through delivery channels.
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {/* ─── 2. Payment Terms ────────────────────────────────────── */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <SectionHeader icon={DollarSign} color="bg-emerald-500" title="Payment Terms" />
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {PAYMENT_TERMS.map(term => (
                        <button key={term} type="button" onClick={() => setPaymentTerms(term)}
                            className={cn(
                                'p-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-wider text-center',
                                paymentTerms === term
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300',
                            )}>
                            {term}
                        </button>
                    ))}
                </div>
            </section>

            {/* ─── 3. Tax Preview Summary Card ─────────────────────────── */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <SectionHeader icon={Receipt} color="bg-indigo-500" title="Configuration Summary" />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tax Source</span>
                        <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border',
                            taxProfile === 'Inherit'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200',
                        )}>
                            {taxProfile === 'Inherit' ? <Building2 size={10} /> : <Shield size={10} />}
                            {taxProfile === 'Inherit' ? 'Brand Inherited' : 'Store Override'}
                        </span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Scheme</span>
                        <span className="text-sm font-black text-slate-900">
                            {taxProfile === 'Override' ? (selectedSchemeInfo?.label || taxScheme) : 'Brand Default'}
                        </span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Effective Rate</span>
                        <span className="text-sm font-black text-slate-900">
                            {taxProfile === 'Override' ? `${effectiveRate}%` : '—'}
                        </span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Payment Terms</span>
                        <span className="text-sm font-black text-slate-900">{paymentTerms}</span>
                    </div>
                </div>

                {/* Fee Tax Status */}
                {taxProfile === 'Override' && (
                    <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Truck size={13} className={deliveryFeeTax ? 'text-emerald-500' : 'text-slate-300'} />
                            <span className={cn('text-[10px] font-bold', deliveryFeeTax ? 'text-emerald-700' : 'text-slate-400')}>
                                Delivery Fee Tax: {deliveryFeeTax ? 'Applied' : 'Not Applied'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Package size={13} className={packagingFeeTax ? 'text-emerald-500' : 'text-slate-300'} />
                            <span className={cn('text-[10px] font-bold', packagingFeeTax ? 'text-emerald-700' : 'text-slate-400')}>
                                Packaging Fee Tax: {packagingFeeTax ? 'Applied' : 'Not Applied'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Future Tax Engine Placeholder */}
                <div className="mt-5 pt-5 border-t border-dashed border-slate-200">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <FileText size={12} />
                        <span>Future: Multiple tax rules, tax exemptions, regional taxes (GST/HST/PST split), and tax-inclusive pricing will be configurable here.</span>
                    </div>
                </div>
            </section>

            {/* ─── 4. Save Bar ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {store.createdAt && (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> Last updated: {new Date(store.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            })}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                            <CheckCircle2 size={14} /> Configuration Saved
                        </span>
                    )}
                    <button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}
                        className={cn(
                            'flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all',
                            hasUnsavedChanges
                                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                            isSaving && 'opacity-50',
                        )}>
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? 'Saving...' : 'Save Tax Config'}
                    </button>
                </div>
            </div>
        </div>
    );
}
