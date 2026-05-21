/**
 * Onboarding Types — Production Onboarding Architecture
 *
 * Phase 1: Super Admin Provisioning Wizard (7 steps)
 * Phase 2: Tenant Admin Operational Bootstrap (checklist)
 */

// ─── Brand Identity ─────────────────────────────────────────────────────────

export interface OnboardingBrandData {
    brandLegalName: string;
    brandName: string;
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
    maxStores?: number;
}

// ─── Tenant Admin ────────────────────────────────────────────────────────────

export interface OnboardingAdminData {
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    inviteMethod: 'MAGIC_LINK' | 'TEMP_PASSWORD';
}

// ─── Email Configuration ─────────────────────────────────────────────────────

export interface OnboardingEmailConfig {
    provider: 'smtp' | 'sendgrid' | 'ses' | 'inherit';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    encryption?: 'tls' | 'ssl' | 'none';
    apiKey?: string;
    senderEmail: string;
    senderName: string;
    replyTo?: string;
}

// ─── SMS Configuration ──────────────────────────────────────────────────────

export interface OnboardingSmsConfig {
    provider: 'twilio' | 'vonage' | 'aws-sns' | 'inherit';
    accountSid?: string;
    apiKey?: string;
    apiSecret?: string;
    senderId: string;
}

// ─── Vapi / AI Call Analytics Configuration ──────────────────────────────────

export interface OnboardingVapiConfig {
    /** Vapi Assistant ID — used by webhook to resolve tenant */
    assistantId: string;
    /** Phone number assigned to this assistant in Vapi */
    phoneNumber: string;
}

// ─── Online Ordering Hosting Configuration ───────────────────────────────────

export interface OnboardingHostingConfig {
    /** Primary custom domain for the storefront (e.g. order.mybrand.com) */
    customDomain: string;
    /** Hosting provider type */
    hostingProvider: 'zyappy-managed' | 'custom' | 'cloudflare';
    /** SSL certificate provisioning method */
    sslMethod: 'auto-letsencrypt' | 'custom-cert' | 'cloudflare-origin';
    /** DNS verification method */
    dnsVerification: 'cname' | 'a-record' | 'ns-delegation';
    /** CNAME target for DNS verification (auto-generated after provisioning) */
    cnameTarget?: string;
    /** A-record IP for direct DNS pointing */
    aRecordIp?: string;
    /** Custom SSL certificate PEM (only when sslMethod = 'custom-cert') */
    sslCertPem?: string;
    /** Custom SSL private key PEM (only when sslMethod = 'custom-cert') */
    sslKeyPem?: string;
    /** Enable CDN caching for static assets */
    cdnEnabled: boolean;
    /** Notes / special requirements */
    notes?: string;
}

// ─── Module Entitlement (used by ModuleStep for display only) ───────────────

export interface OnboardingModuleData {
    id: string;
    name: string;
    purchased: boolean;
    enabled: boolean;
    isCore?: boolean;
    startDate: string;
    notes: string;
}

// ─── Store Data (used in Phase 2 only, kept for shared component reuse) ─────

export interface OnboardingStoreData {
    id: string;
    storeName: string;
    shortCode: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    storeLogo: string | null;
    paymentTermType: 'INHERIT_BRAND' | 'PREPAID' | 'NET_DAYS' | 'DUE_ON_RECEIPT';
    netDays: number;
    taxSetup: 'INHERIT_BRAND' | 'OVERRIDE';
    taxProvince: string;
    taxManualRate: string;
}

// ─── Phase 1 Form Data ──────────────────────────────────────────────────────

export interface OnboardingFormData {
    brand: OnboardingBrandData;
    admin: OnboardingAdminData;
    email: OnboardingEmailConfig;
    sms: OnboardingSmsConfig;
    vapi: OnboardingVapiConfig;
    hosting: OnboardingHostingConfig;
    /** IDs of enabled modules (e.g. ['email-campaigns', 'ai-call-analytics']) */
    enabledModuleIds: string[];
    /** Hierarchical dot-notated paths (e.g. ['email-campaigns.campaigns.analytics']) */
    selectedEntitlementPaths: string[];
}

// ─── Step Configuration ─────────────────────────────────────────────────────

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface OrchestrationStepStatus {
    label: string;
    status: 'pending' | 'running' | 'done' | 'error';
    error?: string;
}

/**
 * 8-step wizard (dynamic — steps 3–8 conditionally shown)
 *
 * 1. Brand Identity (always)
 * 2. Entitlements (always)
 * 8. Hosting Details (if online-ordering enabled)
 * 3. Email Config (if email-campaigns enabled)
 * 4. SMS Config (if email-campaigns enabled — optional)
 * 5. AI Call Config (if ai-call-analytics enabled)
 * 6. Tenant Admin (always)
 * 7. Review & Deploy (always)
 */
export const STEP_CONFIG = [
    { id: 1 as OnboardingStep, title: 'Brand Identity', description: 'Core identity & localization' },
    { id: 2 as OnboardingStep, title: 'Entitlements', description: 'Module & page access' },
    { id: 8 as OnboardingStep, title: 'Hosting', description: 'Domain & DNS setup' },
    { id: 3 as OnboardingStep, title: 'Email', description: 'Email service configuration' },
    { id: 4 as OnboardingStep, title: 'SMS', description: 'SMS gateway (optional)' },
    { id: 5 as OnboardingStep, title: 'AI Calls', description: 'Vapi assistant config' },
    { id: 6 as OnboardingStep, title: 'Tenant Admin', description: 'Brand administrator' },
    { id: 7 as OnboardingStep, title: 'Review', description: 'Final verification' },
];

// ─── Factory Functions ──────────────────────────────────────────────────────

export function createEmptyStore(): OnboardingStoreData {
    return {
        id: `store-${Date.now()}`,
        storeName: '',
        shortCode: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        province: 'Ontario',
        postalCode: '',
        country: 'Canada',
        phone: '',
        email: '',
        storeLogo: null,
        paymentTermType: 'INHERIT_BRAND',
        netDays: 30,
        taxSetup: 'INHERIT_BRAND',
        taxProvince: 'Ontario',
        taxManualRate: '',
    };
}

export function createInitialFormData(): OnboardingFormData {
    return {
        brand: {
            brandLegalName: '',
            brandName: '',
            tradeName: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            province: 'Ontario',
            postalCode: '',
            country: 'Canada',
            timezone: 'Eastern Standard Time (EST)',
            currency: 'CAD ($)',
            contactEmail: '',
            contactPhone: '',
            lightLogo: null,
            darkLogo: null,
            paymentTermType: 'NET_DAYS',
            netDays: 30,
            storeStrategy: 'SINGLE_STORE',
            maxStores: 1,
        },
        admin: {
            adminName: '',
            adminEmail: '',
            adminPhone: '',
            inviteMethod: 'MAGIC_LINK',
        },
        email: {
            provider: 'smtp',
            host: '',
            port: 587,
            username: '',
            password: '',
            encryption: 'tls',
            senderEmail: '',
            senderName: '',
            replyTo: '',
        },
        sms: {
            provider: 'inherit',
            senderId: '',
        },
        vapi: {
            assistantId: '',
            phoneNumber: '',
        },
        hosting: {
            customDomain: '',
            hostingProvider: 'zyappy-managed',
            sslMethod: 'auto-letsencrypt',
            dnsVerification: 'cname',
            cdnEnabled: true,
            notes: '',
        },
        enabledModuleIds: [],
        selectedEntitlementPaths: [],
    };
}
