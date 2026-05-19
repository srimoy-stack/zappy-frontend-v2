import { useAuth } from '@/shared/contexts/AuthContext';
import { useEntitlements } from '@/shared/entitlements';
import { findNodeByRoute, isProtectedPath } from '@/shared/config/modules';
import { getNavigationByUserType, type NavItem } from '@/shared/config/navigation';
import { useImpersonation } from '@/app/providers/ImpersonationProvider';
import { usePathname } from 'next/navigation';
import type { AccessLevel } from '@/shared/config/accessMatrix';


/**
 * useRouteAccess Hook — Registry-Driven
 *
 * Centralized, declarative UI protection.
 * Now uses the Module Registry + EntitlementContext instead of hardcoded arrays.
 */
export const useRouteAccess = () => {
    const { role, storeIds, user, userType, permissions, isSuperAdmin: isSA } = useAuth();
    const { isEntitled, entitlementPaths, getAccessLevel } = useEntitlements();
    const { isImpersonating } = useImpersonation();
    const pathname = usePathname();

    /**
     * Gets visible menu items for the current user.
     * Items are pre-filtered by entitlement + RBAC via the registry resolver.
     */
    const getVisibleMenuItems = (): NavItem[] => {
        if (!userType) return [];

        // Super Admin contextual navigation
        if (isSA) {
            const isPlatform = pathname?.startsWith('/platform');
            const isBackofficeOrKDS = pathname?.startsWith('/backoffice') || pathname?.startsWith('/kds');

            if (isPlatform) {
                return getNavigationByUserType(userType, { entitlementPaths, permissions });
            }

            if (isBackofficeOrKDS || isImpersonating) {
                return getNavigationByUserType(userType, {
                    entitlementPaths,
                    permissions,
                    isSuperAdmin: true,
                });
            }
        }

        return getNavigationByUserType(userType, {
            entitlementPaths,
            permissions,
        });
    };

    /**
     * Checks if a path is authorized for the current user.
     */
    const isAuthorized = (path: string): boolean => {
        if (!userType) return false;

        // Platform routes → only Super Admin
        if (path.startsWith('/platform')) {
            return isSA;
        }

        // Super Admin has full access
        if (isSA) return true;

        // Find the registry node for this route
        const node = findNodeByRoute(path);
        if (!node) return true; // Unknown routes pass through

        // Protected paths always authorized
        if (isProtectedPath(node.entitlementKey)) return true;

        // Check entitlement
        return isEntitled(node.entitlementKey);
    };

    /**
     * Gets access mode for a specific page.
     */
    const getAccessMode = (path: string): AccessLevel => {
        if (!userType) return 'hidden';

        const node = findNodeByRoute(path);
        if (!node) return 'full';

        // Protected paths always full access
        if (isProtectedPath(node.entitlementKey)) return 'full';

        if (isSA) return 'full';

        return getAccessLevel(node.entitlementKey);
    };

    /**
     * Checks if current user can switch stores
     */
    const canManageStores = (): boolean => {
        if (role === 'ADMIN' || role === 'BRAND_ADMIN') return true;
        if (role === 'STORE_MANAGER' && storeIds.length > 1) return true;
        return false;
    };

    /**
     * Checks if user is restricted to specific stores
     */
    const getManagedStoreIds = (): string[] | 'all' => {
        if (role === 'ADMIN' || role === 'BRAND_ADMIN') return 'all';
        return storeIds;
    };

    return {
        user,
        role,
        isImpersonating,
        pathname,
        getVisibleMenuItems,
        isAuthorized,
        getAccessMode,
        canManageStores,
        getManagedStoreIds,
    };
};
