import { KDSOrder, KDSItem } from '../types/kds';

const CUSTOMER_NAMES = [
    'Alice Cooper', 'Bob Dylan', 'Charlie Parker', 'David Bowie',
    'Eve Online', 'Frank Sinatra', 'Grace Hopper', 'Hank Williams'
];

const ITEM_NAMES = [
    'Truffle Fries', 'Wagyu Burger', 'Spicy Tuna Roll', 'Margarita Pizza',
    'Garden Salad', 'Chicken Tikka', 'Beef Burrito', 'Vegan Pasta'
];

/**
 * Generates a single mock order for simulated live WebSocket updates.
 */
export function generateMockOrder(): KDSOrder {
    const id = `ws-${Math.random().toString(36).substring(7)}`;
    const orderNumber = Math.floor(Math.random() * 900 + 100).toString();
    const customerName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const createdAt = new Date().toISOString();
    const prepTimeMinutes = 15 + Math.floor(Math.random() * 10);

    const items: KDSItem[] = Array.from({ length: 1 + Math.floor(Math.random() * 2) }).map((_, i) => ({
        id: `${id}-item-${i}`,
        name: ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)] || 'Unknown Item',
        quantity: 1 + Math.floor(Math.random() * 2),
        modifiers: [],
        categoryId: 'misc'
    }));

    const order: KDSOrder = {
        id,
        orderNumber,
        customerName,
        fulfillment_type: Math.random() > 0.5 ? 'PICKUP' : 'STORE_DELIVERY',
        order_source: 'ONLINE',
        createdAt,
        updatedAt: createdAt,
        stage: 'PREPARING',
        prepTimeMinutes,
        estimatedReadyTime: new Date(Date.now() + prepTimeMinutes * 60000).toISOString(),
        trackingToken: `track-${id}`,
        isDelayed: Math.random() > 0.8,
        items,
        notificationsLog: [],
        delayLog: [],
        stageHistory: []
    };

    return order;
}
