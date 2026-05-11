export type UserRole = 'BRAND_ADMIN' | 'ADMIN' | 'STORE_MANAGER' | 'EMPLOYEE' | 'POS_USER' | 'KDS_USER' | 'PLATFORM_SUPER_ADMIN';
export type UserType = 'ADMIN_USER' | 'BACKEND_USER' | 'POS_USER' | 'KDS_USER';

export interface User {
    id: string;
    name: string;
    email: string;
    userType: string;
    role: UserRole;
    storeIds: string[];
    tenantId: string;
    status: 'Active' | 'Inactive' | 'Pending';
    lastLogin: string | null;
    avatarUrl?: string;
}

export interface Session {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
}

export interface Store {
    id: string;
    name: string;
    code: string;
    tenantId: string;
    timezone: string;
    city: string;
    province: string;
    status: 'Active' | 'Inactive' | 'Pending';
    paymentTerms: string;
    taxProfile: 'Inherit' | 'Override';
    taxScheme?: string;
    taxRate?: number;
    logoStatus: 'Set' | 'Default';
}

export interface TenantStoreContextType {
    tenant: Tenant | null;
    store: Store | null;
    allStores: Store[];
    setTenant: (tenant: Tenant) => void;
    setStore: (store: Store) => void;
    isLoading: boolean;
}

export type BrandStatus = 'Active' | 'Suspended';

export interface Brand {
    id: string;
    brandLegalName: string;
    brandName: string;
    tradeName: string;
    address: string;
    timezone: string;
    currency: string;
    primaryContact: string;
    contactPhone: string;
    status: BrandStatus;
    createdDate: string;
    createdBy: string;
    totalStores: number;
    province: string;
    modulesPurchasedCount: number;
    plan: string;
    slug: string;
    lightLogo: string;
    darkLogo: string;
    defaultPaymentTerms: string;
    defaultTaxScheme: string;
    defaultTaxRate: number;
}

export type ModuleId = 'pos' | 'inventory' | 'kiosk' | 'loyalty' | 'analytics' | 'web-shop' | 'kds' | 'email-campaigns';

export interface ModuleEntitlement {
    id: ModuleId;
    name: string;
    purchased: boolean;
    enabled: boolean;
    startDate: string | null;
    notes?: string;
    isCore?: boolean;
}
