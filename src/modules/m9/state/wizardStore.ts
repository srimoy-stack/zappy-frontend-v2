import { create } from 'zustand';
import {
    WizardStepId,
    WizardFormData,
    StepValidationResult,
    StepStatus,
    WIZARD_STEPS,
} from '../types/wizard';
import { ItemType } from '../types/items';

interface WizardState {
    // Navigation
    currentStep: WizardStepId;
    visitedSteps: Set<WizardStepId>;

    // Form data
    formData: WizardFormData;
    isDirty: boolean;

    // Validation
    stepValidations: Record<WizardStepId, StepValidationResult>;

    // UI state
    isSubmitting: boolean;
    isAutoSaving: boolean;
    lastSavedAt: string | null;

    // Mode
    editingItemId: string | null; // null = creating new product

    // Actions
    setCurrentStep: (step: WizardStepId) => void;
    goToNextStep: () => void;
    goToPrevStep: () => void;
    canProceed: () => boolean;

    updateFormData: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
    updateFormDataBatch: (updates: Partial<WizardFormData>) => void;
    resetForm: () => void;
    initializeForEdit: (itemId: string, data: Partial<WizardFormData>) => void;

    validateStep: (stepId: WizardStepId) => StepValidationResult;
    validateAllSteps: () => boolean;
    getStepStatus: (stepId: WizardStepId) => StepStatus;

    markAutoSaved: () => void;
    setSubmitting: (value: boolean) => void;
    setDirty: (value: boolean) => void;
}

const DEFAULT_FORM_DATA: WizardFormData = {
    // Step 1
    productType: 'SINGLE',
    name: '',
    sku: '',
    description: '',
    imageUrl: '',
    tags: [],
    enableVariants: true,
    enableModifiers: true,
    enableAddons: true,
    // Step 2
    categoryId: '',
    secondaryCategoryIds: [],
    taxProfileId: '',
    taxRate: 5.0,
    dietaryFlags: [],
    availabilitySchedule: null,
    channelVisibility: ['POS', 'ONLINE'],
    channelOverrides: {},
    // Step 3
    baseProductPrice: 0,
    variantGroups: [],
    // Step 4
    modifierAttachments: [],
    // Step 5
    addonAttachments: [],
    // Step 6
    ruleAttachments: [],
    // Step 6
    isAvailable: true,
    dynamicPricingRules: [],
    // Step 7: Inventory & Recipe
    recipe: [],
    // Step 8
    scopeConfig: { scope: 'GLOBAL', targetedStoreIds: [] },
    storeOverrides: [],
    comboSlots: [],
};

const EMPTY_VALIDATION: StepValidationResult = {
    stepId: 'PRODUCT_TYPE',
    status: 'INCOMPLETE',
    errors: [],
    warnings: [],
};

function createEmptyValidations(): Record<WizardStepId, StepValidationResult> {
    const validations = {} as Record<WizardStepId, StepValidationResult>;
    WIZARD_STEPS.forEach(step => {
        validations[step.id] = { ...EMPTY_VALIDATION, stepId: step.id };
    });
    return validations;
}

function generateSku(name: string): string {
    return name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 20) || 'SKU';
}

