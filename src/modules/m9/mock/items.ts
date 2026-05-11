import { Category, Item } from '../types/items';

export const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Signature Pizza', description: 'Our chef special pizzas' },
    { id: 'cat-2', name: 'Traditional Pizza', description: 'Classic favorites' },
    { id: 'cat-3', name: 'Combos', description: 'Meal deals and family packs' },
    { id: 'cat-4', name: 'Drinks', description: 'Soft drinks and water' }
];

export const mockItems: Item[] = [
    {
        id: 'item-1',
        productType: 'SINGLE',
        name: 'Veggie Supreme',
        description: 'Loaded with fresh vegetables and mozzarella cheese.',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        categoryId: 'cat-1',
        isAvailable: true,
        variantGroups: [
            {
                id: 'vg-1',
                name: 'Size',
                isRequired: true,
                defaultVariantId: 'v-2',
                sortOrder: 1,
                variants: [
                    { id: 'v-1', name: 'Small (10")', basePrice: 9.99, isAvailable: true },
                    { id: 'v-2', name: 'Medium (12")', basePrice: 12.99, isAvailable: true },
                    { id: 'v-3', name: 'Large (14")', basePrice: 15.99, isAvailable: true },
                ]
            },
            {
                id: 'vg-2',
                name: 'Dough',
                isRequired: true,
                defaultVariantId: 'v-4',
                sortOrder: 2,
                variants: [
                    { id: 'v-4', name: 'Regular Dough', basePrice: 0, isAvailable: true },
                    { id: 'v-5', name: 'Thin Crust', basePrice: 0, isAvailable: true },
                    { id: 'v-6', name: 'Whole Wheat', basePrice: 1.50, isAvailable: true },
                ]
            }
        ],
        modifierGroups: [
            {
                id: 'mg-1',
                name: 'Sauce Options',
                isRequired: true,
                minSelection: 1,
                maxSelection: 1,
                isToppingGroup: false,
                isHalfAndHalfEnabled: false,
                isPremiumRuleEnabled: false,
                options: [
                    {
                        id: 'opt-1', name: 'Tomato Sauce', price: 0,
                        subOptions: [
                            { id: 'sub-1', name: 'Regular', price: 0 },
                            { id: 'sub-2', name: 'Easy on Sauce', price: 0 },
                            { id: 'sub-3', name: 'Extra Sauce', price: 0.50 },
                        ]
                    },
                    { id: 'opt-2', name: 'BBQ Sauce', price: 1.00 },
                    { id: 'opt-3', name: 'White Garlic', price: 1.00 }
                ]
            },
            {
                id: 'mg-2',
                name: 'Toppings',
                isRequired: false,
                minSelection: 0,
                maxSelection: 15,
                isToppingGroup: true,
                isHalfAndHalfEnabled: true,
                isPremiumRuleEnabled: true,
                options: [
                    { id: 'opt-4', name: 'Onions', price: 0.99, isTopping: true },
                    { id: 'opt-5', name: 'Pepperoni', price: 1.50, isTopping: true, isPremium: true },
                    { id: 'opt-6', name: 'Mushrooms', price: 1.25, isTopping: true },
                ]
            }
        ],
        storeOverrides: [],
        auditLog: [
            { timestamp: '2024-01-20T10:00:00Z', user: 'Admin', action: 'Created Item' }
        ]
    }
];
