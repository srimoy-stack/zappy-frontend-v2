'use client';

import { useState, useEffect, useCallback } from 'react';
import { Campaign } from '../types/campaign.types';
import { emailCampaignService } from '../services/emailCampaignService';

/**
 * Hook to fetch and manage the email campaigns list.
 * Provides loading/error state and a refetch function.
 *
 * Fallback to seed data is handled in the service layer via isDemoMode().
 */
export function useCampaigns() {
    const [data, setData] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const campaigns = await emailCampaignService.getCampaigns();
            setData(campaigns);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load campaigns';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    return { data, loading, error, refetch: fetchCampaigns };
}
