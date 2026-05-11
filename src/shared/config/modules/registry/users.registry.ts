import type { RegistryNode } from '../types';

export const USERS_REGISTRY: RegistryNode[] = [
    {
        id: 'users', label: 'Users & Access', description: 'Staff management, roles and permissions',
        icon: 'Users', parentId: null, moduleKey: 'users', level: 'module', sortOrder: 6,
        route: '/backoffice/users', routePrefix: '/backoffice', entitlementKey: 'users',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'management',
    },
    // ── Submodules
    { id: 'users.staff', label: 'Staff Users', parentId: 'users', moduleKey: 'users', level: 'submodule', sortOrder: 1, entitlementKey: 'users.staff', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'users.roles', label: 'Roles & Permissions', parentId: 'users', moduleKey: 'users', level: 'submodule', sortOrder: 2, entitlementKey: 'users.roles', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'users.stores', label: 'Store Assignment', parentId: 'users', moduleKey: 'users', level: 'submodule', sortOrder: 3, entitlementKey: 'users.stores', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'users.staff.list', label: 'User List', parentId: 'users.staff', moduleKey: 'users', level: 'page', sortOrder: 1, route: '/backoffice/users', entitlementKey: 'users.staff.list', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'users.staff.create', label: 'Create User', parentId: 'users.staff', moduleKey: 'users', level: 'page', sortOrder: 2, entitlementKey: 'users.staff.create', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'users.roles.management', label: 'Role Management', parentId: 'users.roles', moduleKey: 'users', level: 'page', sortOrder: 1, route: '/backoffice/roles', entitlementKey: 'users.roles.management', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'users.roles.permissions', label: 'Permission Matrix', parentId: 'users.roles', moduleKey: 'users', level: 'page', sortOrder: 2, entitlementKey: 'users.roles.permissions', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'users.stores.assignment', label: 'Store Assignment', parentId: 'users.stores', moduleKey: 'users', level: 'page', sortOrder: 1, entitlementKey: 'users.stores.assignment', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'users.staff.pin', label: 'PIN Management', parentId: 'users.staff', moduleKey: 'users', level: 'page', sortOrder: 3, entitlementKey: 'users.staff.pin', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
