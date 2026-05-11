/**
 * CSV Export Utility for Email Campaign Analytics
 *
 * Generates a CSV file from campaign metrics and triggers a browser download.
 * No backend dependency — runs entirely client-side.
 */

export interface CampaignMetricRow {
    campaignName: string;
    status: string;
    sent: number;
    delivered: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    bounceRate: number;
}

const CSV_HEADERS = [
    'Campaign Name',
    'Status',
    'Sent',
    'Delivered',
    'Open Rate (%)',
    'Click Rate (%)',
    'Unsubscribe Rate (%)',
    'Bounce Rate (%)',
];

/**
 * Escape a CSV cell value (wrap in quotes if it contains commas, quotes, or newlines).
 */
function escapeCSV(value: string | number): string {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Convert campaign metrics into a CSV string.
 */
export function generateCSV(rows: CampaignMetricRow[]): string {
    const headerLine = CSV_HEADERS.map(escapeCSV).join(',');

    const dataLines = rows.map((row) =>
        [
            escapeCSV(row.campaignName),
            escapeCSV(row.status),
            escapeCSV(row.sent),
            escapeCSV(row.delivered),
            escapeCSV(row.openRate.toFixed(1)),
            escapeCSV(row.clickRate.toFixed(1)),
            escapeCSV(row.unsubscribeRate.toFixed(2)),
            escapeCSV(row.bounceRate.toFixed(2)),
        ].join(',')
    );

    return [headerLine, ...dataLines].join('\n');
}

/**
 * Generate a filename with today's date: email_campaigns_2026-04-17.csv
 */
function getFilename(): string {
    const today = new Date().toISOString().split('T')[0]!;
    return `email_campaigns_${today}.csv`;
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV(rows: CampaignMetricRow[]): void {
    const csv = generateCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = getFilename();
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}
