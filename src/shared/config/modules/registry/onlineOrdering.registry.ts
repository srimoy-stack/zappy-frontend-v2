import type { RegistryNode } from '../types';

export const ONLINE_ORDERING_REGISTRY: RegistryNode[] = [
    {
        id: 'online-ordering', label: 'Online Ordering', description: 'Web shop, delivery and collection channels',
        icon: 'Globe', parentId: null, moduleKey: 'online-ordering', level: 'module', sortOrder: 8,
        route: '/backoffice/shop', routePrefix: '/backoffice', entitlementKey: 'online-ordering',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'channels',
    },
    // ── Submodules
    { id: 'online-ordering.webshop', label: 'Web Shop', parentId: 'online-ordering', moduleKey: 'online-ordering', level: 'submodule', sortOrder: 1, entitlementKey: 'online-ordering.webshop', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'online-ordering.delivery', label: 'Delivery', parentId: 'online-ordering', moduleKey: 'online-ordering', level: 'submodule', sortOrder: 2, entitlementKey: 'online-ordering.delivery', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'online-ordering.collection', label: 'Collection', parentId: 'online-ordering', moduleKey: 'online-ordering', level: 'submodule', sortOrder: 3, entitlementKey: 'online-ordering.collection', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'online-ordering.channels', label: 'Channel Management', parentId: 'online-ordering', moduleKey: 'online-ordering', level: 'submodule', sortOrder: 4, entitlementKey: 'online-ordering.channels', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'online-ordering.webshop.settings', label: 'Web Shop Settings', parentId: 'online-ordering.webshop', moduleKey: 'online-ordering', level: 'page', sortOrder: 1, route: '/backoffice/shop', entitlementKey: 'online-ordering.webshop.settings', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'online-ordering.delivery.zones', label: 'Delivery Zones', parentId: 'online-ordering.delivery', moduleKey: 'online-ordering', level: 'page', sortOrder: 1, entitlementKey: 'online-ordering.delivery.zones', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'online-ordering.channels.orders', label: 'Online Orders', parentId: 'online-ordering.channels', moduleKey: 'online-ordering', level: 'page', sortOrder: 1, entitlementKey: 'online-ordering.channels.orders', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'online-ordering.channels.availability', label: 'Channel Availability', parentId: 'online-ordering.channels', moduleKey: 'online-ordering', level: 'page', sortOrder: 2, entitlementKey: 'online-ordering.channels.availability', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'online-ordering.delivery.timing', label: 'Delivery Timing', parentId: 'online-ordering.delivery', moduleKey: 'online-ordering', level: 'page', sortOrder: 2, entitlementKey: 'online-ordering.delivery.timing', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'online-ordering.collection.timing', label: 'Collection Timing', parentId: 'online-ordering.collection', moduleKey: 'online-ordering', level: 'page', sortOrder: 1, entitlementKey: 'online-ordering.collection.timing', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
