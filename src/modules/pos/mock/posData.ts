import { POSUser, POSStore } from '../types/pos';

export const mockPOSUsers: POSUser[] = [
    {
        id: 'U001',
        name: 'John Store Manager',
        role: 'STORE_MANAGER',
        accessibleStores: ['S001', 'S002']
    },
    {
        id: 'U002',
        name: 'Sarah Store Staff',
        role: 'STAFF',
        accessibleStores: ['S001']
    },
    {
        id: 'U003',
        name: 'Alex Call center',
        role: 'CALL_CENTER_AGENT',
        accessibleStores: ['S001', 'S002', 'S003']
    }
];

export const mockStores: POSStore[] = [
    {
        id: 'S001',
        name: 'Downtown Main Store',
        address: '123 Main St, Central City'
    },
    {
        id: 'S002',
        name: 'Westside Branch',
        address: '456 West Ave, Central City'
    },
    {
        id: 'S003',
        name: 'Eastside Express',
        address: '789 East Blvd, Central City'
    }
];

export const VALID_STORE_PINS: Record<string, string> = {
    '1234': 'U001',
    '5678': 'U002'
};

export const VALID_CALL_CENTER_USERS: Record<string, { userId: string; password: string }> = {
    'alex@zyappy.com': { userId: 'U003', password: 'password123' }
};

export const mockRecentOrders = [
    { id: 'ORD-5501', time: '10:45 AM', customer: 'Walk-in', amount: 45.50, status: 'Completed', type: 'Dine-In' },
    { id: 'ORD-5502', time: '11:15 AM', customer: 'Sarah Parker', amount: 22.00, status: 'Pending', type: 'Pickup' },
    { id: 'ORD-5503', time: '11:45 AM', customer: 'James Miller', amount: 68.25, status: 'Out for Delivery', type: 'Delivery' },
    { id: 'ORD-5504', time: '12:05 PM', customer: 'Walk-in', amount: 15.00, status: 'Completed', type: 'Dine-In' },
    { id: 'ORD-5505', time: '12:30 PM', customer: 'David Wilson', amount: 35.50, status: 'Cancelled', type: 'Phone Order' },
];

export const mockIncomingCall = {
    number: '+1 (555) 012-3456',
    caller: 'Jessica Pearson',
    location: 'Central City',
    isLoyaltyMember: true,
    customerId: 'CUST-001'
};

export interface POSCustomer {
    id: string;
    name: string;
    phone: string;
    email: string;
    loyaltyPoints: number;
    tier?: string;
    notes: string;
    addresses: {
        id: string;
        label: string;
        type: string;
        street: string;
        text: string;
        isDefault: boolean;
    }[];
    recentOrders: {
        id: string;
        date: string;
        amount: number;
        items: string;
        type?: string;
    }[];
}

export const mockPOSCustomers: POSCustomer[] = [
    {
        id: 'CUST-001',
        name: 'Jessica Pearson',
        phone: '+1 (555) 012-3456',
        email: 'jessica@pearsonhardman.com',
        loyaltyPoints: 1250,
        notes: 'Very Important Person. Prefers high-floor delivery.',
        addresses: [
            { id: 'addr1', label: 'Office', type: 'OFFICE', street: '601 5th Ave', text: '601 5th Ave, New York, NY 10017', isDefault: true },
            { id: 'addr2', label: 'Home', type: 'HOME', street: '78-10 34th Ave', text: '78-10 34th Ave, Jackson Heights, NY 11372', isDefault: false }
        ],
        recentOrders: [
            { id: 'ORD-4401', date: '2024-02-01', amount: 45.00, items: '2x Truffle Pizza, 1x Coke' },
            { id: 'ORD-4102', date: '2024-01-15', amount: 22.50, items: '1x Margherita' }
        ]
    },
    {
        id: 'CUST-002',
        name: 'Harvey Specter',
        phone: '+1 (555) 987-6543',
        email: 'harvey@specter.com',
        loyaltyPoints: 850,
        notes: 'Always orders extra sauce.',
        addresses: [
            { id: 'addr3', label: 'Office', type: 'OFFICE', street: '500 Madison Ave', text: '500 Madison Ave, New York, NY 10022', isDefault: true }
        ],
        recentOrders: [
            { id: 'ORD-4390', date: '2024-01-29', amount: 68.00, items: '3x Pepperoni Pizza' }
        ]
    },
    {
        id: 'CUST-003',
        name: 'Mike Ross',
        phone: '+1 (444) 123-4567',
        email: 'mross@psls.com',
        loyaltyPoints: 300,
        notes: 'Quick pickup customer.',
        addresses: [],
        recentOrders: []
    }
];

