'use client';

import { useState, useEffect, useCallback } from 'react';
import { Segment } from '../types/campaign.types';
import { segmentService } from '../services/segmentService';


/**
 * Hook to fetch and manage the segments list.
 * Provides loading/error state and a refetch function.
 *
 * Fallback to seed data is handled in the service layer via isDemoMode().
 */
export function useSegments() {
    const [data, setData] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSegments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const segments = await segmentService.getSegments();
            setData(segments);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load segments';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSegments();
    }, [fetchSegments]);

    return { data, loading, error, refetch: fetchSegments };
}
