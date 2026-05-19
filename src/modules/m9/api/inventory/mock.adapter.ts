import { InventoryAdapter } from './inventory.interface';
import {
    mockInventoryEntries,
    mockInventoryItems,
    mockRecipes,
    mockVendors,
    mockInventoryReturns,
    mockInventoryLedger
} from '../../mock/inventory';

// Simple in-memory persistence using sessionStorage for dev stability
const getStore = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const data = sessionStorage.getItem(`inventory_${key}`);
    return data ? JSON.parse(data) : fallback;
};

const setStore = (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`inventory_${key}`, JSON.stringify(data));
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockInventoryAdapter: InventoryAdapter = {
    async getEntries(_filters) {
        await delay(500);
        let entries = getStore('entries', mockInventoryEntries);
        // Apply filters here if needed
        return entries;
    },

    async getEntry(id) {
        await delay(300);
        const entries = getStore('entries', mockInventoryEntries);
        return entries.find(e => e.id === id) || null;
    },

    async createEntry(data) {
        await delay(500);
        const entries = getStore('entries', mockInventoryEntries);
        const vendors = getStore('vendors', mockVendors);
        const newEntry = {
            id: `IE${Date.now()}`,
            ...data,
            supplierName: vendors.find(v => v.id === data.supplierId)?.name || '',
            grandTotal: data.products.reduce((s, p) => s + p.lineTotal, 0) + (data.purchaseTax || 0) + (data.shippingCharges || 0),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as any;
        entries.unshift(newEntry);
        setStore('entries', entries);
        return newEntry;
    },

    async updateEntry(id, data) {
        await delay(500);
        const entries = getStore('entries', mockInventoryEntries);
        const idx = entries.findIndex(e => e.id === id);
        if (idx === -1) throw new Error('Entry not found');
        entries[idx] = { ...entries[idx]!, ...data, updatedAt: new Date().toISOString() } as typeof entries[number];
        setStore('entries', entries);
        return entries[idx]!;
    },

    async deleteEntry(id) {
        await delay(300);
        let entries = getStore('entries', mockInventoryEntries);
        entries = entries.filter(e => e.id !== id);
        setStore('entries', entries);
    },

    async receiveInventory(id) {
        await delay(500);
        const entries = getStore('entries', mockInventoryEntries);
        const items = getStore('items', mockInventoryItems);
        const entry = entries.find(e => e.id === id);
        if (!entry) throw new Error('Entry not found');
        
        entry.inventoryStatus = 'Received';
        entry.updatedAt = new Date().toISOString();

        // Update items stock
        entry.products.forEach(p => {
            const item = items.find(i => i.id === p.inventoryItemId);
            if (item) {
                item.currentStock += p.purchaseQuantity;
                item.updatedAt = new Date().toISOString();
            }
        });

        setStore('entries', entries);
        setStore('items', items);
        return entry;
    },

    // Items
    async getItems(filters) {
        await delay(400);
        return getStore('items', mockInventoryItems);
    },

    async getItem(id) {
        await delay(200);
        return getStore('items', mockInventoryItems).find(i => i.id === id) || null;
    },

    async createItem(data) {
        await delay(400);
        const items = getStore('items', mockInventoryItems);
        const newItem = {
            id: `INV${Date.now()}`,
            ...data,
            currentStock: 0,
            averageCost: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as any;
        items.push(newItem);
        setStore('items', items);
        return newItem;
    },

    async updateItem(id, data) {
        await delay(400);
        const items = getStore('items', mockInventoryItems);
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1) throw new Error('Item not found');
        items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
        setStore('items', items);
        return items[idx];
    },

    async adjustStock(id, quantity, reason) {
        await delay(300);
        const items = getStore('items', mockInventoryItems);
        const item = items.find(i => i.id === id);
        if (!item) throw new Error('Item not found');
        item.currentStock += quantity;
        item.updatedAt = new Date().toISOString();
        setStore('items', items);
        return item;
    },

    // Recipes
    async getRecipes(filters) {
        await delay(500);
        return getStore('recipes', mockRecipes);
    },

    async getRecipe(id) {
        await delay(300);
        return getStore('recipes', mockRecipes).find(r => r.id === id) || null;
    },

    async createRecipe(data) {
        await delay(500);
        const recipes = getStore('recipes', mockRecipes);
        const newRecipe = {
            id: `REC${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as any;
        recipes.push(newRecipe);
        setStore('recipes', recipes);
        return newRecipe;
    },

    async updateRecipe(id, data) {
        await delay(500);
        const recipes = getStore('recipes', mockRecipes);
        const idx = recipes.findIndex(r => r.id === id);
        if (idx === -1) throw new Error('Recipe not found');
        recipes[idx] = { ...recipes[idx]!, ...data, updatedAt: new Date().toISOString() } as typeof recipes[number];
        setStore('recipes', recipes);
        return recipes[idx]!;
    },

    async deleteRecipe(id) {
        await delay(300);
        let recipes = getStore('recipes', mockRecipes);
        recipes = recipes.filter(r => r.id !== id);
        setStore('recipes', recipes);
    },

    // Vendors
    async getVendors() {
        await delay(400);
        return getStore('vendors', mockVendors);
    },

    async getVendor(id) {
        await delay(200);
        return getStore('vendors', mockVendors).find(v => v.id === id) || null;
    },

    async createVendor(data) {
        await delay(400);
        const vendors = getStore('vendors', mockVendors);
        const newVendor = {
            id: `VEN${Date.now()}`,
            ...data,
            totalPurchases: 0,
            totalPaid: 0,
            totalDue: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as any;
        vendors.push(newVendor);
        setStore('vendors', vendors);
        return newVendor;
    },

    async updateVendor(id, data) {
        await delay(400);
        const vendors = getStore('vendors', mockVendors);
        const idx = vendors.findIndex(v => v.id === id);
        if (idx === -1) throw new Error('Vendor not found');
        vendors[idx] = { ...vendors[idx], ...data, updatedAt: new Date().toISOString() };
        setStore('vendors', vendors);
        return vendors[idx];
    },

    async deleteVendor(id) {
        await delay(300);
        let vendors = getStore('vendors', mockVendors);
        vendors = vendors.filter(v => v.id !== id);
        setStore('vendors', vendors);
    },

    // Returns
    async getReturns(filters) {
        await delay(400);
        return getStore('returns', mockInventoryReturns);
    },

    async createReturn(data) {
        await delay(500);
        const returns = getStore('returns', mockInventoryReturns);
        const newReturn = {
            id: `IR${Date.now()}`,
            ...data,
            totalAmount: data.products.reduce((s, p) => s + p.lineTotal, 0),
            createdAt: new Date().toISOString()
        } as any;
        returns.unshift(newReturn);
        setStore('returns', returns);
        return newReturn;
    },

    // Ledger
    async getLedger(itemId) {
        await delay(300);
        return getStore('ledger', mockInventoryLedger).filter(l => l.inventoryItemId === itemId);
    }
};
