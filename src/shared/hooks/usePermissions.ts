'use client';

/**
 * usePermissions — Centralized permission checking.
 *
 * Reads permissions from AuthContext.
 * Supports wildcard (*) permissions for super admins.
 */

import { useAuth } from '@/shared/contexts/AuthContext';
import { useModules } from '@/shared/contexts/ModuleContext';

export function usePermissions() {
    const { permissions, isSuperAdmin, isSystemRole } = useAuth();
    const { isModuleEnabled } = useModules();

    const hasWildcard = isSuperAdmin || isSystemRole || permissions.includes('*');

    /** Check single permission */
    function hasPermission(permission: string): boolean {
        if (hasWildcard) return true;
        return permissions.includes(permission);
    }

    /** Check if user has ANY of the listed permissions */
    function hasAnyPermission(perms: string[]): boolean {
        if (hasWildcard) return true;
        return perms.some((p) => permissions.includes(p));
    }

    /** Check if user has ALL of the listed permissions */
    function hasAllPermissions(perms: string[]): boolean {
        if (hasWildcard) return true;
        return perms.every((p) => permissions.includes(p));
    }

    /** Check module entitlement */
    function hasModuleAccess(moduleId: string): boolean {
        if (isSuperAdmin) return true;
        return isModuleEnabled(moduleId);
    }

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasModuleAccess,
        isSuperAdmin,
    };
}
