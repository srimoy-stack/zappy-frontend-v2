import type { RegistryNode } from '../types';

export const SALES_ACTIVITY_REGISTRY: RegistryNode[] = [
    {
        id: 'sales-activity', label: 'Sales Activity', description: 'Real-time sales monitoring and transaction tracking',
        icon: 'TrendingUp', parentId: null, moduleKey: 'sales-activity', level: 'module', sortOrder: 2,
        route: '/backoffice/sales-activity', routePrefix: '/backoffice', entitlementKey: 'sales-activity',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'operations',
    },
    // ── Submodules
    { id: 'sales-activity.live', label: 'Live Sales', parentId: 'sales-activity', moduleKey: 'sales-activity', level: 'submodule', sortOrder: 1, entitlementKey: 'sales-activity.live', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'sales-activity.transactions', label: 'Transactions', parentId: 'sales-activity', moduleKey: 'sales-activity', level: 'submodule', sortOrder: 2, entitlementKey: 'sales-activity.transactions', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'sales-activity.monitoring', label: 'Order Monitoring', parentId: 'sales-activity', moduleKey: 'sales-activity', level: 'submodule', sortOrder: 3, entitlementKey: 'sales-activity.monitoring', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'sales-activity.live.orders', label: 'Live Orders', parentId: 'sales-activity.live', moduleKey: 'sales-activity', level: 'page', sortOrder: 1, route: '/backoffice/sales-activity', entitlementKey: 'sales-activity.live.orders', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'sales-activity.live.feed', label: 'Sales Feed', parentId: 'sales-activity.live', moduleKey: 'sales-activity', level: 'page', sortOrder: 2, entitlementKey: 'sales-activity.live.feed', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'sales-activity.transactions.logs', label: 'Transaction Logs', parentId: 'sales-activity.transactions', moduleKey: 'sales-activity', level: 'page', sortOrder: 1, entitlementKey: 'sales-activity.transactions.logs', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'sales-activity.monitoring.failed', label: 'Failed Orders', parentId: 'sales-activity.monitoring', moduleKey: 'sales-activity', level: 'page', sortOrder: 1, entitlementKey: 'sales-activity.monitoring.failed', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'sales-activity.monitoring.cancelled', label: 'Cancelled Orders', parentId: 'sales-activity.monitoring', moduleKey: 'sales-activity', level: 'page', sortOrder: 2, entitlementKey: 'sales-activity.monitoring.cancelled', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'sales-activity.monitoring.voided', label: 'Voided Orders', parentId: 'sales-activity.monitoring', moduleKey: 'sales-activity', level: 'page', sortOrder: 3, entitlementKey: 'sales-activity.monitoring.voided', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
