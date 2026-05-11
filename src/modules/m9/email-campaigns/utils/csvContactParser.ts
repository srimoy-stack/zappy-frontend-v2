import {
    CsvImportRow,
    CsvImportResult,
    ContactConsentStatus,
} from '../types/contact.types';

const VALID_CONSENT_VALUES: ContactConsentStatus[] = ['eligible', 'unsubscribed', 'no_consent'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parses and validates a CSV string into an import preview.
 *
 * Expected columns (header row required):
 *   name, email, store_id, consent_status
 *
 * Rules:
 * - name is required (non-empty)
 * - email is required and must match a basic email regex
 * - store_id is required
 * - consent_status is required and must be one of: eligible, unsubscribed, no_consent
 * - consent_status is NEVER assumed — missing = invalid
 */
export function parseCsvContacts(csvText: string): CsvImportResult {
    const lines = csvText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length < 2) {
        return { total: 0, valid: 0, invalid: 0, rows: [] };
    }

    // Parse header
    const headerLine = lines[0]!;
    const headers = headerLine.split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));

    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');
    const storeIdx = headers.indexOf('store_id');
    const consentIdx = headers.indexOf('consent_status');

    const rows: CsvImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]!);
        const errors: string[] = [];

        const name = (nameIdx >= 0 ? cols[nameIdx]?.trim() : '') || '';
        const email = (emailIdx >= 0 ? cols[emailIdx]?.trim() : '') || '';
        const store_id = (storeIdx >= 0 ? cols[storeIdx]?.trim() : '') || '';
        const consent_status = (consentIdx >= 0 ? cols[consentIdx]?.trim().toLowerCase() : '') || '';

        // Validate name
        if (!name) {
            errors.push('Name is required');
        }

        // Validate email
        if (!email) {
            errors.push('Email is required');
        } else if (!EMAIL_REGEX.test(email)) {
            errors.push('Invalid email format');
        }

        // Validate store_id
        if (!store_id) {
            errors.push('Store ID is required');
        }

        // Validate consent_status — NEVER assume
        if (!consent_status) {
            errors.push('Consent status is required (Do NOT assume consent)');
        } else if (!VALID_CONSENT_VALUES.includes(consent_status as ContactConsentStatus)) {
            errors.push(
                `Invalid consent status "${consent_status}". Must be one of: ${VALID_CONSENT_VALUES.join(', ')}`
            );
        }

        rows.push({
            rowIndex: i,
            name,
            email,
            store_id,
            consent_status,
            valid: errors.length === 0,
            errors,
        });
    }

    const valid = rows.filter((r) => r.valid).length;
    return {
        total: rows.length,
        valid,
        invalid: rows.length - valid,
        rows,
    };
}

/**
 * Naive CSV line parser that handles quoted fields with commas.
 */
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}
