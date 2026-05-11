/**
 * Audit Service — Sends audit logs to the backend.
 *
 * Silent: never throws, never blocks UI.
 */

import apiClient from '@/shared/api/apiClient';
import type { AuditLogPayload } from '@/shared/types/audit';
import { env } from '@/shared/config/env';

/**
 * POST /audit-logs — fire and forget.
 */
export async function sendAuditLog(payload: AuditLogPayload): Promise<boolean> {
    if (env.apiMode === 'mock') {
        console.log('[MOCK AUDIT]', payload);
        return true;
    }

    try {
        await apiClient.post('/audit-logs', payload);
        return true;
    } catch {
        // Silently fail — audit must never block
        return false;
    }
}

/**
 * POST /audit-logs/batch — send multiple logs at once.
 */
export async function sendAuditLogBatch(payloads: AuditLogPayload[]): Promise<boolean> {
    if (payloads.length === 0) return true;

    if (env.apiMode === 'mock') {
        console.log('[MOCK AUDIT BATCH]', payloads);
        return true;
    }

    try {
        await apiClient.post('/audit-logs/batch', { logs: payloads });
        return true;
    } catch {
        return false;
    }
}
