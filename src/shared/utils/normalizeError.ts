/**
 * normalizeError — Converts any error into a consistent ApiError shape.
 *
 * Handles: Axios errors, network errors, timeout, and unknown errors.
 */

import { AxiosError } from 'axios';
import type { ApiError } from '@/shared/types/api';
import { API_ERROR_CODES } from '@/shared/types/api';

export function normalizeError(error: unknown): ApiError {
    // Axios error with response (4xx, 5xx)
    if (isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        const serverMessage = (data as any)?.message || (data as any)?.error || error.message;
        const serverCode = (data as any)?.code;

        return {
            success: false,
            status,
            code: serverCode || mapStatusToCode(status),
            message: serverMessage || `Request failed with status ${status}`,
            details: (data as any)?.details || (data as any)?.errors,
        };
    }

    // Axios error without response (network/timeout)
    if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
            return {
                success: false,
                status: 0,
                code: API_ERROR_CODES.TIMEOUT,
                message: 'Request timed out. Please check your connection and try again.',
            };
        }

        return {
            success: false,
            status: 0,
            code: API_ERROR_CODES.NETWORK,
            message: 'Network error. Please check your internet connection.',
        };
    }

    // Standard Error
    if (error instanceof Error) {
        return {
            success: false,
            status: 0,
            code: API_ERROR_CODES.UNKNOWN,
            message: error.message,
        };
    }

    // Unknown
    return {
        success: false,
        status: 0,
        code: API_ERROR_CODES.UNKNOWN,
        message: 'An unexpected error occurred.',
    };
}

function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError)?.isAxiosError === true;
}

function mapStatusToCode(status: number): string {
    switch (status) {
        case 400: return API_ERROR_CODES.VALIDATION;
        case 401: return API_ERROR_CODES.UNAUTHORIZED;
        case 403: return API_ERROR_CODES.FORBIDDEN;
        case 404: return API_ERROR_CODES.NOT_FOUND;
        default:
            if (status >= 500) return API_ERROR_CODES.SERVER;
            return API_ERROR_CODES.UNKNOWN;
    }
}

/**
 * Type guard — check if an error is a normalized ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'success' in error &&
        (error as any).success === false &&
        'code' in error &&
        'message' in error
    );
}
