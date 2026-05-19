import { apiClient } from '@/shared/api/apiClient';
import type {
    AiCall,
    AiCallAlert,
    CallStats,
    PaginationMeta,
    CallFilters,
    AlertFilters,
    StatsFilters,
    TrendsFilters,
    TrendsData,
    TrendsResponse,
    PaginatedResponse,
    StatsResponse,
} from '../types/callAnalytics.types';

/**
 * AI Call Analytics API Service
 *
 * All methods throw on failure — errors propagate to hooks,
 * which surface them via ErrorBanner. NO mock fallback.
 */
export const aiCallService = {
    getCalls: async (
        filters: CallFilters = {}
    ): Promise<{ data: AiCall[]; meta: PaginationMeta }> => {
        const params = Object.fromEntries(
            Object.entries(filters).filter(
                ([, v]) => v !== '' && v !== undefined && v !== null
            )
        );

        const response = await apiClient.get<PaginatedResponse<AiCall>>(
            '/call-analysis',
            { params }
        );

        return {
            data: response.data.data,
            meta: response.data.meta,
        };
    },

    getStats: async (filters: StatsFilters = {}): Promise<CallStats> => {
        const params = Object.fromEntries(
            Object.entries(filters).filter(
                ([, v]) => v !== '' && v !== undefined && v !== null
            )
        );

        const response = await apiClient.get<StatsResponse>(
            '/call-analysis/stats',
            { params }
        );

        return response.data.data;
    },

    getAlerts: async (
        filters: AlertFilters = {}
    ): Promise<{ data: AiCallAlert[]; meta: PaginationMeta }> => {
        const params = Object.fromEntries(
            Object.entries(filters).filter(
                ([, v]) => v !== '' && v !== undefined && v !== null
            )
        );

        const response = await apiClient.get<PaginatedResponse<AiCallAlert>>(
            '/call-analysis/alerts',
            { params }
        );

        return {
            data: response.data.data,
            meta: response.data.meta,
        };
    },

    /**
     * GET /call-analysis/{id}
     * Fetch a single call detail (excludes raw_payload, recording_url, transcript).
     * Includes has_recording boolean so the frontend knows whether to show the player.
     */
    getCallDetail: async (id: string | number): Promise<AiCall & { summary?: string; action_taken?: string; follow_up_reason?: string; has_recording?: boolean }> => {
        const response = await apiClient.get<{ success: boolean; data: AiCall }>(`/call-analysis/${id}`);
        return response.data.data;
    },

    /**
     * GET /call-analysis/trends
     * Server-side aggregated chart data (full dataset, not limited to 100 rows).
     * Returns pre-computed: calls_per_day, success_breakdown, sentiment_distribution,
     * intent_breakdown, alerts_per_day.
     */
    getTrends: async (filters: TrendsFilters = {}): Promise<TrendsData> => {
        const params = Object.fromEntries(
            Object.entries(filters).filter(
                ([, v]) => v !== '' && v !== undefined && v !== null
            )
        );

        const response = await apiClient.get<TrendsResponse>(
            '/call-analysis/trends',
            { params }
        );

        return response.data.data;
    },

    /**
     * GET /call-analysis/health
     * System health check.
     */
    getHealth: async (): Promise<{ status: string; db: string; queue: string }> => {
        const response = await apiClient.get<{ success: boolean; status: string; db: string; queue: string }>(
            '/call-analysis/health'
        );
        return response.data;
    },

    /**
     * Fetch the recording audio via the authenticated proxy and return
     * an object URL suitable for use as an <audio> src.
     *
     * This approach ensures the Bearer token is sent with the request,
     * unlike setting <audio src={url}> which bypasses axios interceptors.
     */
    fetchRecordingBlob: async (id: string | number): Promise<string> => {
        const response = await apiClient.get(`/call-analysis/${id}/recording`, {
            responseType: 'blob',
        });
        return URL.createObjectURL(response.data as Blob);
    },

    /**
     * Build the full URL for CSV export download.
     * Uses the API base URL + auth token so the browser can open it directly.
     *
     * Returns: { url: string, hasToken: boolean }
     */
    getExportUrl: (filters: Record<string, string | boolean | undefined> = {}): { url: string; hasToken: boolean } => {
        const baseUrl = apiClient.defaults.baseURL || '/api';
        const params = new URLSearchParams();

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
                params.set(key, String(value));
            }
        });

        // Add auth token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            params.set('token', token);
        }

        const queryString = params.toString();
        const url = `${baseUrl}/call-analysis/export${queryString ? '?' + queryString : ''}`;

        return { url, hasToken: !!token };
    },
};
