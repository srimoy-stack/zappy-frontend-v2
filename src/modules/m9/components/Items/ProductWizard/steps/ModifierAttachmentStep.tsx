'use client';

import React, { useState } from 'react';
import { Settings2, Plus, Trash2, Check, Eye, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { StepHeader, StepCard } from '../shared/StepHeader';
import { MODIFIER_TEMPLATES, ModifierTemplate } from '../../../../mock/templates';
import { ModifierGroup } from '../../../../types/items';
import { cn } from '@/utils';

export const ModifierAttachmentStep: React.FC = () => {
    const { formData, updateFormData } = useWizardStore();
    const [previewingTemplate, setPreviewingTemplate] = useState<string | null>(null);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

    // Track applied templates by checking if their group names exist
    const currentGroupNames = new Set(formData.modifierAttachments.map(a => (a as any)._groupName || ''));

    // We store modifier groups directly on formData now since templates provide full groups
    // Using a simpler "modifierGroups" model on the wizard
    const activeGroups: ModifierGroup[] = (formData as any).__modifierGroups || [];

    const setActiveGroups = (groups: ModifierGroup[]) => {
        updateFormData('modifierAttachments' as any, groups.map((g, i) => ({
            modifierPoolId: g.id,
            sortOrder: i + 1,
            isRequired: g.isRequired,
            minSelection: g.minSelection,
            maxSelection: g.maxSelection,
            _groupName: g.name,
            _options: g.options,
            _isToppingGroup: g.isToppingGroup,
            _isHalfAndHalfEnabled: g.isHalfAndHalfEnabled,
        })));
        // Also persist the full group data for display
        (formData as any).__modifierGroups = groups;
    };

    const applyTemplate = (template: ModifierTemplate) => {
        const stamp = Date.now();
        const newGroups = template.groups.map((g, idx) => ({
            ...g,
            id: `${g.id}-${stamp}-${idx}`,
            options: g.options.map((o, oi) => ({ ...o, id: `${o.id}-${stamp}-${oi}` })),
        }));
        setActiveGroups([...activeGroups, ...newGroups]);
        setPreviewingTemplate(null);
    };

    const removeGroup = (groupId: string) => {
        setActiveGroups(activeGroups.filter(g => g.id !== groupId));
    };

    const updateGroup = (groupId: string, updates: Partial<ModifierGroup>) => {
        setActiveGroups(activeGroups.map(g => g.id === groupId ? { ...g, ...updates } : g));
    };

    return (
        <div className="space-y-6">
            {/* Quick Pick — Modifier Templates */}
            <StepCard>
                <StepHeader
                    icon={<Sparkles className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Quick Pick — Modifier Templates"
                    subtitle="Pre-built modifier categories — click to preview contents, then apply"
                />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {MODIFIER_TEMPLATES.map(tpl => {
                        const isPreviewing = previewingTemplate === tpl.id;
                        const totalOptions = tpl.groups.reduce((s, g) => s + g.options.length, 0);

                        return (
                            <button
                                key={tpl.id}
                                onClick={() => setPreviewingTemplate(isPreviewing ? null : tpl.id)}
                                className={cn(
                                    "relative p-4 rounded-2xl border-2 text-left transition-all group",
                                    isPreviewing
                                        ? "border-slate-950 bg-slate-50 shadow-md scale-[1.02]"
                                        : "border-slate-150 hover:border-slate-300 hover:bg-slate-50/30"
                                )}
                            >
                                <span className="text-2xl block mb-2">{tpl.emoji}</span>
                                <h4 className={cn("text-[10px] font-black uppercase tracking-wider mb-1", isPreviewing ? "text-slate-950" : "text-slate-700")}>
                                    {tpl.name}
                                </h4>
                                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">{tpl.description}</p>
                                <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                    <Eye className="w-3 h-3" /> {tpl.groups.length} group{tpl.groups.length !== 1 ? 's' : ''} • {totalOptions} options
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Template Preview Panel */}
                {previewingTemplate && (() => {
                    const tpl = MODIFIER_TEMPLATES.find(t => t.id === previewingTemplate);
                    if (!tpl) return null;
                    return (
                        <div className="mt-5 bg-white border-2 border-slate-900 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-200 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{tpl.emoji}</span>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">{tpl.name}</h4>
                                        <p className="text-[9px] text-slate-400 font-medium">{tpl.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => setPreviewingTemplate(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {tpl.groups.map(group => (
                                <div key={group.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{group.name}</h5>
                                        <div className="flex items-center gap-2">
                                            {group.isRequired && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[8px] font-black">Required</span>}
                                            {group.isToppingGroup && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[8px] font-black">Topping</span>}
                                            {group.isHalfAndHalfEnabled && <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded text-[8px] font-black">Half/Half</span>}
                                            <span className="text-[9px] text-slate-400 font-mono font-bold">{group.minSelection}–{group.maxSelection} sel.</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.options.map(opt => (
                                            <span key={opt.id} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                                                {opt.name}
                                                <span className="text-emerald-600 font-mono text-[9px]">${opt.price.toFixed(2)}</span>
                                                {opt.isPremium && <span className="text-amber-500">★</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button onClick={() => applyTemplate(tpl)}
                                className="mt-2 w-full py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <Plus className="w-3.5 h-3.5 text-emerald-400" /> Apply This Template
                            </button>
                        </div>
                    );
                })()}
            </StepCard>

            {/* Active Modifier Groups */}
            {activeGroups.length > 0 && (
                <StepCard>
                    <StepHeader
                        icon={<Settings2 className="w-4.5 h-4.5 text-emerald-400" />}
                        title="Active Modifier Groups"
                        subtitle="Applied modifiers — edit constraints or remove"
                        badge={<span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider">{activeGroups.length} Group{activeGroups.length !== 1 ? 's' : ''}</span>}
                    />

                    <div className="space-y-3">
                        {activeGroups.map(group => {
                            const isExpanded = expandedGroupId === group.id;
                            return (
                                <div key={group.id} className={cn("border rounded-2xl transition-all", isExpanded ? "border-slate-300 shadow-sm" : "border-slate-150")}>
                                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 rounded-t-2xl" onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{group.name}</h5>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                    {group.options.length} options • {group.isRequired ? 'Required' : 'Optional'} • {group.minSelection}–{group.maxSelection} selections
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {group.isToppingGroup && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[8px] font-black">Topping</span>}
                                            <button onClick={(e) => { e.stopPropagation(); removeGroup(group.id); }} className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-3 border-t border-slate-100 space-y-4">
                                            {/* Constraints */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Required</label>
                                                    <button onClick={() => updateGroup(group.id, { isRequired: !group.isRequired })}
                                                        className={cn("w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all",
                                                            group.isRequired ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
                                                        {group.isRequired ? 'Yes' : 'No'}
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Min Select</label>
                                                    <input type="number" min="0" value={group.minSelection}
                                                        onChange={(e) => updateGroup(group.id, { minSelection: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-center outline-none focus:border-slate-900" />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Max Select</label>
                                                    <input type="number" min="1" value={group.maxSelection}
                                                        onChange={(e) => updateGroup(group.id, { maxSelection: parseInt(e.target.value) || 1 })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-center outline-none focus:border-slate-900" />
                                                </div>
                                            </div>

                                            {/* Options list */}
                                            <div>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-2">Options In This Group</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {group.options.map(opt => (
                                                        <span key={opt.id} className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600 flex items-center gap-1.5">
                                                            {opt.name}
                                                            <span className="text-slate-400 font-mono">${opt.price.toFixed(2)}</span>
                                                            {opt.isPremium && <span className="text-amber-500 text-[8px]">★ Premium</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </StepCard>
            )}
        </div>
    );
};
