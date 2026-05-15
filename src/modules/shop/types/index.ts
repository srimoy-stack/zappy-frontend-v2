export type BillingType = 'ONE_TIME' | 'MONTHLY';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Best Seller';

export interface CustomizationOption {
    id: string;
    label: string;
    type: 'select' | 'text' | 'file';
    choices?: string[];
    placeholder?: string;
    required?: boolean;
}

export interface ShopItem {
    id: string;
    name: string;
    category: string;
    description: string;
    shortDescription: string;
    includes: string[];
    price: number;
    billingType: BillingType;
    stockStatus: StockStatus;
    image: string;
    active: boolean;
    options?: CustomizationOption[];
}

export interface Order {
    orderId: string;
    itemId: string;
    itemName: string;
    category: string;
    amount: number;
    paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
    customerEmail: string;
    createdAt: string;
    selections?: Record<string, string>;
}

export interface Category {
    id: string;
    name: string;
    title: string;
    subtitle: string;
}

export interface CartItem extends ShopItem {
    quantity: number;
    selections: Record<string, string>;
}
