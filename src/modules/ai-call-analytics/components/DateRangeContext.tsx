'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DateRange {
    dateFrom: string;
    dateTo: string;
}

interface DateRangeContextValue extends DateRange {
    setDateRange: (range: Partial<DateRange>) => void;
    resetDateRange: () => void;
    preset: DatePreset;
    setPreset: (preset: DatePreset) => void;
}

export type DatePreset = '7d' | '30d' | '90d' | 'today' | 'custom';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function getPresetRange(preset: DatePreset): DateRange {
    const now = new Date();
    const today = formatDate(now);

    switch (preset) {
        case 'today':
            return { dateFrom: today, dateTo: today };
        case '7d': {
            const from = new Date(now);
            from.setDate(from.getDate() - 7);
            return { dateFrom: formatDate(from), dateTo: today };
        }
        case '30d': {
            const from = new Date(now);
            from.setDate(from.getDate() - 30);
            return { dateFrom: formatDate(from), dateTo: today };
        }
        case '90d': {
            const from = new Date(now);
            from.setDate(from.getDate() - 90);
            return { dateFrom: formatDate(from), dateTo: today };
        }
        case 'custom':
            return { dateFrom: '', dateTo: '' };
    }
}

// ─── Context ────────────────────────────────────────────────────────────────

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useDateRange(): DateRangeContextValue {
    const ctx = useContext(DateRangeContext);
    if (!ctx) {
        throw new Error('useDateRange must be used inside <DateRangeProvider>');
    }
    return ctx;
}

// ─── Provider ───────────────────────────────────────────────────────────────

interface DateRangeProviderProps {
    children: ReactNode;
    defaultPreset?: DatePreset;
}

export const DateRangeProvider: React.FC<DateRangeProviderProps> = ({
    children,
    defaultPreset = '30d',
}) => {
    const [preset, setPresetState] = useState<DatePreset>(defaultPreset);
    const defaultRange = useMemo(() => getPresetRange(defaultPreset), [defaultPreset]);
    const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
    const [dateTo, setDateTo] = useState(defaultRange.dateTo);

    const setDateRange = useCallback((range: Partial<DateRange>) => {
        if (range.dateFrom !== undefined) setDateFrom(range.dateFrom);
        if (range.dateTo !== undefined) setDateTo(range.dateTo);
        setPresetState('custom');
    }, []);

    const setPreset = useCallback((p: DatePreset) => {
        setPresetState(p);
        const range = getPresetRange(p);
        setDateFrom(range.dateFrom);
        setDateTo(range.dateTo);
    }, []);

    const resetDateRange = useCallback(() => {
        setPreset(defaultPreset);
    }, [defaultPreset, setPreset]);

    const value = useMemo(
        () => ({ dateFrom, dateTo, setDateRange, resetDateRange, preset, setPreset }),
        [dateFrom, dateTo, setDateRange, resetDateRange, preset, setPreset]
    );

    return (
        <DateRangeContext.Provider value={value}>
            {children}
        </DateRangeContext.Provider>
    );
};
