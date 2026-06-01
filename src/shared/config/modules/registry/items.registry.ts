import type { RegistryNode } from '../types';

export const ITEMS_REGISTRY: RegistryNode[] = [
    {
        id: 'items', label: 'Items & Catalog', description: 'Product catalog, categories, modifiers and pricing',
        icon: 'Package', parentId: null, moduleKey: 'items', level: 'module', sortOrder: 4,
        route: '/backoffice/items', routePrefix: '/backoffice', entitlementKey: 'items',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'operations',
    },
    {
        id: 'menu-management', label: 'Menu Management', description: 'Configure master menus, store visibility, and section layouts',
        icon: 'Menu', parentId: null, moduleKey: 'menu-management', level: 'module', sortOrder: 4.5,
        route: '/backoffice/menu-management', routePrefix: '/backoffice', entitlementKey: 'menu-management',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'operations',
    },
    // ── Submodules
    { id: 'items.management', label: 'Item Management', parentId: 'items', moduleKey: 'items', level: 'submodule', sortOrder: 1, entitlementKey: 'items.management', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.categories', label: 'Categories', parentId: 'items', moduleKey: 'items', level: 'submodule', sortOrder: 2, entitlementKey: 'items.categories', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.modifiers', label: 'Modifier Groups', parentId: 'items', moduleKey: 'items', level: 'submodule', sortOrder: 3, entitlementKey: 'items.modifiers', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.pricing', label: 'Pricing', parentId: 'items', moduleKey: 'items', level: 'submodule', sortOrder: 4, entitlementKey: 'items.pricing', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.combos', label: 'Combos', parentId: 'items', moduleKey: 'items', level: 'submodule', sortOrder: 5, entitlementKey: 'items.combos', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'items.management.list', label: 'Item List', parentId: 'items.management', moduleKey: 'items', level: 'page', sortOrder: 1, route: '/backoffice/items', entitlementKey: 'items.management.list', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.management.create', label: 'Create Item', parentId: 'items.management', moduleKey: 'items', level: 'page', sortOrder: 2, entitlementKey: 'items.management.create', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.categories.list', label: 'Categories', parentId: 'items.categories', moduleKey: 'items', level: 'page', sortOrder: 1, entitlementKey: 'items.categories.list', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.categories.sub', label: 'Sub Categories', parentId: 'items.categories', moduleKey: 'items', level: 'page', sortOrder: 2, entitlementKey: 'items.categories.sub', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.modifiers.groups', label: 'Modifier Groups', parentId: 'items.modifiers', moduleKey: 'items', level: 'page', sortOrder: 1, entitlementKey: 'items.modifiers.groups', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.management.menu-config', label: 'Menu Configuration', parentId: 'items.management', moduleKey: 'items', level: 'page', sortOrder: 3, entitlementKey: 'items.management.menu-config', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.management.quick-entry', label: 'Product Quick Entry', parentId: 'items.management', moduleKey: 'items', level: 'page', sortOrder: 4, entitlementKey: 'items.management.quick-entry', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.pricing.variants', label: 'Variant Pricing', parentId: 'items.pricing', moduleKey: 'items', level: 'page', sortOrder: 1, entitlementKey: 'items.pricing.variants', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'items.combos.builder', label: 'Combo Builder', parentId: 'items.combos', moduleKey: 'items', level: 'page', sortOrder: 1, entitlementKey: 'items.combos.builder', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