export const mockPOSCategories = [
    { id: 'cat1', name: 'Pizza' },
    { id: 'cat5', name: 'Combos' },
    { id: 'cat2', name: 'Sides' },
    { id: 'cat3', name: 'Drinks' },
    { id: 'cat4', name: 'Desserts' },
    { id: 'cat6', name: 'Offers' }
];

const sharedPizzaModifiers = [
    {
        id: 'mod1',
        name: 'Extra Toppings',
        options: [
            { id: 'top1', name: 'Pepperoni', price: 2.50 },
            { id: 'top2', name: 'Extra Cheese', price: 2.00 },
            { id: 'top3', name: 'Mushrooms', price: 1.50 },
            { id: 'top4', name: 'Onions', price: 1.00 },
        ]
    }
];

const pizzaVariants = [
    {
        id: 'var1',
        name: 'Size',
        options: [
            { id: 's1', name: 'Small', additionalPrice: 0 },
            { id: 's2', name: 'Medium', additionalPrice: 5, isDefault: true },
            { id: 's3', name: 'Large', additionalPrice: 8 },
            { id: 's4', name: 'Extra Large', additionalPrice: 12 },
        ]
    },
    {
        id: 'var2',
        name: 'Crust / Style',
        options: [
            { id: 'c1', name: 'New York Style', additionalPrice: 0, isDefault: true },
            { id: 'c2', name: 'Stuffed Crust', additionalPrice: 3 },
            { id: 'c3', name: 'Thin Crust', additionalPrice: 0 },
        ]
    },
    {
        id: 'var3',
        name: 'Dough',
        options: [
            { id: 'd1', name: 'Original Hand Tossed', additionalPrice: 0, isDefault: true },
            { id: 'd2', name: 'Pan Dough', additionalPrice: 1.50 },
            { id: 'd3', name: 'Thin & Crispy', additionalPrice: 0 },
        ]
    },
    {
        id: 'var4',
        name: 'Portion Type',
        options: [
            { id: 'pt1', name: 'Full', additionalPrice: 0, isDefault: true },
            { id: 'pt2', name: 'Half (Split)', additionalPrice: 0 },
        ]
    }
];

const margheritaModifiers = [
    {
        id: 'mg-sauce',
        name: 'Sauce',
        minSelection: 1,
        maxSelection: 1,
        options: [
            { id: 'opt-tomato', name: 'Tomato Sauce', price: 0, isDefault: true },
            { id: 'opt-bbq', name: 'BBQ Sauce', price: 1.00 },
        ]
    },
    {
        id: 'mg-cheese',
        name: 'Cheese',
        minSelection: 1,
        maxSelection: 1,
        options: [
            { id: 'opt-mozzarella', name: 'Mozzarella', price: 0, isDefault: true },
            { id: 'opt-vegan', name: 'Vegan Cheese', price: 2.00 },
        ]
    },
    {
        id: 'mg-toppings-preset',
        name: 'Toppings',
        options: [
            { id: 'opt-basil', name: 'Basil', price: 0, isDefault: true },
            { id: 'opt-oregano', name: 'Oregano', price: 0, isDefault: true },
            { id: 'opt-olive-oil', name: 'Olive Oil', price: 0, isDefault: true },
            { id: 'opt-garlic', name: 'Garlic Paste', price: 0, isDefault: true },
        ]
    },
    {
        id: 'mod1',
        name: 'Extra Toppings',
        options: [
            { id: 'top1', name: 'Pepperoni', price: 2.50 },
            { id: 'top2', name: 'Extra Cheese', price: 2.00 },
            { id: 'top3', name: 'Mushrooms', price: 1.50 },
            { id: 'top4', name: 'Onions', price: 1.00 },
        ]
    }
];

