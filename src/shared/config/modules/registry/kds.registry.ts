import type { RegistryNode } from '../types';
import { UserType } from '@/shared/types/auth';

/**
 * KDS Registry — Operationally Isolated
 *
 * KDS uses routePrefix '/kds' and is separated from backoffice RBAC.
 * KITCHEN_USER type has exclusive access. Admin/Manager can view for config.
 */
export const KDS_REGISTRY: RegistryNode[] = [
    {
        id: 'kds', label: 'Kitchen Display', description: 'Kitchen display system for order management',
        icon: 'Monitor', parentId: null, moduleKey: 'kds', level: 'module', sortOrder: 9,
        route: '/kds/master', routePrefix: '/kds', entitlementKey: 'kds',
        allowedUserTypes: [UserType.KITCHEN_USER, UserType.BRAND_ADMIN, UserType.ADMIN, UserType.MANAGER],
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'operations',
    },
    // ── Submodules
    { id: 'kds.master', label: 'KDS Master', parentId: 'kds', moduleKey: 'kds', level: 'submodule', sortOrder: 1, entitlementKey: 'kds.master', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, route: '/kds/master', routePrefix: '/kds', icon: 'Monitor' },
    { id: 'kds.expo', label: 'KDS Expo', parentId: 'kds', moduleKey: 'kds', level: 'submodule', sortOrder: 2, entitlementKey: 'kds.expo', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, route: '/kds/expo', routePrefix: '/kds', icon: 'Tv' },
    { id: 'kds.stations', label: 'Station Management', parentId: 'kds', moduleKey: 'kds', level: 'submodule', sortOrder: 3, entitlementKey: 'kds.stations', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'kds.master.screen', label: 'Kitchen Screen', parentId: 'kds.master', moduleKey: 'kds', level: 'page', sortOrder: 1, route: '/kds/master', entitlementKey: 'kds.master.screen', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'kds.expo.screen', label: 'Expo Screen', parentId: 'kds.expo', moduleKey: 'kds', level: 'page', sortOrder: 1, route: '/kds/expo', entitlementKey: 'kds.expo.screen', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'kds.stations.config', label: 'Station Config', parentId: 'kds.stations', moduleKey: 'kds', level: 'page', sortOrder: 1, entitlementKey: 'kds.stations.config', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'kds.stations.sound', label: 'Sound Config', parentId: 'kds.stations', moduleKey: 'kds', level: 'page', sortOrder: 2, entitlementKey: 'kds.stations.sound', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'kds.master.delay', label: 'Delay Orders', parentId: 'kds.master', moduleKey: 'kds', level: 'page', sortOrder: 2, entitlementKey: 'kds.master.delay', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'kds.master.refire', label: 'Recall/Re-fire', parentId: 'kds.master', moduleKey: 'kds', level: 'page', sortOrder: 3, entitlementKey: 'kds.master.refire', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'kds.expo.messaging', label: 'Customer Messaging', parentId: 'kds.expo', moduleKey: 'kds', level: 'page', sortOrder: 2, entitlementKey: 'kds.expo.messaging', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
