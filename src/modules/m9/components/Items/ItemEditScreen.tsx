'use client';

import React, { useState } from 'react';
import {
    ChevronLeft, Save, Info, Clock, ShieldCheck,
    Layers, Settings2, DollarSign, Package,
    Plus, Trash2, GripVertical, ChevronDown, Check,
    CircleDot, Radio, Monitor, Globe, Tablet, ChefHat, Calendar
} from 'lucide-react';
import {
    Item, Category, ItemType, ItemVariantGroup, ItemVariant,
    ModifierGroup, ModifierOption, SubOption
} from '../../types/items';
import { cn } from '@/utils';

export type TabId = 'GENERAL' | 'VARIANTS' | 'MODIFIERS' | 'PRICING' | 'INVENTORY' | 'AVAILABILITY' | 'AUDIT';

interface ItemEditScreenProps {
    item: Item | null;
    onClose: () => void;
    categories: Category[];
}


/* --- SUB-COMPONENTS (Defined above main component to ensure initialization) --- */



const HalfIconLeft = (props: any) => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22V2Z" fill="currentColor" fillOpacity="0.4" />
        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22V12V2Z" fill="currentColor" />
    </svg>
);

const HalfIconRight = (props: any) => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180" {...props}>
        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22V2Z" fill="currentColor" fillOpacity="0.4" />
        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22V12V2Z" fill="currentColor" />
    </svg>
);




/* --- TAB SECTIONS --- */

const GeneralTab = ({ formData, setFormData, categories }: any) => (
    <div className="space-y-16 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-600">
        <div className="space-y-10">
            <div className="flex items-center gap-4 border-l-[6px] border-slate-900 pl-6 h-10">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.15em]">Core Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Type (Locked after save)</label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {(['SINGLE', 'COMBO'] as ItemType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => {
                                    // DEMONSTRATION LOGIC: Inject sample structure if switching to COMBO
                                    let newGroups = [...formData.variantGroups];
                                    if (type === 'COMBO' && (!newGroups.length || !newGroups[0].componentName)) {
                                        newGroups = [
                                            {
                                                id: 'demo-1',
                                                name: 'SIZE',
                                                componentName: 'PIZZA 1',
                                                isRequired: true,
                                                defaultVariantId: 'v1',
                                                sortOrder: 1,
                                                variants: [
                                                    { id: 'v1', name: 'Medium (12")', basePrice: 12.99, isAvailable: true },
                                                    { id: 'v2', name: 'Large (14")', basePrice: 15.99, isAvailable: true },
                                                    { id: 'v3', name: 'XL (18")', basePrice: 19.99, isAvailable: true }
                                                ]
                                            },
                                            {
                                                id: 'demo-2',
                                                name: 'CRUST',
                                                componentName: 'PIZZA 1',
                                                isRequired: true,
                                                defaultVariantId: 'v4',
                                                sortOrder: 2,
                                                variants: [
                                                    { id: 'v4', name: 'Thin Crust', basePrice: 0, isAvailable: true },
                                                    { id: 'v5', name: 'Pan Pizza', basePrice: 2.00, isAvailable: true },
                                                    { id: 'v6', name: 'Gluten Free', basePrice: 3.50, isAvailable: true }
                                                ]
                                            }
                                        ];
                                    }
                                    setFormData({ ...formData, productType: type, variantGroups: newGroups });
                                }}
                                className={cn(
                                    "px-6 py-5 rounded-[22px] border-2 text-[11px] font-black uppercase tracking-widest transition-all",
                                    formData.productType === type
                                        ? "bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-200 scale-[1.02]"
                                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                )}
                            >
                                {type} PRODUCT
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Menu Category</label>
                    <div className="relative">
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[22px] text-sm font-black text-slate-900 focus:border-slate-900 focus:bg-white transition-all outline-none appearance-none"
                        >
                            <option value="">Select Catalog Pool</option>
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant Display Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[30px] text-2xl font-black text-slate-900 focus:border-slate-900 focus:bg-white transition-all outline-none shadow-sm"
                        placeholder="e.g. Traditional Sicilian Pepperoni"
                    />
                </div>

                <div className="md:col-span-2 space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Story</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={5}
                        className="w-full px-10 py-8 bg-slate-50 border-2 border-slate-100 rounded-[30px] text-sm font-bold text-slate-600 focus:border-slate-900 focus:bg-white transition-all outline-none resize-none leading-relaxed"
                        placeholder="Public-facing description..."
                    />
                </div>
            </div>
        </div>
    </div>
);

