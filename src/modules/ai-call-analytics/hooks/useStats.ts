'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { CallStats, StatsFilters } from '../types/callAnalytics.types';
import { aiCallService } from '../services/aiCallService';

/**
 * React Query hook for dashboard aggregate stats.
 * Polls every 10s. NO fallback data.
 */
export function useStats(filters: StatsFilters = {}) {
    const stableKey = useMemo(() => JSON.stringify(filters), [filters]);

    const { data, isLoading, isFetching, error, dataUpdatedAt, refetch } = useQuery<CallStats>({
        queryKey: ['callStats', stableKey],
        queryFn: () => aiCallService.getStats(filters),
        refetchInterval: 30_000,
    });

    return {
        data: data ?? null,
        loading: isLoading,
        isRefreshing: isFetching && !isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load stats') : null,
        lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
        refetch,
    };
}
