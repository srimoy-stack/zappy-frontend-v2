'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Scale, Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
    Search, Copy, Shield, ToggleLeft, ToggleRight, Zap
} from 'lucide-react';
import { useRulesStore, Rule, RuleType, RULE_TYPE_META, PRIORITY_ORDER, RulePriority } from '../../state/rulesStore';
import { cn } from '@/utils';

export const RulesLibraryPanel: React.FC = () => {
    const { rules, addRule, updateRule, deleteRule, duplicateRule } = useRulesStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filterType, setFilterType] = useState<RuleType | 'ALL'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;

    // Create form state
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<RuleType>('TOPPING_EQUIVALENCY');
    const [newPriority, setNewPriority] = useState<RulePriority>('PRODUCT');

    const filtered = useMemo(() => rules.filter(r => {
        if (filterType !== 'ALL' && r.type !== filterType) return false;
        if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    }), [rules, filterType, searchQuery]);

    const totalPages = Math.ceil(filtered.length / pageSize);

    const paginatedRules = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterType, rules]);

    const handleCreate = () => {
        if (!newName.trim()) return;
        const rule: Rule = {
            id: 'rule-' + Date.now(),
            name: newName.trim(),
            type: newType,
            status: 'DRAFT',
            priority: newPriority,
            appliesTo: [],
            storeOverrideAllowed: true,
            createdAt: new Date().toISOString(),
            // Set defaults based on type
            ...(newType === 'TOPPING_EQUIVALENCY' && { premiumMultiplier: 2 }),
            ...(newType === 'FREE_TOPPING_ALLOWANCE' && { includedToppings: 3, countMethod: 'PER_PIZZA' as const, extraToppingChargeMethod: 'PER_TOPPING' as const, extraToppingCharge: 1.50, maxToppingsAllowed: 10, blockCheckoutIfExceeded: false }),
            ...(newType === 'MAXIMUM_TOPPING' && { maxRegularEquivalentUnits: 10, maxPhysicalToppings: 5, applyPremiumMultiplier: true, managerOverrideAllowed: true }),
            ...(newType === 'HALF_AND_HALF' && { allowFull: true, allowLeftRight: true, allowQuarter: false, halfCountsAs: 0.5, sameToppingMergeLogic: 'COUNT_AS_ONE' as const }),
            ...(newType === 'PREMIUM_HALF_SIDE' && { allowFull: true, allowLeftRight: true, allowQuarter: false }),
            ...(newType === 'NO_LEFT_RIGHT' && { allowFull: true, allowLeftRight: false, allowQuarter: false }),
            ...(newType === 'MUST_BUY_WITH' && { minimumQuantity: 1, applyToChannels: ['POS', 'ONLINE'] }),
        };
        addRule(rule);
        setNewName('');
        setShowCreateForm(false);
        setExpandedId(rule.id);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-slate-950 rounded-2xl shadow-sm">
                        <Scale className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Rules Library</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                            {rules.length} rules • {rules.filter(r => r.status === 'ACTIVE').length} active
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search rules..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold w-44 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 uppercase" />
                    </div>
                    <button onClick={() => setShowCreateForm(!showCreateForm)}
                        className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                            showCreateForm ? "bg-white border border-slate-300 text-slate-600" : "bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200")}>
                        {showCreateForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Rule</>}
                    </button>
                </div>
            </div>

            {/* Type Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setFilterType('ALL')}
                    className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all",
                        filterType === 'ALL' ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400")}>
                    All ({rules.length})
                </button>
                {(Object.keys(RULE_TYPE_META) as RuleType[]).map(type => {
                    const meta = RULE_TYPE_META[type];
                    const count = rules.filter(r => r.type === type).length;
                    return (
                        <button key={type} onClick={() => setFilterType(type)}
                            className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all",
                                filterType === type ? `${meta.color} border-current` : "bg-white text-slate-500 border-slate-200 hover:border-slate-400")}>
                            {meta.emoji} {meta.name} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">New Rule</h4>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Rule Name *</label>
                            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. 3 Free Toppings, Max 5 Toppings..."
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()} autoFocus />
                        </div>
                        <div className="col-span-4">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Rule Type *</label>
                            <select value={newType} onChange={(e) => setNewType(e.target.value as RuleType)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all appearance-none">
                                {(Object.keys(RULE_TYPE_META) as RuleType[]).map(t => (
                                    <option key={t} value={t}>{RULE_TYPE_META[t].emoji} {RULE_TYPE_META[t].name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Priority Level</label>
                            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as RulePriority)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all appearance-none">
                                {PRIORITY_ORDER.map(p => (
                                    <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button onClick={handleCreate} disabled={!newName.trim()}
                        className="mt-4 flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
                        <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Rule
                    </button>
                </div>
            )}

            {/* Rule Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/60">
                    <Scale className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">{searchQuery || filterType !== 'ALL' ? 'No rules match' : 'No rules yet'}</h4>
                </div>
            ) : (
                <div className="space-y-3">
                    {paginatedRules.map(rule => (
                        <RuleCard key={rule.id} rule={rule} isExpanded={expandedId === rule.id}
                            onToggle={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
                            onUpdate={(u) => updateRule(rule.id, u)} onDelete={() => { if (confirm(`Delete "${rule.name}"?`)) { deleteRule(rule.id); setExpandedId(null); } }}
                            onDuplicate={() => duplicateRule(rule.id)} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(filtered.length, currentPage * pageSize)} of {filtered.length} Rules
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-[10px] font-black uppercase text-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 transition-all active:scale-95"
                        >
                            Previous
                        </button>
                        <span className="text-[10px] font-black text-slate-800 uppercase px-2">
                            Page {currentPage} of {Math.max(1, totalPages)}
                        </span>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-[10px] font-black uppercase text-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 transition-all active:scale-95"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Rule Card ───────────────────────────────────────────────

const RuleCard: React.FC<{
    rule: Rule; isExpanded: boolean; onToggle: () => void;
    onUpdate: (u: Partial<Rule>) => void; onDelete: () => void; onDuplicate: () => void;
}> = ({ rule, isExpanded, onToggle, onUpdate, onDelete, onDuplicate }) => {
    const meta = RULE_TYPE_META[rule.type];

    return (
        <div className={cn("bg-white rounded-2xl border shadow-sm transition-all", isExpanded ? "border-slate-300 shadow-md" : "border-slate-200/60 hover:border-slate-300")}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <span className="text-xl">{meta.emoji}</span>
                    <div className="min-w-0">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider truncate">{rule.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase border", meta.color)}>{meta.name}</span>
                            <span className="text-[8px] text-slate-400 font-mono font-bold">{rule.priority.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onUpdate({ status: rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                        className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all",
                            rule.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            rule.status === 'DRAFT' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-500 border-slate-200")}>
                        {rule.status}
                    </button>
                    <button onClick={onDuplicate} className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-all"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={onDelete} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </div>

            {/* Expanded Fields */}
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-4 animate-in slide-in-from-top-1 duration-150">
                    <RuleFieldsEditor rule={rule} onUpdate={onUpdate} />
                </div>
            )}
        </div>
    );
};

