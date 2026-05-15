/**
 * Inventory Module Types
 * Strict type definitions following the Developer Handoff Document
 */

// ====================================================
// INVENTORY STATUS & ENUMS
// ====================================================

export type InventoryStatus = 'Draft' | 'Ordered' | 'Received' | 'Partial' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';
export type ReturnType = 'Supplier Return' | 'Damaged' | 'Expired' | 'Adjustment';
export type BaseUnit = 'Piece' | 'Gram' | 'Liter' | 'Kilogram' | 'Milliliter';
export type ItemStatus = 'Active' | 'Inactive';
export type RecipeStatus = 'Active' | 'Inactive';

// ====================================================
// VENDOR
// ====================================================

export interface Vendor {
    id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    mobileNumber?: string;
    email?: string;
    website?: string;
    address?: string;
    totalPurchases: number;
    totalPaid: number;
    totalDue: number;
    lastInventoryDate?: string;
    status: 'Active' | 'Inactive';
    createdAt: string;
    updatedAt: string;
}

// ====================================================
// INVENTORY ITEM (INGREDIENT)
// ====================================================

export interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    baseUnit: BaseUnit;
    currentStock: number;
    averageCost: number;
    lowStockThreshold: number;
    status: ItemStatus;
    description?: string;
    tenantId: string;
    lastAdjustedBy?: string;
    lastAdjustedByName?: string;
    lastAdjustedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ====================================================
// STOCK INWARD (INVENTORY ENTRY)
// ====================================================

export interface InventoryEntryProduct {
    id: string;
    inventoryItemId: string;
    inventoryItemName: string;
    sku: string;
    purchaseQuantity: number;
    unitCostBeforeTax: number;
    subtotal: number;
    taxPercentage: number;
    taxAmount: number;
    unitCostAfterTax: number;
    lineTotal: number;
}

export interface InventoryEntry {
    id: string;
    referenceNo: string;
    supplierId: string;
    supplierName: string;
    storeId: string;
    storeName: string;
    inventoryDate: string;
    inventoryStatus: InventoryStatus;
    paymentStatus: PaymentStatus;
    payTerm?: string;
    attachedDocument?: string;
    products: InventoryEntryProduct[];
    purchaseTax: number;
    shippingCharges: number;
    additionalNotes?: string;
    subtotal: number;
    totalTax: number;
    grandTotal: number;
    paymentDue: number;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

// ====================================================
// INVENTORY RETURN
// ====================================================

export interface InventoryReturnProduct {
    id: string;
    inventoryItemId: string;
    inventoryItemName: string;
    sku: string;
    returnQuantity: number;
    unitCost: number;
    lineTotal: number;
}

export interface InventoryReturn {
    id: string;
    referenceNo: string;
    returnType: ReturnType;
    supplierId?: string;
    supplierName?: string;
    storeId: string;
    storeName: string;
    returnDate: string;
    products: InventoryReturnProduct[];
    totalAmount: number;
    reason?: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
}

// ====================================================
// RECIPE (BOM)
// ====================================================

export interface RecipeIngredient {
    id: string;
    inventoryItemId: string;
    inventoryItemName: string;
    baseUnit: BaseUnit;
    quantityUsed: number;
    unitCost: number;
    wastagePercentage: number;
    effectiveQuantity: number;
    lineCost: number;
}

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    status: RecipeStatus;
    ingredients: RecipeIngredient[];
    totalRecipeCost: number;
    usedByProductCount: number;
    linkedProductIds?: string[]; // IDs of products using this recipe
    tenantId: string;
    createdAt: string;
    updatedAt: string;
}

// ====================================================
// INVENTORY LEDGER
// ====================================================

export type LedgerSourceType = 'inventory' | 'sale' | 'return' | 'adjustment';

export interface InventoryLedgerEntry {
    id: string;
    inventoryItemId: string;
    inventoryItemName: string;
    changeQuantity: number; // +/- value
    sourceType: LedgerSourceType;
    sourceId: string;
    sourceReference?: string;
    storeId: string;
    storeName: string;
    balanceAfter: number;
    createdAt: string;
}

// ====================================================
// FORM DTOs
// ====================================================

export interface CreateInventoryEntryDTO {
    supplierId: string;
    referenceNo?: string;
    inventoryDate: string;
    inventoryStatus: InventoryStatus;
    storeId: string;
    payTerm?: string;
    attachedDocument?: string;
    products: Omit<InventoryEntryProduct, 'id' | 'inventoryItemName'>[];
    purchaseTax: number;
    shippingCharges: number;
    additionalNotes?: string;
}

export interface CreateInventoryItemDTO {
    name: string;
    sku: string;
    baseUnit: BaseUnit;
    lowStockThreshold: number;
    status?: ItemStatus;
    description?: string;
}

export interface CreateVendorDTO {
    name: string;
    contactPerson?: string;
    phone?: string;
    mobileNumber?: string;
    email?: string;
    website?: string;
    address?: string;
    status: 'Active' | 'Inactive';
}

export interface CreateRecipeDTO {
    name: string;
    description?: string;
    status: RecipeStatus;
    ingredients: Omit<RecipeIngredient, 'id' | 'inventoryItemName' | 'unitCost' | 'effectiveQuantity' | 'lineCost'>[];
    linkedProductIds?: string[];
}

export interface CreateInventoryReturnDTO {
    returnType: ReturnType;
    supplierId?: string;
    storeId: string;
    returnDate: string;
    products: Omit<InventoryReturnProduct, 'id' | 'inventoryItemName'>[];
    reason?: string;
}
