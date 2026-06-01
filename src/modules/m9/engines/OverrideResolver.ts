import { Item, StoreOverrideResolver } from '../types/items';

export class OverrideResolver {
    /**
     * Checks if a specific item field has been overridden for a given store.
     */
    static isFieldOverridden(item: Item, storeId: string, fieldName: string): boolean {
        // Try the new StoreOverrideResolver first
        const resolver = item.storeOverridesResolver?.find(r => r.storeId === storeId);
        if (resolver) {
            return resolver.overrides.overriddenFields.includes(fieldName);
        }

        // Fallback to legacy storeOverrides array if resolver isn't set yet
        const legacyOverride = item.storeOverrides?.find(o => o.storeId === storeId);
        if (legacyOverride) {
            if (fieldName === 'price' && legacyOverride.price !== undefined) return true;
            if (fieldName === 'isAvailable' && legacyOverride.isAvailable !== undefined) return true;
        }

        return false;
    }

    /**
     * Resolves the runtime value of an item attribute for a specific store.
     * If the field has a store override, returns the overridden value.
     * Otherwise, falls back to the brand master's default value.
     */
    static resolveValue<T>(item: Item, storeId: string, fieldName: string, brandMasterValue: T): T {
        // Resolve using the new StoreOverrideResolver
        const resolver = item.storeOverridesResolver?.find(r => r.storeId === storeId);
        if (resolver) {
            if (resolver.overrides.overriddenFields.includes(fieldName)) {
                const value = (resolver.overrides as any)[fieldName];
                if (value !== undefined) {
                    return value as T;
                }
            }
        }

        // Fallback to legacy storeOverrides if available
        const legacyOverride = item.storeOverrides?.find(o => o.storeId === storeId);
        if (legacyOverride) {
            if (fieldName === 'price' && legacyOverride.price !== undefined) {
                return legacyOverride.price as unknown as T;
            }
            if (fieldName === 'isAvailable' && legacyOverride.isAvailable !== undefined) {
                return legacyOverride.isAvailable as unknown as T;
            }
        }

        return brandMasterValue;
    }

    /**
     * Creates or updates a store-level field override on an item template.
     */
    static applyOverride(item: Item, storeId: string, fieldName: string, value: any): Item {
        const resolvers = item.storeOverridesResolver ? [...item.storeOverridesResolver] : [];
        const resolverIdx = resolvers.findIndex(r => r.storeId === storeId);

        if (resolverIdx >= 0) {
            const resolver = { ...resolvers[resolverIdx] };
            const overrides = { ...resolver.overrides };
            const overriddenFields = [...overrides.overriddenFields];

            if (!overriddenFields.includes(fieldName)) {
                overriddenFields.push(fieldName);
            }

            (overrides as any)[fieldName] = value;
            overrides.overriddenFields = overriddenFields;
            resolver.overrides = overrides;
            resolvers[resolverIdx] = resolver;
        } else {
            // Create a brand new resolver
            const newResolver: StoreOverrideResolver = {
                storeId,
                itemId: item.id,
                overrides: {
                    overriddenFields: [fieldName],
                    [fieldName]: value
                }
            };
            resolvers.push(newResolver);
        }

        // Legacy compatibility sync
        const legacyOverrides = item.storeOverrides ? [...item.storeOverrides] : [];
        const legacyIdx = legacyOverrides.findIndex(o => o.storeId === storeId);
        const legacyUpdate = {
            storeId,
            price: fieldName === 'price' ? parseFloat(value) || 0 : legacyOverrides[legacyIdx]?.price,
            isAvailable: fieldName === 'isAvailable' ? !!value : legacyOverrides[legacyIdx]?.isAvailable
        };

        if (legacyIdx >= 0) {
            legacyOverrides[legacyIdx] = { ...legacyOverrides[legacyIdx], ...legacyUpdate };
        } else {
            legacyOverrides.push(legacyUpdate);
        }

        return {
            ...item,
            storeOverridesResolver: resolvers,
            storeOverrides: legacyOverrides
        };
    }

    /**
     * Removes an override, resetting the store field back to inherited Brand Master values.
     */
    static removeOverride(item: Item, storeId: string, fieldName: string): Item {
        if (!item.storeOverridesResolver) return item;

        const resolvers = item.storeOverridesResolver.map(resolver => {
            if (resolver.storeId === storeId) {
                const overrides = { ...resolver.overrides };
                const overriddenFields = overrides.overriddenFields.filter(f => f !== fieldName);
                
                // Clear out overridden property value
                const updatedOverrides = { ...overrides, overriddenFields };
                delete (updatedOverrides as any)[fieldName];

                return {
                    ...resolver,
                    overrides: updatedOverrides
                };
            }
            return resolver;
        }).filter(r => r.overrides.overriddenFields.length > 0); // Keep only active overrides

        // Clean up legacy overrides array too
        const legacyOverrides = item.storeOverrides ? item.storeOverrides.map(o => {
            if (o.storeId === storeId) {
                const updated = { ...o };
                if (fieldName === 'price') delete updated.price;
                if (fieldName === 'isAvailable') delete updated.isAvailable;
                return updated;
            }
            return o;
        }).filter(o => o.price !== undefined || o.isAvailable !== undefined) : [];

        return {
            ...item,
            storeOverridesResolver: resolvers,
            storeOverrides: legacyOverrides
        };
    }
}
