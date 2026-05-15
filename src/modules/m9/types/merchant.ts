export interface MerchantLocation {
    id: string;
    locationId: string; // Unique location identifier
    name: string;
    landmark: string;
    address: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
    contact: string; // Contact person name
    phone: string;
    email: string;
    tax: string; // Tax ID or registration number
    timezone: string;
    priceGroup: string;
    invoiceScheme: string;
    invoiceLayoutPOS: string;
    invoiceLayoutSale: string;
    status: 'Active' | 'Inactive';
    timings: {
        day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
        openTime: string;
        closeTime: string;
        isOpen: boolean;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface Merchant {
    id: string;
    name: string;
    description: string;
    logoUrl?: string;
    status: 'Active' | 'Inactive';
    totalLocations: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationPayload {
    name: string;
    landmark: string;
    address: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
    contact: string;
    phone: string;
    email: string;
    tax: string;
    timezone: string;
    priceGroup: string;
    invoiceScheme: string;
    invoiceLayoutPOS: string;
    invoiceLayoutSale: string;
    timings: MerchantLocation['timings'];
}
