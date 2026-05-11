'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { TrendsData, TrendsFilters } from '../types/callAnalytics.types';
import type {
    DailyVolume, DailySuccessBreakdown, SentimentSlice,
    IntentBar, DailyAlerts,
} from '../utils/chartTransformers';
import { CHART_COLORS } from '../utils/chartTransformers';
import { aiCallService } from '../services/aiCallService';

/**
 * React Query hook for server-side aggregated trend data.
 * Replaces the old approach of computing charts from limited (100) call rows.
 *
 * Returns pre-aggregated data transformed to chart-ready shapes.
 * Polls every 30s. NO mock data. NO fallback.
 */
export function useTrends(filters: TrendsFilters = {}) {
    const stableKey = useMemo(() => JSON.stringify(filters), [filters]);

    const { data, isLoading, isFetching, error } = useQuery<TrendsData>({
        queryKey: ['callTrends', stableKey],
        queryFn: () => aiCallService.getTrends(filters),
        refetchInterval: 30_000,
    });

    // ── Transform server data to chart-ready shapes ──────────────
    const callVolume: DailyVolume[] = useMemo(() => {
        if (!data?.calls_per_day) return [];
        return data.calls_per_day.map((d) => ({
            date: d.date,
            total: d.count,
        }));
    }, [data?.calls_per_day]);

    const successBreakdown: DailySuccessBreakdown[] = useMemo(() => {
        if (!data?.success_breakdown) return [];
        return data.success_breakdown.map((d) => ({
            date: d.date,
            successful: d.successful,
            partial: d.partial,
            failed: d.failed,
        }));
    }, [data?.success_breakdown]);

    const sentimentDistribution: SentimentSlice[] = useMemo(() => {
        if (!data?.sentiment_distribution) return [];
        const colorMap: Record<string, string> = {
            positive: CHART_COLORS.positive,
            neutral: CHART_COLORS.neutral,
            negative: CHART_COLORS.negative,
        };
        return Object.entries(data.sentiment_distribution)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
                color: colorMap[name] ?? CHART_COLORS.neutral,
            }));
    }, [data?.sentiment_distribution]);

    const intentBreakdown: IntentBar[] = useMemo(() => {
        if (!data?.intent_breakdown) return [];
        return data.intent_breakdown.map((d) => ({
            intent: d.intent.replace(/_/g, ' '),
            count: d.count,
        }));
    }, [data?.intent_breakdown]);

    const alertsTrend: DailyAlerts[] = useMemo(() => {
        if (!data?.alerts_per_day) return [];
        return data.alerts_per_day;
    }, [data?.alerts_per_day]);

    return {
        callVolume,
        successBreakdown,
        sentimentDistribution,
        intentBreakdown,
        alertsTrend,
        loading: isLoading,
        isRefreshing: isFetching && !isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load trends') : null,
        hasData: (data?.calls_per_day?.length ?? 0) > 0,
    };
}
