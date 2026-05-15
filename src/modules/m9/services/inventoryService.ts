/**
 * Inventory Service - Mock Backend Simulation
 * Provides realistic backend behavior with state management
 * 
 * STRICT RULES:
 * - Simulates real backend responses
 * - Enforces business rules
 * - Maintains data consistency
 * - No UI shortcuts
 */

import {
    InventoryEntry,
    InventoryItem,
    Recipe,
    Vendor,
    InventoryReturn,
    InventoryLedgerEntry,
    CreateInventoryEntryDTO,
    CreateInventoryItemDTO,
    CreateVendorDTO,
    CreateRecipeDTO,
    CreateInventoryReturnDTO,
    InventoryStatus
} from '../types/inventory';

import {
    mockInventoryEntries,
    mockInventoryItems,
    mockRecipes,
    mockVendors,
    mockInventoryReturns,
    mockInventoryLedger
} from '../mock/inventory';

// In-memory state (simulates database)
let inventoryEntries = [...mockInventoryEntries];
let inventoryItems = [...mockInventoryItems];
let recipes = [...mockRecipes];
let vendors = [...mockVendors];
let inventoryReturns = [...mockInventoryReturns];
let inventoryLedger = [...mockInventoryLedger];

// Helper: Generate ID
const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

// Helper: Generate Reference Number
const generateReferenceNo = (prefix: string) => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${year}-${timestamp}`;
};

// ====================================================
// INVENTORY ENTRIES (STOCK INWARD)
// ====================================================

export const inventoryService = {
    // Get all entries with filters
    getEntries: (filters?: {
        storeId?: string;
        supplierId?: string;
        status?: InventoryStatus;
        dateFrom?: string;
        dateTo?: string;
    }) => {
        let filtered = [...inventoryEntries];

        if (filters?.storeId) {
            filtered = filtered.filter(e => e.storeId === filters.storeId);
        }
        if (filters?.supplierId) {
            filtered = filtered.filter(e => e.supplierId === filters.supplierId);
        }
        if (filters?.status) {
            filtered = filtered.filter(e => e.inventoryStatus === filters.status);
        }
        if (filters?.dateFrom) {
            filtered = filtered.filter(e => new Date(e.inventoryDate) >= new Date(filters.dateFrom!));
        }
        if (filters?.dateTo) {
            filtered = filtered.filter(e => new Date(e.inventoryDate) <= new Date(filters.dateTo!));
        }

        return Promise.resolve(filtered);
    },

    // Get single entry
    getEntry: (id: string) => {
        const entry = inventoryEntries.find(e => e.id === id);
        return Promise.resolve(entry || null);
    },

    // Create entry
    createEntry: (data: CreateInventoryEntryDTO, userId: string, userName: string) => {
        const newEntry: InventoryEntry = {
            id: generateId('IE'),
            referenceNo: data.referenceNo || generateReferenceNo('PO'),
            supplierId: data.supplierId,
            supplierName: vendors.find(v => v.id === data.supplierId)?.name || '',
            storeId: data.storeId,
            storeName: 'Main Store', // TODO: Get from store service
            inventoryDate: data.inventoryDate,
            inventoryStatus: data.inventoryStatus,
            paymentStatus: 'Unpaid',
            payTerm: data.payTerm,
            attachedDocument: data.attachedDocument,
            products: data.products.map(p => ({
                ...p,
                id: generateId('IEP'),
                inventoryItemName: inventoryItems.find(i => i.id === p.inventoryItemId)?.name || ''
            })),
            purchaseTax: data.purchaseTax,
            shippingCharges: data.shippingCharges,
            additionalNotes: data.additionalNotes,
            subtotal: data.products.reduce((sum, p) => sum + p.subtotal, 0),
            totalTax: data.products.reduce((sum, p) => sum + p.taxAmount, 0) + data.purchaseTax,
            grandTotal: 0, // Calculated below
            paymentDue: 0, // Calculated below
            createdBy: userId,
            createdByName: userName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        newEntry.grandTotal = newEntry.subtotal + newEntry.totalTax + newEntry.shippingCharges;
        newEntry.paymentDue = newEntry.grandTotal;

        inventoryEntries.push(newEntry);
        return Promise.resolve(newEntry);
    },

    // Receive inventory (update stock)
    receiveInventory: (id: string) => {
        const entry = inventoryEntries.find(e => e.id === id);
        if (!entry) return Promise.reject(new Error('Entry not found'));
        if (entry.inventoryStatus === 'Received') return Promise.reject(new Error('Already received'));

        // Update entry status
        entry.inventoryStatus = 'Received';
        entry.updatedAt = new Date().toISOString();

        // Update inventory quantities
        entry.products.forEach(product => {
            const item = inventoryItems.find(i => i.id === product.inventoryItemId);
            if (item) {
                // Increment stock
                item.currentStock += product.purchaseQuantity;

                // Recalculate average cost
                const totalValue = (item.currentStock - product.purchaseQuantity) * item.averageCost +
                    product.purchaseQuantity * product.unitCostAfterTax;
                item.averageCost = totalValue / item.currentStock;
                item.updatedAt = new Date().toISOString();

                // Create ledger entry
                const ledgerEntry: InventoryLedgerEntry = {
                    id: generateId('LED'),
                    inventoryItemId: item.id,
                    inventoryItemName: item.name,
                    changeQuantity: product.purchaseQuantity,
                    sourceType: 'inventory',
                    sourceId: entry.id,
                    sourceReference: entry.referenceNo,
                    storeId: entry.storeId,
                    storeName: entry.storeName,
                    balanceAfter: item.currentStock,
                    createdAt: new Date().toISOString()
                };
                inventoryLedger.push(ledgerEntry);
            }
        });

        return Promise.resolve(entry);
    },

    // Update entry
    updateEntry: (id: string, data: Partial<CreateInventoryEntryDTO>) => {
        const entry = inventoryEntries.find(e => e.id === id);
        if (!entry) return Promise.reject(new Error('Entry not found'));

        // Only allow edit if Draft or Ordered
        if (entry.inventoryStatus !== 'Draft' && entry.inventoryStatus !== 'Ordered') {
            return Promise.reject(new Error('Cannot edit received inventory'));
        }

        // Update fields
        Object.assign(entry, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        return Promise.resolve(entry);
    },

    // Delete entry
    deleteEntry: (id: string, userRole: string) => {
        const entry = inventoryEntries.find(e => e.id === id);
        if (!entry) return Promise.reject(new Error('Entry not found'));

        // Admin only
        if (userRole !== 'ADMIN') {
            return Promise.reject(new Error('Only admins can delete entries'));
        }

        // Only before received
        if (entry.inventoryStatus === 'Received' || entry.inventoryStatus === 'Partial') {
            return Promise.reject(new Error('Cannot delete received inventory'));
        }

        inventoryEntries = inventoryEntries.filter(e => e.id !== id);
        return Promise.resolve(true);
    }
};

// ====================================================
// INVENTORY ITEMS
// ====================================================

export const inventoryItemService = {
    getAll: (filters?: { status?: string; lowStockOnly?: boolean }) => {
        let filtered = [...inventoryItems];

        if (filters?.status) {
            filtered = filtered.filter(i => i.status === filters.status);
        }
        if (filters?.lowStockOnly) {
            filtered = filtered.filter(i => i.currentStock <= i.lowStockThreshold);
        }

        return Promise.resolve(filtered);
    },

    getById: (id: string) => {
        const item = inventoryItems.find(i => i.id === id);
        return Promise.resolve(item || null);
    },

    create: (data: CreateInventoryItemDTO, tenantId: string) => {
        const newItem: InventoryItem = {
            id: generateId('INV'),
            ...data,
            status: data.status || 'Active',
            currentStock: 0,
            averageCost: 0,
            tenantId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        inventoryItems.push(newItem);
        return Promise.resolve(newItem);
    },

    update: (id: string, data: Partial<CreateInventoryItemDTO>) => {
        const item = inventoryItems.find(i => i.id === id);
        if (!item) return Promise.reject(new Error('Item not found'));

        Object.assign(item, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        return Promise.resolve(item);
    },

    adjustStock: (id: string, quantity: number, reason: string, userId: string) => {
        const item = inventoryItems.find(i => i.id === id);
        if (!item) return Promise.reject(new Error('Item not found'));

        item.currentStock += quantity;
        item.updatedAt = new Date().toISOString();

        // Create ledger entry
        const ledgerEntry: InventoryLedgerEntry = {
            id: generateId('LED'),
            inventoryItemId: item.id,
            inventoryItemName: item.name,
            changeQuantity: quantity,
            sourceType: 'adjustment',
            sourceId: userId,
            sourceReference: reason,
            storeId: 'STORE001',
            storeName: 'Main Store',
            balanceAfter: item.currentStock,
            createdAt: new Date().toISOString()
        };
        inventoryLedger.push(ledgerEntry);

        return Promise.resolve(item);
    },

    selfAdjustStock: (id: string, newQuantity: number, reason: string, userId: string, userName: string) => {
        const item = inventoryItems.find(i => i.id === id);
        if (!item) return Promise.reject(new Error('Item not found'));

        const oldQuantity = item.currentStock;
        const change = newQuantity - oldQuantity;

        // Overwrite quantity (Hard replace)
        item.currentStock = newQuantity;
        item.lastAdjustedBy = userId;
        item.lastAdjustedByName = userName;
        item.lastAdjustedAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();

        // Create ledger entry
        const ledgerEntry: InventoryLedgerEntry = {
            id: generateId('LED'),
            inventoryItemId: item.id,
            inventoryItemName: item.name,
            changeQuantity: change,
            sourceType: 'adjustment',
            sourceId: userId,
            sourceReference: `Self Adjust: ${reason || 'Physical count correction'}`,
            storeId: 'STORE001',
            storeName: 'Main Store',
            balanceAfter: item.currentStock,
            createdAt: new Date().toISOString()
        };
        inventoryLedger.push(ledgerEntry);

        return Promise.resolve(item);
    },

    getLedger: (itemId: string) => {
        const entries = inventoryLedger.filter(l => l.inventoryItemId === itemId);
        return Promise.resolve(entries);
    }
};

// ====================================================
// RECIPES
// ====================================================

export const recipeService = {
    getAll: (filters?: { status?: string }) => {
        let filtered = [...recipes];

        if (filters?.status) {
            filtered = filtered.filter(r => r.status === filters.status);
        }

        return Promise.resolve(filtered);
    },

    getById: (id: string) => {
        const recipe = recipes.find(r => r.id === id);
        return Promise.resolve(recipe || null);
    },

    create: (data: CreateRecipeDTO, tenantId: string) => {
        // Calculate costs
        const ingredientsWithCosts = data.ingredients.map(ing => {
            const item = inventoryItems.find(i => i.id === ing.inventoryItemId);
            const effectiveQty = ing.quantityUsed + (ing.quantityUsed * ing.wastagePercentage / 100);
            const lineCost = effectiveQty * (item?.averageCost || 0);

            return {
                id: generateId('RI'),
                ...ing,
                inventoryItemName: item?.name || '',
                baseUnit: item?.baseUnit || 'Piece',
                unitCost: item?.averageCost || 0,
                effectiveQuantity: effectiveQty,
                lineCost
            };
        });

        const totalCost = ingredientsWithCosts.reduce((sum, ing) => sum + ing.lineCost, 0);

        const newRecipe: Recipe = {
            id: generateId('REC'),
            ...data,
            ingredients: ingredientsWithCosts,
            totalRecipeCost: totalCost,
            usedByProductCount: data.linkedProductIds?.length || 0,
            linkedProductIds: data.linkedProductIds || [],
            tenantId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        recipes.push(newRecipe);
        return Promise.resolve(newRecipe);
    },

    update: (id: string, data: Partial<CreateRecipeDTO>) => {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return Promise.reject(new Error('Recipe not found'));

        // Recalculate if ingredients changed
        if (data.ingredients) {
            const ingredientsWithCosts = data.ingredients.map(ing => {
                const item = inventoryItems.find(i => i.id === ing.inventoryItemId);
                const effectiveQty = ing.quantityUsed + (ing.quantityUsed * ing.wastagePercentage / 100);
                const lineCost = effectiveQty * (item?.averageCost || 0);

                return {
                    id: generateId('RI'),
                    ...ing,
                    inventoryItemName: item?.name || '',
                    baseUnit: item?.baseUnit || 'Piece',
                    unitCost: item?.averageCost || 0,
                    effectiveQuantity: effectiveQty,
                    lineCost
                };
            });

            const totalCost = ingredientsWithCosts.reduce((sum, ing) => sum + ing.lineCost, 0);

            Object.assign(recipe, {
                ...data,
                ingredients: ingredientsWithCosts,
                totalRecipeCost: totalCost,
                linkedProductIds: data.linkedProductIds !== undefined ? data.linkedProductIds : recipe.linkedProductIds,
                usedByProductCount: data.linkedProductIds !== undefined ? data.linkedProductIds.length : (recipe.linkedProductIds?.length || 0),
                updatedAt: new Date().toISOString()
            });
        } else {
            Object.assign(recipe, {
                ...data,
                linkedProductIds: data.linkedProductIds !== undefined ? data.linkedProductIds : recipe.linkedProductIds,
                usedByProductCount: data.linkedProductIds !== undefined ? data.linkedProductIds.length : (recipe.linkedProductIds?.length || 0),
                updatedAt: new Date().toISOString()
            });
        }

        return Promise.resolve(recipe);
    },

    delete: (id: string) => {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return Promise.reject(new Error('Recipe not found'));

        // Cannot delete if attached to products
        if (recipe.usedByProductCount > 0) {
            return Promise.reject(new Error('Cannot delete recipe attached to products'));
        }

        recipes = recipes.filter(r => r.id !== id);
        return Promise.resolve(true);
    },

    duplicate: (id: string) => {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return Promise.reject(new Error('Recipe not found'));

        const newRecipe: Recipe = {
            ...recipe,
            id: generateId('REC'),
            name: `${recipe.name} (Copy)`,
            usedByProductCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        recipes.push(newRecipe);
        return Promise.resolve(newRecipe);
    }
};

// ====================================================
// VENDORS
// ====================================================

export const vendorService = {
    getAll: () => Promise.resolve([...vendors]),

    getById: (id: string) => {
        const vendor = vendors.find(v => v.id === id);
        return Promise.resolve(vendor || null);
    },

    create: (data: CreateVendorDTO) => {
        const newVendor: Vendor = {
            id: generateId('VEN'),
            ...data,
            totalPurchases: 0,
            totalPaid: 0,
            totalDue: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        vendors.push(newVendor);
        return Promise.resolve(newVendor);
    },

    update: (id: string, data: Partial<CreateVendorDTO>) => {
        const vendor = vendors.find(v => v.id === id);
        if (!vendor) return Promise.reject(new Error('Vendor not found'));

        Object.assign(vendor, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        return Promise.resolve(vendor);
    },

    delete: (id: string) => {
        // Check if vendor has any entries
        const hasEntries = inventoryEntries.some(e => e.supplierId === id);
        if (hasEntries) {
            return Promise.reject(new Error('Cannot delete vendor with existing entries'));
        }

        vendors = vendors.filter(v => v.id !== id);
        return Promise.resolve(true);
    },

    getVendorEntries: (vendorId: string) => {
        const entries = inventoryEntries.filter(e => e.supplierId === vendorId);
        return Promise.resolve(entries);
    }
};

// ====================================================
// RETURNS
// ====================================================

export const returnService = {
    getAll: (filters?: { returnType?: string; dateFrom?: string; dateTo?: string; supplierId?: string }) => {
        let filtered = [...inventoryReturns];

        if (filters?.returnType) {
            filtered = filtered.filter(r => r.returnType === filters.returnType);
        }
        if (filters?.supplierId) {
            filtered = filtered.filter(r => r.supplierId === filters.supplierId);
        }
        if (filters?.dateFrom) {
            filtered = filtered.filter(r => new Date(r.returnDate) >= new Date(filters.dateFrom!));
        }
        if (filters?.dateTo) {
            filtered = filtered.filter(r => new Date(r.returnDate) <= new Date(filters.dateTo!));
        }

        return Promise.resolve(filtered);
    },


    getById: (id: string) => {
        const ret = inventoryReturns.find(r => r.id === id);
        return Promise.resolve(ret || null);
    },

    create: (data: CreateInventoryReturnDTO, userId: string, userName: string) => {
        const newReturn: InventoryReturn = {
            id: generateId('IR'),
            referenceNo: generateReferenceNo('RET'),
            returnType: data.returnType,
            supplierId: data.supplierId,
            supplierName: data.supplierId ? vendors.find(v => v.id === data.supplierId)?.name : undefined,
            storeId: data.storeId,
            storeName: 'Main Store',
            returnDate: data.returnDate,
            products: data.products.map(p => ({
                ...p,
                id: generateId('IRP'),
                inventoryItemName: inventoryItems.find(i => i.id === p.inventoryItemId)?.name || ''
            })),
            totalAmount: data.products.reduce((sum, p) => sum + p.lineTotal, 0),
            reason: data.reason,
            createdBy: userId,
            createdByName: userName,
            createdAt: new Date().toISOString()
        };

        // Reduce stock immediately
        newReturn.products.forEach(product => {
            const item = inventoryItems.find(i => i.id === product.inventoryItemId);
            if (item) {
                item.currentStock -= product.returnQuantity;
                item.updatedAt = new Date().toISOString();

                // Create ledger entry
                const ledgerEntry: InventoryLedgerEntry = {
                    id: generateId('LED'),
                    inventoryItemId: item.id,
                    inventoryItemName: item.name,
                    changeQuantity: -product.returnQuantity,
                    sourceType: 'return',
                    sourceId: newReturn.id,
                    sourceReference: newReturn.referenceNo,
                    storeId: newReturn.storeId,
                    storeName: newReturn.storeName,
                    balanceAfter: item.currentStock,
                    createdAt: new Date().toISOString()
                };
                inventoryLedger.push(ledgerEntry);
            }
        });

        inventoryReturns.push(newReturn);
        return Promise.resolve(newReturn);
    }
};

// Export reset function for testing
export const resetMockData = () => {
    inventoryEntries = [...mockInventoryEntries];
    inventoryItems = [...mockInventoryItems];
    recipes = [...mockRecipes];
    vendors = [...mockVendors];
    inventoryReturns = [...mockInventoryReturns];
    inventoryLedger = [...mockInventoryLedger];
};
