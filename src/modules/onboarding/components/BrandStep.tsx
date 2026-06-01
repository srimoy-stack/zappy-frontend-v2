'use client';

import React, { useRef, useCallback } from 'react';
import { Building2, MapPin, Globe, ImageIcon, Upload, Mail, Phone, Coins, X } from 'lucide-react';
import { FormSectionTitle, InputWrapper, INPUT_CLASS, SELECT_CLASS } from './ui';
import type { OnboardingBrandData } from '../types/onboarding.types';

interface BrandStepProps {
    data: OnboardingBrandData;
    onChange: (updates: Partial<OnboardingBrandData>) => void;
}

export function BrandStep({ data, onChange }: BrandStepProps) {
    const lightLogoRef = useRef<HTMLInputElement>(null);
    const darkLogoRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = useCallback((file: File, field: 'lightLogo' | 'darkLogo') => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PNG, SVG, JPEG, or WebP image.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            onChange({ [field]: dataUrl });
        };
        reader.readAsDataURL(file);
    }, [onChange]);

    const handleDrop = useCallback((e: React.DragEvent, field: 'lightLogo' | 'darkLogo') => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file, field);
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

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

            {/* Store Architecture */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={Building2} title="Store Architecture" />
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {(['SINGLE_STORE', 'FRANCHISE'] as const).map((strategy) => (
                            <button
                                key={strategy}
                                type="button"
                                onClick={() => onChange({ storeStrategy: strategy })}
                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${
                                    data.storeStrategy === strategy
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    {strategy === 'SINGLE_STORE' ? 'Single Store' : 'Franchise (Multi-Store)'}
                                </span>
                            </button>
                        ))}
                    </div>
                    {data.storeStrategy === 'FRANCHISE' && (
                        <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl animate-in slide-in-from-top-2 duration-300">
                            <InputWrapper label="Max Allowed Stores">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={data.maxStores}
                                        onChange={(e) => onChange({ maxStores: parseInt(e.target.value) || 1 })}
                                        className="w-32 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        min="2"
                                    />
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Stores Limit</span>
                                </div>
                            </InputWrapper>
                        </div>
                    )}
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
                    {/* Light Logo */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo (Light Mode)</p>
                        <input
                            ref={lightLogoRef}
                            type="file"
                            accept="image/png,image/svg+xml,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'lightLogo');
                                e.target.value = '';
                            }}
                        />
                        {data.lightLogo ? (
                            <div className="relative aspect-[3/1] rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden group">
                                <img src={data.lightLogo} alt="Light logo" className="w-full h-full object-contain p-4" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => onChange({ lightLogo: null })}
                                        className="p-2 bg-red-500 rounded-xl text-white shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => lightLogoRef.current?.click()}
                                        className="p-2 bg-white rounded-xl text-slate-900 shadow-lg hover:bg-slate-100 transition-colors ml-2"
                                    >
                                        <Upload size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => lightLogoRef.current?.click()}
                                onDrop={(e) => handleDrop(e, 'lightLogo')}
                                onDragOver={handleDragOver}
                                className="aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center group hover:border-slate-900 hover:bg-slate-50 cursor-pointer transition-all"
                            >
                                <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-slate-900 transition-colors" />
                                <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">Upload PNG/SVG</span>
                                <span className="text-[9px] text-slate-300 mt-1">or drag & drop • max 5MB</span>
                            </div>
                        )}
                    </div>

                    {/* Dark Logo */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo (Dark Mode – Optional)</p>
                        <input
                            ref={darkLogoRef}
                            type="file"
                            accept="image/png,image/svg+xml,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'darkLogo');
                                e.target.value = '';
                            }}
                        />
                        {data.darkLogo ? (
                            <div className="relative aspect-[3/1] rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden group">
                                <img src={data.darkLogo} alt="Dark logo" className="w-full h-full object-contain p-4" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => onChange({ darkLogo: null })}
                                        className="p-2 bg-red-500 rounded-xl text-white shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => darkLogoRef.current?.click()}
                                        className="p-2 bg-white rounded-xl text-slate-900 shadow-lg hover:bg-slate-100 transition-colors ml-2"
                                    >
                                        <Upload size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => darkLogoRef.current?.click()}
                                onDrop={(e) => handleDrop(e, 'darkLogo')}
                                onDragOver={handleDragOver}
                                className="aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900 flex flex-col items-center justify-center group hover:border-slate-700 cursor-pointer transition-all"
                            >
                                <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-white transition-colors" />
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Upload PNG/SVG</span>
                                <span className="text-[9px] text-slate-600 mt-1">or drag & drop • max 5MB</span>
                            </div>
                        )}
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
