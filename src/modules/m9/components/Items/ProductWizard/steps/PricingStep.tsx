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
    const [showAddRule, setShowAddRule] = useState(false);
    const [newRuleName, setNewRuleName] = useState('');
    const [newRuleType, setNewRuleType] = useState<DynamicPricingType>('TIME_BASED');

    const rules = formData.dynamicPricingRules || [];

    const addRule = () => {
        if (!newRuleName.trim()) return;
        const rule = {
            id: 'dpr-' + Date.now(),
            name: newRuleName.trim(),
            channelId: newRuleType === 'CHANNEL_BASED' ? 'UBER' : 'ALL',
            adjustmentType: 'PERCENTAGE' as const,
            adjustmentValue: newRuleType === 'CHANNEL_BASED' ? 15 : -10,
            conditions: {
                days: newRuleType === 'DAY_BASED' ? ['Tue'] : [],
                timeStart: newRuleType === 'TIME_BASED' ? '11:00' : '',
                timeEnd: newRuleType === 'TIME_BASED' ? '14:00' : '',
            },
        };
        updateFormData('dynamicPricingRules', [...rules, rule]);
        setNewRuleName('');
        setShowAddRule(false);
    };

    const updateRule = (id: string, updates: any) => {
        updateFormData('dynamicPricingRules', rules.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteRule = (id: string) => {
        updateFormData('dynamicPricingRules', rules.filter(r => r.id !== id));
    };

    const toggleChannel = (ch: string) => {
        const current = [...(formData.channelVisibility || [])];
        const idx = current.indexOf(ch);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(ch);
        updateFormData('channelVisibility', current);
    };

    const toggleDay = (day: string) => {
        const sched = formData.availabilitySchedule || { days: DAYS, timeStart: '00:00', timeEnd: '23:59' };
        const days = [...sched.days];
        const idx = days.indexOf(day);
        if (idx >= 0) days.splice(idx, 1);
        else days.push(day);
        updateFormData('availabilitySchedule', { ...sched, days });
    };

    const schedule = formData.availabilitySchedule || { days: DAYS, timeStart: '00:00', timeEnd: '23:59' };

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
                        Dynamic pricing rules, channel visibility, and availability schedule
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

            {/* ── Section 2: Channel Visibility ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Channel Visibility</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Select which ordering channels can see this product</p>
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
            </div>

            {/* ── Section 3: Tax Configuration ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Tax Rate (%)</label>
                        <input type="number" step="0.01" value={formData.taxRate} onChange={(e) => updateFormData('taxRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900 transition-all" />
                    </div>
                    <div className="flex items-end">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Preview</span>
                            <span className="text-sm font-mono font-bold text-slate-900">
                                ${formData.baseProductPrice.toFixed(2)} + {formData.taxRate}% = ${(formData.baseProductPrice * (1 + formData.taxRate / 100)).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 4: Availability Schedule ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Availability Schedule</h4>
                <div className="flex flex-wrap gap-1.5">
                    {DAYS.map(day => {
                        const active = schedule.days.includes(day);
                        return (
                            <button key={day} onClick={() => toggleDay(day)}
                                className={cn("w-12 h-10 rounded-lg text-[10px] font-black uppercase border transition-all",
                                    active ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>
                                {day}
                            </button>
                        );
                    })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Start Time</label>
                        <input type="time" value={schedule.timeStart} onChange={(e) => updateFormData('availabilitySchedule', { ...schedule, timeStart: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900" />
                    </div>
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">End Time</label>
                        <input type="time" value={schedule.timeEnd} onChange={(e) => updateFormData('availabilitySchedule', { ...schedule, timeEnd: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900" />
                    </div>
                </div>
            </div>

            {/* ── Section 5: Dynamic Pricing Rules ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Dynamic Pricing Rules</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Modify prices before coupon calculation • {rules.length} rules</p>
                    </div>
                    <button onClick={() => setShowAddRule(!showAddRule)}
                        className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                            showAddRule ? "bg-white border border-slate-300 text-slate-600" : "bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200")}>
                        {showAddRule ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Rule</>}
                    </button>
                </div>

                {/* Add Rule Form */}
                {showAddRule && (
                    <div className="border-2 border-slate-900 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-12 gap-3 mb-3">
                            <div className="col-span-6">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Rule Name *</label>
                                <input value={newRuleName} onChange={(e) => setNewRuleName(e.target.value)} placeholder="e.g. Lunch Special -10%"
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900 placeholder:text-slate-300"
                                    onKeyDown={(e) => e.key === 'Enter' && addRule()} autoFocus />
                            </div>
                            <div className="col-span-6">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Type</label>
                                <select value={newRuleType} onChange={(e) => setNewRuleType(e.target.value as DynamicPricingType)}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                    {(Object.keys(PRICING_TYPE_META) as DynamicPricingType[]).map(t => (
                                        <option key={t} value={t}>{PRICING_TYPE_META[t].emoji} {PRICING_TYPE_META[t].label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button onClick={addRule} disabled={!newRuleName.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30">
                            <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Rule
                        </button>
                    </div>
                )}

                {/* Existing Rules */}
                {rules.length === 0 && !showAddRule && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">No dynamic pricing rules configured</span>
                        <span className="text-[9px] text-slate-300 font-medium block mt-1">Add rules for channel markups, time-based discounts, etc.</span>
                    </div>
                )}

                <div className="space-y-3">
                    {rules.map(rule => (
                        <div key={rule.id} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{rule.name}</span>
                                <button onClick={() => deleteRule(rule.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Channel</label>
                                    <select value={rule.channelId} onChange={(e) => updateRule(rule.id, { channelId: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                        <option value="ALL">All Channels</option>
                                        {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Type</label>
                                    <select value={rule.adjustmentType} onChange={(e) => updateRule(rule.id, { adjustmentType: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">
                                        Value {rule.adjustmentType === 'PERCENTAGE' ? '(%)' : '($)'}
                                    </label>
                                    <input type="number" step="0.01" value={rule.adjustmentValue}
                                        onChange={(e) => updateRule(rule.id, { adjustmentValue: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                </div>
                            </div>
                            {rule.conditions && (
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Days</label>
                                        <input value={(rule.conditions.days || []).join(', ')}
                                            onChange={(e) => updateRule(rule.id, { conditions: { ...rule.conditions, days: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                                            placeholder="Mon, Tue..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 placeholder:text-slate-300" />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Start Time</label>
                                        <input type="time" value={rule.conditions.timeStart || ''}
                                            onChange={(e) => updateRule(rule.id, { conditions: { ...rule.conditions, timeStart: e.target.value } })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold outline-none focus:border-slate-900" />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">End Time</label>
                                        <input type="time" value={rule.conditions.timeEnd || ''}
                                            onChange={(e) => updateRule(rule.id, { conditions: { ...rule.conditions, timeEnd: e.target.value } })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold outline-none focus:border-slate-900" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Pricing Order Reference ── */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-3">Pricing Calculation Order (Backend Authoritative)</h4>
                <div className="flex flex-wrap gap-1.5">
                    {['Base Price', 'Variants', 'Modifiers', 'Addons', 'Deal Rules', 'Dynamic Pricing', 'Coupons', 'Fees', 'Taxes', 'Tips', 'Final'].map((step, i) => (
                        <div key={step} className="flex items-center gap-1">
                            <span className={cn("px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider border",
                                i === 5 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-500 border-slate-200")}>{i + 1}. {step}</span>
                            {i < 10 && <span className="text-slate-300 text-[8px]">→</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
