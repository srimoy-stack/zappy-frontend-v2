/**
 * Tenant (Brand) Types — Single Source of Truth
 *
 * PLATFORM → TENANT → STORE → USER
 */

// ─── Status Lifecycle ───────────────────────────────────────────────────────
// DRAFT → PROVISIONED → CONFIGURING → OPERATIONAL → SUSPENDED

export type TenantStatus = 'Draft' | 'Provisioned' | 'Configuring' | 'Operational' | 'Suspended';

/** @deprecated Use TenantStatus */
export type BrandStatus = TenantStatus;

// ─── Core Types ─────────────────────────────────────────────────────────────

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    lightLogo?: string;
    darkLogo?: string;
    status?: TenantStatus;
    timezone?: string;
    currency?: string;
}

export interface EmailConfig {
    provider: 'smtp' | 'sendgrid' | 'ses';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    encryption?: 'tls' | 'ssl' | 'none';
    senderEmail: string;
    senderName: string;
    replyTo?: string;
    headerHtml?: string;
    footerHtml?: string;
}

export interface SmsConfig {
    provider: 'twilio' | 'vonage' | 'aws-sns';
    apiKey?: string;
    apiSecret?: string;
    senderId: string;
    phoneNumber?: string;
}

export interface BrandCommunicationConfig {
    email: EmailConfig;
    sms: SmsConfig;
}

/** Full brand record (super admin view) */
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
    status: TenantStatus;
    createdDate: string;
    createdBy: string;
    totalStores: number;
    totalUsers: number;
    province: string;
    modulesPurchasedCount: number;
    enabledModules: string[];
    plan: string;
    slug: string;
    lightLogo: string;
    darkLogo: string;
    defaultPaymentTerms: string;
    defaultTaxScheme: string;
    defaultTaxRate: number;
    lastActivity?: string;
    onboardingProgress?: number; // 0-100
    communicationConfig?: BrandCommunicationConfig;
    storeStrategy?: 'SINGLE_STORE' | 'FRANCHISE';
    maxStores?: number;
}

/** DTO for POST /tenants */
export interface CreateTenantDTO {
    brandLegalName: string;
    brandName: string;
    tradeName: string;
    address: string;
    timezone: string;
    currency: string;
    contactEmail: string;
    contactPhone: string;
    defaultPaymentTerms?: string;
    defaultTaxScheme?: string;
    defaultTaxRate?: number;
}

// ─── Status Helpers ─────────────────────────────────────────────────────────

export const TENANT_STATUS_ORDER: TenantStatus[] = [
    'Draft', 'Provisioned', 'Configuring', 'Operational', 'Suspended'
];

export const TENANT_STATUS_CONFIG: Record<TenantStatus, {
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
}> = {
    Draft: { color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', label: 'Draft' },
    Provisioned: { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'Provisioned' },
    Configuring: { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', label: 'Configuring' },
    Operational: { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: 'Operational' },
    Suspended: { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', label: 'Suspended' },
};
