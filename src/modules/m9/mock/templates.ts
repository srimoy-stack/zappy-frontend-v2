/**
 * Pre-built Template Categories for Quick Product Creation
 * Each template contains ready-to-use variants, modifiers, and addons
 * that admin can preview and attach with one click.
 */

import { ItemVariantGroup, ModifierGroup } from '../types/items';

// ─── Variant Template Categories ─────────────────────────────

export interface VariantTemplate {
    id: string;
    name: string;
    description: string;
    emoji: string;
    groups: ItemVariantGroup[];
}

export const VARIANT_TEMPLATES: VariantTemplate[] = [
    {
        id: 'vt-pizza-sizes',
        name: 'Pizza Sizes',
        description: 'Standard pizza sizing with Small, Medium, Large, and Extra Large',
        emoji: '🍕',
        groups: [
            {
                id: 'vg-pizza-size', name: 'Size', isRequired: true, defaultVariantId: 'v-ps-med', sortOrder: 1,
                variants: [
                    { id: 'v-ps-sm', name: 'Small (10")', basePrice: 9.99, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-ps-med', name: 'Medium (12")', basePrice: 12.99, priceAdjustment: 3.00, isAvailable: true },
                    { id: 'v-ps-lg', name: 'Large (14")', basePrice: 15.99, priceAdjustment: 6.00, isAvailable: true },
                    { id: 'v-ps-xl', name: 'Extra Large (16")', basePrice: 18.99, priceAdjustment: 9.00, isAvailable: true },
                ],
            },
            {
                id: 'vg-pizza-crust', name: 'Crust', isRequired: true, defaultVariantId: 'v-pc-reg', sortOrder: 2,
                variants: [
                    { id: 'v-pc-reg', name: 'Regular', basePrice: 0, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-pc-thin', name: 'Thin Crust', basePrice: 0, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-pc-stuff', name: 'Stuffed Crust', basePrice: 2.50, priceAdjustment: 2.50, isAvailable: true },
                    { id: 'v-pc-ww', name: 'Whole Wheat', basePrice: 1.50, priceAdjustment: 1.50, isAvailable: true },
                ],
            },
        ],
    },
    {
        id: 'vt-drink-sizes',
        name: 'Drink Sizes',
        description: 'Beverage sizing from Regular to Family size',
        emoji: '🥤',
        groups: [
            {
                id: 'vg-drink-size', name: 'Size', isRequired: true, defaultVariantId: 'v-ds-reg', sortOrder: 1,
                variants: [
                    { id: 'v-ds-reg', name: 'Regular (12oz)', basePrice: 1.99, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-ds-lg', name: 'Large (20oz)', basePrice: 2.99, priceAdjustment: 1.00, isAvailable: true },
                    { id: 'v-ds-fam', name: 'Family (2L)', basePrice: 4.99, priceAdjustment: 3.00, isAvailable: true },
                ],
            },
        ],
    },
    {
        id: 'vt-wings-count',
        name: 'Wings Count',
        description: 'Wing portions from 6-piece to party pack',
        emoji: '🍗',
        groups: [
            {
                id: 'vg-wings-ct', name: 'Pieces', isRequired: true, defaultVariantId: 'v-wc-6', sortOrder: 1,
                variants: [
                    { id: 'v-wc-6', name: '6 Pieces', basePrice: 7.99, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-wc-10', name: '10 Pieces', basePrice: 11.99, priceAdjustment: 4.00, isAvailable: true },
                    { id: 'v-wc-20', name: '20 Pieces', basePrice: 19.99, priceAdjustment: 12.00, isAvailable: true },
                    { id: 'v-wc-50', name: '50 Pieces (Party)', basePrice: 44.99, priceAdjustment: 37.00, isAvailable: true },
                ],
            },
        ],
    },
    {
        id: 'vt-pasta-type',
        name: 'Pasta Options',
        description: 'Pasta type and sauce combinations',
        emoji: '🍝',
        groups: [
            {
                id: 'vg-pasta-type', name: 'Pasta Type', isRequired: true, defaultVariantId: 'v-pt-penne', sortOrder: 1,
                variants: [
                    { id: 'v-pt-penne', name: 'Penne', basePrice: 10.99, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-pt-spag', name: 'Spaghetti', basePrice: 10.99, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-pt-fett', name: 'Fettuccine', basePrice: 11.99, priceAdjustment: 1.00, isAvailable: true },
                ],
            },
            {
                id: 'vg-pasta-sauce', name: 'Sauce', isRequired: true, defaultVariantId: 'v-ps-mar', sortOrder: 2,
                variants: [
                    { id: 'v-ps-mar', name: 'Marinara', basePrice: 0, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-ps-alf', name: 'Alfredo', basePrice: 1.00, priceAdjustment: 1.00, isAvailable: true },
                    { id: 'v-ps-ros', name: 'Rosé', basePrice: 1.50, priceAdjustment: 1.50, isAvailable: true },
                ],
            },
        ],
    },
    {
        id: 'vt-single-size',
        name: 'Single Size (No Variants)',
        description: 'For items with one fixed size — desserts, dips, single-serve',
        emoji: '📦',
        groups: [
            {
                id: 'vg-single', name: 'Standard', isRequired: true, defaultVariantId: 'v-single-std', sortOrder: 1,
                variants: [
                    { id: 'v-single-std', name: 'Standard', basePrice: 0, priceAdjustment: 0, isAvailable: true },
                ],
            },
        ],
    },
    {
        id: 'vt-spice-level',
        name: 'Spice Levels',
        description: 'Heat preference from mild to extra hot',
        emoji: '🌶️',
        groups: [
            {
                id: 'vg-spice', name: 'Spice Level', isRequired: true, defaultVariantId: 'v-sp-med', sortOrder: 1,
                variants: [
                    { id: 'v-sp-mild', name: 'Mild', basePrice: 0, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-sp-med', name: 'Medium', basePrice: 0, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-sp-hot', name: 'Hot', basePrice: 0, priceAdjustment: 0, isAvailable: true },
                    { id: 'v-sp-xhot', name: 'Extra Hot 🔥', basePrice: 0, priceAdjustment: 0, isAvailable: true },
                ],
            },
        ],
    },
];

// ─── Modifier Template Categories ────────────────────────────

export interface ModifierTemplate {
    id: string;
    name: string;
    description: string;
    emoji: string;
    groups: ModifierGroup[];
}

export const MODIFIER_TEMPLATES: ModifierTemplate[] = [
    {
        id: 'mt-pizza-toppings',
        name: 'Pizza Toppings',
        description: 'Full range of pizza toppings with premium/regular classification',
        emoji: '🧀',
        groups: [
            {
                id: 'mg-reg-toppings', name: 'Regular Toppings', isRequired: false, minSelection: 0, maxSelection: 10,
                isToppingGroup: true, isHalfAndHalfEnabled: true, isPremiumRuleEnabled: false,
                options: [
                    { id: 'opt-onion', name: 'Onions', price: 0.99, isTopping: true },
                    { id: 'opt-mush', name: 'Mushrooms', price: 0.99, isTopping: true },
                    { id: 'opt-pepper', name: 'Green Peppers', price: 0.99, isTopping: true },
                    { id: 'opt-olive', name: 'Black Olives', price: 0.99, isTopping: true },
                    { id: 'opt-tomato', name: 'Tomatoes', price: 0.99, isTopping: true },
                    { id: 'opt-jalap', name: 'Jalapeños', price: 0.99, isTopping: true },
                    { id: 'opt-pine', name: 'Pineapple', price: 0.99, isTopping: true },
                ],
            },
            {
                id: 'mg-prem-toppings', name: 'Premium Toppings', isRequired: false, minSelection: 0, maxSelection: 5,
                isToppingGroup: true, isHalfAndHalfEnabled: true, isPremiumRuleEnabled: true,
                options: [
                    { id: 'opt-pepp', name: 'Pepperoni', price: 1.99, isPremium: true, isTopping: true },
                    { id: 'opt-chick', name: 'Grilled Chicken', price: 2.49, isPremium: true, isTopping: true },
                    { id: 'opt-bacon', name: 'Bacon', price: 2.29, isPremium: true, isTopping: true },
                    { id: 'opt-paneer', name: 'Paneer', price: 2.50, isPremium: true, isTopping: true },
                    { id: 'opt-shrimp', name: 'Shrimp', price: 2.99, isPremium: true, isTopping: true },
                ],
            },
        ],
    },
    {
        id: 'mt-sauce-options',
        name: 'Sauce Options',
        description: 'Base sauce selection for pizza and pasta',
        emoji: '🫗',
        groups: [
            {
                id: 'mg-sauces', name: 'Sauce', isRequired: true, minSelection: 1, maxSelection: 1,
                isToppingGroup: false, isHalfAndHalfEnabled: false, isPremiumRuleEnabled: false,
                options: [
                    { id: 'opt-tom-sauce', name: 'Tomato Sauce', price: 0 },
                    { id: 'opt-bbq-sauce', name: 'BBQ Sauce', price: 0.50 },
                    { id: 'opt-garlic-sauce', name: 'White Garlic', price: 0.50 },
                    { id: 'opt-pesto', name: 'Pesto', price: 1.00 },
                ],
            },
        ],
    },
    {
        id: 'mt-cheese-extras',
        name: 'Cheese & Extras',
        description: 'Extra cheese and cheese type options',
        emoji: '🧈',
        groups: [
            {
                id: 'mg-cheese', name: 'Cheese Options', isRequired: false, minSelection: 0, maxSelection: 3,
                isToppingGroup: false, isHalfAndHalfEnabled: false, isPremiumRuleEnabled: false,
                options: [
                    { id: 'opt-ext-mozz', name: 'Extra Mozzarella', price: 1.99 },
                    { id: 'opt-parm', name: 'Parmesan', price: 1.50 },
                    { id: 'opt-cheddar', name: 'Cheddar', price: 1.50 },
                    { id: 'opt-vegan-ch', name: 'Vegan Cheese', price: 2.00 },
                ],
            },
        ],
    },
    {
        id: 'mt-dips',
        name: 'Dipping Sauces',
        description: 'Dipping sauces for wings, breadsticks, and sides',
        emoji: '🥣',
        groups: [
            {
                id: 'mg-dips', name: 'Dips', isRequired: false, minSelection: 0, maxSelection: 5,
                isToppingGroup: false, isHalfAndHalfEnabled: false, isPremiumRuleEnabled: false,
                options: [
                    { id: 'opt-ranch', name: 'Ranch', price: 0.50 },
                    { id: 'opt-garlic-dip', name: 'Garlic Dip', price: 0.50 },
                    { id: 'opt-marinara-dip', name: 'Marinara', price: 0.50 },
                    { id: 'opt-bbq-dip', name: 'BBQ Sauce', price: 0.50 },
                    { id: 'opt-honey-must', name: 'Honey Mustard', price: 0.50 },
                    { id: 'opt-hot-sauce', name: 'Hot Sauce', price: 0 },
                ],
            },
        ],
    },
    {
        id: 'mt-wing-sauces',
        name: 'Wing Sauces',
        description: 'Sauce and rub options for chicken wings',
        emoji: '🍯',
        groups: [
            {
                id: 'mg-wing-sauce', name: 'Wing Sauce', isRequired: true, minSelection: 1, maxSelection: 2,
                isToppingGroup: false, isHalfAndHalfEnabled: false, isPremiumRuleEnabled: false,
                options: [
                    { id: 'opt-ws-buffalo', name: 'Buffalo', price: 0 },
                    { id: 'opt-ws-bbq', name: 'BBQ', price: 0 },
                    { id: 'opt-ws-honey-g', name: 'Honey Garlic', price: 0 },
                    { id: 'opt-ws-teriyaki', name: 'Teriyaki', price: 0 },
                    { id: 'opt-ws-lemon-p', name: 'Lemon Pepper (Dry Rub)', price: 0 },
                    { id: 'opt-ws-salt-p', name: 'Salt & Pepper (Dry Rub)', price: 0 },
                ],
            },
        ],
    },
    {
        id: 'mt-drink-addons',
        name: 'Drink Add-Ons',
        description: 'Ice, flavor shots, and extras for beverages',
        emoji: '🧊',
        groups: [
            {
                id: 'mg-drink-add', name: 'Drink Extras', isRequired: false, minSelection: 0, maxSelection: 3,
                isToppingGroup: false, isHalfAndHalfEnabled: false, isPremiumRuleEnabled: false,
                options: [
                    { id: 'opt-no-ice', name: 'No Ice', price: 0 },
                    { id: 'opt-extra-ice', name: 'Extra Ice', price: 0 },
                    { id: 'opt-lemon', name: 'Lemon Slice', price: 0 },
                    { id: 'opt-flavor', name: 'Flavor Shot', price: 0.50 },
                ],
            },
        ],
    },
];

// ─── Addon Template Categories (for Deals/Combos) ───────────

export interface AddonTemplate {
    id: string;
    name: string;
    description: string;
    emoji: string;
    items: { name: string; price: number; included: boolean }[];
}

export const ADDON_TEMPLATES: AddonTemplate[] = [
    {
        id: 'at-sides',
        name: 'Side Items',
        description: 'Garlic bread, breadsticks, salads',
        emoji: '🥗',
        items: [
            { name: 'Garlic Bread', price: 3.99, included: false },
            { name: 'Breadsticks (6pc)', price: 4.99, included: false },
            { name: 'Caesar Salad', price: 5.99, included: false },
            { name: 'Coleslaw', price: 2.99, included: false },
        ],
    },
    {
        id: 'at-beverages',
        name: 'Beverages',
        description: 'Soft drinks, juice, and water',
        emoji: '🥤',
        items: [
            { name: 'Coca-Cola', price: 1.99, included: false },
            { name: 'Sprite', price: 1.99, included: false },
            { name: 'Fanta Orange', price: 1.99, included: false },
            { name: 'Water Bottle', price: 1.49, included: false },
            { name: 'Juice Box', price: 2.49, included: false },
        ],
    },
    {
        id: 'at-desserts',
        name: 'Desserts',
        description: 'Sweet treats to complete the meal',
        emoji: '🍪',
        items: [
            { name: 'Chocolate Brownie', price: 3.99, included: false },
            { name: 'Cookie Pack (3pc)', price: 2.99, included: false },
            { name: 'Lava Cake', price: 4.99, included: false },
            { name: 'Cinnamon Sticks', price: 3.49, included: false },
        ],
    },
];
