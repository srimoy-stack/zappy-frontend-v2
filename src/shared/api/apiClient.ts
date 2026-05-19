/**
 * API Client — Single Axios Instance
 *
 * Features:
 * - In-memory token injection (tokenManager)
 * - Fallback to NextAuth session token
 * - X-Tenant-ID / X-Store-ID injection from context setters
 * - Route context enforcement (validates tenant/store before request)
 * - 401 auto-refresh with retry (single refresh lock)
 * - Normalized error handling
 * - Dev request logging
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import { env } from '@/shared/config/env';
import { getRouteContextRule } from '@/shared/config/routeContext';
import {
    getAccessToken,
    setAccessToken,
    isTokenExpired,
    getRefreshPromise,
    setRefreshPromise,
    setRefreshToken,
} from '@/shared/utils/tokenManager';
import { refreshToken } from '@/shared/api/services/auth.service';
import { forceLogout } from '@/shared/utils/auth';
import { normalizeError } from '@/shared/utils/normalizeError';
import { handleApiError } from '@/shared/utils/errorHandler';

// ─── Singleton Instance ──────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30000,
    withCredentials: false, // FastAPI uses body-based refresh, not httpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Context State (set by providers) ────────────────────────────────────────

let _tenantId: string | null = null;
let _storeId: string | null = null;

export function setApiTenantId(tenantId: string | null) {
    _tenantId = tenantId;
}

export function setApiStoreId(storeId: string | null) {
    _storeId = storeId;
}

// ─── Request: Auth Token Injection ───────────────────────────────────────────

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // 1. Try in-memory token first
        let token = getAccessToken();

        // 2. If expired, try to refresh before sending
        if (token && isTokenExpired()) {
            token = await attemptRefresh();
        }

        // 3. Fallback to NextAuth session token
        if (!token) {
            try {
                const session = await getSession();
                if (session?.user) {
                    token = (session.user as any)?.accessToken || null;
                    if (token) {
                        // Store in memory for future requests
                        setAccessToken(token);
                    }
                    // Also store refresh token from session
                    const rt = (session.user as any)?.refreshToken;
                    if (rt) {
                        setRefreshToken(rt);
                    }
                }
            } catch {
                // Session fetch failed — proceed without auth
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Request: Tenant/Store Headers + Route Context ───────────────────────────

apiClient.interceptors.request.use((config) => {
    if (_tenantId) {
        config.headers['X-Tenant-ID'] = _tenantId;
    }
    if (_storeId) {
        config.headers['X-Store-ID'] = _storeId;
    }

    // Route context enforcement (client-side only)
    if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const rule = getRouteContextRule(pathname);

        const url = config.url || '';
        const isBootstrap = url.includes('/me') || url.includes('/auth');

        if (!isBootstrap) {
            if (rule.requiresTenant && !_tenantId) {
                console.warn(`[API] Route ${pathname} requires X-Tenant-ID but none set. Request: ${url}`);
                window.dispatchEvent(new CustomEvent('api:tenant-missing', {
                    detail: { url, pathname },
                }));
            }

            if (rule.requiresStore && !_storeId) {
                console.warn(`[API] Route ${pathname} requires X-Store-ID but none set. Request: ${url}`);
                window.dispatchEvent(new CustomEvent('api:store-missing', {
                    detail: { url, pathname },
                }));
            }
        }
    }

    return config;
});

// ─── Response: Normalize Errors + 401 Refresh/Retry ─────────────────────────

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

        // 401 + not already retried + not an auth endpoint → attempt refresh
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retried &&
            !originalRequest.url?.includes('/auth/')
        ) {
            originalRequest._retried = true;

            const newToken = await attemptRefresh();

            if (newToken) {
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            }

            // Refresh failed — force logout
            forceLogout();
            return Promise.reject(normalizeError(error));
        }

        // Non-401 errors — normalize and handle
        const normalized = normalizeError(error);

        // Silent for 401 (already handled above or by redirect)
        const silent = normalized.status === 401;
        handleApiError(normalized, { silent });

        return Promise.reject(normalized);
    }
);

// ─── Token Refresh (Single-flight) ──────────────────────────────────────────

async function attemptRefresh(): Promise<string | null> {
    // If a refresh is already in flight, wait for it
    const existing = getRefreshPromise();
    if (existing) return existing;

    const promise = (async (): Promise<string | null> => {
        try {
            const result = await refreshToken();
            if (result) {
                setAccessToken(result.accessToken, result.expiresIn);
                return result.accessToken;
            }
            return null;
        } catch {
            return null;
        } finally {
            setRefreshPromise(null);
        }
    })();

    setRefreshPromise(promise);
    return promise;
}

// ─── Dev Logging ─────────────────────────────────────────────────────────────

if (env.isDev) {
    apiClient.interceptors.request.use((config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
            tenantId: config.headers?.['X-Tenant-ID'],
            storeId: config.headers?.['X-Store-ID'],
            hasAuth: !!config.headers?.Authorization,
        });
        return config;
    });
}

export { apiClient };
export default apiClient;
