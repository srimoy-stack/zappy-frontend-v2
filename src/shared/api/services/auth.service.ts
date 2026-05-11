/**
 * Auth Service — Token refresh and session management.
 *
 * refreshToken() hits the backend which reads the httpOnly refresh cookie
 * and returns a new access token.
 */

import axios from 'axios';
import { env } from '@/shared/config/env';

/**
 * POST /auth/refresh — Exchange httpOnly refresh cookie for a new access token.
 *
 * Uses a standalone axios instance (not apiClient) to avoid interceptor loops.
 */
export async function refreshToken(): Promise<{ accessToken: string; expiresIn: number } | null> {
    try {
        const { data } = await axios.post(
            `${env.apiBaseUrl}/auth/refresh`,
            {},
            { withCredentials: true } // sends httpOnly cookie
        );

        if (data?.accessToken) {
            return {
                accessToken: data.accessToken,
                expiresIn: data.expiresIn || 900_000, // default 15 min
            };
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * POST /auth/logout — Invalidate session on backend.
 */
export async function serverLogout(): Promise<void> {
    try {
        await axios.post(
            `${env.apiBaseUrl}/auth/logout`,
            {},
            { withCredentials: true }
        );
    } catch {
        // Silent — logout must never throw
    }
}
