/**
 * Route Context Rules — Defines which context headers are required per route prefix.
 */

export interface RouteContextRule {
    prefix: string;
    requiresTenant: boolean;
    requiresStore: boolean;
}

export const ROUTE_CONTEXT_RULES: RouteContextRule[] = [
    { prefix: '/platform', requiresTenant: false, requiresStore: false },
    { prefix: '/backoffice', requiresTenant: true, requiresStore: false },
    { prefix: '/pos', requiresTenant: true, requiresStore: true },
    { prefix: '/kds', requiresTenant: true, requiresStore: true },
    { prefix: '/api', requiresTenant: false, requiresStore: false },
    { prefix: '/login', requiresTenant: false, requiresStore: false },
];

/**
 * Returns the context rule matching the current pathname.
 */
export function getRouteContextRule(pathname: string): RouteContextRule {
    const match = ROUTE_CONTEXT_RULES.find((r) => pathname.startsWith(r.prefix));
    // Default: require tenant, don't require store
    return match ?? { prefix: '/', requiresTenant: true, requiresStore: false };
}

/**
 * Validates that the required context is available for a given route.
 */
export function validateRouteContext(
    pathname: string,
    tenantId: string | null,
    storeId: string | null
): { valid: boolean; missingTenant: boolean; missingStore: boolean } {
    const rule = getRouteContextRule(pathname);
    const missingTenant = rule.requiresTenant && !tenantId;
    const missingStore = rule.requiresStore && !storeId;
    return {
        valid: !missingTenant && !missingStore,
        missingTenant,
        missingStore,
    };
}
