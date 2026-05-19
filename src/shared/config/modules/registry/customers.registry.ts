import type { RegistryNode } from '../types';

export const CUSTOMERS_REGISTRY: RegistryNode[] = [
    {
        id: 'customers', label: 'Customers', description: 'CRM, loyalty and customer insights',
        icon: 'UserCircle', parentId: null, moduleKey: 'customers', level: 'module', sortOrder: 7,
        route: '/backoffice/customers', routePrefix: '/backoffice', entitlementKey: 'customers',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'management',
    },
    // ── Submodules
    { id: 'customers.crm', label: 'CRM', parentId: 'customers', moduleKey: 'customers', level: 'submodule', sortOrder: 1, entitlementKey: 'customers.crm', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'customers.loyalty', label: 'Loyalty', parentId: 'customers', moduleKey: 'customers', level: 'submodule', sortOrder: 2, entitlementKey: 'customers.loyalty', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'customers.insights', label: 'Customer Insights', parentId: 'customers', moduleKey: 'customers', level: 'submodule', sortOrder: 3, entitlementKey: 'customers.insights', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'customers.crm.list', label: 'Customer List', parentId: 'customers.crm', moduleKey: 'customers', level: 'page', sortOrder: 1, route: '/backoffice/customers', entitlementKey: 'customers.crm.list', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'customers.crm.details', label: 'Customer Details', parentId: 'customers.crm', moduleKey: 'customers', level: 'page', sortOrder: 2, entitlementKey: 'customers.crm.details', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'customers.loyalty.accounts', label: 'Loyalty Accounts', parentId: 'customers.loyalty', moduleKey: 'customers', level: 'page', sortOrder: 1, entitlementKey: 'customers.loyalty.accounts', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'customers.crm.notes', label: 'Customer Notes', parentId: 'customers.crm', moduleKey: 'customers', level: 'page', sortOrder: 3, entitlementKey: 'customers.crm.notes', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'customers.crm.blacklist', label: 'Blacklist Management', parentId: 'customers.crm', moduleKey: 'customers', level: 'page', sortOrder: 4, entitlementKey: 'customers.crm.blacklist', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
