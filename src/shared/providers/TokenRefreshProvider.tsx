'use client';

/**
 * TokenRefreshProvider — Proactive silent token refresh.
 *
 * Refreshes the access token before it expires.
 * Mount once in root layout.
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import {
    getAccessToken,
    isTokenExpired,
    getTokenExpiry,
    setAccessToken,
} from '@/shared/utils/tokenManager';
import { refreshToken } from '@/shared/api/services/auth.service';

const REFRESH_CHECK_INTERVAL = 60_000; // Check every 1 min
const REFRESH_BUFFER_MS = 120_000; // Refresh 2 min before expiry

export function TokenRefreshProvider({ children }: { children: ReactNode }) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        async function checkAndRefresh() {
            const token = getAccessToken();
            if (!token) return;

            const expiry = getTokenExpiry();
            if (!expiry) return;

            const timeUntilExpiry = expiry - Date.now();

            // If within buffer window, refresh proactively
            if (timeUntilExpiry > 0 && timeUntilExpiry <= REFRESH_BUFFER_MS) {
                try {
                    const result = await refreshToken();
                    if (result) {
                        setAccessToken(result.accessToken, result.expiresIn);
                    }
                } catch {
                    // Silent — interceptor will handle on next 401
                }
            }
        }

        // Initial check
        checkAndRefresh();

        // Periodic check
        intervalRef.current = setInterval(checkAndRefresh, REFRESH_CHECK_INTERVAL);

        // Tab visibility — refresh when tab becomes visible after being hidden
        function handleVisibility() {
            if (document.visibilityState === 'visible') {
                checkAndRefresh();
            }
        }
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    return <>{children}</>;
}
