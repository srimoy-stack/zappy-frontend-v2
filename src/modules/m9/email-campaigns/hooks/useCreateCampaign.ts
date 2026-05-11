'use client';

import { useState } from 'react';
import { Campaign, CreateCampaignPayload } from '../types/campaign.types';
import { emailCampaignService } from '../services/emailCampaignService';

/**
 * Hook to create a new email campaign.
 * Returns the mutation function along with loading/error/success state.
 */
export function useCreateCampaign() {
    const [data, setData] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createCampaign = async (payload: CreateCampaignPayload) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const campaign = await emailCampaignService.createCampaign(payload);
            setData(campaign);
            setSuccess(true);
            return campaign;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create campaign';
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setData(null);
        setError(null);
        setSuccess(false);
    };

    return { createCampaign, data, loading, error, success, reset };
}
