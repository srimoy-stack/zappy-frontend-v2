export type CampaignStatus =
    | 'draft'
    | 'scheduled'
    | 'sending'
    | 'sent'
    | 'paused'
    | 'failed'
    | 'blocked';

export interface Campaign {
    id: string;
    name: string;
    subject: string;
    previewText?: string;
    status: CampaignStatus;
    audience: string;
    templateId?: string;
    senderName?: string;
    replyTo?: string;
    segmentId?: string;
    storeId?: string;
    customHtml?: string;
    scheduledAt?: string;
    sentAt?: string;
    createdBy: string;
    createdAt?: string;
}

export interface CreateCampaignPayload {
    name: string;
    subject: string;
    previewText: string;
    senderName: string;
    replyTo: string;
    templateId: string;
    customHtml?: string;
    segmentId: string;
    storeId?: string;
    sendNow?: boolean;
    scheduledAt?: string;
    rulesJson?: SegmentRulesPayload;
}

// ── Segment Rule Builder Types ─────────────────────────────────────────

export type SegmentField = 
    | 'last_order_days' 
    | 'total_spend' 
    | 'orders_count' 
    | 'store_id' 
    | 'favorite_category'
    | 'opened_campaigns_count'
    | 'clicked_campaigns_count'
    | 'consent_status';

export type SegmentOperator = 
    | '>' 
    | '<' 
    | '=' 
    | '!=' 
    | 'contains' 
    | 'in' 
    | 'not_in';

export type SegmentLogic = 'AND' | 'OR';

/** Consent status values as per PRD compliance requirements */
export type ConsentStatus = 'eligible' | 'unsubscribed' | 'no_consent';

/** Suppression status values as per PRD compliance requirements */
export type SuppressionStatus = 'active' | 'suppressed';

/** Store option used in multi-tenant store filter */
export interface StoreOption {
    id: string;
    name: string;
}

export interface SegmentRule {
    id: string;
    field: SegmentField;
    operator: SegmentOperator;
    value: string | string[];
}

export interface SegmentRulesPayload {
    logic: SegmentLogic;
    rules: SegmentRule[];
}

/**
 * Backend-compatible rules_json output.
 * This is what gets sent to the API on save.
 * Each condition omits the internal `id` field.
 */
export interface RulesJsonOutput {
    name: string;
    logic: SegmentLogic;
    conditions: Array<{
        field: SegmentField;
        operator: SegmentOperator;
        value: string | string[];
    }>;
}

// ── Segment Entity (strict PRD model) ──────────────────────────────────

export type SegmentStatus = 'active' | 'inactive';

export interface Segment {
    id: string;
    name: string;
    rules_json: SegmentRulesPayload | null;
    estimated_count: number;
    status: SegmentStatus;
    created_at: string;
    updated_at?: string;
}

/** API response for estimated audience count */
export interface EstimateCountResponse {
    estimated_count: number;
    breakdown?: {
        eligible: number;
        unsubscribed: number;
        suppressed: number;
    };
}

export type TemplateType = 
    | 'promotional' 
    | 'win-back' 
    | 'vip-offer' 
    | 'new-product' 
    | 'seasonal' 
    | 'review-request' 
    | 'announcement' 
    | 'custom';

export interface EmailTemplate {
    id: string;
    name: string;
    subject?: string;
    type: TemplateType;
    htmlBody: string;
    plainTextBody?: string;
    headerImage?: string;
    footerBlock?: string;
    previewUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Contact {
    id: string;
    email: string;
    name?: string;
    segmentId?: string;
    createdAt?: string;
}

export interface AudienceEligibility {
    total: number;
    eligible: number;
    excluded: number;
    reasons: {
        noConsent: number;
        unsubscribed: number;
        suppressed: number;
        invalid: number;
    };
}
