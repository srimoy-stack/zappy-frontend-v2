import apiClient from '@/api/axios';
import { AuditLogResponse, AuditLogFilters, AuditSummary } from '../types/audit.types';
import { isDemoMode } from '../utils/demoMode';

/**
 * Audit Log API Service
 *
 * Read-only access to the immutable audit trail.
 */
export const auditService = {
    /**
     * Fetch paginated audit logs with optional filters.
     */
    getAuditLogs: async (
        filters?: Partial<AuditLogFilters>,
        page: number = 1,
        perPage: number = 50
    ): Promise<AuditLogResponse> => {
        try {
            const response = await apiClient.get<AuditLogResponse>('/email-campaigns/audit-logs', {
                params: { ...filters, page, per_page: perPage },
            });
            return response.data;
        } catch {
            if (isDemoMode()) {
                return {
                    data: [],
                    meta: { current_page: 1, per_page: 50, total: 0, last_page: 1 },
                };
            }
            throw new Error('Failed to load audit logs');
        }
    },

    /**
     * Fetch audit summary stats.
     */
    getSummary: async (): Promise<AuditSummary> => {
        try {
            const response = await apiClient.get<AuditSummary>('/email-campaigns/audit-logs/summary');
            return response.data;
        } catch {
            if (isDemoMode()) {
                return {
                    total_entries: 0,
                    today_entries: 0,
                    week_entries: 0,
                    actions: [],
                    entity_types: [],
                    recent: [],
                };
            }
            throw new Error('Failed to load audit summary');
        }
    },
};
