'use client';

import React from 'react';
import type { StatusColor, Sentiment, AlertSeverity } from '../types/callAnalytics.types';

// ─── Generic Value Badge ────────────────────────────────────────────────────

type BadgeType = 'call_status' | 'sentiment' | 'success_status' | 'status_color';

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
    // Call Status
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    failed: { bg: 'bg-red-100', text: 'text-red-800' },
    missed: { bg: 'bg-orange-100', text: 'text-orange-800' },
    no_answer: { bg: 'bg-slate-100', text: 'text-slate-700' },
    busy: { bg: 'bg-amber-100', text: 'text-amber-800' },
    dropped: { bg: 'bg-red-100', text: 'text-red-800' },
    // Sentiment
    positive: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    neutral: { bg: 'bg-slate-100', text: 'text-slate-700' },
    negative: { bg: 'bg-red-100', text: 'text-red-800' },
    // Success Status
    successful: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    partial: { bg: 'bg-amber-100', text: 'text-amber-800' },
    // Status Color
    green: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    yellow: { bg: 'bg-amber-100', text: 'text-amber-800' },
    red: { bg: 'bg-red-100', text: 'text-red-800' },
};

export interface StatusBadgeProps {
    type?: BadgeType;
    value: string;
    color?: StatusColor;
    label?: string;
}

/**
 * Versatile badge that styles values based on their semantic meaning.
 * Supports call_status, sentiment, success_status, and status_color.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ value, color, label }) => {
    const key = color || value;
    const config = BADGE_STYLES[key] || { bg: 'bg-slate-100', text: 'text-slate-700' };
    const displayLabel = label || value.replace(/_/g, ' ');

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${config.bg} ${config.text}`}
        >
            {displayLabel}
        </span>
    );
};

// ─── Sentiment Badge ────────────────────────────────────────────────────────

const SENTIMENT_MAP: Record<Sentiment, { bg: string; text: string }> = {
    positive: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    neutral: { bg: 'bg-slate-100', text: 'text-slate-700' },
    negative: { bg: 'bg-red-100', text: 'text-red-800' },
};

interface SentimentBadgeProps {
    sentiment: Sentiment;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment }) => {
    const config = SENTIMENT_MAP[sentiment] || SENTIMENT_MAP.neutral;
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${config.bg} ${config.text}`}
        >
            {sentiment}
        </span>
    );
};

// ─── Severity Badge (for alerts) ────────────────────────────────────────────

const SEVERITY_MAP: Record<AlertSeverity, { bg: string; text: string; dot: string }> = {
    high: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
};

interface SeverityBadgeProps {
    severity: AlertSeverity;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
    const config = SEVERITY_MAP[severity] || SEVERITY_MAP.medium;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${config.bg} ${config.text}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {severity}
        </span>
    );
};
