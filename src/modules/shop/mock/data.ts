import { ShopItem, Category, Order } from '../types';

export const CATEGORIES: Category[] = [
    {
        id: 'packaging',
        name: 'Packaging',
        title: 'Packaging Solutions',
        subtitle: 'Professional starter kits and premium containers for your restaurant, pizza shop, and delivery operations.'
    },
    {
        id: 'print',
        name: 'Print',
        title: 'Promotional Printing',
        subtitle: 'High-quality flyers, business cards, and marketing materials tailored for your food business.'
    },
    {
        id: 'modules',
        name: 'Modules',
        title: 'Software Modules',
        subtitle: 'Enhance your operational efficiency with our specialized POS and ordering modules.'
    },
    {
        id: 'marketing',
        name: 'Marketing',
        title: 'Digital Marketing',
        subtitle: 'Reach more customers with professional social media and local SEO packages.'
    },
];

export const SHOP_ITEMS: ShopItem[] = [
    // Packaging
    {
        id: 'pkg-1',
        name: 'Pizza Packaging Starter Kit',
        category: 'packaging',
        shortDescription: 'Includes 12" premium corrugated boxes, eco-friendly...',
        description: 'Complete packaging solution for pizza takeaways. High-quality materials that keep food hot and fresh.',
        includes: [
            '500x 12" Corrugated Pizza Boxes',
            '1000x Greaseproof Liners',
            'Eco-friendly materials',
            'Strong structural integrity'
        ],
        price: 149.00,
        billingType: 'ONE_TIME',
        stockStatus: 'In Stock',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop',
        active: true,
        options: [
            { id: 'size', label: 'Box Size', type: 'select', choices: ['10"', '12"', '14"'], required: true },
            { id: 'logo', label: 'Custom Logo Print', type: 'select', choices: ['None', 'Black Ink', 'Full Color'], required: true }
        ]
    },
    {
        id: 'pkg-2',
        name: 'Delivery Packaging Kit',
        category: 'packaging',
        shortDescription: 'Includes heavy-duty kraft paper bags, leak-proof sauce...',
        description: 'Ideal kit for multi-item deliveries. Includes bags and containers designed for transit.',
        includes: [
            '200x Large Kraft Paper Bags',
            '500x Leak-proof Sauce Containers',
            'FSC-certified paper',
            'Customizable labels'
        ],
        price: 129.00,
        billingType: 'ONE_TIME',
        stockStatus: 'In Stock',
        image: 'https://images.unsplash.com/photo-1606149059549-6042addafc5a?q=80&w=1974&auto=format&fit=crop',
        active: true,
        options: [
            { id: 'bag_type', label: 'Bag Handle Type', type: 'select', choices: ['Flat Handle', 'Twisted Handle'], required: true }
        ]
    },
    // Print
    {
        id: 'prnt-1',
        name: 'Business Cards Printing',
        category: 'print',
        shortDescription: 'Premium 450gsm matte finished cards with...',
        description: 'Professional business cards that leave a lasting impression. Available in matte, gloss, or velvet finish.',
        includes: [
            '500x Premium Business Cards',
            '450gsm Silk cardstock',
            'Matte or Gloss Lamination',
            'Double-sided printing'
        ],
        price: 49.00,
        billingType: 'ONE_TIME',
        stockStatus: 'Best Seller',
        image: 'https://images.unsplash.com/photo-1589330694653-ded6df5106bb?q=80&w=1922&auto=format&fit=crop',
        active: true,
        options: [
            { id: 'finish', label: 'Card Finish', type: 'select', choices: ['Matte', 'Gloss', 'Velvet'], required: true },
            { id: 'corners', label: 'Corner Style', type: 'select', choices: ['Square', 'Rounded'], required: true },
            { id: 'artwork', label: 'Upload Artwork', type: 'file', required: true }
        ]
    },
    {
        id: 'prnt-2',
        name: 'Flyers & Store Promotion Print',
        category: 'print',
        shortDescription: 'High gloss 100lb text flyers for local...',
        description: 'The best way to announce your new menu or special offers to the local neighborhood.',
        includes: [
            '1000x A5 Double-Sided Flyers',
            '100lb Glossy Text paper',
            'Full-color vibrant printing',
            'Free design template'
        ],
        price: 79.99,
        billingType: 'ONE_TIME',
        stockStatus: 'In Stock',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
        active: true,
        options: [
            { id: 'paper', label: 'Paper Weight', type: 'select', choices: ['100lb Text', '130lb Cover'], required: true },
            { id: 'artwork', label: 'Upload Flyer PDF', type: 'file', required: true }
        ]
    },
    // Modules
    {
        id: 'mod-1',
        name: 'Zyappy POS Core Module',
        category: 'modules',
        shortDescription: 'Complete POS management system with inventory...',
        description: 'The heart of your restaurant operations. Manage orders, tables, and staff effortlessly.',
        includes: [
            'Full POS Access',
            'Unlimited Users',
            'Basic Inventory Tracking',
            'End-of-day Reporting'
        ],
        price: 29.00,
        billingType: 'MONTHLY',
        stockStatus: 'Best Seller',
        image: 'https://images.unsplash.com/photo-1556742049-0ad338b939f5?q=80&w=2070&auto=format&fit=crop',
        active: true,
        options: [
            { id: 'store_count', label: 'Number of Outlets', type: 'select', choices: ['1 Outlet', '2-5 Outlets', 'Enterprise'], required: true }
        ]
    },
    {
        id: 'mod-2',
        name: 'Online Ordering Module',
        category: 'modules',
        shortDescription: 'Accept orders directly from your own website...',
        description: 'Take back control from third-party apps. Accept direct orders with zero commission.',
        includes: [
            'SEO-optimized Menu Page',
            'Push-to-Kitchen Integration',
            'Customer Loyalty Tools',
            'Stripe & PayPal Integration'
        ],
        price: 39.00,
        billingType: 'MONTHLY',
        stockStatus: 'In Stock',
        image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=2070&auto=format&fit=crop',
        active: true,
        options: [
            { id: 'domain', label: 'Preferred Subdomain', type: 'text', placeholder: 'my-shop.zyappy.com', required: true }
        ]
    },
    // Marketing
    {
        id: 'mkt-1',
        name: 'Local Digital Marketing Package',
        category: 'marketing',
        shortDescription: 'Boost your local search rankings and Google...',
        description: 'Comprehensive local SEO and digital presence management to get you appearing first on searches.',
        includes: [
            'Google Maps Optimization',
            'Local Keyword Targeting',
            'Directory Listing Management',
            'Monthly Performance Review'
        ],
        price: 299.00,
        billingType: 'MONTHLY',
        stockStatus: 'In Stock',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop',
        active: true,
        options: [
            { id: 'region', label: 'Target City/Region', type: 'text', placeholder: 'e.g. London, Kensington', required: true }
        ]
    },
    {
        id: 'mkt-2',
        name: 'Social Media Management',
        category: 'marketing',
        shortDescription: 'Professional content and posting for your social...',
        description: 'We handle your Instagram and Facebook presence, creating high-quality content that drives engagement.',
        includes: [
            '3 Posts per Week',
            'Professional Photography',
            'Engagement & Replies',
            'Ad Campaign Management'
        ],
        price: 499.00,
        billingType: 'MONTHLY',
        stockStatus: 'In Stock',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop',
        active: true,
        options: [
            { id: 'platforms', label: 'Primary Platform', type: 'select', choices: ['Instagram Emphasis', 'Facebook Emphasis', 'Mixed'], required: true }
        ]
    }
];

export const MOCK_ORDERS: Order[] = [
    {
        orderId: 'ORD-5521',
        itemId: 'pkg-1',
        itemName: 'Pizza Packaging Starter Kit',
        category: 'packaging',
        amount: 149.00,
        paymentStatus: 'PAID',
        customerEmail: 'admin@pizzahut.com',
        createdAt: '2024-03-25T14:30:00Z'
    },
    {
        orderId: 'ORD-5522',
        itemId: 'mod-1',
        itemName: 'Zyappy POS Core Module',
        category: 'modules',
        amount: 29.00,
        paymentStatus: 'PAID',
        customerEmail: 'manager@taco-bell.com',
        createdAt: '2024-03-26T09:15:00Z'
    }
];
