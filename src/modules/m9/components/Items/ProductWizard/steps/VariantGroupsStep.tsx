import React, { useState, useMemo } from 'react';
import {
    DollarSign, Plus, Trash2, GripVertical, Layers,
    ChevronDown, ChevronUp, Check, Eye, X, Sparkles
} from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { StepHeader, StepCard } from '../shared/StepHeader';
import { FormField, TextInput, CurrencyInput } from '../shared/FormField';
import { WizardSearch, WizardFilterChips, WizardPagination, paginateArray } from '../shared/WizardListControls';
import { VARIANT_TEMPLATES, VariantTemplate } from '../../../../mock/templates';
import { ItemVariantGroup, ItemVariant } from '../../../../types/items';
import { cn } from '@/utils';

export const VariantGroupsStep: React.FC = () => {
    const { formData, updateFormData, stepValidations } = useWizardStore();
    const errors = stepValidations['VARIANTS']?.errors || [];
    const warnings = stepValidations['VARIANTS']?.warnings || [];

    const [previewingTemplate, setPreviewingTemplate] = useState<string | null>(null);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
    const [newGroupName, setNewGroupName] = useState('');

    // Search, filter, pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 6;

    const FILTER_OPTIONS = [
        { id: 'all', label: 'All' },
        { id: 'single', label: 'Single Group' },
        { id: 'multi', label: 'Multi Group' },
    ];

    // Track which templates are already applied
    const appliedTemplateIds = new Set<string>();
    VARIANT_TEMPLATES.forEach(tpl => {
        const allGroupsPresent = tpl.groups.every(tg =>
            formData.variantGroups.some(fg => fg.name === tg.name)
        );
        if (allGroupsPresent && tpl.groups.length > 0) {
            appliedTemplateIds.add(tpl.id);
        }
    });

    // Filtered + searched templates
    const filteredTemplates = useMemo(() => {
        let result = VARIANT_TEMPLATES;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
        }
        if (filterType === 'single') result = result.filter(t => t.groups.length === 1);
        if (filterType === 'multi') result = result.filter(t => t.groups.length > 1);
        return result;
    }, [searchQuery, filterType]);

    const totalPages = Math.ceil(filteredTemplates.length / PAGE_SIZE);
    const paginatedTemplates = paginateArray(filteredTemplates, currentPage, PAGE_SIZE);

    // Reset page when filter/search changes
    const handleSearchChange = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
    const handleFilterChange = (v: string) => { setFilterType(v); setCurrentPage(1); };

    // Apply a template — adds its groups (with unique IDs to avoid conflicts)
    const applyTemplate = (template: VariantTemplate) => {
        const stamp = Date.now();
        const newGroups = template.groups.map((g, idx) => ({
            ...g,
            id: `${g.id}-${stamp}-${idx}`,
            variants: g.variants.map((v, vi) => ({
                ...v,
                id: `${v.id}-${stamp}-${vi}`,
            })),
            defaultVariantId: g.variants[0] ? `${g.variants[0].id}-${stamp}-0` : '',
        }));
        // Set default based on first variant's default
        newGroups.forEach(ng => {
            const tplGroup = template.groups.find(tg => ng.id.startsWith(tg.id));
            if (tplGroup) {
                const defIdx = tplGroup.variants.findIndex(v => v.id === tplGroup.defaultVariantId);
                if (defIdx >= 0) ng.defaultVariantId = ng.variants[defIdx]?.id || ng.variants[0]?.id || '';
            }
        });

        updateFormData('variantGroups', [...formData.variantGroups, ...newGroups]);
        setPreviewingTemplate(null);
    };

    // Variant Group CRUD
    const removeVariantGroup = (groupId: string) => {
        updateFormData('variantGroups', formData.variantGroups.filter(g => g.id !== groupId));
    };

    const updateGroup = (groupId: string, updates: Partial<ItemVariantGroup>) => {
        updateFormData('variantGroups', formData.variantGroups.map(g =>
            g.id === groupId ? { ...g, ...updates } : g
        ));
    };

    const addVariantGroup = () => {
        const name = newGroupName.trim() || 'New Group';
        const newGroup: ItemVariantGroup = {
            id: 'vg-' + Date.now(), name, isRequired: true,
            defaultVariantId: '', sortOrder: formData.variantGroups.length + 1, variants: [],
        };
        updateFormData('variantGroups', [...formData.variantGroups, newGroup]);
        setExpandedGroupId(newGroup.id);
        setNewGroupName('');
    };

    // Variant Option CRUD
    const addVariant = (groupId: string, name: string, adj: number) => {
        updateFormData('variantGroups', formData.variantGroups.map(g => {
            if (g.id !== groupId) return g;
            const nv: ItemVariant = {
                id: 'v-' + Date.now(), name,
                basePrice: formData.baseProductPrice + adj,
                priceAdjustment: adj, isAvailable: true,
            };
            return { ...g, variants: [...g.variants, nv], defaultVariantId: g.defaultVariantId || nv.id };
        }));
    };

    const removeVariant = (groupId: string, variantId: string) => {
        updateFormData('variantGroups', formData.variantGroups.map(g => {
            if (g.id !== groupId) return g;
            const variants = g.variants.filter(v => v.id !== variantId);
            return { ...g, variants, defaultVariantId: g.defaultVariantId === variantId ? (variants[0]?.id || '') : g.defaultVariantId };
        }));
    };

    const updateVariant = (groupId: string, variantId: string, updates: Partial<ItemVariant>) => {
        updateFormData('variantGroups', formData.variantGroups.map(g => {
            if (g.id !== groupId) return g;
            return { ...g, variants: g.variants.map(v => v.id === variantId ? { ...v, ...updates } : v) };
        }));
    };

    return (
        <div className="space-y-6">


            {/* Quick Pick — Template Categories */}
            <StepCard>
                <StepHeader
                    icon={<Sparkles className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Quick Pick — Variant Templates"
                    subtitle="Click to preview, then apply pre-built variant categories"
                />

                {/* Search + Filter bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                    <WizardSearch
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search variant templates..."
                    />
                    <WizardFilterChips
                        options={FILTER_OPTIONS}
                        activeId={filterType}
                        onChange={handleFilterChange}
                    />
                </div>

                {paginatedTemplates.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                        <span className="text-xs text-slate-400 font-semibold">No templates match your search</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {paginatedTemplates.map(tpl => {
                            const isApplied = appliedTemplateIds.has(tpl.id);
                            const isPreviewing = previewingTemplate === tpl.id;

                            return (
                                <button
                                    key={tpl.id}
                                    onClick={() => setPreviewingTemplate(isPreviewing ? null : tpl.id)}
                                    className={cn(
                                        "relative p-4 rounded-2xl border-2 text-left transition-all group",
                                        isPreviewing ? "border-slate-950 bg-slate-50 shadow-md scale-[1.02]" :
                                        isApplied ? "border-emerald-300 bg-emerald-50/40" :
                                        "border-slate-150 hover:border-slate-300 hover:bg-slate-50/30"
                                    )}
                                >
                                    {isApplied && (
                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    <span className="text-2xl block mb-2">{tpl.emoji}</span>
                                    <h4 className={cn(
                                        "text-xs font-bold mb-1",
                                        isPreviewing ? "text-slate-950" : isApplied ? "text-emerald-700" : "text-slate-800"
                                    )}>
                                        {tpl.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{tpl.description}</p>
                                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                        <Eye className="w-3 h-3" /> {tpl.groups.length} group{tpl.groups.length !== 1 ? 's' : ''} • {tpl.groups.reduce((s, g) => s + g.variants.length, 0)} options
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <WizardPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredTemplates.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                    className="mt-4"
                />

                {/* Template Preview Panel */}
                {previewingTemplate && (
                    <TemplatePreview
                        template={VARIANT_TEMPLATES.find(t => t.id === previewingTemplate)!}
                        onApply={() => applyTemplate(VARIANT_TEMPLATES.find(t => t.id === previewingTemplate)!)}
                        onClose={() => setPreviewingTemplate(null)}
                    />
                )}
            </StepCard>

            {/* Active Variant Groups (applied templates + custom) */}
            {formData.variantGroups.length > 0 && (
                <StepCard>
                    <StepHeader
                        icon={<Layers className="w-4.5 h-4.5 text-emerald-400" />}
                        title="Active Variant Groups"
                        subtitle="Your configured variants — edit or remove as needed"
                        badge={<span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider">{formData.variantGroups.length} Group{formData.variantGroups.length !== 1 ? 's' : ''}</span>}
                    />

                    <div className="space-y-3">
                        {formData.variantGroups.map(group => {
                            const isExpanded = expandedGroupId === group.id;
                            return (
                                <div key={group.id} className={cn("border rounded-2xl transition-all", isExpanded ? "border-slate-300 shadow-sm" : "border-slate-150")}>
                                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 rounded-t-2xl" onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}>
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="w-4 h-4 text-slate-300" />
                                            <div>
                                                <input value={group.name} onChange={(e) => { e.stopPropagation(); updateGroup(group.id, { name: e.target.value }); }} onClick={(e) => e.stopPropagation()}
                                                    className="text-xs font-black text-slate-900 uppercase tracking-wider bg-transparent border-none outline-none focus:bg-slate-50 px-1 py-0.5 rounded" />
                                                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase tracking-tight pl-1">
                                                    {group.variants.length} option{group.variants.length !== 1 ? 's' : ''} • {group.isRequired ? 'Required' : 'Optional'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); updateGroup(group.id, { isRequired: !group.isRequired }); }}
                                                className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all",
                                                    group.isRequired ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}>
                                                {group.isRequired ? 'Required' : 'Optional'}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); removeVariantGroup(group.id); }} className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                                            {group.variants.map(v => (
                                                <div key={v.id} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl group/var">
                                                    <div className="flex-1">
                                                        <input value={v.name} onChange={(e) => updateVariant(group.id, v.id, { name: e.target.value })}
                                                            className="text-xs font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-white px-2 py-1 rounded w-full" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase">Adj:</span>
                                                        <div className="relative w-24">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">+$</span>
                                                            <input type="number" step="0.01" value={v.priceAdjustment ?? 0}
                                                                onChange={(e) => {
                                                                    const adj = parseFloat(e.target.value) || 0;
                                                                    updateVariant(group.id, v.id, { priceAdjustment: adj, basePrice: formData.baseProductPrice + adj });
                                                                }}
                                                                className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-right focus:border-slate-900 outline-none" />
                                                        </div>
                                                        <span className="text-[9px] text-slate-500 font-mono font-bold w-16 text-right">${(formData.baseProductPrice + (v.priceAdjustment || 0)).toFixed(2)}</span>
                                                        <button onClick={() => updateGroup(group.id, { defaultVariantId: v.id })}
                                                            className={cn("px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider border",
                                                                group.defaultVariantId === v.id ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>
                                                            {group.defaultVariantId === v.id ? 'Default' : 'Set'}
                                                        </button>
                                                        <button onClick={() => removeVariant(group.id, v.id)} className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded transition-all opacity-0 group-hover/var:opacity-100">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <AddVariantInline onAdd={(n, a) => addVariant(group.id, n, a)} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Add custom group */}
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                        <TextInput value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Custom group name..." className="text-xs flex-1" />
                        <button onClick={addVariantGroup}
                            className="flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex-shrink-0">
                            <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Custom
                        </button>
                    </div>
                </StepCard>
            )}
        </div>
    );
};

// ─── Template Preview Panel ──────────────────────────────────

const TemplatePreview: React.FC<{
    template: VariantTemplate;
    onApply: () => void;
    onClose: () => void;
}> = ({ template, onApply, onClose }) => (
    <div className="mt-5 bg-white border-2 border-slate-900 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <span className="text-2xl">{template.emoji}</span>
                <div>
                    <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">{template.name}</h4>
                    <p className="text-[9px] text-slate-400 font-medium">{template.description}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all">
                <X className="w-4 h-4" />
            </button>
        </div>

        <div className="space-y-4">
            {template.groups.map(group => (
                <div key={group.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{group.name}</h5>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{group.isRequired ? 'Required' : 'Optional'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {group.variants.map(v => (
                            <span key={v.id} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-2">
                                {v.name}
                                {(v.priceAdjustment || 0) > 0 && (
                                    <span className="text-emerald-600 font-mono text-[9px]">+${v.priceAdjustment?.toFixed(2)}</span>
                                )}
                                {v.id === group.defaultVariantId && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <button onClick={onApply}
            className="mt-4 w-full py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <Plus className="w-3.5 h-3.5 text-emerald-400" /> Apply This Template
        </button>
    </div>
);

// ─── Inline Add Variant ──────────────────────────────────────

const AddVariantInline: React.FC<{ onAdd: (name: string, adj: number) => void }> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [adj, setAdj] = useState('');

    const handleAdd = () => {
        if (!name.trim()) return;
        onAdd(name.trim(), parseFloat(adj) || 0);
        setName('');
        setAdj('');
    };

    return (
        <div className="flex items-center gap-2 mt-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New option name..." onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 px-3 py-2 bg-white border border-dashed border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-300 outline-none focus:border-slate-400" />
            <div className="relative w-24">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">+$</span>
                <input type="number" step="0.01" value={adj} onChange={(e) => setAdj(e.target.value)} placeholder="0.00" onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="w-full pl-7 pr-2 py-2 bg-white border border-dashed border-slate-200 rounded-lg text-xs font-mono font-bold text-right outline-none focus:border-slate-400" />
            </div>
            <button onClick={handleAdd} disabled={!name.trim()}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all disabled:opacity-30 border border-emerald-100">
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};
