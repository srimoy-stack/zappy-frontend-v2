'use client';

import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/auditService';
import { AuditLogEntry, AuditLogFilters, AuditSummary, DEFAULT_AUDIT_FILTERS } from '../types/audit.types';

export function useAuditLogs() {
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [summary, setSummary] = useState<AuditSummary | null>(null);
    const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_AUDIT_FILTERS);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const activeFilters: Partial<AuditLogFilters> = {};
            if (filters.action) activeFilters.action = filters.action;
            if (filters.entity_type) activeFilters.entity_type = filters.entity_type;
            if (filters.date_from) activeFilters.date_from = filters.date_from;
            if (filters.date_to) activeFilters.date_to = filters.date_to;
            if (filters.search) activeFilters.search = filters.search;

            const result = await auditService.getAuditLogs(activeFilters, page, 50);
            setEntries(result.data);
            setTotalPages(result.meta.last_page);
            setTotal(result.meta.total);
        } catch (err: any) {
            setError(err.message || 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    const fetchSummary = useCallback(async () => {
        try {
            const data = await auditService.getSummary();
            setSummary(data);
        } catch {
            // Non-blocking — summary is optional
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const updateFilters = useCallback((updates: Partial<AuditLogFilters>) => {
        setFilters((prev) => ({ ...prev, ...updates }));
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(DEFAULT_AUDIT_FILTERS);
        setPage(1);
    }, []);

    return {
        entries,
        summary,
        filters,
        page,
        totalPages,
        total,
        loading,
        error,
        setPage,
        updateFilters,
        clearFilters,
        refresh: fetchLogs,
    };
}
