import { apiClient } from '@/shared/api/apiClient';
import { Segment, SegmentRulesPayload, EstimateCountResponse, StoreOption } from '../types/campaign.types';
import { DEV_SEED_SEGMENTS } from '../utils/segmentSeeds';
import { isDemoMode } from '../utils/demoMode';

/**
 * Segments API Service
 *
 * Provides centralized access to audience segment management endpoints.
 * Follows the same pattern as emailCampaignService.
 */
export const segmentService = {
    /**
     * Fetch all segments
     */
    getSegments: async (): Promise<Segment[]> => {
        try {
            const response = await apiClient.get<Segment[]>('/email-campaigns/segments');
            return response.data;
        } catch {
            if (isDemoMode()) {
                return [...DEV_SEED_SEGMENTS];
            }
            throw new Error('Failed to load segments');
        }
    },

    /**
     * Fetch a single segment by ID
     */
    getSegmentById: async (id: string): Promise<Segment> => {
        try {
            const response = await apiClient.get<Segment>(`/email-campaigns/segments/${id}`);
            return response.data;
        } catch {
            if (isDemoMode()) {
                const found = DEV_SEED_SEGMENTS.find((s) => s.id === id);
                if (found) return { ...found };
                throw new Error('Segment not found');
            }
            throw new Error('Failed to load segment');
        }
    },

    /**
     * Create a new segment
     */
    createSegment: async (payload: Omit<Segment, 'id' | 'created_at' | 'updated_at'>): Promise<Segment> => {
        try {
            const response = await apiClient.post<Segment>('/email-campaigns/segments', payload);
            return response.data;
        } catch (err: any) {
            if (isDemoMode()) {
                const newSeg: Segment = {
                    ...payload,
                    id: `seg-${Date.now()}`,
                    created_at: new Date().toISOString(),
                };
                DEV_SEED_SEGMENTS.unshift(newSeg);
                return newSeg;
            }
            throw new Error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to create segment');
        }
    },

    /**
     * Update an existing segment
     */
    updateSegment: async (id: string, payload: Partial<Segment>): Promise<Segment> => {
        try {
            const response = await apiClient.put<Segment>(`/email-campaigns/segments/${id}`, payload);
            return response.data;
        } catch (err: any) {
            if (isDemoMode()) {
                const idx = DEV_SEED_SEGMENTS.findIndex((s) => s.id === id);
                if (idx !== -1) {
                    const updated = { ...DEV_SEED_SEGMENTS[idx], ...payload, updated_at: new Date().toISOString() };
                    DEV_SEED_SEGMENTS[idx] = updated as Segment;
                    return updated as Segment;
                }
                throw new Error('Segment not found');
            }
            throw new Error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update segment');
        }
    },

    /**
     * Duplicate a segment
     * POST /email-segments/:id/duplicate
     * Payload: { name: "<original_name> (Copy)" }
     */
    duplicateSegment: async (id: string, name: string): Promise<Segment> => {
        try {
            const response = await apiClient.post<Segment>(
                `/email-campaigns/segments/${id}/duplicate`,
                { name }
            );
            return response.data;
        } catch (err: any) {
            if (isDemoMode()) {
                const original = DEV_SEED_SEGMENTS.find((s) => s.id === id);
                if (original) {
                    const dup: Segment = {
                        ...original,
                        id: `seg-${Date.now()}`,
                        name,
                        created_at: new Date().toISOString(),
                        updated_at: undefined,
                    };
                    DEV_SEED_SEGMENTS.unshift(dup);
                    return dup;
                }
                throw new Error('Segment not found');
            }
            throw new Error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to duplicate segment');
        }
    },

    /**
     * Delete a segment
     * DELETE /email-segments/:id
     */
    deleteSegment: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/email-campaigns/segments/${id}`);
        } catch (err: any) {
            if (isDemoMode()) {
                const idx = DEV_SEED_SEGMENTS.findIndex((s) => s.id === id);
                if (idx !== -1) DEV_SEED_SEGMENTS.splice(idx, 1);
                return;
            }
            throw new Error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to delete segment');
        }
    },

    /**
     * Update segment status (Active/Inactive)
     * PATCH /email-segments/:id/status
     */
    updateSegmentStatus: async (id: string, status: 'active' | 'inactive'): Promise<Segment> => {
        try {
            const response = await apiClient.patch<Segment>(
                `/email-campaigns/segments/${id}/status`,
                { status }
            );
            return response.data;
        } catch (err: any) {
            if (isDemoMode()) {
                const seg = DEV_SEED_SEGMENTS.find((s) => s.id === id);
                if (seg) {
                    seg.status = status;
                    seg.updated_at = new Date().toISOString();
                    return { ...seg };
                }
                throw new Error('Segment not found');
            }
            throw new Error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update segment status');
        }
    },

    /**
     * Estimate audience count for a given set of rules.
     * POST /email-campaigns/segments/estimate
     *
     * Falls back to a deterministic mock in development when the API is unavailable.
     */
    estimateCount: async (rules: SegmentRulesPayload): Promise<EstimateCountResponse> => {
        try {
            const response = await apiClient.post<EstimateCountResponse>(
                '/email-campaigns/segments/estimate',
                rules
            );
            return response.data;
        } catch {
            // Deterministic mock: derive count from rule values for a stable UI during dev
            if (isDemoMode()) {
                const base = 15000;
                let modifier = 1;
                for (const rule of rules.rules) {
                    if (rule.field === 'consent_status') {
                        if (rule.value === 'unsubscribed') modifier *= 0.12;
                        else if (rule.value === 'suppressed') modifier *= 0.05;
                        else modifier *= 0.78;
                    } else if (rule.field === 'total_spend' && typeof rule.value === 'string') {
                        const v = parseFloat(rule.value) || 100;
                        modifier *= Math.max(0.05, 1 - v / 2000);
                    } else if (rule.field === 'orders_count' && typeof rule.value === 'string') {
                        const v = parseFloat(rule.value) || 1;
                        modifier *= Math.max(0.08, 1 - v / 50);
                    } else if (rule.field === 'last_order_days' && typeof rule.value === 'string') {
                        const v = parseFloat(rule.value) || 30;
                        if (rule.operator === '>') modifier *= Math.min(0.9, v / 365);
                        else modifier *= Math.max(0.1, 1 - v / 365);
                    } else if (rule.field === 'store_id' && Array.isArray(rule.value)) {
                        modifier *= Math.max(0.1, rule.value.length * 0.2);
                    }
                }
                if (rules.logic === 'OR' && rules.rules.length > 1) {
                    modifier = Math.min(modifier * 1.6, 0.95);
                }
                const estimated = Math.round(base * modifier);
                return {
                    estimated_count: Math.max(0, estimated),
                    breakdown: {
                        eligible: Math.round(estimated * 0.78),
                        unsubscribed: Math.round(estimated * 0.14),
                        suppressed: Math.round(estimated * 0.08),
                    },
                };
            }
            throw new Error('Failed to estimate audience count');
        }
    },

    /**
     * Get available stores for the current tenant context.
     * GET /stores
     *
     * Falls back to mock stores during development.
     */
    getStores: async (): Promise<StoreOption[]> => {
        try {
            const response = await apiClient.get<StoreOption[]>('/email-campaigns/stores');
            return response.data;
        } catch {
            if (isDemoMode()) {
                return [
                    { id: 'store_001', name: 'Flagship San Francisco' },
                    { id: 'store_002', name: 'New York Boutique' },
                    { id: 'store_003', name: 'London Outlet' },
                    { id: 'store_004', name: 'Tokyo Concept' },
                    { id: 'store_005', name: 'Online Store' },
                ];
            }
            throw new Error('Failed to load stores');
        }
    },
};
