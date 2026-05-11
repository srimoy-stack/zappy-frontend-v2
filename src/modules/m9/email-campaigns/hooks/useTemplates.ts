'use client';

import { useState, useEffect, useCallback } from 'react';
import { EmailTemplate } from '../types/campaign.types';
import { emailCampaignService } from '../services/emailCampaignService';

/**
 * Hook to fetch available email templates.
 * Templates are used during campaign creation for content selection.
 */
export function useTemplates() {
    const [data, setData] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const templates = await emailCampaignService.getTemplates();
            setData(templates);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load templates';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return { data, loading, error, refetch: fetchTemplates };
}
