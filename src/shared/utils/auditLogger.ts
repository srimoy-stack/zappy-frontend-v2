/**
 * auditLogger — Fire-and-forget audit logging with in-memory queue and retry.
 *
 * RULES:
 * - NEVER blocks the main flow
 * - NEVER throws
 * - Batches logs when possible
 * - Retries failed logs up to 2 times
 */

import type { AuditLogPayload } from '@/shared/types/audit';
import { sendAuditLog, sendAuditLogBatch } from '@/shared/api/services/audit.service';

// ─── In-Memory Queue ─────────────────────────────────────────────────────────

interface QueuedLog {
    payload: AuditLogPayload;
    retries: number;
}

const MAX_RETRIES = 2;
const FLUSH_INTERVAL = 5000; // 5s
const MAX_QUEUE_SIZE = 50;

let queue: QueuedLog[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function startFlushTimer() {
    if (flushTimer || typeof window === 'undefined') return;
    flushTimer = setInterval(flushQueue, FLUSH_INTERVAL);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
        flushQueue();
    });
}

async function flushQueue() {
    if (queue.length === 0) return;

    const batch = queue.splice(0, MAX_QUEUE_SIZE);
    const payloads = batch.map((q) => q.payload);

    try {
        const success = await sendAuditLogBatch(payloads);
        if (!success) {
            // Re-queue items that haven't exceeded retry limit
            const retryable = batch
                .filter((q) => q.retries < MAX_RETRIES)
                .map((q) => ({ ...q, retries: q.retries + 1 }));
            queue.push(...retryable);
        }
    } catch {
        // Re-queue retryable
        const retryable = batch
            .filter((q) => q.retries < MAX_RETRIES)
            .map((q) => ({ ...q, retries: q.retries + 1 }));
        queue.push(...retryable);
    }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Log an audit action — fire and forget.
 *
 * Usage:
 *   logAction({ action: 'USER_CREATED', entity: 'USER', entityId: '123' });
 */
export function logAction(payload: AuditLogPayload): void {
    try {
        const enriched: AuditLogPayload = {
            ...payload,
            timestamp: payload.timestamp || new Date().toISOString(),
        };

        // For critical actions, send immediately (don't queue)
        if (isCritical(enriched.action)) {
            sendAuditLog(enriched).catch(() => {
                // Failed immediate send — queue for retry
                queue.push({ payload: enriched, retries: 1 });
            });
            return;
        }

        // Queue for batch send
        queue.push({ payload: enriched, retries: 0 });

        // Trim queue if it gets too large
        if (queue.length > MAX_QUEUE_SIZE * 2) {
            queue = queue.slice(-MAX_QUEUE_SIZE);
        }

        startFlushTimer();
    } catch {
        // Logging must NEVER break the app
    }
}

/**
 * Immediately flush all queued logs (call on logout/navigation).
 */
export function flushAuditLogs(): void {
    try {
        flushQueue();
    } catch {
        // Silent
    }
}

/**
 * Get current queue size (for debugging).
 */
export function getAuditQueueSize(): number {
    return queue.length;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CRITICAL_ACTIONS = new Set([
    'LOGIN',
    'LOGOUT',
    'IMPERSONATION_STARTED',
    'IMPERSONATION_ENDED',
    'TENANT_CREATED',
    'TENANT_FINALIZED',
    'USER_DELETED',
    'ROLE_DELETED',
    'ONBOARDING_COMPLETED',
]);

function isCritical(action: string): boolean {
    return CRITICAL_ACTIONS.has(action);
}
