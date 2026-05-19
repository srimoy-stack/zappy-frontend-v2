'use client';

import React, { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
    children: ReactNode;
    /** Single permission or list of permissions (requires ALL by default) */
    permission?: string | string[];
    /** Single module or list of modules (requires ANY by default) */
    module?: string | string[];
    /** If true, requires ANY of the listed permissions instead of ALL */
    anyPermission?: boolean;
    /** UI to show if access is denied */
    fallback?: ReactNode;
}

/**
 * PermissionGate — Declarative UI access control.
 * 
 * Wraps components that require specific permissions or module entitlements.
 */
export function PermissionGate({
    children,
    permission,
    module,
    anyPermission = false,
    fallback = null
}: PermissionGateProps) {
    const { hasPermission, hasAllPermissions, hasAnyPermission, hasModuleAccess, hasAnyModule } = usePermissions() as any;

    let hasAccess = true;

    // Check module entitlement
    if (module) {
        if (Array.isArray(module)) {
            hasAccess = hasAnyModule ? hasAnyModule(module) : module.some(m => hasModuleAccess(m));
        } else {
            hasAccess = hasModuleAccess(module);
        }
    }

    // Check granular permissions
    if (hasAccess && permission) {
        if (Array.isArray(permission)) {
            hasAccess = anyPermission 
                ? hasAnyPermission(permission) 
                : hasAllPermissions(permission);
        } else {
            hasAccess = hasPermission(permission);
        }
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
