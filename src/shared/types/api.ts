/**
 * API Response Types — Standard response shapes for all endpoints
 */

/** Standard API success response */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    status: 'success' | 'error';
}

/** Paginated response */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/** Standard API error */
export interface ApiError {
    success: false;
    status: number;
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

/** Known error codes */
export const API_ERROR_CODES = {
    NETWORK: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION: 'VALIDATION_ERROR',
    SERVER: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR',
} as const;

/** GET /me response shape */
export interface MeResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    tenant: {
        id: string;
        name: string;
        slug: string;
    } | null;
    stores: Array<{
        id: string;
        name: string;
        code: string;
    }>;
    permissions: string[];
    enabledModules: string[];
}
