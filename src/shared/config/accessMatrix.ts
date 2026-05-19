import { UserType } from '../types/auth';

/**
 * Access levels for UI components and routes.
 */
export type AccessLevel = 'full' | 'read-only' | 'denied' | 'hidden';

/**
 * Enterprise Access Matrix
 * 
 * Codifies Section 2.1 of the 'Zyappy — Roles, Access & Permissions' document.
 * Maps UserType → Module ID → AccessLevel.
 */
export const ENTERPRISE_ACCESS_MATRIX: Record<UserType, Record<string, AccessLevel>> = {
    [UserType.PLATFORM_SUPER_ADMIN]: {
        '*': 'full',
    },
    [UserType.BRAND_ADMIN]: {
        'home': 'full',
        'sales-activity': 'full',
        'reports': 'full',
        'finances': 'full',
        'items': 'full',
        'users': 'full',
        'customers': 'full',
        'email-campaigns': 'full',
        'call-analytics': 'full',
        'inventory': 'full',
        'web-shop': 'full',
        'integrations': 'full',
        'business-settings': 'full',
    },
    [UserType.ADMIN]: {
        'home': 'full',
        'sales-activity': 'full',
        'reports': 'full',
        'finances': 'full',
        'items': 'full',
        'users': 'full',
        'customers': 'full',
        'email-campaigns': 'full',
        'call-analytics': 'full',
        'inventory': 'full',
        'web-shop': 'full',
        'integrations': 'full',
        'business-settings': 'full',
    },
    [UserType.MANAGER]: {
        'home': 'full',
        'sales-activity': 'full',
        'reports': 'read-only',
        'finances': 'full',
        'items': 'full',
        'users': 'full',
        'customers': 'full',
        'inventory': 'full',
        'web-shop': 'full',
        'integrations': 'full',
        'business-settings': 'full',
        'email-campaigns': 'hidden',
        'call-analytics': 'hidden',
    },
    [UserType.EMPLOYEE]: {
        'home': 'full',
        'sales-activity': 'full',
        'reports': 'read-only',
        'finances': 'read-only',
        'items': 'full',
        'customers': 'full',
        'inventory': 'full',
        'web-shop': 'read-only',
        'users': 'hidden',
        'integrations': 'hidden',
        'business-settings': 'hidden',
        'email-campaigns': 'hidden',
        'call-analytics': 'hidden',
    },
    [UserType.POS_USER]: {
        '*': 'hidden',
        'pos': 'full',
    },
    [UserType.KITCHEN_USER]: {
        '*': 'hidden',
        'kds': 'full',
    },
    [UserType.CALL_CENTER]: {
        '*': 'hidden',
        'orders': 'full',
        'customers': 'full',
        'items': 'read-only',
    },
    [UserType.DELIVERY]: {
        '*': 'hidden',
        'orders': 'read-only',
    },
};

/**
 * Resolves the access level for a specific user type and module.
 */
export function getAccessLevel(userType: UserType, moduleId: string): AccessLevel {
    const userMatrix = ENTERPRISE_ACCESS_MATRIX[userType];
    if (!userMatrix) return 'hidden';

    // Global wildcard for Super Admin
    if (userMatrix['*']) return userMatrix['*'];

    return userMatrix[moduleId] ?? userMatrix['*'] ?? 'hidden';
}
