import { create } from 'zustand';
import type {
    Menu,
    MenuPublishStatus,
    MenuSyncState,
    MenuChannelType,
    MenuFilters,
    MenuSection,
    MenuItemOverride,
    MenuStoreAssignment,
    MenuChannelAssignment,
    MenuSchedule,
    MenuBulkAction,
} from '../types/menu';
import { mockMenus } from '../mock/menus';

// ─── Store Interface ─────────────────────────────────────────────────────────

interface MenuState {
    menus: Menu[];
    selectedMenuId: string | null;
    isLoading: boolean;
    error: string | null;

    // Filters
    filters: MenuFilters;

    // Bulk selection
    selectedMenuIds: Set<string>;

    // ── Core CRUD
    setMenus: (menus: Menu[]) => void;
    createMenu: (data: Partial<Menu>) => Menu;
    updateMenu: (id: string, updates: Partial<Menu>) => void;
    deleteMenu: (id: string) => void;
    duplicateMenu: (id: string) => Menu;
    selectMenu: (id: string | null) => void;

    // ── Publishing Lifecycle
    publishMenu: (id: string) => void;
    unpublishMenu: (id: string) => void;
    archiveMenu: (id: string) => void;
    restoreMenu: (id: string) => void;

    // ── Sync Operations
    triggerSync: (id: string) => void;
    markSyncComplete: (id: string, state: MenuSyncState, error?: string) => void;

    // ── Filters
    setFilters: (filters: Partial<MenuFilters>) => void;
    resetFilters: () => void;

    // ── Bulk Operations
    toggleMenuSelection: (id: string) => void;
    selectAllMenus: (ids: string[]) => void;
    clearMenuSelection: () => void;
    executeBulkAction: (action: MenuBulkAction) => void;

    // ── Error handling
    clearError: () => void;
}

// ─── Default Filter State ────────────────────────────────────────────────────

const DEFAULT_FILTERS: MenuFilters = {
    status: 'ALL',
    channel: 'ALL',
    sync: 'ALL',
    search: '',
    storeId: null,
};

// ─── Cache Helpers ───────────────────────────────────────────────────────────

const CACHE_KEY = 'zyappy_menu_management_data';
const CACHE_VERSION_KEY = 'zyappy_menu_cache_version';
const CACHE_VERSION = 2;

const getCachedMenus = (): Menu[] => {
    if (typeof window !== 'undefined') {
        const version = localStorage.getItem(CACHE_VERSION_KEY);
        const cached = localStorage.getItem(CACHE_KEY);

        if (version !== String(CACHE_VERSION)) {
            localStorage.removeItem(CACHE_KEY);
            localStorage.setItem(CACHE_VERSION_KEY, String(CACHE_VERSION));
        } else if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error('[MenuStore] Failed to parse cached menus:', e);
            }
        }
    }
    return mockMenus;
};

const persistMenus = (menus: Menu[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(menus));
    }
};

// ─── Store Implementation ────────────────────────────────────────────────────

