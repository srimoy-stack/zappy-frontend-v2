/**
 * HTTP Adapter — Real FastAPI Backend
 *
 * Calls actual FastAPI endpoints. Used when NEXT_PUBLIC_API_MODE=live.
 *
 * Route mapping:
 *   Auth:    /api/auth/*
 *   Users:   /api/users/*
 *   Roles:   /api/roles/*
 *   Tenants: /pos/tenants/*
 *   Stores:  /pos/stores/*
 */

import { apiClient } from '@/shared/api/apiClient';
import type { ApiAdapter } from './adapter.interface';
import type { MeResponse, PaginatedResponse } from '@/shared/types/api';
import type { User, CreateUserDTO } from '@/shared/types/user';
import type { Brand, CreateTenantDTO } from '@/shared/types/tenant';
import type { Store, CreateStoreDTO, StoreDetailConfig, StoreUser, StorePageData, OperatingHours, DayOfWeek, ChannelKey } from '@/shared/types/store';
import { createDefaultStoreDetailConfig } from '@/shared/types/store';
import type { Role, CreateRoleDTO } from '@/shared/types/role';
import type { TenantModule } from '@/shared/types/module';
import type { BackendPermission, BackendPermissionsByModule } from './normalizeBackend';
import {
    normalizeTenant,
    normalizeUser,
    normalizeRole,
    normalizeStore,
    wrapAsPaginated,
} from './normalizeBackend';

function parseOperatingHours(backendHours: any): OperatingHours {
    const defaultHours = createDefaultStoreDetailConfig().operatingHours;
    if (!backendHours) return defaultHours;

    // Check if it's already in frontend format (has channel keys as arrays)
    if (backendHours.pos && Array.isArray(backendHours.pos)) {
        return backendHours as OperatingHours;
    }

    const days = backendHours.days;
    if (!days) return defaultHours;

    const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const channels: ChannelKey[] = ['pos', 'online', 'kiosk', 'delivery', 'dineIn', 'callCenter'];

    const result: OperatingHours = { ...defaultHours };

    channels.forEach(ch => {
        result[ch] = daysOfWeek.map(day => {
            const dayKey = day.toLowerCase();
            const dayData = days[dayKey];
            
            // Check if dayData exists and has channel data
            const channelData = dayData?.[ch];
            if (channelData) {
                return {
                    day,
                    openTime: channelData.open || '09:00',
                    closeTime: channelData.close || '22:00',
                    isOpen: channelData.enabled ?? (channelData.is_closed !== undefined ? !channelData.is_closed : true),
                };
            }
            
            // Fallback
            const isDayClosed = dayData?.is_closed ?? false;
            const defaultSlot = defaultHours[ch]?.find(s => s.day === day);
            return {
                day,
                openTime: defaultSlot?.openTime || '09:00',
                closeTime: defaultSlot?.closeTime || '22:00',
                isOpen: isDayClosed ? false : (defaultSlot?.isOpen ?? true),
            };
        });
    });

    return result;
}

