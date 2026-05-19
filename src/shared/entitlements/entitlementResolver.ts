/**
 * Entitlement Resolver — Pure Functions
 *
 * NO React dependency. NO context. Pure logic.
 * Testable, server-safe, and used by contexts, guards, and middleware.
 *
 * Layer B in the architecture: "What the tenant purchased/enabled"
 * Combined with Layer C (RBAC) to produce final access decisions.
 */

import { UserType, isSuperAdmin } from '@/shared/types/auth';
import { getAccessLevel, type AccessLevel } from '@/shared/config/accessMatrix';
import {
    getNode,
    getDescendants,
    getModuleNodes,
    getCoreModuleIds,
    isProtectedPath,
    getSidebarNodes,
} from '@/shared/config/modules';
import type { RegistryNode, ResolvedNavItem } from '@/shared/config/modules/types';
import { resolveIcon } from '@/shared/config/modules/iconMap';

// ─── Entitlement Checks ──────────────────────────────────────────────────────

/**
 * Check if a specific entitlement path is active.
 * A path is considered active if:
 * 1. It exists directly in activePaths, OR
 * 2. Its root module exists in activePaths (module-level grant), OR
 * 3. It is a core module path (always active), OR
 * 4. It is a protected path (never disabled)
 */
export function isEntitled(path: string, activePaths: string[]): boolean {
    // Protected paths are always entitled
    if (isProtectedPath(path)) return true;

    // Core modules are always entitled
    const rootModule = path.split('.')[0] || '';
    if (getCoreModuleIds().includes(rootModule)) return true;

    // Direct match
    if (activePaths.includes(path)) return true;

    // Module-level grant (if 'items' is in paths, 'items.catalog.list' is entitled)
    if (activePaths.includes(rootModule)) return true;

    return false;
}

/**
 * Check if any descendant of a path is active.
 * Used for partial-check state in tree selector UI.
 */
export function hasActiveDescendant(path: string, activePaths: string[]): boolean {
    const descendants = getDescendants(path);
    return descendants.some((d) => activePaths.includes(d));
}

/**
 * Get all descendant paths that would be activated by enabling a parent.
 */
export function getDescendantPaths(path: string): string[] {
    return getDescendants(path);
}

/**
 * Derive root module IDs from a list of entitlement paths.
 * Used for backward compatibility with enabledModules[] flat lists.
 */
export function deriveEnabledModules(activePaths: string[]): string[] {
    const moduleIds = new Set<string>();
    // Always include core modules
    for (const id of getCoreModuleIds()) {
        moduleIds.add(id);
    }
    // Extract root modules from paths
    for (const path of activePaths) {
        const root = path.split('.')[0];
        if (root) moduleIds.add(root);
    }
    return Array.from(moduleIds);
}

// ─── Combined Access Resolution ──────────────────────────────────────────────

/**
 * Resolve the final access level for a user + entitlement combination.
 *
 * Layer 1: Entitlement check (tenant-level) — is this feature purchased?
 * Layer 2: RBAC check (user-level) — can this user type access it?
 *
 * Both layers must pass. Entitlement gates visibility, RBAC gates access mode.
 */
export function resolveAccess(
    userType: UserType,
    entitlementKey: string,
    activePaths: string[],
): AccessLevel {
    // Super admins bypass all checks
    if (isSuperAdmin(userType)) return 'full';

    // Layer 1: Entitlement
    if (!isEntitled(entitlementKey, activePaths)) return 'hidden';

    // Layer 2: RBAC
    const rootModule = entitlementKey.split('.')[0] || '';
    return getAccessLevel(userType, rootModule);
}

// ─── Navigation Resolution ───────────────────────────────────────────────────

/**
 * Resolve visible navigation items for a given user + tenant context.
 * Combines entitlement filtering with RBAC access levels.
 * Returns pre-sorted, sidebar-ready items.
 */
export function resolveVisibleNodes(
    userType: UserType | null,
    activePaths: string[],
    permissions: string[],
    routePrefix: string
): ResolvedNavItem[] {
    if (!userType) return [];

    const isSA = isSuperAdmin(userType);
    const sidebarNodes = getSidebarNodes(routePrefix);

    const visible: ResolvedNavItem[] = [];

    for (const node of sidebarNodes) {
        // UserType restriction check
        if (node.allowedUserTypes && !node.allowedUserTypes.includes(userType) && !isSA) {
            continue;
        }

        // Access resolution (entitlement + RBAC)
        const access = resolveAccess(userType, node.entitlementKey, activePaths);
        if (access === 'hidden' || access === 'denied') continue;

        // Permission check
        if (node.requiredPermissions?.length && !isSA) {
            const hasPermission = node.requiredPermissions.some(
                (p) => permissions.includes(p) || permissions.includes('*')
            );
            if (!hasPermission) continue;
        }

        visible.push({
            id: node.id,
            label: node.label,
            href: node.route || '',
            icon: node.icon || 'Package',
            entitlementKey: node.entitlementKey,
            accessLevel: access as 'full' | 'read-only',
        });
    }

    return visible;
}
