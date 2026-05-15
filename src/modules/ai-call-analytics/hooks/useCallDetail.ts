'use client';

import { useQuery } from '@tanstack/react-query';
import { aiCallService } from '../services/aiCallService';
import type { AiCall } from '../types/callAnalytics.types';

type CallDetail = AiCall & {
    summary?: string;
    action_taken?: string;
    follow_up_reason?: string;
    has_recording?: boolean;
};

/**
 * React Query hook for a single call detail.
 * Fetches once (no polling) since detail data is static.
 */
export function useCallDetail(id: string | number) {
    const { data, isLoading, error, refetch } = useQuery<CallDetail>({
        queryKey: ['callDetail', String(id)],
        queryFn: () => aiCallService.getCallDetail(id) as Promise<CallDetail>,
        enabled: !!id,
    });

    return {
        data: data ?? null,
        loading: isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load call detail') : null,
        refetch,
    };
}
