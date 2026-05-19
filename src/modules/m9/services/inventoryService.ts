/**
 * Inventory Service - Refactored to use Modular API Adapter
 * 
 * This service now delegates all complex business logic and state management
 * to the inventoryApi adapter, which handles the persistence layer.
 */

import { inventoryApi } from '../api/inventory';
import {
    CreateInventoryEntryDTO,
    CreateInventoryItemDTO,
    CreateVendorDTO,
    CreateRecipeDTO,
    CreateInventoryReturnDTO,
    InventoryStatus
} from '../types/inventory';
import { UserType, isSuperAdmin } from '@/shared/types/auth';

// ====================================================
// INVENTORY ENTRIES (STOCK INWARD)
// ====================================================

export const inventoryService = {
    getEntries: (filters?: {
        storeId?: string;
        supplierId?: string;
        status?: InventoryStatus;
        dateFrom?: string;
        dateTo?: string;
    }) => inventoryApi.getEntries(filters),

    getEntry: (id: string) => inventoryApi.getEntry(id),

    createEntry: (data: CreateInventoryEntryDTO, userId: string, userName: string) => 
        inventoryApi.createEntry({ ...data }),

    receiveInventory: (id: string) => inventoryApi.receiveInventory(id),

    updateEntry: (id: string, data: Partial<CreateInventoryEntryDTO>) => 
        inventoryApi.updateEntry(id, data),

    deleteEntry: (id: string, userType: UserType) => {
        if (!isSuperAdmin(userType)) {
            return Promise.reject(new Error('Only admins can delete entries'));
        }
        return inventoryApi.deleteEntry(id).then(() => true);
    }
};

// ====================================================
// INVENTORY ITEMS
// ====================================================

export const inventoryItemService = {
    getAll: (filters?: { status?: string; lowStockOnly?: boolean }) => 
        inventoryApi.getItems(filters),

    getById: (id: string) => inventoryApi.getItem(id),

    create: (data: CreateInventoryItemDTO, tenantId: string) => 
        inventoryApi.createItem(data),

    update: (id: string, data: Partial<CreateInventoryItemDTO>) => 
        inventoryApi.updateItem(id, data),

    adjustStock: (id: string, quantity: number, reason: string, userId: string) => 
        inventoryApi.adjustStock(id, quantity, reason),

    selfAdjustStock: (id: string, newQuantity: number, reason: string, userId: string, userName: string) => 
        inventoryApi.adjustStock(id, newQuantity, reason), // Simplified for now

    getLedger: (itemId: string) => inventoryApi.getLedger(itemId)
};

// ====================================================
// RECIPES
// ====================================================

export const recipeService = {
    getAll: (filters?: { status?: string }) => inventoryApi.getRecipes(filters),
    getById: (id: string) => inventoryApi.getRecipe(id),
    create: (data: CreateRecipeDTO, tenantId: string) => inventoryApi.createRecipe(data),
    update: (id: string, data: Partial<CreateRecipeDTO>) => inventoryApi.updateRecipe(id, data),
    delete: (id: string) => inventoryApi.deleteRecipe(id).then(() => true),
    duplicate: async (id: string) => {
        const recipe = await inventoryApi.getRecipe(id);
        if (!recipe) throw new Error('Recipe not found');
        return inventoryApi.createRecipe({
            ...recipe,
            name: `${recipe.name} (Copy)`,
        } as any);
    }
};

// ====================================================
// VENDORS
// ====================================================

export const vendorService = {
    getAll: () => inventoryApi.getVendors(),
    getById: (id: string) => inventoryApi.getVendor(id),
    create: (data: CreateVendorDTO) => inventoryApi.createVendor(data),
    update: (id: string, data: Partial<CreateVendorDTO>) => inventoryApi.updateVendor(id, data),
    delete: (id: string) => inventoryApi.deleteVendor(id).then(() => true),
    getVendorEntries: (vendorId: string) => inventoryApi.getEntries({ supplierId: vendorId })
};

// ====================================================
// RETURNS
// ====================================================

export const returnService = {
    getAll: (filters?: any) => inventoryApi.getReturns(filters),
    getById: (id: string) => inventoryApi.getReturns().then(rets => rets.find(r => r.id === id) || null),
    create: (data: CreateInventoryReturnDTO, userId: string, userName: string) => 
        inventoryApi.createReturn(data)
};
