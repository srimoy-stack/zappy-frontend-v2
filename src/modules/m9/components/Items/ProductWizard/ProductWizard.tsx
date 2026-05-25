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
import { ComboBuilderStep } from './steps/ComboBuilderStep';
import { RulesStep } from './steps/RulesStep';
import { PricingStep } from './steps/PricingStep';
import { StoreOverridesStep } from './steps/StoreOverridesStep';
import { InventoryRecipeStep } from './steps/InventoryRecipeStep';
import { ReviewPublishStep } from './steps/ReviewPublishStep';
import { cn } from '@/utils';

interface ProductWizardProps {
    onClose: () => void;
}

export const ProductWizard: React.FC<ProductWizardProps> = ({ onClose }) => {
    const {
        currentStep, formData, editingItemId, isDirty,
        validateAllSteps, setSubmitting, resetForm, lastSavedAt
    } = useWizardStore();

    const { createItem, updateItem, publishDraft } = useCatalogStore();

    const isComboType = formData.productType === 'FIXED_COMBO' || formData.productType === 'CONFIGURABLE_DEAL';

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
        modifierGroups: [],
        storeOverrides: [],
        isAvailable: formData.isAvailable,
        taxRate: formData.taxRate,
        scopeConfig: formData.scopeConfig,
    }), [formData]);

    const handleSaveDraft = useCallback(() => {
        const payload = buildItemPayload();
        if (editingItemId) {
            updateItem(editingItemId, payload);
        } else {
            createItem(payload);
        }
        onClose();
    }, [buildItemPayload, editingItemId, createItem, updateItem, onClose]);

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
                            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                                {editingItemId ? `Edit: ${formData.name || 'Product'}` : 'New Product'}
                            </h2>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1 ml-[52px]">
                            {isComboType
                                ? 'Combo product creation — configure each item in the bundle'
                                : 'Step-by-step product creation wizard'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {lastSavedAt && (
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                            Last saved {new Date(lastSavedAt).toLocaleTimeString()}
                        </span>
                    )}
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                        formData.productType === 'SINGLE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        formData.productType === 'CONFIGURABLE_DEAL' ? "bg-violet-50 text-violet-700 border-violet-100" :
                        formData.productType === 'FIXED_COMBO' ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-slate-50 text-slate-700 border-slate-100"
                    )}>
                        {formData.productType.replace(/_/g, ' ')}
                    </span>
                </div>
            </div>

            {/* Progress Stepper */}
            <ProgressStepper />

            {/* Step Content */}
            <div className="min-h-[400px]">
                {renderStep()}
            </div>

            {/* Navigation Footer */}
            <StepNavigation onSaveDraft={handleSaveDraft} onPublish={handlePublish} />
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
