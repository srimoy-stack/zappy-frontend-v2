'use client';

import { CreditCard, Percent, DollarSign, Plus, Trash2, Receipt, Users, Calculator, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils';
import type { StoreWizardData, WizardTaxRule, WizardFeeRule, TaxType, TaxMode, FeeType, FeeCalcMethod } from './wizard.types';
import type { PaymentProvider } from '@/shared/types/store';

interface Props {
    data: StoreWizardData;
    update: (field: keyof StoreWizardData, value: any) => void;
}

const I = 'w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all';
const L = 'text-[10px] font-black text-slate-600 uppercase tracking-widest';
const SEL = cn(I, 'appearance-none');

const PROVIDERS: { value: PaymentProvider; label: string }[] = [
    { value: 'moneris', label: 'Moneris' }, { value: 'clover', label: 'Clover' },
    { value: 'stripe', label: 'Stripe' }, { value: 'square', label: 'Square' },
    { value: 'bambora', label: 'Bambora' }, { value: 'fiserv', label: 'Fiserv' },
];

const TAX_TYPES: TaxType[] = ['GST', 'HST', 'PST', 'QST', 'VAT', 'Sales Tax', 'Alcohol Tax', 'Delivery Tax', 'Service Tax', 'Environmental Fee'];
const TAX_MODES: { value: TaxMode; label: string; desc: string }[] = [
    { value: 'exclusive', label: 'Exclusive', desc: 'Added on top of price' },
    { value: 'inclusive', label: 'Inclusive', desc: 'Included in menu price' },
    { value: 'compound', label: 'Compound', desc: 'Tax stacked on tax' },
];
const CHANNELS = ['all', 'pos', 'online', 'kiosk', 'delivery'];

const FEE_TYPES: { value: FeeType; label: string }[] = [
    { value: 'delivery', label: 'Delivery Fee' }, { value: 'service', label: 'Service Fee' },
    { value: 'packaging', label: 'Packaging Fee' }, { value: 'convenience', label: 'Convenience Fee' },
    { value: 'small_order', label: 'Small Order Fee' }, { value: 'fuel_surcharge', label: 'Fuel Surcharge' },
    { value: 'late_night', label: 'Late Night Fee' }, { value: 'processing', label: 'Processing Fee' },
    { value: 'bottle_deposit', label: 'Bottle Deposit' }, { value: 'bag', label: 'Bag Fee' },
];
const FEE_METHODS: { value: FeeCalcMethod; label: string }[] = [
    { value: 'fixed', label: 'Fixed $' }, { value: 'percentage', label: 'Percentage %' },
    { value: 'distance_based', label: 'Distance-Based' }, { value: 'per_item', label: 'Per Item' },
    { value: 'per_order', label: 'Per Order' },
];
const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'];

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
    return (
        <button type="button" onClick={onToggle} className="flex items-center justify-between w-full py-2.5 group">
            <span className={cn('text-xs font-bold', on ? 'text-slate-900' : 'text-slate-400')}>{label}</span>
            <div className={cn('w-10 h-6 rounded-full transition-all relative', on ? 'bg-emerald-500' : 'bg-slate-200')}>
                <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} />
            </div>
        </button>
    );
}

