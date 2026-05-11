/**
 * errorHandler — Global API error handling.
 *
 * Dispatches toast events, logs to console, and optionally sends to monitoring.
 */

import type { ApiError } from '@/shared/types/api';
import { API_ERROR_CODES } from '@/shared/types/api';

interface ErrorHandlerOptions {
    /** Suppress toast notification */
    silent?: boolean;
    /** Custom message override */
    message?: string;
    /** Context label for logging */
    context?: string;
}

/**
 * Handle a normalized API error — show toast, log, optionally report.
 */
export function handleApiError(error: ApiError, opts: ErrorHandlerOptions = {}): void {
    const { silent = false, message, context } = opts;

    // 1. Console log (always)
    const prefix = context ? `[API:${context}]` : '[API]';
    console.error(`${prefix} ${error.code} (${error.status}): ${error.message}`, error.details || '');

    // 2. Skip toast for silent errors
    if (silent) return;

    // 3. Don't toast 401 (middleware handles redirect)
    if (error.code === API_ERROR_CODES.UNAUTHORIZED) return;

    // 4. Dispatch toast event
    if (typeof window !== 'undefined') {
        const toastMessage = message || getHumanMessage(error);

        window.dispatchEvent(new CustomEvent('api:error', {
            detail: {
                code: error.code,
                message: toastMessage,
                status: error.status,
            },
        }));

        // 403 → also fire permission-denied for PermissionDeniedToast
        if (error.code === API_ERROR_CODES.FORBIDDEN) {
            window.dispatchEvent(new CustomEvent('api:permission-denied', {
                detail: {
                    message: toastMessage,
                },
            }));
        }
    }

    // 5. Send to monitoring (stub — replace with Sentry/Datadog)
    reportToMonitoring(error, context);
}

function getHumanMessage(error: ApiError): string {
    switch (error.code) {
        case API_ERROR_CODES.NETWORK:
            return 'Unable to connect. Please check your internet connection.';
        case API_ERROR_CODES.TIMEOUT:
            return 'The request timed out. Please try again.';
        case API_ERROR_CODES.FORBIDDEN:
            return 'You don\'t have permission to perform this action.';
        case API_ERROR_CODES.NOT_FOUND:
            return 'The requested resource was not found.';
        case API_ERROR_CODES.VALIDATION:
            return error.message || 'Please check the form for errors.';
        case API_ERROR_CODES.SERVER:
            return 'Something went wrong on our end. Please try again later.';
        default:
            return error.message || 'An unexpected error occurred.';
    }
}

function reportToMonitoring(_error: ApiError, _context?: string): void {
    // TODO: Integrate Sentry, Datadog, or LogRocket
    // Example: Sentry.captureException(new Error(error.message), { extra: { ...error, context } });
}
