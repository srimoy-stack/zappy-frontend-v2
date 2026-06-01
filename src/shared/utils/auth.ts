/**
 * Auth Utils — Logout + session cleanup.
 */

import { signOut } from 'next-auth/react';
import { clearAccessToken } from './tokenManager';
import { flushAuditLogs, logAction } from './auditLogger';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '@/shared/types/audit';
import { serverLogout } from '@/shared/api/services/auth.service';

/**
 * Full logout — clears everything and redirects.
 *
 * Safe to call from anywhere: hooks, interceptors, components.
 */
export async function logout(opts?: { reason?: string; redirect?: string }): Promise<void> {
    const { reason, redirect = '/login' } = opts ?? {};

    try {
        // 1. Audit log (fire and forget — immediate for critical action)
        logAction({
            action: AUDIT_ACTIONS.LOGOUT,
            entity: AUDIT_ENTITIES.SESSION,
            metadata: { reason },
        });

        // 2. Flush any pending audit logs
        flushAuditLogs();

        // 3. Clear in-memory token
        clearAccessToken();

        // 4. Clear session storage
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('zyappy_tenant_id');
            sessionStorage.removeItem('zyappy_active_store');
            sessionStorage.removeItem('zyappy_onboarding_draft');
            sessionStorage.removeItem('zyappy_impersonation');
        }

        // 5. Tell backend to invalidate refresh token
        await serverLogout();
    } catch {
        // Never block logout
    }

    // 6. Sign out via NextAuth (handles cookie cleanup + redirect)
    await signOut({ callbackUrl: redirect });
}

/**
 * Force logout — called by interceptor on refresh failure.
 */
export function forceLogout(): void {
    clearAccessToken();

    if (typeof window !== 'undefined') {
        const isPOSRoute = window.location.pathname.startsWith('/pos');
        window.location.href = isPOSRoute
            ? '/pos/login?reason=session_expired'
            : '/login?reason=session_expired';
    }
}
