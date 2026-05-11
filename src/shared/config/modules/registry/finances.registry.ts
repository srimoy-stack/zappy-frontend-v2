import type { RegistryNode } from '../types';

export const FINANCES_REGISTRY: RegistryNode[] = [
    {
        id: 'finances', label: 'Finances', description: 'Payment processing, refunds, payouts and tax management',
        icon: 'DollarSign', parentId: null, moduleKey: 'finances', level: 'module', sortOrder: 12,
        route: '/backoffice/finances', routePrefix: '/backoffice', entitlementKey: 'finances',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'operations',
    },
    // ── Submodules
    { id: 'finances.payments', label: 'Payments', parentId: 'finances', moduleKey: 'finances', level: 'submodule', sortOrder: 1, entitlementKey: 'finances.payments', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'finances.refunds', label: 'Refunds', parentId: 'finances', moduleKey: 'finances', level: 'submodule', sortOrder: 2, entitlementKey: 'finances.refunds', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'finances.payouts', label: 'Payouts', parentId: 'finances', moduleKey: 'finances', level: 'submodule', sortOrder: 3, entitlementKey: 'finances.payouts', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'finances.tax', label: 'Tax Management', parentId: 'finances', moduleKey: 'finances', level: 'submodule', sortOrder: 4, entitlementKey: 'finances.tax', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'finances.payments.transactions', label: 'Transactions', parentId: 'finances.payments', moduleKey: 'finances', level: 'page', sortOrder: 1, route: '/backoffice/finances', entitlementKey: 'finances.payments.transactions', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'finances.refunds.center', label: 'Refund Center', parentId: 'finances.refunds', moduleKey: 'finances', level: 'page', sortOrder: 1, entitlementKey: 'finances.refunds.center', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'finances.payouts.reports', label: 'Payout Reports', parentId: 'finances.payouts', moduleKey: 'finances', level: 'page', sortOrder: 1, entitlementKey: 'finances.payouts.reports', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'finances.tax.rules', label: 'Tax Rules', parentId: 'finances.tax', moduleKey: 'finances', level: 'page', sortOrder: 1, entitlementKey: 'finances.tax.rules', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'finances.payments.methods', label: 'Payment Methods', parentId: 'finances.payments', moduleKey: 'finances', level: 'page', sortOrder: 2, entitlementKey: 'finances.payments.methods', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
