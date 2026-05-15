/**
 * Analytics Types (M9 – Marketing / Customer Engagement)
 *
 * Metrics are sourced ONLY from the API — never calculated client-side.
 */

import { CampaignStatus } from './campaign.types';

// ── Campaign Analytics Row ─────────────────────────────────────────────
export interface CampaignAnalyticsRow {
    id: string;
    campaign_name: string;
    status: CampaignStatus;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribes: number;
    bounced: number;
    open_rate: number;        // percentage from API
    click_rate: number;       // percentage from API
    unsubscribe_rate: number; // percentage from API
    bounce_rate: number;      // percentage from API
    sent_at?: string;         // ISO date
}

// ── Analytics Filters ──────────────────────────────────────────────────
export interface AnalyticsFilters {
    campaign_id: string | 'all';
    date_from: string; // YYYY-MM-DD
    date_to: string;   // YYYY-MM-DD
}

/** Default 30‑day date range ending today (local time) */
function defaultDateRange(): { from: string; to: string } {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        from: formatDate(fromDate),
        to: formatDate(toDate),
    };
}

const range = defaultDateRange();

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilters = {
    campaign_id: 'all',
    date_from: range.from,
    date_to: range.to,
};

// ── Campaign Option (for dropdown) ─────────────────────────────────────
export interface CampaignOption {
    id: string;
    name: string;
}

// ── Contact Activity Row ───────────────────────────────────────────────
export interface ContactActivityRow {
    email: string;
    name?: string | null;
    last_sent?: string | null;
    last_open?: string | null;
    last_click?: string | null;
    unsubscribe_date?: string | null;
    complaint_date?: string | null;
    total_emails_received: number;
}

// ── Paginated Response ─────────────────────────────────────────────────
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

// ── Webhook Status ─────────────────────────────────────────────────────
export interface WebhookStatus {
    last_event_received_at?: string | null;
    last_event_type?: string | null;
    total_events_today: number;
    events_by_type_today: Record<string, number>;
    failed_today: number;
    status: 'active' | 'idle';
}
