/**
 * Mock Data for Inventory Module
 * Development-only data following strict schema
 */

import {
    Vendor,
    InventoryItem,
    InventoryEntry,
    InventoryReturn,
    Recipe,
    InventoryLedgerEntry
} from '../types/inventory';

// ====================================================
// VENDORS
// ====================================================

export const mockVendors: Vendor[] = [
    {
        id: 'VEN001',
        name: 'Fresh Produce Co.',
        contactPerson: 'John Smith',
        phone: '+1-555-0101',
        email: 'john@freshproduce.com',
        address: '123 Market Street, City, State 12345',
        totalPurchases: 45000,
        totalPaid: 40000,
        totalDue: 5000,
        lastInventoryDate: '2026-01-28T10:30:00Z',
        status: 'Active',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2026-01-28T10:30:00Z'
    },
    {
        id: 'VEN002',
        name: 'Dairy Delights Ltd.',
        contactPerson: 'Sarah Johnson',
        phone: '+1-555-0202',
        email: 'sarah@dairydelights.com',
        address: '456 Dairy Lane, City, State 12345',
        totalPurchases: 32000,
        totalPaid: 32000,
        totalDue: 0,
        lastInventoryDate: '2026-01-27T14:00:00Z',
        status: 'Active',
        createdAt: '2025-07-15T00:00:00Z',
        updatedAt: '2026-01-27T14:00:00Z'
    },
    {
        id: 'VEN003',
        name: 'Spice World Suppliers',
        contactPerson: 'Mike Chen',
        phone: '+1-555-0303',
        email: 'mike@spiceworld.com',
        address: '789 Spice Road, City, State 12345',
        totalPurchases: 18500,
        totalPaid: 15000,
        totalDue: 3500,
        lastInventoryDate: '2026-01-25T09:00:00Z',
        status: 'Active',
        createdAt: '2025-08-20T00:00:00Z',
        updatedAt: '2026-01-25T09:00:00Z'
    }
];

// ====================================================
// INVENTORY ITEMS (INGREDIENTS)
// ====================================================

export const mockInventoryItems: InventoryItem[] = [
    {
        id: 'INV001',
        name: 'Tomatoes',
        sku: 'VEG-TOM-001',
        baseUnit: 'Kilogram',
        currentStock: 45.5,
        averageCost: 3.50,
        lowStockThreshold: 20,
        status: 'Active',
        description: 'Fresh red tomatoes',
        tenantId: 'TENANT001',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2026-01-28T10:30:00Z'
    },
    {
        id: 'INV002',
        name: 'Mozzarella Cheese',
        sku: 'DAI-MOZ-001',
        baseUnit: 'Kilogram',
        currentStock: 12.0,
        averageCost: 8.75,
        lowStockThreshold: 10,
        status: 'Active',
        description: 'Premium mozzarella cheese',
        tenantId: 'TENANT001',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2026-01-27T14:00:00Z'
    },
    {
        id: 'INV003',
        name: 'Pizza Dough',
        sku: 'BAK-DOU-001',
        baseUnit: 'Kilogram',
        currentStock: 8.5,
        averageCost: 2.25,
        lowStockThreshold: 15,
        status: 'Active',
        description: 'Fresh pizza dough',
        tenantId: 'TENANT001',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2026-01-26T11:00:00Z'
    },
    {
        id: 'INV004',
        name: 'Olive Oil',
        sku: 'OIL-OLI-001',
        baseUnit: 'Liter',
        currentStock: 5.2,
        averageCost: 12.50,
        lowStockThreshold: 3,
        status: 'Active',
        description: 'Extra virgin olive oil',
        tenantId: 'TENANT001',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2026-01-25T09:00:00Z'
    },
    {
        id: 'INV005',
        name: 'Basil Leaves',
        sku: 'HRB-BAS-001',
        baseUnit: 'Gram',
        currentStock: 250,
        averageCost: 0.15,
        lowStockThreshold: 100,
        status: 'Active',
        description: 'Fresh basil leaves',
        tenantId: 'TENANT001',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2026-01-24T16:00:00Z'
    }
];

// ====================================================
// INVENTORY ENTRIES (STOCK INWARD)
// ====================================================

