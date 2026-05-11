/**
 * Entitlements — Public API
 */

export { EntitlementProvider, useEntitlements, EntitlementContext } from './EntitlementContext';

export {
    isEntitled,
    hasActiveDescendant,
    getDescendantPaths,
    deriveEnabledModules,
    resolveAccess,
    resolveVisibleNodes,
} from './entitlementResolver';
