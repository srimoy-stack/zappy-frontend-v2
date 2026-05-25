'use client';

import React, { useState } from 'react';
import {
    Layers3, Lock, Unlock, Check, X, Building2, Store, HelpCircle,
    Plus, Trash2, ToggleLeft, ToggleRight, DollarSign, Percent, Eye, AlertCircle
} from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { cn } from '@/utils';

const STORES = [
    { id: 'store-chicago', name: 'Chicago Loop Outlet', city: 'Chicago' },
    { id: 'store-newyork', name: 'Manhattan Broad Ave', city: 'New York' },
    { id: 'store-miami', name: 'Miami Beach Center', city: 'Miami' }
];

export const StoreOverridesStep: React.FC = () => {
    const { formData, updateFormData } = useWizardStore();
    const [selectedStoreId, setSelectedStoreId] = useState<string>('store-chicago');

    const overrides = formData.storeOverrides || [];
    const scopeConfig = formData.scopeConfig || { scope: 'GLOBAL', targetedStoreIds: [] };

    const updateScope = (scope: 'GLOBAL' | 'STORE_SPECIFIC') => {
        updateFormData('scopeConfig', {
            ...scopeConfig,
            scope,
            targetedStoreIds: scope === 'GLOBAL' ? [] : [STORES[0].id]
        });
    };

    const toggleTargetedStore = (storeId: string) => {
        const current = [...(scopeConfig.targetedStoreIds || [])];
        const idx = current.indexOf(storeId);
        if (idx >= 0) {
            current.splice(idx, 1);
        } else {
            current.push(storeId);
        }
        updateFormData('scopeConfig', {
            ...scopeConfig,
            targetedStoreIds: current
        });
    };

    const getOverride = (storeId: string) => {
        return overrides.find(o => o.storeId === storeId);
    };

    const setOverrideField = (storeId: string, field: 'priceOverride' | 'availabilityOverride' | 'taxRateOverride', value: any) => {
        const storeName = STORES.find(s => s.id === storeId)?.name || 'Store';
        const current = [...overrides];
        const idx = current.findIndex(o => o.storeId === storeId);

        if (idx >= 0) {
            current[idx] = {
                ...current[idx],
                [field]: value
            };
            // Clean up if all overrides removed
            if (current[idx].priceOverride === undefined &&
                current[idx].availabilityOverride === undefined &&
                current[idx].taxRateOverride === undefined) {
                current.splice(idx, 1);
            }
        } else {
            current.push({
                storeId,
                storeName,
                [field]: value
            });
        }
        updateFormData('storeOverrides', current);
    };

    const removeAllOverrides = (storeId: string) => {
        updateFormData('storeOverrides', overrides.filter(o => o.storeId !== storeId));
    };

    const activeStore = STORES.find(s => s.id === selectedStoreId) || STORES[0];
    const activeOverride = getOverride(activeStore.id);

    return (
        <div className="space-y-7 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="p-3 bg-slate-950 rounded-2xl shadow-md">
                    <Layers3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Store Deployment & Overrides</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                        Define where this product is sold and customize store-specific prices, availability, or taxes
                    </p>
                </div>
            </div>

            {/* ── Section 1: Deployment Scope Selection ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Deployment Scope</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                        Decide if this product is deployed globally to all stores or specific franchise branches
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => updateScope('GLOBAL')}
                        className={cn("p-5 border rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-start gap-4",
                            scopeConfig.scope === 'GLOBAL' ? "border-slate-950 bg-slate-50/50 shadow-md" : "border-slate-200/60 hover:border-slate-300")}>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                            <Store className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Global Availability</span>
                            <span className="text-[9px] text-slate-400 font-medium block mt-1 uppercase">Sold in all stores by default. Simplifies menu replication.</span>
                        </div>
                    </button>

                    <button onClick={() => updateScope('STORE_SPECIFIC')}
                        className={cn("p-5 border rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-start gap-4",
                            scopeConfig.scope === 'STORE_SPECIFIC' ? "border-slate-950 bg-slate-50/50 shadow-md" : "border-slate-200/60 hover:border-slate-300")}>
                        <div className="p-2 bg-violet-50 text-violet-600 rounded-xl mt-0.5">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Store-Specific Deployment</span>
                            <span className="text-[9px] text-slate-400 font-medium block mt-1 uppercase">Only available in hand-picked branches. Perfect for local test menu runs.</span>
                        </div>
                    </button>
                </div>

                {scopeConfig.scope === 'STORE_SPECIFIC' && (
                    <div className="pt-3 border-t border-slate-100 animate-in slide-in-from-top-1 duration-150">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-2">Target Stores ({scopeConfig.targetedStoreIds?.length || 0} selected)</span>
                        <div className="flex flex-wrap gap-2">
                            {STORES.map(st => {
                                const active = (scopeConfig.targetedStoreIds || []).includes(st.id);
                                return (
                                    <button key={st.id} onClick={() => toggleTargetedStore(st.id)}
                                        className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-2",
                                            active ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300")}>
                                        <Building2 className="w-3.5 h-3.5" /> {st.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Section 2: Store Specific Customizations ── */}
            <div className="grid grid-cols-12 gap-7">
                {/* Store Picker */}
                <div className="col-span-4 bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Select Location</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Customize local overrides</p>
                    </div>

                    <div className="space-y-1.5">
                        {STORES.map(st => {
                            const isSelected = selectedStoreId === st.id;
                            const hasCustomizations = !!getOverride(st.id);
                            return (
                                <button key={st.id} onClick={() => setSelectedStoreId(st.id)}
                                    className={cn("w-full flex items-center justify-between p-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left border",
                                        isSelected ? "bg-slate-950 text-white border-slate-950 shadow-md" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50")}>
                                    <div className="flex items-center gap-2.5">
                                        <Building2 className={cn("w-4 h-4", isSelected ? "text-emerald-400" : "text-slate-400")} />
                                        <div>
                                            <span className="block truncate">{st.name}</span>
                                            <span className="text-[8px] opacity-60 font-medium block mt-0.5">{st.city}</span>
                                        </div>
                                    </div>
                                    {hasCustomizations && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow shadow-emerald-200"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Overrides Configuration Box */}
                <div className="col-span-8 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Configuring Customizations For</span>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mt-0.5 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-500" /> {activeStore.name}
                            </h4>
                        </div>
                        {activeOverride && (
                            <button onClick={() => removeAllOverrides(activeStore.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all">
                                Clear Overrides
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* 1. Custom Store Price */}
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Custom Store Price</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">
                                        Master Brand Price: ${formData.baseProductPrice ? formData.baseProductPrice.toFixed(2) : '0.00'}
                                    </span>
                                </div>
                                <button onClick={() => {
                                    if (activeOverride?.priceOverride !== undefined) {
                                        setOverrideField(activeStore.id, 'priceOverride', undefined);
                                    } else {
                                        setOverrideField(activeStore.id, 'priceOverride', formData.baseProductPrice || 10.00);
                                    }
                                }}
                                    className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5",
                                        activeOverride?.priceOverride !== undefined ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
                                    {activeOverride?.priceOverride !== undefined ? <><Unlock className="w-3 h-3 text-emerald-500" /> Customized</> : <><Lock className="w-3 h-3 text-slate-400" /> Inherit Master</>}
                                </button>
                            </div>

                            {activeOverride?.priceOverride !== undefined && (
                                <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-150">
                                    <span className="text-xs font-mono font-bold text-slate-400">$</span>
                                    <input type="number" step="0.01" value={activeOverride.priceOverride}
                                        onChange={(e) => setOverrideField(activeStore.id, 'priceOverride', parseFloat(e.target.value) || 0)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900 w-32" />
                                </div>
                            )}
                        </div>

                        {/* 2. Custom Store Availability */}
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Custom Store Availability</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">
                                        Master Brand Availability: {formData.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                                    </span>
                                </div>
                                <button onClick={() => {
                                    if (activeOverride?.availabilityOverride !== undefined) {
                                        setOverrideField(activeStore.id, 'availabilityOverride', undefined);
                                    } else {
                                        setOverrideField(activeStore.id, 'availabilityOverride', !formData.isAvailable);
                                    }
                                }}
                                    className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5",
                                        activeOverride?.availabilityOverride !== undefined ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
                                    {activeOverride?.availabilityOverride !== undefined ? <><Unlock className="w-3 h-3 text-emerald-500" /> Customized</> : <><Lock className="w-3 h-3 text-slate-400" /> Inherit Master</>}
                                </button>
                            </div>

                            {activeOverride?.availabilityOverride !== undefined && (
                                <div className="flex gap-2 animate-in slide-in-from-top-1 duration-150">
                                    <button onClick={() => setOverrideField(activeStore.id, 'availabilityOverride', true)}
                                        className={cn("px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                                            activeOverride.availabilityOverride === true ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-white text-slate-400 border-slate-200")}>
                                        Available
                                    </button>
                                    <button onClick={() => setOverrideField(activeStore.id, 'availabilityOverride', false)}
                                        className={cn("px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                                            activeOverride.availabilityOverride === false ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-white text-slate-400 border-slate-200")}>
                                        Unavailable
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3. Custom Store Tax Rate */}
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Custom Store Tax Rate</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">
                                        Master Brand Tax Rate: {formData.taxRate}%
                                    </span>
                                </div>
                                <button onClick={() => {
                                    if (activeOverride?.taxRateOverride !== undefined) {
                                        setOverrideField(activeStore.id, 'taxRateOverride', undefined);
                                    } else {
                                        setOverrideField(activeStore.id, 'taxRateOverride', formData.taxRate || 5.00);
                                    }
                                }}
                                    className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5",
                                        activeOverride?.taxRateOverride !== undefined ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
                                    {activeOverride?.taxRateOverride !== undefined ? <><Unlock className="w-3 h-3 text-emerald-500" /> Customized</> : <><Lock className="w-3 h-3 text-slate-400" /> Inherit Master</>}
                                </button>
                            </div>

                            {activeOverride?.taxRateOverride !== undefined && (
                                <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-150">
                                    <input type="number" step="0.01" value={activeOverride.taxRateOverride}
                                        onChange={(e) => setOverrideField(activeStore.id, 'taxRateOverride', parseFloat(e.target.value) || 0)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900 w-32" />
                                    <span className="text-xs font-mono font-bold text-slate-400">%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                    <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-wider leading-none">Franchise Override Safety Protocol</h5>
                    <p className="text-[9px] text-amber-700 font-bold uppercase tracking-tight mt-1 leading-normal">
                        Store level overrides are strictly isolated. Custom pricing, availability, and tax configurations defined here will apply exclusively to their target stores and will not affect overall master menu replication.
                    </p>
                </div>
            </div>
        </div>
    );
};
