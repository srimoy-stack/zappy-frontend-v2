import { apiClient } from '@/shared/api/apiClient';
import {
    SuppressionEntry,
    ConsentEntry,
    SuppressionFilters,
    ConsentFilters,
    ManualUnsubscribePayload,
} from '../types/suppression.types';
import { DEV_SEED_SUPPRESSIONS, DEV_SEED_CONSENT } from '../utils/suppressionSeeds';
import { isDemoMode } from '../utils/demoMode';

/**
 * Suppression & Consent API Service
 *
 * Centralized access to suppression-list and consent-view endpoints.
 * Falls back to deterministic seed data in development when API is unavailable.
 */
export const suppressionService = {
    // ── Suppression List ───────────────────────────────────────────────
    /**
     * Fetch all suppression entries, optionally filtered.
     */
    getSuppressionList: async (filters?: Partial<SuppressionFilters>): Promise<SuppressionEntry[]> => {
        try {
            const response = await apiClient.get<SuppressionEntry[]>(
                '/email-campaigns/suppression',
                { params: filters }
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                let entries = [...DEV_SEED_SUPPRESSIONS];

                if (filters?.reason && filters.reason !== 'all') {
                    entries = entries.filter((e) => e.reason === filters.reason);
                }
                if (filters?.date_from) {
                    const from = new Date(filters.date_from).getTime();
                    entries = entries.filter((e) => new Date(e.date_added).getTime() >= from);
                }
                if (filters?.date_to) {
                    const to = new Date(filters.date_to).getTime() + 86_400_000; // end of day
                    entries = entries.filter((e) => new Date(e.date_added).getTime() <= to);
                }
                if (filters?.search) {
                    const q = filters.search.toLowerCase();
                    entries = entries.filter(
                        (e) =>
                            e.email.toLowerCase().includes(q) ||
                            e.source.toLowerCase().includes(q)
                    );
                }

                return entries;
            }
            throw new Error('Failed to load suppression list');
        }
    },

    // ── Consent View ───────────────────────────────────────────────────
    /**
     * Fetch all consent entries, optionally filtered.
     */
    getConsentList: async (filters?: Partial<ConsentFilters>): Promise<ConsentEntry[]> => {
        try {
            const response = await apiClient.get<ConsentEntry[]>(
                '/email-campaigns/consent',
                { params: filters }
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                let entries = [...DEV_SEED_CONSENT];

                if (filters?.consent_status && filters.consent_status !== 'all') {
                    entries = entries.filter((e) => e.consent_status === filters.consent_status);
                }
                if (filters?.search) {
                    const q = filters.search.toLowerCase();
                    entries = entries.filter(
                        (e) =>
                            e.email.toLowerCase().includes(q) ||
                            e.name.toLowerCase().includes(q)
                    );
                }

                return entries;
            }
            throw new Error('Failed to load consent data');
        }
    },

    // ── Manual Unsubscribe ─────────────────────────────────────────────
    /**
     * Manually unsubscribe a contact (adds to suppression + updates consent).
     */
    manualUnsubscribe: async (payload: ManualUnsubscribePayload): Promise<{ success: boolean }> => {
        try {
            const response = await apiClient.post<{ success: boolean }>(
                '/email-campaigns/suppression/unsubscribe',
                payload
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                // Add to suppressions
                const newEntry: SuppressionEntry = {
                    id: `sup-${Date.now()}`,
                    email: payload.email,
                    reason: 'unsubscribed',
                    source: 'Manual admin action',
                    date_added: new Date().toISOString(),
                };
                DEV_SEED_SUPPRESSIONS.unshift(newEntry);

                // Update consent
                const consentEntry = DEV_SEED_CONSENT.find(
                    (c) => c.email.toLowerCase() === payload.email.toLowerCase()
                );
                if (consentEntry) {
                    consentEntry.consent_status = 'unsubscribed';
                    consentEntry.updated_at = new Date().toISOString();
                }

                return { success: true };
            }
            throw new Error('Failed to process unsubscribe');
        }
    },

    // ── Remove from Suppression ────────────────────────────────────────
    /**
     * Remove an entry from the suppression list.
     */
    removeFromSuppression: async (id: string): Promise<{ success: boolean }> => {
        try {
            const response = await apiClient.delete<{ success: boolean }>(
                `/email-campaigns/suppression/${id}`
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                const idx = DEV_SEED_SUPPRESSIONS.findIndex((e) => e.id === id);
                if (idx !== -1) {
                    DEV_SEED_SUPPRESSIONS.splice(idx, 1);
                    return { success: true };
                }
                throw new Error('Entry not found');
            }
            throw new Error('Failed to remove suppression entry');
        }
    },
};
