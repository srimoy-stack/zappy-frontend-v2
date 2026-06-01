'use client';

import React, { useState } from 'react';
import {
    Layers, Plus, Trash2, ChevronDown, ChevronUp, Package,
    Settings2, Check, Eye, X, Sparkles, GripVertical, ArrowRight
} from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { StepHeader, StepCard } from '../shared/StepHeader';
import { FormField, TextInput, CurrencyInput } from '../shared/FormField';
import { VARIANT_TEMPLATES, MODIFIER_TEMPLATES } from '../../../../mock/templates';
import { ComboSlot } from '../../../../types/items';
import { cn } from '@/utils';

export const ComboBuilderStep: React.FC = () => {
    const { formData, updateFormData } = useWizardStore();

    // Store combo slots in formData
    const comboSlots = formData.comboSlots || [];
    const setComboSlots = (slots: ComboSlot[]) => {
        updateFormData('comboSlots', slots);
    };

    const [activeSlotId, setActiveSlotId] = useState<string | null>(comboSlots[0]?.id || null);
    const [previewVarTpl, setPreviewVarTpl] = useState<string | null>(null);
    const [previewModTpl, setPreviewModTpl] = useState<string | null>(null);

    // ─── Slot CRUD ───────────────────────────────────────────
    const addSlot = () => {
        const newSlot: ComboSlot = {
            id: 'slot-' + Date.now(),
            slotName: `Product ${comboSlots.length + 1}`,
            quantity: 1,
            selectedVariantTemplateId: null,
            selectedModifierTemplateIds: [],
            customPrice: null,
            isConfigured: false,
        };
        const updated = [...comboSlots, newSlot];
        setComboSlots(updated);
        setActiveSlotId(newSlot.id);
    };

    const removeSlot = (slotId: string) => {
        const updated = comboSlots.filter(s => s.id !== slotId);
        setComboSlots(updated);
        if (activeSlotId === slotId) setActiveSlotId(updated[0]?.id || null);
    };

    const updateSlot = (slotId: string, updates: Partial<ComboSlot>) => {
        setComboSlots(comboSlots.map(s => s.id === slotId ? { ...s, ...updates } : s));
    };

    const activeSlot = comboSlots.find(s => s.id === activeSlotId) || null;
    const configuredCount = comboSlots.filter(s => s.isConfigured).length;

    return (
        <div className="space-y-6">
            {/* Combo Overview */}
            <StepCard>
                <StepHeader
                    icon={<Layers className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Combo Builder"
                    subtitle="Add products to your combo — each one gets its own variants & modifiers"
                    badge={
                        <span className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                            configuredCount === comboSlots.length && comboSlots.length > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                        )}>
                            {configuredCount}/{comboSlots.length} Configured
                        </span>
                    }
                />

                <div className="space-y-6">
                    {/* Top: Slot Tabs Navigation */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-150 pb-4">
                        {comboSlots.map((slot, idx) => (
                            <div
                                key={slot.id}
                                className={cn(
                                    "flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-xl border-2 transition-all",
                                    activeSlotId === slot.id
                                        ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                                        : "border-slate-150 bg-white hover:border-slate-300 text-slate-700"
                                )}
                            >
                                <button
                                    onClick={() => setActiveSlotId(slot.id)}
                                    className="flex items-center gap-2.5 text-left outline-none"
                                >
                                    <span className={cn(
                                        "w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black",
                                        slot.isConfigured 
                                            ? (activeSlotId === slot.id ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700") 
                                            : (activeSlotId === slot.id ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-400")
                                    )}>
                                        {slot.isConfigured ? <Check className="w-3 h-3" strokeWidth={3.5} /> : idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-wider block">
                                            {slot.slotName}
                                        </span>
                                        <span className={cn("text-[8px] font-bold uppercase tracking-tight block", 
                                            activeSlotId === slot.id ? "text-slate-400" : "text-slate-400"
                                        )}>
                                            Qty: {slot.quantity}
                                        </span>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
                                    className={cn(
                                        "p-1 rounded-md transition-all ml-1.5",
                                        activeSlotId === slot.id 
                                            ? "text-slate-400 hover:text-rose-400 hover:bg-slate-900" 
                                            : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                                    )}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={addSlot}
                            className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-all hover:bg-slate-50"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Product Slot
                        </button>

                        {comboSlots.length === 0 && (
                            <div className="flex items-center gap-2 py-2 px-4 bg-slate-50 rounded-xl border border-slate-200">
                                <Package className="w-4 h-4 text-slate-300" />
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                    No slots added — Click "Add Product Slot" to start
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bottom: Active Slot Configuration */}
                    <div className="min-w-0">
                        {activeSlot ? (
                            <SlotConfigurator
                                slot={activeSlot}
                                onUpdate={(updates) => updateSlot(activeSlot.id, updates)}
                                previewVarTpl={previewVarTpl}
                                setPreviewVarTpl={setPreviewVarTpl}
                                previewModTpl={previewModTpl}
                                setPreviewModTpl={setPreviewModTpl}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-64 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <div className="text-center">
                                    <ArrowRight className="w-6 h-6 text-slate-300 mx-auto mb-2 -rotate-90" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                        Select a product slot to configure
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </StepCard>

            {/* Combo Price Override */}
            <StepCard>
                <StepHeader
                    icon={<Sparkles className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Combo Pricing"
                    subtitle="Set a fixed combo price or leave empty to sum individual product prices"
                />
                <div className="grid grid-cols-2 gap-5 max-w-lg">
                    <FormField label="Combo Total Price" hint="Leave 0 for auto-sum">
                        <CurrencyInput
                            value={formData.baseProductPrice || ''}
                            onChange={(e) => updateFormData('baseProductPrice', parseFloat(e.target.value) || 0)}
                            placeholder="24.99"
                        />
                    </FormField>
                    <FormField label="Combo Quantity">
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-sm font-black text-slate-800">{comboSlots.length}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">product{comboSlots.length !== 1 ? 's' : ''} in combo</span>
                        </div>
                    </FormField>
                </div>
            </StepCard>
        </div>
    );
};

// ─── Slot Configurator ───────────────────────────────────────

interface SlotConfiguratorProps {
    slot: ComboSlot;
    onUpdate: (updates: Partial<ComboSlot>) => void;
    previewVarTpl: string | null;
    setPreviewVarTpl: (id: string | null) => void;
    previewModTpl: string | null;
    setPreviewModTpl: (id: string | null) => void;
}

const SlotConfigurator: React.FC<SlotConfiguratorProps> = ({
    slot, onUpdate, previewVarTpl, setPreviewVarTpl, previewModTpl, setPreviewModTpl
}) => {
    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Slot Identity */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Product Name" required>
                        <TextInput
                            value={slot.slotName}
                            onChange={(e) => onUpdate({ slotName: e.target.value })}
                            placeholder="e.g. Pizza 1"
                        />
                    </FormField>
                    <FormField label="Quantity">
                        <input
                            type="number" min="1" max="10" value={slot.quantity}
                            onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-slate-900 outline-none"
                        />
                    </FormField>
                </div>
            </div>

            {/* Variant Template Picker for this slot */}
            <div className="space-y-3">
                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3 h-3" /> Choose Variants for "{slot.slotName}"
                </h5>
                <div className="grid grid-cols-3 gap-2">
                    {VARIANT_TEMPLATES.map(tpl => {
                        const isSelected = slot.selectedVariantTemplateId === tpl.id;
                        const isPreviewing = previewVarTpl === tpl.id;
                        return (
                            <div key={tpl.id}>
                                <button
                                    onClick={() => setPreviewVarTpl(isPreviewing ? null : tpl.id)}
                                    className={cn(
                                        "w-full p-3 rounded-xl border-2 text-left transition-all",
                                        isSelected ? "border-emerald-400 bg-emerald-50/50" :
                                        isPreviewing ? "border-slate-950 bg-slate-50" :
                                        "border-slate-150 hover:border-slate-300"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{tpl.emoji}</span>
                                        <span className={cn("text-[9px] font-black uppercase tracking-wider",
                                            isSelected ? "text-emerald-700" : "text-slate-600")}>{tpl.name}</span>
                                    </div>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                                        {tpl.groups.length} grp • {tpl.groups.reduce((s, g) => s + g.variants.length, 0)} opts
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Preview */}
                {previewVarTpl && (() => {
                    const tpl = VARIANT_TEMPLATES.find(t => t.id === previewVarTpl);
                    if (!tpl) return null;
                    return (
                        <div className="bg-white border-2 border-slate-800 rounded-xl p-4 animate-in slide-in-from-top-1 duration-150 shadow-md">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{tpl.emoji} {tpl.name}</span>
                                <button onClick={() => setPreviewVarTpl(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><X className="w-3 h-3" /></button>
                            </div>
                            {tpl.groups.map(g => (
                                <div key={g.id} className="mb-2">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">{g.name}</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {g.variants.map(v => (
                                            <span key={v.id} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-600">
                                                {v.name} {(v.priceAdjustment || 0) > 0 && <span className="text-emerald-500 font-mono">+${v.priceAdjustment?.toFixed(2)}</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => { onUpdate({ selectedVariantTemplateId: tpl.id }); setPreviewVarTpl(null); }}
                                className="mt-3 w-full py-2 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-[0.98]">
                                Apply to {slot.slotName}
                            </button>
                        </div>
                    );
                })()}
            </div>

            {/* Modifier Template Picker for this slot */}
            <div className="space-y-3">
                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings2 className="w-3 h-3" /> Choose Modifiers for "{slot.slotName}"
                </h5>
                <div className="grid grid-cols-3 gap-2">
                    {MODIFIER_TEMPLATES.map(tpl => {
                        const isSelected = slot.selectedModifierTemplateIds.includes(tpl.id);
                        const isPreviewing = previewModTpl === tpl.id;
                        return (
                            <button
                                key={tpl.id}
                                onClick={() => setPreviewModTpl(isPreviewing ? null : tpl.id)}
                                className={cn(
                                    "relative p-3 rounded-xl border-2 text-left transition-all",
                                    isSelected ? "border-emerald-400 bg-emerald-50/50" :
                                    isPreviewing ? "border-slate-950 bg-slate-50" :
                                    "border-slate-150 hover:border-slate-300"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{tpl.emoji}</span>
                                    <span className={cn("text-[9px] font-black uppercase tracking-wider",
                                        isSelected ? "text-emerald-700" : "text-slate-600")}>{tpl.name}</span>
                                </div>
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                                    {tpl.groups.reduce((s, g) => s + g.options.length, 0)} options
                                </span>
                            </button>
                        );
                    })}
                </div>

                {previewModTpl && (() => {
                    const tpl = MODIFIER_TEMPLATES.find(t => t.id === previewModTpl);
                    if (!tpl) return null;
                    return (
                        <div className="bg-white border-2 border-slate-800 rounded-xl p-4 animate-in slide-in-from-top-1 duration-150 shadow-md">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{tpl.emoji} {tpl.name}</span>
                                <button onClick={() => setPreviewModTpl(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><X className="w-3 h-3" /></button>
                            </div>
                            {tpl.groups.map(g => (
                                <div key={g.id} className="mb-2">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">{g.name} ({g.minSelection}–{g.maxSelection} sel.)</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {g.options.map(o => (
                                            <span key={o.id} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-600">
                                                {o.name} <span className="text-emerald-500 font-mono">${o.price.toFixed(2)}</span>
                                                {o.isPremium && <span className="text-amber-500 ml-0.5">★</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => {
                                const newIds = slot.selectedModifierTemplateIds.includes(tpl.id)
                                    ? slot.selectedModifierTemplateIds.filter(id => id !== tpl.id)
                                    : [...slot.selectedModifierTemplateIds, tpl.id];
                                onUpdate({ selectedModifierTemplateIds: newIds });
                                setPreviewModTpl(null);
                            }}
                                className="mt-3 w-full py-2 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-[0.98]">
                                {slot.selectedModifierTemplateIds.includes(tpl.id) ? 'Remove from' : 'Apply to'} {slot.slotName}
                            </button>
                        </div>
                    );
                })()}
            </div>

            {/* Mark as configured */}
            <div className="pt-4 border-t border-slate-100">
                <button
                    onClick={() => onUpdate({ isConfigured: !slot.isConfigured })}
                    className={cn(
                        "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2",
                        slot.isConfigured
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                    )}
                >
                    <Check className={cn("w-3.5 h-3.5", slot.isConfigured ? "text-emerald-500" : "text-slate-400")} />
                    {slot.isConfigured ? 'Configured ✓ — Click to edit' : 'Mark as Configured'}
                </button>
            </div>
        </div>
    );
};