function validateStepData(stepId: WizardStepId, data: WizardFormData): StepValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (stepId) {
        case 'PRODUCT_TYPE': {
            if (!data.name.trim()) errors.push('Product name is required');
            if (data.name.trim().length > 80) errors.push('Product name must be under 80 characters');
            if (!data.productType) errors.push('Product type must be selected');
            if (!data.sku.trim()) warnings.push('SKU will be auto-generated from name');
            break;
        }
        case 'CATEGORY_META': {
            if (!data.categoryId) errors.push('Primary category is required');
            if (data.taxRate < 0) errors.push('Tax rate cannot be negative');
            if (data.channelVisibility.length === 0) warnings.push('Product is not visible on any channel');
            break;
        }
        case 'VARIANTS': {
            if (data.productType === 'SINGLE' || data.productType === 'CONFIGURABLE_DEAL') {
                if (data.variantGroups.length === 0) errors.push('At least one variant group is required');
                data.variantGroups.forEach((vg, i) => {
                    if (vg.variants.length === 0) errors.push(`Variant group "${vg.name}" has no options`);
                    vg.variants.forEach(v => {
                        if (v.basePrice < 0 && (v.priceAdjustment === undefined || v.priceAdjustment < -data.baseProductPrice)) {
                            errors.push(`Variant "${v.name}" has an invalid price`);
                        }
                    });
                });
            }
            break;
        }
        case 'MODIFIERS': {
            // Optional step — always valid unless explicitly misconfigured
            data.modifierAttachments.forEach(att => {
                if (att.minSelection > att.maxSelection) {
                    errors.push('Min selection cannot exceed max selection');
                }
            });
            break;
        }
        case 'ADDONS': {
            // Optional step — always valid
            break;
        }
        case 'RULES': {
            // Optional step
            break;
        }
        case 'PRICING': {
            if (data.baseProductPrice < 0) errors.push('Base product price cannot be negative');
            if (data.baseProductPrice === 0) warnings.push('Base product price is $0.00');
            data.dynamicPricingRules.forEach(rule => {
                if (!rule.name.trim()) errors.push('Dynamic pricing rule name is required');
                if (rule.adjustmentValue === 0) warnings.push(`Rule "${rule.name}" has zero adjustment`);
            });
            break;
        }
        case 'OVERRIDES': {
            // Optional step
            break;
        }
        case 'REVIEW': {
            // Aggregate validation from all previous steps
            if (!data.name.trim()) errors.push('Product name is missing (Step 1)');
            if (!data.categoryId) errors.push('Category is missing (Step 2)');
            if (data.variantGroups.length === 0 && data.productType === 'SINGLE') {
                errors.push('No variant groups configured (Step 3)');
            }
            break;
        }
    }

    const status: StepStatus = errors.length > 0 ? 'ERROR' : (
        stepId === 'MODIFIERS' || stepId === 'ADDONS' || stepId === 'RULES' || stepId === 'PRICING' || stepId === 'OVERRIDES'
            ? (warnings.length > 0 ? 'VALID' : 'VALID')
            : (errors.length === 0 ? 'VALID' : 'INCOMPLETE')
    );

    return { stepId, status, errors, warnings };
}

