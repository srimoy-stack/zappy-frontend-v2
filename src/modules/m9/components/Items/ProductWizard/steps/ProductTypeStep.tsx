'use client';

import React from 'react';
import {
    Package, ShoppingBag, Layers, Gift,
    Image as ImageIcon, Tag, Hash, Type, Sparkles
} from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { StepHeader, StepCard } from '../shared/StepHeader';
import { FormField, TextInput, TextArea } from '../shared/FormField';
import { cn } from '@/utils';

const PRODUCT_TYPE_OPTIONS = [
    {
        id: 'SINGLE' as const,
        label: 'Single Product',
        desc: 'Individual menu items like Pizza, Pasta, Drinks, Sides, or Desserts',
        icon: Package,
        examples: 'Veggie Pizza, Caesar Salad, Coke',
        color: 'emerald',
    },
    {
        id: 'CONFIGURABLE_DEAL' as const,
        label: 'Configurable Deal',
        desc: 'Build-your-own deal bundles with slot engine and topping rules',
        icon: Gift,
        examples: '3 Pizza + 1 Dip + 2 Coke',
        color: 'violet',
    },
    {
        id: 'FIXED_COMBO' as const,
        label: 'Fixed Combo',
        desc: 'Pre-defined combos using existing products with limited customization',
        icon: Layers,
        examples: 'Burger + Fries + Coke',
        color: 'amber',
    },
] as const;

const AVAILABLE_TAGS = [
    'Bestseller', 'New', 'Spicy', 'Vegetarian', 'Vegan',
    'Limited Time', 'Staff Pick', 'Value Deal', 'Premium',
    'Gluten Free', 'Dairy Free', 'Organic',
];

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; icon: string; shadow: string }> = {
    emerald: {
        border: 'border-emerald-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        icon: 'text-emerald-500',
        shadow: 'shadow-emerald-100',
    },
    violet: {
        border: 'border-violet-500',
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        icon: 'text-violet-500',
        shadow: 'shadow-violet-100',
    },
    amber: {
        border: 'border-amber-500',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: 'text-amber-500',
        shadow: 'shadow-amber-100',
    },
};

export const ProductTypeStep: React.FC = () => {
    const { formData, updateFormData, stepValidations, editingItemId } = useWizardStore();
    const errors = stepValidations['PRODUCT_TYPE']?.errors || [];
    const isEditing = !!editingItemId;

    return (
        <div className="space-y-6">
            {/* Product Type Selection */}
            <StepCard>
                <StepHeader
                    icon={<Package className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Product Type"
                    subtitle="This defines the product's structural DNA — cannot be changed after creation"
                    badge={isEditing ? (
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider">
                            Locked
                        </span>
                    ) : undefined}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRODUCT_TYPE_OPTIONS.map(opt => {
                        const isSelected = formData.productType === opt.id;
                        const colors = COLOR_MAP[opt.color];
                        const Icon = opt.icon;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => !isEditing && updateFormData('productType', opt.id)}
                                disabled={isEditing}
                                className={cn(
                                    "relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group",
                                    isSelected
                                        ? `${colors.border} ${colors.bg} shadow-lg ${colors.shadow} scale-[1.02]`
                                        : "border-slate-150 hover:border-slate-300 hover:bg-slate-50/50",
                                    isEditing && !isSelected && "opacity-40 cursor-not-allowed"
                                )}
                            >
                                {/* Selection indicator */}
                                {isSelected && (
                                    <div className={cn(
                                        "absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center",
                                        colors.bg
                                    )}>
                                        <Sparkles className={cn("w-3 h-3", colors.icon)} />
                                    </div>
                                )}

                                <div className={cn(
                                    "w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all",
                                    isSelected
                                        ? "bg-slate-950 shadow-md"
                                        : "bg-slate-100 group-hover:bg-slate-200"
                                )}>
                                    <Icon className={cn(
                                        "w-5 h-5",
                                        isSelected ? "text-emerald-400" : "text-slate-400"
                                    )} />
                                </div>

                                <h4 className={cn(
                                    "text-xs font-black uppercase tracking-wider mb-1.5",
                                    isSelected ? colors.text : "text-slate-700"
                                )}>
                                    {opt.label}
                                </h4>

                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3">
                                    {opt.desc}
                                </p>

                                <div className="pt-3 border-t border-slate-100">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                        e.g. {opt.examples}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </StepCard>

            {/* Product Identity */}
            <StepCard>
                <StepHeader
                    icon={<Type className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Product Identity"
                    subtitle="Name, SKU, description, and visual identity"
                />

                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2">
                            <FormField
                                label="Product Display Name"
                                required
                                hint="Max 80 characters"
                                error={errors.find(e => e.includes('name'))}
                            >
                                <TextInput
                                    value={formData.name}
                                    onChange={(e) => updateFormData('name', e.target.value)}
                                    placeholder="e.g. Veggie Supreme Pizza"
                                    maxLength={80}
                                    hasError={!!errors.find(e => e.includes('name'))}
                                />
                            </FormField>
                        </div>

                        <FormField label="SKU Code" hint="Auto-generated">
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <TextInput
                                    value={formData.sku}
                                    onChange={(e) => updateFormData('sku', e.target.value.toUpperCase())}
                                    placeholder="AUTO"
                                    className="pl-9 font-mono text-xs"
                                />
                            </div>
                        </FormField>
                    </div>

                    <FormField label="Product Description" hint="Optional, shown on menus">
                        <TextArea
                            value={formData.description}
                            onChange={(e) => updateFormData('description', e.target.value)}
                            placeholder="Describe this product for customers..."
                            rows={3}
                            maxLength={500}
                        />
                        <div className="text-right">
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-tight",
                                formData.description.length > 450 ? "text-amber-500" : "text-slate-300"
                            )}>
                                {formData.description.length}/500
                            </span>
                        </div>
                    </FormField>

                    {/* Image URL */}
                    <FormField label="Product Image" hint="URL or upload">
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center flex-shrink-0 overflow-hidden transition-all",
                                formData.imageUrl ? "border-slate-200" : "border-slate-200 bg-slate-50"
                            )}>
                                {formData.imageUrl ? (
                                    <img
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-xl"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="text-center p-3">
                                        <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                                            No image
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <TextInput
                                    value={formData.imageUrl}
                                    onChange={(e) => updateFormData('imageUrl', e.target.value)}
                                    placeholder="https://images.example.com/pizza.jpg"
                                    className="text-xs"
                                />
                                <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-tight">
                                    Paste an image URL. Upload coming soon.
                                </p>
                            </div>
                        </div>
                    </FormField>

                    {/* Tags */}
                    <FormField label="Product Tags" hint="Click to toggle">
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_TAGS.map(tag => {
                                const isActive = formData.tags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            const newTags = isActive
                                                ? formData.tags.filter(t => t !== tag)
                                                : [...formData.tags, tag];
                                            updateFormData('tags', newTags);
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                                            isActive
                                                ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
                                        )}
                                    >
                                        {isActive && <Tag className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />}
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </FormField>
                </div>
            </StepCard>
        </div>
    );
};
