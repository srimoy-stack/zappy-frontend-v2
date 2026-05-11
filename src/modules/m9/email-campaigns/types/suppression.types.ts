/**
 * Suppression & Consent Types (M9 – Marketing / Customer Engagement)
 *
 * Models the suppression list and consent view for compliance tracking.
 * All statuses are explicitly set — NEVER assumed.
 */

// ── Suppression Reasons ────────────────────────────────────────────────
export type SuppressionReason = 'unsubscribed' | 'bounced' | 'complained';

// ── Consent Status ─────────────────────────────────────────────────────
export type ComplianceConsentStatus = 'eligible' | 'unsubscribed' | 'no_consent';

// ── Suppression List Entry ─────────────────────────────────────────────
export interface SuppressionEntry {
    id: string;
    email: string;
    reason: SuppressionReason;
    source: string;
    date_added: string;       // ISO date string
}

// ── Consent View Entry ─────────────────────────────────────────────────
export interface ConsentEntry {
    id: string;
    email: string;
    name: string;
    consent_status: ComplianceConsentStatus;
    consent_source?: string;
    consent_timestamp?: string;   // ISO date
    unsubscribed_at?: string;     // ISO date
    suppression_status?: string;
    updated_at: string;           // ISO date string
}

// ── Filters ────────────────────────────────────────────────────────────
export interface SuppressionFilters {
    reason: SuppressionReason | 'all';
    date_from: string;
    date_to: string;
    search: string;
}

export interface ConsentFilters {
    consent_status: ComplianceConsentStatus | 'all';
    search: string;
}

export const DEFAULT_SUPPRESSION_FILTERS: SuppressionFilters = {
    reason: 'all',
    date_from: '',
    date_to: '',
    search: '',
};

export const DEFAULT_CONSENT_FILTERS: ConsentFilters = {
    consent_status: 'all',
    search: '',
};

// ── Manual Unsubscribe Payload ─────────────────────────────────────────
export interface ManualUnsubscribePayload {
    email: string;
    reason?: string;
}
