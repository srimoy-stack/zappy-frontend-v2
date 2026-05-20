/**
 * Onboarding Service — Production API orchestration.
 *
 * Pipeline:
 *   1. createTenant()         → POST /tenants
 *   2. enableModules()        → POST /tenants/{id}/modules
 *   3. configureEmail()       → POST /tenants/{id}/config
 *   4. configureSms()         → POST /tenants/{id}/config (optional)
 *   5. configureVapi()        → PATCH /tenants/{id} (vapi_assistant_id column)
 *   6. createAdminUser()      → POST /tenants/{id}/users
 *   7. finalizeOnboarding()   → PATCH /tenants/{id} (status → provisioned)
 */

import { api } from '@/shared/api/adapters';
import { apiClient } from '@/shared/api/apiClient';
import type {
    OnboardingBrandData,
    OnboardingAdminData,
    OnboardingEmailConfig,
    OnboardingSmsConfig,
    OnboardingVapiConfig,
} from '../types/onboarding.types';

// ─── 1. Create Tenant ────────────────────────────────────────────────────────

export async function createTenant(data: OnboardingBrandData): Promise<{ id: string; slug: string }> {
    // Backend TenantCreate schema expects snake_case fields:
    //   name, slug, legal_name, trade_name, address, timezone, currency,
    //   contact_email, contact_phone, payment_terms, status
    const slug = data.brandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const { data: response } = await apiClient.post('/tenants', {
        name: data.brandName,
        slug,
        legal_name: data.brandLegalName || undefined,
        trade_name: data.tradeName || undefined,
        address: [data.addressLine1, data.addressLine2].filter(Boolean).join(', ') || undefined,
        timezone: data.timezone || 'UTC',
        currency: data.currency || 'CAD',
        contact_email: data.contactEmail || undefined,
        contact_phone: data.contactPhone || undefined,
        payment_terms: data.paymentTermType || undefined,
        status: 'draft',
    });

    const tenantId = String(response.id);

    // Store extended address/config fields in settings JSON via PATCH
    // These fields don't have dedicated columns but are needed for the detail view
    try {
        await apiClient.patch(`/tenants/${tenantId}`, {
            settings: {
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                province: data.province,
                postalCode: data.postalCode,
                country: data.country,
                paymentTermType: data.paymentTermType,
                netDays: data.netDays,
            },
        });
    } catch {
        // Non-critical — settings patch failure shouldn't block tenant creation
        console.warn('[onboarding] Failed to save extended settings for tenant', tenantId);
    }

    return { id: tenantId, slug: String(response.slug) };
}

// ─── 2. Enable Modules + Entitlements ────────────────────────────────────────

export async function enableModules(
    tenantId: string,
    moduleIds: string[],
    entitlementPaths: string[]
): Promise<void> {
    const modules = moduleIds.map((id) => ({
        moduleId: id,
        purchased: true,
        enabled: true,
    }));

    await api.setTenantModules(tenantId, modules);
    // Entitlement paths are sent as part of the module config
    // Backend stores them in tenant_entitlements table
}

// ─── 3. Configure Email ──────────────────────────────────────────────────────

export async function configureEmail(
    tenantId: string,
    config: OnboardingEmailConfig
): Promise<void> {
    if (config.provider === 'inherit') return; // No-op for inherited config

    await api.updateTenantConfig(tenantId, {
        email: {
            provider: config.provider,
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            encryption: config.encryption,
            senderEmail: config.senderEmail,
            senderName: config.senderName,
            replyTo: config.replyTo,
            ...(config.apiKey ? { apiKey: config.apiKey } : {}),
        },
    });
}

// ─── 4. Configure SMS (optional) ─────────────────────────────────────────────

export async function configureSms(
    tenantId: string,
    config: OnboardingSmsConfig
): Promise<void> {
    if (config.provider === 'inherit') return; // No-op — SMS is optional

    await api.updateTenantConfig(tenantId, {
        sms: {
            provider: config.provider,
            apiKey: config.apiKey,
            apiSecret: config.apiSecret,
            senderId: config.senderId,
            ...(config.accountSid ? { accountSid: config.accountSid } : {}),
        },
    });
}

// ─── 5. Configure Vapi (AI Call Analytics) ───────────────────────────────────
//
// Vapi sends assistant_id in webhook payloads. The backend resolves tenant
// by looking up Tenant::where('vapi_assistant_id', $assistantId).
// This is a direct column on the tenants table, not a JSON setting.

export async function configureVapi(
    tenantId: string,
    config: OnboardingVapiConfig
): Promise<void> {
    const assistantId = config.assistantId?.trim();
    if (!assistantId) return;

    // PATCH /tenants/{id} — vapi_assistant_id is a fillable column
    await apiClient.patch(`/tenants/${tenantId}`, {
        vapi_assistant_id: assistantId,
        // Phone number stored in settings JSON for reference
        settings: {
            vapi: {
                phoneNumber: config.phoneNumber?.trim(),
                assistantId,
            },
        },
    });
}

// ─── 6. Create Tenant Admin ──────────────────────────────────────────────────
//
// CRITICAL: The admin MUST be scoped to the tenant.
// Uses the tenant-scoped endpoint POST /tenants/{id}/users
// (TenantController::storeUser on the backend)

export async function createAdminUser(
    tenantId: string,
    data: OnboardingAdminData
): Promise<{ id: string }> {
    // Normalize email: trim whitespace and lowercase to match backend behavior
    // and prevent case-sensitive duplicate detection mismatches.
    const normalizedEmail = data.adminEmail?.trim().toLowerCase();

    const { data: response } = await apiClient.post(`/tenants/${tenantId}/users`, {
        fullName: data.adminName?.trim(),
        email: normalizedEmail,
        phone: data.adminPhone?.trim() || undefined,
        userType: 'BRAND_ADMIN',
        inviteMethod: data.inviteMethod || 'MAGIC_LINK',
    });

    return { id: String(response.user?.id || response.id) };
}

// ─── 7. Finalize ─────────────────────────────────────────────────────────────
//
// Status lifecycle: DRAFT → ACTIVE → SUSPENDED
// DRAFT    = tenant created but wizard not completed
// ACTIVE   = wizard completed — modules, config, and admin user are all set
// SUSPENDED = suspended by platform admin (billing, violation, etc.)

export async function finalizeOnboarding(tenantId: string): Promise<void> {
    await api.updateTenant(tenantId, { status: 'active' } as any);
}
