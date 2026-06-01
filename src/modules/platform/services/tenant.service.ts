/**
 * Tenant Service — Centralized CRUD + snake_case mapping.
 *
 * SINGLE SOURCE OF TRUTH for all tenant API calls.
 * Both onboarding.service.ts (create) and OverviewTab (update)
 * must use this service for payload transformation.
 *
 * Backend Schema (TenantCreate / TenantUpdate):
 *   name, slug, legal_name, trade_name, address, timezone, currency,
 *   contact_email, contact_phone, payment_terms, status,
 *   vapi_assistant_id, settings (JSON)
 */

import { apiClient } from '@/shared/api/apiClient';
import type { Brand } from '@/shared/types/tenant';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Frontend-side editable brand data — maps 1:1 with OnboardingBrandData fields */
export interface TenantEditPayload {
    brandName: string;
    brandLegalName: string;
    tradeName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    timezone: string;
    currency: string;
    contactEmail: string;
    contactPhone: string;
    lightLogo: string | null;
    darkLogo: string | null;
    paymentTermType: 'PREPAID' | 'NET_DAYS' | 'DUE_ON_RECEIPT';
    netDays: number;
    storeStrategy: 'SINGLE_STORE' | 'FRANCHISE';
    maxStores: number;
    // Vapi AI
    vapiAssistantId?: string;
    vapiPhoneNumber?: string;
}

// ─── Mappers ────────────────────────────────────────────────────────────────

/**
 * Transform frontend camelCase payload → backend snake_case.
 * Used by BOTH create (POST) and update (PATCH).
 */
export function toBackendPayload(data: TenantEditPayload) {
    const slug = data.brandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return {
        // ── Top-level columns (direct DB fields) ──
        name: data.brandName,
        slug,
        legal_name: data.brandLegalName || undefined,
        trade_name: data.tradeName || undefined,
        address: [data.addressLine1, data.addressLine2].filter(Boolean).join(', ') || undefined,
        timezone: data.timezone || 'Eastern Standard Time (EST)',
        currency: data.currency || 'CAD ($)',
        contact_email: data.contactEmail || undefined,
        contact_phone: data.contactPhone || undefined,
        payment_terms: data.paymentTermType || undefined,
        vapi_assistant_id: data.vapiAssistantId?.trim() || null,
        // ── Settings JSON (extended fields without dedicated columns) ──
        settings: {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
            country: data.country,
            paymentTermType: data.paymentTermType,
            netDays: data.netDays,
            storeStrategy: data.storeStrategy,
            maxStores: data.maxStores,
            lightLogo: data.lightLogo,
            darkLogo: data.darkLogo,
            vapi: data.vapiAssistantId ? {
                assistantId: data.vapiAssistantId,
                phoneNumber: data.vapiPhoneNumber,
            } : undefined,
        },
    };
}

/**
 * Map a backend tenant response → frontend Brand interface.
 * Handles snake_case → camelCase + settings extraction.
 */
