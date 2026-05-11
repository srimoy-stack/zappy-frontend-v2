'use client';

import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';
import { EmailSettings } from '../types/settings.types';

export function useSettings() {
    const [settings, setSettings] = useState<EmailSettings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = useCallback(async (updates: Partial<EmailSettings>) => {
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);
            const result = await settingsService.updateSettings(updates);
            setSettings(result.settings);
            setSuccessMessage(result.message);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        saving,
        error,
        successMessage,
        updateSettings,
        refreshSettings: fetchSettings,
    };
}
