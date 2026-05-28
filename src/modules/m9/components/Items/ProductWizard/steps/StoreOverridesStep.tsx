'use client';

import React, { useState } from 'react';
import {
    Layers3, Lock, Unlock, Check, X, Building2, Store, HelpCircle,
    Plus, Trash2, ToggleLeft, ToggleRight, DollarSign, Percent, Eye, AlertCircle, Clock, Calendar
} from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { cn } from '@/utils';

const STORES = [
    { id: 'store-chicago', name: 'Chicago Loop Outlet', city: 'Chicago' },
    { id: 'store-newyork', name: 'Manhattan Broad Ave', city: 'New York' },
    { id: 'store-miami', name: 'Miami Beach Center', city: 'Miami' }
];

const CHANNELS = ['POS', 'ONLINE', 'UBER', 'DOORDASH', 'SKIP', 'KIOSK'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StoreOverridesStep: React.FC = () => {
    const { formData, updateFormData } = useWizardStore();
    const [selectedStoreId, setSelectedStoreId] = useState<string>('store-chicago');

    // Store-Channel level state helpers
    const [expandedChStore, setExpandedChStore] = useState<string | null>(null);
    const [isStoreChRuleForm, setStoreChRuleForm] = useState<string | null>(null);
    const [newChRuleName, setNewChRuleName] = useState('');
    const [newChRuleAdjType, setNewChRuleAdjType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [newChRuleAdjVal, setNewChRuleAdjVal] = useState<number>(10);
    const [newChRuleStartDate, setNewChRuleStartDate] = useState('');
    const [newChRuleEndDate, setNewChRuleEndDate] = useState('');
    const [newChRuleTimeStart, setNewChRuleTimeStart] = useState('00:00');
    const [newChRuleTimeEnd, setNewChRuleTimeEnd] = useState('23:59');

    // State for local store rule add form
    const [showAddRule, setShowAddRule] = useState(false);
    const [newRuleName, setNewRuleName] = useState('');
    const [newRuleAdjType, setNewRuleAdjType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [newRuleAdjVal, setNewRuleAdjVal] = useState<number>(10);
    const [newRuleStartDate, setNewRuleStartDate] = useState('');
    const [newRuleEndDate, setNewRuleEndDate] = useState('');
    const [newRuleTimeStart, setNewRuleTimeStart] = useState('00:00');
    const [newRuleTimeEnd, setNewRuleTimeEnd] = useState('23:59');

    const overrides = formData.storeOverrides || [];
    const scopeConfig = formData.scopeConfig || { scope: 'GLOBAL', targetedStoreIds: STORES.map(s => s.id) };

    // Auto-select all stores if scope is global and targetedStoreIds is empty
    React.useEffect(() => {
        if (scopeConfig.scope === 'GLOBAL' && (!scopeConfig.targetedStoreIds || scopeConfig.targetedStoreIds.length < STORES.length)) {
            updateFormData('scopeConfig', {
                ...scopeConfig,
                targetedStoreIds: STORES.map(s => s.id)
            });
        }
    }, [scopeConfig.scope]);

    const updateScope = (scope: 'GLOBAL' | 'STORE_SPECIFIC') => {
        updateFormData('scopeConfig', {
            ...scopeConfig,
            scope,
            targetedStoreIds: scope === 'GLOBAL' ? STORES.map(s => s.id) : [STORES[0].id]
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

    const setOverrideField = (
        storeId: string, 
        field: 'priceOverride' | 'availabilityOverride' | 'taxRateOverride' | 'availabilitySchedule' | 'dynamicPricingRules' | 'channelVisibility' | 'channelOverrides', 
        value: any
    ) => {
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
                current[idx].taxRateOverride === undefined &&
                current[idx].availabilitySchedule === undefined &&
                current[idx].dynamicPricingRules === undefined &&
                current[idx].channelVisibility === undefined &&
                current[idx].channelOverrides === undefined) {
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

    const toggleStoreDay = (day: string) => {
        const sched = activeOverride?.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
        const days = [...sched.days];
        const idx = days.indexOf(day);
        if (idx >= 0) days.splice(idx, 1);
        else days.push(day);

        setOverrideField(activeStore.id, 'availabilitySchedule', { ...sched, days });
    };

    const updateStoreScheduleField = (field: string, value: any) => {
        const sched = activeOverride?.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
        setOverrideField(activeStore.id, 'availabilitySchedule', { ...sched, [field]: value });
    };

    const addStoreRule = () => {
        if (!newRuleName.trim()) return;
        const existingRules = activeOverride?.dynamicPricingRules || [];
        const newRule = {
            id: 'dpr-' + Date.now(),
            name: newRuleName.trim(),
            channelId: 'ALL',
            adjustmentType: newRuleAdjType,
            adjustmentValue: newRuleAdjVal,
            conditions: {
                days: [...DAYS],
                timeStart: newRuleTimeStart,
                timeEnd: newRuleTimeEnd,
                startDate: newRuleStartDate,
                endDate: newRuleEndDate
            }
        };
        setOverrideField(activeStore.id, 'dynamicPricingRules', [...existingRules, newRule]);
        
        // Reset form state
        setNewRuleName('');
        setNewRuleAdjType('PERCENTAGE');
        setNewRuleAdjVal(10);
        setNewRuleStartDate('');
        setNewRuleEndDate('');
        setNewRuleTimeStart('00:00');
        setNewRuleTimeEnd('23:59');
        setShowAddRule(false);
    };

    const deleteStoreRule = (ruleId: string) => {
        const existingRules = activeOverride?.dynamicPricingRules || [];
        setOverrideField(activeStore.id, 'dynamicPricingRules', existingRules.filter(r => r.id !== ruleId));
    };

    // Store-Channel Overrides Handlers
    const updateStoreChOverride = (ch: string, field: string, value: any) => {
        const chOverrides = activeOverride?.channelOverrides || {};
        const nextOverrides = {
            ...chOverrides,
            [ch]: {
                ...(chOverrides[ch] || {}),
                [field]: value
            }
        };
        // Clean up empty configurations
        if (value === undefined) {
            delete nextOverrides[ch][field];
            if (Object.keys(nextOverrides[ch]).length === 0) {
                delete nextOverrides[ch];
            }
        }
        setOverrideField(activeStore.id, 'channelOverrides', Object.keys(nextOverrides).length > 0 ? nextOverrides : undefined);
    };

    const toggleStoreChDay = (ch: string, day: string) => {
        const chOverrides = activeOverride?.channelOverrides || {};
        const chOverride = chOverrides[ch] || {};
        const sched = chOverride.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
        const days = [...sched.days];
        const idx = days.indexOf(day);
        if (idx >= 0) days.splice(idx, 1);
        else days.push(day);

        updateStoreChOverride(ch, 'availabilitySchedule', { ...sched, days });
    };

    const updateStoreChScheduleField = (ch: string, field: string, value: any) => {
        const chOverrides = activeOverride?.channelOverrides || {};
        const chOverride = chOverrides[ch] || {};
        const sched = chOverride.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
        updateStoreChOverride(ch, 'availabilitySchedule', { ...sched, [field]: value });
    };

    const addStoreChRule = (ch: string) => {
        if (!newChRuleName.trim()) return;
        const chOverrides = activeOverride?.channelOverrides || {};
        const chOverride = chOverrides[ch] || {};
        const existingRules = chOverride.dynamicPricingRules || [];
        const newRule = {
            id: 'dpr-' + Date.now(),
            name: newChRuleName.trim(),
            channelId: ch,
            adjustmentType: newChRuleAdjType,
            adjustmentValue: newChRuleAdjVal,
            conditions: {
                days: [...DAYS],
                timeStart: newChRuleTimeStart,
                timeEnd: newChRuleTimeEnd,
                startDate: newChRuleStartDate,
                endDate: newChRuleEndDate
            }
        };
        updateStoreChOverride(ch, 'dynamicPricingRules', [...existingRules, newRule]);

        // Reset rule form state
        setNewChRuleName('');
        setNewChRuleAdjType('PERCENTAGE');
        setNewChRuleAdjVal(10);
        setNewChRuleStartDate('');
        setNewChRuleEndDate('');
        setNewChRuleTimeStart('00:00');
        setNewChRuleTimeEnd('23:59');
        setStoreChRuleForm(null);
    };

    const deleteStoreChRule = (ch: string, ruleId: string) => {
        const chOverrides = activeOverride?.channelOverrides || {};
        const chOverride = chOverrides[ch] || {};
        const existingRules = chOverride.dynamicPricingRules || [];
        updateStoreChOverride(ch, 'dynamicPricingRules', existingRules.filter(r => r.id !== ruleId));
    };

    const activeSched = activeOverride?.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
    const activeRules = activeOverride?.dynamicPricingRules || [];

    const activeChans = activeOverride?.channelVisibility !== undefined 
        ? activeOverride.channelVisibility 
        : (formData.channelVisibility || []);

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

                {scopeConfig.scope === 'GLOBAL' && (
                    <div className="pt-3.5 border-t border-slate-100 animate-in slide-in-from-top-1 duration-150 flex items-center gap-2">
                        <div className="p-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            All locations and stores selected
                        </span>
                    </div>
                )}

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
                            const isDeployed = scopeConfig.scope === 'GLOBAL' || (scopeConfig.targetedStoreIds || []).includes(st.id);

                            return (
                                <button key={st.id} onClick={() => setSelectedStoreId(st.id)}
                                    className={cn("w-full flex items-center justify-between p-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left border",
                                        isSelected ? "bg-slate-50 text-slate-900 border-slate-300 shadow-sm" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200")}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("p-1.5 rounded-lg flex items-center justify-center transition-all", 
                                            isDeployed ? "bg-slate-950 text-emerald-400 border border-slate-950 shadow-sm shadow-emerald-950/20" : "bg-slate-50 text-slate-400 border-slate-100")}>
                                            {isDeployed ? <Check className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block truncate font-bold text-slate-800">{st.name}</span>
                                            <span className="text-[8px] font-bold block mt-0.5 text-slate-400">
                                                {st.city} {isDeployed && "• DEPLOYED"}
                                            </span>
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

                    <div className="space-y-5">
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

                        {/* 4. Store-Level Availability Schedule */}
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Custom Store Schedule</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">
                                        Override default product availability schedule for this store
                                    </span>
                                </div>
                                <button onClick={() => {
                                    if (activeOverride?.availabilitySchedule !== undefined) {
                                        setOverrideField(activeStore.id, 'availabilitySchedule', undefined);
                                    } else {
                                        setOverrideField(activeStore.id, 'availabilitySchedule', { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' });
                                    }
                                }}
                                    className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5",
                                        activeOverride?.availabilitySchedule !== undefined ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
                                    {activeOverride?.availabilitySchedule !== undefined ? <><Unlock className="w-3 h-3 text-emerald-500" /> Customized</> : <><Lock className="w-3 h-3 text-slate-400" /> Inherit Master</>}
                                </button>
                            </div>

                            {activeOverride?.availabilitySchedule !== undefined && (
                                <div className="space-y-3 animate-in slide-in-from-top-1 duration-150 pt-2 border-t border-slate-200/50">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Start Date (Date-Wise)</label>
                                            <input type="date" value={activeSched.startDate || ''}
                                                onChange={(e) => updateStoreScheduleField('startDate', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Date (Date-Wise)</label>
                                            <input type="date" value={activeSched.endDate || ''}
                                                onChange={(e) => updateStoreScheduleField('endDate', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Active Days</label>
                                        <div className="flex flex-wrap gap-1">
                                            {DAYS.map(day => {
                                                const active = activeSched.days.includes(day);
                                                return (
                                                    <button key={day} onClick={() => toggleStoreDay(day)}
                                                        className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all",
                                                            active ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Start Time</label>
                                            <input type="time" value={activeSched.timeStart}
                                                onChange={(e) => updateStoreScheduleField('timeStart', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Time</label>
                                            <input type="time" value={activeSched.timeEnd}
                                                onChange={(e) => updateStoreScheduleField('timeEnd', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. Store-Level Dynamic Pricing Rules */}
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Custom Store Rules</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">
                                        Define rules specific to this store (e.g. happy hours, local surcharges)
                                    </span>
                                </div>
                                <button onClick={() => {
                                    if (activeOverride?.dynamicPricingRules !== undefined) {
                                        setOverrideField(activeStore.id, 'dynamicPricingRules', undefined);
                                    } else {
                                        setOverrideField(activeStore.id, 'dynamicPricingRules', []);
                                    }
                                }}
                                    className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5",
                                        activeOverride?.dynamicPricingRules !== undefined ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
                                    {activeOverride?.dynamicPricingRules !== undefined ? <><Unlock className="w-3 h-3 text-emerald-500" /> Customized</> : <><Lock className="w-3 h-3 text-slate-400" /> Inherit Master</>}
                                </button>
                            </div>

                            {activeOverride?.dynamicPricingRules !== undefined && (
                                <div className="space-y-3 animate-in slide-in-from-top-1 duration-150 pt-2 border-t border-slate-200/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Dynamic Rules ({activeRules.length})</span>
                                        <button onClick={() => setShowAddRule(!showAddRule)}
                                            className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all",
                                                showAddRule ? "bg-white border border-slate-300 text-slate-600" : "bg-slate-950 text-white hover:bg-slate-800")}>
                                            {showAddRule ? 'Cancel' : '+ Add Rule'}
                                        </button>
                                    </div>

                                    {/* Add Rule Form */}
                                    {showAddRule && (
                                        <div className="border border-slate-900 rounded-xl p-3 bg-slate-100/50 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule Name *</label>
                                                    <input value={newRuleName} onChange={(e) => setNewRuleName(e.target.value)}
                                                        placeholder="e.g. Local Surcharge"
                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Value Type</label>
                                                    <select value={newRuleAdjType} onChange={(e) => setNewRuleAdjType(e.target.value as any)}
                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                                        <option value="PERCENTAGE">Percentage (%)</option>
                                                        <option value="FIXED">Fixed ($)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Adjustment Value</label>
                                                    <input type="number" value={newRuleAdjVal} onChange={(e) => setNewRuleAdjVal(parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Days / Time</label>
                                                    <div className="text-[9px] text-slate-400 font-medium py-2">Applies daily from {newRuleTimeStart} to {newRuleTimeEnd}</div>
                                                </div>
                                            </div>

                                            {/* Date Ranges */}
                                            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50">
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule Start Date</label>
                                                    <input type="date" value={newRuleStartDate} onChange={(e) => setNewRuleStartDate(e.target.value)}
                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule End Date</label>
                                                    <input type="date" value={newRuleEndDate} onChange={(e) => setNewRuleEndDate(e.target.value)}
                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule Start Time</label>
                                                    <input type="time" value={newRuleTimeStart} onChange={(e) => setNewRuleTimeStart(e.target.value)}
                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule End Time</label>
                                                    <input type="time" value={newRuleTimeEnd} onChange={(e) => setNewRuleTimeEnd(e.target.value)}
                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                </div>
                                            </div>

                                            <button onClick={addStoreRule} disabled={!newRuleName.trim()}
                                                className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-30">
                                                Create Store Rule
                                            </button>
                                        </div>
                                    )}

                                    {/* Existing Rules */}
                                    {activeRules.length === 0 ? (
                                        <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase block">No store pricing rules configured</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {activeRules.map(rule => (
                                                <div key={rule.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-wider block">{rule.name}</span>
                                                        <span className="text-[8px] font-mono font-bold text-slate-500 uppercase block">
                                                            Adjustment: {rule.adjustmentType === 'PERCENTAGE' ? `${rule.adjustmentValue}%` : `$${rule.adjustmentValue}`}
                                                        </span>
                                                        <span className="text-[8px] text-slate-400 font-medium block">
                                                            {rule.conditions?.startDate || 'Any Start'} → {rule.conditions?.endDate || 'Any End'}
                                                            {rule.conditions?.timeStart && ` • ${rule.conditions.timeStart}-${rule.conditions.timeEnd}`}
                                                        </span>
                                                    </div>
                                                    <button onClick={() => deleteStoreRule(rule.id)}
                                                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Store Channel Visibility */}
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Store Channel Visibility</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">
                                        Customize which channels this product is sold on at this store
                                    </span>
                                </div>
                                <button onClick={() => {
                                    if (activeOverride?.channelVisibility !== undefined) {
                                        setOverrideField(activeStore.id, 'channelVisibility', undefined);
                                    } else {
                                        setOverrideField(activeStore.id, 'channelVisibility', [...(formData.channelVisibility || [])]);
                                    }
                                }}
                                    className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5",
                                        activeOverride?.channelVisibility !== undefined ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
                                    {activeOverride?.channelVisibility !== undefined ? <><Unlock className="w-3 h-3 text-emerald-500" /> Customized</> : <><Lock className="w-3 h-3 text-slate-400" /> Inherit Master</>}
                                </button>
                            </div>

                            {activeOverride?.channelVisibility !== undefined && (
                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50">
                                    {CHANNELS.map(ch => {
                                        const active = activeChans.includes(ch);
                                        return (
                                            <button key={ch} onClick={() => {
                                                const current = [...activeChans];
                                                const idx = current.indexOf(ch);
                                                if (idx >= 0) current.splice(idx, 1);
                                                else current.push(ch);
                                                setOverrideField(activeStore.id, 'channelVisibility', current);
                                            }}
                                                className={cn("px-3 py-2 rounded-xl text-[9px] font-black uppercase border transition-all",
                                                    active ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>
                                                {ch}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Store Channel Overrides */}
                        {activeChans.length > 0 && (
                            <div className="border-t border-slate-100 pt-4 space-y-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                    6. Channel-Specific Overrides for {activeStore.name}
                                </span>
                                <div className="space-y-3">
                                    {activeChans.map(ch => {
                                        const chOverrides = activeOverride?.channelOverrides || {};
                                        const chOverride = chOverrides[ch] || {};
                                        const hasChCustom = chOverride.basePrice !== undefined || 
                                                            chOverride.taxRate !== undefined || 
                                                            chOverride.availabilitySchedule !== undefined || 
                                                            chOverride.dynamicPricingRules !== undefined;
                                        
                                        const isExpanded = expandedChStore === `${activeStore.id}-${ch}`;
                                        const chSched = chOverride.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
                                        const chRules = chOverride.dynamicPricingRules || [];

                                        return (
                                            <div key={ch} className={cn(
                                                "rounded-xl border transition-all duration-200 overflow-hidden",
                                                isExpanded ? "border-slate-950 bg-white" : hasChCustom ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200 bg-slate-50/30"
                                            )}>
                                                {/* Channel Header button */}
                                                <button
                                                    onClick={() => setExpandedChStore(isExpanded ? null : `${activeStore.id}-${ch}`)}
                                                    className="w-full flex items-center justify-between p-3 text-left outline-none"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("w-1.5 h-1.5 rounded-full", hasChCustom ? "bg-emerald-500" : "bg-slate-300")} />
                                                        <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider">
                                                            {ch} Channel
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {hasChCustom && (
                                                            <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-100">
                                                                Customized
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                            {isExpanded ? '▲' : '▼'}
                                                        </span>
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-4 bg-white">
                                                        {/* Price & Tax Overrides */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Base Price Override ($)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder={`Inherited`}
                                                                    value={chOverride.basePrice ?? ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                                                                        updateStoreChOverride(ch, 'basePrice', val);
                                                                    }}
                                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Tax Rate Override (%)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder={`Inherited`}
                                                                    value={chOverride.taxRate ?? ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                                                                        updateStoreChOverride(ch, 'taxRate', val);
                                                                    }}
                                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Channel Schedule Override inside Store */}
                                                        <div className="space-y-2 pt-2 border-t border-slate-100">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Availability Schedule</span>
                                                                {chOverride.availabilitySchedule && (
                                                                    <button onClick={() => updateStoreChOverride(ch, 'availabilitySchedule', undefined)}
                                                                        className="text-[8px] font-black text-rose-500 uppercase tracking-wider hover:underline">
                                                                        Inherit Default
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Start Date (Date-Wise)</label>
                                                                    <input type="date" value={chSched.startDate || ''}
                                                                        onChange={(e) => updateStoreChScheduleField(ch, 'startDate', e.target.value)}
                                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Date (Date-Wise)</label>
                                                                    <input type="date" value={chSched.endDate || ''}
                                                                        onChange={(e) => updateStoreChScheduleField(ch, 'endDate', e.target.value)}
                                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Active Days</label>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {DAYS.map(day => {
                                                                        const active = chSched.days.includes(day);
                                                                        return (
                                                                            <button key={day} onClick={() => toggleStoreChDay(ch, day)}
                                                                                className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase border transition-all",
                                                                                    active ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>
                                                                                {day}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Start Time</label>
                                                                    <input type="time" value={chSched.timeStart}
                                                                        onChange={(e) => updateStoreChScheduleField(ch, 'timeStart', e.target.value)}
                                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Time</label>
                                                                    <input type="time" value={chSched.timeEnd}
                                                                        onChange={(e) => updateStoreChScheduleField(ch, 'timeEnd', e.target.value)}
                                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Channel Dynamic Rules Override inside Store */}
                                                        <div className="space-y-2 pt-2 border-t border-slate-100">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Dynamic Rules ({chRules.length})</span>
                                                                <button onClick={() => setStoreChRuleForm(isStoreChRuleForm === `${ch}` ? null : `${ch}`)}
                                                                    className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all",
                                                                        isStoreChRuleForm === `${ch}` ? "bg-white border border-slate-300 text-slate-600" : "bg-slate-950 text-white hover:bg-slate-800")}>
                                                                    {isStoreChRuleForm === `${ch}` ? 'Cancel' : '+ Add Rule'}
                                                                </button>
                                                            </div>

                                                            {isStoreChRuleForm === `${ch}` && (
                                                                <div className="border border-slate-900 rounded-xl p-3 bg-slate-100/50 space-y-3">
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule Name *</label>
                                                                            <input value={newChRuleName} onChange={(e) => setNewChRuleName(e.target.value)}
                                                                                placeholder="e.g. Happy Hour"
                                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Value Type</label>
                                                                            <select value={newChRuleAdjType} onChange={(e) => setNewChRuleAdjType(e.target.value as any)}
                                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                                                                <option value="PERCENTAGE">Percentage (%)</option>
                                                                                <option value="FIXED">Fixed ($)</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Adjustment Value</label>
                                                                            <input type="number" value={newChRuleAdjVal} onChange={(e) => setNewChRuleAdjVal(parseFloat(e.target.value) || 0)}
                                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule Time</label>
                                                                            <div className="text-[9px] text-slate-400 font-medium py-1.5">Applies {newChRuleTimeStart} to {newChRuleTimeEnd}</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Date range for channel level rule in store */}
                                                                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50">
                                                                        <div>
                                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Start Date</label>
                                                                            <input type="date" value={newChRuleStartDate} onChange={(e) => setNewChRuleStartDate(e.target.value)}
                                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Date</label>
                                                                            <input type="date" value={newChRuleEndDate} onChange={(e) => setNewChRuleEndDate(e.target.value)}
                                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Start Time</label>
                                                                            <input type="time" value={newChRuleTimeStart} onChange={(e) => setNewChRuleTimeStart(e.target.value)}
                                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Time</label>
                                                                            <input type="time" value={newChRuleTimeEnd} onChange={(e) => setNewChRuleTimeEnd(e.target.value)}
                                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                                        </div>
                                                                    </div>

                                                                    <button onClick={() => addStoreChRule(ch)} disabled={!newChRuleName.trim()}
                                                                        className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-30">
                                                                        Create Channel Rule
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Rule List */}
                                                            {chRules.length === 0 ? (
                                                                <div className="text-center py-2 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                                                    <span className="text-[8px] text-slate-400 font-bold uppercase">No rules configured for {ch} at this store</span>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1.5">
                                                                    {chRules.map(rule => (
                                                                        <div key={rule.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between">
                                                                            <div className="space-y-0.5">
                                                                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-wider block">{rule.name}</span>
                                                                                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase block">
                                                                                    Adjustment: {rule.adjustmentType === 'PERCENTAGE' ? `${rule.adjustmentValue}%` : `$${rule.adjustmentValue}`}
                                                                                </span>
                                                                                <span className="text-[8px] text-slate-400 font-medium block">
                                                                                    {rule.conditions?.startDate || 'Any Start'} → {rule.conditions?.endDate || 'Any End'}
                                                                                    {rule.conditions?.timeStart && ` • ${rule.conditions.timeStart}-${rule.conditions.timeEnd}`}
                                                                                </span>
                                                                            </div>
                                                                            <button onClick={() => deleteStoreChRule(ch, rule.id)}
                                                                                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-all">
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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

