export type ItemType = 'SINGLE' | 'COMBO' | 'CONFIGURABLE_DEAL' | 'FIXED_COMBO';
export type ProductDeploymentScope = 'GLOBAL' | 'STORE_SPECIFIC';
export type SyncStatusType = 'DRAFT' | 'QUEUED' | 'SYNCED' | 'FAILED';

export interface CustomDaySchedule {
    dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    startTime: string;
    endTime: string;
}

export interface CategoryChannelSchedule {
    channelId: string;
    allDays: boolean;               // If true, applies one start/end time for all days
    allDaysStartTime?: string;      // e.g. '09:00'
    allDaysEndTime?: string;        // e.g. '22:00'
    customDays?: CustomDaySchedule[];
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    visibilityMode?: 'ALL' | 'CUSTOM';           // Default: 'ALL' — visible on all channels
    customChannels?: string[];                     // Only used when visibilityMode === 'CUSTOM'
    channelSchedules?: CategoryChannelSchedule[];  // Per-channel scheduling
}

export interface RecipeEntry {
    ingredientId: string;
    quantity: number;
}

export interface SubOption {
    id: string;
    name: string;
    price: number;
    inventoryImpact?: RecipeEntry[];
}

export interface ModifierOption {
    id: string;
    name: string;
    price: number;
    isPremium?: boolean;
    subOptions?: SubOption[];
    isTopping?: boolean; // If true, enables Placement UI: Full, Left, Right
}

// Canonical Top-level Modifier Pool (Shared resource)
export interface ModifierPool {
    id: string;
    name: string;
    isToppingGroup: boolean;
    isHalfAndHalfEnabled: boolean;
    isPremiumRuleEnabled: boolean;
    options: ModifierOption[];
}

// Attaches a shared modifier pool to an item with localized metadata
export interface ItemModifierAttachment {
    modifierPoolId: string;
    sortOrder: number;
    isRequired: boolean;
    minSelection: number;
    maxSelection: number;
    linkedVariantGroupId?: string; // For Combo products
    priceOverrides?: Record<string, number>; // Localized surcharge override map: OptionId -> OverridePrice
}

export interface ItemVariant {
    id: string;
    name: string; // e.g. "Small", "Regular"
    basePrice: number;
    priceAdjustment?: number; // Incremental pricing: +$0, +$3, +$6 from baseProductPrice
    sku?: string;
    isAvailable: boolean;
    recipe?: RecipeEntry[]; // BOM per variant
}

export interface ItemVariantGroup {
    id: string;
    name: string; // e.g. "Size", "Dough", or for Combos "Pizza 1"
    isRequired: boolean;
    defaultVariantId: string;
    variants: ItemVariant[];
    sortOrder: number;
    componentName?: string; // For Combo products: e.g. "Pizza 1"
}

export interface EquivalencyRule {
    id: string;
    name: string;
    targetId: string; // Target modifier option ID (e.g. "opt-paneer")
    multiplier: number; // e.g. 2.0 (Paneer counts as 2 regular toppings)
    impactType: 'SELECTION_COUNT' | 'PRICING';
}

export interface ProductScopeConfig {
    scope: ProductDeploymentScope;
    targetedStoreIds: string[]; // If scope is STORE_SPECIFIC, targeted stores. Empty/null if GLOBAL.
}

export interface StoreOverrideRecord {
    price?: number;
    isAvailable?: boolean;
    taxRate?: number;
    overriddenFields: string[]; // List of fields explicitly customized by store manager
}

export interface StoreOverrideResolver {
    storeId: string;
    itemId: string;
    overrides: StoreOverrideRecord;
}

export interface ItemVersionMetadata {
    version: number;
    lastModifiedBy: string;
    lastModifiedAt: string;
    activeDraftHash: string;
}

export interface ChannelSyncStatus {
    channelId: string; // 'POS' | 'UberEats' | 'DoorDash' etc.
    status: SyncStatusType;
    lastSyncedAt?: string;
    errorMessage?: string;
}

// Legacy Override interface (retained for mock compilation compatibility)
export interface StoreOverride {
    storeId: string;
    price?: number;
    isAvailable?: boolean;
    isPremiumRuleEnabled?: boolean;
}

// Enterprise Operational Item Model
export interface Item {
    id: string;
    productType: ItemType;
    name: string;
    description: string;
    imageUrl?: string;
    sku?: string;
    tags?: string[];
    categoryId: string;
    secondaryCategoryIds?: string[];
    baseProductPrice?: number; // Anchor price for incremental variant pricing
    dietaryFlags?: string[];
    channelVisibility?: string[];
    variantGroups: ItemVariantGroup[];
    
    // Decoupled structure: links to shared modifier pools
    modifierAttachments?: ItemModifierAttachment[];
    
    // Keep legacy modifierGroups for backward compatibility with current mock/editor view compilations
    modifierGroups: ModifierGroup[]; 

    comboSlots?: ComboSlot[];

    isAvailable: boolean;
    taxRate?: number;
    
    // Operational scopes, rules, and publishing
    scopeConfig?: ProductScopeConfig;
    storeOverridesResolver?: StoreOverrideResolver[];
    equivalencyRules?: EquivalencyRule[];
    versionMetadata?: ItemVersionMetadata;
    channelSyncs?: ChannelSyncStatus[];

    // Legacy overrides (retained for backward compatibility)
    storeOverrides: StoreOverride[];
    auditLog?: {
        timestamp: string;
        user: string;
        action: string;
    }[];
}

export interface ComboSlot {
    id: string;
    slotName: string;
    quantity: number;
    selectedVariantTemplateId: string | null;
    selectedModifierTemplateIds: string[];
    customPrice: number | null; // null = use base price
    isConfigured: boolean;
}

// Retain legacy structure (ModifierGroup) for backward compatibility
export interface ModifierGroup {
    id: string;
    name: string;
    isRequired: boolean;
    minSelection: number;
    maxSelection: number;
    isToppingGroup: boolean;
    isHalfAndHalfEnabled: boolean;
    isPremiumRuleEnabled: boolean;
    options: ModifierOption[];
    linkedVariantGroupId?: string; // For Combo products
}

export interface Ingredient {
    id: string;
    name: string;
    unit: 'kg' | 'liter' | 'piece' | 'g' | 'ml';
}

export interface ModifierIngredientMapping {
    modifierOptionId: string;
    ingredientId: string;
    quantity: number;
}