const VariantGroupCard = ({ group, updateGroup, removeGroup, isCombo }: any) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const addVariant = () => {
        const newVariant: ItemVariant = {
            id: 'v-' + Date.now(),
            name: 'New Option',
            basePrice: 0,
            isAvailable: true
        };
        updateGroup({ ...group, variants: [...group.variants, newVariant] });
    };

    return (
        <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-slate-200">
            <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-4 flex-1">
                    <div className="cursor-grab p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-300">
                        <GripVertical size={20} />
                    </div>
                    <div className="flex-1 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <input
                                value={group.name}
                                onChange={(e) => updateGroup({ ...group, name: e.target.value.toUpperCase() })}
                                className="bg-transparent text-base font-black text-slate-900 uppercase tracking-wide outline-none border-b-2 border-transparent focus:border-slate-900 w-full transition-all placeholder:text-slate-300"
                                placeholder={isCombo ? "GROUP NAME (e.g. SIZE)" : "GROUP NAME (e.g. SIZE)"}
                            />
                            <span className="shrink-0 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">Mandatory</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-100 rounded-lg"
                    >
                        <ChevronDown size={20} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                    </button>
                    <button onClick={removeGroup} className="p-2 text-slate-300 hover:text-rose-500 transition-colors hover:bg-rose-50 rounded-lg">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {group.variants.map((v: ItemVariant) => {
                            const isDefault = group.defaultVariantId === v.id;
                            return (
                                <div
                                    key={v.id}
                                    onClick={() => updateGroup({ ...group, defaultVariantId: v.id })}
                                    className={cn(
                                        "relative group/v flex flex-col gap-3 bg-white border-2 rounded-2xl p-4 transition-all cursor-pointer hover:border-slate-300 hover:shadow-sm",
                                        isDefault ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-100"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors",
                                            isDefault ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                                        )}>
                                            {isDefault && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateGroup({
                                                    ...group,
                                                    variants: group.variants.filter((vnt: any) => vnt.id !== v.id),
                                                    defaultVariantId: isDefault ? '' : group.defaultVariantId
                                                });
                                            }}
                                            className="text-slate-200 hover:text-rose-500 p-1 opacity-0 group-hover/v:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <input
                                            value={v.name}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                const newVariants = group.variants.map((vnt: any) => vnt.id === v.id ? { ...vnt, name: e.target.value } : vnt);
                                                updateGroup({ ...group, variants: newVariants });
                                            }}
                                            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                                            placeholder="Label"
                                        />
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400">$</span>
                                            <input
                                                type="number"
                                                value={v.basePrice}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    const newVariants = group.variants.map((vnt: any) => vnt.id === v.id ? { ...vnt, basePrice: parseFloat(e.target.value) || 0 } : vnt);
                                                    updateGroup({ ...group, variants: newVariants });
                                                }}
                                                className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none tabular-nums"
                                            />
                                        </div>
                                    </div>

                                    {isDefault && (
                                        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                                            Default
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <button
                            onClick={addVariant}
                            className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-slate-400 hover:bg-slate-50 transition-all group/add min-h-[140px]"
                        >
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover/add:scale-110 transition-transform">
                                <Plus size={20} className="text-slate-400 group-hover/add:text-slate-600" />
                            </div>
                            <span className="text-xs font-bold uppercase text-slate-400 group-hover/add:text-slate-600">Add Option</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ModifierOptionRow = ({ opt, group, updateOption, removeOption }: any) => {
    return (
        <div className="p-6 bg-slate-50/30 border border-slate-100 rounded-3xl flex flex-col gap-6 transition-all hover:bg-white hover:border-slate-200 hover:shadow-md animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                    <Package size={24} className="text-slate-300" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                    {/* Basic Info */}
                    <div className="lg:col-span-5 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option Name</label>
                        <input
                            value={opt.name}
                            onChange={(e) => updateOption({ ...opt, name: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                            placeholder="e.g. Extra Cheese"
                        />
                    </div>

                    {/* Price */}
                    <div className="lg:col-span-3 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Surcharge</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                                type="number"
                                value={opt.price}
                                onChange={(e) => updateOption({ ...opt, price: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 tabular-nums"
                            />
                        </div>
                    </div>

                    {/* Actions & Toggles */}
                    <div className="lg:col-span-4 flex items-end justify-between gap-4">
                        {group.isPremiumRuleEnabled && (
                            <label className="flex items-center gap-3 cursor-pointer py-3 px-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-300 transition-all select-none">
                                <div className={cn(
                                    "w-5 h-5 rounded flex items-center justify-center transition-all border",
                                    opt.isPremium ? "bg-amber-500 border-amber-500" : "bg-slate-50 border-slate-200"
                                )}>
                                    {opt.isPremium && <Check size={14} className="text-white" strokeWidth={3} />}
                                </div>
                                <span className="text-[10px] font-bold uppercase text-slate-500">Premium</span>
                                <input type="checkbox" checked={opt.isPremium} onChange={(e) => updateOption({ ...opt, isPremium: e.target.checked })} className="hidden" />
                            </label>
                        )}
                        <button onClick={removeOption} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Visual Scope (If Applicable) */}
            {group.isToppingGroup && (
                <div className="pl-[88px]">
                    <div className="flex items-center gap-4 bg-white p-3 border border-slate-100 rounded-2xl w-fit">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Scope</span>
                        <div className="flex sm:gap-2">
                            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><CircleDot size={20} /></button>
                            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><div className="rotate-0"><HalfIconLeft /></div></button>
                            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><div className="rotate-0"><HalfIconRight /></div></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-Options System */}
            <div className="pl-[88px] space-y-4">
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Included Choices / Variations</h5>
                    </div>
                    <button
                        onClick={() => {
                            const newSub: SubOption = { id: 'sub-' + Date.now(), name: 'New Intensity', price: 0 };
                            updateOption({ ...opt, subOptions: [...(opt.subOptions || []), newSub] });
                        }}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1"
                    >
                        <Plus size={14} /> Add Choice
                    </button>
                </div>

                {opt.subOptions?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {opt.subOptions.map((sub: any, sidx: number) => (
                            <div key={sub.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm group/sub transition-all hover:border-emerald-200">
                                <Radio size={16} className="text-emerald-300 shrink-0" strokeWidth={2.5} />
                                <input
                                    value={sub.name}
                                    onChange={(e) => {
                                        const subOpts = [...(opt.subOptions || [])];
                                        subOpts[sidx] = { ...sub, name: e.target.value };
                                        updateOption({ ...opt, subOptions: subOpts });
                                    }}
                                    className="flex-1 min-w-0 text-xs font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                                    placeholder="e.g. Lite, Extra"
                                />
                                <div className="flex items-center gap-1 text-slate-400 font-bold border-l border-slate-100 pl-2">
                                    <span className="text-[10px]">$</span>
                                    <input
                                        type="number"
                                        value={sub.price}
                                        onChange={(e) => {
                                            const subOpts = [...(opt.subOptions || [])];
                                            subOpts[sidx] = { ...sub, price: parseFloat(e.target.value) || 0 };
                                            updateOption({ ...opt, subOptions: subOpts });
                                        }}
                                        className="w-12 bg-transparent outline-none tabular-nums text-xs text-slate-600"
                                    />
                                </div>
                                <button
                                    onClick={() => updateOption({ ...opt, subOptions: opt.subOptions.filter((s: any) => s.id !== sub.id) })}
                                    className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/sub:opacity-100 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ModifierGroupCard = (props: any) => {
    const { group, variantGroups, updateGroup, removeGroup, isCombo } = props;
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-slate-200">
            <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-300">
                            <GripVertical size={20} />
                        </div>
                        <input
                            value={group.name}
                            onChange={(e) => updateGroup({ ...group, name: e.target.value.toUpperCase() })}
                            className="bg-transparent text-lg font-black text-slate-900 uppercase tracking-wide outline-none border-b-2 border-transparent focus:border-slate-900 w-full max-w-lg transition-all placeholder:text-slate-300"
                            placeholder="MODIFIER GROUP NAME (e.g. TOPPINGS)"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-100 rounded-lg">
                            <ChevronDown size={20} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                        </button>
                        <button onClick={removeGroup} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pl-12">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Range</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={group.minSelection}
                                onChange={(e) => updateGroup({ ...group, minSelection: parseInt(e.target.value) || 0 })}
                                className="w-10 text-center text-sm font-black text-slate-900 bg-transparent outline-none tabular-nums focus:bg-slate-50 rounded"
                                placeholder="0"
                            />
                            <span className="text-slate-300">-</span>
                            <input
                                type="number"
                                value={group.maxSelection}
                                onChange={(e) => updateGroup({ ...group, maxSelection: parseInt(e.target.value) || 0 })}
                                className="w-10 text-center text-sm font-black text-slate-900 bg-transparent outline-none tabular-nums focus:bg-slate-50 rounded"
                                placeholder="∞"
                            />
                        </div>
                    </div>

                    {isCombo && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link to:</span>
                            <select
                                value={group.linkedVariantGroupId || ''}
                                onChange={(e) => updateGroup({ ...group, linkedVariantGroupId: e.target.value })}
                                className="bg-transparent text-xs font-bold text-slate-900 outline-none min-w-[120px]"
                            >
                                <option value="">Select Component...</option>
                                {variantGroups.map((vg: any) => <option key={vg.id} value={vg.id}>{vg.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="p-16 space-y-12">
                    <div className="grid grid-cols-1 gap-12">
                        {group.options.map((opt: ModifierOption, optIdx: number) => (
                            <ModifierOptionRow
                                key={opt.id}
                                opt={opt}
                                group={group}
                                updateOption={(updated: any) => {
                                    const newOptions = [...group.options];
                                    newOptions[optIdx] = updated;
                                    updateGroup({ ...group, options: newOptions });
                                }}
                                removeOption={() => updateGroup({ ...group, options: group.options.filter((o: any) => o.id !== opt.id) })}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const newOption: ModifierOption = { id: 'opt-' + Date.now(), name: 'New Choice', price: 1.00, subOptions: [] };
                            updateGroup({ ...group, options: [...group.options, newOption] });
                        }}
                        className="w-full py-16 border-6 border-dashed border-slate-50 rounded-[60px] bg-slate-50/20 flex flex-col items-center justify-center gap-8 group transition-all hover:bg-white hover:border-slate-200"
                    >
                        <Plus size={48} className="text-emerald-500" strokeWidth={4} />
                        <span className="text-[16px] font-black uppercase text-slate-300">Add Choice variant</span>
                    </button>
                </div>
            )}
        </div>
    );
};


const AvailabilityTab = ({ formData, setFormData }: any) => {
    const channels = ['POS', 'Online', 'Kiosk'];
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-600 max-w-4xl">
            <div className="flex items-center gap-4 border-l-[6px] border-slate-900 pl-6 h-10">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.15em]">Channel Availability</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {channels.map(channel => (
                    <div
                        key={channel}
                        onClick={() => {
                            const current = formData.availability || [];
                            const updated = current.includes(channel)
                                ? current.filter((c: string) => c !== channel)
                                : [...current, channel];
                            setFormData({ ...formData, availability: updated });
                        }}
                        className={cn(
                            "group cursor-pointer p-8 rounded-[32px] border-2 transition-all relative overflow-hidden",
                            formData.availability?.includes(channel)
                                ? "bg-slate-900 border-slate-900 shadow-xl"
                                : "bg-white border-slate-100 hover:border-slate-300"
                        )}
                    >
                        <div className={cn(
                            "absolute top-0 right-0 p-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all",
                            formData.availability?.includes(channel) ? "bg-white/10" : "bg-slate-100/50"
                        )} />

                        <div className="relative z-10 flex flex-col items-center text-center gap-4">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                                formData.availability?.includes(channel) ? "bg-white/10 text-white" : "bg-slate-50 text-slate-400"
                            )}>
                                {channel === 'POS' && <Monitor size={32} />}
                                {channel === 'Online' && <Globe size={32} />}
                                {channel === 'Kiosk' && <Tablet size={32} />}
                            </div>
                            <span className={cn(
                                "text-lg font-black uppercase tracking-widest",
                                formData.availability?.includes(channel) ? "text-white" : "text-slate-900"
                            )}>{channel}</span>

                            <div className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                formData.availability?.includes(channel)
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-slate-100 text-slate-400 border-slate-200"
                            )}>
                                {formData.availability?.includes(channel) ? 'Active' : 'Disabled'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecipeTab = ({ formData }: any) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-600 max-w-4xl">
        <div className="flex items-center gap-4 border-l-[6px] border-slate-900 pl-6 h-10">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.15em]">Linked Recipe & BOM</h3>
        </div>
        <div className="p-10 bg-white border-2 border-slate-100 rounded-[32px] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                    <ChefHat size={32} />
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-900">{formData.recipeName || 'Standard Recipe v1'}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">Primary Production Recipe</p>
                </div>
            </div>
            <button className="px-6 py-3 bg-slate-50 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100">
                View Recipe Details
            </button>
        </div>
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-xs text-slate-500 font-medium">To change the recipe, please go to the Recipes module. Direct association editing is disabled here to maintain integrity.</p>
        </div>
    </div>
);

const PricingTab = ({ formData, setFormData }: any) => {
    const rules = formData.pricingRules || [];
    const addRule = () => {
        const newRule = {
            id: Date.now(),
            name: 'NEW PRICING RULE',
            status: 'Active',
            priority: (rules.length || 0) + 1,
            scope: 'TENANT', // Tenant or Store
            targetType: 'PRODUCT', // Product, Variant, Modifier
            changeType: 'PERCENTAGE', // Percentage, Fixed, Override
            changeValue: 0,
            conditions: {
                days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                timeStart: '00:00',
                timeEnd: '23:59',
                channels: ['POS', 'ONLINE', 'KIOSK', 'DELIVERY'],
                dateStart: '',
                dateEnd: ''
            }
        };
        setFormData({ ...formData, pricingRules: [...rules, newRule] });
    };

    const updateRule = (idx: number, field: string, value: any) => {
        const newRules: any[] = [...rules];
        if (field.includes('.')) {
            const parts = field.split('.');
            const parent = parts[0];
            const child = parts[1];
            if (parent && child) {
                newRules[idx][parent] = { ...newRules[idx][parent], [child]: value };
            }
        } else {
            newRules[idx][field] = value;
        }
        setFormData({ ...formData, pricingRules: newRules });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-600 pb-20">
            <div className="flex items-center justify-between border-l-[6px] border-slate-900 pl-6 h-10">
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.15em]">Rule Configurator</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dynamic Pricing Strategy</p>
                </div>
                <button
                    onClick={addRule}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-[16px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                >
                    <Plus size={14} strokeWidth={4} /> Add Rule
                </button>
            </div>
            <div className="space-y-6">
                {rules.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <DollarSign size={32} />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">No Active Rules</h4>
                        <p className="text-xs text-slate-400 mt-2 font-medium max-w-xs mx-auto">Create rules to temporarily adjust prices based on time, channel, or location.</p>
                    </div>
                )}
                {rules.map((rule: any, idx: number) => (
                    <div key={rule.id} className="bg-white border text-sm border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        {/* Header */}
                        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <span className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                    #{rule.priority}
                                </span>
                                <input
                                    value={rule.name}
                                    onChange={(e) => updateRule(idx, 'name', e.target.value.toUpperCase())}
                                    className="bg-transparent font-black text-slate-800 uppercase tracking-wide outline-none w-full max-w-md focus:text-emerald-700"
                                    placeholder="RULE NAME"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={rule.status}
                                    onChange={(e) => updateRule(idx, 'status', e.target.value)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase outline-none transition-colors",
                                        rule.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                    )}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                                <button
                                    onClick={() => setFormData({ ...formData, pricingRules: rules.filter((r: any) => r.id !== rule.id) })}
                                    className="p-2 ml-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 grid grid-cols-12 gap-8">
                            {/* Logic Config */}
                            <div className="col-span-12 xl:col-span-5 space-y-6 border-r border-slate-100 pr-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target & Adjust</label>
                                        <div className="flex flex-col gap-3">
                                            {/* Scope */}
                                            <div className="flex gap-2">
                                                <select
                                                    value={rule.scope}
                                                    onChange={(e) => updateRule(idx, 'scope', e.target.value)}
                                                    className="w-1/3 py-2 px-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none bg-slate-50"
                                                >
                                                    <option value="TENANT">Tenant-Wide</option>
                                                    <option value="STORE">Store-Specific</option>
                                                </select>
                                                <select
                                                    value={rule.changeType}
                                                    onChange={(e) => updateRule(idx, 'changeType', e.target.value)}
                                                    className="flex-1 py-2 px-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none bg-slate-50"
                                                >
                                                    <option value="PERCENTAGE">Percentage (%)</option>
                                                    <option value="FIXED">Amount ($)</option>
                                                    <option value="OVERRIDE">Override Price</option>
                                                </select>
                                            </div>
                                            {/* Value */}
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={rule.changeValue}
                                                    onChange={(e) => updateRule(idx, 'changeValue', parseFloat(e.target.value))}
                                                    className={cn(
                                                        "w-full h-11 pl-4 pr-12 bg-white border-2 border-slate-100 rounded-xl font-black text-slate-900 outline-none focus:border-slate-900 transition-all text-sm",
                                                        rule.changeValue > 0 ? "text-emerald-600" : rule.changeValue < 0 ? "text-rose-600" : ""
                                                    )}
                                                    placeholder="0.00"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                                    {rule.changeType === 'PERCENTAGE' ? '%' : '$'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applies To</label>
                                        <div className="flex gap-2">
                                            {['PRODUCT', 'VARIANT', 'MODIFIER'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => updateRule(idx, 'targetType', t)}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                                        rule.targetType === t ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Conditions */}
                            <div className="col-span-12 xl:col-span-7 space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Effective Period</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <input
                                                type="date"
                                                value={rule.conditions?.dateStart || ''}
                                                onChange={(e) => updateRule(idx, 'conditions.dateStart', e.target.value)}
                                                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none w-full uppercase"
                                            />
                                        </div>
                                        <span className="text-slate-300 font-black text-[10px]">TO</span>
                                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <input
                                                type="date"
                                                value={rule.conditions?.dateEnd || ''}
                                                onChange={(e) => updateRule(idx, 'conditions.dateEnd', e.target.value)}
                                                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none w-full uppercase"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Weekly Schedule</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    const days = rule.conditions?.days || [];
                                                    const newDays = days.includes(day) ? days.filter((d: string) => d !== day) : [...days, day];
                                                    updateRule(idx, 'conditions.days', newDays);
                                                }}
                                                className={cn(
                                                    "w-9 h-9 rounded-lg text-[9px] font-black flex items-center justify-center transition-all border",
                                                    rule.conditions?.days?.includes(day)
                                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100"
                                                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                                )}
                                            >
                                                {day[0]}
                                            </button>
                                        ))}
                                        <div className="w-[1px] bg-slate-100 mx-2 h-9"></div>
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-xl border border-slate-100 h-9">
                                            <Clock size={14} className="text-slate-400" />
                                            <input
                                                type="time"
                                                value={rule.conditions?.timeStart}
                                                onChange={(e) => updateRule(idx, 'conditions.timeStart', e.target.value)}
                                                className="bg-transparent border-none text-[10px] font-bold text-slate-700 focus:ring-0 w-16"
                                            />
                                            <span className="text-slate-300 text-[9px] font-black uppercase">-</span>
                                            <input
                                                type="time"
                                                value={rule.conditions?.timeEnd}
                                                onChange={(e) => updateRule(idx, 'conditions.timeEnd', e.target.value)}
                                                className="bg-transparent border-none text-[10px] font-bold text-slate-700 focus:ring-0 w-16"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Sales Channels</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['POS', 'ONLINE', 'KIOSK', 'DELIVERY'].map(ch => (
                                            <button
                                                key={ch}
                                                onClick={() => {
                                                    const channels = rule.conditions?.channels || [];
                                                    const newCh = channels.includes(ch) ? channels.filter((c: string) => c !== ch) : [...channels, ch];
                                                    updateRule(idx, 'conditions.channels', newCh);
                                                }}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                                    rule.conditions?.channels?.includes(ch)
                                                        ? "bg-slate-800 text-white border-slate-800"
                                                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                                )}
                                            >
                                                {ch}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* --- MAIN COMPONENT --- */

export const ItemEditScreen: React.FC<ItemEditScreenProps> = ({ item, onClose, categories }) => {
    const [activeTab, setActiveTab] = useState<TabId>('GENERAL');
    const [formData, setFormData] = useState<Item>(() => {
        if (item) return JSON.parse(JSON.stringify(item));
        return {
            id: 'new-' + Date.now(),
            productType: 'SINGLE',
            name: '',
            description: '',
            categoryId: '',
            isAvailable: true,
            variantGroups: [],
            modifierGroups: [],

            pricingRules: [],
            availability: ['POS', 'Online', 'Kiosk'],
            auditLog: []
        };
    });

    const isExisting = item !== null;

    const tabs: { id: TabId, label: string, icon: any }[] = [
        { id: 'GENERAL', label: 'General', icon: Info },
        { id: 'VARIANTS', label: 'Variants', icon: Layers },
        { id: 'MODIFIERS', label: 'Modifiers', icon: Settings2 },
        { id: 'PRICING', label: 'Dynamic Pricing', icon: DollarSign },
        { id: 'INVENTORY', label: 'Recipe', icon: ChefHat },
        { id: 'AVAILABILITY', label: 'Availability', icon: Clock },
        { id: 'AUDIT', label: 'Audit Log', icon: ShieldCheck },
    ];

    const handleSave = () => {
        if (!formData.name) return alert('Name is required');
        if (formData.productType === 'COMBO' && formData.variantGroups.length === 0) return alert('Combo must have components');
        if (formData.variantGroups.some(vg => vg.variants.length > 0 && !vg.defaultVariantId)) return alert('Missing default selection in variant group');
        if (formData.productType === 'COMBO' && formData.modifierGroups.some(mg => !mg.linkedVariantGroupId)) return alert('Combo modifiers must be bound to a component');

        console.log('Saving Configuration:', formData);
        onClose();
    };

    return (
        <div className="bg-slate-50/50 -mx-4 -mt-6 px-4 pt-6 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 -mx-4 px-8 py-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-slate-900 transition-all bg-slate-50 rounded-2xl border border-slate-100"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                {isExisting ? `Edit: ${formData.name}` : 'Setup Offering'}
                            </h2>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                formData.productType === 'SINGLE' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-purple-50 text-purple-700 border-purple-100"
                            )}>
                                {formData.productType} PRODUCT
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-10 py-3.5 bg-slate-900 text-white rounded-[22px] text-xs font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-slate-200 transition-all"
                    >
                        <Save size={16} className="text-emerald-400" />
                        Save Product
                    </button>
                </div>
            </div>

            {/* Layout */}
            <div className="max-w-[1550px] mx-auto py-10 flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-72 shrink-0 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id
                                    ? "bg-slate-900 text-white shadow-2xl scale-[1.03]"
                                    : "text-slate-500 hover:bg-white/80 hover:text-slate-900"
                            )}
                        >
                            <tab.icon size={18} strokeWidth={activeTab === tab.id ? 3 : 2.5} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="flex-1 bg-white rounded-[44px] border border-slate-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden min-h-[850px]">
                    <div className="p-16 h-full overflow-y-auto max-h-[calc(100vh-200px)]">
                        {activeTab === 'GENERAL' && <GeneralTab formData={formData} setFormData={setFormData} categories={categories} isExisting={isExisting} />}
                        {activeTab === 'VARIANTS' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="flex items-center justify-between border-l-[6px] border-slate-900 pl-6 h-12">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.15em]">
                                        {formData.productType === 'COMBO' ? 'Components & Choices' : 'Variant Structure'}
                                    </h3>
                                    {formData.productType === 'SINGLE' && (
                                        <button
                                            onClick={() => {
                                                const newGroup: ItemVariantGroup = { id: 'vg-' + Date.now(), name: 'NEW GROUP', isRequired: true, defaultVariantId: '', variants: [], sortOrder: formData.variantGroups.length + 1 };
                                                setFormData({ ...formData, variantGroups: [...formData.variantGroups, newGroup] });
                                            }}
                                            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600"
                                        >
                                            <Plus size={18} strokeWidth={4} /> Add Group
                                        </button>
                                    )}
                                    {formData.productType === 'COMBO' && (
                                        <button
                                            onClick={() => {
                                                const compName = prompt("Enter Component Name (e.g. Pizza 1)");
                                                if (compName) {
                                                    const newGroup: ItemVariantGroup = {
                                                        id: 'vg-' + Date.now(),
                                                        name: 'SIZE', // Default group
                                                        componentName: compName,
                                                        isRequired: true,
                                                        defaultVariantId: '',
                                                        variants: [],
                                                        sortOrder: formData.variantGroups.length + 1
                                                    };
                                                    setFormData({ ...formData, variantGroups: [...formData.variantGroups, newGroup] });
                                                }
                                            }}
                                            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600"
                                        >
                                            <Plus size={18} strokeWidth={4} /> Add Component
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-10">
                                    {/* SINGLE PRODUCT VIEW */}
                                    {formData.productType === 'SINGLE' && formData.variantGroups.map((group, idx) => (
                                        <VariantGroupCard
                                            key={group.id}
                                            group={group}
                                            isCombo={false}
                                            updateGroup={(updated: any) => {
                                                const newGroups = [...formData.variantGroups];
                                                newGroups[idx] = updated;
                                                setFormData({ ...formData, variantGroups: newGroups });
                                            }}
                                            removeGroup={() => setFormData({ ...formData, variantGroups: formData.variantGroups.filter((_, i) => i !== idx) })}
                                        />
                                    ))}

                                    {/* COMBO PRODUCT VIEW (Grouped by Component) */}
                                    {formData.productType === 'COMBO' && Object.entries(
                                        formData.variantGroups.reduce((acc: any, group) => {
                                            const key = group.componentName || 'Unassigned';
                                            if (!acc[key]) acc[key] = [];
                                            acc[key].push(group);
                                            return acc;
                                        }, {})
                                    ).map(([compName, groups]: [string, any]) => (
                                        <div key={compName} className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                        <Package size={18} />
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-wide">{compName}</h4>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newGroup: ItemVariantGroup = {
                                                            id: 'vg-' + Date.now(),
                                                            name: 'NEW OPTION GROUP',
                                                            componentName: compName,
                                                            isRequired: true,
                                                            defaultVariantId: '',
                                                            variants: [],
                                                            sortOrder: 100
                                                        };
                                                        setFormData({ ...formData, variantGroups: [...formData.variantGroups, newGroup] });
                                                    }}
                                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg"
                                                >
                                                    <Plus size={12} /> Add Property (e.g. Crust)
                                                </button>
                                            </div>

                                            <div className="pl-6 border-l-2 border-slate-100 space-y-6">
                                                {groups.map((group: any) => (
                                                    <VariantGroupCard
                                                        key={group.id}
                                                        group={group}
                                                        isCombo={true}
                                                        updateGroup={(updated: any) => {
                                                            const idx = formData.variantGroups.findIndex((g: any) => g.id === group.id);
                                                            const newGroups = [...formData.variantGroups];
                                                            newGroups[idx] = updated;
                                                            setFormData({ ...formData, variantGroups: newGroups });
                                                        }}
                                                        removeGroup={() => setFormData({ ...formData, variantGroups: formData.variantGroups.filter((g: any) => g.id !== group.id) })}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        )}
                        {activeTab === 'MODIFIERS' && (
                            <ModifiersTab formData={formData} setFormData={setFormData} />
                        )}
                        {activeTab === 'PRICING' && <PricingTab formData={formData} setFormData={setFormData} />}
                        {activeTab === 'INVENTORY' && <RecipeTab formData={formData} setFormData={setFormData} />}
                        {activeTab === 'AVAILABILITY' && <AvailabilityTab formData={formData} setFormData={setFormData} />}
                        {activeTab === 'AUDIT' && <PlaceholderTab icon={ShieldCheck} label="Audit Log" description="Track all changes made to this item." />}
                    </div>
                </div>
            </div>
        </div>
    );
};



const ModifiersTab = (props: any) => {
    const { formData, setFormData } = props;
    const isCombo = formData.productType === 'COMBO';

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between border-l-[6px] border-slate-900 pl-6 h-12">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.15em]">Modifier Pools</h3>
                <button
                    onClick={() => {
                        const newGroup: ModifierGroup = { id: 'mg-' + Date.now(), name: 'NEW POOL', isRequired: false, minSelection: 0, maxSelection: 10, isToppingGroup: true, isHalfAndHalfEnabled: true, isPremiumRuleEnabled: true, options: [] };
                        setFormData({ ...formData, modifierGroups: [...formData.modifierGroups, newGroup] });
                    }}
                    className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest"
                >
                    <Plus size={18} strokeWidth={4} /> New Pool
                </button>
            </div>

            <div className="space-y-12">
                {formData.modifierGroups.map((group: any, idx: number) => (
                    <ModifierGroupCard
                        key={group.id}
                        group={group}
                        variantGroups={formData.variantGroups}
                        updateGroup={(updated: any) => {
                            const newGroups = [...formData.modifierGroups];
                            newGroups[idx] = updated;
                            setFormData({ ...formData, modifierGroups: newGroups });
                        }}
                        removeGroup={() => setFormData({ ...formData, modifierGroups: formData.modifierGroups.filter((_: any, i: number) => i !== idx) })}
                        isCombo={isCombo}
                    />
                ))}
            </div>
        </div>
    );
};
const PlaceholderTab = ({ icon: Icon, label, description }: any) => (
    <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 animate-in fade-in duration-700">
        <div className="p-10 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center shadow-inner">
            <Icon size={64} className="text-slate-200" strokeWidth={1} />
        </div>
        <div className="max-w-sm">
            <h4 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em]">{label}</h4>
            <p className="text-xs font-bold text-slate-400 mt-3 uppercase leading-relaxed tracking-widest">{description}</p>
        </div>
    </div>
);
