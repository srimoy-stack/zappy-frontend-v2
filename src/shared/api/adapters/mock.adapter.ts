/**
 * Mock Adapter — Development & Testing
 *
 * Returns static fixture data with simulated delays.
 * Used when NEXT_PUBLIC_API_MODE=mock (default).
 *
 * Mutations are persisted to sessionStorage within the current tab.
 */

import type { ApiAdapter } from './adapter.interface';
import type { MeResponse, PaginatedResponse } from '@/shared/types/api';
import type { User } from '@/shared/types/user';
import type { Brand } from '@/shared/types/tenant';
import type { Store, StoreDetailConfig, StoreUser } from '@/shared/types/store';
import { createDefaultStoreDetailConfig } from '@/shared/types/store';
import type { Role } from '@/shared/types/role';
import type { TenantModule } from '@/shared/types/module';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const genId = (prefix: string) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

function getStore<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = sessionStorage.getItem(`mock_${key}`);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function setStore<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`mock_${key}`, JSON.stringify(value));
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_ME: MeResponse = {
    id: 'user-001',
    name: 'Platform Admin',
    email: 'admin@zyappy.com',
    role: 'PLATFORM_SUPER_ADMIN',
    tenant: null, // Super admin has no tenant
    stores: [],
    permissions: [
        'tenants.view', 'tenants.create', 'tenants.edit', 'tenants.suspend',
        'users.view', 'users.create', 'users.edit', 'users.delete',
        'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
        'stores.view', 'stores.create', 'stores.edit',
        'modules.view', 'modules.assign',
        'items.view', 'items.create', 'items.edit',
        'inventory.view', 'inventory.create',
        'pos.access', 'kds.access', 'kiosk.access',
        'reports.view', 'finances.view',
    ],
    enabledModules: ['pos', 'inventory', 'kiosk', 'kds', 'messaging', 'email-campaigns', 'analytics', 'ai-call-analytics'],
};

const MOCK_BRANDS: Brand[] = [
    {
        id: 'brand-001', brandLegalName: 'Acme Pizza Co. Ltd.', brandName: 'Acme Pizza Co.',
        tradeName: 'Acme Pizza', address: '123 Main St, Toronto', timezone: 'America/Toronto',
        currency: 'CAD', primaryContact: 'john@acmepizza.com', contactPhone: '+1-416-555-0100',
        status: 'Operational', createdDate: '2025-06-15', createdBy: 'admin', totalStores: 12,
        totalUsers: 45, enabledModules: ['pos', 'inventory', 'online-ordering', 'reports', 'email-campaigns'],
        province: 'Ontario', modulesPurchasedCount: 5, plan: 'Enterprise', slug: 'acme-pizza',
        lightLogo: '', darkLogo: '', defaultPaymentTerms: 'Net 30',
        defaultTaxScheme: 'HST', defaultTaxRate: 13,
        lastActivity: '2026-05-07T14:30:00Z', onboardingProgress: 100
    },
    {
        id: 'brand-002', brandLegalName: 'QuickBite Foods Ltd.', brandName: 'QuickBite Foods',
        tradeName: 'QuickBite', address: '456 Elm St, Vancouver', timezone: 'America/Vancouver',
        currency: 'CAD', primaryContact: 'sarah@quickbite.ca', contactPhone: '+1-604-555-0200',
        status: 'Configuring', createdDate: '2025-08-22', createdBy: 'admin', totalStores: 8,
        totalUsers: 12, enabledModules: ['pos', 'inventory', 'reports'],
        province: 'British Columbia', modulesPurchasedCount: 3, plan: 'Growth', slug: 'quickbite',
        lightLogo: '', darkLogo: '', defaultPaymentTerms: 'Net 15',
        defaultTaxScheme: 'GST+PST', defaultTaxRate: 12,
        lastActivity: '2026-05-06T09:15:00Z', onboardingProgress: 65
    },
    {
        id: 'brand-003', brandLegalName: 'Burger Nation Inc.', brandName: 'Burger Nation',
        tradeName: 'Burger Nation', address: '789 Oak Ave, Calgary', timezone: 'America/Edmonton',
        currency: 'CAD', primaryContact: 'admin@burgernation.ca', contactPhone: '+1-403-555-0300',
        status: 'Suspended', createdDate: '2025-03-04', createdBy: 'admin', totalStores: 3,
        totalUsers: 5, enabledModules: ['pos', 'inventory'],
        province: 'Alberta', modulesPurchasedCount: 2, plan: 'Starter', slug: 'burger-nation',
        lightLogo: '', darkLogo: '', defaultPaymentTerms: 'Net 30',
        defaultTaxScheme: 'GST', defaultTaxRate: 5,
        lastActivity: '2026-01-20T11:00:00Z', onboardingProgress: 100
    },
];

