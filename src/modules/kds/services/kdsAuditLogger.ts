/**
 * kdsAuditLogger.ts
 * 
 * Client-side audit logging for sensitive KDS actions.
 * Maintains an in-memory capped log of actions for audit trails.
 */

import { getDispatcherConfig, ActorType } from './kdsEventDispatcher';
import { useKDSAccessStore } from '../store/kdsAccessStore';
import { getStationToken } from './stationDeviceService';

const API_BASE = '/api/kds';

export interface AuditEntry {
    id: string; // uuid
    timestamp: string;
    store_id: string;
    station_id?: string;
    order_id: string;
    order_item_id?: string;
    action: string;
    from_stage?: string;
    to_stage?: string;
    reason?: string;
    metadata: Record<string, any>;
    actor_user_id: string;
    actor_type: ActorType;
}

const MAX_LOG_SIZE = 200;
const _auditLog: AuditEntry[] = [];

/**
 * Logs a KDS action with context metadata.
 */
export function logKDSAction(action: string, metadata: Record<string, any>): AuditEntry {
    const config = getDispatcherConfig();
    const accessState = useKDSAccessStore.getState();

    const entry: AuditEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        store_id: config.storeId,
        station_id: metadata.station_id || undefined,
        order_id: metadata.orderId || 'system',
        order_item_id: metadata.order_item_id || undefined,
        action,
        from_stage: metadata.from_stage,
        to_stage: metadata.to_stage,
        reason: metadata.reason,
        metadata,
        actor_user_id: accessState.isStationMode ? (accessState.stationId ?? 'unknown-station') : (accessState.userId ?? 'anonymous'),
        actor_type: accessState.isStationMode ? 'STATION' : 'USER',
    };

    // ── 1. Update in-memory log (capped) ────────────────────────────────────
    _auditLog.unshift(entry); // Newest first
    if (_auditLog.length > MAX_LOG_SIZE) {
        _auditLog.pop(); // Evict oldest
    }

    // ── 2. Console trace for audit ──────────────────────────────────────────
    if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed(
            `%c[KDS-AUDIT] ${entry.action}`,
            'color: #8B5CF6; font-weight: bold; font-size: 11px;'
        );
        console.table({
            actor: entry.actor_user_id,
            type: entry.actor_type,
            time: entry.timestamp
        });
        console.log('metadata:', entry.metadata);
        console.groupEnd();
    }

    // ── 3. Send to backend endpoint (Requirement 11 - Compliance) ──────────
    const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    const stationToken = getStationToken();
    if (stationToken) {
        authHeaders['X-KDS-Station-Token'] = stationToken;
    }

    fetch(`${API_BASE}/audit-logs`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(entry),
    }).catch(err => {
        // Silently fail or queue for later — audit shouldn't block the UI
        console.warn('[KDS-AUDIT] Failed to sync audit log to server:', err);
    });

    return entry;
}

/**
 * Returns a slice of the latest audit entries.
 */
export function getAuditLogs(): AuditEntry[] {
    return [..._auditLog];
}
