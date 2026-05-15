/**
 * Contact Types (M9 – Marketing / Customer Engagement)
 *
 * Compliance-aware contact model.
 * consent_status and suppression_status are NEVER assumed —
 * they must be explicitly set for every contact.
 */

// ── Consent Status ─────────────────────────────────────────────────────
// Critical compliance field. "eligible" = explicit opt-in received.
export type ContactConsentStatus = 'eligible' | 'unsubscribed' | 'no_consent';

// ── Suppression Status ─────────────────────────────────────────────────
export type ContactSuppressionStatus = 'suppressed' | 'active' | 'not_suppressed';

// ── Contact Entity ─────────────────────────────────────────────────────
export interface ContactRecord {
    id: string;
    name: string;
    email: string;
    store_id: string;
    store_name?: string;
    phone?: string;
    customer_id?: number;
    tags_json?: string[] | null;
    last_order?: string;          // ISO date string or null
    total_spend: number;
    consent_status: ContactConsentStatus;
    consent_source?: string;
    consent_timestamp?: string;   // ISO date
    consent_expiry_at?: string;   // ISO date
    unsubscribed_at?: string;     // ISO date
    suppression_status: ContactSuppressionStatus;
    suppression_reason?: string;
    created_at: string;
    updated_at?: string;
}

// ── Add Contact Payload ────────────────────────────────────────────────
export interface CreateContactPayload {
    name: string;
    email: string;
    store_id: string;
    consent_status: ContactConsentStatus;
    phone?: string;
    customer_id?: number;
    consent_source?: string;
}

// ── CSV Import Types ───────────────────────────────────────────────────
export interface CsvImportRow {
    rowIndex: number;
    name: string;
    email: string;
    store_id: string;
    consent_status: string;
    valid: boolean;
    errors: string[];
}

export interface CsvImportResult {
    total: number;
    valid: number;
    invalid: number;
    rows: CsvImportRow[];
}

// ── Import Response (from backend) ─────────────────────────────────────
export interface ImportResponse {
    imported: number;
    updated: number;
    failed: number;
    suppressed_blocked: number;
    message: string;
}

// ── Contact Filters ────────────────────────────────────────────────────
export interface ContactFilters {
    consent_status: ContactConsentStatus | 'all';
    store_id: string | 'all';
    suppression_status: ContactSuppressionStatus | 'all';
    search: string;
}

export const DEFAULT_CONTACT_FILTERS: ContactFilters = {
    consent_status: 'all',
    store_id: 'all',
    suppression_status: 'all',
    search: '',
};

