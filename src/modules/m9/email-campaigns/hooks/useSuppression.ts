'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    SuppressionEntry,
    ConsentEntry,
    SuppressionFilters,
    ConsentFilters,
    DEFAULT_SUPPRESSION_FILTERS,
    DEFAULT_CONSENT_FILTERS,
} from '../types/suppression.types';
import { suppressionService } from '../services/suppressionService';

/**
 * Hook to manage the Suppression & Consent module.
 * Provides data, filters, stats, and mutation methods for both tabs.
 */
export function useSuppression() {
    // ── Suppression list state ─────────────────────────────────────────
    const [suppressions, setSuppressions] = useState<SuppressionEntry[]>([]);
    const [suppressionLoading, setSuppressionLoading] = useState(true);
    const [suppressionError, setSuppressionError] = useState<string | null>(null);
    const [suppressionFilters, setSuppressionFilters] = useState<SuppressionFilters>(
        DEFAULT_SUPPRESSION_FILTERS
    );

    // ── Consent list state ─────────────────────────────────────────────
    const [consentList, setConsentList] = useState<ConsentEntry[]>([]);
    const [consentLoading, setConsentLoading] = useState(true);
    const [consentError, setConsentError] = useState<string | null>(null);
    const [consentFilters, setConsentFilters] = useState<ConsentFilters>(
        DEFAULT_CONSENT_FILTERS
    );

    // ── Fetch suppressions ─────────────────────────────────────────────
    const fetchSuppressions = useCallback(
        async (activeFilters?: SuppressionFilters) => {
            setSuppressionLoading(true);
            setSuppressionError(null);
            try {
                const f = activeFilters ?? suppressionFilters;
                const data = await suppressionService.getSuppressionList({
                    reason: f.reason,
                    date_from: f.date_from,
                    date_to: f.date_to,
                    search: f.search,
                });
                setSuppressions(data);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : 'Failed to load suppression list';
                setSuppressionError(message);
            } finally {
                setSuppressionLoading(false);
            }
        },
        [suppressionFilters]
    );

    // ── Fetch consent list ─────────────────────────────────────────────
    const fetchConsent = useCallback(
        async (activeFilters?: ConsentFilters) => {
            setConsentLoading(true);
            setConsentError(null);
            try {
                const f = activeFilters ?? consentFilters;
                const data = await suppressionService.getConsentList({
                    consent_status: f.consent_status,
                    search: f.search,
                });
                setConsentList(data);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : 'Failed to load consent data';
                setConsentError(message);
            } finally {
                setConsentLoading(false);
            }
        },
        [consentFilters]
    );

    // ── Initial + filter-triggered fetches ─────────────────────────────
    useEffect(() => {
        fetchSuppressions(suppressionFilters);
    }, [suppressionFilters]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchConsent(consentFilters);
    }, [consentFilters]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Suppression stats ──────────────────────────────────────────────
    const suppressionStats = useMemo(() => {
        const total = suppressions.length;
        const unsubscribed = suppressions.filter((e) => e.reason === 'unsubscribed').length;
        const bounced = suppressions.filter((e) => e.reason === 'bounced').length;
        const complained = suppressions.filter((e) => e.reason === 'complained').length;
        return { total, unsubscribed, bounced, complained };
    }, [suppressions]);

    // ── Consent stats ──────────────────────────────────────────────────
    const consentStats = useMemo(() => {
        const total = consentList.length;
        const eligible = consentList.filter((e) => e.consent_status === 'eligible').length;
        const unsubscribed = consentList.filter((e) => e.consent_status === 'unsubscribed').length;
        const noConsent = consentList.filter((e) => e.consent_status === 'no_consent').length;
        return { total, eligible, unsubscribed, noConsent };
    }, [consentList]);

    // ── Filter updaters ────────────────────────────────────────────────
    const updateSuppressionFilter = useCallback(
        <K extends keyof SuppressionFilters>(key: K, value: SuppressionFilters[K]) => {
            setSuppressionFilters((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const updateConsentFilter = useCallback(
        <K extends keyof ConsentFilters>(key: K, value: ConsentFilters[K]) => {
            setConsentFilters((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const resetSuppressionFilters = useCallback(() => {
        setSuppressionFilters(DEFAULT_SUPPRESSION_FILTERS);
    }, []);

    const resetConsentFilters = useCallback(() => {
        setConsentFilters(DEFAULT_CONSENT_FILTERS);
    }, []);

    return {
        // Suppression
        suppressions,
        suppressionLoading,
        suppressionError,
        suppressionFilters,
        suppressionStats,
        updateSuppressionFilter,
        resetSuppressionFilters,
        refetchSuppressions: () => fetchSuppressions(suppressionFilters),

        // Consent
        consentList,
        consentLoading,
        consentError,
        consentFilters,
        consentStats,
        updateConsentFilter,
        resetConsentFilters,
        refetchConsent: () => fetchConsent(consentFilters),
    };
}