export const mockInventoryEntries: InventoryEntry[] = [
    {
        id: 'IE001',
        referenceNo: 'PO-2026-001',
        supplierId: 'VEN001',
        supplierName: 'Fresh Produce Co.',
        storeId: 'STORE001',
        storeName: 'Main Store',
        inventoryDate: '2026-01-28T10:30:00Z',
        inventoryStatus: 'Received',
        paymentStatus: 'Partial',
        payTerm: 'Net 30',
        products: [
            {
                id: 'IEP001',
                inventoryItemId: 'INV001',
                inventoryItemName: 'Tomatoes',
                sku: 'VEG-TOM-001',
                purchaseQuantity: 50,
                unitCostBeforeTax: 3.00,
                subtotal: 150.00,
                taxPercentage: 10,
                taxAmount: 15.00,
                unitCostAfterTax: 3.30,
                lineTotal: 165.00
            }
        ],
        purchaseTax: 15.00,
        shippingCharges: 10.00,
        additionalNotes: 'Delivery received in good condition',
        subtotal: 150.00,
        totalTax: 15.00,
        grandTotal: 175.00,
        paymentDue: 75.00,
        createdBy: 'USER001',
        createdByName: 'Admin User',
        createdAt: '2026-01-28T10:30:00Z',
        updatedAt: '2026-01-28T10:30:00Z'
    },
    {
        id: 'IE002',
        referenceNo: 'PO-2026-002',
        supplierId: 'VEN002',
        supplierName: 'Dairy Delights Ltd.',
        storeId: 'STORE001',
        storeName: 'Main Store',
        inventoryDate: '2026-01-27T14:00:00Z',
        inventoryStatus: 'Received',
        paymentStatus: 'Paid',
        payTerm: 'Cash on Delivery',
        products: [
            {
                id: 'IEP002',
                inventoryItemId: 'INV002',
                inventoryItemName: 'Mozzarella Cheese',
                sku: 'DAI-MOZ-001',
                purchaseQuantity: 15,
                unitCostBeforeTax: 8.00,
                subtotal: 120.00,
                taxPercentage: 5,
                taxAmount: 6.00,
                unitCostAfterTax: 8.40,
                lineTotal: 126.00
            }
        ],
        purchaseTax: 6.00,
        shippingCharges: 5.00,
        subtotal: 120.00,
        totalTax: 6.00,
        grandTotal: 131.00,
        paymentDue: 0,
        createdBy: 'USER001',
        createdByName: 'Admin User',
        createdAt: '2026-01-27T14:00:00Z',
        updatedAt: '2026-01-27T14:00:00Z'
    },
    {
        id: 'IE003',
        referenceNo: 'PO-2026-003',
        supplierId: 'VEN001',
        supplierName: 'Fresh Produce Co.',
        storeId: 'STORE001',
        storeName: 'Main Store',
        inventoryDate: '2026-01-26T09:00:00Z',
        inventoryStatus: 'Draft',
        paymentStatus: 'Unpaid',
        products: [
            {
                id: 'IEP003',
                inventoryItemId: 'INV003',
                inventoryItemName: 'Pizza Dough',
                sku: 'BAK-DOU-001',
                purchaseQuantity: 20,
                unitCostBeforeTax: 2.00,
                subtotal: 40.00,
                taxPercentage: 8,
                taxAmount: 3.20,
                unitCostAfterTax: 2.16,
                lineTotal: 43.20
            }
        ],
        purchaseTax: 3.20,
        shippingCharges: 0,
        subtotal: 40.00,
        totalTax: 3.20,
        grandTotal: 43.20,
        paymentDue: 43.20,
        createdBy: 'USER002',
        createdByName: 'Store Manager',
        createdAt: '2026-01-26T09:00:00Z',
        updatedAt: '2026-01-26T09:00:00Z'
    }
];

// ====================================================
// RECIPES
// ====================================================

export const mockRecipes: Recipe[] = [
    {
        id: 'REC001',
        name: 'Margherita Pizza Base',
        description: 'Classic margherita pizza recipe',
        status: 'Active',
        ingredients: [
            {
                id: 'RI001',
                inventoryItemId: 'INV003',
                inventoryItemName: 'Pizza Dough',
                baseUnit: 'Gram',
                quantityUsed: 250,
                unitCost: 2.25,
                wastagePercentage: 5,
                effectiveQuantity: 262.5,
                lineCost: 0.59
            },
            {
                id: 'RI002',
                inventoryItemId: 'INV001',
                inventoryItemName: 'Tomatoes',
                baseUnit: 'Gram',
                quantityUsed: 100,
                unitCost: 3.50,
                wastagePercentage: 10,
                effectiveQuantity: 110,
                lineCost: 0.39
            },
            {
                id: 'RI003',
                inventoryItemId: 'INV002',
                inventoryItemName: 'Mozzarella Cheese',
                baseUnit: 'Gram',
                quantityUsed: 150,
                unitCost: 8.75,
                wastagePercentage: 2,
                effectiveQuantity: 153,
                lineCost: 1.34
            },
            {
                id: 'RI004',
                inventoryItemId: 'INV005',
                inventoryItemName: 'Basil Leaves',
                baseUnit: 'Gram',
                quantityUsed: 10,
                unitCost: 0.15,
                wastagePercentage: 15,
                effectiveQuantity: 11.5,
                lineCost: 0.02
            }
        ],
        totalRecipeCost: 2.34,
        usedByProductCount: 3,
        tenantId: 'TENANT001',
        createdAt: '2025-06-15T00:00:00Z',
        updatedAt: '2026-01-20T10:00:00Z'
    },
    {
        id: 'REC002',
        name: 'Garlic Bread',
        description: 'Simple garlic bread recipe',
        status: 'Active',
        ingredients: [
            {
                id: 'RI005',
                inventoryItemId: 'INV003',
                inventoryItemName: 'Pizza Dough',
                baseUnit: 'Gram',
                quantityUsed: 150,
                unitCost: 2.25,
                wastagePercentage: 3,
                effectiveQuantity: 154.5,
                lineCost: 0.35
            },
            {
                id: 'RI006',
                inventoryItemId: 'INV004',
                inventoryItemName: 'Olive Oil',
                baseUnit: 'Milliliter',
                quantityUsed: 20,
                unitCost: 12.50,
                wastagePercentage: 0,
                effectiveQuantity: 20,
                lineCost: 0.25
            }
        ],
        totalRecipeCost: 0.60,
        usedByProductCount: 1,
        tenantId: 'TENANT001',
        createdAt: '2025-07-01T00:00:00Z',
        updatedAt: '2026-01-15T14:00:00Z'
    }
];