export const httpAdapter: ApiAdapter = {
    // ─── Auth ────────────────────────────────────────────
    async getMe(): Promise<MeResponse> {
        const { data } = await apiClient.get('/api/auth/me');
        // Map FastAPI UserMeResponse → frontend MeResponse
        return {
            id: String(data.id),
            name: data.full_name || '',
            email: data.email || '',
            role: data.role || '',
            tenant: data.tenant_id ? {
                id: data.tenant_id,
                name: data.brand_name || 'Demo Pizza Brand',
                slug: data.brand_slug || 'demo-pizza',
            } : null,
            stores: [],
            permissions: data.permissions || [],
            enabledModules: [],
        };
    },

    // ─── Tenants (FastAPI: /pos/tenants/) ─────────────────
    async getTenants(params): Promise<PaginatedResponse<Brand>> {
        const skip = params?.page ? (params.page - 1) * (params?.pageSize || 50) : 0;
        const limit = params?.pageSize || 50;
        const { data } = await apiClient.get('/pos/tenants/', {
            params: { skip, limit },
        });
        // Backend returns flat array
        const items = Array.isArray(data) ? data : (data.data || []);
        const normalized = items.map(normalizeTenant);
        return wrapAsPaginated(normalized, params?.page || 1, limit);
    },

    async getTenant(id): Promise<Brand> {
        const { data } = await apiClient.get(`/pos/tenants/${id}`);
        return normalizeTenant(data);
    },

    async createTenant(dto): Promise<Brand> {
        const payload = {
            name: dto.brandName || dto.brandLegalName,
            slug: (dto.brandName || dto.brandLegalName || '')
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
            status: 'active',
        };
        const { data } = await apiClient.post('/pos/tenants/', payload);
        return normalizeTenant(data);
    },

    async updateTenant(id, dto): Promise<Brand> {
        const payload: Record<string, any> = {};
        if (dto.brandName) payload.name = dto.brandName;
        if (dto.slug) payload.slug = dto.slug;
        if (dto.status) payload.status = dto.status.toLowerCase();
        const { data } = await apiClient.patch(`/pos/tenants/${id}`, payload);
        return normalizeTenant(data);
    },

    async suspendTenant(id): Promise<Brand> {
        // No dedicated endpoint — use PATCH with status
        const { data } = await apiClient.patch(`/pos/tenants/${id}`, { status: 'suspended' });
        return normalizeTenant(data);
    },

    async activateTenant(id): Promise<Brand> {
        const { data } = await apiClient.patch(`/pos/tenants/${id}`, { status: 'active' });
        return normalizeTenant(data);
    },

    async deleteTenant(id): Promise<void> {
        await apiClient.delete(`/pos/tenants/${id}`);
    },

    // ─── Stores (FastAPI: /pos/stores/) ──────────────────
    async getStores(tenantId): Promise<Store[]> {
        const { data } = await apiClient.get('/pos/stores/', {
            params: { tenant_id: tenantId },
        });
        const items = Array.isArray(data) ? data : (data.items || data.data || []);
        return items.map(normalizeStore);
    },

    async getStore(_tenantId, storeId): Promise<Store> {
        const { data } = await apiClient.get(`/pos/stores/${storeId}`);
        return normalizeStore(data);
    },

    async createStore(tenantId, dto): Promise<Store> {
        const payload = {
            tenant_id: tenantId,
            brand_id: dto.brandId || tenantId,
            name: dto.name,
            store_name: dto.storeName || dto.name,
            store_code: dto.storeCode || dto.code || null,
            store_number: dto.storeNumber || null,
            business_type: dto.businessType || 'single_store',
            phone: dto.phone || null,
            secondary_phone: dto.secondaryPhone || null,
            email: dto.email || null,
            website: dto.website || null,
            logo: dto.logo || null,
            banner: dto.banner || null,
            address: dto.address || null,
            address_line_1: dto.addressLine1 || dto.address || null,
            address_line_2: dto.addressLine2 || null,
            city: dto.city,
            province: dto.province,
            postal_code: dto.postalCode || null,
            country: dto.country || 'Canada',
            latitude: dto.latitude || 0,
            longitude: dto.longitude || 0,
            timezone: dto.timezone || 'UTC',
            currency: dto.currency || 'USD',
            language: dto.language || 'en',
            status: (dto.status || 'Draft').toLowerCase(),
            setup_status: dto.setupStatus || 'draft',
            setup_step: dto.setupStep || 1,
            manager_id: dto.managerId || 0,
            owner_id: dto.ownerId || 0,
            delivery_radius_km: dto.deliveryRadiusKm || 5,
            image_url: dto.imageUrl || null,
            is_active: dto.isActive !== undefined ? dto.isActive : true,
            accept_orders: dto.acceptOrders !== undefined ? dto.acceptOrders : true,
            enable_pickup: dto.enablePickup !== undefined ? dto.enablePickup : true,
            enable_delivery: dto.enableDelivery !== undefined ? dto.enableDelivery : true,
            enable_dinein: dto.enableDinein !== undefined ? dto.enableDinein : false,
            enable_kiosk: dto.enableKiosk !== undefined ? dto.enableKiosk : false,
            enable_inventory: dto.enableInventory !== undefined ? dto.enableInventory : true,
            enable_ai: dto.enableAi !== undefined ? dto.enableAi : false,
            enable_loyalty: dto.enableLoyalty !== undefined ? dto.enableLoyalty : false,
            enable_marketing: dto.enableMarketing !== undefined ? dto.enableMarketing : false,
            future_orders_enabled: dto.futureOrdersEnabled !== undefined ? dto.futureOrdersEnabled : true,
            prep_capacity_limit: dto.prepCapacityLimit || 0,
            order_throttle_limit: dto.orderThrottleLimit || 0,
            pickup_enabled: dto.pickupEnabled !== undefined ? dto.pickupEnabled : true,
            delivery_enabled: dto.deliveryEnabled !== undefined ? dto.deliveryEnabled : true,
            hours_preset: dto.hoursPreset || 'standard',
            pos_opening_time: dto.posOpeningTime || null,
            pos_closing_time: dto.posClosingTime || null,
            online_opening_time: dto.onlineOpeningTime || null,
            online_closing_time: dto.onlineClosingTime || null,
            operating_hours: dto.operatingHours || {},
            delivery_provider: dto.deliveryProvider || 'internal',
            delivery_min_order_amount: dto.deliveryMinOrderAmount || 0,
            delivery_base_fee: dto.deliveryBaseFee || 0,
            free_delivery_over_amount: dto.freeDeliveryOverAmount || 0,
            delivery_estimated_minutes: dto.deliveryEstimatedMinutes || 0,
            delivery_rules: dto.deliveryRules || {},
            pickup_dinein_config: dto.pickupDineinConfig || {},
            payment_provider: dto.paymentProvider || 'moneris',
            tips_enabled: dto.tipsEnabled !== undefined ? dto.tipsEnabled : true,
            refunds_enabled: dto.refundsEnabled !== undefined ? dto.refundsEnabled : true,
            split_payments_enabled: dto.splitPaymentsEnabled !== undefined ? dto.splitPaymentsEnabled : false,
            tax_inherit_brand: dto.taxInheritBrand !== undefined ? dto.taxInheritBrand : true,
            tax_override_enabled: dto.taxOverrideEnabled !== undefined ? dto.taxOverrideEnabled : false,
            tax_config: dto.taxConfig || {},
            tip_presets: dto.tipPresets || [0],
            tip_calculation_mode: dto.tipCalculationMode || 'before_tax',
            auto_gratuity_enabled: dto.autoGratuityEnabled !== undefined ? dto.autoGratuityEnabled : false,
            fee_rules: dto.feeRules || [],
            payment_terms: dto.paymentTerms || 'net_15',
            runtime_calculation_order: dto.runtimeCalculationOrder || []
        };
        const { data } = await apiClient.post('/pos/stores/', payload);
        return normalizeStore(data);
    },

    async updateStore(_tenantId, storeId, dto): Promise<Store> {
        const payload: Record<string, any> = {};
        
        // General & Address fields
        if (dto.name !== undefined) payload.name = dto.name;
        if (dto.storeName !== undefined) payload.store_name = dto.storeName;
        if (dto.storeCode !== undefined) payload.store_code = dto.storeCode;
        if (dto.storeNumber !== undefined) payload.store_number = dto.storeNumber;
        if (dto.businessType !== undefined) payload.business_type = dto.businessType;
        if (dto.phone !== undefined) payload.phone = dto.phone;
        if (dto.secondaryPhone !== undefined) payload.secondary_phone = dto.secondaryPhone;
        if (dto.email !== undefined) payload.email = dto.email;
        if (dto.website !== undefined) payload.website = dto.website;
        if (dto.logo !== undefined) payload.logo = dto.logo;
        if (dto.banner !== undefined) payload.banner = dto.banner;
        if (dto.address !== undefined) payload.address = dto.address;
        if (dto.addressLine1 !== undefined) payload.address_line_1 = dto.addressLine1;
        if (dto.addressLine2 !== undefined) payload.address_line_2 = dto.addressLine2;
        if (dto.city !== undefined) payload.city = dto.city;
        if (dto.province !== undefined) payload.province = dto.province;
        if (dto.postalCode !== undefined) payload.postal_code = dto.postalCode;
        if (dto.country !== undefined) payload.country = dto.country;
        if (dto.latitude !== undefined) payload.latitude = dto.latitude;
        if (dto.longitude !== undefined) payload.longitude = dto.longitude;
        if (dto.timezone !== undefined) payload.timezone = dto.timezone;
        if (dto.currency !== undefined) payload.currency = dto.currency;
        if (dto.language !== undefined) payload.language = dto.language;
        if (dto.status !== undefined) {
            payload.status = dto.status.toLowerCase();
            payload.is_active = dto.status === 'Active';
        }
        if (dto.isActive !== undefined) {
            payload.is_active = dto.isActive;
            payload.status = dto.isActive ? 'active' : 'inactive';
        }
        if (dto.setupStatus !== undefined) payload.setup_status = dto.setupStatus;
        if (dto.setupStep !== undefined) payload.setup_step = dto.setupStep;
        if (dto.managerId !== undefined) payload.manager_id = dto.managerId;
        if (dto.ownerId !== undefined) payload.owner_id = dto.ownerId;
        
        // Settings & fulfillment toggles
        if (dto.deliveryRadiusKm !== undefined) payload.delivery_radius_km = dto.deliveryRadiusKm;
        if (dto.imageUrl !== undefined) payload.image_url = dto.imageUrl;
        if (dto.acceptOrders !== undefined) payload.accept_orders = dto.acceptOrders;
        if (dto.enablePickup !== undefined) payload.enable_pickup = dto.enablePickup;
        if (dto.enableDelivery !== undefined) payload.enable_delivery = dto.enableDelivery;
        if (dto.enableDinein !== undefined) payload.enable_dinein = dto.enableDinein;
        if (dto.enableKiosk !== undefined) payload.enable_kiosk = dto.enableKiosk;
        if (dto.enableInventory !== undefined) payload.enable_inventory = dto.enableInventory;
        if (dto.enableAi !== undefined) payload.enable_ai = dto.enableAi;
        if (dto.enableLoyalty !== undefined) payload.enable_loyalty = dto.enableLoyalty;
        if (dto.enableMarketing !== undefined) payload.enable_marketing = dto.enableMarketing;
        if (dto.futureOrdersEnabled !== undefined) payload.future_orders_enabled = dto.futureOrdersEnabled;
        if (dto.prepCapacityLimit !== undefined) payload.prep_capacity_limit = dto.prepCapacityLimit;
        if (dto.orderThrottleLimit !== undefined) payload.order_throttle_limit = dto.orderThrottleLimit;
        if (dto.pickupEnabled !== undefined) payload.pickup_enabled = dto.pickupEnabled;
        if (dto.deliveryEnabled !== undefined) payload.delivery_enabled = dto.deliveryEnabled;

        // Operating hours & times
        if (dto.hoursPreset !== undefined) payload.hours_preset = dto.hoursPreset;
        if (dto.posOpeningTime !== undefined) payload.pos_opening_time = dto.posOpeningTime;
        if (dto.posClosingTime !== undefined) payload.pos_closing_time = dto.posClosingTime;
        if (dto.onlineOpeningTime !== undefined) payload.online_opening_time = dto.onlineOpeningTime;
        if (dto.onlineClosingTime !== undefined) payload.online_closing_time = dto.onlineClosingTime;
        if (dto.operatingHours !== undefined) payload.operating_hours = dto.operatingHours;

        // Delivery configuration
        if (dto.deliveryProvider !== undefined) payload.delivery_provider = dto.deliveryProvider;
        if (dto.deliveryMinOrderAmount !== undefined) payload.delivery_min_order_amount = dto.deliveryMinOrderAmount;
        if (dto.deliveryBaseFee !== undefined) payload.delivery_base_fee = dto.deliveryBaseFee;
        if (dto.freeDeliveryOverAmount !== undefined) payload.free_delivery_over_amount = dto.freeDeliveryOverAmount;
        if (dto.deliveryEstimatedMinutes !== undefined) payload.delivery_estimated_minutes = dto.deliveryEstimatedMinutes;
        if (dto.deliveryRules !== undefined) payload.delivery_rules = dto.deliveryRules;
        if (dto.pickupDineinConfig !== undefined) payload.pickup_dinein_config = dto.pickupDineinConfig;

        // Payment details & tips
        if (dto.paymentProvider !== undefined) payload.payment_provider = dto.paymentProvider;
        if (dto.tipsEnabled !== undefined) payload.tips_enabled = dto.tipsEnabled;
        if (dto.refundsEnabled !== undefined) payload.refunds_enabled = dto.refundsEnabled;
        if (dto.splitPaymentsEnabled !== undefined) payload.split_payments_enabled = dto.splitPaymentsEnabled;
        if (dto.taxInheritBrand !== undefined) payload.tax_inherit_brand = dto.taxInheritBrand;
        if (dto.taxOverrideEnabled !== undefined) payload.tax_override_enabled = dto.taxOverrideEnabled;
        if (dto.taxConfig !== undefined) payload.tax_config = dto.taxConfig;
        if (dto.tipPresets !== undefined) payload.tip_presets = dto.tipPresets;
        if (dto.tipCalculationMode !== undefined) payload.tip_calculation_mode = dto.tipCalculationMode;
        if (dto.autoGratuityEnabled !== undefined) payload.auto_gratuity_enabled = dto.autoGratuityEnabled;
        if (dto.feeRules !== undefined) payload.fee_rules = dto.feeRules;
        if (dto.paymentTerms !== undefined) payload.payment_terms = dto.paymentTerms;
        if (dto.runtimeCalculationOrder !== undefined) payload.runtime_calculation_order = dto.runtimeCalculationOrder;

        const { data } = await apiClient.patch(`/pos/stores/${storeId}`, payload);
        return normalizeStore(data);
    },

    async suspendStore(_tenantId, storeId): Promise<Store> {
        const { data } = await apiClient.patch(`/pos/stores/${storeId}`, { is_active: false });
        return normalizeStore(data);
    },

    async activateStore(_tenantId, storeId): Promise<Store> {
        const { data } = await apiClient.patch(`/pos/stores/${storeId}`, { is_active: true });
        return normalizeStore(data);
    },

    async deleteStore(_tenantId, storeId): Promise<void> {
        await apiClient.delete(`/pos/stores/${storeId}`);
    },

    async getStoreConfig(_tenantId, storeId): Promise<StoreDetailConfig> {
        const { data: raw } = await apiClient.get(`/pos/stores/${storeId}`);

        const operatingHours = parseOperatingHours(raw.operating_hours);

        const deliveryConfig = {
            enabled: raw.delivery_enabled ?? raw.enable_delivery ?? false,
            radiusKm: raw.delivery_radius_km ?? 5,
            minimumOrder: raw.delivery_min_order_amount ?? 0,
            baseFee: raw.delivery_base_fee ?? 0,
            freeDeliveryThreshold: raw.free_delivery_over_amount ?? 0,
            estimatedMinutes: raw.delivery_estimated_minutes ?? 0,
            providerType: raw.delivery_provider ?? 'internal',
        };

        const pickupConfig = {
            enabled: raw.pickup_enabled ?? raw.enable_pickup ?? true,
            prepTimeMinutes: 15,
            slotDurationMinutes: 15,
            instructions: '',
        };

        const storeSettings = {
            acceptOrders: raw.accept_orders ?? true,
            enablePickup: raw.enable_pickup ?? raw.pickup_enabled ?? true,
            enableDelivery: raw.enable_delivery ?? raw.delivery_enabled ?? false,
            enableDineIn: raw.enable_dinein ?? false,
            enableKiosk: raw.enable_kiosk ?? false,
            enableInventory: raw.enable_inventory ?? true,
            enableAI: raw.enable_ai ?? false,
            enableLoyalty: raw.enable_loyalty ?? false,
            enableMarketing: raw.enable_marketing ?? false,
            futureOrdersEnabled: raw.future_orders_enabled ?? true,
        };

        const paymentConfig = {
            provider: raw.payment_provider ?? 'moneris',
            tipsEnabled: raw.tips_enabled ?? true,
            refundEnabled: raw.refunds_enabled ?? true,
            splitPaymentEnabled: raw.split_payments_enabled ?? false,
        };

        return {
            operatingHours,
            deliveryConfig,
            pickupConfig,
            hardwareConfig: raw.hardware_config || { devices: [] },
            integrations: raw.integrations || [],
            dineInConfig: { enabled: raw.enable_dinein ?? false },
            paymentConfig,
            storeSettings,
        };
    },

    async updateStoreConfig(_tenantId, storeId, config): Promise<StoreDetailConfig> {
        const payload: Record<string, any> = {};

        if (config.operatingHours !== undefined) {
            payload.operating_hours = config.operatingHours;
        }

        if (config.deliveryConfig !== undefined) {
            const dc = config.deliveryConfig;
            if (dc.enabled !== undefined) {
                payload.enable_delivery = dc.enabled;
                payload.delivery_enabled = dc.enabled;
            }
            if (dc.radiusKm !== undefined) payload.delivery_radius_km = dc.radiusKm;
            if (dc.minimumOrder !== undefined) payload.delivery_min_order_amount = dc.minimumOrder;
            if (dc.baseFee !== undefined) payload.delivery_base_fee = dc.baseFee;
            if (dc.freeDeliveryThreshold !== undefined) payload.free_delivery_over_amount = dc.freeDeliveryThreshold;
            if (dc.estimatedMinutes !== undefined) payload.delivery_estimated_minutes = dc.estimatedMinutes;
            if (dc.providerType !== undefined) payload.delivery_provider = dc.providerType;
        }

        if (config.pickupConfig !== undefined) {
            const pc = config.pickupConfig;
            if (pc.enabled !== undefined) {
                payload.enable_pickup = pc.enabled;
                payload.pickup_enabled = pc.enabled;
            }
        }

        if (config.paymentConfig !== undefined) {
            const pmc = config.paymentConfig;
            if (pmc.provider !== undefined) payload.payment_provider = pmc.provider;
            if (pmc.tipsEnabled !== undefined) payload.tips_enabled = pmc.tipsEnabled;
            if (pmc.refundEnabled !== undefined) payload.refunds_enabled = pmc.refundEnabled;
            if (pmc.splitPaymentEnabled !== undefined) payload.split_payments_enabled = pmc.splitPaymentEnabled;
        }

        if (config.storeSettings !== undefined) {
            const ss = config.storeSettings;
            if (ss.acceptOrders !== undefined) payload.accept_orders = ss.acceptOrders;
            if (ss.enablePickup !== undefined) {
                payload.enable_pickup = ss.enablePickup;
                payload.pickup_enabled = ss.enablePickup;
            }
            if (ss.enableDelivery !== undefined) {
                payload.enable_delivery = ss.enableDelivery;
                payload.delivery_enabled = ss.enableDelivery;
            }
            if (ss.enableDineIn !== undefined) payload.enable_dinein = ss.enableDineIn;
            if (ss.enableKiosk !== undefined) payload.enable_kiosk = ss.enableKiosk;
            if (ss.enableInventory !== undefined) payload.enable_inventory = ss.enableInventory;
        }

        if (Object.keys(payload).length > 0) {
            await apiClient.patch(`/pos/stores/${storeId}`, payload);
        }

        // Return current defaults merged with saved config overrides
        return {
            ...createDefaultStoreDetailConfig(),
            ...config
        };
    },

    async getStorePageData(_tenantId: string, storeId: string): Promise<StorePageData> {
        const { data } = await apiClient.get(`/pos/stores/${storeId}/page-data`);
        return data as StorePageData;
    },

    async getStoreUsers(_tenantId: string, storeId: string): Promise<StoreUser[]> {
        try {
            const { data } = await apiClient.get(`/pos/stores/${storeId}/page-data`);
            const rawUsers: any[] = data?.users || [];
            return rawUsers.map((u: any): StoreUser => ({
                id: String(u.id),
                name: u.full_name || '',
                email: u.email || '',
                phone: u.phone || '',
                role: u.role_name || u.role || '',
                status: u.is_active ? 'Active' : 'Inactive',
                isManager: u.role_name?.toLowerCase().includes('manager') || false,
                lastLogin: u.last_login || undefined,
                createdAt: u.created_at || undefined,
            }));
        } catch {
            return [];
        }
    },

    async assignStoreManager(_tenantId: string, _storeId: string, _userId: string): Promise<void> {
        console.warn('[HTTP] assignStoreManager: Not implemented in FastAPI backend');
    },

    async createStoreUser(tenantId: string, storeId: string, user: { name: string; email: string; phone?: string; role: string; status: string; isManager: boolean }): Promise<StoreUser> {
        const brandSlug = tenantId;
        const storeSlug = storeId;
        const payload = {
            full_name: user.name,
            email: user.email,
            phone: user.phone || '',
            role_name: user.role,
            is_active: user.status === 'Active',
            is_manager: user.isManager,
            invite_method: 'TEMP_PASSWORD',
        };
        const { data } = await apiClient.post(`/api/store/${brandSlug}/${storeSlug}/users`, payload);
        return {
            id: String(data.id),
            name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role_name || data.role?.name || '',
            status: data.is_active ? 'Active' : 'Inactive',
            isManager: data.is_manager || data.role_name?.toLowerCase().includes('manager') || false,
            createdAt: data.created_at || undefined,
        };
    },

    // ─── Users (FastAPI: /api/users/) ────────────────────
    async getUsers(params): Promise<PaginatedResponse<User>> {
        const skip = params?.page ? (params.page - 1) * (params?.pageSize || 50) : 0;
        const limit = params?.pageSize || 50;
        const { data } = await apiClient.get('/api/users/', {
            params: { skip, limit },
        });
        const items = Array.isArray(data) ? data : (data.data || []);
        const normalized = items.map(normalizeUser);
        return wrapAsPaginated(normalized, params?.page || 1, limit);
    },

    async getUser(id): Promise<User> {
        const { data } = await apiClient.get(`/api/users/${id}`);
        return normalizeUser(data);
    },

    async createUser(dto): Promise<User> {
        const payload = {
            full_name: dto.fullName,
            email: dto.email,
            phone: dto.phone || null,
            password: 'TempPass123!', // Default password — user should change on first login
            role_id: dto.roleId ? Number(dto.roleId) : null,
            is_active: true,
        };
        const { data } = await apiClient.post('/api/users/', payload);
        return normalizeUser(data);
    },

    async updateUser(id, dto): Promise<User> {
        const payload: Record<string, any> = {};
        if (dto.fullName) payload.full_name = dto.fullName;
        if (dto.phone) payload.phone = dto.phone;
        if (dto.roleId) payload.role_id = Number(dto.roleId);
        const { data } = await apiClient.patch(`/api/users/${id}`, payload);
        return normalizeUser(data);
    },

    async deleteUser(id): Promise<void> {
        // FastAPI has no DELETE /users/:id — use PATCH to deactivate
        await apiClient.patch(`/api/users/${id}`, { is_active: false });
    },

    // ─── Roles (FastAPI: /api/roles/) ────────────────────
    async getRoles(): Promise<Role[]> {
        const { data } = await apiClient.get('/api/roles/');
        const items = Array.isArray(data) ? data : (data.data || []);
        return items.map(normalizeRole);
    },

    async getRole(id): Promise<Role> {
        const { data } = await apiClient.get(`/api/roles/${id}`);
        return normalizeRole(data);
    },

    async createRole(dto): Promise<Role> {
        const payload = {
            name: dto.name,
            description: dto.description || null,
            permission_codes: dto.permissions || [],
        };
        const { data } = await apiClient.post('/api/roles/', payload);
        return normalizeRole(data);
    },

    async updateRole(id, dto): Promise<Role> {
        const payload: Record<string, any> = {};
        if (dto.name) payload.name = dto.name;
        if (dto.description !== undefined) payload.description = dto.description;
        if (dto.permissions) payload.permission_codes = dto.permissions;
        // FastAPI uses PUT for role updates
        const { data } = await apiClient.put(`/api/roles/${id}`, payload);
        return normalizeRole(data);
    },

    async deleteRole(id): Promise<void> {
        await apiClient.delete(`/api/roles/${id}`);
    },

    // ─── Permissions (FastAPI: /api/roles/permissions/) ──
    async getPermissions(): Promise<BackendPermission[]> {
        const { data } = await apiClient.get('/api/roles/permissions/all');
        return Array.isArray(data) ? data : [];
    },

    async getPermissionsByModule(): Promise<BackendPermissionsByModule[]> {
        const { data } = await apiClient.get('/api/roles/permissions/by-module');
        return Array.isArray(data) ? data : [];
    },

    async assignPermission(roleId, permissionId): Promise<void> {
        await apiClient.post('/api/roles/assign-permission', {
            role_id: roleId,
            permission_id: permissionId,
        });
    },

    async removePermission(roleId, permissionId): Promise<void> {
        await apiClient.post('/api/roles/remove-permission', {
            role_id: roleId,
            permission_id: permissionId,
        });
    },

    // ─── Modules (not yet in FastAPI — graceful fallback) ─
    async getModules(): Promise<TenantModule[]> {
        console.warn('[HTTP] getModules: Not implemented in FastAPI backend');
        return [];
    },

    async getTenantModules(_tenantId): Promise<TenantModule[]> {
        console.warn('[HTTP] getTenantModules: Not implemented in FastAPI backend');
        return [];
    },

    async setTenantModules(_tenantId, _modules): Promise<TenantModule[]> {
        console.warn('[HTTP] setTenantModules: Not implemented in FastAPI backend');
        return [];
    },

    // ─── Config (not yet in FastAPI — graceful fallback) ──
    async getTenantConfig(_tenantId: string): Promise<any> {
        console.warn('[HTTP] getTenantConfig: Not implemented in FastAPI backend');
        return {
            email: { provider: 'smtp', senderEmail: '', senderName: '' },
            sms: { provider: 'twilio', senderId: '' },
        };
    },

    async updateTenantConfig(_tenantId: string, _data: any): Promise<any> {
        console.warn('[HTTP] updateTenantConfig: Not implemented in FastAPI backend');
        return _data;
    },
};
