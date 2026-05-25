/**
 * Deal, Slot, and Combo Engine Types
 * Implements spec Sections 13-17: Slot Engine, Deal Rules, Combo Rules, Addon Engine
 */

export type SlotType = 'REQUIRED' | 'OPTIONAL';

export interface SlotRule {
    slotName: string;
    slotType: SlotType;
    allowedProductIds: string[];
    allowedProductTypes: string[];
    allowedCategoryIds: string[];
    allowedVariantGroupIds: string[];
    allowedModifierGroupIds: string[];
    includedQuantity: number;
    maxQuantity: number;
    pricingMode: 'INCLUDED' | 'EXTRA_CHARGE' | 'DISCOUNTED';
    extraChargeValue?: number;
}

export interface DealSlot {
    id: string;
    name: string;
    sortOrder: number;
    rules: SlotRule;
    selectedProductId?: string;     // Runtime: what the customer chose
    selectedVariantId?: string;
}

export interface DealConfig {
    slots: DealSlot[];
    sharedToppingPool?: {
        enabled: boolean;
        totalAllowance: number;
        countMethod: 'PER_SLOT' | 'SHARED_ACROSS_DEAL';
    };
    addonConfig?: AddonConfig;
}

export interface ComboConfig {
    fixedProducts: {
        productId: string;
        quantity: number;
        allowSubstitution: boolean;
        substitutionCategoryId?: string;
    }[];
    comboPrice: number;
    addonConfig?: AddonConfig;
}

export interface AddonConfig {
    includedAddons: AddonEntry[];
    paidAddons: AddonEntry[];
    blockedAddons: string[];        // Product IDs that cannot be added
}

export interface AddonEntry {
    productId: string;
    categoryId?: string;
    maxQuantity: number;
    priceOverride?: number;         // null = use product's base price
}
