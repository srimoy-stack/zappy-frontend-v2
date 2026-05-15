/**
 * Audit Log Types (M9 – Marketing / Customer Engagement)
 *
 * Types for the immutable audit trail system.
 */

// ── Audit Log Entry ────────────────────────────────────────────────────
export interface AuditLogEntry {
    id: number;
    action: string;
    entity_type: string;
    entity_id: number | null;
    actor_type: 'user' | 'system' | 'webhook';
    actor_id: number | null;
    metadata: Record<string, any> | null;
    ip_address: string | null;
    created_at: string;
}

// ── Audit Log Filters ──────────────────────────────────────────────────
export interface AuditLogFilters {
    action: string;
    entity_type: string;
    date_from: string;
    date_to: string;
    search: string;
}

export const DEFAULT_AUDIT_FILTERS: AuditLogFilters = {
    action: '',
    entity_type: '',
    date_from: '',
    date_to: '',
    search: '',
};

// ── Paginated Response ─────────────────────────────────────────────────
export interface AuditLogResponse {
    data: AuditLogEntry[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

// ── Audit Summary ──────────────────────────────────────────────────────
export interface AuditSummary {
    total_entries: number;
    today_entries: number;
    week_entries: number;
    actions: string[];
    entity_types: string[];
    recent: Array<{
        action: string;
        entity_type: string;
        entity_id: number | null;
        actor_type: string;
        created_at: string;
    }>;
}

// ── Action Labels for Display ──────────────────────────────────────────
export const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    'campaign.created':           { label: 'Campaign Created',      color: '#6366f1', icon: '📝' },
    'campaign.sent':              { label: 'Campaign Sent',         color: '#22c55e', icon: '📤' },
    'campaign.send_blocked':      { label: 'Send Blocked',          color: '#ef4444', icon: '🚫' },
    'campaign.scheduled':         { label: 'Campaign Scheduled',    color: '#f59e0b', icon: '📅' },
    'contact.created':            { label: 'Contact Added',         color: '#3b82f6', icon: '👤' },
    'contact.import_completed':   { label: 'Import Completed',      color: '#8b5cf6', icon: '📥' },
    'send.blocked':               { label: 'Send Blocked',          color: '#ef4444', icon: '🛑' },
    'suppression.manual_add':     { label: 'Manual Suppression',    color: '#f97316', icon: '🔒' },
    'suppression.manual_remove':  { label: 'Suppression Removed',   color: '#eab308', icon: '🔓' },
    'suppression.unsubscribe':    { label: 'Unsubscribe',           color: '#64748b', icon: '📭' },
    'suppression.auto_bounce':    { label: 'Auto-Bounce',           color: '#ef4444', icon: '↩️' },
    'suppression.auto_complaint': { label: 'Auto-Complaint',        color: '#dc2626', icon: '⚠️' },
    'suppression.auto_unsubscribe': { label: 'Auto-Unsubscribe',    color: '#64748b', icon: '📭' },
    'settings.updated':           { label: 'Settings Updated',      color: '#6366f1', icon: '⚙️' },
};