export const useWizardStore = create<WizardState>((set, get) => {
    // Restore draft from localStorage
    const getCachedDraft = (): WizardFormData => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('zyappy_wizard_draft');
            if (cached) {
                try {
                    return { ...DEFAULT_FORM_DATA, ...JSON.parse(cached) };
                } catch { /* ignore */ }
            }
        }
        return { ...DEFAULT_FORM_DATA };
    };

    const persistDraft = (data: WizardFormData) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('zyappy_wizard_draft', JSON.stringify(data));
        }
    };

    const clearDraft = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('zyappy_wizard_draft');
        }
    };

    return {
        currentStep: 'PRODUCT_TYPE',
        visitedSteps: new Set<WizardStepId>(['PRODUCT_TYPE']),
        formData: getCachedDraft(),
        isDirty: false,
        stepValidations: createEmptyValidations(),
        isSubmitting: false,
        isAutoSaving: false,
        lastSavedAt: null,
        editingItemId: null,

        setCurrentStep: (step) => set(state => ({
            currentStep: step,
            visitedSteps: new Set([...state.visitedSteps, step]),
        })),

        goToNextStep: () => {
            const { currentStep, formData } = get();
            const enabledSteps = WIZARD_STEPS.filter(step => {
                if (step.id === 'VARIANTS' && !formData.enableVariants) return false;
                if (step.id === 'MODIFIERS' && !formData.enableModifiers) return false;
                if (step.id === 'ADDONS' && !formData.enableAddons) return false;
                return true;
            });
            const currentIdx = enabledSteps.findIndex(s => s.id === currentStep);
            if (currentIdx < enabledSteps.length - 1) {
                const nextStep = enabledSteps[currentIdx + 1].id;
                set(state => ({
                    currentStep: nextStep,
                    visitedSteps: new Set([...state.visitedSteps, nextStep]),
                }));
            }
        },

        goToPrevStep: () => {
            const { currentStep, formData } = get();
            const enabledSteps = WIZARD_STEPS.filter(step => {
                if (step.id === 'VARIANTS' && !formData.enableVariants) return false;
                if (step.id === 'MODIFIERS' && !formData.enableModifiers) return false;
                if (step.id === 'ADDONS' && !formData.enableAddons) return false;
                return true;
            });
            const currentIdx = enabledSteps.findIndex(s => s.id === currentStep);
            if (currentIdx > 0) {
                set({ currentStep: enabledSteps[currentIdx - 1].id });
            }
        },

        canProceed: () => {
            const { currentStep, formData } = get();
            const validation = validateStepData(currentStep, formData);
            return validation.errors.length === 0;
        },

        updateFormData: (field, value) => {
            const newData = { ...get().formData, [field]: value };
            // Auto-generate SKU from name
            if (field === 'name' && typeof value === 'string') {
                newData.sku = generateSku(value);
            }
            set({ formData: newData, isDirty: true });
            persistDraft(newData);
        },

        updateFormDataBatch: (updates) => {
            const newData = { ...get().formData, ...updates };
            set({ formData: newData, isDirty: true });
            persistDraft(newData);
        },

        resetForm: () => {
            clearDraft();
            set({
                currentStep: 'PRODUCT_TYPE',
                visitedSteps: new Set<WizardStepId>(['PRODUCT_TYPE']),
                formData: { ...DEFAULT_FORM_DATA },
                isDirty: false,
                stepValidations: createEmptyValidations(),
                isSubmitting: false,
                editingItemId: null,
                lastSavedAt: null,
            });
        },

        initializeForEdit: (itemId, data) => {
            const formData = { ...DEFAULT_FORM_DATA, ...data };
            set({
                currentStep: 'PRODUCT_TYPE',
                visitedSteps: new Set<WizardStepId>(WIZARD_STEPS.map(s => s.id)),
                formData,
                isDirty: false,
                stepValidations: createEmptyValidations(),
                editingItemId: itemId,
            });
            persistDraft(formData);
        },

        validateStep: (stepId) => {
            const result = validateStepData(stepId, get().formData);
            set(state => ({
                stepValidations: { ...state.stepValidations, [stepId]: result },
            }));
            return result;
        },

        validateAllSteps: () => {
            const { formData } = get();
            const validations = {} as Record<WizardStepId, StepValidationResult>;
            let allValid = true;
            WIZARD_STEPS.forEach(step => {
                const result = validateStepData(step.id, formData);
                validations[step.id] = result;
                
                const isStepEnabled = !(
                    (step.id === 'VARIANTS' && !formData.enableVariants) ||
                    (step.id === 'MODIFIERS' && !formData.enableModifiers) ||
                    (step.id === 'ADDONS' && !formData.enableAddons)
                );

                if (isStepEnabled && step.isRequired && result.errors.length > 0) {
                    allValid = false;
                }
            });
            set({ stepValidations: validations });
            return allValid;
        },

        getStepStatus: (stepId) => {
            const { stepValidations, visitedSteps } = get();
            if (!visitedSteps.has(stepId)) return 'INCOMPLETE';
            return stepValidations[stepId]?.status || 'INCOMPLETE';
        },

        markAutoSaved: () => set({
            isAutoSaving: false,
            lastSavedAt: new Date().toISOString(),
        }),

        setSubmitting: (value) => set({ isSubmitting: value }),

        setDirty: (value) => set({ isDirty: value }),
    };
});
