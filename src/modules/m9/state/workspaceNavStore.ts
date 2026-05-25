import { create } from 'zustand';

export type WorkspacePanel = 
    | 'ITEMS' 
    | 'POOLS' 
    | 'VARIANT_GROUPS'
    | 'MODIFIER_GROUPS'
    | 'ADDON_GROUPS'
    | 'RULES'
    | 'PUBLISH' 
    | 'OVERRIDES' 
    | 'SYNC' 
    | 'RECOVERY' 
    | 'AUDIT';

interface WorkspaceNavState {
    activePanel: WorkspacePanel;
    searchQuery: string;
    filterCategoryId: string | null;
    isRightPanelOpen: boolean;
    rightPanelContent: 'DRAFTS' | 'TELEMETRY' | 'HISTORY' | null;
    
    // Override workspace selections
    selectedOverrideStoreId: string | null;

    // Actions
    setActivePanel: (panel: WorkspacePanel) => void;
    setSearchQuery: (query: string) => void;
    setFilterCategoryId: (catId: string | null) => void;
    toggleRightPanel: (isOpen?: boolean) => void;
    setRightPanelContent: (content: 'DRAFTS' | 'TELEMETRY' | 'HISTORY' | null) => void;
    setSelectedOverrideStore: (storeId: string | null) => void;
    resetFilters: () => void;
}

export const useWorkspaceNavStore = create<WorkspaceNavState>((set) => ({
    activePanel: 'ITEMS',
    searchQuery: '',
    filterCategoryId: null,
    isRightPanelOpen: true,
    rightPanelContent: 'DRAFTS',
    selectedOverrideStoreId: null,

    setActivePanel: (panel) => set(state => {
        // Automatically adjust right context panel depending on active view
        let rightContent = state.rightPanelContent;
        if (panel === 'SYNC') rightContent = 'TELEMETRY';
        else if (panel === 'PUBLISH') rightContent = 'HISTORY';
        else if (panel === 'ITEMS') rightContent = 'DRAFTS';
        
        return { 
            activePanel: panel,
            rightPanelContent: rightContent,
            isRightPanelOpen: ['ITEMS', 'PUBLISH', 'SYNC'].includes(panel)
        };
    }),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterCategoryId: (catId) => set({ filterCategoryId: catId }),
    toggleRightPanel: (isOpen) => set(state => ({ 
        isRightPanelOpen: isOpen !== undefined ? isOpen : !state.isRightPanelOpen 
    })),
    setRightPanelContent: (content) => set({ rightPanelContent: content, isRightPanelOpen: content !== null }),
    setSelectedOverrideStore: (storeId) => set({ selectedOverrideStoreId: storeId }),
    resetFilters: () => set({ searchQuery: '', filterCategoryId: null })
}));
