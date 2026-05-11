'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    CampaignAnalyticsRow,
    AnalyticsFilters,
    CampaignOption,
    ContactActivityRow,
    PaginatedResponse,
    DEFAULT_ANALYTICS_FILTERS,
} from '../types/analytics.types';
import { analyticsService } from '../services/analyticsService';

/**
 * Hook to manage analytics data with date-range and campaign filtering.
 * Metrics are always from the API — never calculated.
 */
export function useAnalytics() {
    const [rows, setRows] = useState<CampaignAnalyticsRow[]>([]);
    const [campaignOptions, setCampaignOptions] = useState<CampaignOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_ANALYTICS_FILTERS);

    // ── Contact Activity State ─────────────────────────────────────────
    const [contactActivity, setContactActivity] = useState<PaginatedResponse<ContactActivityRow> | null>(null);
    const [contactSearch, setContactSearch] = useState('');
    const [contactPage, setContactPage] = useState(1);
    const [contactLoading, setContactLoading] = useState(false);
    const [contactError, setContactError] = useState<string | null>(null);

    const [globalStats, setGlobalStats] = useState<any>(null);

    // ── Fetch analytics rows ───────────────────────────────────────────
    const fetchAnalytics = useCallback(async (activeFilters?: AnalyticsFilters) => {
        setLoading(true);
        setError(null);
        try {
            const f = activeFilters ?? filters;

            // 1. Fetch Campaign Rows
            const data = await analyticsService.getAnalytics({
                campaign_id: f.campaign_id,
                date_from: f.date_from,
                date_to: f.date_to,
            });
            setRows(data);

            // 2. Fetch Global Stats (for summary tiles)
            const stats = await analyticsService.getGlobalStats(f);
            setGlobalStats(stats);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load analytics';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // ── Fetch contact activity ─────────────────────────────────────────
    const fetchContactActivity = useCallback(async () => {
        setContactLoading(true);
        setContactError(null);
        try {
            const data = await analyticsService.getContactActivity({
                search: contactSearch || undefined,
                page: contactPage,
                per_page: 25,
            });
            setContactActivity(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load contact activity';
            setContactError(message);
        } finally {
            setContactLoading(false);
        }
    }, [contactSearch, contactPage]);

    // ── Load campaign options on mount ──────────────────────────────────
    useEffect(() => {
        analyticsService.getCampaignOptions().then(setCampaignOptions).catch(() => { });
    }, []);

    // ── Refetch when filters change ────────────────────────────────────
    useEffect(() => {
        fetchAnalytics(filters);
    }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Refetch contact activity on search/page change ─────────────────
    useEffect(() => {
        fetchContactActivity();
    }, [contactSearch, contactPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Summary (prefer global stats from API if available) ───────────
    const summary = useMemo(() => {
        if (globalStats) {
            return {
                campaigns: globalStats.campaigns_sent || 0,
                totalSent: globalStats.sent || 0,
                totalDelivered: globalStats.delivered || 0,
                totalOpened: globalStats.opened || 0,
                totalClicked: globalStats.clicked || 0,
                totalBounced: globalStats.bounced || 0,
                totalUnsubscribed: globalStats.unsubscribed || 0,
                avgOpenRate: globalStats.openRate || 0,
                avgClickRate: globalStats.clickRate || 0,
                avgBounceRate: globalStats.bounceRate || 0,
            };
        }

        const campaigns = rows.length;
        const totalSent = rows.reduce((acc, r) => acc + (r.sent || 0), 0);
        const totalDelivered = rows.reduce((acc, r) => acc + (r.delivered || 0), 0);
        const totalOpened = rows.reduce((acc, r) => acc + (r.opened || 0), 0);
        const totalClicked = rows.reduce((acc, r) => acc + (r.clicked || 0), 0);
        const totalBounced = rows.reduce((acc, r) => acc + (r.bounced || 0), 0);
        const totalUnsubscribed = rows.reduce((acc, r) => acc + (r.unsubscribes || 0), 0);

        return {
            campaigns,
            totalSent,
            totalDelivered,
            totalOpened,
            totalClicked,
            totalBounced,
            totalUnsubscribed,
            avgOpenRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
            avgClickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
            avgBounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
        };
    }, [rows, globalStats]);

    // ── Filter updaters ────────────────────────────────────────────────
    const updateFilter = useCallback(
        <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_ANALYTICS_FILTERS);
    }, []);

    return {
        rows,
        campaignOptions,
        loading,
        error,
        filters,
        summary,
        updateFilter,
        resetFilters,
        refetch: () => fetchAnalytics(filters),
        // Contact Activity
        contactActivity,
        contactSearch,
        setContactSearch,
        contactPage,
        setContactPage,
        contactLoading,
        contactError,
        refetchContactActivity: fetchContactActivity,
    };
}
