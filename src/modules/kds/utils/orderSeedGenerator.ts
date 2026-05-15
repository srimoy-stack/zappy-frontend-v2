import { KDSOrder } from '../types/kds';


/**
 * Generates the initial seed orders for the KDS mock environment.
 * Reuses the data originally hardcoded in KDSMasterPage.
 */
export function generateSeedOrders(): KDSOrder[] {
    const now = Date.now();

    type MockItem = {
        id: string;
        name: string;
        quantity: number;
        modifiers: { name: string; groupType: string; placement?: string }[];
        categoryId: string
    };

    type MockOrderInput = {
        id: string;
        orderNumber: string;
        customerName: string;
        fulfillment_type: string;
        order_source: string;
        createdAt: string;
        prepTimeMinutes: number;
        stage: string;
        isDelayed: boolean;
        notes?: string;
        items: MockItem[];
    };

    const mockOrders: MockOrderInput[] = [
        // ── PREPARING (Cooking) ────────────────────────────────────────────────
        {
            id: 'f1', orderNumber: '401', customerName: 'Marcus Rivera', fulfillment_type: 'PICKUP', order_source: 'ONLINE',
            createdAt: new Date(now - 720000).toISOString(), prepTimeMinutes: 18, stage: 'PREPARING', isDelayed: true,
            items: [
                { id: 'f1-1', name: 'BBQ Bacon Smash Burger', quantity: 2, modifiers: [{ name: 'Extra Patty', groupType: 'QUANTITY_ONLY' }, { name: 'No Onions', groupType: 'CHOICE_ONE' }, { name: 'Brioche Bun', groupType: 'CHOICE_ONE' }], categoryId: 'burgers' },
                { id: 'f1-2', name: 'Loaded Nachos', quantity: 1, modifiers: [{ name: 'Extra Jalapeños', groupType: 'PLACEMENT_TOPPING' }, { name: 'Pulled Pork', groupType: 'PLACEMENT_TOPPING' }, { name: 'Sour Cream on Side', groupType: 'CHOICE_ONE' }], categoryId: 'sides' },
                { id: 'f1-3', name: 'Chocolate Shake', quantity: 2, modifiers: [{ name: 'Extra Thick', groupType: 'CHOICE_ONE' }], categoryId: 'drinks' },
            ]
        },
        {
            id: 'f2', orderNumber: '402', customerName: 'Priya Sharma', fulfillment_type: 'DINE_IN', order_source: 'KIOSK',
            createdAt: new Date(now - 540000).toISOString(), prepTimeMinutes: 15, stage: 'PREPARING', isDelayed: true,
            items: [
                { id: 'f2-1', name: 'Margherita Pizza (12")', quantity: 1, modifiers: [{ name: 'Thin Crust', groupType: 'CHOICE_ONE' }, { name: 'Extra Mozzarella', groupType: 'PLACEMENT_TOPPING' }, { name: 'Fresh Basil', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'pizza' },
                { id: 'f2-2', name: 'Pepperoni Pizza (10")', quantity: 1, modifiers: [{ name: 'Stuffed Crust', groupType: 'CHOICE_ONE' }, { name: 'Double Pepperoni', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'pizza' },
                { id: 'f2-3', name: 'Caesar Salad', quantity: 1, modifiers: [{ name: 'No Anchovies', groupType: 'CHOICE_ONE' }, { name: 'Dressing on Side', groupType: 'CHOICE_ONE' }], categoryId: 'salads' },
            ]
        },
        {
            id: 'f3', orderNumber: '403', customerName: 'Jake Thompson', fulfillment_type: 'DELIVERY', order_source: 'UBER_DIRECT',
            createdAt: new Date(now - 480000).toISOString(), prepTimeMinutes: 20, stage: 'PREPARING', isDelayed: false,
            items: [
                { id: 'f3-1', name: 'Spicy Chicken Tacos', quantity: 3, modifiers: [{ name: 'Corn Tortilla', groupType: 'CHOICE_ONE' }, { name: 'Extra Hot Sauce', groupType: 'PLACEMENT_TOPPING' }, { name: 'Avocado', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'tacos' },
                { id: 'f3-2', name: 'Beef & Cheese Burrito', quantity: 1, modifiers: [{ name: 'Large Size', groupType: 'CHOICE_ONE' }, { name: 'Black Beans', groupType: 'CHOICE_ONE' }, { name: 'No Cilantro', groupType: 'CHOICE_ONE' }], categoryId: 'burritos' },
                { id: 'f3-3', name: 'Guacamole & Chips', quantity: 1, modifiers: [], categoryId: 'sides' },
            ]
        },
        {
            id: 'f4', orderNumber: '404', customerName: 'Sofia Kim', fulfillment_type: 'PICKUP', order_source: 'POS',
            createdAt: new Date(now - 360000).toISOString(), prepTimeMinutes: 12, stage: 'PREPARING', isDelayed: false,
            items: [
                { id: 'f4-1', name: 'Buffalo Chicken Wings', quantity: 12, modifiers: [{ name: 'Extra Crispy', groupType: 'CHOICE_ONE' }, { name: 'Blue Cheese Dip', groupType: 'CHOICE_ONE' }], categoryId: 'wings' },
                { id: 'f4-2', name: 'Truffle Parmesan Fries', quantity: 1, modifiers: [{ name: 'Extra Truffle Oil', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'sides' },
            ]
        },
        {
            id: 'f5', orderNumber: '405', customerName: 'David Chen', fulfillment_type: 'DINE_IN', order_source: 'ONLINE',
            createdAt: new Date(now - 300000).toISOString(), prepTimeMinutes: 25, stage: 'PREPARING', isDelayed: false,
            items: [
                { id: 'f5-1', name: 'BBQ Chicken Pizza (14")', quantity: 1, modifiers: [{ name: 'Thick Crust', groupType: 'CHOICE_ONE' }, { name: 'Extra BBQ Sauce', groupType: 'PLACEMENT_TOPPING' }, { name: 'Red Onion', groupType: 'PLACEMENT_TOPPING' }, { name: 'Jalapeños', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'pizza' },
                { id: 'f5-2', name: 'Mozzarella Sticks', quantity: 1, modifiers: [{ name: 'Marinara Dip', groupType: 'CHOICE_ONE' }], categoryId: 'starters' },
                { id: 'f5-3', name: 'BBQ Pulled Pork Sandwich', quantity: 2, modifiers: [{ name: 'Coleslaw on Top', groupType: 'PLACEMENT_TOPPING' }, { name: 'Pickles', groupType: 'PLACEMENT_TOPPING' }, { name: 'Toasted Bun', groupType: 'CHOICE_ONE' }], categoryId: 'burgers' },
            ]
        },
        {
            id: 'f6', orderNumber: '406', customerName: 'Nina Patel', fulfillment_type: 'PICKUP', order_source: 'CALL_CENTER',
            createdAt: new Date(now - 240000).toISOString(), prepTimeMinutes: 14, stage: 'PREPARING', isDelayed: false,
            items: [
                { id: 'f6-1', name: 'Mushroom Swiss Burger', quantity: 1, modifiers: [{ name: 'Medium-Well', groupType: 'CHOICE_ONE' }, { name: 'Gluten-Free Bun', groupType: 'CHOICE_ONE' }, { name: 'Extra Swiss', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'burgers' },
                { id: 'f6-2', name: 'Chicken Caesar Wrap', quantity: 1, modifiers: [{ name: 'Grilled Chicken', groupType: 'CHOICE_ONE' }, { name: 'No Caesar Dressing', groupType: 'CHOICE_ONE' }, { name: 'Spinach Tortilla', groupType: 'CHOICE_ONE' }], categoryId: 'wraps' },
                { id: 'f6-3', name: 'Loaded Potato Skins', quantity: 1, modifiers: [{ name: 'Extra Bacon', groupType: 'PLACEMENT_TOPPING' }, { name: 'Extra Cheddar', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'starters' },
            ]
        },
        {
            id: 'f7', orderNumber: '407', customerName: 'Tony Soprano', fulfillment_type: 'PICKUP', order_source: 'CALL_CENTER',
            createdAt: new Date(now - 120000).toISOString(), prepTimeMinutes: 20, stage: 'PREPARING', isDelayed: false,
            notes: "PLEASE CUT INTO SQUARES. ALSO EXTRA NAPKINS.",
            items: [
                {
                    id: 'f7-1', name: 'Half-Half Pizza (16")', quantity: 1,
                    modifiers: [
                        { name: 'Pepperoni', groupType: 'PLACEMENT_TOPPING', placement: 'LEFT' },
                        { name: 'Mushrooms', groupType: 'PLACEMENT_TOPPING', placement: 'RIGHT' },
                        { name: 'Extra Cheese', groupType: 'PLACEMENT_TOPPING', placement: 'FULL' },
                        { name: 'Anchovies', groupType: 'PLACEMENT_TOPPING', placement: 'MIDDLE' }
                    ],
                    categoryId: 'pizza'
                },
                { id: 'f7-2', name: 'Beer', quantity: 2, modifiers: [], categoryId: 'drinks' },
                { id: 'f7-3', name: 'Garlic Knots', quantity: 6, modifiers: [], categoryId: 'sides' }
            ]
        },

        // ── READY (Packing) ────────────────────────────────────────────────
        {
            id: 'r1', orderNumber: '411', customerName: 'Aisha Johnson', fulfillment_type: 'PICKUP', order_source: 'ONLINE',
            createdAt: new Date(now - 900000).toISOString(), prepTimeMinutes: 10, stage: 'READY', isDelayed: false,
            items: [
                { id: 'r1-1', name: 'Four Cheese Pizza (12")', quantity: 1, modifiers: [{ name: 'Thin Crust', groupType: 'CHOICE_ONE' }, { name: 'No Oregano', groupType: 'CHOICE_ONE' }], categoryId: 'pizza' },
                { id: 'r1-2', name: 'Spicy Arrabbiata Pasta', quantity: 1, modifiers: [{ name: 'Penne', groupType: 'CHOICE_ONE' }, { name: 'Extra Chili Flakes', groupType: 'PLACEMENT_TOPPING' }, { name: 'Parmesan on Side', groupType: 'CHOICE_ONE' }], categoryId: 'pasta' },
            ]
        },
        {
            id: 'r2', orderNumber: '412', customerName: 'Leo Morales', fulfillment_type: 'DINE_IN', order_source: 'KIOSK',
            createdAt: new Date(now - 780000).toISOString(), prepTimeMinutes: 12, stage: 'READY', isDelayed: false,
            items: [
                { id: 'r2-1', name: 'Double Smash Cheeseburger', quantity: 1, modifiers: [{ name: 'Well Done', groupType: 'CHOICE_ONE' }, { name: 'American Cheese', groupType: 'CHOICE_ONE' }, { name: 'Extra Pickles', groupType: 'PLACEMENT_TOPPING' }, { name: 'Grilled Onions', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'burgers' },
                { id: 'r2-2', name: 'Sweet Potato Fries', quantity: 1, modifiers: [{ name: 'Chipotle Mayo Dip', groupType: 'CHOICE_ONE' }], categoryId: 'sides' },
                { id: 'r2-3', name: 'Lemonade', quantity: 1, modifiers: [{ name: 'Less Sugar', groupType: 'CHOICE_ONE' }, { name: 'Mint', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'drinks' },
            ]
        },
        {
            id: 'r3', orderNumber: '413', customerName: 'Camille Dubois', fulfillment_type: 'DELIVERY', order_source: 'UBER_DIRECT',
            createdAt: new Date(now - 660000).toISOString(), prepTimeMinutes: 15, stage: 'READY', isDelayed: false,
            items: [
                { id: 'r3-1', name: 'Chicken Tikka Nachos', quantity: 1, modifiers: [{ name: 'Extra Cheese', groupType: 'PLACEMENT_TOPPING' }, { name: 'Mint Chutney', groupType: 'CHOICE_ONE' }, { name: 'No Onions', groupType: 'CHOICE_ONE' }], categoryId: 'sides' },
                { id: 'r3-2', name: 'Lamb Kebab Wrap', quantity: 2, modifiers: [{ name: 'Whole Wheat Wrap', groupType: 'CHOICE_ONE' }, { name: 'Tzatziki Sauce', groupType: 'CHOICE_ONE' }, { name: 'Extra Veggies', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'wraps' },
            ]
        },
        {
            id: 'r4', orderNumber: '414', customerName: 'Omar Farouk', fulfillment_type: 'PICKUP', order_source: 'POS',
            createdAt: new Date(now - 850000).toISOString(), prepTimeMinutes: 8, stage: 'READY', isDelayed: false,
            items: [
                { id: 'r4-1', name: 'Veggie Supreme Pizza (14")', quantity: 1, modifiers: [{ name: 'Extra Bell Peppers', groupType: 'PLACEMENT_TOPPING' }, { name: 'Sun-Dried Tomatoes', groupType: 'PLACEMENT_TOPPING' }, { name: 'Vegan Cheese', groupType: 'CHOICE_ONE' }, { name: 'Garlic Drizzle', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'pizza' },
                { id: 'r4-2', name: 'Garlic Bread', quantity: 2, modifiers: [{ name: 'Extra Garlic Butter', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'sides' },
            ]
        },
        {
            id: 'r5', orderNumber: '415', customerName: 'Rachel Sun', fulfillment_type: 'DINE_IN', order_source: 'ONLINE',
            createdAt: new Date(now - 920000).toISOString(), prepTimeMinutes: 10, stage: 'READY', isDelayed: false,
            items: [
                { id: 'r5-1', name: 'Honey Garlic Wings', quantity: 18, modifiers: [{ name: 'Boneless', groupType: 'CHOICE_ONE' }, { name: 'Ranch Dip', groupType: 'CHOICE_ONE' }, { name: 'Extra Sauce', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'wings' },
                { id: 'r5-2', name: 'Mac & Cheese Bites', quantity: 1, modifiers: [{ name: 'Truffle Aioli Dip', groupType: 'CHOICE_ONE' }], categoryId: 'starters' },
            ]
        },

        // ── NEW (Queue) ────────────────────────────────────────────────────
        {
            id: 'n1', orderNumber: '421', customerName: 'Tyler Brooks', fulfillment_type: 'PICKUP', order_source: 'ONLINE',
            createdAt: new Date(now - 60000).toISOString(), prepTimeMinutes: 20, stage: 'NEW', isDelayed: false,
            items: [
                { id: 'n1-1', name: 'Meat Lovers Pizza (14")', quantity: 1, modifiers: [{ name: 'Extra Thick Crust', groupType: 'CHOICE_ONE' }, { name: 'Double Sausage', groupType: 'PLACEMENT_TOPPING' }, { name: 'Bacon Crumbles', groupType: 'PLACEMENT_TOPPING' }, { name: 'Spicy Sauce Base', groupType: 'CHOICE_ONE' }], categoryId: 'pizza' },
                { id: 'n1-2', name: 'Classic Cheeseburger', quantity: 2, modifiers: [{ name: 'Medium Rare', groupType: 'CHOICE_ONE' }, { name: 'No Ketchup', groupType: 'CHOICE_ONE' }, { name: 'Extra Mustard', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'burgers' },
                { id: 'n1-3', name: 'Onion Rings', quantity: 1, modifiers: [{ name: 'BBQ Dip', groupType: 'CHOICE_ONE' }], categoryId: 'sides' },
            ]
        },
        {
            id: 'n2', orderNumber: '422', customerName: 'Fatima Al-Hassan', fulfillment_type: 'DELIVERY', order_source: 'UBER_DIRECT',
            createdAt: new Date(now - 45000).toISOString(), prepTimeMinutes: 22, stage: 'NEW', isDelayed: false,
            items: [
                { id: 'n2-1', name: 'Shrimp Tacos', quantity: 2, modifiers: [{ name: 'Flour Tortilla', groupType: 'CHOICE_ONE' }, { name: 'Mango Salsa', groupType: 'PLACEMENT_TOPPING' }, { name: 'Chipotle Crema', groupType: 'PLACEMENT_TOPPING' }, { name: 'No Cabbage', groupType: 'CHOICE_ONE' }], categoryId: 'tacos' },
                { id: 'n2-2', name: 'Steak Nachos', quantity: 1, modifiers: [{ name: 'Medium Steak', groupType: 'CHOICE_ONE' }, { name: 'Pico de Gallo', groupType: 'PLACEMENT_TOPPING' }, { name: 'Extra Queso', groupType: 'PLACEMENT_TOPPING' }, { name: 'Pickled Jalapeños', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'sides' },
                { id: 'n2-3', name: 'Churros', quantity: 1, modifiers: [{ name: 'Chocolate Dip', groupType: 'CHOICE_ONE' }], categoryId: 'desserts' },
            ]
        },
        {
            id: 'n3', orderNumber: '423', customerName: 'James O\'Brien', fulfillment_type: 'DINE_IN', order_source: 'KIOSK',
            createdAt: new Date(now - 30000).toISOString(), prepTimeMinutes: 18, stage: 'NEW', isDelayed: false,
            items: [
                { id: 'n3-1', name: 'Carbonara Pasta', quantity: 2, modifiers: [{ name: 'Spaghetti', groupType: 'CHOICE_ONE' }, { name: 'Extra Pancetta', groupType: 'PLACEMENT_TOPPING' }, { name: 'Egg Yolk on Top', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'pasta' },
                { id: 'n3-2', name: 'Burrata & Tomato Bruschetta', quantity: 1, modifiers: [{ name: 'Balsamic Glaze', groupType: 'PLACEMENT_TOPPING' }, { name: 'Extra Olive Oil', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'starters' },
            ]
        },
        {
            id: 'n4', orderNumber: '424', customerName: 'Yuki Tanaka', fulfillment_type: 'PICKUP', order_source: 'POS',
            createdAt: new Date(now - 20000).toISOString(), prepTimeMinutes: 16, stage: 'NEW', isDelayed: false,
            items: [
                { id: 'n4-1', name: 'Sriracha Honey Wings', quantity: 6, modifiers: [{ name: 'Bone-In', groupType: 'CHOICE_ONE' }, { name: 'Extra Sriracha', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'wings' },
                { id: 'n4-2', name: 'Philly Cheesesteak', quantity: 1, modifiers: [{ name: 'Provolone', groupType: 'CHOICE_ONE' }, { name: 'Sautéed Peppers', groupType: 'PLACEMENT_TOPPING' }, { name: 'Extra Onions', groupType: 'PLACEMENT_TOPPING' }, { name: 'Toasted Hoagie Roll', groupType: 'CHOICE_ONE' }], categoryId: 'sandwiches' },
                { id: 'n4-3', name: 'Loaded Waffle Fries', quantity: 1, modifiers: [{ name: 'Cheddar Cheese Sauce', groupType: 'PLACEMENT_TOPPING' }, { name: 'Bacon Bits', groupType: 'PLACEMENT_TOPPING' }, { name: 'Green Onions', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'sides' },
            ]
        },
        {
            id: 'n5', orderNumber: '425', customerName: 'Isabella Rossi', fulfillment_type: 'DELIVERY', order_source: 'ONLINE',
            createdAt: new Date(now - 10000).toISOString(), prepTimeMinutes: 30, stage: 'NEW', isDelayed: false,
            items: [
                { id: 'n5-1', name: 'Truffle Mushroom Pizza (12")', quantity: 1, modifiers: [{ name: 'Sourdough Crust', groupType: 'CHOICE_ONE' }, { name: 'White Sauce Base', groupType: 'CHOICE_ONE' }, { name: 'Truffle Oil Drizzle', groupType: 'PLACEMENT_TOPPING' }, { name: 'Arugula', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'pizza' },
                { id: 'n5-2', name: 'Tiramisu', quantity: 2, modifiers: [{ name: 'Extra Cocoa Dusting', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'desserts' },
                { id: 'n5-3', name: 'San Pellegrino', quantity: 2, modifiers: [], categoryId: 'drinks' },
            ]
        },
        {
            id: 'n6', orderNumber: '426', customerName: 'Carlos Mendez', fulfillment_type: 'DINE_IN', order_source: 'KIOSK',
            createdAt: new Date(now - 5000).toISOString(), prepTimeMinutes: 14, stage: 'NEW', isDelayed: false,
            items: [
                { id: 'n6-1', name: 'Street Corn Nachos', quantity: 1, modifiers: [{ name: 'Cotija Cheese', groupType: 'PLACEMENT_TOPPING' }, { name: 'Tajín Rim', groupType: 'PLACEMENT_TOPPING' }, { name: 'Lime Crema', groupType: 'CHOICE_ONE' }], categoryId: 'sides' },
                { id: 'n6-2', name: 'Carne Asada Tacos', quantity: 3, modifiers: [{ name: 'Double Corn Tortilla', groupType: 'CHOICE_ONE' }, { name: 'Onion & Cilantro', groupType: 'PLACEMENT_TOPPING' }, { name: 'Extra Salsa Verde', groupType: 'PLACEMENT_TOPPING' }], categoryId: 'tacos' },
            ]
        },
    ];

    return mockOrders.map(o => ({
        ...o,
        updatedAt: new Date().toISOString(),
        trackingToken: `mock-${o.id}`,
        estimatedReadyTime: new Date(
            new Date(o.createdAt).getTime() + o.prepTimeMinutes * 60000
        ).toISOString(),
    } as KDSOrder));
}
