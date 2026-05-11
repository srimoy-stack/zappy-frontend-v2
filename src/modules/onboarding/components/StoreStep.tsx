'use client';

import React from 'react';
import { Store, Building2, MapPin, Phone, Plus, Trash2, Copy } from 'lucide-react';
import { FormSectionTitle, InputWrapper, INPUT_CLASS, SELECT_CLASS } from './ui';
import type { OnboardingStoreData } from '../types/onboarding.types';

interface StoreStepProps {
    stores: OnboardingStoreData[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: string, value: any) => void;
    onDuplicate: (id: string) => void;
}

export function StoreStep({ stores, onAdd, onRemove, onUpdate, onDuplicate }: StoreStepProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <FormSectionTitle icon={Store} title="Store Locations" />
                    <button onClick={onAdd} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
                        <Plus className="w-4 h-4" /> Add Store
                    </button>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-2">
                    You can add stores now, or skip this step and add them later from the brand dashboard.
                </p>
                {stores.length === 0 && (
                    <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                            <Store className="w-7 h-7 text-slate-300" />
                        </div>
                        <h4 className="text-sm font-black text-slate-600 mb-1">No stores added yet</h4>
                        <p className="text-xs text-slate-400 font-medium max-w-xs">Click &quot;Add Store&quot; above to register your first location, or skip this step entirely.</p>
                    </div>
                )}
            </section>

            {stores.map((store, idx) => (
                <section key={store.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                <Store className="w-5 h-5 text-slate-900" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">{store.storeName || `Store ${idx + 1}`}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    {store.shortCode ? `Code: ${store.shortCode}` : `ID: ${store.id}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onDuplicate(store.id)} title="Duplicate" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => onRemove(store.id)} title="Remove" className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="p-8 space-y-10">
                        <div className="space-y-6">
                            <FormSectionTitle icon={Building2} title="Store Identity" />
                            <div className="grid grid-cols-2 gap-6">
                                <InputWrapper label="Store Name" required>
                                    <input required type="text" value={store.storeName} onChange={(e) => onUpdate(store.id, 'storeName', e.target.value)} className={INPUT_CLASS} placeholder="e.g. Downtown Main St." />
                                </InputWrapper>
                                <InputWrapper label="Short Code (Optional)">
                                    <input type="text" value={store.shortCode} onChange={(e) => onUpdate(store.id, 'shortCode', e.target.value.toUpperCase())} maxLength={8} className={`${INPUT_CLASS} font-mono uppercase`} placeholder="e.g. DT-MAIN" />
                                </InputWrapper>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <FormSectionTitle icon={MapPin} title="Store Address" />
                            <InputWrapper label="Address Line 1" required>
                                <input required value={store.addressLine1} onChange={(e) => onUpdate(store.id, 'addressLine1', e.target.value)} className={INPUT_CLASS} placeholder="Street address" />
                            </InputWrapper>
                            <div className="grid grid-cols-2 gap-6">
                                <InputWrapper label="City" required>
                                    <input required value={store.city} onChange={(e) => onUpdate(store.id, 'city', e.target.value)} className={INPUT_CLASS} />
                                </InputWrapper>
                                <InputWrapper label="Province" required>
                                    <select value={store.province} onChange={(e) => onUpdate(store.id, 'province', e.target.value)} className={SELECT_CLASS}>
                                        <option>Ontario</option><option>British Columbia</option><option>Quebec</option><option>Alberta</option>
                                    </select>
                                </InputWrapper>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <InputWrapper label="Postal Code" required>
                                    <input required value={store.postalCode} onChange={(e) => onUpdate(store.id, 'postalCode', e.target.value)} className={`${INPUT_CLASS} font-mono uppercase`} />
                                </InputWrapper>
                                <InputWrapper label="Country">
                                    <input disabled value={store.country} className="w-full px-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm opacity-60 cursor-not-allowed" />
                                </InputWrapper>
                                <InputWrapper label="Phone">
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="tel" value={store.phone} onChange={(e) => onUpdate(store.id, 'phone', e.target.value)} className={`${INPUT_CLASS} pl-11 font-mono`} placeholder="+1 (000) 000-0000" />
                                    </div>
                                </InputWrapper>
                            </div>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}
