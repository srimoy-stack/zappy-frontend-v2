import { create } from 'zustand';
import type {
    Menu, MenuSection, MenuItemOverride, MenuChannelType,
    BuilderDraftSnapshot, PublishReadinessIssue, SectionType,
} from '../types/menu';
import { useMenuStore } from './menuStore';
import { useCatalogStore } from './catalogStore';

// ─── Builder State Interface ─────────────────────────────────────────────────

interface MenuBuilderState {
    // Active menu being edited
    activeMenuId: string | null;
    isOpen: boolean;

    // Draft state (working copy, does NOT modify source until save/publish)
    draftSections: MenuSection[];
    draftItemOverrides: MenuItemOverride[];
    draftName: string;
    draftDescription: string;

    // Undo/Redo
    undoStack: BuilderDraftSnapshot[];
    redoStack: BuilderDraftSnapshot[];
    maxHistorySize: number;

    // UI state
    selectedSectionId: string | null;
    selectedItemId: string | null;
    previewChannel: MenuChannelType;
    leftSidebarCollapsed: boolean;
    rightSidebarCollapsed: boolean;
    isDirty: boolean;
    lastAutoSave: string | null;

    // Validation
    publishIssues: PublishReadinessIssue[];

    // ── Actions
    openBuilder: (menuId: string) => void;
    closeBuilder: () => void;

    // Draft mutations
    setDraftName: (name: string) => void;
    setDraftDescription: (desc: string) => void;
    addSection: (catalogCategoryId: string, sectionType?: SectionType) => void;
    removeSection: (sectionId: string) => void;
    updateSection: (sectionId: string, updates: Partial<MenuSection>) => void;
    reorderSections: (fromIndex: number, toIndex: number) => void;
    selectSection: (sectionId: string | null) => void;
    selectItem: (itemId: string | null) => void;

    // Product operations within sections
    addItemToSection: (sectionId: string, itemId: string) => void;
    removeItemFromSection: (sectionId: string, itemId: string) => void;
    toggleItemVisibility: (sectionId: string, itemId: string) => void;
    toggleItemFeatured: (sectionId: string, itemId: string) => void;
    moveItemBetweenSections: (fromSectionId: string, toSectionId: string, itemId: string) => void;
    reorderItemInSection: (sectionId: string, fromIndex: number, toIndex: number) => void;

    // Item overrides
    setItemOverride: (itemId: string, override: Partial<MenuItemOverride>) => void;
    removeItemOverride: (itemId: string) => void;

    // Undo/Redo
    undo: () => void;
    redo: () => void;
    pushSnapshot: () => void;

    // Preview
    setPreviewChannel: (channel: MenuChannelType) => void;
    toggleLeftSidebar: () => void;
    toggleRightSidebar: () => void;

    // Save/Publish
    saveDraft: () => void;
    validatePublishReadiness: () => PublishReadinessIssue[];

    // Autosave
    autoSave: () => void;
}

// ─── Store Implementation ────────────────────────────────────────────────────

