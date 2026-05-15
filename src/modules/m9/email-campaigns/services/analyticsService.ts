import apiClient from '@/api/axios';
import {
    CampaignAnalyticsRow,
    AnalyticsFilters,
    CampaignOption,
    ContactActivityRow,
    PaginatedResponse,
    WebhookStatus,
} from '../types/analytics.types';
import { DEV_SEED_ANALYTICS } from '../utils/analyticsSeeds';
import { isDemoMode } from '../utils/demoMode';

/**
 * Analytics API Service
 *
 * Returns pre-computed metrics from the API.
 * Metrics are NEVER calculated client-side — the API is the single source of truth.
 *
 * Falls back to deterministic seed data in development when the API is unavailable.
 */
export const analyticsService = {
    /**
     * Fetch campaign analytics rows with optional filters.
     */
    getAnalytics: async (filters?: Partial<AnalyticsFilters>): Promise<CampaignAnalyticsRow[]> => {
        try {
            const response = await apiClient.get<CampaignAnalyticsRow[]>(
                '/email-campaigns/analytics',
                { params: filters }
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                let data = [...DEV_SEED_ANALYTICS];

                // Campaign filter
                if (filters?.campaign_id && filters.campaign_id !== 'all') {
                    data = data.filter((r) => r.id === filters.campaign_id);
                }

                // Date range filter
                if (filters?.date_from) {
                    const from = new Date(filters.date_from).getTime();
                    data = data.filter((r) => {
                        if (!r.sent_at) return true; // include unsent campaigns
                        return new Date(r.sent_at).getTime() >= from;
                    });
                }
                if (filters?.date_to) {
                    const to = new Date(filters.date_to).getTime() + 86400000; // inclusive of end day
                    data = data.filter((r) => {
                        if (!r.sent_at) return true;
                        return new Date(r.sent_at).getTime() <= to;
                    });
                }

                return data;
            }
            throw new Error('Failed to load analytics data');
        }
    },

    /**
     * Fetch campaign list for the dropdown filter.
     */
    getCampaignOptions: async (): Promise<CampaignOption[]> => {
        try {
            const response = await apiClient.get<CampaignOption[]>(
                '/email-campaigns/analytics/campaigns'
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                return DEV_SEED_ANALYTICS.map((r) => ({
                    id: r.id,
                    name: r.campaign_name,
                }));
            }
            throw new Error('Failed to load campaign options');
        }
    },

    /**
     * Fetch per-contact engagement history.
     * GET /api/email-campaigns/contact-activity
     */
    getContactActivity: async (params?: {
        search?: string;
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<ContactActivityRow>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<ContactActivityRow>>(
                '/email-campaigns/contact-activity',
                { params }
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                // Minimal seed fallback for dev
                return {
                    data: [
                        { email: 'alice@example.com', name: 'Alice Johnson', last_sent: new Date().toISOString(), last_open: new Date().toISOString(), last_click: null, unsubscribe_date: null, complaint_date: null, total_emails_received: 5 },
                        { email: 'bob@example.com', name: 'Bob Smith', last_sent: new Date().toISOString(), last_open: null, last_click: null, unsubscribe_date: null, complaint_date: null, total_emails_received: 3 },
                        { email: 'carol@example.com', name: 'Carol White', last_sent: new Date().toISOString(), last_open: new Date().toISOString(), last_click: new Date().toISOString(), unsubscribe_date: new Date().toISOString(), complaint_date: null, total_emails_received: 8 },
                    ],
                    current_page: 1,
                    last_page: 1,
                    total: 3,
                    per_page: 25,
                };
            }
            throw new Error('Failed to load contact activity');
        }
    },

    /**
     * Fetch webhook health status.
     * GET /api/webhooks/status
     */
    getWebhookStatus: async (): Promise<WebhookStatus> => {
        try {
            const response = await apiClient.get<WebhookStatus>('/webhooks/status');
            return response.data;
        } catch {
            if (isDemoMode()) {
                return {
                    last_event_received_at: null,
                    last_event_type: null,
                    total_events_today: 0,
                    events_by_type_today: {},
                    failed_today: 0,
                    status: 'idle',
                };
            }
            throw new Error('Failed to load webhook status');
        }
    },

    /**
     * Fetch global summary stats (including non-campaign logs).
     * GET /api/email-campaigns/dashboard/stats
     */
    getGlobalStats: async (filters?: Partial<AnalyticsFilters>): Promise<any> => {
        try {
            const response = await apiClient.get('/email-campaigns/dashboard/stats', {
                params: filters,
            });
            return response.data;
        } catch {
            return null;
        }
    },
};
