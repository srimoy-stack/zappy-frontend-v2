import type { AiCall, StatusColor } from '../types/callAnalytics.types';

/**
 * Compute status color for a call record.
 *
 * RED:   failed OR negative sentiment OR issue_detected != none
 * YELLOW: partial OR follow_up_required
 * GREEN:  successful
 *
 * The backend computes this identically via the status_color accessor.
 * This util exists for any client-side computation needs.
 */
export function getStatusColor(call: Pick<AiCall, 'success_status' | 'sentiment' | 'issue_detected' | 'follow_up_required'>): StatusColor {
    // RED conditions
    if (
        call.success_status === 'failed' ||
        call.sentiment === 'negative' ||
        (call.issue_detected && call.issue_detected !== 'none')
    ) {
        return 'red';
    }

    // YELLOW conditions
    if (call.success_status === 'partial' || call.follow_up_required) {
        return 'yellow';
    }

    // GREEN
    return 'green';
}

/**
 * Map status color to Tailwind CSS classes.
 */
export const STATUS_COLOR_CLASSES: Record<StatusColor, { bg: string; text: string; dot: string; border: string }> = {
    green: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        border: 'border-emerald-200',
    },
    yellow: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        border: 'border-amber-200',
    },
    red: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        dot: 'bg-red-500',
        border: 'border-red-200',
    },
};
