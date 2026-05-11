'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { AiCallAlert, PaginationMeta, AlertFilters } from '../types/callAnalytics.types';
import { aiCallService } from '../services/aiCallService';

/**
 * React Query hook for alerts.
 * Polls every 5s (alerts are time-sensitive). NO fallback data.
 */
export function useAlerts(filters: AlertFilters = {}) {
    const stableKey = useMemo(() => JSON.stringify(filters), [filters]);

    const { data, isLoading, isFetching, error, dataUpdatedAt, refetch } = useQuery<
        { data: AiCallAlert[]; meta: PaginationMeta }
    >({
        queryKey: ['callAlerts', stableKey],
        queryFn: () => aiCallService.getAlerts(filters),
        refetchInterval: 30_000,
    });

    return {
        data: data?.data ?? [],
        meta: data?.meta ?? { total: 0, page: 1, limit: 20 },
        loading: isLoading,
        isRefreshing: isFetching && !isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load alerts') : null,
        lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
        refetch,
    };
}
