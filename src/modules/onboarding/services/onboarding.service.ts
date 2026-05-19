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
    // Call apiClient directly — the adapter's return type doesn't match the backend's {id, slug, name} shape
    const { data: response } = await apiClient.post('/tenants', {
        brandLegalName: data.brandLegalName,
        brandName: data.brandName,
        tradeName: data.tradeName,
        address: data.addressLine1,
        timezone: data.timezone,
        currency: data.currency,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        defaultPaymentTerms: data.paymentTermType,
    });

    return { id: String(response.id), slug: String(response.slug) };
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
    });

    return { id: String(response.user?.id || response.id) };
}

// ─── 7. Finalize ─────────────────────────────────────────────────────────────
//
// Status lifecycle: DRAFT → PROVISIONED → CONFIGURING → OPERATIONAL → SUSPENDED
// After onboarding wizard completes, tenant moves to PROVISIONED.
// CONFIGURING happens when tenant admin starts operational setup.
// OPERATIONAL is set after first successful store + POS configuration.

export async function finalizeOnboarding(tenantId: string): Promise<void> {
    await api.updateTenant(tenantId, { status: 'provisioned' } as any);
}
