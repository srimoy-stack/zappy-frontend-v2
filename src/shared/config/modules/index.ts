/**
 * Module Registry — Public API
 *
 * Single barrel export for the entire module registry system.
 * Consumers import from '@/shared/config/modules'.
 */

// Types
export type {
    RegistryNode,
    ResolvedNavItem,
    NodeLevel,
    NodeStatus,
    SidebarGroup,
    ModuleRegistryMap,
    TenantEntitlementConfig,
} from './types';

// Registry
export { MODULE_REGISTRY } from './registry';

// Lookups (O(1) accessors)
export {
    getNode,
    getChildren,
    getDescendants,
    getAncestors,
    findNodeByRoute,
    getModuleNodes,
    getCoreModuleIds,
    getProtectedPaths,
    isProtectedPath,
    getSidebarNodes,
    getModuleTree,
    getRegistrySize,
} from './lookups';

// Icons
export { resolveIcon, ICON_MAP } from './iconMap';
