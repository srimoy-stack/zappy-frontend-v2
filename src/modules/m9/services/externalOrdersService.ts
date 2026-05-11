import { ExternalOrder } from '../types/external-orders';

const MOCK_ORDERS: ExternalOrder[] = [
    {
        id: 'eo-1',
        externalOrderId: 'UE-992-4412',
        provider: 'UBER_EATS',
        status: 'NORMALIZED',
        rejectCode: null,
        rejectMessage: null,
        receivedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        storeId: 'store-01',
        storeName: 'Downtown Kitchen',
        customerName: 'Arjun Mehta',
        totalAmount: 825.50,
        normalizationAttempt: {
            attemptedAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
            success: true,
            resolvedItems: 4,
            unresolvedItems: []
        },
        isArchived: false,
        rawPayload: {
            order_id: 'UE-992-4412',
            restaurant_id: 'uber-dt-992',
            currency: 'INR',
            items: [
                { external_id: 'ext-i4', name: 'Farmhouse Special', qty: 1, price: 449 },
                { external_id: 'ext-v1', name: 'Small', qty: 1, price: 0 }
            ],
            customer: { name: 'Arjun Mehta', phone: '+91-9876543210' },
            delivery_address: '12A Connaught Place, New Delhi',
            subtotal: 449,
            taxes: 76.5,
            delivery_fee: 300,
            total: 825.5
        }
    },
    {
        id: 'eo-2',
        externalOrderId: 'UE-881-3301',
        provider: 'UBER_EATS',
        status: 'REJECTED',
        rejectCode: 'ITEM_NOT_MAPPED',
        rejectMessage: 'External item ID ext-z99 has no mapping in Zyappy catalog.',
        receivedAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
        storeId: 'store-01',
        storeName: 'Downtown Kitchen',
        customerName: 'Priya Sharma',
        totalAmount: 512.00,
        normalizationAttempt: {
            attemptedAt: new Date(Date.now() - 1000 * 60 * 33).toISOString(),
            success: false,
            resolvedItems: 1,
            unresolvedItems: ['Spicy Chicken Wrap', 'Extra Sauce'],
            error: 'Could not resolve 2 items against Zyappy catalog v3.1'
        },
        isArchived: false,
        rawPayload: {
            order_id: 'UE-881-3301',
            restaurant_id: 'uber-dt-992',
            currency: 'INR',
            items: [
                { external_id: 'ext-i1', name: 'Original Burger', qty: 1, price: 299 },
                { external_id: 'ext-z99', name: 'Spicy Chicken Wrap', qty: 1, price: 179 },
                { external_id: 'ext-s01', name: 'Extra Sauce', qty: 2, price: 17 }
            ],
            customer: { name: 'Priya Sharma', phone: '+91-9123400000' },
            delivery_address: '88 Hauz Khas Village, New Delhi',
            subtotal: 512,
            taxes: 87.04,
            delivery_fee: 0,
            total: 599.04
        }
    },
    {
        id: 'eo-3',
        externalOrderId: 'DD-5520-7741',
        provider: 'DOORDASH',
        status: 'REJECTED',
        rejectCode: 'PRICE_MISMATCH',
        rejectMessage: 'Item "Classic Cheezy Pizza" price from DoorDash ($8.99) differs from Zyappy catalog (INR 549).',
        receivedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        storeId: 'store-01',
        storeName: 'Downtown Kitchen',
        customerName: 'Rohan Verma',
        totalAmount: 990.00,
        normalizationAttempt: {
            attemptedAt: new Date(Date.now() - 1000 * 60 * 89).toISOString(),
            success: false,
            resolvedItems: 0,
            unresolvedItems: ['Classic Cheezy Pizza'],
            error: 'Price normalization failed: currency/price discrepancy detected.'
        },
        isArchived: false,
        rawPayload: {
            order_id: 'DD-5520-7741',
            store_id: 'dd-dt-221',
            currency: 'USD',
            items: [
                { menu_item_id: 'ext-i2', name: 'Classic Cheezy Pizza', quantity: 2, unit_price: 8.99 }
            ],
            consumer: { first_name: 'Rohan', last_name: 'Verma', phone: '+91-8800123456' },
            dropoff_address: { street: '14 Lodhi Colony', city: 'New Delhi' },
            subtotal: 17.98,
            tax: 1.44,
            delivery_charge: 3,
            order_total: 22.42
        }
    },
    {
        id: 'eo-4',
        externalOrderId: 'UE-774-9910',
        provider: 'UBER_EATS',
        status: 'RECEIVED',
        rejectCode: null,
        rejectMessage: null,
        receivedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        storeId: 'store-02',
        storeName: 'Uptown Express',
        customerName: 'Ananya Singh',
        totalAmount: 340.00,
        normalizationAttempt: null,
        isArchived: false,
        rawPayload: {
            order_id: 'UE-774-9910',
            restaurant_id: 'uber-up-441',
            currency: 'INR',
            items: [
                { external_id: 'ext-i3', name: 'Veggie Supreme', qty: 1, price: 340 }
            ],
            customer: { name: 'Ananya Singh', phone: '+91-9011122233' },
            delivery_address: '5 Patel Nagar, New Delhi',
            subtotal: 340,
            taxes: 57.8,
            delivery_fee: 49,
            total: 446.8
        }
    },
    {
        id: 'eo-5',
        externalOrderId: 'DD-4401-0023',
        provider: 'DOORDASH',
        status: 'CANCELLED',
        rejectCode: null,
        rejectMessage: 'Order cancelled by customer before normalization.',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        storeId: 'store-02',
        storeName: 'Uptown Express',
        customerName: 'Karan Bose',
        totalAmount: 680.00,
        normalizationAttempt: null,
        isArchived: false,
        rawPayload: {
            order_id: 'DD-4401-0023',
            store_id: 'dd-up-889',
            currency: 'INR',
            items: [
                { menu_item_id: 'ext-i4', name: 'Farmhouse Special', quantity: 2, unit_price: 340 }
            ],
            consumer: { first_name: 'Karan', last_name: 'Bose', phone: '+91-7890001234' },
            order_total: 680
        }
    }
];

let store = [...MOCK_ORDERS];

export const externalOrdersService = {
    getOrders: async (): Promise<ExternalOrder[]> => {
        await new Promise(r => setTimeout(r, 700));
        return store.filter(o => !o.isArchived);
    },

    retryNormalization: async (orderId: string): Promise<ExternalOrder> => {
        await new Promise(r => setTimeout(r, 1500));
        store = store.map(o => {
            if (o.id !== orderId) return o;
            // Mock: simulate a successful retry
            return {
                ...o,
                status: 'NORMALIZED',
                rejectCode: null,
                rejectMessage: null,
                normalizationAttempt: {
                    attemptedAt: new Date().toISOString(),
                    success: true,
                    resolvedItems: 3,
                    unresolvedItems: []
                }
            };
        });
        return store.find(o => o.id === orderId)!;
    },

    archiveOrder: async (orderId: string): Promise<void> => {
        await new Promise(r => setTimeout(r, 600));
        store = store.map(o => o.id === orderId ? { ...o, isArchived: true } : o);
    }
};
