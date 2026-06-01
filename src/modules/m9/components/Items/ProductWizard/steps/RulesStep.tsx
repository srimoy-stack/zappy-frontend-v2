import React, { useState, useMemo } from 'react';
import { Scale, Plus, Check, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useRulesStore, Rule, RULE_TYPE_META, RuleType, PRIORITY_ORDER, RulePriority } from '../../../../state/rulesStore';
import { useWizardStore } from '../../../../state/wizardStore';
import { WizardSearch, WizardFilterChips, WizardPagination, paginateArray } from '../shared/WizardListControls';
import { cn } from '@/utils';

export const RulesStep: React.FC = () => {
    const { rules, addRule } = useRulesStore();
    const { formData, updateFormData } = useWizardStore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<RuleType>('TOPPING_EQUIVALENCY');
    const [newPriority, setNewPriority] = useState<RulePriority>('PRODUCT');

    // Expanded rule card state
    const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

    // Search, filter, pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 4;

    const FILTER_OPTIONS = [
        { id: 'all', label: 'All Rules' },
        { id: 'topping', label: 'Topping Rules' },
        { id: 'half_and_half', label: 'Half & Half' },
        { id: 'other', label: 'Other Rules' },
    ];

    const attachedRuleIds: string[] = (formData.ruleAttachments || []).map(r => r.ruleId);
    const activeRules = rules.filter(r => r.status === 'ACTIVE' || r.status === 'DRAFT');

    // Helper to get rule parameters and briefs
    const getRuleBriefText = (r: Rule): string => {
        switch (r.type) {
            case 'TOPPING_EQUIVALENCY':
                return `Premium toppings count as ${r.premiumMultiplier || 2}x regular toppings when calculating limits.`;
            case 'FREE_TOPPING_ALLOWANCE':
                return `Includes ${r.includedToppings || 0} free toppings per ${r.countMethod === 'PER_PIZZA' ? 'pizza' : 'deal'}. Additional toppings charge: $${(r.extraToppingCharge || 0).toFixed(2)} each. Maximum of ${r.maxToppingsAllowed || 'unlimited'} toppings.`;
            case 'MAXIMUM_TOPPING':
                return `Limits regular equivalent toppings to ${r.maxRegularEquivalentUnits || 0} units and total physical items to ${r.maxPhysicalToppings || 0}. Premium multiplier is ${r.applyPremiumMultiplier ? 'applied' : 'ignored'}.`;
            case 'HALF_AND_HALF':
                return `Allows split toppings (Halves). Half toppings count as ${r.halfCountsAs || 0.5} units. Same toppings merge: ${r.sameToppingMergeLogic === 'COUNT_AS_ONE' ? 'Counts as One' : 'Counts Individually'}.`;
            case 'PREMIUM_HALF_SIDE':
                return `Applies premium topping surcharges proportionally to half-sides.`;
            case 'NO_LEFT_RIGHT':
                return `Disables split/half toppings strictly. All toppings must be full size.`;
            case 'MUST_BUY_WITH':
                return `Requires matching items from '${r.requiredCategory || 'Any'}' category. Min qty: ${r.minimumQuantity || 1}. Applicable channels: ${(r.applyToChannels || ['POS', 'ONLINE']).join(', ')}.`;
            default:
                return 'Custom defined rule constraints logic.';
        }
    };

    const getRuleParams = (r: Rule) => {
        const params: { label: string; value: string | number }[] = [];
        params.push({ label: 'Priority', value: r.priority.replace(/_/g, ' ') });
        if (r.premiumMultiplier !== undefined) params.push({ label: 'Multiplier', value: `${r.premiumMultiplier}x` });
        if (r.includedToppings !== undefined) params.push({ label: 'Free Items', value: r.includedToppings });
        if (r.extraToppingCharge !== undefined) params.push({ label: 'Extra Fee', value: `$${r.extraToppingCharge.toFixed(2)}` });
        if (r.maxToppingsAllowed !== undefined) params.push({ label: 'Max Items', value: r.maxToppingsAllowed });
        if (r.maxRegularEquivalentUnits !== undefined) params.push({ label: 'Max Equiv Units', value: r.maxRegularEquivalentUnits });
        if (r.maxPhysicalToppings !== undefined) params.push({ label: 'Max Physical', value: r.maxPhysicalToppings });
        if (r.halfCountsAs !== undefined) params.push({ label: 'Half Weight', value: r.halfCountsAs });
        if (r.minimumQuantity !== undefined) params.push({ label: 'Min Qty', value: r.minimumQuantity });
        return params;
    };

    // Search & Filter logic for available rules
    const availableRules = useMemo(() => {
        return activeRules.filter(r => !attachedRuleIds.includes(r.id));
    }, [activeRules, attachedRuleIds]);

    const filteredRules = useMemo(() => {
        let result = availableRules;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r => r.name.toLowerCase().includes(q) || RULE_TYPE_META[r.type].name.toLowerCase().includes(q));
        }

        if (filterType === 'topping') {
            result = result.filter(r => ['TOPPING_EQUIVALENCY', 'FREE_TOPPING_ALLOWANCE', 'MAXIMUM_TOPPING'].includes(r.type));
        } else if (filterType === 'half_and_half') {
            result = result.filter(r => ['HALF_AND_HALF', 'PREMIUM_HALF_SIDE', 'NO_LEFT_RIGHT'].includes(r.type));
        } else if (filterType === 'other') {
            result = result.filter(r => !['TOPPING_EQUIVALENCY', 'FREE_TOPPING_ALLOWANCE', 'MAXIMUM_TOPPING', 'HALF_AND_HALF', 'PREMIUM_HALF_SIDE', 'NO_LEFT_RIGHT'].includes(r.type));
        }

        return result;
    }, [availableRules, searchQuery, filterType]);

    const totalPages = Math.ceil(filteredRules.length / PAGE_SIZE);
    const paginatedRules = paginateArray(filteredRules, currentPage, PAGE_SIZE);

    const handleSearchChange = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
    const handleFilterChange = (v: string) => { setFilterType(v); setCurrentPage(1); };

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
                    <div className="space-y-2">
                        {attachedRuleIds.map(rid => {
                            const r = rules.find(x => x.id === rid);
                            if (!r) return null;
                            const meta = RULE_TYPE_META[r.type];
                            const isExpanded = expandedRuleId === r.id;

                            return (
                                <div key={rid} className="border border-emerald-250 bg-emerald-50/20 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-sm">
                                    <div
                                        onClick={() => setExpandedRuleId(isExpanded ? null : r.id)}
                                        className="flex items-center justify-between p-4 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{meta.emoji}</span>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900">{r.name}</span>
                                                <span className={cn("ml-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border", meta.color)}>{meta.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleRule(rid); }}
                                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white/40 animate-in slide-in-from-top-1 duration-150 space-y-3">
                                            <p className="text-xs font-medium text-slate-600 mt-2 leading-relaxed">
                                                {getRuleBriefText(r)}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {getRuleParams(r).map((param, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600">
                                                        {param.label}: <span className="font-mono text-slate-800">{param.value}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Available Rules Library */}
            <div className="space-y-4 pt-2">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        Available Rules Library ({availableRules.length})
                    </span>
                </div>

                {/* Search & Filters */}
                {availableRules.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <WizardSearch
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search available rules..."
                        />
                        <WizardFilterChips
                            options={FILTER_OPTIONS}
                            activeId={filterType}
                            onChange={handleFilterChange}
                        />
                    </div>
                )}

                {filteredRules.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {availableRules.length === 0 ? 'All available rules are attached or create a new one above' : 'No rules match your search'}
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {paginatedRules.map(r => {
                            const meta = RULE_TYPE_META[r.type];
                            const isExpanded = expandedRuleId === r.id;

                            return (
                                <div
                                    key={r.id}
                                    className={cn(
                                        "border rounded-2xl overflow-hidden transition-all duration-200 text-left bg-white hover:shadow-sm cursor-pointer",
                                        isExpanded ? "border-slate-400" : "border-slate-200 hover:border-slate-350"
                                    )}
                                    onClick={() => setExpandedRuleId(isExpanded ? null : r.id)}
                                >
                                    <div className="flex items-center gap-3 p-3.5">
                                        <span className="text-lg">{meta.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold text-slate-900 block truncate">{r.name}</span>
                                            <span className="text-[8px] text-slate-400 font-bold uppercase">{meta.name} • {r.priority.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleRule(r.id); }}
                                                className="p-1.5 bg-slate-50 hover:bg-emerald-100 hover:text-emerald-600 text-slate-500 rounded-lg transition-all"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-1 duration-150 space-y-3">
                                            <p className="text-xs font-medium text-slate-600 mt-2 leading-relaxed">
                                                {getRuleBriefText(r)}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {getRuleParams(r).map((param, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600">
                                                        {param.label}: <span className="font-mono text-slate-800">{param.value}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <WizardPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredRules.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                    className="mt-2"
                />
            </div>
        </div>
    );
};
