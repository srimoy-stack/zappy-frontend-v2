import type { AiCall } from '../types/callAnalytics.types';

/**
 * Export call data to CSV or JSON.
 * Frontend-only — no backend required.
 *
 * CSV uses business-friendly column names:
 *   call_id, caller_number, location, status, sentiment, success_status, duration, date
 *
 * JSON exports the full dataset.
 */
export function exportCalls(calls: AiCall[], format: 'csv' | 'json', filename = 'call-analytics') {
    if (calls.length === 0) return;

    let content: string;
    let mimeType: string;
    let ext: string;

    if (format === 'json') {
        // Full data export (excluding any accidentally exposed sensitive fields)
        const safe = calls.map(({ ...c }) => c);
        content = JSON.stringify(safe, null, 2);
        mimeType = 'application/json';
        ext = 'json';
    } else {
        // Business-friendly CSV with clean column names
        const headers = [
            'call_id',
            'caller_number',
            'location',
            'status',
            'sentiment',
            'success_status',
            'duration',
            'date',
        ];

        const rows = calls.map((call) => {
            const duration = call.duration_seconds
                ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}`
                : '';
            const date = call.call_datetime
                ? new Date(call.call_datetime).toLocaleString()
                : '';

            const values = [
                call.call_id,
                call.caller_number,
                call.location_id,
                call.call_status,
                call.sentiment,
                call.success_status,
                duration,
                date,
            ];

            return values.map((val) => {
                const str = val === null || val === undefined ? '' : String(val);
                // Escape commas and quotes for CSV safety
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
        });

        content = [headers.join(','), ...rows].join('\n');
        mimeType = 'text/csv';
        ext = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
