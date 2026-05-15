'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContactRecord, ContactFilters, DEFAULT_CONTACT_FILTERS } from '../types/contact.types';
import { StoreOption } from '../types/campaign.types';
import { contactService } from '../services/contactService';

/**
 * Hook to manage contacts with filtering, search, and CRUD operations.
 * All fetches pass explicit consent/suppression filters — nothing assumed.
 */
export function useContactsList() {
    const [contacts, setContacts] = useState<ContactRecord[]>([]);
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ContactFilters>(DEFAULT_CONTACT_FILTERS);

    // ── Fetch contacts (passes filters to service) ─────────────────────
    const fetchContacts = useCallback(async (activeFilters?: ContactFilters) => {
        setLoading(true);
        setError(null);
        try {
            const f = activeFilters ?? filters;
            const data = await contactService.getContacts({
                consent_status: f.consent_status,
                store_id: f.store_id,
                suppression_status: f.suppression_status,
                search: f.search,
            });
            setContacts(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load contacts';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // ── Load stores on mount ───────────────────────────────────────────
    useEffect(() => {
        contactService.getStores().then(setStores).catch(() => {});
    }, []);

    // ── Refetch when filters change ────────────────────────────────────
    useEffect(() => {
        fetchContacts(filters);
    }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Summary stats derived from current data ────────────────────────
    const stats = useMemo(() => {
        const total = contacts.length;
        const eligible = contacts.filter((c) => c.consent_status === 'eligible').length;
        const unsubscribed = contacts.filter((c) => c.consent_status === 'unsubscribed').length;
        const noConsent = contacts.filter((c) => c.consent_status === 'no_consent').length;
        const suppressed = contacts.filter((c) => c.suppression_status === 'suppressed').length;
        return { total, eligible, unsubscribed, noConsent, suppressed };
    }, [contacts]);

    // ── Filter updaters ────────────────────────────────────────────────
    const updateFilter = useCallback(
        <K extends keyof ContactFilters>(key: K, value: ContactFilters[K]) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_CONTACT_FILTERS);
    }, []);

    return {
        contacts,
        stores,
        loading,
        error,
        filters,
        stats,
        updateFilter,
        resetFilters,
        refetch: () => fetchContacts(filters),
    };
}
