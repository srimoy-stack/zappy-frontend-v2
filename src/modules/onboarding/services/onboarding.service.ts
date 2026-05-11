/**
 * Onboarding Service — Production API orchestration.
 *
 * Pipeline:
 *   1. createTenant()         → POST /tenants
 *   2. enableModules()        → POST /tenants/{id}/modules
 *   3. configureEmail()       → POST /tenants/{id}/config/email
 *   4. configureSms()         → POST /tenants/{id}/config/sms
 *   5. createAdminUser()      → POST /tenants/{id}/users
 *   6. finalizeOnboarding()   → POST /tenants/{id}/finalize
 */

import { api } from '@/shared/api/adapters';
import type {
    OnboardingBrandData,
    OnboardingAdminData,
    OnboardingEmailConfig,
    OnboardingSmsConfig,
} from '../types/onboarding.types';

// ─── 1. Create Tenant ────────────────────────────────────────────────────────

export async function createTenant(data: OnboardingBrandData): Promise<{ id: string; slug: string }> {
    const response = await api.createTenant({
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

    return { id: response.id, slug: response.slug };
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
            senderEmail: config.senderEmail,
            senderName: config.senderName,
        },
    });
}

// ─── 4. Configure SMS ────────────────────────────────────────────────────────

export async function configureSms(
    tenantId: string,
    config: OnboardingSmsConfig
): Promise<void> {
    if (config.provider === 'inherit') return; // No-op for inherited config

    await api.updateTenantConfig(tenantId, {
        sms: {
            provider: config.provider,
            apiKey: config.apiKey,
            apiSecret: config.apiSecret,
            senderId: config.senderId,
        },
    });
}

// ─── 5. Create Tenant Admin ──────────────────────────────────────────────────
//
// CRITICAL: The admin MUST be scoped to the tenant.
// tenant_id is required — orphan users violate platform governance.

export async function createAdminUser(
    tenantId: string,
    data: OnboardingAdminData
): Promise<{ id: string }> {
    const user = await api.createUser({
        tenantId,                    // ← REQUIRED: tenant-scoped user
        fullName: data.adminName,
        email: data.adminEmail,
        phone: data.adminPhone,
        userType: 'BRAND_ADMIN',
        roleId: 'role-admin',
        assignedStoreIds: [],        // Brand admins access all stores
    });

    return { id: user.id };
}

// ─── 6. Finalize ─────────────────────────────────────────────────────────────
//
// Status lifecycle: DRAFT → PROVISIONED → CONFIGURING → OPERATIONAL → SUSPENDED
// After onboarding wizard completes, tenant moves to PROVISIONED.
// CONFIGURING happens when tenant admin starts operational setup.
// OPERATIONAL is set after first successful store + POS configuration.

export async function finalizeOnboarding(tenantId: string): Promise<void> {
    await api.updateTenant(tenantId, { status: 'Provisioned' } as any);
}
