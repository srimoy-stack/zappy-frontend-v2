import apiClient from '@/api/axios';
import { EmailSettings } from '../types/settings.types';
import { isDemoMode } from '../utils/demoMode';

const DEMO_SETTINGS: EmailSettings = {
    sender_name: 'Zyappy',
    sender_email: 'dev@dgoptimizer.com',
    reply_to: 'dev@dgoptimizer.com',
    business_address: 'Zyappy Pvt Ltd, India',
    contact_email: 'support@zyappy.com',
    contact_phone: '+91-XXXXXXXXXX',
    brand_name: 'Zyappy',
    store_name: 'Zyappy Store',
    force_unsubscribe_footer: 'true',
    force_identification_footer: 'true',
    block_unknown_consent: 'true',
    complaint_threshold: '0.1',
    bounce_threshold: '5.0',
};

/**
 * Settings API Service
 *
 * Manages configurable email compliance settings.
 */
export const settingsService = {
    /**
     * Fetch all email settings.
     */
    getSettings: async (): Promise<EmailSettings> => {
        try {
            const response = await apiClient.get<EmailSettings>('/email-campaigns/settings');
            return response.data;
        } catch {
            if (isDemoMode()) {
                return { ...DEMO_SETTINGS };
            }
            throw new Error('Failed to load settings');
        }
    },

    /**
     * Update email settings (bulk).
     */
    updateSettings: async (settings: Partial<EmailSettings>): Promise<{ message: string; settings: EmailSettings }> => {
        try {
            const response = await apiClient.put<{ message: string; settings: EmailSettings }>(
                '/email-campaigns/settings',
                settings
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                Object.assign(DEMO_SETTINGS, settings);
                return { message: 'Settings updated (demo)', settings: { ...DEMO_SETTINGS } };
            }
            throw new Error('Failed to update settings');
        }
    },
};
