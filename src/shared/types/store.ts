/**
 * Store Types — Single Source of Truth
 */

export type StoreStatus = 'Active' | 'Inactive' | 'Pending';

export interface Store {
    id: string;
    name: string;
    code: string;
    tenantId: string;
    timezone: string;
    city: string;
    province: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    status: StoreStatus;
    paymentTerms: string;
    taxProfile: 'Inherit' | 'Override';
    taxScheme?: string;
    taxRate?: number;
    logoStatus: 'Set' | 'Default';
}

/** DTO for POST /stores */
export interface CreateStoreDTO {
    name: string;
    code: string;
    address?: string;
    city: string;
    province: string;
    postalCode?: string;
    country?: string;
    timezone: string;
    phone?: string;
    email?: string;
    paymentTerms?: string;
    taxSetup?: {
        scheme: string;
        rate: number;
    };
}
