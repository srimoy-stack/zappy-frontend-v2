'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Package, DollarSign, ShieldCheck, Server, ChevronDown, Check, Building2 } from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { useModifierPoolStore } from '../../../../state/modifierPoolStore';
import { StepHeader, StepCard } from '../shared/StepHeader';
import { WIZARD_STEPS } from '../../../../types/wizard';
import { mockCategories } from '../../../../mock/items';
import { cn } from '@/utils';

export const ReviewPublishStep: React.FC = () => {
    const { formData, stepValidations, validateAllSteps, setCurrentStep } = useWizardStore();
    const { pools } = useModifierPoolStore();

    const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

    React.useEffect(() => { validateAllSteps(); }, []);

    const allValid = WIZARD_STEPS.filter(s => s.isRequired).every(s => stepValidations[s.id]?.errors?.length === 0);
    const totalErrors = Object.values(stepValidations).reduce((sum, v) => sum + (v?.errors?.length || 0), 0);
    const category = mockCategories.find(c => c.id === formData.categoryId);
    const totalVariants = formData.variantGroups.reduce((sum, g) => sum + g.variants.length, 0);

    const toggleStep = (stepId: string) => {
        setExpandedStepId(prev => prev === stepId ? null : stepId);
    };

    const renderStepSummary = (stepId: string) => {
        switch (stepId) {
            case 'PRODUCT_TYPE': // Product Type & Identity
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Product Name</span>
                                <span className="text-slate-800 font-black">{formData.name || '—'}</span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Product Type</span>
                                <span className="text-slate-800 font-black">{formData.productType}</span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">SKU / Code</span>
                                <span className="text-slate-800 font-mono font-black">{formData.sku || 'Auto-generated'}</span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Description</span>
                                <span className="text-slate-800 block truncate normal-case font-medium">{formData.description || 'No description provided'}</span>
                            </div>
                        </div>
                    </div>
                );
            case 'CATEGORY_META': // Category & Metadata
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Category</span>
                                <span className="text-slate-800 font-black">{category?.name || '—'}</span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Tax Rate</span>
                                <span className="text-slate-800 font-mono font-black">{formData.taxRate}%</span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Calories</span>
                                <span className="text-slate-800 font-mono font-black">{formData.calories || 0} kcal</span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Dietary Tags</span>
                                <span className="text-slate-800 block truncate">{formData.dietaryFlags?.join(', ') || 'None'}</span>
                            </div>
                        </div>
                    </div>
                );
            case 'VARIANTS': // Variant Groups
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        {formData.variantGroups.length === 0 ? (
                            <span className="text-[9px] text-slate-400 font-medium normal-case">No variant groups configured. Inherits single default variant.</span>
                        ) : (
                            <div className="space-y-1.5">
                                {formData.variantGroups.map((g, idx) => (
                                    <div key={idx} className="flex flex-col bg-white border border-slate-100 rounded-lg p-2 gap-0.5">
                                        <span className="text-slate-800 font-black block">{g.name}</span>
                                        <span className="text-[8.5px] text-slate-400 font-mono block">
                                            Options: {g.variants.map(v => `${v.name} (+$${v.priceCost || 0})`).join(', ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'MODIFIERS': // Modifier Pools
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        {formData.modifierAttachments.length === 0 ? (
                            <span className="text-[9px] text-slate-400 font-medium normal-case">No modifier pools attached.</span>
                        ) : (
                            <div className="space-y-1.5">
                                {formData.modifierAttachments.map(att => {
                                    const pool = pools.find(p => p.id === att.modifierPoolId);
                                    return (
                                        <div key={att.modifierPoolId} className="flex flex-col bg-white border border-slate-100 rounded-lg p-2 gap-0.5">
                                            <span className="text-slate-800 font-black block">{pool?.name || 'Unknown Pool'}</span>
                                            <span className="text-[8.5px] text-slate-400 font-bold block">
                                                Selection Limits: Min {att.minSelection} • Max {att.maxSelection}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            case 'ADDONS': // Add-On Groups
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        {(!formData.addonGroups || formData.addonGroups.length === 0) ? (
                            <span className="text-[9px] text-slate-400 font-medium normal-case">No addon groups attached.</span>
                        ) : (
                            <div className="space-y-1.5">
                                {(formData.addonGroups || []).map((grp, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-2">
                                        <span className="text-slate-800 font-black">{grp.name}</span>
                                        <span className="text-[8.5px] text-slate-400 font-mono">Options: {grp.addons?.length || 0}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'RULES': // Rules & Constraints
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        {(!formData.kitchenRules || formData.kitchenRules.length === 0) ? (
                            <span className="text-[9px] text-slate-400 font-medium normal-case">No operational or kitchen dispatch rules configured.</span>
                        ) : (
                            <div className="space-y-1.5">
                                {formData.kitchenRules.map(rule => (
                                    <div key={rule.id} className="p-2.5 bg-white border border-slate-100 rounded-lg">
                                        <span className="font-black text-slate-800 block">{rule.name}</span>
                                        <p className="text-[8.5px] text-slate-400 font-medium normal-case mt-1">{rule.description || 'No summary brief provided'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'PRICING': // Pricing & Availability
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Base Product Price</span>
                                <span className="text-emerald-800 font-mono font-black">$ {formData.baseProductPrice.toFixed(2)}</span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Channel Visibility</span>
                                <span className="text-slate-800 font-black">{formData.channelVisibility?.join(', ') || 'None'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[8px] text-slate-400 block mb-0.5">Active Days Schedule</span>
                                <span className="text-slate-800 font-black">
                                    {formData.availabilitySchedule?.days?.join(', ') || 'All Days'} ({formData.availabilitySchedule?.timeStart || '00:00'} - {formData.availabilitySchedule?.timeEnd || '23:59'})
                                </span>
                            </div>
                        </div>
                    </div>
                );
            case 'INVENTORY': // Inventory & Recipe
                const totalCost = formData.recipe?.reduce((s, r) => s + r.quantity * (r.costPerUnit || 0), 0) || 0;
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        {(!formData.recipe || formData.recipe.length === 0) ? (
                            <span className="text-[9px] text-slate-400 font-medium normal-case">No recipe mapping. Raw stock will not deduct on fulfillments.</span>
                        ) : (
                            <div className="space-y-1.5">
                                {formData.recipe.map(r => (
                                    <div key={r.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-2">
                                        <span className="text-slate-800 font-black">{r.ingredientName} ({r.quantity} {r.unit})</span>
                                        <span className="text-emerald-700 font-mono font-bold">${(r.quantity * (r.costPerUnit || 0)).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-black">
                                    <span>Total Est. COGS</span>
                                    <span className="text-emerald-800 font-mono">${totalCost.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'OVERRIDES': // Store Overrides
                return (
                    <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-150">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Deployment Scope</span>
                                <span className="text-slate-800 font-black">
                                    {formData.scopeConfig?.scope === 'STORE_SPECIFIC' ? 'Store-Specific' : 'Global Availability'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 block mb-0.5">Target Branches</span>
                                <span className="text-slate-800 font-black">
                                    {formData.scopeConfig?.scope === 'STORE_SPECIFIC' 
                                        ? `${formData.scopeConfig.targetedStoreIds?.length || 0} selected` 
                                        : 'All Locations Active'}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[8px] text-slate-400 block mb-0.5">Active Custom Overrides</span>
                                <span className="text-slate-800 font-black">
                                    {formData.storeOverrides?.length > 0 
                                        ? `${formData.storeOverrides.length} branches customized` 
                                        : 'None (All inheriting brand settings)'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Validation Summary */}
            <StepCard>
                <StepHeader
                    icon={<ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Pre-Flight Validation"
                    subtitle="All checks must pass before publishing"
                    badge={allValid ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> All Clear
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-[9px] font-black uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> {totalErrors} Issue{totalErrors !== 1 ? 's' : ''}
                        </span>
                    )}
                />

                <div className="space-y-2">
                    {WIZARD_STEPS.map(step => {
                        const val = stepValidations[step.id];
                        const hasErrors = (val?.errors?.length || 0) > 0;
                        const hasWarnings = (val?.warnings?.length || 0) > 0;
                        const isPassed = !hasErrors;
                        const isExpanded = expandedStepId === step.id;

                        return (
                            <div key={step.id} 
                                onClick={() => toggleStep(step.id)}
                                className={cn("p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-center", 
                                    hasErrors ? "border-rose-100 bg-rose-50/30 hover:bg-rose-50/50" : "border-slate-100 bg-slate-50/30 hover:bg-slate-50/60")}>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                            hasErrors ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600")}>
                                            {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                        </span>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{step.label}</span>
                                            {hasErrors && <span className="text-[9px] text-rose-500 font-bold block mt-0.5">{val!.errors.join(', ')}</span>}
                                            {!hasErrors && hasWarnings && <span className="text-[9px] text-amber-500 font-bold block mt-0.5">{val!.warnings.join(', ')}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasErrors && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setCurrentStep(step.id); }} 
                                                className="text-[9px] font-black text-rose-600 uppercase tracking-wider hover:underline px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                                                Fix →
                                            </button>
                                        )}
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-all duration-200", isExpanded && "rotate-180")} />
                                    </div>
                                </div>

                                {isExpanded && renderStepSummary(step.id)}
                            </div>
                        );
                    })}
                </div>
            </StepCard>

            {/* Product Summary */}
            <StepCard>
                <StepHeader icon={<Package className="w-4.5 h-4.5 text-emerald-400" />} title="Product Summary" subtitle="Review your product configuration before publishing" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <SummaryRow label="Product Name" value={formData.name || '—'} />
                        <SummaryRow label="Product Type" value={formData.productType} />
                        <SummaryRow label="SKU" value={formData.sku || 'Auto'} mono />
                        <SummaryRow label="Category" value={category?.name || '—'} />
                        <SummaryRow label="Tax Rate" value={`${formData.taxRate}%`} mono />
                    </div>
                    <div className="space-y-4">
                        <SummaryRow label="Base Price" value={`$${formData.baseProductPrice.toFixed(2)}`} mono />
                        <SummaryRow label="Variant Groups" value={`${formData.variantGroups.length} groups, ${totalVariants} options`} />
                        <SummaryRow label="Modifier Pools" value={`${formData.modifierAttachments.length} attached`} />
                        <SummaryRow label="Channels" value={formData.channelVisibility.join(', ') || 'None'} />
                        <SummaryRow label="Tags" value={formData.tags.join(', ') || 'None'} />
                    </div>
                </div>
                {formData.dietaryFlags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">Dietary Flags</span>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.dietaryFlags.map(f => (
                                <span key={f} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-bold uppercase">{f}</span>
                            ))}
                        </div>
                    </div>
                )}
            </StepCard>

            {/* Recipe / BOM Summary */}
            {formData.recipe && formData.recipe.length > 0 && (
                <StepCard>
                    <StepHeader icon={<Package className="w-4.5 h-4.5 text-emerald-400" />} title="Inventory & Recipe (BOM)" subtitle={`${formData.recipe.length} ingredients mapped`} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {formData.recipe.map(r => (
                            <div key={r.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px]">
                                <span className="font-black text-slate-800 uppercase tracking-wider block">{r.ingredientName}</span>
                                <span className="text-[8px] text-slate-400 font-mono">{r.quantity} {r.unit} • ${(r.quantity * (r.costPerUnit || 0)).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Est. COGS</span>
                        <span className="text-sm font-mono font-black text-emerald-800">
                            ${formData.recipe.reduce((s, r) => s + r.quantity * (r.costPerUnit || 0), 0).toFixed(2)}
                        </span>
                    </div>
                </StepCard>
            )}

            {/* Channel Deploy Status */}
            <StepCard>
                <StepHeader icon={<Server className="w-4.5 h-4.5 text-emerald-400" />} title="Deployment Scope & Overrides" subtitle="Franchise distribution and local configurations" />
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <div>
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">Scope Profile</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block mt-0.5">
                                {formData.scopeConfig?.scope === 'STORE_SPECIFIC'
                                    ? `Store-Specific • Deployed in ${formData.scopeConfig.targetedStoreIds?.length || 0} branches`
                                    : 'Global • Deployed to all stores'}
                            </span>
                        </div>
                        <span className={cn("px-2.5 py-1 rounded text-[8px] font-black uppercase border font-mono",
                            formData.scopeConfig?.scope === 'STORE_SPECIFIC' ? "bg-violet-50 text-violet-700 border-violet-100" : "bg-emerald-50 text-emerald-700 border-emerald-100")}>
                            {formData.scopeConfig?.scope || 'GLOBAL'}
                        </span>
                    </div>

                    {formData.storeOverrides && formData.storeOverrides.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Active Local Customizations ({formData.storeOverrides.length})</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {formData.storeOverrides.map(ov => (
                                    <div key={ov.storeId} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-[10px]">
                                        <span className="font-black text-slate-900 uppercase block tracking-wider">{ov.storeName}</span>
                                        <div className="flex flex-wrap gap-1">
                                            {ov.priceOverride !== undefined && (
                                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded font-mono text-[8px]">Price: ${ov.priceOverride.toFixed(2)}</span>
                                            )}
                                            {ov.availabilityOverride !== undefined && (
                                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded font-mono text-[8px]">
                                                    {ov.availabilityOverride ? 'AVAILABLE' : 'UNAVAILABLE'}
                                                </span>
                                            )}
                                            {ov.taxRateOverride !== undefined && (
                                                <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 border-violet-100 rounded font-mono text-[8px]">Tax: {ov.taxRateOverride}%</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </StepCard>

            {/* Dynamic Pricing Rules */}
            {formData.dynamicPricingRules && formData.dynamicPricingRules.length > 0 && (
                <StepCard>
                    <StepHeader icon={<DollarSign className="w-4.5 h-4.5 text-emerald-400" />} title="Dynamic Pricing Adjustments" subtitle="Time, Day, or Channel based automated adjustments" />
                    <div className="space-y-2">
                        {formData.dynamicPricingRules.map(rule => (
                            <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-150 rounded-xl text-[10px]">
                                <div className="space-y-0.5">
                                    <span className="font-black text-slate-800 uppercase block tracking-wider">{rule.name}</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase">Channel: {rule.channelId}</span>
                                </div>
                                <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    {rule.adjustmentValue > 0 ? '+' : ''}{rule.adjustmentValue}{rule.adjustmentType === 'PERCENTAGE' ? '%' : '$'}
                                </span>
                            </div>
                        ))}
                    </div>
                </StepCard>
            )}

            {/* Channel Deploy Status */}
            <StepCard>
                <StepHeader icon={<Server className="w-4.5 h-4.5 text-emerald-400" />} title="Deployment Channels" subtitle="Where this product will be published" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.channelVisibility.map(ch => (
                        <div key={ch} className="p-4 bg-white border border-slate-150 rounded-xl text-center space-y-2">
                            <Server className="w-5 h-5 text-emerald-500 mx-auto" />
                            <h5 className="text-[10px] font-black text-slate-950 uppercase tracking-tight">{ch}</h5>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black uppercase font-mono">Ready to Deploy</span>
                        </div>
                    ))}
                </div>
            </StepCard>
        </div>
    );
};

const SummaryRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
    <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={cn("text-xs font-bold text-slate-800", mono && "font-mono")}>{value}</span>
    </div>
);