const MOCK_STORES: Store[] = [
    {
        id: 'store-001', name: 'Downtown Toronto', code: 'DT-001', tenantId: 'brand-001',
        timezone: 'America/Toronto', city: 'Toronto', province: 'Ontario', status: 'Active',
        paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Set',
        address: '100 King St W', postalCode: 'M5X 1A1', country: 'Canada',
        phone: '+1 (416) 555-0101', email: 'downtown@acmepizza.com',
        deliveryRadiusKm: 8, latitude: 43.6488, longitude: -79.3853,
        usersCount: 7, adminName: 'Sarah Chen', adminEmail: 'sarah@acmepizza.com',
        createdAt: '2025-06-20',
    },
    {
        id: 'store-002', name: 'Midtown Branch', code: 'MT-002', tenantId: 'brand-001',
        timezone: 'America/Toronto', city: 'Toronto', province: 'Ontario', status: 'Active',
        paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Default',
        address: '55 Bloor St W', postalCode: 'M4W 1A5', country: 'Canada',
        phone: '+1 (416) 555-0202', email: 'midtown@acmepizza.com',
        deliveryRadiusKm: 5, latitude: 43.6710, longitude: -79.3886,
        usersCount: 4, adminName: 'Mike Patel', adminEmail: 'mike@acmepizza.com',
        createdAt: '2025-07-02',
    },
    {
        id: 'store-003', name: 'Scarborough East', code: 'SC-003', tenantId: 'brand-001',
        timezone: 'America/Toronto', city: 'Scarborough', province: 'Ontario', status: 'Active',
        paymentTerms: 'Net 15', taxProfile: 'Override', logoStatus: 'Set',
        address: '300 Borough Dr', postalCode: 'M1P 4P5', country: 'Canada',
        phone: '+1 (416) 555-0303', email: 'scarborough@acmepizza.com',
        taxScheme: 'HST', taxRate: 13,
        deliveryRadiusKm: 12, latitude: 43.7731, longitude: -79.2578,
        usersCount: 5, adminName: 'Lisa Wong', adminEmail: 'lisa@acmepizza.com',
        createdAt: '2025-07-15',
    },
];

const MOCK_STORE_USERS: StoreUser[] = [
    { id: 'su-1', name: 'Sarah Chen', email: 'sarah@acmepizza.com', role: 'Store Manager', status: 'Active', isManager: true, lastLogin: '2026-05-07T14:30:00Z', createdAt: '2025-06-20' },
    { id: 'su-2', name: 'James Liu', email: 'james@acmepizza.com', role: 'Cashier', status: 'Active', isManager: false, lastLogin: '2026-05-07T09:00:00Z', createdAt: '2025-07-01' },
    { id: 'su-3', name: 'Priya Patel', email: 'priya@acmepizza.com', role: 'Cashier', status: 'Active', isManager: false, lastLogin: '2026-05-06T16:45:00Z', createdAt: '2025-07-15' },
    { id: 'su-4', name: 'Alex Rodriguez', email: 'alex@acmepizza.com', role: 'Kitchen Staff', status: 'Pending', isManager: false, createdAt: '2026-04-20' },
];

