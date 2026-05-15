'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { AiCall, PaginationMeta, CallFilters } from '../types/callAnalytics.types';
import { aiCallService } from '../services/aiCallService';

/**
 * React Query hook for paginated call records with filters.
 * - Polls every 10s
 * - Errors always surfaced (no silent catch)
 * - NO fallback data
 */
export function useCalls(filters: CallFilters = {}) {
    const stableKey = useMemo(() => JSON.stringify(filters), [filters]);

    const { data, isLoading, isFetching, error, dataUpdatedAt, refetch } = useQuery<
        { data: AiCall[]; meta: PaginationMeta }
    >({
        queryKey: ['calls', stableKey],
        queryFn: () => aiCallService.getCalls(filters),
        refetchInterval: 30_000,
    });

    return {
        data: data?.data ?? [],
        meta: data?.meta ?? { total: 0, page: 1, limit: 20 },
        loading: isLoading,
        isRefreshing: isFetching && !isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load calls') : null,
        lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
        refetch,
    };
}
