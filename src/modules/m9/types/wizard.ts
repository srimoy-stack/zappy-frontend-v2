/**
 * Product Creation Wizard Types
 * Defines the 8-step wizard flow state, validation, and form data model.
 */

import { ItemType, ItemVariantGroup, ItemModifierAttachment, ProductScopeConfig } from './items';
import { RuleAttachment } from './rules';

export type WizardStepId =
    | 'PRODUCT_TYPE'
    | 'CATEGORY_META'
    | 'VARIANTS'
    | 'MODIFIERS'
    | 'RULES'
    | 'PRICING'
    | 'INVENTORY'
    | 'OVERRIDES'
    | 'REVIEW';

export type StepStatus = 'INCOMPLETE' | 'VALID' | 'ERROR' | 'SKIPPED';

export interface WizardStepDef {
    id: WizardStepId;
    number: number;
    label: string;
    description: string;
    isRequired: boolean;
}

export interface StepValidationResult {
    stepId: WizardStepId;
    status: StepStatus;
    errors: string[];
    warnings: string[];
}

// ─── Wizard Form Data ───────────────────────────────────────

export interface WizardFormData {
    // Step 1: Product Type & Identity
    productType: ItemType;
    name: string;
    sku: string;
    description: string;
    imageUrl: string;
    tags: string[];

    // Step 2: Category & Metadata
    categoryId: string;
    secondaryCategoryIds: string[];
    taxProfileId: string;
    taxRate: number;
    dietaryFlags: string[];
    availabilitySchedule: AvailabilitySchedule | null;
    channelVisibility: string[];

    // Step 3: Variant Groups
    baseProductPrice: number;
    variantGroups: ItemVariantGroup[];

    // Step 4: Modifier Pool Attachments
    modifierAttachments: ItemModifierAttachment[];

    // Step 5: Rules & Constraints
    ruleAttachments: RuleAttachment[];

    // Step 6: Pricing & Availability
    isAvailable: boolean;
    dynamicPricingRules: DynamicPricingEntry[];

    // Step 7: Inventory & Recipe
    recipe: RecipeFormEntry[];

    // Step 8: Store Overrides
    scopeConfig: ProductScopeConfig;
    storeOverrides: StoreOverrideEntry[];
}

export interface AvailabilitySchedule {
    days: string[];
    timeStart: string;
    timeEnd: string;
}

export interface DynamicPricingEntry {
    id: string;
    name: string;
    channelId: string;
    adjustmentType: 'PERCENTAGE' | 'FIXED';
    adjustmentValue: number;
    conditions?: {
        days?: string[];
        timeStart?: string;
        timeEnd?: string;
    };
}

export interface StoreOverrideEntry {
    storeId: string;
    storeName: string;
    priceOverride?: number;
    availabilityOverride?: boolean;
    taxRateOverride?: number;
}

export interface RecipeFormEntry {
    id: string;
    ingredientName: string;
    quantity: number;
    unit: 'kg' | 'liter' | 'piece' | 'g' | 'ml';
    variantId?: string; // Optional: link to specific variant
    costPerUnit?: number;
}

// ─── Wizard Steps Configuration ─────────────────────────────

export const WIZARD_STEPS: WizardStepDef[] = [
    { id: 'PRODUCT_TYPE', number: 1, label: 'Product Type & Identity', description: 'Choose type, name, and SKU', isRequired: true },
    { id: 'CATEGORY_META', number: 2, label: 'Category & Metadata', description: 'Category, tax, and dietary info', isRequired: true },
    { id: 'VARIANTS', number: 3, label: 'Variant Groups', description: 'Sizes, crusts, and pricing', isRequired: true },
    { id: 'MODIFIERS', number: 4, label: 'Modifier Pools', description: 'Toppings, sauces, and extras', isRequired: false },
    { id: 'RULES', number: 5, label: 'Rules & Constraints', description: 'Business rules and limits', isRequired: false },
    { id: 'PRICING', number: 6, label: 'Pricing & Availability', description: 'Dynamic pricing and channels', isRequired: false },
    { id: 'INVENTORY', number: 7, label: 'Inventory & Recipe', description: 'Ingredient mapping and BOM', isRequired: false },
    { id: 'OVERRIDES', number: 8, label: 'Store Overrides', description: 'Per-store customizations', isRequired: false },
    { id: 'REVIEW', number: 9, label: 'Review & Publish', description: 'Validate and deploy', isRequired: true },
];