const MOCK_ROLES: Role[] = [
    { id: 'role-admin', name: 'Administrator', description: 'Full access', permissions: ['*'], isSystem: true, createdAt: '2025-01-01' },
    { id: 'role-manager', name: 'Store Manager', description: 'Store-level management', permissions: ['users.view', 'items.view', 'items.edit', 'pos.access', 'reports.view'], isSystem: true, createdAt: '2025-01-01' },
    { id: 'role-cashier', name: 'Cashier', description: 'POS operations only', permissions: ['pos.access', 'items.view'], isSystem: false, createdAt: '2025-02-15' },
];

const MOCK_MODULES: TenantModule[] = [
    { 
        id: 'tm-pos', moduleId: 'pos', name: 'Point of Sale', purchased: true, enabled: true, startDate: '2025-01-01', isCore: true,
        subModules: [
            { id: 'register', name: 'Register Operations', enabled: true, pages: [{ id: 'sales', name: 'Sales Entry', enabled: true }, { id: 'returns', name: 'Returns', enabled: true }] },
            { id: 'hardware', name: 'Hardware Integration', enabled: true, pages: [{ id: 'printers', name: 'Printers', enabled: true }, { id: 'terminals', name: 'Payment Terminals', enabled: true }] }
        ]
    },
    { 
        id: 'tm-customers', moduleId: 'customers', name: 'Customer Management', purchased: true, enabled: false, startDate: null,
        subModules: [
            { 
                id: 'directory', name: 'Customer Directory', enabled: false, 
                pages: [
                    { id: 'view', name: 'View Customers', enabled: false },
                    { id: 'create', name: 'Create Customer', enabled: false },
                    { id: 'edit', name: 'Edit Customer', enabled: false },
                    { id: 'delete', name: 'Delete Customer', enabled: false }
                ] 
            },
            { id: 'groups', name: 'Customer Groups', enabled: false, pages: [{ id: 'manage', name: 'Manage Groups', enabled: false }] }
        ]
    },
    { 
        id: 'tm-finance', moduleId: 'finances', name: 'Financial Orchestration', purchased: true, enabled: false, startDate: null,
        subModules: [
            { id: 'ledger', name: 'General Ledger', enabled: false, pages: [{ id: 'view', name: 'View Transactions', enabled: false }, { id: 'audit', name: 'Audit Logs', enabled: false }] },
            { id: 'payouts', name: 'Payout Management', enabled: false, pages: [{ id: 'history', name: 'Payout History', enabled: false }] }
        ]
    },
    { 
        id: 'tm-items', moduleId: 'items', name: 'Item & Catalog Management', purchased: true, enabled: false, startDate: null,
        subModules: [
            { 
                id: 'catalog', name: 'Product Catalog', enabled: false, 
                pages: [
                    { id: 'view', name: 'View Items', enabled: false },
                    { id: 'create', name: 'Add New Item', enabled: false },
                    { id: 'edit', name: 'Edit Item', enabled: false },
                    { id: 'delete', name: 'Delete Item', enabled: false }
                ] 
            },
            { id: 'categories', name: 'Categories', enabled: false, pages: [{ id: 'manage', name: 'Manage Categories', enabled: false }] }
        ]
    },
    { 
        id: 'tm-users', moduleId: 'users', name: 'User & Access Control', purchased: true, enabled: false, startDate: null,
        subModules: [
            { id: 'staff', name: 'Staff Directory', enabled: false, pages: [{ id: 'view', name: 'View Staff', enabled: false }, { id: 'manage', name: 'Manage Staff', enabled: false }] },
            { id: 'roles', name: 'Role Management', enabled: false, pages: [{ id: 'view', name: 'View Roles', enabled: false }, { id: 'edit', name: 'Edit Permissions', enabled: false }] }
        ]
    },
    { 
        id: 'tm-email', moduleId: 'email-campaigns', name: 'Email Campaigns', purchased: true, enabled: false, startDate: null,
        subModules: [
            { id: 'campaigns', name: 'Campaign Orchestration', enabled: false, pages: [{ id: 'create', name: 'Create Campaign', enabled: false }, { id: 'analytics', name: 'Campaign Analytics', enabled: false }] },
            { id: 'templates', name: 'Template Builder', enabled: false, pages: [{ id: 'manage', name: 'Manage Templates', enabled: false }] }
        ]
    },
    { 
        id: 'tm-call', moduleId: 'ai-call-analytics', name: 'AI Call Analytics', purchased: true, enabled: false, startDate: null,
        subModules: [
            { id: 'insights', name: 'Call Insights', enabled: false, pages: [{ id: 'recordings', name: 'View Recordings', enabled: false }, { id: 'sentiment', name: 'Sentiment Analysis', enabled: false }] }
        ]
    },
    { 
        id: 'tm-inventory', moduleId: 'inventory', name: 'Inventory Control', purchased: true, enabled: false, startDate: null,
        subModules: [
            { id: 'stock', name: 'Stock Levels', enabled: false, pages: [{ id: 'view', name: 'View Stock', enabled: false }, { id: 'adjust', name: 'Adjust Inventory', enabled: false }] },
            { id: 'transfers', name: 'Stock Transfers', enabled: false, pages: [{ id: 'create', name: 'Create Transfer', enabled: false }] }
        ]
    },
    { 
        id: 'tm-kds', moduleId: 'kds', name: 'Kitchen Display System', purchased: true, enabled: false, startDate: null,
        subModules: [
            { id: 'stations', name: 'Kitchen Stations', enabled: false, pages: [{ id: 'monitor', name: 'Station Monitor', enabled: false }] }
        ]
    },
    { 
        id: 'tm-reports', moduleId: 'reports', name: 'Enterprise Reporting', purchased: true, enabled: false, startDate: null,
        subModules: [
            { id: 'sales-reports', name: 'Sales Reports', enabled: false, pages: [{ id: 'daily', name: 'Daily Summary', enabled: false }, { id: 'monthly', name: 'Monthly Analysis', enabled: false }] }
        ]
    }
];

