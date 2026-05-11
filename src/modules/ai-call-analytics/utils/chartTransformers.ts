import type { AiCall, AiCallAlert, Sentiment } from '../types/callAnalytics.types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DailyVolume {
    date: string;
    total: number;
}

export interface DailySuccessBreakdown {
    date: string;
    successful: number;
    partial: number;
    failed: number;
}

export interface SentimentSlice {
    name: string;
    value: number;
    color: string;
}

export interface IntentBar {
    intent: string;
    count: number;
}

export interface DailyAlerts {
    date: string;
    high: number;
    medium: number;
}

// ─── Colors ─────────────────────────────────────────────────────────────────

export const CHART_COLORS = {
    primary: '#3b82f6',
    successful: '#10b981',
    partial: '#f59e0b',
    failed: '#ef4444',
    positive: '#10b981',
    neutral: '#94a3b8',
    negative: '#ef4444',
    alertHigh: '#ef4444',
    alertMedium: '#f59e0b',
} as const;

const SENTIMENT_COLORS: Record<Sentiment, string> = {
    positive: CHART_COLORS.positive,
    neutral: CHART_COLORS.neutral,
    negative: CHART_COLORS.negative,
};

// ─── Transformers ───────────────────────────────────────────────────────────

/**
 * Group calls by date → total per day.
 */
export function toCallVolumeTrend(calls: AiCall[]): DailyVolume[] {
    const map = new Map<string, number>();

    calls.forEach((call) => {
        const date = call.call_datetime.slice(0, 10); // YYYY-MM-DD
        map.set(date, (map.get(date) ?? 0) + 1);
    });

    return Array.from(map.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Group calls by date → success/partial/failed per day.
 */
export function toSuccessBreakdown(calls: AiCall[]): DailySuccessBreakdown[] {
    const map = new Map<string, { successful: number; partial: number; failed: number }>();

    calls.forEach((call) => {
        const date = call.call_datetime.slice(0, 10);
        const entry = map.get(date) ?? { successful: 0, partial: 0, failed: 0 };
        if (call.success_status === 'successful') entry.successful++;
        else if (call.success_status === 'partial') entry.partial++;
        else if (call.success_status === 'failed') entry.failed++;
        map.set(date, entry);
    });

    return Array.from(map.entries())
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Count calls by sentiment → pie chart slices.
 */
export function toSentimentDistribution(calls: AiCall[]): SentimentSlice[] {
    const counts: Record<Sentiment, number> = { positive: 0, neutral: 0, negative: 0 };

    calls.forEach((call) => {
        if (counts[call.sentiment] !== undefined) {
            counts[call.sentiment]++;
        }
    });

    return Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: SENTIMENT_COLORS[name as Sentiment],
        }));
}

/**
 * Count calls by customer_intent → bar chart data.
 */
export function toIntentBreakdown(calls: AiCall[]): IntentBar[] {
    const map = new Map<string, number>();

    calls.forEach((call) => {
        const label = call.customer_intent.replace(/_/g, ' ');
        map.set(label, (map.get(label) ?? 0) + 1);
    });

    return Array.from(map.entries())
        .map(([intent, count]) => ({ intent, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Group alerts by date → high/medium per day.
 */
export function toAlertsTrend(alerts: AiCallAlert[]): DailyAlerts[] {
    const map = new Map<string, { high: number; medium: number }>();

    alerts.forEach((alert) => {
        const date = alert.created_at.slice(0, 10);
        const entry = map.get(date) ?? { high: 0, medium: 0 };
        if (alert.severity === 'high') entry.high++;
        else entry.medium++;
        map.set(date, entry);
    });

    return Array.from(map.entries())
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => a.date.localeCompare(b.date));
}
