import { create } from 'zustand';

// ─── Operational Filter Types ──────────────────────────────────
export type OperationalStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | 'SYNC_FAILED';
export type CatalogType = 'SINGLE' | 'COMBO' | 'CONFIGURABLE_DEAL' | 'FIXED_COMBO';
export type RuntimeFilter = 
    | 'ASSIGNED_STORES' | 'UNASSIGNED' | 'MISSING_PRICING' 
    | 'MISSING_MODIFIER' | 'STORE_OVERRIDE' | 'CHANNEL_CONFLICT';
export type BusinessFilter = 
    | 'RECENTLY_UPDATED' | 'HIGH_SELLING' | 'LOW_SELLING' 
    | 'MOST_ASSIGNED' | 'INVENTORY_LINKED';
export type ChannelFilter = 'POS' | 'ONLINE' | 'UBER_EATS' | 'DOORDASH';

export type BulkAction = 
    | 'ASSIGN_STORES' | 'ASSIGN_CHANNELS' | 'PUBLISH' | 'UNPUBLISH' 
    | 'DUPLICATE' | 'ARCHIVE' | 'ADD_TAGS' | 'PRICING' | 'DELETE';

export type StoreAssignmentMode = 'REPLACE' | 'MERGE' | 'REMOVE';

export interface FilterPreset {
    id: string;
    name: string;
    filters: FilterState;
}

export interface FilterState {
    searchQuery: string;
    operationalStatuses: OperationalStatus[];
    catalogTypes: CatalogType[];
    runtimeFilters: RuntimeFilter[];
    businessFilters: BusinessFilter[];
    channelFilters: ChannelFilter[];
    categoryIds: string[];
    tags: string[];
}

const EMPTY_FILTERS: FilterState = {
    searchQuery: '',
    operationalStatuses: [],
    catalogTypes: [],
    runtimeFilters: [],
    businessFilters: [],
    channelFilters: [],
    categoryIds: [],
    tags: [],
};

// ─── Store Interface ───────────────────────────────────────────
interface BulkOperationsState {
    // Selection
    selectedIds: Set<string>;
    lastSelectedId: string | null;
    selectionMode: 'NONE' | 'SINGLE' | 'MULTI' | 'PAGE' | 'FILTERED';

    // Filters
    filters: FilterState;
    savedPresets: FilterPreset[];
    isFilterPanelOpen: boolean;

    // Detail Panel
    detailPanelItemId: string | null;
    isDetailPanelOpen: boolean;

    // Bulk Action Modal
    activeBulkAction: BulkAction | null;

    // Actions: Selection
    toggleItemSelection: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clearSelection: () => void;
    selectRange: (ids: string[], targetId: string) => void;
    isSelected: (id: string) => boolean;
    getSelectedCount: () => number;

    // Actions: Filters
    setSearchQuery: (query: string) => void;
    toggleOperationalStatus: (status: OperationalStatus) => void;
    toggleCatalogType: (type: CatalogType) => void;
    toggleRuntimeFilter: (filter: RuntimeFilter) => void;
    toggleBusinessFilter: (filter: BusinessFilter) => void;
    toggleChannelFilter: (channel: ChannelFilter) => void;
    toggleCategoryFilter: (catId: string) => void;
    toggleTagFilter: (tag: string) => void;
    clearAllFilters: () => void;
    applyPreset: (preset: FilterPreset) => void;
    saveCurrentAsPreset: (name: string) => void;
    deletePreset: (id: string) => void;
    toggleFilterPanel: () => void;
    getActiveFilterCount: () => number;

    // Actions: Detail Panel
    openDetailPanel: (itemId: string) => void;
    closeDetailPanel: () => void;

    // Actions: Bulk Operations
    openBulkAction: (action: BulkAction) => void;
    closeBulkAction: () => void;
}

