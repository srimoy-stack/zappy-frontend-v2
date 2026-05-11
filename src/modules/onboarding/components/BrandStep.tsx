'use client';

import React from 'react';
import { Building2, MapPin, Globe, ImageIcon, Upload, Mail, Phone, Coins } from 'lucide-react';
import { FormSectionTitle, InputWrapper, INPUT_CLASS, SELECT_CLASS } from './ui';
import type { OnboardingBrandData } from '../types/onboarding.types';

interface BrandStepProps {
    data: OnboardingBrandData;
    onChange: (updates: Partial<OnboardingBrandData>) => void;
}

export function BrandStep({ data, onChange }: BrandStepProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Identity */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={Building2} title="Market Identity" />
                <div className="grid grid-cols-1 gap-6">
                    <InputWrapper label="Brand Legal Name">
                        <input type="text" value={data.brandLegalName} onChange={(e) => onChange({ brandLegalName: e.target.value })} className={INPUT_CLASS} placeholder="e.g. Zyappy QSR Global Ltd." />
                    </InputWrapper>
                    <div className="grid grid-cols-2 gap-6">
                        <InputWrapper label="Brand Display Name" required>
                            <input required type="text" value={data.brandName} onChange={(e) => onChange({ brandName: e.target.value })} className={INPUT_CLASS} placeholder="e.g. Zyappy" />
                        </InputWrapper>
                        <InputWrapper label="Trade Name">
                            <input type="text" value={data.tradeName} onChange={(e) => onChange({ tradeName: e.target.value })} className={INPUT_CLASS} placeholder="e.g. Zyappy Pizza" />
                        </InputWrapper>
                    </div>
                </div>
            </section>

            {/* Address */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={MapPin} title="Global Headquarters" />
                <div className="space-y-6">
                    <InputWrapper label="Address Line 1" required>
                        <input required value={data.addressLine1} onChange={(e) => onChange({ addressLine1: e.target.value })} className={INPUT_CLASS} placeholder="Street address or P.O. box" />
                    </InputWrapper>
                    <InputWrapper label="Address Line 2 (Optional)">
                        <input value={data.addressLine2} onChange={(e) => onChange({ addressLine2: e.target.value })} className={INPUT_CLASS} placeholder="Apartment, suite, unit, etc." />
                    </InputWrapper>
                    <div className="grid grid-cols-2 gap-6">
                        <InputWrapper label="City" required>
                            <input required value={data.city} onChange={(e) => onChange({ city: e.target.value })} className={INPUT_CLASS} />
                        </InputWrapper>
                        <InputWrapper label="Province / State" required>
                            <select value={data.province} onChange={(e) => onChange({ province: e.target.value })} className={SELECT_CLASS}>
                                <option>Ontario</option><option>British Columbia</option><option>Quebec</option><option>Alberta</option>
                            </select>
                        </InputWrapper>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <InputWrapper label="Postal / Zip Code" required>
                            <input required value={data.postalCode} onChange={(e) => onChange({ postalCode: e.target.value })} className={`${INPUT_CLASS} font-mono uppercase`} />
                        </InputWrapper>
                        <InputWrapper label="Country" required>
                            <input disabled value={data.country} className="w-full px-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm opacity-60 cursor-not-allowed" />
                        </InputWrapper>
                    </div>
                </div>
            </section>

            {/* Operational Config */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={Globe} title="Operational Config" />
                <div className="grid grid-cols-2 gap-6">
                    <InputWrapper label="System Timezone" required>
                        <select value={data.timezone} onChange={(e) => onChange({ timezone: e.target.value })} className={SELECT_CLASS}>
                            <option>Eastern Standard Time (EST)</option><option>Pacific Standard Time (PST)</option>
                        </select>
                    </InputWrapper>
                    <InputWrapper label="Base Currency" required>
                        <select value={data.currency} onChange={(e) => onChange({ currency: e.target.value })} className={SELECT_CLASS}>
                            <option>CAD ($)</option><option>USD ($)</option>
                        </select>
                    </InputWrapper>
                    <InputWrapper label="Primary Contact Email">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="email" value={data.contactEmail} onChange={(e) => onChange({ contactEmail: e.target.value })} className={`${INPUT_CLASS} pl-11`} placeholder="admin@brand.com" />
                        </div>
                    </InputWrapper>
                    <InputWrapper label="Primary Contact Phone">
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="tel" value={data.contactPhone} onChange={(e) => onChange({ contactPhone: e.target.value })} className={`${INPUT_CLASS} pl-11 font-mono`} placeholder="+1 (000) 000-0000" />
                        </div>
                    </InputWrapper>
                </div>
            </section>

            {/* Branding */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={ImageIcon} title="Identity Assets" />
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo (Light Mode)</p>
                        <div className="aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center group hover:border-slate-900 hover:bg-slate-50 cursor-pointer transition-all">
                            <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-slate-900 transition-colors" />
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">Upload PNG/SVG</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo (Dark Mode – Optional)</p>
                        <div className="aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900 flex flex-col items-center justify-center group hover:border-slate-700 cursor-pointer transition-all">
                            <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Upload PNG/SVG</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Payment Terms */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={Coins} title="Default Payment Terms" />
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        {(['PREPAID', 'NET_DAYS', 'DUE_ON_RECEIPT'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => onChange({ paymentTermType: type })}
                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${
                                    data.paymentTermType === type
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    {type === 'NET_DAYS' ? 'Net Days' : type === 'DUE_ON_RECEIPT' ? 'Due on Receipt' : 'Prepaid'}
                                </span>
                            </button>
                        ))}
                    </div>
                    {data.paymentTermType === 'NET_DAYS' && (
                        <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl animate-in slide-in-from-top-2 duration-300">
                            <InputWrapper label="Net Days (Maturity Period)">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={data.netDays}
                                        onChange={(e) => onChange({ netDays: parseInt(e.target.value) || 0 })}
                                        className="w-32 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        min="1"
                                    />
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Days after invoice</span>
                                </div>
                            </InputWrapper>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
