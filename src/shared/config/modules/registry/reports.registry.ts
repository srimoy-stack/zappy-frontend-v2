import type { RegistryNode } from '../types';

export const REPORTS_REGISTRY: RegistryNode[] = [
    {
        id: 'reports', label: 'Reports', description: 'Enterprise reporting and analytics',
        icon: 'FileText', parentId: null, moduleKey: 'reports', level: 'module', sortOrder: 3,
        route: '/backoffice/reports', routePrefix: '/backoffice', entitlementKey: 'reports',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'operations',
    },
    // ── Submodules
    { id: 'reports.financial', label: 'Financial Reports', parentId: 'reports', moduleKey: 'reports', level: 'submodule', sortOrder: 1, entitlementKey: 'reports.financial', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.operational', label: 'Operational Reports', parentId: 'reports', moduleKey: 'reports', level: 'submodule', sortOrder: 2, entitlementKey: 'reports.operational', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.pos', label: 'POS Reports', parentId: 'reports', moduleKey: 'reports', level: 'submodule', sortOrder: 3, entitlementKey: 'reports.pos', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.inventory', label: 'Inventory Reports', parentId: 'reports', moduleKey: 'reports', level: 'submodule', sortOrder: 4, entitlementKey: 'reports.inventory', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'reports.financial.sales-summary', label: 'Sales Summary', parentId: 'reports.financial', moduleKey: 'reports', level: 'page', sortOrder: 1, route: '/backoffice/reports', entitlementKey: 'reports.financial.sales-summary', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.financial.hourly', label: 'Hourly Reports', parentId: 'reports.financial', moduleKey: 'reports', level: 'page', sortOrder: 2, entitlementKey: 'reports.financial.hourly', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.financial.tax', label: 'Tax Reports', parentId: 'reports.financial', moduleKey: 'reports', level: 'page', sortOrder: 3, entitlementKey: 'reports.financial.tax', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.pos.x-reading', label: 'X Reading', parentId: 'reports.pos', moduleKey: 'reports', level: 'page', sortOrder: 1, entitlementKey: 'reports.pos.x-reading', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.pos.z-reading', label: 'Z Reading', parentId: 'reports.pos', moduleKey: 'reports', level: 'page', sortOrder: 2, entitlementKey: 'reports.pos.z-reading', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.pos.refund', label: 'Refund Reports', parentId: 'reports.pos', moduleKey: 'reports', level: 'page', sortOrder: 3, entitlementKey: 'reports.pos.refund', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.operational.shift', label: 'Shift Reports', parentId: 'reports.operational', moduleKey: 'reports', level: 'page', sortOrder: 1, entitlementKey: 'reports.operational.shift', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.operational.product-performance', label: 'Product Performance', parentId: 'reports.operational', moduleKey: 'reports', level: 'page', sortOrder: 2, entitlementKey: 'reports.operational.product-performance', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'reports.operational.store-performance', label: 'Store Performance', parentId: 'reports.operational', moduleKey: 'reports', level: 'page', sortOrder: 3, entitlementKey: 'reports.operational.store-performance', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
