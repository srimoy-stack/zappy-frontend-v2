'use client';

import React, { useState } from 'react';
import { Scale, Plus, Check, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useRulesStore, Rule, RULE_TYPE_META, RuleType, PRIORITY_ORDER, RulePriority } from '../../../../state/rulesStore';
import { useWizardStore } from '../../../../state/wizardStore';
import { cn } from '@/utils';

export const RulesStep: React.FC = () => {
    const { rules, addRule } = useRulesStore();
    const { formData, updateFormData } = useWizardStore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<RuleType>('TOPPING_EQUIVALENCY');
    const [newPriority, setNewPriority] = useState<RulePriority>('PRODUCT');

    const attachedRuleIds: string[] = (formData.ruleAttachments || []).map(r => r.ruleId);
    const activeRules = rules.filter(r => r.status === 'ACTIVE' || r.status === 'DRAFT');

    const toggleRule = (ruleId: string) => {
        const current = [...(formData.ruleAttachments || [])];
        const idx = current.findIndex(r => r.ruleId === ruleId);
        if (idx >= 0) {
            current.splice(idx, 1);
        } else {
            current.push({
                ruleId,
                targetType: 'PRODUCT',
                targetId: formData.sku || 'NEW-PRODUCT',
                priority: 1,
                isActive: true
            });
        }
        updateFormData('ruleAttachments', current);
    };

    const handleCreateAndAttach = () => {
        if (!newName.trim()) return;
        const rule: Rule = {
            id: 'rule-' + Date.now(),
            name: newName.trim(),
            type: newType,
            status: 'ACTIVE',
            priority: newPriority,
            appliesTo: [],
            storeOverrideAllowed: true,
            createdAt: new Date().toISOString(),
            ...(newType === 'TOPPING_EQUIVALENCY' && { premiumMultiplier: 2 }),
            ...(newType === 'FREE_TOPPING_ALLOWANCE' && { includedToppings: 3, countMethod: 'PER_PIZZA' as const, extraToppingChargeMethod: 'PER_TOPPING' as const, extraToppingCharge: 1.50, maxToppingsAllowed: 10, blockCheckoutIfExceeded: false }),
            ...(newType === 'MAXIMUM_TOPPING' && { maxRegularEquivalentUnits: 10, maxPhysicalToppings: 5, applyPremiumMultiplier: true, managerOverrideAllowed: true }),
            ...(newType === 'HALF_AND_HALF' && { allowFull: true, allowLeftRight: true, allowQuarter: false, halfCountsAs: 0.5, sameToppingMergeLogic: 'COUNT_AS_ONE' as const }),
            ...(newType === 'PREMIUM_HALF_SIDE' && { allowFull: true, allowLeftRight: true, allowQuarter: false }),
            ...(newType === 'NO_LEFT_RIGHT' && { allowFull: true, allowLeftRight: false, allowQuarter: false }),
            ...(newType === 'MUST_BUY_WITH' && { minimumQuantity: 1, applyToChannels: ['POS', 'ONLINE'] }),
        };
        addRule(rule);
        const newAttachment = {
            ruleId: rule.id,
            targetType: 'PRODUCT' as const,
            targetId: formData.sku || 'NEW-PRODUCT',
            priority: 1,
            isActive: true
        };
        updateFormData('ruleAttachments', [...(formData.ruleAttachments || []), newAttachment]);
        setNewName('');
        setShowCreateForm(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="p-3 bg-slate-950 rounded-2xl">
                    <Scale className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Rules & Constraints</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                        Attach reusable rules to this product • {attachedRuleIds.length} selected
                    </p>
                </div>
                <button onClick={() => setShowCreateForm(!showCreateForm)}
                    className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                        showCreateForm ? "bg-white border border-slate-300 text-slate-600" : "bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200")}>
                    {showCreateForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5 text-emerald-400" /> Create New Rule</>}
                </button>
            </div>

            {/* Inline Create Form */}
            {showCreateForm && (
                <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Quick Create Rule</h4>
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-5">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Rule Name *</label>
                            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. 3 Free Toppings..."
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 placeholder:text-slate-300"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAttach()} autoFocus />
                        </div>
                        <div className="col-span-4">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Type</label>
                            <select value={newType} onChange={(e) => setNewType(e.target.value as RuleType)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                {(Object.keys(RULE_TYPE_META) as RuleType[]).map(t => (
                                    <option key={t} value={t}>{RULE_TYPE_META[t].emoji} {RULE_TYPE_META[t].name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as RulePriority)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                {PRIORITY_ORDER.map(p => (
                                    <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button onClick={handleCreateAndAttach} disabled={!newName.trim()}
                        className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30">
                        <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create & Attach
                    </button>
                </div>
            )}

            {/* Attached Rules (top) */}
            {attachedRuleIds.length > 0 && (
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Attached to this product ({attachedRuleIds.length})</span>
                    {attachedRuleIds.map(rid => {
                        const r = rules.find(x => x.id === rid);
                        if (!r) return null;
                        const meta = RULE_TYPE_META[r.type];
                        return (
                            <div key={rid} className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{meta.emoji}</span>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{r.name}</span>
                                        <span className={cn("ml-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border", meta.color)}>{meta.name}</span>
                                    </div>
                                </div>
                                <button onClick={() => toggleRule(rid)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Available Rules Library */}
            <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Available Rules Library ({activeRules.filter(r => !attachedRuleIds.includes(r.id)).length})</span>
                {activeRules.filter(r => !attachedRuleIds.includes(r.id)).length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">All available rules are attached or create a new one above</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeRules.filter(r => !attachedRuleIds.includes(r.id)).map(r => {
                            const meta = RULE_TYPE_META[r.type];
                            return (
                                <button key={r.id} onClick={() => toggleRule(r.id)}
                                    className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group">
                                    <span className="text-lg">{meta.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block truncate">{r.name}</span>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase">{meta.name} • {r.priority.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div className="p-1.5 bg-slate-50 group-hover:bg-emerald-100 group-hover:text-emerald-600 text-slate-400 rounded-lg transition-all">
                                        <Plus className="w-3 h-3" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