export const mockPOSProducts = [
    {
        id: 'p1',
        categoryId: 'cat1',
        name: 'Margherita Dream',
        sku: 'PIZ-001',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
        hasVariants: true,
        isVeg: true,
        isAvailable: true,
        variantGroups: pizzaVariants,
        modifierGroups: margheritaModifiers
    },
    {
        id: 'p2',
        categoryId: 'cat1',
        name: 'Truffle Mushroom',
        sku: 'PIZ-002',
        price: 24.00,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        hasVariants: true,
        isVeg: true,
        isAvailable: true,
        variantGroups: pizzaVariants,
        modifierGroups: sharedPizzaModifiers
    },
    {
        id: 'p3',
        categoryId: 'cat1',
        name: 'Spicy Pepperoni',
        sku: 'PIZ-003',
        price: 21.00,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        hasVariants: true,
        isVeg: false,
        isAvailable: true,
        variantGroups: pizzaVariants,
        modifierGroups: sharedPizzaModifiers
    },
    { id: 'p4', categoryId: 'cat2', name: 'Garlic Knots', sku: 'SID-001', price: 8.50, image: 'https://images.unsplash.com/photo-1619531003508-364e7978939c?auto=format&fit=crop&w=800&q=80', hasVariants: false, isVeg: true, isAvailable: true },
    { id: 'p5', categoryId: 'cat3', name: 'Craft Root Beer', sku: 'BEV-001', price: 4.50, image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&w=800&q=80', hasVariants: false, isVeg: true, isAvailable: true },
    {
        id: 'p6',
        categoryId: 'cat5',
        name: 'Triple Treat Combo',
        sku: 'COM-001',
        price: 45.00,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        hasVariants: true,
        isVeg: false,
        isAvailable: true,
        isCombo: true,
        comboSlots: [
            { id: 'slot1', name: 'Pizza 1', allowedCategoryIds: ['cat1'] },
            { id: 'slot2', name: 'Pizza 2', allowedCategoryIds: ['cat1'] },
            { id: 'slot3', name: 'Side', allowedCategoryIds: ['cat2'] },
            { id: 'slot4', name: 'Drink', allowedCategoryIds: ['cat3'] },
        ]
    }
];

export const mockPOSAreas = [
    { id: 'AREA1', name: 'Main Floor' },
    { id: 'AREA2', name: 'Outdoor Terrace' },
    { id: 'AREA3', name: 'Executive Lounge' },
    { id: 'AREA4', name: 'Rooftop Bar' }
];

export const mockPOSTables = [
    // === Main Floor: Dense Tile Grid ===
    // Row 1
    { id: 'T1', name: 'T-1', seats: 2, status: 'FREE', areaId: 'AREA1', x: 5, y: 5, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T2', name: 'T-2', seats: 2, status: 'OCCUPIED', areaId: 'AREA1', x: 21, y: 5, width: 14, height: 14, shape: 'rectangle', durationMinutes: 12 },
    { id: 'T3', name: 'T-3', seats: 2, status: 'FREE', areaId: 'AREA1', x: 37, y: 5, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T4', name: 'T-4', seats: 4, status: 'FREE', areaId: 'AREA1', x: 53, y: 5, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T5', name: 'T-5', seats: 4, status: 'OCCUPIED', areaId: 'AREA1', x: 69, y: 5, width: 14, height: 14, shape: 'rectangle', durationMinutes: 45 },
    { id: 'T6', name: 'T-6', seats: 4, status: 'FREE', areaId: 'AREA1', x: 85, y: 5, width: 14, height: 14, shape: 'rectangle' },

    // Row 2
    { id: 'T7', name: 'T-7', seats: 2, status: 'FREE', areaId: 'AREA1', x: 5, y: 23, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T8', name: 'T-8', seats: 2, status: 'FREE', areaId: 'AREA1', x: 21, y: 23, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T9', name: 'T-9', seats: 4, status: 'OCCUPIED', areaId: 'AREA1', x: 37, y: 23, width: 14, height: 14, shape: 'rectangle', durationMinutes: 30 },
    { id: 'T10', name: 'T-10', seats: 4, status: 'FREE', areaId: 'AREA1', x: 53, y: 23, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T11', name: 'T-11', seats: 4, status: 'FREE', areaId: 'AREA1', x: 69, y: 23, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T12', name: 'T-12', seats: 4, status: 'OCCUPIED', areaId: 'AREA1', x: 85, y: 23, width: 14, height: 14, shape: 'rectangle', durationMinutes: 5 },

    // Row 3
    { id: 'T13', name: 'T-13', seats: 4, status: 'FREE', areaId: 'AREA1', x: 5, y: 41, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T14', name: 'T-14', seats: 4, status: 'FREE', areaId: 'AREA1', x: 21, y: 41, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T15', name: 'T-15', seats: 6, status: 'RESERVED', areaId: 'AREA1', x: 37, y: 41, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T16', name: 'T-16', seats: 6, status: 'FREE', areaId: 'AREA1', x: 53, y: 41, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T17', name: 'T-17', seats: 4, status: 'OCCUPIED', areaId: 'AREA1', x: 69, y: 41, width: 14, height: 14, shape: 'rectangle', durationMinutes: 60 },
    { id: 'T18', name: 'T-18', seats: 4, status: 'FREE', areaId: 'AREA1', x: 85, y: 41, width: 14, height: 14, shape: 'rectangle' },

    // Row 4
    { id: 'T19', name: 'T-19', seats: 4, status: 'FREE', areaId: 'AREA1', x: 5, y: 59, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T20', name: 'T-20', seats: 4, status: 'FREE', areaId: 'AREA1', x: 21, y: 59, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T21', name: 'T-21', seats: 6, status: 'FREE', areaId: 'AREA1', x: 37, y: 59, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T22', name: 'T-22', seats: 6, status: 'FREE', areaId: 'AREA1', x: 53, y: 59, width: 14, height: 14, shape: 'rectangle' },
    { id: 'T23', name: 'T-23', seats: 4, status: 'OCCUPIED', areaId: 'AREA1', x: 69, y: 59, width: 14, height: 14, shape: 'rectangle', durationMinutes: 22 },
    { id: 'T24', name: 'T-24', seats: 4, status: 'FREE', areaId: 'AREA1', x: 85, y: 59, width: 14, height: 14, shape: 'rectangle' },

    // Row 5 - Booths/Large
    { id: 'B1', name: 'Booth 1', seats: 8, status: 'FREE', areaId: 'AREA1', x: 5, y: 77, width: 22, height: 18, shape: 'rectangle' },
    { id: 'B2', name: 'Booth 2', seats: 8, status: 'FREE', areaId: 'AREA1', x: 29, y: 77, width: 22, height: 18, shape: 'rectangle' },
    { id: 'B3', name: 'Booth 3', seats: 8, status: 'OCCUPIED', areaId: 'AREA1', x: 53, y: 77, width: 22, height: 18, shape: 'rectangle', durationMinutes: 90 },
    { id: 'B4', name: 'Booth 4', seats: 8, status: 'FREE', areaId: 'AREA1', x: 77, y: 77, width: 22, height: 18, shape: 'rectangle' },

    // Rooftop Bar
    { id: 'RT1', name: 'Bar 1', seats: 2, status: 'FREE', areaId: 'AREA4', x: 20, y: 20, width: 70, height: 70, shape: 'circle' },
    { id: 'RT2', name: 'Bar 2', seats: 2, status: 'OCCUPIED', areaId: 'AREA4', x: 40, y: 20, width: 70, height: 70, shape: 'circle', durationMinutes: 15 },
    { id: 'RT3', name: 'VIP', seats: 8, status: 'RESERVED', areaId: 'AREA4', x: 60, y: 20, width: 150, height: 100, shape: 'rectangle', customerName: 'Party' },

    // Outdoor Terrace (Sample)
    { id: 'OD1', name: 'Deck 1', seats: 2, status: 'FREE', areaId: 'AREA2', x: 20, y: 20, width: 80, height: 80, shape: 'circle' },
    { id: 'OD2', name: 'Deck 2', seats: 2, status: 'OCCUPIED', areaId: 'AREA2', x: 40, y: 20, width: 80, height: 80, shape: 'circle', durationMinutes: 30 }
];