export function WizardStepPaymentsTax({ data, update }: Props) {
    // ── Tax Rule Helpers ──
    const addTaxRule = () => {
        const id = `tax-${Date.now()}`;
        update('taxRules', [...data.taxRules, { id, name: '', type: 'GST' as TaxType, rate: '5', mode: 'exclusive' as TaxMode, channelScope: 'all', priority: data.taxRules.length + 1 }]);
    };
    const removeTaxRule = (id: string) => update('taxRules', data.taxRules.filter(r => r.id !== id));
    const updateTaxRule = (id: string, field: keyof WizardTaxRule, val: any) =>
        update('taxRules', data.taxRules.map(r => r.id === id ? { ...r, [field]: val } : r));

    // ── Fee Rule Helpers ──
    const addFeeRule = () => {
        const id = `fee-${Date.now()}`;
        update('feeRules', [...data.feeRules, { id, name: '', type: 'service' as FeeType, method: 'fixed' as FeeCalcMethod, value: '0', taxable: true, refundable: true, enabled: true }]);
    };
    const removeFeeRule = (id: string) => update('feeRules', data.feeRules.filter(r => r.id !== id));
    const updateFeeRule = (id: string, field: keyof WizardFeeRule, val: any) =>
        update('feeRules', data.feeRules.map(r => r.id === id ? { ...r, [field]: val } : r));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* ═══ PAYMENT PROVIDER ═══ */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-violet-500" />
                    <CreditCard size={13} /> Payment Provider
                </h4>
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {PROVIDERS.map(p => (
                        <button key={p.value} type="button" onClick={() => update('paymentProvider', p.value)}
                            className={cn('p-3.5 rounded-xl border-2 text-center transition-all text-xs font-black',
                                data.paymentProvider === p.value ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                            )}>{p.label}</button>
                    ))}
                </div>
                {data.paymentProvider && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-1.5">
                            <label className={L}>Merchant ID</label>
                            <input value={data.merchantId} onChange={e => update('merchantId', e.target.value)} placeholder="MID-XXXXXX" className={cn(I, 'font-mono')} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={L}>Terminal ID</label>
                            <input value={data.terminalId} onChange={e => update('terminalId', e.target.value)} placeholder="TID-XXXXXX" className={cn(I, 'font-mono')} />
                        </div>
                    </div>
                )}
                <div className="pt-4 mt-4 border-t border-slate-100 divide-y divide-slate-50">
                    <Toggle on={data.tipsEnabled} onToggle={() => update('tipsEnabled', !data.tipsEnabled)} label="Tips Enabled" />
                    <Toggle on={data.refundEnabled} onToggle={() => update('refundEnabled', !data.refundEnabled)} label="Refunds Enabled" />
                    <Toggle on={data.splitPayment} onToggle={() => update('splitPayment', !data.splitPayment)} label="Split Payments" />
                </div>
            </section>

            {/* ═══ TAX ENGINE ═══ */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full bg-amber-500" />
                        <Percent size={13} /> Tax Engine
                    </h4>
                    <div className="flex items-center gap-2">
                        {(['Inherit', 'Override'] as const).map(p => (
                            <button key={p} type="button" onClick={() => update('taxProfile', p)}
                                className={cn('px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                                    data.taxProfile === p ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                )}>{p === 'Inherit' ? 'Inherit Brand' : 'Override'}</button>
                        ))}
                    </div>
                </div>

                {data.taxProfile === 'Inherit' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-700 font-bold">
                        <ShieldCheck size={12} className="inline mr-1.5" />
                        Tax rules will be inherited from the brand-level configuration. You can override per-store after creation.
                    </div>
                )}

                {data.taxProfile === 'Override' && (
                    <div className="space-y-4">
                        {/* Tax Mode Reference */}
                        <div className="grid grid-cols-3 gap-2">
                            {TAX_MODES.map(m => (
                                <div key={m.value} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                                    <span className="text-[10px] font-black text-amber-800 uppercase block">{m.label}</span>
                                    <span className="text-[9px] text-amber-600 font-medium">{m.desc}</span>
                                </div>
                            ))}
                        </div>

                        {/* Tax Rules List */}
                        <div className="space-y-3">
                            {data.taxRules.map((rule, idx) => (
                                <div key={rule.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tax Rule #{idx + 1}</span>
                                        <button type="button" onClick={() => removeTaxRule(rule.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase">Name</label>
                                            <input value={rule.name} onChange={e => updateTaxRule(rule.id, 'name', e.target.value)} placeholder="e.g. Ontario HST" className={cn(I, 'py-2.5 text-xs')} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase">Type</label>
                                            <select value={rule.type} onChange={e => updateTaxRule(rule.id, 'type', e.target.value)} className={cn(SEL, 'py-2.5 text-xs')}>
                                                {TAX_TYPES.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase">Rate %</label>
                                            <input type="number" step="0.01" min="0" max="50" value={rule.rate} onChange={e => updateTaxRule(rule.id, 'rate', e.target.value)} className={cn(I, 'py-2.5 text-xs font-mono')} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase">Mode</label>
                                            <select value={rule.mode} onChange={e => updateTaxRule(rule.id, 'mode', e.target.value)} className={cn(SEL, 'py-2.5 text-xs')}>
                                                {TAX_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase">Channel</label>
                                            <select value={rule.channelScope} onChange={e => updateTaxRule(rule.id, 'channelScope', e.target.value)} className={cn(SEL, 'py-2.5 text-xs')}>
                                                {CHANNELS.map(c => <option key={c} value={c}>{c === 'all' ? 'All Channels' : c.toUpperCase()}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase">Priority</label>
                                            <input type="number" min="1" max="10" value={rule.priority} onChange={e => updateTaxRule(rule.id, 'priority', parseInt(e.target.value) || 1)} className={cn(I, 'py-2.5 text-xs font-mono')} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addTaxRule} className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-all w-full justify-center">
                            <Plus size={12} /> Add Tax Rule
                        </button>
                    </div>
                )}
            </section>

            {/* ═══ TIP CONFIG ═══ */}
            {data.tipsEnabled && (
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full bg-emerald-500" />
                        <Receipt size={13} /> Tip Configuration
                    </h4>
                    <div className="space-y-5">
                        {/* Presets */}
                        <div className="space-y-2">
                            <label className={L}>Suggested Tip Presets</label>
                            <input value={data.tipPresets} onChange={e => update('tipPresets', e.target.value)} placeholder="10,15,18,20" className={cn(I, 'font-mono')} />
                            <p className="text-[9px] text-slate-400 font-medium">Comma-separated percentages shown to customers</p>
                            <div className="flex gap-2 mt-1">
                                {data.tipPresets.split(',').filter(Boolean).map((v, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-200">{v.trim()}%</span>
                                ))}
                                <span className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black border border-slate-200">Custom</span>
                            </div>
                        </div>

                        {/* Calc Mode */}
                        <div className="space-y-2">
                            <label className={L}>Tip Calculation Mode</label>
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { value: 'before_tax', label: 'Before Tax', desc: 'Tip = Subtotal × %' },
                                    { value: 'after_tax', label: 'After Tax', desc: 'Tip = (Subtotal + Tax) × %' },
                                ] as const).map(m => (
                                    <button key={m.value} type="button" onClick={() => update('tipCalcMode', m.value)}
                                        className={cn('p-3.5 rounded-xl border-2 text-left transition-all',
                                            data.tipCalcMode === m.value ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.01]' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                        )}>
                                        <span className="text-xs font-black block">{m.label}</span>
                                        <span className={cn('text-[10px] font-medium', data.tipCalcMode === m.value ? 'text-slate-300' : 'text-slate-400')}>{m.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Auto Gratuity */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                            <Toggle on={data.autoGratuityEnabled} onToggle={() => update('autoGratuityEnabled', !data.autoGratuityEnabled)} label="Auto Gratuity" />
                            {data.autoGratuityEnabled && (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase">Min Party Size</label>
                                        <input type="number" min="1" value={data.autoGratuityMinParty} onChange={e => update('autoGratuityMinParty', e.target.value)} className={cn(I, 'py-2.5 text-xs')} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase">Gratuity %</label>
                                        <input type="number" step="0.5" min="0" max="30" value={data.autoGratuityPercent} onChange={e => update('autoGratuityPercent', e.target.value)} className={cn(I, 'py-2.5 text-xs font-mono')} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ FEES ENGINE ═══ */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full bg-blue-500" />
                        <Calculator size={13} /> Fee Engine
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold">{data.feeRules.length} fee{data.feeRules.length !== 1 ? 's' : ''}</span>
                </div>

                {data.feeRules.length === 0 && (
                    <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-xl mb-4">
                        <Calculator className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-400 font-bold">No fees configured. Add delivery, service, or packaging fees.</p>
                    </div>
                )}

                <div className="space-y-3">
                    {data.feeRules.map((fee, idx) => (
                        <div key={fee.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fee #{idx + 1}</span>
                                <button type="button" onClick={() => removeFeeRule(fee.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase">Fee Type</label>
                                    <select value={fee.type} onChange={e => updateFeeRule(fee.id, 'type', e.target.value)} className={cn(SEL, 'py-2.5 text-xs')}>
                                        {FEE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase">Method</label>
                                    <select value={fee.method} onChange={e => updateFeeRule(fee.id, 'method', e.target.value)} className={cn(SEL, 'py-2.5 text-xs')}>
                                        {FEE_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase">{fee.method === 'percentage' ? 'Rate %' : 'Amount $'}</label>
                                    <input type="number" step="0.01" min="0" value={fee.value} onChange={e => updateFeeRule(fee.id, 'value', e.target.value)} className={cn(I, 'py-2.5 text-xs font-mono')} />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Toggle on={fee.taxable} onToggle={() => updateFeeRule(fee.id, 'taxable', !fee.taxable)} label="Taxable" />
                                <Toggle on={fee.refundable} onToggle={() => updateFeeRule(fee.id, 'refundable', !fee.refundable)} label="Refundable" />
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addFeeRule} className="flex items-center gap-2 px-4 py-2.5 mt-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 transition-all w-full justify-center">
                    <Plus size={12} /> Add Fee Rule
                </button>
            </section>

            {/* ═══ PAYMENT TERMS ═══ */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-emerald-500" />
                    <DollarSign size={13} /> Payment Terms
                </h4>
                <div className="flex flex-wrap gap-2">
                    {PAYMENT_TERMS.map(t => (
                        <button key={t} type="button" onClick={() => update('paymentTerms', t)}
                            className={cn('px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider transition-all',
                                data.paymentTerms === t ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                            )}>{t}</button>
                    ))}
                </div>
            </section>

            {/* Calculation Order Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">Runtime Calculation Order</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['Subtotal', '→ Discounts', '→ Fees', '→ Taxes', '→ Tip', '→ Total'].map((s, i) => (
                        <span key={i} className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black',
                            i === 0 || i === 5 ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        )}>{s}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
