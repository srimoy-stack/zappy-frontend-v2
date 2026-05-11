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
    CreateInventoryReturnDTO
} from '../../types/inventory';

export interface InventoryAdapter {
    // Entries
    getEntries(filters?: any): Promise<InventoryEntry[]>;
    getEntry(id: string): Promise<InventoryEntry | null>;
    createEntry(data: CreateInventoryEntryDTO): Promise<InventoryEntry>;
    updateEntry(id: string, data: Partial<CreateInventoryEntryDTO>): Promise<InventoryEntry>;
    deleteEntry(id: string): Promise<void>;
    receiveInventory(id: string): Promise<InventoryEntry>;

    // Items
    getItems(filters?: any): Promise<InventoryItem[]>;
    getItem(id: string): Promise<InventoryItem | null>;
    createItem(data: CreateInventoryItemDTO): Promise<InventoryItem>;
    updateItem(id: string, data: Partial<CreateInventoryItemDTO>): Promise<InventoryItem>;
    adjustStock(id: string, quantity: number, reason: string): Promise<InventoryItem>;

    // Recipes
    getRecipes(filters?: any): Promise<Recipe[]>;
    getRecipe(id: string): Promise<Recipe | null>;
    createRecipe(data: CreateRecipeDTO): Promise<Recipe>;
    updateRecipe(id: string, data: Partial<CreateRecipeDTO>): Promise<Recipe>;
    deleteRecipe(id: string): Promise<void>;

    // Vendors
    getVendors(): Promise<Vendor[]>;
    getVendor(id: string): Promise<Vendor | null>;
    createVendor(data: CreateVendorDTO): Promise<Vendor>;
    updateVendor(id: string, data: Partial<CreateVendorDTO>): Promise<Vendor>;
    deleteVendor(id: string): Promise<void>;

    // Returns
    getReturns(filters?: any): Promise<InventoryReturn[]>;
    createReturn(data: CreateInventoryReturnDTO): Promise<InventoryReturn>;

    // Ledger
    getLedger(itemId: string): Promise<InventoryLedgerEntry[]>;
}