// ====================================================
// INVENTORY RETURNS
// ====================================================

export const mockInventoryReturns: InventoryReturn[] = [
    {
        id: 'IR001',
        referenceNo: 'RET-2026-001',
        returnType: 'Damaged',
        supplierId: 'VEN001',
        supplierName: 'Fresh Produce Co.',
        storeId: 'STORE001',
        storeName: 'Main Store',
        returnDate: '2026-01-29T11:00:00Z',
        products: [
            {
                id: 'IRP001',
                inventoryItemId: 'INV001',
                inventoryItemName: 'Tomatoes',
                sku: 'VEG-TOM-001',
                returnQuantity: 5,
                unitCost: 3.30,
                lineTotal: 16.50
            }
        ],
        totalAmount: 16.50,
        reason: 'Received damaged goods',
        createdBy: 'USER001',
        createdByName: 'Admin User',
        createdAt: '2026-01-29T11:00:00Z'
    },
    {
        id: 'IR002',
        referenceNo: 'RET-2026-002',
        returnType: 'Expired',
        storeId: 'STORE001',
        storeName: 'Main Store',
        returnDate: '2026-01-28T16:00:00Z',
        products: [
            {
                id: 'IRP002',
                inventoryItemId: 'INV002',
                inventoryItemName: 'Mozzarella Cheese',
                sku: 'DAI-MOZ-001',
                returnQuantity: 2,
                unitCost: 8.40,
                lineTotal: 16.80
            }
        ],
        totalAmount: 16.80,
        reason: 'Expired product',
        createdBy: 'USER002',
        createdByName: 'Store Manager',
        createdAt: '2026-01-28T16:00:00Z'
    }
];

// ====================================================
// INVENTORY LEDGER
// ====================================================

export const mockInventoryLedger: InventoryLedgerEntry[] = [
    {
        id: 'LED001',
        inventoryItemId: 'INV001',
        inventoryItemName: 'Tomatoes',
        changeQuantity: 50,
        sourceType: 'inventory',
        sourceId: 'IE001',
        sourceReference: 'PO-2026-001',
        storeId: 'STORE001',
        storeName: 'Main Store',
        balanceAfter: 50,
        createdAt: '2026-01-28T10:30:00Z'
    },
    {
        id: 'LED002',
        inventoryItemId: 'INV001',
        inventoryItemName: 'Tomatoes',
        changeQuantity: -5,
        sourceType: 'return',
        sourceId: 'IR001',
        sourceReference: 'RET-2026-001',
        storeId: 'STORE001',
        storeName: 'Main Store',
        balanceAfter: 45,
        createdAt: '2026-01-29T11:00:00Z'
    },
    {
        id: 'LED003',
        inventoryItemId: 'INV002',
        inventoryItemName: 'Mozzarella Cheese',
        changeQuantity: 15,
        sourceType: 'inventory',
        sourceId: 'IE002',
        sourceReference: 'PO-2026-002',
        storeId: 'STORE001',
        storeName: 'Main Store',
        balanceAfter: 15,
        createdAt: '2026-01-27T14:00:00Z'
    },
    {
        id: 'LED004',
        inventoryItemId: 'INV002',
        inventoryItemName: 'Mozzarella Cheese',
        changeQuantity: -2,
        sourceType: 'return',
        sourceId: 'IR002',
        sourceReference: 'RET-2026-002',
        storeId: 'STORE001',
        storeName: 'Main Store',
        balanceAfter: 13,
        createdAt: '2026-01-28T16:00:00Z'
    },
    {
        id: 'LED005',
        inventoryItemId: 'INV002',
        inventoryItemName: 'Mozzarella Cheese',
        changeQuantity: -1,
        sourceType: 'sale',
        sourceId: 'SALE001',
        sourceReference: 'ORD-2026-045',
        storeId: 'STORE001',
        storeName: 'Main Store',
        balanceAfter: 12,
        createdAt: '2026-01-29T12:30:00Z'
    }
];
