'use client';

import { useState, useEffect, useCallback } from 'react';
import { AudienceEligibility } from '../types/campaign.types';
import { emailCampaignService } from '../services/emailCampaignService';

/**
 * Hook to fetch contacts/audience eligibility for campaign targeting.
 */
export function useContacts() {
    const [data, setData] = useState<AudienceEligibility | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const eligibility = await emailCampaignService.getContacts();
            setData(eligibility);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load audience data';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    return { data, loading, error, refetch: fetchContacts };
}
