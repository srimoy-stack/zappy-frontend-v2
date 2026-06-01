import type { RegistryNode } from '../types';

export const POS_REGISTRY: RegistryNode[] = [
    // ── Module ───────────────────────────────────────────
    {
        id: 'pos', label: 'Point of Sale', description: 'Full POS terminal operations',
        icon: 'ShoppingCart', parentId: null, moduleKey: 'pos', level: 'module', sortOrder: 1,
        route: '/pos', routePrefix: '/pos', entitlementKey: 'pos',
        isCore: false, isSystem: false, isBeta: false, isProtected: true,
        status: 'active', showInSidebar: false /* Phase 1: hidden */, sidebarGroup: 'operations',
    },

    // ── Submodules ───────────────────────────────────────
    { id: 'pos.terminal', label: 'POS Terminal', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 1, entitlementKey: 'pos.terminal', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.orders', label: 'Orders', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 2, entitlementKey: 'pos.orders', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.payments', label: 'Payments', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 3, entitlementKey: 'pos.payments', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.shifts', label: 'Shift Management', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 4, entitlementKey: 'pos.shifts', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.cash-drawer', label: 'Cash Drawer', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 5, entitlementKey: 'pos.cash-drawer', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.split-transfer', label: 'Split/Transfer Orders', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 6, entitlementKey: 'pos.split-transfer', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.refunds', label: 'Refunds', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 7, entitlementKey: 'pos.refunds', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.recall', label: 'Order Recall', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 8, entitlementKey: 'pos.recall', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.park-hold', label: 'Park/Hold Orders', parentId: 'pos', moduleKey: 'pos', level: 'submodule', sortOrder: 9, entitlementKey: 'pos.park-hold', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },

    // ── Pages ────────────────────────────────────────────
    { id: 'pos.terminal.new-sale', label: 'New Sale', parentId: 'pos.terminal', moduleKey: 'pos', level: 'page', sortOrder: 1, route: '/pos', entitlementKey: 'pos.terminal.new-sale', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.orders.active', label: 'Active Orders', parentId: 'pos.orders', moduleKey: 'pos', level: 'page', sortOrder: 1, entitlementKey: 'pos.orders.active', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.orders.history', label: 'Order History', parentId: 'pos.orders', moduleKey: 'pos', level: 'page', sortOrder: 2, entitlementKey: 'pos.orders.history', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.payments.processing', label: 'Payment Processing', parentId: 'pos.payments', moduleKey: 'pos', level: 'page', sortOrder: 1, entitlementKey: 'pos.payments.processing', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.shifts.open-close', label: 'Shift Open/Close', parentId: 'pos.shifts', moduleKey: 'pos', level: 'page', sortOrder: 1, entitlementKey: 'pos.shifts.open-close', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.cash-drawer.summary', label: 'Cash Summary', parentId: 'pos.cash-drawer', moduleKey: 'pos', level: 'page', sortOrder: 1, entitlementKey: 'pos.cash-drawer.summary', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.split-transfer.split-bill', label: 'Split Bill', parentId: 'pos.split-transfer', moduleKey: 'pos', level: 'page', sortOrder: 1, entitlementKey: 'pos.split-transfer.split-bill', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.split-transfer.transfer-table', label: 'Transfer Table', parentId: 'pos.split-transfer', moduleKey: 'pos', level: 'page', sortOrder: 2, entitlementKey: 'pos.split-transfer.transfer-table', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.refunds.management', label: 'Refund Management', parentId: 'pos.refunds', moduleKey: 'pos', level: 'page', sortOrder: 1, entitlementKey: 'pos.refunds.management', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.recall.order', label: 'Recall Order', parentId: 'pos.recall', moduleKey: 'pos', level: 'page', sortOrder: 1, entitlementKey: 'pos.recall.order', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.orders.delivery', label: 'Delivery Orders', parentId: 'pos.orders', moduleKey: 'pos', level: 'page', sortOrder: 3, entitlementKey: 'pos.orders.delivery', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.orders.collection', label: 'Collection Orders', parentId: 'pos.orders', moduleKey: 'pos', level: 'page', sortOrder: 4, entitlementKey: 'pos.orders.collection', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'pos.orders.restaurant', label: 'Restaurant Orders', parentId: 'pos.orders', moduleKey: 'pos', level: 'page', sortOrder: 5, entitlementKey: 'pos.orders.restaurant', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
