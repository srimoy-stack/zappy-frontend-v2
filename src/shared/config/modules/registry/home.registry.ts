import type { RegistryNode } from '../types';

/**
 * Home / Dashboard Module Registry
 *
 * The dashboard is a CORE module — it is always visible to all backoffice
 * users regardless of which modules are enabled for their tenant.
 * This ensures brand admins always have at least one accessible page.
 */
export const HOME_REGISTRY: RegistryNode[] = [
    {
        id: 'home',
        label: 'Home',
        description: 'Brand dashboard with key metrics and activity overview',
        icon: 'Home',
        parentId: null,
        moduleKey: 'home',
        level: 'module',
        sortOrder: 1,
        route: '/backoffice/home',
        routePrefix: '/backoffice',
        entitlementKey: 'home',
        isCore: true,       // ← ALWAYS visible, cannot be disabled
        isSystem: false,
        isBeta: false,
        isProtected: true,   // ← Never disabled by entitlement checks
        status: 'active',
        showInSidebar: true,
        sidebarGroup: 'operations',
    },
];
