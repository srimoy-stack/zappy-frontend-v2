/**
 * Navigation Resolver — Registry-Driven
 *
 * Replaces hardcoded NavItem arrays with registry-resolved navigation.
 * All navigation is now derived from the centralized Module Registry.
 *
 * Layer D: "What should be shown"
 * Combines: Registry (A) + Entitlement (B) + RBAC (C)
 */

import { UserType } from '@/shared/types/auth';
import { resolveVisibleNodes } from '@/shared/entitlements';
import type { ResolvedNavItem } from '@/shared/config/modules/types';
import type { LucideIcon } from 'lucide-react';
import { resolveIcon } from '@/shared/config/modules/iconMap';

// ─── NavItem (Legacy-Compatible Output Shape) ────────────────────────────────

export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
    requiredModule?: string;
    requiredPermission?: string;
    entitlementId?: string;
    children?: NavItem[];
}

// ─── UserType → Base Route Prefix ────────────────────────────────────────────

const USER_TYPE_PREFIX: Record<UserType, string> = {
    [UserType.PLATFORM_SUPER_ADMIN]: '/platform',
    [UserType.BRAND_ADMIN]: '/backoffice',
    [UserType.ADMIN]: '/backoffice',
    [UserType.MANAGER]: '/backoffice',
    [UserType.EMPLOYEE]: '/backoffice',
    [UserType.POS_USER]: '/pos',
    [UserType.KITCHEN_USER]: '/kds',
    [UserType.CALL_CENTER]: '/backoffice',
    [UserType.DELIVERY]: '/backoffice',
};

// ─── Platform Navigation (Super Admin Only) ──────────────────────────────────

import { Building2, Users, Shield, Settings, FileText, LayoutGrid } from 'lucide-react';

const PLATFORM_NAV: NavItem[] = [
    { id: 'platform-brands', label: 'Tenants', href: '/platform/tenants', icon: Building2 },
    { id: 'platform-users', label: 'Users', href: '/platform/users', icon: Users },
    { id: 'platform-roles', label: 'Roles', href: '/platform/roles', icon: Shield },
    { id: 'platform-modules', label: 'Modules', href: '/platform/modules', icon: LayoutGrid },
    { id: 'platform-audit', label: 'Audit Logs', href: '/platform/audit', icon: FileText },
    { id: 'platform-settings', label: 'Settings', href: '/platform/settings', icon: Settings },
];

// ─── Transform Registry → NavItem ────────────────────────────────────────────

function toNavItem(resolved: ResolvedNavItem): NavItem {
    return {
        id: resolved.id,
        label: resolved.label,
        href: resolved.href,
        icon: resolveIcon(resolved.icon),
        entitlementId: resolved.entitlementKey,
        children: resolved.children?.map(toNavItem),
    };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns navigation items for a given user type.
 * Filters by entitlements, RBAC, and permissions.
 *
 * This is the ONLY entry point for all navigation resolution.
 */
export function getNavigationByUserType(
    userType: UserType | null,
    opts?: {
        entitlementPaths?: string[];
        enabledModules?: string[];  // Legacy compat
        permissions?: string[];
        isSuperAdmin?: boolean;
    }
): NavItem[] {
    if (!userType) return [];

    // Platform admin gets static platform nav
    if (userType === UserType.PLATFORM_SUPER_ADMIN && !opts?.isSuperAdmin) {
        return PLATFORM_NAV;
    }

    // Determine route prefix for this user type
    const prefix = USER_TYPE_PREFIX[userType] || '/backoffice';

    // Build entitlement paths from either source
    const paths = opts?.entitlementPaths || opts?.enabledModules || [];

    // Resolve from registry
    const resolved = resolveVisibleNodes(
        userType,
        paths,
        opts?.permissions || [],
        prefix
    );

    return resolved.map(toNavItem);
}

/** @deprecated Use getNavigationByUserType */
export function getNavigationByRole(role: any, opts?: any) {
    return getNavigationByUserType(role as UserType, opts);
}

// Re-export for backward compat
export { PLATFORM_NAV as platformNavigation };
