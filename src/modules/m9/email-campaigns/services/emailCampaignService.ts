import { apiClient } from '@/shared/api/apiClient';
import { Campaign, CreateCampaignPayload, EmailTemplate, AudienceEligibility } from '../types/campaign.types';
import { isDemoMode } from '../utils/demoMode';
import { DEV_SEED_CAMPAIGNS } from '../utils/campaignSeeds';
import { DEV_SEED_TEMPLATES } from '../utils/templateSeeds';

/**
 * Email Campaigns API Service
 *
 * Provides centralized access to email campaign management endpoints.
 * Falls back to deterministic seed data when isDemoMode() is true.
 */
export const emailCampaignService = {
    /**
     * Fetch all email campaigns
     */
    getCampaigns: async (): Promise<Campaign[]> => {
        try {
            const response = await apiClient.get<Campaign[]>('/email-campaigns');
            return response.data;
        } catch {
            if (isDemoMode()) {
                console.warn('[emailCampaignService] API unavailable — using demo seed data');
                return [...DEV_SEED_CAMPAIGNS];
            }
            throw new Error('Failed to load campaigns');
        }
    },

    /**
     * Fetch a single campaign by ID
     */
    getCampaign: async (id: string): Promise<Campaign> => {
        try {
            const response = await apiClient.get<Campaign>(`/email-campaigns/${id}`);
            return response.data;
        } catch {
            if (isDemoMode()) {
                const found = DEV_SEED_CAMPAIGNS.find((c) => c.id === id);
                if (found) return { ...found };
                throw new Error('Campaign not found');
            }
            throw new Error('Failed to load campaign');
        }
    },

    /**
     * Create a new email campaign
     */
    createCampaign: async (payload: CreateCampaignPayload): Promise<Campaign> => {
        try {
            const response = await apiClient.post<Campaign>('/email-campaigns', payload);
            return response.data;
        } catch (err: any) {
            // In demo mode, fall back to mock
            if (isDemoMode()) {
                const newCampaign: Campaign = {
                    id: `camp-${Date.now()}`,
                    name: payload.name,
                    subject: payload.subject,
                    previewText: payload.previewText,
                    status: payload.sendNow ? 'sending' : payload.scheduledAt ? 'scheduled' : 'draft',
                    audience: 'Custom Segment',
                    templateId: payload.templateId,
                    senderName: payload.senderName,
                    replyTo: payload.replyTo,
                    segmentId: payload.segmentId,
                    createdBy: 'Demo User',
                    createdAt: new Date().toISOString(),
                    scheduledAt: payload.scheduledAt,
                };
                DEV_SEED_CAMPAIGNS.unshift(newCampaign);
                return newCampaign;
            }
            // Re-throw the full Axios error so the component can read response.data
            throw err;
        }
    },

    /**
     * Update an existing campaign
     */
    updateCampaign: async (id: string, payload: Partial<CreateCampaignPayload>): Promise<Campaign> => {
        try {
            const response = await apiClient.put<Campaign>(`/email-campaigns/${id}`, payload);
            return response.data;
        } catch (err: any) {
            if (isDemoMode()) {
                const idx = DEV_SEED_CAMPAIGNS.findIndex((c) => c.id === id);
                if (idx !== -1) {
                    const updated = { ...DEV_SEED_CAMPAIGNS[idx], ...payload };
                    DEV_SEED_CAMPAIGNS[idx] = updated as Campaign;
                    return updated as Campaign;
                }
                throw new Error('Campaign not found');
            }
            // Re-throw the full Axios error so the component can read response.data
            throw err;
        }
    },

    /**
     * Duplicate a campaign
     */
    duplicateCampaign: async (id: string): Promise<Campaign> => {
        try {
            const response = await apiClient.post<Campaign>(`/email-campaigns/${id}/duplicate`);
            return response.data;
        } catch (err: any) {
            if (isDemoMode()) {
                const original = DEV_SEED_CAMPAIGNS.find((c) => c.id === id);
                if (original) {
                    const dup: Campaign = {
                        ...original,
                        id: `camp-${Date.now()}`,
                        name: `${original.name} (Copy)`,
                        status: 'draft',
                        createdAt: new Date().toISOString(),
                        scheduledAt: undefined,
                        sentAt: undefined,
                    };
                    DEV_SEED_CAMPAIGNS.unshift(dup);
                    return dup;
                }
                throw new Error('Campaign not found');
            }
            throw err;
        }
    },

    /**
     * Schedule a campaign
     */
    scheduleCampaign: async (id: string, scheduledAt?: string): Promise<Campaign> => {
        try {
            const response = await apiClient.post<Campaign>(
                `/email-campaigns/${id}/schedule`,
                scheduledAt ? { scheduledAt } : undefined
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                const campaign = DEV_SEED_CAMPAIGNS.find((c) => c.id === id);
                if (campaign) {
                    campaign.status = scheduledAt ? 'scheduled' : 'sending';
                    campaign.scheduledAt = scheduledAt || new Date().toISOString();
                    return { ...campaign };
                }
                throw new Error('Campaign not found');
            }
            throw new Error('Failed to schedule campaign');
        }
    },

    /**
     * Pause a campaign
     */
    pauseCampaign: async (id: string): Promise<Campaign> => {
        try {
            const response = await apiClient.post<Campaign>(`/email-campaigns/${id}/pause`);
            return response.data;
        } catch (err: any) {
            if (isDemoMode()) {
                const campaign = DEV_SEED_CAMPAIGNS.find((c) => c.id === id);
                if (campaign) {
                    campaign.status = 'paused';
                    return { ...campaign };
                }
                throw new Error('Campaign not found');
            }
            throw err;
        }
    },

    /**
     * Fetch templates
     */
    getTemplates: async (): Promise<EmailTemplate[]> => {
        try {
            const response = await apiClient.get<EmailTemplate[]>('/email-campaigns/templates');
            return response.data;
        } catch {
            if (isDemoMode()) {
                return [...DEV_SEED_TEMPLATES];
            }
            throw new Error('Failed to load templates');
        }
    },

    /**
     * Create a new template
     */
    createTemplate: async (payload: Partial<EmailTemplate>): Promise<EmailTemplate> => {
        try {
            const response = await apiClient.post<EmailTemplate>('/email-campaigns/templates', payload);
            return response.data;
        } catch (err: any) {
            console.error('[emailCampaignService] createTemplate Error:', err.response?.data || err.message);
            if (isDemoMode()) {
                const newTpl: EmailTemplate = {
                    ...payload,
                    id: `tpl-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                } as EmailTemplate;
                DEV_SEED_TEMPLATES.unshift(newTpl);
                return newTpl;
            }
            throw new Error('Failed to create template');
        }
    },

    /**
     * Update an existing template
     */
    updateTemplate: async (id: string, payload: Partial<EmailTemplate>): Promise<EmailTemplate> => {
        try {
            const response = await apiClient.put<EmailTemplate>(`/email-campaigns/templates/${id}`, payload);
            return response.data;
        } catch (err: any) {
            console.error('[emailCampaignService] updateTemplate Error:', err.response?.data || err.message);
            if (isDemoMode()) {
                const idx = DEV_SEED_TEMPLATES.findIndex((t) => t.id === id);
                if (idx !== -1) {
                    const updated = { ...DEV_SEED_TEMPLATES[idx], ...payload, updatedAt: new Date().toISOString() };
                    DEV_SEED_TEMPLATES[idx] = updated as EmailTemplate;
                    return updated as EmailTemplate;
                }
                throw new Error('Template not found');
            }
            throw new Error('Failed to update template');
        }
    },

    /**
     * Delete a template
     */
    deleteTemplate: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/email-campaigns/templates/${id}`);
        } catch {
            if (isDemoMode()) {
                const idx = DEV_SEED_TEMPLATES.findIndex((t) => t.id === id);
                if (idx !== -1) {
                    DEV_SEED_TEMPLATES.splice(idx, 1);
                }
                return;
            }
            throw new Error('Failed to delete template');
        }
    },

    /**
     * Fetch audience eligibility
     */
    getContacts: async (): Promise<AudienceEligibility> => {
        try {
            const response = await apiClient.get<AudienceEligibility>('/email-campaigns/contacts');
            return response.data;
        } catch {
            if (isDemoMode()) {
                return {
                    total: 12450,
                    eligible: 9720,
                    excluded: 2730,
                    reasons: {
                        noConsent: 890,
                        unsubscribed: 1240,
                        suppressed: 420,
                        invalid: 180,
                    },
                };
            }
            throw new Error('Failed to load audience data');
        }
    },

    /**
     * Send a test email
     */
    sendTestEmail: async (email: string, options: { templateId?: string; templateHtml?: string }): Promise<void> => {
        try {
            await apiClient.post('/email-campaigns/test-send', { ...options, email });
        } catch {
            if (isDemoMode()) {
                // Simulate a 500ms delay for the demo
                await new Promise((r) => setTimeout(r, 500));
                console.log(`[DEMO] Test email would be sent to ${email}`);
                return;
            }
            throw new Error('Failed to send test email');
        }
    },
    /**
     * Archive a campaign
     */
    archiveCampaign: async (id: string): Promise<void> => {
        try {
            await apiClient.post(`/email-campaigns/${id}/archive`);
        } catch (err: any) {
            if (isDemoMode()) {
                const idx = DEV_SEED_CAMPAIGNS.findIndex((c) => c.id === id);
                if (idx !== -1) {
                    DEV_SEED_CAMPAIGNS.splice(idx, 1);
                }
                return;
            }
            throw err;
        }
    },
    /**
     * Fetch dashboard summary stats
     */
    getDashboardStats: async (filters: any): Promise<any> => {
        try {
            // In reality, this would send filters to the backend
            const response = await apiClient.get('/email-campaigns/dashboard/stats', { params: filters });
            return response.data;
        } catch {
            // Dashboard already has its own MOCK_STATS fallback, but we provide one here too
            if (isDemoMode()) {
                return null; // DashboardPage has its own MOCK_STATS fallback
            }
            throw new Error('Failed to load dashboard stats');
        }
    },
};
