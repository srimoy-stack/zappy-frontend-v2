'use client';

import React from 'react';
import {
    ChevronLeft, Edit3, Target, Sparkles, Package, Eye,
    DollarSign, Percent, Lock, Unlock, FileText, Calendar,
    Layers, ToggleLeft, ToggleRight, Building2, Beaker,
    ShieldAlert, BadgeAlert, CheckCircle, RefreshCw, Clock, History
} from 'lucide-react';
import { Item } from '../../types/items';
import { mockCategories } from '../../mock/items';
import { VARIANT_TEMPLATES, MODIFIER_TEMPLATES } from '../../mock/templates';
import { cn } from '@/utils';

interface ProductViewScreenProps {
    item: Item;
    onClose: () => void;
    onEdit: (item: Item) => void;
}

export const ProductViewScreen: React.FC<ProductViewScreenProps> = ({ item, onClose, onEdit }) => {
    // Find category name
    const category = mockCategories.find(c => c.id === item.categoryId);
    const secondaryCategories = (item.secondaryCategoryIds || [])
        .map(id => mockCategories.find(c => c.id === id)?.name)
        .filter(Boolean);

    // Calculate details
    const allVariants = item.variantGroups?.flatMap(vg => vg.variants) || [];
    const minPrice = allVariants.length > 0 ? Math.min(...allVariants.map(v => v.basePrice)) : item.baseProductPrice || 0;
    const maxPrice = allVariants.length > 0 ? Math.max(...allVariants.map(v => v.basePrice)) : item.baseProductPrice || 0;

    const modifierGroupsCount = item.modifierGroups?.length || 0;
    const modifierAttachmentsCount = item.modifierAttachments?.length || 0;
    const overridesCount = item.storeOverrides?.length || item.storeOverridesResolver?.length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                <div className="flex items-start gap-4">
                    <button
                        onClick={onClose}
                        className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                        title="Back to List"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="p-2 bg-slate-950 rounded-xl shadow-sm">
                                <Package className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {item.name}
                            </h2>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ml-2",
                                item.productType === 'SINGLE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                item.productType === 'CONFIGURABLE_DEAL' ? "bg-violet-50 text-violet-700 border-violet-100" :
                                item.productType === 'FIXED_COMBO' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-slate-50 text-slate-700 border-slate-100"
                            )}>
                                {item.productType.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 ml-0 md:ml-12 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-wrap">
                            <span>SKU: <span className="font-mono text-slate-600">{item.sku || 'N/A'}</span></span>
                            <span>•</span>
                            <span>ID: <span className="font-mono text-slate-600">{item.id}</span></span>
                            <span>•</span>
                            <span className={cn(
                                "flex items-center gap-1",
                                item.isAvailable ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {item.isAvailable ? <CheckCircle className="w-3.5 h-3.5" /> : <BadgeAlert className="w-3.5 h-3.5" />}
                                {item.isAvailable ? 'Active Availability' : 'Archived / Offline'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onEdit(item)}
                        className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95"
                    >
                        <Edit3 className="w-4 h-4 text-emerald-400" /> Edit Product Specification
                    </button>
                </div>
            </div>

            {/* Spec Sheet Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns (Details & Components) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section 1: Overview & Specs */}
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <Layers className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Product Essence & Attributes</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Description</span>
                                <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed bg-slate-50/50 rounded-xl p-3.5 border border-slate-100">
                                    {item.description || 'No descriptive overview provided for this product offering.'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Primary Category</span>
                                        <span className="inline-block mt-1 text-xs font-black text-slate-800 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg">
                                            {category?.name || 'Unassigned'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tax Profile Rate</span>
                                        <span className="inline-block mt-1 text-xs font-black text-slate-800 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg">
                                            {item.taxRate !== undefined ? `${item.taxRate.toFixed(2)}%` : 'Standard (5.00%)'}
                                        </span>
                                    </div>
                                </div>

                                {secondaryCategories.length > 0 && (
                                    <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Secondary Categories</span>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {secondaryCategories.map(name => (
                                                <span key={name} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-650 uppercase">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dietary flags & Tags */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Dietary Protocols</span>
                                {item.dietaryFlags && item.dietaryFlags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.dietaryFlags.map(flag => (
                                            <span key={flag} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-wider">
                                                {flag}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-slate-400 font-medium italic block mt-1">None specified</span>
                                )}
                            </div>

                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Search Identifiers & Tags</span>
                                {item.tags && item.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[9px] font-mono font-bold">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-slate-400 font-medium italic block mt-1">No tags assigned</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Variant Groups & Combo Slots */}
                    {(() => {
                        const isCombo = item.productType === 'FIXED_COMBO' || item.productType === 'CONFIGURABLE_DEAL' || item.productType === 'COMBO';
                        if (isCombo) {
                            return (
                                <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-4 h-4 text-violet-500" />
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Combo / Bundle Slot Specifications</h3>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {item.comboSlots?.length || 0} Product Slot(s)
                                        </span>
                                    </div>

                                    {item.comboSlots && item.comboSlots.length > 0 ? (
                                        <div className="space-y-6">
                                            {item.comboSlots.map((slot, idx) => {
                                                const varTpl = VARIANT_TEMPLATES.find(t => t.id === slot.selectedVariantTemplateId);
                                                const modTpls = (slot.selectedModifierTemplateIds || [])
                                                    .map(id => MODIFIER_TEMPLATES.find(t => t.id === id))
                                                    .filter(Boolean);

                                                return (
                                                    <div key={slot.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-4">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                            <div>
                                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                                                    <span className="w-5 h-5 rounded bg-slate-950 text-white flex items-center justify-center text-[9px] font-black">{idx + 1}</span>
                                                                    {slot.slotName}
                                                                </h4>
                                                                <span className="text-[8px] text-slate-400 font-mono block mt-0.5">SLOT ID: {slot.id}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                                                                    Qty: <span className="font-black text-slate-900">{slot.quantity}</span>
                                                                </span>
                                                                <span className={cn(
                                                                    "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                                                    slot.isConfigured 
                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                                                )}>
                                                                    {slot.isConfigured ? 'Configured' : 'Incomplete'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100/50">
                                                            {/* Variant Template Details */}
                                                            <div className="bg-white p-3.5 rounded-xl border border-slate-150/60 shadow-sm space-y-2">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Selected Variants</span>
                                                                {varTpl ? (
                                                                    <div>
                                                                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                                                            <span>{varTpl.emoji}</span>
                                                                            {varTpl.name}
                                                                        </span>
                                                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                                                            {varTpl.groups.flatMap(g => g.variants).map(v => (
                                                                                <span key={v.id} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-bold text-slate-500">
                                                                                    {v.name} {(v.priceAdjustment || 0) > 0 && `+$${v.priceAdjustment}`}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[9px] text-slate-400 font-bold uppercase italic">No variant templates mapped</span>
                                                                )}
                                                            </div>

                                                            {/* Modifier Templates Details */}
                                                            <div className="bg-white p-3.5 rounded-xl border border-slate-150/60 shadow-sm space-y-2">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Selected Modifier Groups</span>
                                                                {modTpls.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {modTpls.map(tpl => (
                                                                            <div key={tpl!.id} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                                                                <span className="text-xs">{tpl!.emoji}</span>
                                                                                <span className="text-[9.5px] font-black text-slate-700 uppercase tracking-wider">{tpl!.name}</span>
                                                                                <span className="text-[8px] text-slate-400 font-bold ml-auto uppercase">{tpl!.groups.reduce((s, g) => s + g.options.length, 0)} options</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[9px] text-slate-400 font-bold uppercase italic">No modifier templates mapped</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block">No product slots builder defined</span>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <>
                                {/* Section 2: Variant Groups & Structural Matrix */}
                                <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-4 h-4 text-indigo-500" />
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Configuration & Variant Architecture</h3>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {item.variantGroups?.length || 0} Variant Group(s)
                                        </span>
                                    </div>

                                    {item.variantGroups && item.variantGroups.length > 0 ? (
                                        <div className="space-y-6">
                                            {item.variantGroups.map((vg) => (
                                                <div key={vg.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                                                {vg.name}
                                                                {vg.isRequired && (
                                                                    <span className="text-[8px] bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.5 rounded uppercase font-black">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </h4>
                                                            <span className="text-[8px] text-slate-400 font-mono block mt-0.5">GROUP ID: {vg.id}</span>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                            Default Option: <span className="font-black text-indigo-600">{vg.variants.find(v => v.id === vg.defaultVariantId)?.name || 'None'}</span>
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {vg.variants.map((v) => {
                                                            const isDefault = v.id === vg.defaultVariantId;
                                                            return (
                                                                <div key={v.id} className={cn(
                                                                    "p-3 rounded-xl border transition-all text-left",
                                                                    isDefault ? "bg-white border-indigo-300 shadow-sm" : "bg-white/80 border-slate-200/60"
                                                                )}>
                                                                    <div className="flex items-start justify-between">
                                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block truncate max-w-[80%]">{v.name}</span>
                                                                        {isDefault && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1"></span>}
                                                                    </div>
                                                                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-50">
                                                                        <span className="text-xs font-mono font-black text-slate-900">${v.basePrice.toFixed(2)}</span>
                                                                        <span className={cn(
                                                                            "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                                                                            v.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                                                        )}>
                                                                            {v.isAvailable ? 'In Stock' : 'Out'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block">No variant groups configured</span>
                                        </div>
                                    )}
                                </div>

                                {/* Section 3: Modifier Configurations */}
                                <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-4 h-4 text-violet-500" />
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Modifier & Customization Pools</h3>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {modifierGroupsCount} Group(s)
                                        </span>
                                    </div>

                                    {item.modifierGroups && item.modifierGroups.length > 0 ? (
                                        <div className="space-y-6">
                                            {item.modifierGroups.map((mg) => (
                                                <div key={mg.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                                                {mg.name}
                                                                {mg.isRequired && (
                                                                    <span className="text-[8px] bg-violet-50 text-violet-700 border border-violet-150 px-1.5 py-0.5 rounded uppercase font-black">
                                                                        Required
                                                                    </span>
                                                                )}
                                                                {mg.isToppingGroup && (
                                                                    <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-150 px-1.5 py-0.5 rounded uppercase font-black">
                                                                        Toppings List
                                                                    </span>
                                                                )}
                                                            </h4>
                                                            <span className="text-[8px] text-slate-400 font-mono block mt-0.5">GROUP ID: {mg.id}</span>
                                                        </div>
                                                        <div className="text-[8px] text-slate-400 font-black uppercase text-right">
                                                            Selection limits: <span className="text-slate-700">{mg.minSelection} to {mg.maxSelection} options</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {mg.options.map((opt) => (
                                                            <div key={opt.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                                                                <div>
                                                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">{opt.name}</span>
                                                                    <span className="text-[8px] text-slate-400 font-mono block mt-0.5">
                                                                        {opt.subOptions && opt.subOptions.length > 0
                                                                            ? `${opt.subOptions.length} configurations`
                                                                            : 'Direct option'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50/50 border border-emerald-100/50 px-2 py-1 rounded-lg">
                                                                    {opt.price === 0 ? 'Free' : `+$${opt.price.toFixed(2)}`}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block">No modifier customization groups defined</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* Right Columns (Deployments, Pricing, Overrides, Recipe COGS) */}
                <div className="space-y-8">
                    {/* Pricing Matrix Center */}
                    <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-lg space-y-6 relative overflow-hidden">
                        {/* Sparkle micro-animation effect */}
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                            <Sparkles className="w-32 h-32 text-emerald-400" />
                        </div>

                        <div>
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">Anchor Master Valuation</span>
                            <h3 className="text-2xl font-mono font-black text-white mt-1 flex items-baseline gap-1">
                                <span className="text-sm font-medium">$</span>
                                {minPrice === maxPrice ? minPrice.toFixed(2) : `${minPrice.toFixed(2)} – ${maxPrice.toFixed(2)}`}
                            </h3>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                                {minPrice === maxPrice ? 'Single Price Point' : 'Variant Range Pricing'}
                            </span>
                        </div>

                        <div className="border-t border-white/10 pt-4.5 space-y-3 text-[10px] font-black uppercase tracking-wider">
                            <div className="flex justify-between items-center text-slate-300">
                                <span>Default Base Price</span>
                                <span className="font-mono text-white">${item.baseProductPrice?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                                <span>Tax Classification</span>
                                <span className="font-mono text-emerald-400">{item.taxRate !== undefined ? `${item.taxRate}%` : '5%'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Scope Config & Store Overrides */}
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Deployment Scope</h3>
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                                item.scopeConfig?.scope === 'STORE_SPECIFIC' ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700"
                            )}>
                                {item.scopeConfig?.scope || 'GLOBAL'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {item.scopeConfig?.scope === 'STORE_SPECIFIC' ? (
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Deploying to specific Stores ({item.scopeConfig.targetedStoreIds?.length || 0})</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(item.scopeConfig.targetedStoreIds || []).map(id => {
                                            const storeName = id === 'store-chicago' ? 'Chicago Outlet' : id === 'store-newyork' ? 'NYC Ave' : 'Miami Beach';
                                            return (
                                                <span key={id} className="px-2.5 py-1 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-wider">
                                                    {storeName}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
                                    This product is deployed globally and propagates to all active franchise locations by default.
                                </p>
                            )}

                            {/* Store Overrides List */}
                            <div className="border-t border-slate-100 pt-4 space-y-3.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Store Custom Overrides</span>
                                    <span className="text-[9px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                        {overridesCount} Active
                                    </span>
                                </div>

                                {item.storeOverrides && item.storeOverrides.length > 0 ? (
                                    <div className="space-y-2">
                                        {item.storeOverrides.map(o => {
                                            const storeName = o.storeId === 'store-chicago' ? 'Chicago Outlet' : o.storeId === 'store-newyork' ? 'Manhattan Ave' : 'Miami Beach';
                                            return (
                                                <div key={o.storeId} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-slate-800 uppercase">{storeName}</span>
                                                    <div className="flex items-center gap-2">
                                                        {o.price !== undefined && (
                                                            <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                                ${o.price.toFixed(2)}
                                                            </span>
                                                        )}
                                                        {o.isAvailable !== undefined && (
                                                            <span className={cn(
                                                                "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                                                o.isAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                                                            )}>
                                                                {o.isAvailable ? 'Avail' : 'Block'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-[9px] text-slate-400 font-bold uppercase italic tracking-tight">
                                        No active location overrides exist. All locations inherit master specifications.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Channel Visibility Panel */}
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Sync & Channel Status</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Channels</span>
                                <div className="flex gap-1">
                                    {(item.channelVisibility || ['POS', 'ONLINE']).map(ch => (
                                        <span key={ch} className="px-2 py-0.5 bg-slate-950 text-white rounded text-[8px] font-black uppercase font-mono">
                                            {ch}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-slate-50 pt-4 space-y-2.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Portal Sync Logs</span>
                                {(item.channelSyncs || [
                                    { channelId: 'POS', status: 'SYNCED', lastSyncedAt: new Date().toISOString() },
                                    { channelId: 'ONLINE', status: 'SYNCED', lastSyncedAt: new Date().toISOString() }
                                ]).map(c => (
                                    <div key={c.channelId} className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                                        <span className="text-[9px] font-mono font-bold text-slate-600">{c.channelId} Gateway</span>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border",
                                            c.status === 'SYNCED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                            c.status === 'DRAFT' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                            "bg-rose-50 text-rose-700 border-rose-200"
                                        )}>
                                            {c.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Audit Logs */}
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <History className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Version & Audit Trails</h3>
                        </div>

                        <div className="space-y-3.5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Version Index</span>
                                <span className="font-mono text-xs font-black text-slate-800">
                                    V{item.versionMetadata?.version || 1}
                                </span>
                            </div>

                            {item.auditLog && item.auditLog.length > 0 ? (
                                <div className="space-y-3 pt-2">
                                    {item.auditLog.map((log, idx) => (
                                        <div key={idx} className="flex gap-3 text-[9px] leading-normal font-bold uppercase text-slate-500 relative pb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1 flex-shrink-0"></div>
                                            <div>
                                                <div className="text-slate-900">{log.action}</div>
                                                <div className="text-[8px] text-slate-400 font-medium font-mono mt-0.5">
                                                    {log.user} • {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-1">
                                    No audit history entries found for this version.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
