import type { RegistryNode } from '../types';

export const INVENTORY_REGISTRY: RegistryNode[] = [
    {
        id: 'inventory', label: 'Inventory', description: 'Stock management, recipes, purchasing and waste tracking',
        icon: 'Warehouse', parentId: null, moduleKey: 'inventory', level: 'module', sortOrder: 5,
        route: '/backoffice/inventory', routePrefix: '/backoffice', entitlementKey: 'inventory',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'operations',
    },
    // ── Submodules
    { id: 'inventory.stock', label: 'Stock', parentId: 'inventory', moduleKey: 'inventory', level: 'submodule', sortOrder: 1, entitlementKey: 'inventory.stock', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.recipes', label: 'Recipes', parentId: 'inventory', moduleKey: 'inventory', level: 'submodule', sortOrder: 2, entitlementKey: 'inventory.recipes', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.purchase', label: 'Purchase Flow', parentId: 'inventory', moduleKey: 'inventory', level: 'submodule', sortOrder: 3, entitlementKey: 'inventory.purchase', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.waste', label: 'Waste Tracking', parentId: 'inventory', moduleKey: 'inventory', level: 'submodule', sortOrder: 4, entitlementKey: 'inventory.waste', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'inventory.stock.dashboard', label: 'Inventory Dashboard', parentId: 'inventory.stock', moduleKey: 'inventory', level: 'page', sortOrder: 1, route: '/backoffice/inventory', entitlementKey: 'inventory.stock.dashboard', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.stock.levels', label: 'Stock Levels', parentId: 'inventory.stock', moduleKey: 'inventory', level: 'page', sortOrder: 2, entitlementKey: 'inventory.stock.levels', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.recipes.management', label: 'Recipe Management', parentId: 'inventory.recipes', moduleKey: 'inventory', level: 'page', sortOrder: 1, entitlementKey: 'inventory.recipes.management', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.recipes.ingredients', label: 'Ingredient Mapping', parentId: 'inventory.recipes', moduleKey: 'inventory', level: 'page', sortOrder: 2, entitlementKey: 'inventory.recipes.ingredients', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.purchase.orders', label: 'Purchase Orders', parentId: 'inventory.purchase', moduleKey: 'inventory', level: 'page', sortOrder: 1, entitlementKey: 'inventory.purchase.orders', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.waste.logs', label: 'Waste Logs', parentId: 'inventory.waste', moduleKey: 'inventory', level: 'page', sortOrder: 1, entitlementKey: 'inventory.waste.logs', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'inventory.stock.alerts', label: 'Low Stock Alerts', parentId: 'inventory.stock', moduleKey: 'inventory', level: 'page', sortOrder: 3, entitlementKey: 'inventory.stock.alerts', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
