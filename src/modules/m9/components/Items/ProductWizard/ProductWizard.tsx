'use client';

import React, { useEffect, useCallback } from 'react';
import { ChevronLeft, Target, Sparkles } from 'lucide-react';
import { useWizardStore } from '../../../state/wizardStore';
import { useCatalogStore } from '../../../state/catalogStore';
import { ProgressStepper } from './shared/ProgressStepper';
import { StepNavigation } from './shared/StepNavigation';
import { ProductTypeStep } from './steps/ProductTypeStep';
import { CategoryMetadataStep } from './steps/CategoryMetadataStep';
import { VariantGroupsStep } from './steps/VariantGroupsStep';
import { ModifierAttachmentStep } from './steps/ModifierAttachmentStep';
import { AddonAttachmentStep } from './steps/AddonAttachmentStep';
import { ComboBuilderStep } from './steps/ComboBuilderStep';
import { RulesStep } from './steps/RulesStep';
import { PricingStep } from './steps/PricingStep';
import { StoreOverridesStep } from './steps/StoreOverridesStep';
import { InventoryRecipeStep } from './steps/InventoryRecipeStep';
import { ReviewPublishStep } from './steps/ReviewPublishStep';
import { Item } from '../../../types/items';
import { cn } from '@/utils';

interface ProductWizardProps {
    onClose: () => void;
    editItem?: Item | null;
}

