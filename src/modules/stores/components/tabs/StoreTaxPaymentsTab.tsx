'use client';

import React, { useState } from 'react';
import { Receipt, DollarSign, Save, Loader2, CheckCircle2, Percent } from 'lucide-react';
import { cn } from '@/utils';
import type { Store, CreateStoreDTO } from '@/shared/types/store';

interface StoreTaxPaymentsTabProps {
    store: Store;
    onSave: (data: Partial<CreateStoreDTO> & { taxProfile?: 'Inherit' | 'Override'; taxScheme?: string; taxRate?: number }) => Promise<void>;
}

const TAX_SCHEMES = ['HST', 'GST', 'GST+PST', 'GST+QST', 'PST', 'No Tax'];
const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', 'Prepaid'];

export function StoreTaxPaymentsTab({ store, onSave }: StoreTaxPaymentsTabProps) {
    const [taxProfile, setTaxProfile] = useState<'Inherit' | 'Override'>(store.taxProfile);
    const [taxScheme, setTaxScheme] = useState(store.taxScheme || 'HST');
    const [taxRate, setTaxRate] = useState(String(store.taxRate ?? 13));
    const [paymentTerms, setPaymentTerms] = useState(store.paymentTerms);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                paymentTerms,
                taxProfile,
                taxScheme: taxProfile === 'Override' ? taxScheme : undefined,
                taxRate: taxProfile === 'Override' ? parseFloat(taxRate) || 0 : undefined,
            } as any);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally { setIsSaving(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tax Profile */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                    <span className="w-1 h-5 rounded-full bg-amber-500" />
                    <Percent size={14} /> Tax Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {(['Inherit', 'Override'] as const).map(profile => (
                        <button key={profile} type="button" onClick={() => setTaxProfile(profile)}
                            className={cn(
                                'p-5 rounded-2xl border-2 transition-all text-left',
                                taxProfile === profile
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            )}>
                            <span className="text-sm font-black block mb-1">
                                {profile === 'Inherit' ? 'Inherit from Brand' : 'Override'}
                            </span>
                            <span className={cn('text-xs font-medium', taxProfile === profile ? 'text-slate-300' : 'text-slate-400')}>
                                {profile === 'Inherit' ? 'Use brand-level tax scheme' : 'Custom tax for this store'}
                            </span>
                        </button>
                    ))}
                </div>
                {taxProfile === 'Override' && (
                    <div className="grid grid-cols-2 gap-5 p-5 bg-amber-50 border border-amber-200 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Tax Scheme</label>
                            <select value={taxScheme} onChange={e => setTaxScheme(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 outline-none transition-all appearance-none">
                                {TAX_SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Tax Rate (%)</label>
                            <input type="number" step="0.01" min="0" max="30" value={taxRate}
                                onChange={e => setTaxRate(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 outline-none transition-all" />
                        </div>
                    </div>
                )}
            </section>

            {/* Payment Terms */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                    <span className="w-1 h-5 rounded-full bg-emerald-500" />
                    <DollarSign size={14} /> Payment Terms
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {PAYMENT_TERMS.map(term => (
                        <button key={term} type="button" onClick={() => setPaymentTerms(term)}
                            className={cn(
                                'p-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-wider text-center',
                                paymentTerms === term
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            )}>
                            {term}
                        </button>
                    ))}
                </div>
            </section>

            {/* Summary */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                    <span className="w-1 h-5 rounded-full bg-slate-400" />
                    <Receipt size={14} /> Current Configuration
                </h3>
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tax Profile</span>
                        <span className="text-sm font-black text-slate-900">{taxProfile}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Scheme</span>
                        <span className="text-sm font-black text-slate-900">{taxProfile === 'Override' ? taxScheme : 'Brand Default'}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Terms</span>
                        <span className="text-sm font-black text-slate-900">{paymentTerms}</span>
                    </div>
                </div>
            </section>

            <div className="flex items-center justify-end gap-3">
                {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                        <CheckCircle2 size={14} /> Saved
                    </span>
                )}
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save Config'}
                </button>
            </div>
        </div>
    );
}
