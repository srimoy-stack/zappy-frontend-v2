export interface ModifierOption {
    id: string;
    name: string;
    price: number;
    calories?: number;
}

export interface ModifierGroup {
    id: string;
    title: string;
    required: boolean;
    minSelection: number;
    maxSelection: number;
    allowQuantity: boolean;
    options: ModifierOption[];
}

export interface ComboStep {
    id: string;
    title: string;
    required: boolean;
    options: Product[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    calories?: number;
    image: string;
    categoryId: string;
    type?: 'standalone' | 'combo' | 'pizza';
    inventory: number;
    modifierGroups?: ModifierGroup[];
    comboSteps?: ComboStep[];
}

export interface Category {
    id: string;
    name: string;
    icon?: string;
}

export interface MenuData {
    categories: Category[];
    products: Product[];
}

const MOCK_MENU: MenuData = {
    categories: [
        { id: 'cat-byo', name: 'Build Your Own', icon: '🍕' },
        { id: 'cat-sig', name: 'Signature Pizzas', icon: '⭐' },
        { id: 'cat-sides', name: 'Sides', icon: '🍗' },
        { id: 'cat-drinks', name: 'Drinks', icon: '🥤' },
        { id: 'cat-desserts', name: 'Desserts', icon: '🍰' },
    ],
    products: [
        // ── Build Your Own ─────────────────────────────────────────────────
        {
            id: 'byo-pizza',
            categoryId: 'cat-byo',
            name: 'Create Your Own Pizza',
            price: 10.99,
            calories: 800,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
            description: 'Start with a fresh base and add your favorite toppings. Choose size, crust, and toppings.',
            type: 'pizza',
            inventory: 100,
        },

        // ── Signature Pizzas ───────────────────────────────────────────────
        {
            id: 'sig-1',
            categoryId: 'cat-sig',
            name: 'Pepperoni Feast',
            price: 14.99,
            calories: 1200,
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
            description: 'Double pepperoni with extra mozzarella cheese on a hand-tossed crust.',
            type: 'standalone',
            inventory: 10,
            modifierGroups: [
                {
                    id: 'size-sel',
                    title: 'Choose Your Size',
                    required: true,
                    minSelection: 1,
                    maxSelection: 1,
                    allowQuantity: false,
                    options: [
                        { id: 'sm', name: 'Small (10")', price: 0, calories: 800 },
                        { id: 'md', name: 'Medium (12")', price: 3.00, calories: 1200 },
                        { id: 'lg', name: 'Large (14")', price: 5.00, calories: 1600 },
                    ],
                },
                {
                    id: 'extras',
                    title: 'Extra Toppings',
                    required: false,
                    minSelection: 0,
                    maxSelection: 4,
                    allowQuantity: false,
                    options: [
                        { id: 'xc', name: 'Extra Cheese', price: 1.50, calories: 120 },
                        { id: 'xp', name: 'Extra Pepperoni', price: 1.99, calories: 90 },
                        { id: 'jal', name: 'Jalapeños', price: 0.99, calories: 10 },
                    ],
                },
            ],
        },
        {
            id: 'sig-2',
            categoryId: 'cat-sig',
            name: 'Veggie Supreme',
            price: 13.99,
            calories: 900,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
            description: 'Fresh bell peppers, onions, mushrooms, olives, and tomatoes.',
            type: 'standalone',
            inventory: 5,
            modifierGroups: [
                {
                    id: 'size-sel',
                    title: 'Choose Your Size',
                    required: true,
                    minSelection: 1,
                    maxSelection: 1,
                    allowQuantity: false,
                    options: [
                        { id: 'sm', name: 'Small (10")', price: 0, calories: 600 },
                        { id: 'md', name: 'Medium (12")', price: 3.00, calories: 900 },
                        { id: 'lg', name: 'Large (14")', price: 5.00, calories: 1200 },
                    ],
                },
            ],
        },
        {
            id: 'sig-3',
            categoryId: 'cat-sig',
            name: 'Meat Lovers',
            price: 16.99,
            calories: 1500,
            image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500',
            description: 'Pepperoni, Italian sausage, ham, bacon, and beef on a thick crust.',
            type: 'standalone',
            inventory: 0, // Sold out
        },
        {
            id: 'sig-4',
            categoryId: 'cat-sig',
            name: 'Margherita',
            price: 12.99,
            calories: 750,
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
            description: 'San Marzano tomatoes, fresh mozzarella, and basil.',
            type: 'standalone',
            inventory: 15,
        },
        {
            id: 'sig-5',
            categoryId: 'cat-sig',
            name: 'BBQ Chicken',
            price: 15.99,
            calories: 1100,
            image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=500',
            description: 'Grilled chicken, red onions, cilantro with tangy BBQ sauce.',
            type: 'standalone',
            inventory: 8,
        },

        // ── Sides ──────────────────────────────────────────────────────────
        {
            id: 'side-1',
            categoryId: 'cat-sides',
            name: 'Garlic Knots',
            price: 5.99,
            calories: 400,
            image: 'https://images.unsplash.com/photo-1626242491136-1c4636f1c7d2?w=500',
            description: '6 pieces of fresh garlic knots with marinara sauce.',
            type: 'standalone',
            inventory: 20,
        },
        {
            id: 'side-2',
            categoryId: 'cat-sides',
            name: 'Creamy Garlic Dip',
            price: 0.99,
            calories: 150,
            image: 'https://images.unsplash.com/photo-1571217623102-3f86e300971e?w=500',
            description: 'Perfect for dipping your crust.',
            type: 'standalone',
            inventory: 50,
        },
        {
            id: 'side-3',
            categoryId: 'cat-sides',
            name: 'Game Day Wings (8pc)',
            price: 9.99,
            calories: 680,
            image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500',
            description: 'Crispy buffalo wings with blue cheese dip.',
            type: 'standalone',
            inventory: 12,
            modifierGroups: [
                {
                    id: 'sauce-sel',
                    title: 'Choose Your Sauce',
                    required: true,
                    minSelection: 1,
                    maxSelection: 1,
                    allowQuantity: false,
                    options: [
                        { id: 'buffalo', name: 'Buffalo Hot', price: 0 },
                        { id: 'bbq', name: 'Smoky BBQ', price: 0 },
                        { id: 'garlic-parm', name: 'Garlic Parmesan', price: 0 },
                        { id: 'honey', name: 'Honey Mustard', price: 0.50 },
                    ],
                },
            ],
        },
        {
            id: 'side-4',
            categoryId: 'cat-sides',
            name: 'Cheesy Breadsticks',
            price: 6.49,
            calories: 520,
            image: 'https://images.unsplash.com/photo-1619926476255-5a8748e26b98?w=500',
            description: 'Freshly baked breadsticks with melted cheese.',
            type: 'standalone',
            inventory: 18,
        },

        // ── Drinks ─────────────────────────────────────────────────────────
        {
            id: 'drink-1',
            categoryId: 'cat-drinks',
            name: '2L Coca-Cola',
            price: 3.49,
            calories: 800,
            image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
            description: 'Classic refreshment to share.',
            type: 'standalone',
            inventory: 30,
        },
        {
            id: 'drink-2',
            categoryId: 'cat-drinks',
            name: 'Sprite (Can)',
            price: 1.99,
            calories: 140,
            image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500',
            description: 'Crisp lemon-lime flavor.',
            type: 'standalone',
            inventory: 25,
        },
        {
            id: 'drink-3',
            categoryId: 'cat-drinks',
            name: 'Water Bottle',
            price: 1.49,
            calories: 0,
            image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500',
            description: 'Stay hydrated.',
            type: 'standalone',
            inventory: 40,
        },
        {
            id: 'drink-4',
            categoryId: 'cat-drinks',
            name: 'Iced Tea',
            price: 2.49,
            calories: 120,
            image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
            description: 'Refreshing brewed iced tea.',
            type: 'standalone',
            inventory: 15,
        },

        // ── Desserts ───────────────────────────────────────────────────────
        {
            id: 'dessert-1',
            categoryId: 'cat-desserts',
            name: 'Chocolate Lava Cake',
            price: 6.99,
            calories: 560,
            image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500',
            description: 'Warm molten chocolate cake with a gooey center.',
            type: 'standalone',
            inventory: 10,
        },
        {
            id: 'dessert-2',
            categoryId: 'cat-desserts',
            name: 'Cinnamon Twists',
            price: 4.99,
            calories: 380,
            image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=500',
            description: 'Warm cinnamon-sugar twists with icing dip.',
            type: 'standalone',
            inventory: 20,
        },
        {
            id: 'dessert-3',
            categoryId: 'cat-desserts',
            name: 'Cookie Dough Bites',
            price: 5.49,
            calories: 420,
            image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500',
            description: 'Deep-fried cookie dough with vanilla drizzle.',
            type: 'standalone',
            inventory: 8,
        },
    ]
};

export const menuService = {
    /**
     * Fetch menu with live inventory status
     */
    getMenu: async (_restaurantId: string): Promise<MenuData> => {
        // Real Integration:
        // const res = await axios.get(`${API_BASE}/menu?restaurantId=${_restaurantId}`);
        // return res.data;

        await new Promise(resolve => setTimeout(resolve, 300));

        // Simulate real-time inventory jitter
        const liveMenu = JSON.parse(JSON.stringify(MOCK_MENU));
        liveMenu.products = liveMenu.products.map((p: Product) => ({
            ...p,
            inventory: p.id === 'sig-3' ? 0 : Math.floor(Math.random() * 20) + 1 // sig-3 is forced sold out
        }));

        return liveMenu;
    },

    /**
     * Get single product with fresh stock check
     */
    getProductById: async (productId: string): Promise<Product | null> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const product = MOCK_MENU.products.find(p => p.id === productId);
        if (!product) return null;

        // Simulate live stock check
        const isSoldOut = product.id === 'sig-3' || Math.random() < 0.01;

        return {
            ...JSON.parse(JSON.stringify(product)),
            inventory: isSoldOut ? 0 : 10
        };
    },

    /**
     * Verify if an item is still in stock before adding to cart
     */
    checkInventory: async (productId: string, quantity: number): Promise<{ available: boolean; remaining: number }> => {
        const product = await menuService.getProductById(productId);
        if (!product) return { available: false, remaining: 0 };

        return {
            available: product.inventory >= quantity,
            remaining: product.inventory
        };
    },

    getUpsellProducts: async (): Promise<Product[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_MENU.products.filter(p => ['side-1', 'side-2', 'drink-1', 'dessert-1'].includes(p.id));
    }
};
