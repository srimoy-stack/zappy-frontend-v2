'use client';

/**
 * useRouteAccess — CANONICAL route access hook.
 *
 * Provides role-based route access, navigation visibility,
 * and access mode resolution.
 *
 * ALL modules MUST import from this file.
 * The legacy hook at src/hooks/useRouteAccess.ts is superseded by this.
 *
 * Uses the CANONICAL role system from shared/types/auth.ts.
 */

import { useAuth } from '@/shared/contexts/AuthContext';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useModuleAccess } from '@/shared/hooks/useModuleAccess';
import { useImpersonation } from '@/app/providers/ImpersonationProvider';
import { usePathname } from 'next/navigation';
import {
    UserType,
    getBaseRoute,
    getDefaultPage,
    canAccessPrefix,
    isSuperAdmin,
    MANAGEMENT_TYPES,
} from '@/shared/types/auth';
import { getNavigationByUserType, type NavItem } from '@/shared/config/navigation';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AccessMode = 'full' | 'read-only' | 'hidden';

interface RouteAccessResult {
    canAccess: boolean;
    reason: 'allowed' | 'no_role' | 'wrong_prefix' | 'missing_permission' | 'missing_module';
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useRouteAccess() {
    const { userType, isSuperAdmin, user, storeIds, enabledModules, permissions } = useAuth();
    const { hasPermission, hasModuleAccess } = usePermissions();
    const { isImpersonating } = useImpersonation();
    const pathname = usePathname();

    // ── Navigation visibility ───────────────────────────────────────────

    /**
     * Returns visible navigation items for the current user's userType,
     * filtered by enabled modules and permissions.
     */
    function getVisibleMenuItems(): NavItem[] {
        if (!userType) return [];

        return getNavigationByUserType(userType, {
            enabledModules,
            permissions,
            isSuperAdmin,
        });
    }

    // ── Route authorization ─────────────────────────────────────────────

    /**
     * Checks if the current user is authorized for a given path.
     */
    function isAuthorized(path: string): boolean {
        if (!userType) return false;
        if (isSuperAdmin) return true;
        return canAccessPrefix(userType, path);
    }

    /**
     * Advanced route access check with permission and module validation.
     */
    function canAccessRoute(opts?: {
        requiredPermission?: string;
        requiredModule?: string;
        allowedPrefix?: string;
    }): RouteAccessResult {
        if (!userType) return { canAccess: false, reason: 'no_role' };

        // Prefix check
        if (opts?.allowedPrefix) {
            const prefixOk = canAccessPrefix(userType, opts.allowedPrefix) || isSuperAdmin;
            if (!prefixOk) return { canAccess: false, reason: 'wrong_prefix' };
        }

        // Permission check
        if (opts?.requiredPermission && !hasPermission(opts.requiredPermission)) {
            return { canAccess: false, reason: 'missing_permission' };
        }

        // Module check
        if (opts?.requiredModule && !hasModuleAccess(opts.requiredModule)) {
            return { canAccess: false, reason: 'missing_module' };
        }

        return { canAccess: true, reason: 'allowed' };
    }

    // ── Access mode ─────────────────────────────────────────────────────

    /**
     * Returns the access mode for a specific path.
     * Super admins always get 'full'. Operational roles get 'read-only' on management pages.
     */
    function getAccessMode(_path: string): AccessMode {
        if (!userType) return 'hidden';
        if (isSuperAdmin) return 'full';
        if (MANAGEMENT_TYPES.includes(userType)) return 'full';
        return 'read-only';
    }

    // ── Store management ────────────────────────────────────────────────

    /**
     * Checks if the current user can switch/manage stores.
     */
    function canManageStores(): boolean {
        if (!userType) return false;
        if (isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN) return true;
        if (userType === UserType.MANAGER && storeIds.length > 1) return true;
        return false;
    }

    /**
     * Returns store IDs the user can manage, or 'all' for admins.
     */
    function getManagedStoreIds(): string[] | 'all' {
        if (!userType) return [];
        if (isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN) return 'all';
        return storeIds;
    }

    return {
        // User context
        user,
        userType,
        isSuperAdmin,
        isImpersonating,
        pathname,
        
        // Legacy support
        role: userType, 
        rawRole: userType,

        // Navigation
        getVisibleMenuItems,

        // Route access
        isAuthorized,
        canAccessRoute,
        getAccessMode,

        // Store management
        canManageStores,
        getManagedStoreIds,

        // Permission/module shortcuts
        hasPermission,
        hasModuleAccess,
    };
}

// Legacy alias — the old hook was exported as `useRouteAccessShared`
export { useRouteAccess as useRouteAccessShared };
