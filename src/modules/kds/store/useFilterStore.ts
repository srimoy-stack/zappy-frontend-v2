import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FulfillmentType, OrderSource, KitchenStage } from '../types/kds';

export type FulfillmentFilter = FulfillmentType | 'ALL';
export type SourceFilter = OrderSource | 'ALL';
export type KDSViewMode = 'KANBAN' | 'GRID' | 'COMPACT' | 'SUMMARY' | 'ALL_DAY' | 'ROUTING' | 'SOUND_SETTINGS';
export type StageFilter = KitchenStage | 'ALL' | 'DELAYED';

interface FilterState {
    fulfillment: FulfillmentFilter;
    source: SourceFilter;
    viewMode: KDSViewMode;
    stage: StageFilter;
    showRecentlyFulfilled: boolean;
    isSidebarOpen: boolean;
    currentPage: number;
    setFulfillment: (filter: FulfillmentFilter) => void;
    setSource: (filter: SourceFilter) => void;
    setStage: (stage: StageFilter) => void;
    setViewMode: (mode: KDSViewMode) => void;
    setShowRecentlyFulfilled: (show: boolean) => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setCurrentPage: (page: number) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
    persist(
        (set) => ({
            fulfillment: 'ALL',
            source: 'ALL',
            viewMode: 'KANBAN',
            stage: 'ALL',
            showRecentlyFulfilled: true,
            isSidebarOpen: false,
            currentPage: 0,
            setFulfillment: (fulfillment) => set({ fulfillment, currentPage: 0 }),
            setSource: (source) => set({ source, currentPage: 0 }),
            setStage: (stage) => set({ stage, currentPage: 0 }),
            setViewMode: (viewMode) => set({ viewMode, currentPage: 0 }),
            setShowRecentlyFulfilled: (showRecentlyFulfilled) => set({ showRecentlyFulfilled }),
            setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
            setCurrentPage: (currentPage) => set({ currentPage }),
            resetFilters: () => set({
                fulfillment: 'ALL',
                source: 'ALL',
                viewMode: 'KANBAN',
                stage: 'ALL',
                showRecentlyFulfilled: true,
                isSidebarOpen: false,
                currentPage: 0
            }),
        }),
        {
            name: 'kds-filter-settings',
        }
    )
);
