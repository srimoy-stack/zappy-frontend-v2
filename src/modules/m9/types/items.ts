export type ItemType = 'SINGLE' | 'COMBO';

export interface Category {
    id: string;
    name: string;
    description?: string;
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

export interface ModifierGroup {
    id: string;
    name: string;
    isRequired: boolean;
    minSelection: number;
    maxSelection: number;
    isToppingGroup: boolean; // enables placement UI for all options
    isHalfAndHalfEnabled: boolean;
    isPremiumRuleEnabled: boolean; // Premium counts as 2 regular
    options: ModifierOption[];
    linkedVariantGroupId?: string; // For Combo products
}

export interface ItemVariant {
    id: string;
    name: string; // e.g. "Small", "Regular"
    basePrice: number;
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

export interface StoreOverride {
    storeId: string;
    price?: number;
    isAvailable?: boolean;
    isPremiumRuleEnabled?: boolean;
}

export interface Item {
    id: string;
    productType: ItemType; // Immutable after creation
    name: string;
    description: string;
    imageUrl?: string;
    categoryId: string;
    variantGroups: ItemVariantGroup[];
    modifierGroups: ModifierGroup[];
    isAvailable: boolean;
    taxRate?: number;
    storeOverrides: StoreOverride[];
    auditLog?: {
        timestamp: string;
        user: string;
        action: string;
    }[];
}

export interface Ingredient {
    id: string;
    name: string;
    unit: 'kg' | 'liter' | 'piece' | 'g' | 'ml';
}

export interface RecipeEntry {
    ingredientId: string;
    quantity: number;
}

export interface ModifierIngredientMapping {
    modifierOptionId: string;
    ingredientId: string;
    quantity: number;
}
