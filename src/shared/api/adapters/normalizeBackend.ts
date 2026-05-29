/**
 * Backend Response Normalizers
 *
 * Maps FastAPI snake_case responses → frontend camelCase types.
 * All backend IDs (int) are coerced to strings for frontend consistency.
 */

import type { Brand } from '@/shared/types/tenant';
import type { User } from '@/shared/types/user';
import type { UserType } from '@/shared/types/auth';
import type { Role } from '@/shared/types/role';
import type { Store } from '@/shared/types/store';
import type { PaginatedResponse } from '@/shared/types/api';

// ─── Tenant / Brand ─────────────────────────────────────────────────────────

export function normalizeTenant(raw: any): Brand {
    return {
        id: String(raw.id),
        brandLegalName: raw.name || '',
        brandName: raw.name || '',
        tradeName: raw.name || '',
        address: '',
        timezone: '',
        currency: '',
        primaryContact: '',
        contactPhone: '',
        status: mapTenantStatus(raw.status),
        createdDate: raw.created_at || '',
        createdBy: '',
        totalStores: 0,
        totalUsers: 0,
        enabledModules: [],
        province: '',
        modulesPurchasedCount: 0,
        plan: '',
        slug: raw.slug || '',
        lightLogo: '',
        darkLogo: '',
        defaultPaymentTerms: '',
        defaultTaxScheme: '',
        defaultTaxRate: 0,
    };
}

function mapTenantStatus(status: string | undefined): Brand['status'] {
    if (!status) return 'Draft';
    const lower = status.toLowerCase();
    if (lower === 'active') return 'Operational';
    if (lower === 'suspended') return 'Suspended';
    if (lower === 'inactive') return 'Suspended';
    if (lower === 'draft') return 'Draft';
    if (lower === 'configuring') return 'Configuring';
    if (lower === 'provisioned') return 'Provisioned';
    if (lower === 'operational') return 'Operational';
    return 'Draft';
}

// ─── User ───────────────────────────────────────────────────────────────────

export function normalizeUser(raw: any): User {
    return {
        id: String(raw.id),
        name: raw.full_name || '',
        fullName: raw.full_name || '',
        email: raw.email || '',
        phone: raw.phone || undefined,
        userType: 'ADMIN' as UserType,   // default; resolved via role mapping
        role: {
            id: raw.role_id ? String(raw.role_id) : '',
            name: raw.role?.name || '',
            permissions: raw.permissions || [],
            isSystem: false,
        },
        storeIds: [],
        tenantId: raw.tenant_id ? String(raw.tenant_id) : '',
        status: raw.is_active ? 'Active' : 'Inactive',
        lastLogin: null,
        createdAt: raw.created_at || '',
    };
}

// ─── Role ───────────────────────────────────────────────────────────────────

export function normalizeRole(raw: any): Role {
    return {
        id: String(raw.id),
        name: raw.name || '',
        description: raw.description || undefined,
        permissions: (raw.permissions || []).map((p: any) =>
            typeof p === 'string' ? p : p.code || ''
        ),
        isSystem: false,
        createdAt: raw.created_at || '',
    };
}

// ─── Store ──────────────────────────────────────────────────────────────────

function mapStoreStatus(status: string | undefined, isActive?: boolean): Store['status'] {
    if (status) {
        const lower = status.toLowerCase();
        if (lower === 'active') return 'Active';
        if (lower === 'inactive') return 'Inactive';
        if (lower === 'draft') return 'Draft';
        if (lower === 'pending') return 'Pending';
        if (lower === 'coming_soon' || lower === 'comingsoon') return 'ComingSoon';
        if (lower === 'temporarily_closed') return 'TemporarilyClosed';
    }
    // Fallback to is_active boolean
    if (isActive !== undefined) return isActive ? 'Active' : 'Inactive';
    return 'Draft';
}

export function normalizeStore(raw: any): Store {
    return {
        id: String(raw.id),
        name: raw.name || '',
        code: raw.store_code || (raw.id ? String(raw.id).substring(0, 8).toUpperCase() : ''),
        tenantId: raw.tenant_id ? String(raw.tenant_id) : '',
        timezone: raw.timezone || 'America/Toronto',
        city: raw.city || '',
        province: raw.province || '',
        postalCode: raw.postal_code || undefined,
        country: raw.country || undefined,
        address: raw.address || raw.address_line_1 || undefined,
        phone: raw.phone || undefined,
        secondaryPhone: raw.secondary_phone || undefined,
        email: raw.email || undefined,
        website: raw.website || undefined,
        status: mapStoreStatus(raw.status, raw.is_active),
        businessType: raw.business_type || undefined,
        storeNumber: raw.store_number || undefined,
        language: raw.language || undefined,
        currency: raw.currency || undefined,
        paymentTerms: raw.payment_terms || '',
        taxProfile: raw.tax_override_enabled ? 'Override' : 'Inherit',
        taxScheme: raw.tax_config?.rules?.[0]?.name || undefined,
        taxRate: raw.tax_config?.rules?.[0]?.rate || undefined,
        logoStatus: raw.logo ? 'Set' : 'Default',
        deliveryRadiusKm: raw.delivery_radius_km || undefined,
        latitude: raw.latitude || undefined,
        longitude: raw.longitude || undefined,
        createdAt: raw.created_at || raw.createdAt || '',
    };
}

// ─── Permission (from /api/roles/permissions/all) ───────────────────────────

export interface BackendPermission {
    id: number;
    code: string;
    name: string;
    module: string;
    description?: string;
    is_active?: boolean;
}

export interface BackendPermissionsByModule {
    module: string;
    permissions: BackendPermission[];
}

// ─── Pagination Wrapper ─────────────────────────────────────────────────────

/**
 * Wraps a flat backend array into the PaginatedResponse shape the frontend expects.
 */
export function wrapAsPaginated<T>(
    items: T[],
    page = 1,
    pageSize = 50
): PaginatedResponse<T> {
    return {
        data: items,
        total: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize) || 1,
    };
}
