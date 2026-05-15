import { useAuth } from '@/app/providers/AuthProvider';
import { navigationConfig, MenuConfig, AccessMode } from '@/config/navigation';
import { useImpersonation } from '@/app/providers/ImpersonationProvider';
import { usePathname } from 'next/navigation';


/**
 * useRouteAccess Hook
 * Centralized, declarative role-based UI protection.
 * Drives visibility and behavior based on the production-grade session.
 */
export const useRouteAccess = () => {
    const { role, storeIds, user, enabledModules } = useAuth();
    const { isImpersonating } = useImpersonation();
    const pathname = usePathname();

    /**
     * Gets visible menu items for the current role and active modules
     */
    const getVisibleMenuItems = (): MenuConfig[] => {
        if (!role) return [];

        const isSuperAdmin = role === 'PLATFORM_SUPER_ADMIN';

        // Filter items based on role and module
        const filteredItems = navigationConfig.filter(item => {
            // Role check
            const roleAllowed = isSuperAdmin || (item.allowedRoles.includes(role) && item.accessMode[role] !== 'hidden');
            if (!roleAllowed) return false;

            // Module check
            if (item.requiredModule && !enabledModules.includes(item.requiredModule)) {
                return false;
            }

            return true;
        });

        // SPECIAL CASE: Super Admin Contextual Navigation
        if (isSuperAdmin) {
            const isPlatform = pathname?.startsWith('/platform');
            const isBackofficeOrKDS = pathname?.startsWith('/backoffice') || pathname?.startsWith('/kds');

            if (isPlatform) {
                // In Platform view, ONLY show Brands
                const allowedPlatformIds = ['platform-brands'];
                return filteredItems.filter(item => allowedPlatformIds.includes(item.id));
            }

            if (isBackofficeOrKDS || isImpersonating) {
                // In Backoffice view, ONLY show requested setup items
                const allowedBackofficeIds = ['items', 'integrations', 'kds-master', 'kds-expo'];
                return filteredItems.filter(item => allowedBackofficeIds.includes(item.id));
            }
        }

        return filteredItems;
    };

    /**
     * Checks if a path is authorized
     */
    const isAuthorized = (path: string): boolean => {
        if (!role) return false;

        // Platform routes → only PLATFORM_SUPER_ADMIN
        if (path.startsWith('/platform')) {
            return role === 'PLATFORM_SUPER_ADMIN';
        }

        // Global pass-through for Super Admin to all backoffice routes
        if (role === 'PLATFORM_SUPER_ADMIN') return true;

        // If it's a direct backoffice subpath, check config
        const item = navigationConfig.find(m => m.route === path);
        if (!item) {
            // Check for index or parent paths
            if (path === '/backoffice' || path === '/backoffice/') return true;
            return true;
        }

        // Role check
        if (!item.allowedRoles.includes(role)) return false;

        // Module check
        if (item.requiredModule && !enabledModules.includes(item.requiredModule)) return false;

        return true;
    };

    /**
     * Gets access mode for a specific page
     */
    const getAccessMode = (path: string): AccessMode => {
        if (!role) return 'hidden';
        const item = navigationConfig.find(m => m.route === path);
        if (!item) return 'full';

        // Module check for access mode
        if (item.requiredModule && !enabledModules.includes(item.requiredModule)) {
            return 'hidden';
        }

        if (role === 'PLATFORM_SUPER_ADMIN') return 'full';
        return item.accessMode[role] || 'hidden';
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
