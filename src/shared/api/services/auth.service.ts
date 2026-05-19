/**
 * Auth Service — Token refresh and session management.
 *
 * FastAPI backend uses body-based refresh tokens (not httpOnly cookies).
 * refreshToken() sends the stored refresh token in the request body
 * and receives new access + refresh tokens.
 */

import axios from 'axios';
import { env } from '@/shared/config/env';
import { getRefreshToken, setRefreshToken } from '@/shared/utils/tokenManager';

/**
 * POST /api/auth/refresh — Exchange refresh token for new token pair.
 *
 * Uses a standalone axios instance (not apiClient) to avoid interceptor loops.
 */
export async function refreshToken(): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) return null;

    try {
        const { data } = await axios.post(
            `${env.apiBaseUrl}/api/auth/refresh`,
            { refresh_token: currentRefreshToken }
        );

        if (data?.access_token) {
            // Store the new refresh token
            if (data.refresh_token) {
                setRefreshToken(data.refresh_token);
            }
            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token || currentRefreshToken,
                expiresIn: data.expires_in || 1_800_000, // default 30 min
            };
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * POST /api/auth/logout — Invalidate refresh token on backend.
 */
export async function serverLogout(): Promise<void> {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) return;

    try {
        await axios.post(
            `${env.apiBaseUrl}/api/auth/logout`,
            { refresh_token: currentRefreshToken }
        );
    } catch {
        // Silent — logout must never throw
    }
}
