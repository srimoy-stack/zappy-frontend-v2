'use client';

import React, { ReactNode } from 'react';
import { useKDSAccessStore } from '../../store/kdsAccessStore';

interface KDSPermissionGuardProps {
    permission: string;
    children: ReactNode;
}

/**
 * KDSPermissionGuard Component
 * 
 * Reusable wrapper to conditionally render UI elements based on KDS permissions.
 * If the user does not have the specified permission, it returns null.
 */
export const KDSPermissionGuard: React.FC<KDSPermissionGuardProps> = ({ permission, children }) => {
    const hasPermission = useKDSAccessStore(state => state.hasPermission(permission));

    if (!hasPermission) {
        return null;
    }

    return <>{children}</>;
};
