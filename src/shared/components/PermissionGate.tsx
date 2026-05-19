'use client';

/**
 * PermissionGate — Declarative permission-based UI gating.
 *
 * Renders children only if the user has the required permission(s).
 * Optional fallback for unauthorized state.
 *
 * Usage:
 *   <PermissionGate permission="users.create">
 *     <button>Add User</button>
 *   </PermissionGate>
 *
 *   <PermissionGate permissions={["items.edit", "items.delete"]} mode="any">
 *     <button>Manage Items</button>
 *   </PermissionGate>
 */

import React, { ReactNode } from 'react';
import { usePermissions } from '@/shared/hooks/usePermissions';

interface PermissionGateProps {
    /** Single permission check */
    permission?: string;
    /** Multiple permissions check */
    permissions?: string[];
    /** 'all' = must have all, 'any' = must have at least one */
    mode?: 'all' | 'any';
    /** Module entitlement check */
    module?: string;
    /** Fallback UI when unauthorized */
    fallback?: ReactNode;
    children: ReactNode;
}

export function PermissionGate({
    permission,
    permissions,
    mode = 'all',
    module,
    fallback = null,
    children,
}: PermissionGateProps) {
    const { hasPermission, hasAllPermissions, hasAnyPermission, hasModuleAccess } = usePermissions();

    // Module gate
    if (module && !hasModuleAccess(module)) {
        return <>{fallback}</>;
    }

    let authorized = false;

    if (permission) {
        authorized = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        authorized = mode === 'all'
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    } else {
        // No permission specified — always render
        authorized = true;
    }

    return authorized ? <>{children}</> : <>{fallback}</>;
}