export const useBulkOperationsStore = create<BulkOperationsState>((set, get) => ({
    // Selection state
    selectedIds: new Set<string>(),
    lastSelectedId: null,
    selectionMode: 'NONE',

    // Filter state
    filters: { ...EMPTY_FILTERS },
    savedPresets: loadPresets(),
    isFilterPanelOpen: false,

    // Detail Panel
    detailPanelItemId: null,
    isDetailPanelOpen: false,

    // Bulk Action Modal
    activeBulkAction: null,

    // ─── Selection Actions ─────────────────────────────────────
    toggleItemSelection: (id) => {
        set(state => {
            const next = new Set(state.selectedIds);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return {
                selectedIds: next,
                lastSelectedId: id,
                selectionMode: next.size === 0 ? 'NONE' : next.size === 1 ? 'SINGLE' : 'MULTI',
            };
        });
    },

    selectAll: (ids) => {
        const allSelected = ids.every(id => get().selectedIds.has(id));
        if (allSelected) {
            // Deselect all
            set({ selectedIds: new Set<string>(), selectionMode: 'NONE', lastSelectedId: null });
        } else {
            set({
                selectedIds: new Set(ids),
                selectionMode: ids.length > 0 ? 'PAGE' : 'NONE',
                lastSelectedId: ids[ids.length - 1] || null,
            });
        }
    },

    clearSelection: () => {
        set({ selectedIds: new Set<string>(), selectionMode: 'NONE', lastSelectedId: null });
    },

    selectRange: (ids, targetId) => {
        const { lastSelectedId, selectedIds } = get();
        if (!lastSelectedId) {
            get().toggleItemSelection(targetId);
            return;
        }
        const startIdx = ids.indexOf(lastSelectedId);
        const endIdx = ids.indexOf(targetId);
        if (startIdx === -1 || endIdx === -1) {
            get().toggleItemSelection(targetId);
            return;
        }
        const from = Math.min(startIdx, endIdx);
        const to = Math.max(startIdx, endIdx);
        const next = new Set(selectedIds);
        for (let i = from; i <= to; i++) {
            next.add(ids[i]);
        }
        set({
            selectedIds: next,
            lastSelectedId: targetId,
            selectionMode: next.size > 1 ? 'MULTI' : 'SINGLE',
        });
    },

    isSelected: (id) => get().selectedIds.has(id),

    getSelectedCount: () => get().selectedIds.size,

    // ─── Filter Actions ────────────────────────────────────────
    setSearchQuery: (query) => {
        set(state => ({ filters: { ...state.filters, searchQuery: query } }));
    },

    toggleOperationalStatus: (status) => {
        set(state => {
            const current = state.filters.operationalStatuses;
            const next = current.includes(status) ? current.filter(s => s !== status) : [...current, status];
            return { filters: { ...state.filters, operationalStatuses: next } };
        });
    },

    toggleCatalogType: (type) => {
        set(state => {
            const current = state.filters.catalogTypes;
            const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
            return { filters: { ...state.filters, catalogTypes: next } };
        });
    },

    toggleRuntimeFilter: (filter) => {
        set(state => {
            const current = state.filters.runtimeFilters;
            const next = current.includes(filter) ? current.filter(f => f !== filter) : [...current, filter];
            return { filters: { ...state.filters, runtimeFilters: next } };
        });
    },

    toggleBusinessFilter: (filter) => {
        set(state => {
            const current = state.filters.businessFilters;
            const next = current.includes(filter) ? current.filter(f => f !== filter) : [...current, filter];
            return { filters: { ...state.filters, businessFilters: next } };
        });
    },

    toggleChannelFilter: (channel) => {
        set(state => {
            const current = state.filters.channelFilters;
            const next = current.includes(channel) ? current.filter(c => c !== channel) : [...current, channel];
            return { filters: { ...state.filters, channelFilters: next } };
        });
    },

    toggleCategoryFilter: (catId) => {
        set(state => {
            const current = state.filters.categoryIds;
            const next = current.includes(catId) ? current.filter(c => c !== catId) : [...current, catId];
            return { filters: { ...state.filters, categoryIds: next } };
        });
    },

    toggleTagFilter: (tag) => {
        set(state => {
            const current = state.filters.tags;
            const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
            return { filters: { ...state.filters, tags: next } };
        });
    },

    clearAllFilters: () => {
        set({ filters: { ...EMPTY_FILTERS } });
    },

    applyPreset: (preset) => {
        set({ filters: { ...preset.filters } });
    },

    saveCurrentAsPreset: (name) => {
        const preset: FilterPreset = {
            id: 'preset-' + Date.now(),
            name,
            filters: { ...get().filters },
        };
        const updated = [...get().savedPresets, preset];
        set({ savedPresets: updated });
        persistPresets(updated);
    },

    deletePreset: (id) => {
        const updated = get().savedPresets.filter(p => p.id !== id);
        set({ savedPresets: updated });
        persistPresets(updated);
    },

    toggleFilterPanel: () => {
        set(state => ({ isFilterPanelOpen: !state.isFilterPanelOpen }));
    },

    getActiveFilterCount: () => {
        const f = get().filters;
        let count = 0;
        if (f.searchQuery) count++;
        count += f.operationalStatuses.length;
        count += f.catalogTypes.length;
        count += f.runtimeFilters.length;
        count += f.businessFilters.length;
        count += f.channelFilters.length;
        count += f.categoryIds.length;
        count += f.tags.length;
        return count;
    },

    // ─── Detail Panel Actions ──────────────────────────────────
    openDetailPanel: (itemId) => {
        set({ detailPanelItemId: itemId, isDetailPanelOpen: true });
    },

    closeDetailPanel: () => {
        set({ detailPanelItemId: null, isDetailPanelOpen: false });
    },

    // ─── Bulk Action Actions ───────────────────────────────────
    openBulkAction: (action) => {
        set({ activeBulkAction: action });
    },

    closeBulkAction: () => {
        set({ activeBulkAction: null });
    },
}));

// ─── Preset Persistence ────────────────────────────────────────
function loadPresets(): FilterPreset[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem('zyappy_catalog_filter_presets');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persistPresets(presets: FilterPreset[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('zyappy_catalog_filter_presets', JSON.stringify(presets));
}
