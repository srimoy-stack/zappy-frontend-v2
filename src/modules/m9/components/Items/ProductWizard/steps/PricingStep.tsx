'use client';

import React, { useState } from 'react';
import {
    DollarSign, Plus, Trash2, ToggleLeft, ToggleRight, X,
    Clock, Calendar, Globe, Store, TrendingUp, Percent, Hash
} from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { cn } from '@/utils';

type DynamicPricingType = 'TIME_BASED' | 'DAY_BASED' | 'CHANNEL_BASED' | 'STORE_BASED';

const PRICING_TYPE_META: Record<DynamicPricingType, { label: string; emoji: string; icon: any; desc: string }> = {
    TIME_BASED: { label: 'Time-Based', emoji: '⏰', icon: Clock, desc: 'Lunch specials, happy hour' },
    DAY_BASED: { label: 'Day-Based', emoji: '📅', icon: Calendar, desc: 'Tuesday discount, weekend pricing' },
    CHANNEL_BASED: { label: 'Channel-Based', emoji: '📡', icon: Globe, desc: 'Uber +15%, DoorDash markup' },
    STORE_BASED: { label: 'Store-Based', emoji: '🏪', icon: Store, desc: 'Downtown +$1, airport pricing' },
};

const CHANNELS = ['POS', 'ONLINE', 'UBER', 'DOORDASH', 'SKIP', 'KIOSK'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PricingStep: React.FC = () => {
    const { formData, updateFormData } = useWizardStore();
    const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

    // Track rule adding form input states for each channel override
    const [chRuleInputs, setChRuleInputs] = useState<Record<string, {
        name: string;
        adjustmentType: 'PERCENTAGE' | 'FIXED';
        adjustmentValue: number;
        startDate: string;
        endDate: string;
        timeStart: string;
        timeEnd: string;
        showForm: boolean;
    }>>({});

    const toggleChannel = (ch: string) => {
        const current = [...(formData.channelVisibility || [])];
        const idx = current.indexOf(ch);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(ch);
        updateFormData('channelVisibility', current);
    };

    const toggleChDay = (ch: string, day: string) => {
        const override = formData.channelOverrides?.[ch] || {};
        const sched = override.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
        const days = [...sched.days];
        const idx = days.indexOf(day);
        if (idx >= 0) days.splice(idx, 1);
        else days.push(day);

        const nextOverrides = {
            ...formData.channelOverrides,
            [ch]: {
                ...override,
                availabilitySchedule: { ...sched, days }
            }
        };
        updateFormData('channelOverrides', nextOverrides);
    };

    const updateChScheduleField = (ch: string, field: string, value: any) => {
        const override = formData.channelOverrides?.[ch] || {};
        const sched = override.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
        const nextOverrides = {
            ...formData.channelOverrides,
            [ch]: {
                ...override,
                availabilitySchedule: { ...sched, [field]: value }
            }
        };
        updateFormData('channelOverrides', nextOverrides);
    };

    const updateChRuleInput = (ch: string, field: string, value: any) => {
        setChRuleInputs(prev => ({
            ...prev,
            [ch]: {
                ...(prev[ch] || {
                    name: '',
                    adjustmentType: 'PERCENTAGE',
                    adjustmentValue: 10,
                    startDate: '',
                    endDate: '',
                    timeStart: '00:00',
                    timeEnd: '23:59',
                    showForm: false,
                }),
                [field]: value
            }
        }));
    };

    const addChRuleAction = (ch: string) => {
        const input = chRuleInputs[ch] || {
            name: '',
            adjustmentType: 'PERCENTAGE',
            adjustmentValue: 10,
            startDate: '',
            endDate: '',
            timeStart: '00:00',
            timeEnd: '23:59',
            showForm: false,
        };
        if (!input.name.trim()) return;

        const override = formData.channelOverrides?.[ch] || {};
        const existingRules = override.dynamicPricingRules || [];

        const newRule = {
            id: 'dpr-' + Date.now(),
            name: input.name.trim(),
            channelId: ch,
            adjustmentType: input.adjustmentType,
            adjustmentValue: input.adjustmentValue,
            conditions: {
                days: [...DAYS],
                timeStart: input.timeStart,
                timeEnd: input.timeEnd,
                startDate: input.startDate,
                endDate: input.endDate,
            }
        };

        const nextOverrides = {
            ...formData.channelOverrides,
            [ch]: {
                ...override,
                dynamicPricingRules: [...existingRules, newRule]
            }
        };
        updateFormData('channelOverrides', nextOverrides);

        // Reset the form state for this channel
        setChRuleInputs(prev => ({
            ...prev,
            [ch]: {
                name: '',
                adjustmentType: 'PERCENTAGE',
                adjustmentValue: 10,
                startDate: '',
                endDate: '',
                timeStart: '00:00',
                timeEnd: '23:59',
                showForm: false,
            }
        }));
    };

    const deleteChRule = (ch: string, ruleId: string) => {
        const override = formData.channelOverrides?.[ch] || {};
        const existingRules = override.dynamicPricingRules || [];
        const nextOverrides = {
            ...formData.channelOverrides,
            [ch]: {
                ...override,
                dynamicPricingRules: existingRules.filter(r => r.id !== ruleId)
            }
        };
        updateFormData('channelOverrides', nextOverrides);
    };

    return (
        <div className="space-y-7 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="p-3 bg-slate-950 rounded-2xl">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pricing & Availability</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                        Define channel visibility, base pricing, channel overrides, availability, and dynamic pricing rules.
                    </p>
                </div>
            </div>

            {/* ── Section 1: Availability Toggle ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Product Availability</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                            {formData.isAvailable ? 'This product is live and orderable' : 'This product is hidden from all channels'}
                        </p>
                    </div>
                    <button onClick={() => updateFormData('isAvailable', !formData.isAvailable)}
                        className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                            formData.isAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                        {formData.isAvailable ? <><ToggleRight className="w-4 h-4" /> Available</> : <><ToggleLeft className="w-4 h-4" /> Unavailable</>}
                    </button>
                </div>
            </div>

            {/* ── Section 2: Channel Visibility & Dynamic Overrides ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-5">
                <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Channel Visibility</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Select channels and set default pricing. Expand channel below for schedules and rules.</p>
                </div>

                <div className="flex gap-5 items-start">
                    {/* Left: Channel Selector */}
                    <div className="flex-1 space-y-3">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Select Channels</span>
                        <div className="flex flex-wrap gap-2">
                            {CHANNELS.map(ch => {
                                const active = (formData.channelVisibility || []).includes(ch);
                                return (
                                    <button key={ch} onClick={() => toggleChannel(ch)}
                                        className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                                            active ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>
                                        {ch}
                                    </button>
                                );
                            })}
                        </div>
                        {(formData.channelVisibility || []).length > 0 && (
                            <p className="text-[9px] text-emerald-600 font-bold uppercase">
                                {(formData.channelVisibility || []).length} channel{(formData.channelVisibility || []).length !== 1 ? 's' : ''} active
                            </p>
                        )}
                    </div>

                    {/* Right: Default Base Price & Tax Rate */}
                    <div className="w-[280px] shrink-0 bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Default Pricing</span>
                            {(formData.channelVisibility || []).length > 0 && (
                                <button
                                    onClick={() => {
                                        const nextOverrides = { ...formData.channelOverrides };
                                        (formData.channelVisibility || []).forEach(ch => {
                                            nextOverrides[ch] = {
                                                ...(nextOverrides[ch] || {}),
                                                basePrice: formData.baseProductPrice,
                                                taxRate: formData.taxRate,
                                            };
                                        });
                                        updateFormData('channelOverrides', nextOverrides);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-all"
                                >
                                    Apply to All
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Base Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.baseProductPrice}
                                    onChange={(e) => updateFormData('baseProductPrice', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.taxRate}
                                    onChange={(e) => updateFormData('taxRate', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900 transition-all"
                                />
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Preview</span>
                            <span className="text-xs font-mono font-bold text-slate-900">
                                ${formData.baseProductPrice.toFixed(2)} + {formData.taxRate}% = ${(formData.baseProductPrice * (1 + formData.taxRate / 100)).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Per-Channel Overrides */}
                {(formData.channelVisibility || []).length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">
                            Per-Channel Overrides • Configure pricing, schedules, and dynamic rules per channel
                        </span>
                        <div className="grid grid-cols-1 gap-4">
                            {(formData.channelVisibility || []).map(ch => {
                                const isExpanded = expandedChannel === ch;
                                const override = formData.channelOverrides?.[ch] || {};
                                const hasCustom = override.basePrice !== undefined || 
                                                  override.taxRate !== undefined || 
                                                  override.availabilitySchedule !== undefined || 
                                                  override.dynamicPricingRules !== undefined;

                                const sched = override.availabilitySchedule || { days: [...DAYS], timeStart: '00:00', timeEnd: '23:59', startDate: '', endDate: '' };
                                const rules = override.dynamicPricingRules || [];
                                const ruleInput = chRuleInputs[ch] || {
                                    name: '',
                                    adjustmentType: 'PERCENTAGE',
                                    adjustmentValue: 10,
                                    startDate: '',
                                    endDate: '',
                                    timeStart: '00:00',
                                    timeEnd: '23:59',
                                    showForm: false,
                                };

                                return (
                                    <div key={ch} className={cn(
                                        "rounded-xl border transition-all duration-200 overflow-hidden",
                                        isExpanded ? "border-slate-900 bg-white shadow-sm" : hasCustom ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                                    )}>
                                        <button
                                            onClick={() => setExpandedChannel(isExpanded ? null : ch)}
                                            className="w-full flex items-center justify-between p-3.5 text-left outline-none"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={cn("w-2 h-2 rounded-full", hasCustom ? "bg-emerald-500" : "bg-slate-300")} />
                                                <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                                                    {ch} Channel
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {hasCustom && (
                                                    <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                        ${(override.basePrice ?? formData.baseProductPrice).toFixed(2)} • {override.taxRate ?? formData.taxRate}%
                                                        {override.availabilitySchedule && ' • ⏰ Sched'}
                                                        {override.dynamicPricingRules && ` • ⚡ Rules (${override.dynamicPricingRules.length})`}
                                                    </span>
                                                )}
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                    {hasCustom ? 'Configured' : 'Default Inherited'} • {isExpanded ? '▲' : '▼'}
                                                </span>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="px-4 pb-5 pt-3 border-t border-slate-100 space-y-5 animate-in slide-in-from-top-1 duration-150 bg-white">
                                                
                                                {/* Price & Tax Override Fields */}
                                                <div className="space-y-2">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">1. Channel Pricing overrides</span>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">
                                                                Base Price ($)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder={`Default: $${formData.baseProductPrice.toFixed(2)}`}
                                                                value={override.basePrice ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                                                                    const nextOverrides = {
                                                                        ...formData.channelOverrides,
                                                                        [ch]: { ...override, basePrice: val }
                                                                    };
                                                                    updateFormData('channelOverrides', nextOverrides);
                                                                }}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">
                                                                Tax Rate (%)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder={`Default: ${formData.taxRate}%`}
                                                                value={override.taxRate ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                                                                    const nextOverrides = {
                                                                        ...formData.channelOverrides,
                                                                        [ch]: { ...override, taxRate: val }
                                                                    };
                                                                    updateFormData('channelOverrides', nextOverrides);
                                                                }}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Channel-Specific Availability Schedule (Date-Wise) */}
                                                <div className="border-t border-slate-100 pt-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">2. Availability Schedule ({ch})</span>
                                                        {override.availabilitySchedule && (
                                                            <button
                                                                onClick={() => {
                                                                    const nextOverrides = { ...formData.channelOverrides };
                                                                    delete nextOverrides[ch].availabilitySchedule;
                                                                    updateFormData('channelOverrides', nextOverrides);
                                                                }}
                                                                className="text-[8px] font-black text-rose-500 uppercase tracking-wider hover:underline"
                                                            >
                                                                Reset to default schedule
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Start Date (Date-Wise)</label>
                                                            <input type="date" value={sched.startDate || ''}
                                                                onChange={(e) => updateChScheduleField(ch, 'startDate', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Date (Date-Wise)</label>
                                                            <input type="date" value={sched.endDate || ''}
                                                                onChange={(e) => updateChScheduleField(ch, 'endDate', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Active Days</label>
                                                        <div className="flex flex-wrap gap-1">
                                                            {DAYS.map(day => {
                                                                const active = sched.days.includes(day);
                                                                return (
                                                                    <button key={day} onClick={() => toggleChDay(ch, day)}
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
                                                            <input type="time" value={sched.timeStart}
                                                                onChange={(e) => updateChScheduleField(ch, 'timeStart', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Time</label>
                                                            <input type="time" value={sched.timeEnd}
                                                                onChange={(e) => updateChScheduleField(ch, 'timeEnd', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Channel-Specific Dynamic Pricing Rules (Date-Wise) */}
                                                <div className="border-t border-slate-100 pt-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">3. Dynamic Pricing Rules ({ch})</span>
                                                        <button onClick={() => updateChRuleInput(ch, 'showForm', !ruleInput.showForm)}
                                                            className={cn("px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all",
                                                                ruleInput.showForm ? "bg-white border border-slate-300 text-slate-600" : "bg-slate-950 text-white hover:bg-slate-800")}>
                                                            {ruleInput.showForm ? 'Cancel' : '+ Add Rule'}
                                                        </button>
                                                    </div>

                                                    {/* Add Rule Form */}
                                                    {ruleInput.showForm && (
                                                        <div className="border border-slate-900 rounded-xl p-3 bg-slate-50 space-y-3">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule Name *</label>
                                                                    <input value={ruleInput.name} onChange={(e) => updateChRuleInput(ch, 'name', e.target.value)}
                                                                        placeholder="e.g. Happy Hour -10%"
                                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Value Type</label>
                                                                    <select value={ruleInput.adjustmentType} onChange={(e) => updateChRuleInput(ch, 'adjustmentType', e.target.value)}
                                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                                                        <option value="PERCENTAGE">Percentage (%)</option>
                                                                        <option value="FIXED">Fixed ($)</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Adjustment Value</label>
                                                                    <input type="number" value={ruleInput.adjustmentValue} onChange={(e) => updateChRuleInput(ch, 'adjustmentValue', parseFloat(e.target.value) || 0)}
                                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Days / Time</label>
                                                                    <div className="text-[9px] text-slate-400 font-medium py-2">Applies daily from {ruleInput.timeStart} to {ruleInput.timeEnd}</div>
                                                                </div>
                                                            </div>

                                                            {/* Date Range Conditions */}
                                                            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50">
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule Start Date</label>
                                                                    <input type="date" value={ruleInput.startDate || ''} onChange={(e) => updateChRuleInput(ch, 'startDate', e.target.value)}
                                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule End Date</label>
                                                                    <input type="date" value={ruleInput.endDate || ''} onChange={(e) => updateChRuleInput(ch, 'endDate', e.target.value)}
                                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule Start Time</label>
                                                                    <input type="time" value={ruleInput.timeStart} onChange={(e) => updateChRuleInput(ch, 'timeStart', e.target.value)}
                                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Rule End Time</label>
                                                                    <input type="time" value={ruleInput.timeEnd} onChange={(e) => updateChRuleInput(ch, 'timeEnd', e.target.value)}
                                                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                                                </div>
                                                            </div>

                                                            <button onClick={() => addChRuleAction(ch)} disabled={!ruleInput.name.trim()}
                                                                className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-30">
                                                                Create Dynamic Rule
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Existing Rules */}
                                                    {rules.length === 0 ? (
                                                        <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase block">No channel rules configured</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {rules.map(rule => (
                                                                <div key={rule.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
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
                                                                    <button onClick={() => deleteChRule(ch, rule.id)}
                                                                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-all">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                    <span className="text-[8px] text-slate-400 font-bold">
                                                        Configuring custom pricing rules and schedule for {ch}
                                                    </span>
                                                    {hasCustom && (
                                                        <button
                                                            onClick={() => {
                                                                const nextOverrides = { ...formData.channelOverrides };
                                                                delete nextOverrides[ch];
                                                                updateFormData('channelOverrides', nextOverrides);
                                                            }}
                                                            className="text-[8px] font-black text-rose-500 uppercase tracking-wider hover:underline"
                                                        >
                                                            Reset all {ch} settings
                                                        </button>
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
    );
};