export const useMenuBuilderStore = create<MenuBuilderState>((set, get) => ({
    activeMenuId: null,
    isOpen: false,
    draftSections: [],
    draftItemOverrides: [],
    draftName: '',
    draftDescription: '',
    undoStack: [],
    redoStack: [],
    maxHistorySize: 50,
    selectedSectionId: null,
    selectedItemId: null,
    previewChannel: 'POS',
    leftSidebarCollapsed: false,
    rightSidebarCollapsed: false,
    isDirty: false,
    lastAutoSave: null,
    publishIssues: [],

    openBuilder: (menuId) => {
        const menu = useMenuStore.getState().menus.find(m => m.id === menuId);
        if (!menu) return;

        // Normalize sections — defensive defaults for stale cached data
        const normalizedSections = (menu.sections || []).map(s => ({
            ...s,
            sectionType: s.sectionType || 'STANDARD' as const,
            featuredItemIds: s.featuredItemIds || [],
            includedItemIds: s.includedItemIds || [],
            excludedItemIds: s.excludedItemIds || [],
            description: s.description || '',
        }));

        set({
            activeMenuId: menuId,
            isOpen: true,
            draftSections: JSON.parse(JSON.stringify(normalizedSections)),
            draftItemOverrides: JSON.parse(JSON.stringify(menu.itemOverrides || [])),
            draftName: menu.name,
            draftDescription: menu.description || '',
            undoStack: [],
            redoStack: [],
            selectedSectionId: normalizedSections[0]?.id || null,
            selectedItemId: null,
            previewChannel: menu.primaryChannel,
            isDirty: false,
            lastAutoSave: null,
            publishIssues: [],
        });
    },

    closeBuilder: () => set({
        activeMenuId: null, isOpen: false, draftSections: [], draftItemOverrides: [],
        undoStack: [], redoStack: [], selectedSectionId: null, selectedItemId: null,
        isDirty: false, publishIssues: [],
    }),

    // ── Draft Mutations ──────────────────────────────────────────────────────

    setDraftName: (name) => { get().pushSnapshot(); set({ draftName: name, isDirty: true }); },
    setDraftDescription: (desc) => { get().pushSnapshot(); set({ draftDescription: desc, isDirty: true }); },

    addSection: (catalogCategoryId, sectionType = 'STANDARD') => {
        get().pushSnapshot();
        const categories = useCatalogStore.getState().categories;
        const cat = categories.find(c => c.id === catalogCategoryId);
        const { draftSections } = get();
        const newSection: MenuSection = {
            id: 'sec-' + Date.now(),
            sectionType,
            catalogCategoryId,
            displayName: cat?.name || 'New Section',
            sortOrder: draftSections.length + 1,
            isVisible: true,
            includedItemIds: [],
            excludedItemIds: [],
            featuredItemIds: [],
        };
        set({ draftSections: [...draftSections, newSection], selectedSectionId: newSection.id, isDirty: true });
    },

    removeSection: (sectionId) => {
        get().pushSnapshot();
        const { draftSections, selectedSectionId } = get();
        const updated = draftSections.filter(s => s.id !== sectionId)
            .map((s, i) => ({ ...s, sortOrder: i + 1 }));
        set({
            draftSections: updated, isDirty: true,
            selectedSectionId: selectedSectionId === sectionId ? (updated[0]?.id || null) : selectedSectionId,
        });
    },

    updateSection: (sectionId, updates) => {
        get().pushSnapshot();
        set(state => ({
            draftSections: state.draftSections.map(s => s.id === sectionId ? { ...s, ...updates } : s),
            isDirty: true,
        }));
    },

    reorderSections: (fromIndex, toIndex) => {
        get().pushSnapshot();
        set(state => {
            const arr = [...state.draftSections];
            const [moved] = arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, moved);
            return { draftSections: arr.map((s, i) => ({ ...s, sortOrder: i + 1 })), isDirty: true };
        });
    },

    selectSection: (sectionId) => set({ selectedSectionId: sectionId, selectedItemId: null }),
    selectItem: (itemId) => set({ selectedItemId: itemId }),

    // ── Product Operations ───────────────────────────────────────────────────

    addItemToSection: (sectionId, itemId) => {
        get().pushSnapshot();
        set(state => ({
            draftSections: state.draftSections.map(s => {
                if (s.id !== sectionId) return s;
                if (s.includedItemIds.includes(itemId)) return s;
                return {
                    ...s,
                    includedItemIds: [...s.includedItemIds, itemId],
                    excludedItemIds: s.excludedItemIds.filter(id => id !== itemId),
                };
            }),
            isDirty: true,
        }));
    },

    removeItemFromSection: (sectionId, itemId) => {
        get().pushSnapshot();
        set(state => ({
            draftSections: state.draftSections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    includedItemIds: s.includedItemIds.filter(id => id !== itemId),
                    excludedItemIds: [...s.excludedItemIds, itemId],
                    featuredItemIds: s.featuredItemIds.filter(id => id !== itemId),
                };
            }),
            isDirty: true,
        }));
    },

    toggleItemVisibility: (sectionId, itemId) => {
        get().pushSnapshot();
        set(state => ({
            draftSections: state.draftSections.map(s => {
                if (s.id !== sectionId) return s;
                const isExcluded = s.excludedItemIds.includes(itemId);
                return {
                    ...s,
                    excludedItemIds: isExcluded
                        ? s.excludedItemIds.filter(id => id !== itemId)
                        : [...s.excludedItemIds, itemId],
                };
            }),
            isDirty: true,
        }));
    },

    toggleItemFeatured: (sectionId, itemId) => {
        get().pushSnapshot();
        set(state => ({
            draftSections: state.draftSections.map(s => {
                if (s.id !== sectionId) return s;
                const isFeatured = s.featuredItemIds.includes(itemId);
                return {
                    ...s,
                    featuredItemIds: isFeatured
                        ? s.featuredItemIds.filter(id => id !== itemId)
                        : [...s.featuredItemIds, itemId],
                };
            }),
            isDirty: true,
        }));
    },

    moveItemBetweenSections: (fromSectionId, toSectionId, itemId) => {
        get().pushSnapshot();
        set(state => ({
            draftSections: state.draftSections.map(s => {
                if (s.id === fromSectionId) {
                    return { ...s, includedItemIds: s.includedItemIds.filter(id => id !== itemId) };
                }
                if (s.id === toSectionId) {
                    return { ...s, includedItemIds: [...s.includedItemIds, itemId] };
                }
                return s;
            }),
            isDirty: true,
        }));
    },

    reorderItemInSection: (sectionId, fromIndex, toIndex) => {
        get().pushSnapshot();
        set(state => ({
            draftSections: state.draftSections.map(s => {
                if (s.id !== sectionId) return s;
                const arr = [...s.includedItemIds];
                const [moved] = arr.splice(fromIndex, 1);
                arr.splice(toIndex, 0, moved);
                return { ...s, includedItemIds: arr };
            }),
            isDirty: true,
        }));
    },

    // ── Item Overrides ───────────────────────────────────────────────────────

    setItemOverride: (itemId, override) => {
        get().pushSnapshot();
        set(state => {
            const existing = state.draftItemOverrides.find(o => o.itemId === itemId);
            const updated = existing
                ? state.draftItemOverrides.map(o => o.itemId === itemId ? { ...o, ...override } : o)
                : [...state.draftItemOverrides, { itemId, ...override }];
            return { draftItemOverrides: updated, isDirty: true };
        });
    },

    removeItemOverride: (itemId) => {
        get().pushSnapshot();
        set(state => ({
            draftItemOverrides: state.draftItemOverrides.filter(o => o.itemId !== itemId),
            isDirty: true,
        }));
    },

    // ── Undo/Redo ────────────────────────────────────────────────────────────

    pushSnapshot: () => {
        const { draftSections, draftItemOverrides, undoStack, maxHistorySize } = get();
        const snapshot: BuilderDraftSnapshot = {
            sections: JSON.parse(JSON.stringify(draftSections)),
            itemOverrides: JSON.parse(JSON.stringify(draftItemOverrides)),
            timestamp: new Date().toISOString(),
        };
        const newStack = [...undoStack, snapshot].slice(-maxHistorySize);
        set({ undoStack: newStack, redoStack: [] });
    },

    undo: () => {
        const { undoStack, draftSections, draftItemOverrides } = get();
        if (undoStack.length === 0) return;
        const current: BuilderDraftSnapshot = {
            sections: JSON.parse(JSON.stringify(draftSections)),
            itemOverrides: JSON.parse(JSON.stringify(draftItemOverrides)),
            timestamp: new Date().toISOString(),
        };
        const prev = undoStack[undoStack.length - 1];
        set({
            draftSections: prev.sections,
            draftItemOverrides: prev.itemOverrides,
            undoStack: undoStack.slice(0, -1),
            redoStack: [...get().redoStack, current],
            isDirty: true,
        });
    },

    redo: () => {
        const { redoStack, draftSections, draftItemOverrides } = get();
        if (redoStack.length === 0) return;
        const current: BuilderDraftSnapshot = {
            sections: JSON.parse(JSON.stringify(draftSections)),
            itemOverrides: JSON.parse(JSON.stringify(draftItemOverrides)),
            timestamp: new Date().toISOString(),
        };
        const next = redoStack[redoStack.length - 1];
        set({
            draftSections: next.sections,
            draftItemOverrides: next.itemOverrides,
            redoStack: redoStack.slice(0, -1),
            undoStack: [...get().undoStack, current],
            isDirty: true,
        });
    },

    // ── Preview & UI ─────────────────────────────────────────────────────────

    setPreviewChannel: (channel) => set({ previewChannel: channel }),
    toggleLeftSidebar: () => set(s => ({ leftSidebarCollapsed: !s.leftSidebarCollapsed })),
    toggleRightSidebar: () => set(s => ({ rightSidebarCollapsed: !s.rightSidebarCollapsed })),

    // ── Save & Publish ───────────────────────────────────────────────────────

    saveDraft: () => {
        const { activeMenuId, draftSections, draftItemOverrides, draftName, draftDescription } = get();
        if (!activeMenuId) return;

        const allProductIds = Array.from(new Set(
            draftSections.flatMap(s => s.includedItemIds)
        ));

        useMenuStore.getState().updateMenu(activeMenuId, {
            name: draftName,
            description: draftDescription,
            sections: draftSections,
            itemOverrides: draftItemOverrides,
            productIds: allProductIds,
        });

        set({ isDirty: false, lastAutoSave: new Date().toISOString() });
    },

    validatePublishReadiness: () => {
        const { draftSections, draftName } = get();
        const issues: PublishReadinessIssue[] = [];

        if (!draftName.trim()) {
            issues.push({ severity: 'error', message: 'Menu name is required' });
        }
        if (draftSections.length === 0) {
            issues.push({ severity: 'error', message: 'Menu must have at least one section' });
        }

        const emptySections = draftSections.filter(s => s.includedItemIds.length === 0);
        emptySections.forEach(s => {
            issues.push({ severity: 'warning', message: `Section "${s.displayName}" has no products`, sectionId: s.id });
        });

        const hiddenSections = draftSections.filter(s => !s.isVisible);
        if (hiddenSections.length === draftSections.length && draftSections.length > 0) {
            issues.push({ severity: 'warning', message: 'All sections are hidden — menu will appear empty' });
        }

        set({ publishIssues: issues });
        return issues;
    },

    autoSave: () => {
        const { isDirty } = get();
        if (isDirty) get().saveDraft();
    },
}));
