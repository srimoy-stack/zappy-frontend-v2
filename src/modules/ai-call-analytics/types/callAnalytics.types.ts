/**
 * AI Call Analytics — Type Definitions
 *
 * Strict TypeScript interfaces mirroring the backend AiCall and AiCallAlert models.
 * All enums match the Laravel model constants exactly.
 */

// ─── Enums ──────────────────────────────────────────────────────────────────

export type CallStatus =
    | 'completed'
    | 'failed'
    | 'missed'
    | 'no_answer'
    | 'busy'
    | 'dropped';

export type CustomerIntent =
    | 'store_hours'
    | 'menu_question'
    | 'deal_inquiry'
    | 'order_status'
    | 'complaint'
    | 'franchise_inquiry'
    | 'catering'
    | 'job_inquiry'
    | 'human_request'
    | 'other';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type Emotion =
    | 'happy'
    | 'neutral'
    | 'confused'
    | 'frustrated'
    | 'angry'
    | 'urgent';

export type IssueDetected =
    | 'none'
    | 'ai_misunderstood'
    | 'customer_repeated_question'
    | 'call_dropped'
    | 'long_silence'
    | 'wrong_answer_risk'
    | 'asked_for_human'
    | 'background_noise'
    | 'other';

export type SuccessStatus = 'successful' | 'partial' | 'failed';

export type StatusColor = 'green' | 'yellow' | 'red';

export type AlertSeverity = 'high' | 'medium';

export type AlertType =
    | 'call_failed'
    | 'angry_customer'
    | 'human_requested'
    | 'call_not_completed';

// ─── Data Models ────────────────────────────────────────────────────────────

/**
 * AiCall — Matches DASHBOARD_COLUMNS from the backend model.
 * Heavy fields (transcript, raw_payload, summary) are excluded.
 */
export interface AiCall {
    id: number;
    call_id: string;
    caller_number: string;
    location_id: string;
    call_datetime: string;
    duration_seconds: number | null;
    call_status: CallStatus;
    call_type: 'webCall' | 'inboundPhoneCall' | 'outboundPhoneCall' | null;
    ended_reason: string | null;
    customer_intent: CustomerIntent;
    sentiment: Sentiment;
    emotion: Emotion | null;
    success_status: SuccessStatus;
    success_score: number | null;
    cost: number | null;
    follow_up_required: boolean;
    issue_detected: IssueDetected;
    status_color: StatusColor; // Computed by backend accessor
    agent_id: string | null; // Vapi Assistant ID
    has_analysis: boolean;
}

/**
 * Vapi Assistant — Lightweight representation for filtering.
 */
export interface Assistant {
    id: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * AiCallAlert — Immutable alert record.
 */
export interface AiCallAlert {
    id: number;
    ai_call_id: number;
    alert_type: AlertType;
    severity: AlertSeverity;
    message: string;
    created_at: string;
}

/**
 * Dashboard aggregate stats (single-query result from backend).
 */
export interface CallStats {
    total_calls: number;
    analyzed_calls: number;
    analysis_coverage_pct: number;
    successful_calls: number;
    failed_calls: number;
    partial_calls: number;
    follow_up_required_count: number;
    negative_sentiment_count: number;
    avg_duration: number;
    total_cost: number;
    inbound_calls: number;
    outbound_calls: number;
    web_calls: number;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: PaginationMeta;
}

export interface StatsResponse {
    success: boolean;
    data: CallStats;
}

// ─── Filter Types ───────────────────────────────────────────────────────────

export interface CallFilters {
    date_from?: string;
    date_to?: string;
    location_id?: string;
    call_status?: CallStatus | '';
    customer_intent?: CustomerIntent | '';
    sentiment?: Sentiment | '';
    success_status?: SuccessStatus | '';
    follow_up_required?: boolean | '';
    agent_id?: string | '';
    page?: number;
    limit?: number;
}

export interface AlertFilters {
    severity?: AlertSeverity | '';
    alert_type?: AlertType | '';
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}

export interface StatsFilters {
    date_from?: string;
    date_to?: string;
    location_id?: string;
}

/** Filters accepted by the /trends endpoint (same as call list filters minus pagination). */
export interface TrendsFilters {
    date_from?: string;
    date_to?: string;
    location_id?: string;
    call_status?: CallStatus | '';
    customer_intent?: CustomerIntent | '';
    sentiment?: Sentiment | '';
    success_status?: SuccessStatus | '';
    follow_up_required?: boolean | '';
    agent_id?: string | '';
}

/** Pre-aggregated trend data from the backend (full dataset, not limited). */
export interface TrendsData {
    calls_per_day: { date: string; count: number }[];
    success_breakdown: { date: string; successful: number; partial: number; failed: number }[];
    sentiment_distribution: Record<string, number>;
    intent_breakdown: { intent: string; count: number }[];
    alerts_per_day: { date: string; high: number; medium: number }[];
}

export interface TrendsResponse {
    success: boolean;
    data: TrendsData;
}