export const ProductWizard: React.FC<ProductWizardProps> = ({ onClose, editItem }) => {
    const {
        currentStep, formData, editingItemId, isDirty,
        validateAllSteps, setSubmitting, resetForm, lastSavedAt,
        initializeForEdit, setDirty
    } = useWizardStore();

    const { createItem, updateItem, publishDraft } = useCatalogStore();

    const isComboType = formData.productType === 'FIXED_COMBO' || formData.productType === 'CONFIGURABLE_DEAL';

    // Initialize wizard for edit mode OR reset for create mode.
    // Single effect handles both init and cleanup to avoid React Strict Mode race conditions.
    // The component is keyed (key={`edit-${id}`}), so it fully remounts on item change.
    useEffect(() => {
        if (editItem) {
            const hasVariants = (editItem.variantGroups || []).length > 0;
            const hasModifiers = (editItem.modifierAttachments || []).length > 0 || (editItem.modifierGroups || []).length > 0;

            initializeForEdit(editItem.id, {
                productType: editItem.productType,
                name: editItem.name,
                sku: editItem.sku || '',
                description: editItem.description || '',
                imageUrl: editItem.imageUrl || '',
                tags: editItem.tags || [],
                categoryId: editItem.categoryId || '',
                secondaryCategoryIds: editItem.secondaryCategoryIds || [],
                taxRate: editItem.taxRate ?? 5.0,
                baseProductPrice: editItem.baseProductPrice ?? 0,
                variantGroups: editItem.variantGroups || [],
                modifierAttachments: editItem.modifierAttachments || [],
                isAvailable: editItem.isAvailable,
                channelVisibility: editItem.channelVisibility || ['POS', 'ONLINE'],
                dietaryFlags: editItem.dietaryFlags || [],
                scopeConfig: editItem.scopeConfig || { scope: 'GLOBAL', targetedStoreIds: [] },
                enableVariants: hasVariants,
                enableModifiers: hasModifiers,
                enableAddons: false,
                storeOverrides: (editItem.storeOverrides || []).map(o => ({
                    storeId: o.storeId,
                    storeName: o.storeId,
                    priceOverride: o.price,
                    availabilityOverride: o.isAvailable,
                })),
                comboSlots: editItem.comboSlots || [],
            });
        }
        return () => { resetForm(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editItem?.id]);

    // Warn on unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const buildItemPayload = useCallback(() => ({
        productType: formData.productType,
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        imageUrl: formData.imageUrl,
        tags: formData.tags,
        categoryId: formData.categoryId,
        secondaryCategoryIds: formData.secondaryCategoryIds,
        baseProductPrice: formData.baseProductPrice,
        dietaryFlags: formData.dietaryFlags,
        channelVisibility: formData.channelVisibility,
        variantGroups: formData.variantGroups,
        modifierAttachments: formData.modifierAttachments,
        modifierGroups: editItem?.modifierGroups || [],
        storeOverrides: (formData.storeOverrides || []).map(o => ({
            storeId: o.storeId,
            price: o.priceOverride,
            isAvailable: o.availabilityOverride,
        })),
        isAvailable: formData.isAvailable,
        taxRate: formData.taxRate,
        scopeConfig: formData.scopeConfig,
        comboSlots: formData.comboSlots || [],
    }), [formData, editItem]);

    const handleSaveDraft = useCallback(() => {
        const payload = buildItemPayload();
        if (editingItemId) {
            updateItem(editingItemId, payload);
        } else {
            createItem(payload);
        }
        onClose();
    }, [buildItemPayload, editingItemId, createItem, updateItem, onClose]);

    const handleUpdateStep = useCallback(() => {
        const payload = buildItemPayload();
        if (editingItemId) {
            updateItem(editingItemId, payload);
        } else {
            const created = createItem(payload);
            // Re-initialize store state to keep the wizard open in edit mode
            initializeForEdit(created.id, {
                ...formData,
            });
        }
        setDirty(false);
    }, [buildItemPayload, editingItemId, createItem, updateItem, initializeForEdit, formData, setDirty]);

    const handlePublish = useCallback(async () => {
        const isValid = validateAllSteps();
        if (!isValid) return;

        setSubmitting(true);
        try {
            let targetId = editingItemId;
            const payload = buildItemPayload();

            if (!targetId) {
                const created = createItem(payload);
                targetId = created.id;
            } else {
                updateItem(targetId, payload);
            }

            await publishDraft(targetId);
            resetForm();
            onClose();
        } finally {
            setSubmitting(false);
        }
    }, [buildItemPayload, editingItemId, validateAllSteps, createItem, updateItem, publishDraft, resetForm, onClose, setSubmitting]);

    const handleClose = () => {
        if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
        resetForm();
        onClose();
    };

    /**
     * Step rendering — adapts based on product type:
     * - SINGLE: Type → Category → Variants → Modifiers → Review
     * - COMBO/DEAL: Type → Category → Combo Builder → Review
     */
    const renderStep = () => {
        switch (currentStep) {
            case 'PRODUCT_TYPE':
                return <ProductTypeStep />;
            case 'CATEGORY_META':
                return <CategoryMetadataStep />;
            case 'VARIANTS':
                return isComboType ? <ComboBuilderStep /> : <VariantGroupsStep />;
            case 'MODIFIERS':
                return isComboType
                    ? <PlaceholderStep title="Combo Add-Ons" desc="Add optional side items, drinks, and extras to the combo. Coming in Phase 3." />
                    : <ModifierAttachmentStep />;
            case 'ADDONS':
                return <AddonAttachmentStep />;
            case 'RULES':
                return <RulesStep />;
            case 'PRICING':
                return <PricingStep />;
            case 'INVENTORY':
                return <InventoryRecipeStep />;
            case 'OVERRIDES':
                return <StoreOverridesStep />;
            case 'REVIEW':
                return <ReviewPublishStep />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClose}
                        className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-slate-950 rounded-xl">
                                <Target className="w-4 h-4 text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                                {editingItemId ? `Edit: ${formData.name || 'Product'}` : (formData.name || 'New Product')}
                            </h2>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-1 ml-[52px]">
                            {isComboType
                                ? 'Combo product creation — configure each item in the bundle'
                                : 'Step-by-step product creation wizard'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {lastSavedAt && (
                        <span className="text-xs text-slate-500 font-semibold">
                            Last saved {new Date(lastSavedAt).toLocaleTimeString()}
                        </span>
                    )}
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold border capitalize",
                        formData.productType === 'SINGLE' ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                        formData.productType === 'CONFIGURABLE_DEAL' ? "bg-violet-50 text-violet-850 border-violet-200" :
                        formData.productType === 'FIXED_COMBO' ? "bg-amber-50 text-amber-850 border-amber-200" :
                        "bg-slate-50 text-slate-800 border-slate-200"
                    )}>
                        {formData.productType.replace(/_/g, ' ').toLowerCase()}
                    </span>
                </div>
            </div>

            {/* Progress Stepper */}
            <ProgressStepper />

            {/* Step Content */}
            <div 
                className="min-h-[400px]"
                onClick={() => { if (!isDirty) setDirty(true); }}
                onKeyDown={() => { if (!isDirty) setDirty(true); }}
            >
                {renderStep()}
            </div>

            {/* Navigation Footer */}
            <StepNavigation 
                onSaveDraft={handleSaveDraft} 
                onPublish={handlePublish} 
                onUpdateStep={handleUpdateStep} 
            />
        </div>
    );
};

// ─── Placeholder for Phase 3 Steps ──────────────────────────

const PlaceholderStep: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <div className="bg-white p-12 rounded-[2rem] border border-slate-200/60 shadow-sm text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">{title}</h3>
        <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">{desc}</p>
        <span className="inline-block mt-4 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-wider">
            Coming Soon — Skip to Next Step
        </span>
    </div>
);
