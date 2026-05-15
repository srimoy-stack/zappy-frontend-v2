'use client';

import { useMemo } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { UserRole } from '@/types';

// ============================================================================
// PERMISSION MAP
// ============================================================================

/**
 * Roles that have "manage segments" permission (edit, duplicate, toggle status).
 * Derived from the RBAC matrix in the PRD.
 */
const MANAGE_SEGMENTS_ROLES: UserRole[] = [
    'PLATFORM_SUPER_ADMIN',
    'BRAND_ADMIN',
    'ADMIN',
];

/**
 * Roles that can delete segments.
 * Typically only admin-level roles.
 */
const DELETE_SEGMENTS_ROLES: UserRole[] = [
    'PLATFORM_SUPER_ADMIN',
    'BRAND_ADMIN',
    'ADMIN',
];

// ============================================================================
// HOOK
// ============================================================================

export interface SegmentPermissions {
    /** User can edit segment name, rules, and logic */
    canEdit: boolean;
    /** User can duplicate a segment */
    canDuplicate: boolean;
    /** User can toggle segment active/inactive */
    canToggleStatus: boolean;
    /** User can delete a segment */
    canDelete: boolean;
    /** User can create new segments */
    canCreate: boolean;
}

/**
 * Hook to check segment-related RBAC permissions.
 *
 * Usage:
 * ```tsx
 * const { canEdit, canDelete } = useSegmentPermissions();
 * ```
 */
export function useSegmentPermissions(): SegmentPermissions {
    const { role } = useAuth();

    return useMemo(() => {
        const canManage = role !== null && MANAGE_SEGMENTS_ROLES.includes(role);
        const canRemove = role !== null && DELETE_SEGMENTS_ROLES.includes(role);

        return {
            canEdit: canManage,
            canDuplicate: canManage,
            canToggleStatus: canManage,
            canDelete: canRemove,
            canCreate: canManage,
        };
    }, [role]);
}
