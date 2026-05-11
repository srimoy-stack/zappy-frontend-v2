export type OrderChannel = 'POS' | 'ONLINE' | 'UBER' | 'APP';
export type OrderStatus = 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface Customer {
    id: string; // Internal ID
    contactId: string; // Display ID (e.g. CO92702)
    businessName: string;
    name: string;
    email: string;
    taxNumber: string;
    creditLimit: string; // e.g. "No Limit" or value
    payTerm: string; // e.g. "0"
    openingBalance: number;
    advanceBalance: number;
    addedOn: string;
    group: string; // e.g. "Call Center"
    address: string;
    mobile: string;
    totalSaleDue: number;
    totalSellReturnDue: number;
    status: 'Active' | 'Inactive'; // Customer Status

    // Legacy/Details View fields (kept for compatibility with profile view)
    totalOrders?: number;
    lastOrderDate?: string;
    totalSpend?: number;
    loyaltyTier?: LoyaltyTier;
    loyaltyPoints?: number;
}

export interface CustomerOrder {
    id: string;
    date: string;
    storeName: string;
    storeId: string;
    channel: OrderChannel;
    itemsSummary: string;
    totalAmount: number;
    status: OrderStatus;
    isReorderable: boolean;
}

export interface CustomerDetails extends Customer {
    orderHistory: CustomerOrder[];
}

export interface CustomerFilters {
    searchQuery: string;
    channel?: OrderChannel;
    startDate?: string;
    endDate?: string;
}

export interface ColumnVisibilitySettings {
    action: boolean;
    contactId: boolean;
    businessName: boolean;
    name: boolean;
    email: boolean;
    taxNumber: boolean;
    creditLimit: boolean;
    payTerm: boolean;
    openingBalance: boolean;
    advanceBalance: boolean;
    addedOn: boolean;
    group: boolean;
    address: boolean;
    mobile: boolean;
    totalSaleDue: boolean;
    totalSellReturnDue: boolean;
    status: boolean;
}
