import type { RegistryNode } from '../types';

/**
 * Settings — System Module
 *
 * isSystem: true — hidden from onboarding module selection.
 * Some submodules are isProtected (brand settings, audit) — always available.
 */
export const SETTINGS_REGISTRY: RegistryNode[] = [
    {
        id: 'settings', label: 'Settings', description: 'Business, store and integration configuration',
        icon: 'Settings', parentId: null, moduleKey: 'settings', level: 'module', sortOrder: 13,
        route: '/backoffice/settings', routePrefix: '/backoffice', entitlementKey: 'settings',
        isCore: false, isSystem: true, isBeta: false, isProtected: true,
        status: 'active', showInSidebar: true, sidebarGroup: 'system',
    },
    // ── Submodules
    { id: 'settings.business', label: 'Business Settings', parentId: 'settings', moduleKey: 'settings', level: 'submodule', sortOrder: 1, route: '/backoffice/settings', icon: 'Building2', entitlementKey: 'settings.business', isCore: false, isSystem: true, isBeta: false, isProtected: true, status: 'active', showInSidebar: false },
    { id: 'settings.stores', label: 'Store Management', parentId: 'settings', moduleKey: 'settings', level: 'submodule', sortOrder: 2, route: '/backoffice/settings/stores', icon: 'Store', entitlementKey: 'settings.stores', isCore: false, isSystem: true, isBeta: false, isProtected: true, status: 'active', showInSidebar: false },
    { id: 'settings.integrations', label: 'Integrations', parentId: 'settings', moduleKey: 'settings', level: 'submodule', sortOrder: 3, entitlementKey: 'settings.integrations', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'settings.communication', label: 'Communication Config', parentId: 'settings', moduleKey: 'settings', level: 'submodule', sortOrder: 4, entitlementKey: 'settings.communication', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'settings.business.brand', label: 'Brand Settings', parentId: 'settings.business', moduleKey: 'settings', level: 'page', sortOrder: 1, route: '/backoffice/settings', entitlementKey: 'settings.business.brand', isCore: false, isSystem: true, isBeta: false, isProtected: true, status: 'active', showInSidebar: false },
    { id: 'settings.stores.manage', label: 'Store Settings', parentId: 'settings.stores', moduleKey: 'settings', level: 'page', sortOrder: 1, entitlementKey: 'settings.stores.manage', isCore: false, isSystem: true, isBeta: false, isProtected: true, status: 'active', showInSidebar: false },
    { id: 'settings.business.tax', label: 'Tax Settings', parentId: 'settings.business', moduleKey: 'settings', level: 'page', sortOrder: 2, entitlementKey: 'settings.business.tax', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'settings.business.payment', label: 'Payment Settings', parentId: 'settings.business', moduleKey: 'settings', level: 'page', sortOrder: 3, entitlementKey: 'settings.business.payment', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'settings.communication.email', label: 'Email Provider Config', parentId: 'settings.communication', moduleKey: 'settings', level: 'page', sortOrder: 1, entitlementKey: 'settings.communication.email', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'settings.communication.sms', label: 'SMS Provider Config', parentId: 'settings.communication', moduleKey: 'settings', level: 'page', sortOrder: 2, entitlementKey: 'settings.communication.sms', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'settings.integrations.manage', label: 'Integration Settings', parentId: 'settings.integrations', moduleKey: 'settings', level: 'page', sortOrder: 1, entitlementKey: 'settings.integrations.manage', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'settings.business.audit', label: 'Audit Logs', parentId: 'settings.business', moduleKey: 'settings', level: 'page', sortOrder: 4, entitlementKey: 'settings.business.audit', isCore: false, isSystem: true, isBeta: false, isProtected: true, status: 'active', showInSidebar: false },
];