// ─── Mock Adapter ────────────────────────────────────────────────────────────

export const mockAdapter: ApiAdapter = {
    // ─── Auth ────────────────────────────────────────────
    async getMe(): Promise<MeResponse> {
        await delay(200);
        return { ...MOCK_ME };
    },

    // ─── Tenants ─────────────────────────────────────────
    async getTenants(params): Promise<PaginatedResponse<Brand>> {
        await delay(400);
        let brands = getStore('brands', MOCK_BRANDS);
        if (params?.status) brands = brands.filter((b: Brand) => b.status === params.status);
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;
        const start = (page - 1) * pageSize;
        return {
            data: brands.slice(start, start + pageSize),
            total: brands.length,
            page,
            pageSize,
            totalPages: Math.ceil(brands.length / pageSize),
        };
    },

    async getTenant(id): Promise<Brand> {
        await delay(200);
        const brands = getStore('brands', MOCK_BRANDS);
        const brand = brands.find((b: Brand) => b.id === id);
        if (!brand) throw new Error(`Brand ${id} not found`);
        return brand;
    },

    async createTenant(dto): Promise<Brand> {
        await delay(500);
        const brands = getStore('brands', MOCK_BRANDS);
        const newBrand: Brand = {
            id: genId('brand'),
            brandLegalName: dto.brandLegalName,
            brandName: dto.brandName,
            tradeName: dto.tradeName,
            address: dto.address,
            timezone: dto.timezone,
            currency: dto.currency,
            primaryContact: dto.contactEmail,
            contactPhone: dto.contactPhone,
            status: 'Draft', // Starts as Draft in Phase 1
            createdDate: new Date().toISOString().split('T')[0] || '',
            createdBy: 'admin',
            totalStores: 0,
            province: '',
            modulesPurchasedCount: 0,
            plan: 'Starter',
            slug: dto.brandName.toLowerCase().replace(/\s+/g, '-'),
            lightLogo: '',
            darkLogo: '',
            defaultPaymentTerms: dto.defaultPaymentTerms || 'Net 30',
            defaultTaxScheme: dto.defaultTaxScheme || 'HST',
            defaultTaxRate: dto.defaultTaxRate || 13,
        };
        brands.push(newBrand);
        setStore('brands', brands);
        return newBrand;
    },

    async updateTenant(id, dto): Promise<Brand> {
        await delay(300);
        const brands = getStore('brands', MOCK_BRANDS);
        const idx = brands.findIndex((b: Brand) => b.id === id);
        if (idx === -1) throw new Error(`Brand ${id} not found`);
        const existing = brands[idx]!;
        const updated: Brand = { ...existing, ...dto } as Brand;
        brands[idx] = updated;
        setStore('brands', brands);
        return updated;
    },

    async suspendTenant(id): Promise<Brand> {
        return this.updateTenant(id, { status: 'Suspended' } as any);
    },

    async activateTenant(id): Promise<Brand> {
        return this.updateTenant(id, { status: 'Active' } as any);
    },

    // ─── Stores ──────────────────────────────────────────
    async getStores(tenantId): Promise<Store[]> {
        await delay(300);
        const stores = getStore('stores', MOCK_STORES);
        return stores.filter((s: Store) => s.tenantId === tenantId);
    },

    async getStore(tenantId, storeId): Promise<Store> {
        await delay(200);
        const stores = getStore('stores', MOCK_STORES);
        const store = stores.find((s: Store) => s.id === storeId && s.tenantId === tenantId);
        if (!store) throw new Error(`Store ${storeId} not found`);
        return store;
    },

    async createStore(tenantId, dto): Promise<Store> {
        await delay(400);
        const stores = getStore('stores', MOCK_STORES);
        const newStore: Store = {
            id: genId('store'),
            name: dto.name,
            code: dto.code,
            tenantId,
            timezone: dto.timezone,
            city: dto.city,
            province: dto.province,
            status: 'Active',
            paymentTerms: dto.paymentTerms || 'Net 30',
            taxProfile: 'Inherit',
            logoStatus: 'Default',
        };
        stores.push(newStore);
        setStore('stores', stores);
        return newStore;
    },

    async updateStore(tenantId, storeId, dto): Promise<Store> {
        await delay(300);
        const stores = getStore('stores', MOCK_STORES);
        const idx = stores.findIndex((s: Store) => s.id === storeId && s.tenantId === tenantId);
        if (idx === -1) throw new Error(`Store ${storeId} not found`);
        const existing = stores[idx]!;
        const updated: Store = { ...existing, ...dto } as Store;
        stores[idx] = updated;
        setStore('stores', stores);
        return updated;
    },

    async suspendStore(tenantId, storeId): Promise<Store> {
        return this.updateStore(tenantId, storeId, { status: 'Inactive' } as any);
    },

    async activateStore(tenantId, storeId): Promise<Store> {
        return this.updateStore(tenantId, storeId, { status: 'Active' } as any);
    },

    async deleteStore(tenantId, storeId): Promise<void> {
        await delay(200);
        const stores = getStore('stores', MOCK_STORES);
        setStore('stores', stores.filter((s: Store) => !(s.id === storeId && s.tenantId === tenantId)));
    },

    async getStoreConfig(tenantId, storeId): Promise<StoreDetailConfig> {
        await delay(200);
        const configs = getStore<Record<string, StoreDetailConfig>>('store_configs', {});
        return configs[`${tenantId}_${storeId}`] || createDefaultStoreDetailConfig();
    },

    async updateStoreConfig(tenantId, storeId, config): Promise<StoreDetailConfig> {
        await delay(300);
        const configs = getStore<Record<string, StoreDetailConfig>>('store_configs', {});
        const key = `${tenantId}_${storeId}`;
        const existing = configs[key] || createDefaultStoreDetailConfig();
        configs[key] = { ...existing, ...config } as StoreDetailConfig;
        setStore('store_configs', configs);
        return configs[key]!;
    },

    async getStoreUsers(tenantId, storeId): Promise<StoreUser[]> {
        await delay(200);
        const stores = getStore('stores', MOCK_STORES);
        const store = stores.find((s: Store) => s.id === storeId && s.tenantId === tenantId);
        if (!store) return [];
        // Return mock users — keyed by storeId for isolation
        const allUsers = getStore<Record<string, StoreUser[]>>('store_users', {});
        return allUsers[storeId] || MOCK_STORE_USERS;
    },

    async assignStoreManager(tenantId, storeId, userId): Promise<void> {
        await delay(300);
        const allUsers = getStore<Record<string, StoreUser[]>>('store_users', {});
        const users = allUsers[storeId] || [...MOCK_STORE_USERS];
        // Demote current manager, promote new one
        const updated = users.map((u: StoreUser) => ({
            ...u,
            isManager: u.id === userId,
        }));
        allUsers[storeId] = updated;
        setStore('store_users', allUsers);
    },

    // ─── Users ───────────────────────────────────────────
    async getUsers(params): Promise<PaginatedResponse<User>> {
        await delay(300);
        let users = getStore<User[]>('users', []);
        
        if (params?.userType) {
            users = users.filter(u => u.userType === params.userType);
        }
        if (params?.roleId) {
            users = users.filter(u => u.role.id === params.roleId);
        }
        if (params?.status) {
            users = users.filter(u => u.status === params.status);
        }

        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;
        const start = (page - 1) * pageSize;
        return {
            data: users.slice(start, start + pageSize),
            total: users.length,
            page,
            pageSize,
            totalPages: Math.ceil(users.length / pageSize) || 1,
        };
    },

    async getUser(id): Promise<User> {
        await delay(200);
        const users = getStore<User[]>('users', []);
        const user = users.find((u) => u.id === id);
        if (!user) throw new Error(`User ${id} not found`);
        return user;
    },

    async createUser(dto): Promise<User> {
        await delay(400);
        const users = getStore<User[]>('users', []);
        const roles = getStore<Role[]>('roles', MOCK_ROLES);
        const role = roles.find((r) => r.id === dto.roleId);
        
        const newUser: User = {
            id: genId('user'),
            name: dto.fullName,
            fullName: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            userType: dto.userType,
            role: {
                id: role?.id || 'role-guest',
                name: role?.name || 'Guest',
                permissions: role?.permissions || [],
                isSystem: role?.isSystem || false,
            },
            storeIds: dto.assignedStoreIds,
            tenantId: dto.tenantId || 'brand-001',
            status: 'Pending',
            lastLogin: null,
            createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        setStore('users', users);
        return newUser;
    },

    async updateUser(id, dto): Promise<User> {
        await delay(300);
        const users = getStore<User[]>('users', []);
        const idx = users.findIndex((u) => u.id === id);
        if (idx === -1) throw new Error(`User ${id} not found`);
        const existing = users[idx]!;
        const updated: User = { ...existing, ...dto } as User;
        users[idx] = updated;
        setStore('users', users);
        return updated;
    },

    async deleteUser(id): Promise<void> {
        await delay(200);
        const users = getStore<User[]>('users', []);
        setStore('users', users.filter((u) => u.id !== id));
    },

    // ─── Roles ───────────────────────────────────────────
    async getRoles(): Promise<Role[]> {
        await delay(200);
        return getStore('roles', MOCK_ROLES);
    },

    async getRole(id): Promise<Role> {
        await delay(200);
        const roles = getStore('roles', MOCK_ROLES);
        const role = roles.find((r: Role) => r.id === id);
        if (!role) throw new Error(`Role ${id} not found`);
        return role;
    },

    async createRole(dto): Promise<Role> {
        await delay(400);
        const roles = getStore('roles', MOCK_ROLES);
        const newRole: Role = {
            id: genId('role'),
            name: dto.name,
            description: dto.description,
            permissions: dto.permissions,
            isSystem: false,
            createdAt: new Date().toISOString(),
        };
        roles.push(newRole);
        setStore('roles', roles);
        return newRole;
    },

    async updateRole(id, dto): Promise<Role> {
        await delay(300);
        const roles = getStore('roles', MOCK_ROLES);
        const idx = roles.findIndex((r: Role) => r.id === id);
        if (idx === -1) throw new Error(`Role ${id} not found`);
        const existing = roles[idx]!;
        const updated: Role = { ...existing, ...dto } as Role;
        roles[idx] = updated;
        setStore('roles', roles);
        return updated;
    },

    async deleteRole(id): Promise<void> {
        await delay(200);
        const roles = getStore('roles', MOCK_ROLES);
        const role = roles.find((r: Role) => r.id === id);
        if (role?.isSystem) throw new Error('Cannot delete system role');
        setStore('roles', roles.filter((r: Role) => r.id !== id));
    },

    // ─── Modules ─────────────────────────────────────────
    async getModules(): Promise<TenantModule[]> {
        await delay(200);
        return getStore('modules', MOCK_MODULES);
    },

    async getTenantModules(_tenantId: string): Promise<TenantModule[]> {
        await delay(200);
        return getStore('modules', MOCK_MODULES);
    },

    async setTenantModules(_tenantId, modules): Promise<TenantModule[]> {
        await delay(400);
        const existing = getStore('modules', MOCK_MODULES);
        modules.forEach((m) => {
            const idx = existing.findIndex((e: TenantModule) => e.moduleId === m.moduleId);
            if (idx >= 0) {
                const entry = existing[idx]!;
                entry.purchased = m.purchased;
                entry.enabled = m.enabled;
                if (m.startDate) entry.startDate = m.startDate;
            } else {
                existing.push({
                    id: genId('tm'),
                    moduleId: m.moduleId,
                    name: m.moduleId,
                    purchased: m.purchased,
                    enabled: m.enabled,
                    startDate: m.startDate || null,
                });
            }
        });
        setStore('modules', existing);
        return existing;
    },

    // ─── Config ──────────────────────────────────────────
    async getTenantConfig(tenantId: string): Promise<any> {
        await delay(200);
        const configs = getStore<Record<string, any>>('tenant_configs', {});
        return configs[tenantId] || {
            email: { provider: 'smtp', senderEmail: '', senderName: '' },
            sms: { provider: 'twilio', senderId: '' }
        };
    },

    async updateTenantConfig(tenantId: string, data: any): Promise<any> {
        await delay(300);
        const configs = getStore<Record<string, any>>('tenant_configs', {});
        configs[tenantId] = { ...configs[tenantId], ...data };
        setStore('tenant_configs', configs);
        return configs[tenantId];
    },

    // ─── Delete Tenant ──────────────────────────────────
    async deleteTenant(id: string): Promise<void> {
        await delay(200);
        const brands = getStore('brands', MOCK_BRANDS);
        setStore('brands', brands.filter((b: Brand) => b.id !== id));
    },

    // ─── Permissions (mock stubs) ───────────────────────
    async getPermissions(): Promise<any[]> {
        await delay(200);
        return [
            { id: 1, code: 'users.view', name: 'View Users', module: 'users', is_active: true },
            { id: 2, code: 'users.create', name: 'Create Users', module: 'users', is_active: true },
            { id: 3, code: 'roles.view', name: 'View Roles', module: 'roles', is_active: true },
            { id: 4, code: 'roles.create', name: 'Create Roles', module: 'roles', is_active: true },
            { id: 5, code: 'tenants.manage', name: 'Manage Tenants', module: 'tenants', is_active: true },
            { id: 6, code: 'stores.manage', name: 'Manage Stores', module: 'stores', is_active: true },
        ];
    },

    async getPermissionsByModule(): Promise<any[]> {
        await delay(200);
        return [
            { module: 'users', permissions: [{ id: 1, code: 'users.view', name: 'View Users', module: 'users' }, { id: 2, code: 'users.create', name: 'Create Users', module: 'users' }] },
            { module: 'roles', permissions: [{ id: 3, code: 'roles.view', name: 'View Roles', module: 'roles' }, { id: 4, code: 'roles.create', name: 'Create Roles', module: 'roles' }] },
            { module: 'tenants', permissions: [{ id: 5, code: 'tenants.manage', name: 'Manage Tenants', module: 'tenants' }] },
            { module: 'stores', permissions: [{ id: 6, code: 'stores.manage', name: 'Manage Stores', module: 'stores' }] },
        ];
    },

    async assignPermission(_roleId: number, _permissionId: number): Promise<void> {
        await delay(200);
    },

    async removePermission(_roleId: number, _permissionId: number): Promise<void> {
        await delay(200);
    },
};
