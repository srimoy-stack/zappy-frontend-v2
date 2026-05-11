import { SHOP_ITEMS, CATEGORIES, MOCK_ORDERS } from '../mock/data';
import { ShopItem, Order, Category, CartItem } from '../types';

let orders = [...MOCK_ORDERS];
let items = [...SHOP_ITEMS];

export const shopService = {
    // Categories
    getCategories: async (): Promise<Category[]> => {
        return CATEGORIES;
    },

    getCategoryById: async (id: string): Promise<Category | undefined> => {
        return CATEGORIES.find(c => c.id === id);
    },

    // Items
    getItems: async (category?: string): Promise<ShopItem[]> => {
        if (category) {
            return items.filter(item => item.category === category && item.active);
        }
        return items.filter(item => item.active);
    },

    getItemById: async (id: string): Promise<ShopItem | undefined> => {
        return items.find(item => item.id === id);
    },

    // Admin: Items
    getAllItems: async (): Promise<ShopItem[]> => {
        return items;
    },

    toggleItemStatus: async (id: string): Promise<void> => {
        items = items.map(item =>
            item.id === id ? { ...item, active: !item.active } : item
        );
    },

    // Orders
    getOrders: async (): Promise<Order[]> => {
        return orders;
    },

    createOrderFromCart: async (cartItems: CartItem[], email: string): Promise<string> => {
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        cartItems.forEach(item => {
            const newOrder: Order = {
                orderId: orderId, // Shared ID for items in same transaction
                itemId: item.id,
                itemName: item.name,
                category: item.category,
                amount: item.price * item.quantity,
                paymentStatus: 'PAID',
                customerEmail: email,
                createdAt: new Date().toISOString(),
                selections: item.selections
            };
            orders.unshift(newOrder);
        });

        return orderId;
    },

    // Legacy support or single item
    createOrder: async (item: ShopItem, email: string): Promise<Order> => {
        const newOrder: Order = {
            orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            amount: item.price,
            paymentStatus: 'PAID',
            customerEmail: email,
            createdAt: new Date().toISOString()
        };
        orders.unshift(newOrder);
        return newOrder;
    },

    exportOrdersCSV: async (): Promise<string> => {
        const header = 'Order ID,Item,Amount,Status,Email,Date,Selections\n';
        const rows = orders.map(o => {
            const selections = o.selections ? Object.entries(o.selections).map(([k, v]) => `${k}:${v}`).join('; ') : 'None';
            return `${o.orderId},"${o.itemName}",${o.amount},${o.paymentStatus},${o.customerEmail},${o.createdAt},"${selections}"`;
        }).join('\n');
        return header + rows;
    }
};
