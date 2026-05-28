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
// --- CONFIGURATION FOR SIDEBAR RESOLUTION & REVERSION ---
// Set to true to revert Brand Admin to entitlements-based resolution (backend allowed modules).
const REVERT_BRAND_ADMIN_TO_ENTITLEMENTS = false;

// Set to true to revert all other roles to the core entitlements/RBAC architecture.
const REVERT_OTHER_ROLES_TO_CORE_ARCHITECTURE = false;
// --------------------------------------------------------

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

    // 1. Core Architecture implementation helper (resolves node via entitlement/RBAC/permission)
    const resolveCoreNode = (node: typeof sidebarNodes[0]): ResolvedNavItem | null => {
        // UserType restriction check
        if (node.allowedUserTypes && !node.allowedUserTypes.includes(userType) && !isSA) {
            return null;
        }

        // Access resolution (entitlement + RBAC)
        const access = resolveAccess(userType, node.entitlementKey, activePaths);
        if (access === 'hidden' || access === 'denied') return null;

        // Permission check
        if (node.requiredPermissions?.length && !isSA) {
            const hasPermission = node.requiredPermissions.some(
                (p) => permissions.includes(p) || permissions.includes('*')
            );
            if (!hasPermission) return null;
        }

        return {
            id: node.id,
            label: node.label,
            href: node.route || '',
            icon: node.icon || 'Package',
            entitlementKey: node.entitlementKey,
            accessLevel: access as 'full' | 'read-only',
        };
    };

    // 2. Bypass/Temporary implementation helper (shows everything with 'full' access)
    const resolveBypassNode = (node: typeof sidebarNodes[0]): ResolvedNavItem => {
        return {
            id: node.id,
            label: node.label,
            href: node.route || '',
            icon: node.icon || 'Package',
            entitlementKey: node.entitlementKey,
            accessLevel: 'full',
        };
    };

    // 3. Resolve nodes based on role and configuration
    const visible: ResolvedNavItem[] = [];

    if (userType === UserType.BRAND_ADMIN) {
        if (REVERT_BRAND_ADMIN_TO_ENTITLEMENTS) {
            // Reverted: Use previous entitlements resolution based on backend allowed modules
            for (const node of sidebarNodes) {
                const resolved = resolveCoreNode(node);
                if (resolved) visible.push(resolved);
            }
        } else {
            // Temporary restriction: Only show the 6 specific modules
            const allowedBrandAdminModules = [
                'home',
                'items',
                'menu-management',
                'users',
                'email-campaigns',
                'ai-call-analytics',
                'settings',
            ];
            for (const node of sidebarNodes) {
                if (allowedBrandAdminModules.includes(node.id)) {
                    visible.push(resolveBypassNode(node));
                }
            }
        }
    } else {
        // Other roles
        if (REVERT_OTHER_ROLES_TO_CORE_ARCHITECTURE) {
            // Reverted to core architecture
            for (const node of sidebarNodes) {
                const resolved = resolveCoreNode(node);
                if (resolved) visible.push(resolved);
            }
        } else {
            // Keep using the temporary bypass (show all modules) for other roles for now
            for (const node of sidebarNodes) {
                visible.push(resolveBypassNode(node));
            }
        }
    }

    return visible;
}