export const useMenuStore = create<MenuState>((set, get) => ({
    menus: getCachedMenus(),
    selectedMenuId: null,
    isLoading: false,
    error: null,
    filters: { ...DEFAULT_FILTERS },
    selectedMenuIds: new Set<string>(),

    // ── Core CRUD ────────────────────────────────────────────────────────────

    setMenus: (menus) => {
        set({ menus });
        persistMenus(menus);
    },

    createMenu: (data) => {
        const now = new Date().toISOString();
        const newMenu: Menu = {
            id: 'menu-' + Date.now(),
            name: data.name || 'Untitled Menu',
            description: data.description || '',
            primaryChannel: data.primaryChannel || 'POS',
            publishStatus: 'DRAFT',
            syncState: 'IDLE',
            channels: data.channels || [
                { channelType: data.primaryChannel || 'POS', isActive: false, syncState: 'IDLE' },
            ],
            storeAssignment: data.storeAssignment || { scope: 'ALL_STORES', targetStoreIds: [] },
            sections: data.sections || [],
            productIds: data.productIds || [],
            itemOverrides: data.itemOverrides || [],
            schedule: data.schedule || { isAlwaysActive: true, activeDays: [] },
            versionMetadata: {
                version: 1,
                lastModifiedBy: 'Brand Admin',
                lastModifiedAt: now,
                activeDraftHash: 'draft-' + Math.random().toString(36).substring(2, 9),
            },
            auditLog: [
                { timestamp: now, user: 'Brand Admin', action: 'Created menu' },
            ],
            isDefault: false,
            isLocked: false,
            isArchived: false,
        };

        const updated = [newMenu, ...get().menus];
        set({ menus: updated, selectedMenuId: newMenu.id });
        persistMenus(updated);
        return newMenu;
    },

    updateMenu: (id, updates) => {
        const now = new Date().toISOString();
        const updated = get().menus.map(m => {
            if (m.id !== id) return m;
            return {
                ...m,
                ...updates,
                versionMetadata: {
                    ...m.versionMetadata,
                    lastModifiedBy: 'Brand Admin',
                    lastModifiedAt: now,
                    activeDraftHash: 'draft-' + Math.random().toString(36).substring(2, 9),
                },
                auditLog: [
                    { timestamp: now, user: 'Brand Admin', action: 'Updated menu' },
                    ...m.auditLog,
                ],
            };
        });
        set({ menus: updated });
        persistMenus(updated);
    },

    deleteMenu: (id) => {
        const updated = get().menus.filter(m => m.id !== id);
        set({ menus: updated });
        persistMenus(updated);
    },

    duplicateMenu: (id) => {
        const source = get().menus.find(m => m.id === id);
        if (!source) throw new Error(`Menu ${id} not found`);

        const now = new Date().toISOString();
        const dup: Menu = {
            ...source,
            id: 'menu-' + Date.now(),
            name: `${source.name} (Copy)`,
            publishStatus: 'DRAFT',
            syncState: 'IDLE',
            channels: source.channels.map(c => ({ ...c, isActive: false, syncState: 'IDLE' as const })),
            isDefault: false,
            isLocked: false,
            isArchived: false,
            versionMetadata: {
                version: 1,
                lastModifiedBy: 'Brand Admin',
                lastModifiedAt: now,
                activeDraftHash: 'dup-' + Math.random().toString(36).substring(2, 9),
            },
            auditLog: [
                { timestamp: now, user: 'Brand Admin', action: `Duplicated from "${source.name}"` },
            ],
        };

        const updated = [dup, ...get().menus];
        set({ menus: updated });
        persistMenus(updated);
        return dup;
    },

    selectMenu: (id) => set({ selectedMenuId: id }),

    // ── Publishing Lifecycle ─────────────────────────────────────────────────

    publishMenu: (id) => {
        const now = new Date().toISOString();
        const updated = get().menus.map(m => {
            if (m.id !== id) return m;
            return {
                ...m,
                publishStatus: 'PUBLISHED' as MenuPublishStatus,
                syncState: 'SYNCING' as MenuSyncState,
                channels: m.channels.map(c => ({ ...c, isActive: true, syncState: 'SYNCING' as const })),
                versionMetadata: {
                    ...m.versionMetadata,
                    version: m.versionMetadata.version + 1,
                    lastPublishedAt: now,
                    lastPublishedBy: 'Brand Admin',
                    lastModifiedAt: now,
                },
                auditLog: [
                    { timestamp: now, user: 'Brand Admin', action: `Published v${m.versionMetadata.version + 1}` },
                    ...m.auditLog,
                ],
            };
        });
        set({ menus: updated });
        persistMenus(updated);

        // Simulate async sync completion
        setTimeout(() => {
            get().markSyncComplete(id, 'SYNCED');
        }, 2000);
    },

    unpublishMenu: (id) => {
        const now = new Date().toISOString();
        const updated = get().menus.map(m => {
            if (m.id !== id) return m;
            return {
                ...m,
                publishStatus: 'DRAFT' as MenuPublishStatus,
                syncState: 'IDLE' as MenuSyncState,
                channels: m.channels.map(c => ({ ...c, isActive: false, syncState: 'IDLE' as const })),
                auditLog: [
                    { timestamp: now, user: 'Brand Admin', action: 'Unpublished menu' },
                    ...m.auditLog,
                ],
            };
        });
        set({ menus: updated });
        persistMenus(updated);
    },

    archiveMenu: (id) => {
        const now = new Date().toISOString();
        const updated = get().menus.map(m => {
            if (m.id !== id) return m;
            return {
                ...m,
                publishStatus: 'ARCHIVED' as MenuPublishStatus,
                syncState: 'IDLE' as MenuSyncState,
                isArchived: true,
                isLocked: true,
                channels: m.channels.map(c => ({ ...c, isActive: false, syncState: 'IDLE' as const })),
                auditLog: [
                    { timestamp: now, user: 'Brand Admin', action: 'Archived menu' },
                    ...m.auditLog,
                ],
            };
        });
        set({ menus: updated });
        persistMenus(updated);
    },

    restoreMenu: (id) => {
        const now = new Date().toISOString();
        const updated = get().menus.map(m => {
            if (m.id !== id) return m;
            return {
                ...m,
                publishStatus: 'DRAFT' as MenuPublishStatus,
                isArchived: false,
                isLocked: false,
                auditLog: [
                    { timestamp: now, user: 'Brand Admin', action: 'Restored from archive' },
                    ...m.auditLog,
                ],
            };
        });
        set({ menus: updated });
        persistMenus(updated);
    },

    // ── Sync Operations ──────────────────────────────────────────────────────

    triggerSync: (id) => {
        const now = new Date().toISOString();
        const updated = get().menus.map(m => {
            if (m.id !== id) return m;
            return {
                ...m,
                syncState: 'SYNCING' as MenuSyncState,
                channels: m.channels.map(c => ({ ...c, syncState: 'SYNCING' as const })),
                auditLog: [
                    { timestamp: now, user: 'Brand Admin', action: 'Triggered channel sync' },
                    ...m.auditLog,
                ],
            };
        });
        set({ menus: updated });
        persistMenus(updated);

        // Simulate async
        setTimeout(() => {
            get().markSyncComplete(id, 'SYNCED');
        }, 3000);
    },

    markSyncComplete: (id, state, error) => {
        const now = new Date().toISOString();
        const updated = get().menus.map(m => {
            if (m.id !== id) return m;
            return {
                ...m,
                syncState: state,
                channels: m.channels.map(c => ({
                    ...c,
                    syncState: state,
                    lastSyncedAt: state === 'SYNCED' ? now : c.lastSyncedAt,
                    syncErrorMessage: error || undefined,
                })),
            };
        });
        set({ menus: updated });
        persistMenus(updated);
    },

    // ── Filters ──────────────────────────────────────────────────────────────

    setFilters: (partial) => set(state => ({
        filters: { ...state.filters, ...partial },
    })),

    resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

    // ── Bulk Operations ──────────────────────────────────────────────────────

    toggleMenuSelection: (id) => set(state => {
        const next = new Set(state.selectedMenuIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { selectedMenuIds: next };
    }),

    selectAllMenus: (ids) => set({ selectedMenuIds: new Set(ids) }),

    clearMenuSelection: () => set({ selectedMenuIds: new Set() }),

    executeBulkAction: (action) => {
        const { selectedMenuIds, menus } = get();
        const ids = Array.from(selectedMenuIds);
        if (ids.length === 0) return;

        switch (action) {
            case 'PUBLISH':
                ids.forEach(id => get().publishMenu(id));
                break;
            case 'UNPUBLISH':
                ids.forEach(id => get().unpublishMenu(id));
                break;
            case 'ARCHIVE':
                ids.forEach(id => get().archiveMenu(id));
                break;
            case 'DUPLICATE':
                ids.forEach(id => get().duplicateMenu(id));
                break;
            case 'SYNC':
                ids.forEach(id => get().triggerSync(id));
                break;
        }
        set({ selectedMenuIds: new Set() });
    },

    // ── Error Handling ───────────────────────────────────────────────────────

    clearError: () => set({ error: null }),
}));
