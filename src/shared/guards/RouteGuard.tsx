'use client';

/**
 * RouteGuard — Entitlement-Aware Route Protection
 *
 * Layer E: "Runtime protection"
 *
 * Enforces TWO levels of access control:
 * 1. Prefix check — UserType → allowed route prefixes
 * 2. Entitlement check — Is the module/page entitled for this tenant?
 *
 * Uses the CANONICAL role system from shared/types/auth.ts.
 */

import React, { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useEntitlements } from '@/shared/entitlements';
import { findNodeByRoute, isProtectedPath } from '@/shared/config/modules';
import {
    UserType,
    getDefaultPage,
    canAccessPrefix,
} from '@/shared/types/auth';

interface RouteGuardProps {
    children: ReactNode;
    /** The route prefix this guard protects (e.g. '/platform', '/backoffice') */
    allowedPrefix: string;
    /** Additional user types allowed beyond the prefix default */
    additionalUserTypes?: UserType[];
}

export function RouteGuard({ children, allowedPrefix, additionalUserTypes = [] }: RouteGuardProps) {
    const { isAuthenticated, isLoading, userType, isSuperAdmin } = useAuth();
    const { isEntitled } = useEntitlements();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        // Not authenticated → login
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        if (!userType) return;

        // ── Level 1: Prefix check ────────────────────────────────────────
        const isAllowed =
            canAccessPrefix(userType, allowedPrefix) ||
            additionalUserTypes.includes(userType);

        if (!isAllowed) {
            const correctPage = getDefaultPage(userType);
            console.warn(`[RouteGuard] ${userType} blocked from ${pathname}. Redirecting to ${correctPage}`);
            router.replace(correctPage);
            return;
        }

        // ── Level 2: Entitlement check ───────────────────────────────────
        // Super admins bypass entitlement checks
        if (isSuperAdmin) return;

        // Find the registry node for this route
        const node = findNodeByRoute(pathname || '');
        if (!node) return; // Unknown routes pass through (handled by 404)

        // Protected paths always pass (settings, audit, etc.)
        if (isProtectedPath(node.entitlementKey)) return;

        // Check entitlement
        if (!isEntitled(node.entitlementKey)) {
            const correctPage = getDefaultPage(userType);
            console.warn(
                `[RouteGuard] Module "${node.entitlementKey}" not entitled for tenant. ` +
                `Redirecting ${userType} from ${pathname} to ${correctPage}`
            );
            router.replace(correctPage);
        }
    }, [isLoading, isAuthenticated, userType, isSuperAdmin, pathname, allowedPrefix, additionalUserTypes, router, isEntitled]);

    // Loading state
    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        );
    }

    return <>{children}</>;
}