// ─── Rule Fields Editor ──────────────────────────────────────

const RuleFieldsEditor: React.FC<{ rule: Rule; onUpdate: (u: Partial<Rule>) => void }> = ({ rule, onUpdate }) => {
    const renderToggle = (label: string, value: boolean | undefined, key: keyof Rule) => (
        <button onClick={() => onUpdate({ [key]: !value })}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all",
                value ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
            {value ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />} {label}
        </button>
    );

    const renderNum = (label: string, value: number | undefined, key: keyof Rule, step = 1) => (
        <div>
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
            <input type="number" step={step} value={value ?? ''} onChange={(e) => onUpdate({ [key]: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
        </div>
    );

    switch (rule.type) {
        case 'TOPPING_EQUIVALENCY':
            return (
                <div className="grid grid-cols-3 gap-4">
                    {renderNum('Premium Multiplier', rule.premiumMultiplier, 'premiumMultiplier')}
                    <div className="col-span-2 flex items-end gap-2">
                        {renderToggle('Store Override Allowed', rule.storeOverrideAllowed, 'storeOverrideAllowed')}
                    </div>
                    <div className="col-span-3 bg-slate-50 p-3 rounded-lg">
                        <span className="text-[9px] text-slate-500 font-medium">💡 1 Premium Topping = {rule.premiumMultiplier || 2} Regular Toppings</span>
                    </div>
                </div>
            );
        case 'FREE_TOPPING_ALLOWANCE':
            return (
                <div className="grid grid-cols-4 gap-4">
                    {renderNum('Included Free', rule.includedToppings, 'includedToppings')}
                    {renderNum('Max Allowed', rule.maxToppingsAllowed, 'maxToppingsAllowed')}
                    {renderNum('Extra Charge ($)', rule.extraToppingCharge, 'extraToppingCharge', 0.01)}
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Count Method</label>
                        <select value={rule.countMethod || 'PER_PIZZA'} onChange={(e) => onUpdate({ countMethod: e.target.value as any })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                            <option value="PER_PIZZA">Per Pizza</option>
                            <option value="SHARED_ACROSS_DEAL">Shared Across Deal</option>
                        </select>
                    </div>
                    <div className="col-span-4 flex gap-2">
                        {renderToggle('Block Checkout If Exceeded', rule.blockCheckoutIfExceeded, 'blockCheckoutIfExceeded')}
                    </div>
                </div>
            );
        case 'MAXIMUM_TOPPING':
            return (
                <div className="grid grid-cols-4 gap-4">
                    {renderNum('Max Physical', rule.maxPhysicalToppings, 'maxPhysicalToppings')}
                    {renderNum('Max Equiv. Units', rule.maxRegularEquivalentUnits, 'maxRegularEquivalentUnits')}
                    <div className="col-span-2 flex items-end gap-2">
                        {renderToggle('Apply Premium Multiplier', rule.applyPremiumMultiplier, 'applyPremiumMultiplier')}
                        {renderToggle('Manager Override', rule.managerOverrideAllowed, 'managerOverrideAllowed')}
                    </div>
                </div>
            );
        case 'HALF_AND_HALF':
        case 'PREMIUM_HALF_SIDE':
        case 'NO_LEFT_RIGHT':
            return (
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-4 flex items-center gap-2">
                        {renderToggle('Allow Full', rule.allowFull, 'allowFull')}
                        {renderToggle('Allow Left/Right', rule.allowLeftRight, 'allowLeftRight')}
                        {renderToggle('Allow Quarter', rule.allowQuarter, 'allowQuarter')}
                    </div>
                    {rule.type === 'HALF_AND_HALF' && (
                        <>
                            {renderNum('Half Counts As', rule.halfCountsAs, 'halfCountsAs', 0.1)}
                            <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Same Topping Merge</label>
                                <select value={rule.sameToppingMergeLogic || 'COUNT_AS_ONE'} onChange={(e) => onUpdate({ sameToppingMergeLogic: e.target.value as any })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                    <option value="COUNT_AS_ONE">Count as One</option>
                                    <option value="COUNT_INDIVIDUALLY">Count Individually</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            );
        case 'MUST_BUY_WITH':
            return (
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Required Category</label>
                        <input value={rule.requiredCategory || ''} onChange={(e) => onUpdate({ requiredCategory: e.target.value })}
                            placeholder="e.g. Pizza" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900 placeholder:text-slate-300" />
                    </div>
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Required Product</label>
                        <input value={rule.requiredProduct || ''} onChange={(e) => onUpdate({ requiredProduct: e.target.value })}
                            placeholder="Any" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900 placeholder:text-slate-300" />
                    </div>
                    {renderNum('Min Quantity', rule.minimumQuantity, 'minimumQuantity')}
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Channels</label>
                        <input value={(rule.applyToChannels || []).join(', ')} onChange={(e) => onUpdate({ applyToChannels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            placeholder="POS, ONLINE" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900 placeholder:text-slate-300" />
                    </div>
                </div>
            );
        default:
            return null;
    }
};
