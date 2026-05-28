import { create } from 'zustand';
import { Item, Category, ProductDeploymentScope, ChannelSyncStatus } from '../types/items';
import { mockItems, mockCategories } from '../mock/items';
import { catalogService } from '../services/catalogService';

interface CatalogState {
    items: Item[];
    categories: Category[];
    selectedItemId: string | null;
    isLoading: boolean;
    syncQueue: string[]; // List of Item IDs currently queued for aggregator sync
    error: string | null;

    // Core CRUD & Draft Actions
    setItems: (items: Item[]) => void;
    setCategories: (categories: Category[]) => void;
    addCategory: (category: Category) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    selectItem: (id: string | null) => void;
    createItem: (itemData: Partial<Item>) => Item;
    updateItem: (id: string, updates: Partial<Item>) => void;
    deleteItem: (id: string) => void;

    // Publishing Lifecycle & Operational Actions
    publishDraft: (id: string) => Promise<boolean>;
    rollbackToVersion: (id: string, targetVersion: number) => void;
    updateProductScope: (id: string, scope: ProductDeploymentScope, targetedStoreIds: string[]) => void;

    // Sync & Operational Recovery Layer
    triggerChannelSync: (id: string, channelId: string) => Promise<void>;
    clearError: () => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => {
    // Cache version — bump this when Item schema changes to invalidate stale localStorage
    const CATALOG_CACHE_VERSION = 2;

    // Try to load cached drafts from localStorage if available in browser context
    const getCachedItems = (): Item[] => {
        if (typeof window !== 'undefined') {
            const version = localStorage.getItem('zyappy_catalog_cache_version');
            const cached = localStorage.getItem('zyappy_catalog_items_drafts');

            // If cache version doesn't match, clear stale data
            if (version !== String(CATALOG_CACHE_VERSION)) {
                localStorage.removeItem('zyappy_catalog_items_drafts');
                localStorage.setItem('zyappy_catalog_cache_version', String(CATALOG_CACHE_VERSION));
            } else if (cached) {
                try {
                    const parsed: Item[] = JSON.parse(cached);
                    // Backfill any newly-added fields with defaults
                    return parsed.map(item => ({
                        ...item,
                        sku: item.sku ?? '',
                        tags: item.tags ?? [],
                        secondaryCategoryIds: item.secondaryCategoryIds ?? [],
                        baseProductPrice: item.baseProductPrice ?? 0,
                        dietaryFlags: item.dietaryFlags ?? [],
                        channelVisibility: item.channelVisibility ?? ['POS', 'ONLINE'],
                        taxRate: item.taxRate ?? 5.0,
                        modifierAttachments: item.modifierAttachments || [],
                        scopeConfig: item.scopeConfig || { scope: 'GLOBAL', targetedStoreIds: [] },
                        storeOverridesResolver: item.storeOverridesResolver || [],
                        equivalencyRules: item.equivalencyRules || [],
                        storeOverrides: item.storeOverrides || [],
                    }));
                } catch (e) {
                    console.error('Failed to parse cached catalog drafts:', e);
                }
            }
        }
        // Fallback to loaded mocks (mapped to the normalized structure)
        return mockItems.map(item => ({
            ...item,
            modifierAttachments: item.modifierAttachments || [],
            scopeConfig: item.scopeConfig || { scope: 'GLOBAL', targetedStoreIds: [] },
            storeOverridesResolver: item.storeOverridesResolver || [],
            equivalencyRules: item.equivalencyRules || [],
            versionMetadata: item.versionMetadata || {
                version: 1,
                lastModifiedBy: 'System Seed',
                lastModifiedAt: new Date().toISOString(),
                activeDraftHash: 'seed-hash-v1'
            },
            channelSyncs: item.channelSyncs || [
                { channelId: 'POS', status: 'SYNCED', lastSyncedAt: new Date().toISOString() },
                { channelId: 'ONLINE', status: 'SYNCED', lastSyncedAt: new Date().toISOString() }
            ]
        }));
    };

    const persistDrafts = (items: Item[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('zyappy_catalog_items_drafts', JSON.stringify(items));
        }
    };

    return {
        items: getCachedItems(),
        categories: mockCategories,
        selectedItemId: null,
        isLoading: false,
        syncQueue: [],
        error: null,

        setItems: (items) => {
            set({ items });
            persistDrafts(items);
        },

        setCategories: (categories) => set({ categories }),

        addCategory: (category) => {
            set(state => ({ categories: [...state.categories, category] }));
        },

        updateCategory: (id, updates) => {
            set(state => ({
                categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
            }));
        },

        selectItem: (id) => set({ selectedItemId: id }),

        createItem: (itemData) => {
            const newItem: Item = {
                id: 'item-' + Date.now(),
                productType: itemData.productType || 'SINGLE',
                name: itemData.name || 'New Master Offering',
                sku: itemData.sku || '',
                tags: itemData.tags || [],
                description: itemData.description || '',
                imageUrl: itemData.imageUrl,
                categoryId: itemData.categoryId || '',
                secondaryCategoryIds: itemData.secondaryCategoryIds || [],
                baseProductPrice: itemData.baseProductPrice ?? 0,
                dietaryFlags: itemData.dietaryFlags || [],
                channelVisibility: itemData.channelVisibility || ['POS', 'ONLINE'],
                variantGroups: itemData.variantGroups || [],
                modifierAttachments: itemData.modifierAttachments || [],
                modifierGroups: itemData.modifierGroups || [],
                isAvailable: itemData.isAvailable !== undefined ? itemData.isAvailable : true,
                taxRate: itemData.taxRate ?? 5.0,
                scopeConfig: itemData.scopeConfig || { scope: 'GLOBAL', targetedStoreIds: [] },
                storeOverridesResolver: itemData.storeOverridesResolver || [],
                equivalencyRules: itemData.equivalencyRules || [],
                storeOverrides: itemData.storeOverrides || [],
                versionMetadata: {
                    version: 1,
                    lastModifiedBy: 'Brand Admin',
                    lastModifiedAt: new Date().toISOString(),
                    activeDraftHash: 'draft-' + Math.random().toString(36).substring(2, 9)
                },
                channelSyncs: [
                    { channelId: 'POS', status: 'DRAFT' },
                    { channelId: 'ONLINE', status: 'DRAFT' }
                ],
                auditLog: [
                    { timestamp: new Date().toISOString(), user: 'Brand Admin', action: 'Created Master Item' }
                ]
            };

            const updatedItems = [newItem, ...get().items];
            set({ items: updatedItems, selectedItemId: newItem.id });
            persistDrafts(updatedItems);

            // Async background database synchronization
            catalogService.createProduct(newItem).catch((err) => {
                console.warn('[Offline Mode] Product draft saved locally only:', err.message);
            });

            return newItem;
        },

        updateItem: (id, updates) => {
            let updatedItem: Item | null = null;
            const updatedItems = get().items.map(item => {
                if (item.id === id) {
                    const newVersionMetadata = item.versionMetadata
                        ? {
                              ...item.versionMetadata,
                              lastModifiedAt: new Date().toISOString(),
                              activeDraftHash: 'draft-' + Math.random().toString(36).substring(2, 9)
                          }
                        : undefined;

                    updatedItem = {
                        ...item,
                        ...updates,
                        versionMetadata: newVersionMetadata,
                        // Reset channel sync status to DRAFT to represent dirty state
                        channelSyncs: item.channelSyncs?.map(c => ({
                            ...c,
                            status: 'DRAFT' as const
                        }))
                    };
                    return updatedItem;
                }
                return item;
            });

            set({ items: updatedItems });
            persistDrafts(updatedItems);

            // Async background database synchronization
            if (updatedItem) {
                catalogService.updateProduct(id, updatedItem).catch((err) => {
                    console.warn('[Offline Mode] Product updates saved locally only:', err.message);
                });
            }
        },

        deleteItem: (id) => {
            const updatedItems = get().items.filter(item => item.id !== id);
            const nextSelected = get().selectedItemId === id ? null : get().selectedItemId;
            set({ items: updatedItems, selectedItemId: nextSelected });
            persistDrafts(updatedItems);

            // Async background database deletion
            catalogService.deleteProduct(id).catch((err) => {
                console.warn('[Offline Mode] Product deleted locally only:', err.message);
            });
        },

        publishDraft: async (id) => {
            const item = get().items.find(i => i.id === id);
            if (!item) return false;

            set({ isLoading: true, error: null });

            // Run publishing validations (e.g. at least one variant default config, non-empty components for Combo, etc.)
            if (!item.name) {
                set({ isLoading: false, error: 'Publish rejected: Product name is required' });
                return false;
            }
            if (item.productType === 'COMBO' && item.variantGroups.length === 0) {
                set({ isLoading: false, error: 'Publish rejected: Combo product must contain at least one Component' });
                return false;
            }

            try {
                // Call actual backend publish pipeline endpoint
                await catalogService.publishProduct(id);

                const updatedItems = get().items.map(i => {
                    if (i.id === id) {
                        const nextVersion = (i.versionMetadata?.version || 0) + 1;
                        return {
                            ...i,
                            versionMetadata: {
                                version: nextVersion,
                                lastModifiedBy: 'Brand Admin',
                                lastModifiedAt: new Date().toISOString(),
                                activeDraftHash: 'released-v' + nextVersion
                            },
                            channelSyncs: i.channelSyncs?.map(c => ({
                                ...c,
                                status: 'SYNCED' as const,
                                lastSyncedAt: new Date().toISOString()
                            }))
                        };
                    }
                    return i;
                });

                set({ items: updatedItems, isLoading: false });
                persistDrafts(updatedItems);
                return true;
            } catch (err: any) {
                // Fallback graceful degradation for demo/seed data sync simulator
                console.warn('Backend server offline, running simulated publish replication');
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const updatedItems = get().items.map(i => {
                    if (i.id === id) {
                        const nextVersion = (i.versionMetadata?.version || 0) + 1;
                        return {
                            ...i,
                            versionMetadata: {
                                version: nextVersion,
                                lastModifiedBy: 'Brand Admin',
                                lastModifiedAt: new Date().toISOString(),
                                activeDraftHash: 'released-v' + nextVersion
                            },
                            channelSyncs: i.channelSyncs?.map(c => ({
                                ...c,
                                status: 'SYNCED' as const,
                                lastSyncedAt: new Date().toISOString()
                            }))
                        };
                    }
                    return i;
                });

                set({ items: updatedItems, isLoading: false });
                persistDrafts(updatedItems);
                return true;
            }
        },

        rollbackToVersion: (id, targetVersion) => {
            // Restore draft version history config
            const updatedItems = get().items.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        versionMetadata: {
                            version: targetVersion,
                            lastModifiedBy: 'Rollback Recovery',
                            lastModifiedAt: new Date().toISOString(),
                            activeDraftHash: 'rollback-v' + targetVersion
                        },
                        channelSyncs: item.channelSyncs?.map(c => ({
                            ...c,
                            status: 'DRAFT' as const
                        }))
                    };
                }
                return item;
            });
            set({ items: updatedItems });
            persistDrafts(updatedItems);
        },

        updateProductScope: (id, scope, targetedStoreIds) => {
            const updatedItems = get().items.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        scopeConfig: {
                            scope,
                            targetedStoreIds
                        }
                    };
                }
                return item;
            });
            set({ items: updatedItems });
            persistDrafts(updatedItems);
        },

        triggerChannelSync: async (id, channelId) => {
            const item = get().items.find(i => i.id === id);
            if (!item) return;

            // Optimistically set to QUEUED
            set(state => ({
                syncQueue: [...state.syncQueue, `${id}-${channelId}`],
                items: state.items.map(i => {
                    if (i.id === id) {
                        return {
                            ...i,
                            channelSyncs: i.channelSyncs?.map(c =>
                                c.channelId === channelId ? { ...c, status: 'QUEUED' } : c
                            )
                        };
                    }
                    return i;
                })
            }));

            try {
                // Simulate network sync latency
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // 15% random failure rate to demonstrate failed sync operational recovery controls
                        if (Math.random() < 0.15) {
                            reject(new Error('Aggregator API Gateway timeout'));
                        } else {
                            resolve(true);
                        }
                    }, 2000);
                });

                set(state => ({
                    syncQueue: state.syncQueue.filter(q => q !== `${id}-${channelId}`),
                    items: state.items.map(i => {
                        if (i.id === id) {
                            return {
                                ...i,
                                channelSyncs: i.channelSyncs?.map(c =>
                                    c.channelId === channelId
                                        ? { ...c, status: 'SYNCED', lastSyncedAt: new Date().toISOString(), errorMessage: undefined }
                                        : c
                                )
                            };
                        }
                        return i;
                    })
                }));
            } catch (err: any) {
                set(state => ({
                    syncQueue: state.syncQueue.filter(q => q !== `${id}-${channelId}`),
                    items: state.items.map(i => {
                        if (i.id === id) {
                            return {
                                ...i,
                                channelSyncs: i.channelSyncs?.map(c =>
                                    c.channelId === channelId
                                        ? { ...c, status: 'FAILED', errorMessage: err.message || 'Sync failed' }
                                        : c
                                )
                            };
                        }
                        return i;
                    })
                }));
            }
        },

        clearError: () => set({ error: null })
    };
});