export function mapResponseToBrand(t: any): Brand {
    const settings = t.settings || {};
    const status = mapStatus(t.status);
    return {
        id: String(t.id),
        brandLegalName: t.legal_name || settings.brandLegalName || '',
        brandName: t.name || '',
        tradeName: t.trade_name || settings.tradeName || '',
        address: t.address || [settings.addressLine1, settings.addressLine2].filter(Boolean).join(', ') || '',
        timezone: t.timezone || 'Eastern Standard Time (EST)',
        currency: t.currency || 'CAD ($)',
        primaryContact: t.contact_email || settings.contactEmail || '',
        contactPhone: t.contact_phone || settings.contactPhone || '',
        status,
        createdDate: t.created_at || t.createdDate || '',
        createdBy: t.created_by || 'Platform Admin',
        totalStores: t.stores_count ?? t.totalStores ?? 0,
        totalUsers: t.users_count ?? t.totalUsers ?? 0,
        province: settings.province || '',
        modulesPurchasedCount: t.modules_count ?? (t.enabledModules?.length || 0),
        enabledModules: t.enabledModules || (t.modules || [])
            .filter((m: any) => m.enabled)
            .map((m: any) => m.module_key || m.moduleId),
        plan: settings.plan || 'Standard',
        slug: t.slug || '',
        lightLogo: settings.lightLogo || t.light_logo || '',
        darkLogo: settings.darkLogo || t.dark_logo || '',
        defaultPaymentTerms: t.payment_terms || settings.paymentTermType || '',
        defaultTaxScheme: settings.taxScheme || '',
        defaultTaxRate: settings.taxRate || 0,
        lastActivity: t.updated_at || t.lastActivity,
        onboardingProgress: t.onboarding_progress ?? settings.onboardingProgress ?? (status === 'Operational' ? 100 : 0),
        storeStrategy: settings.storeStrategy,
        maxStores: settings.maxStores,
    };
}

/** Map backend status string → frontend TenantStatus enum */
function mapStatus(raw: string | undefined): Brand['status'] {
    switch (raw?.toLowerCase()) {
        case 'active': case 'operational': return 'Operational';
        case 'suspended': return 'Suspended';
        case 'provisioned': return 'Provisioned';
        case 'configuring': return 'Configuring';
        default: return 'Draft';
    }
}

/**
 * Extract extended settings from a Brand back into TenantEditPayload
 * for populating edit forms.
 */
export function brandToEditPayload(brand: Brand, settings?: any): TenantEditPayload {
    const s = settings || {};
    return {
        brandName: brand.brandName,
        brandLegalName: brand.brandLegalName,
        tradeName: brand.tradeName,
        addressLine1: s.addressLine1 || brand.address?.split(',')[0]?.trim() || '',
        addressLine2: s.addressLine2 || '',
        city: s.city || '',
        province: brand.province || s.province || 'Ontario',
        postalCode: s.postalCode || '',
        country: s.country || 'Canada',
        timezone: brand.timezone,
        currency: brand.currency,
        contactEmail: brand.primaryContact,
        contactPhone: brand.contactPhone,
        lightLogo: brand.lightLogo || s.lightLogo || null,
        darkLogo: brand.darkLogo || s.darkLogo || null,
        paymentTermType: (s.paymentTermType || brand.defaultPaymentTerms || 'NET_DAYS') as any,
        netDays: s.netDays ?? 30,
        storeStrategy: brand.storeStrategy || s.storeStrategy || 'SINGLE_STORE',
        maxStores: brand.maxStores || s.maxStores || 1,
        vapiAssistantId: s.vapi?.assistantId || '',
        vapiPhoneNumber: s.vapi?.phoneNumber || '',
    };
}

// ─── API Methods ────────────────────────────────────────────────────────────

/** PATCH /tenants/{id} — update tenant configuration */
export async function updateTenant(tenantId: string, data: TenantEditPayload): Promise<Brand> {
    const payload = toBackendPayload(data);
    const { data: response } = await apiClient.patch(`/tenants/${tenantId}`, payload);
    return mapResponseToBrand(response);
}

/** GET /tenants/{id} — fetch single tenant with full settings */
export async function getTenant(tenantId: string): Promise<{ brand: Brand; rawSettings: any }> {
    const { data: t } = await apiClient.get(`/tenants/${tenantId}`);
    return { brand: mapResponseToBrand(t), rawSettings: t.settings || {} };
}

/** PATCH /tenants/{id} — update status only */
export async function updateTenantStatus(tenantId: string, status: string): Promise<void> {
    await apiClient.patch(`/tenants/${tenantId}`, { status });
}

/** DELETE /tenants/{id} — delete draft tenant */
export async function deleteTenant(tenantId: string): Promise<void> {
    await apiClient.delete(`/tenants/${tenantId}`);
}
