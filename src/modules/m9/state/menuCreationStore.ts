import { create } from 'zustand';
import type {
    Menu, MenuSection, MenuItemOverride, MenuChannelType,
    MenuDaySchedule, MenuSchedule, MenuStoreAssignment,
    MenuChannelAssignment, SectionType, MenuPublishStatus
} from '../types/menu';
import { useMenuStore } from './menuStore';
import { useCatalogStore } from './catalogStore';

export type CreationStep =
    | 'BASIC_DETAILS'
    | 'CATEGORY_COMPOSITION'
    | 'PLACEMENT_CONFIG'
    | 'STORE_DEPLOYMENT'
    | 'CHANNEL_MATRIX'
    | 'SCHEDULING'
    | 'DEPLOYMENT_SUMMARY';

export interface CreationScheduleOverride {
    storeId?: string;
    channelType?: MenuChannelType;
    schedule: MenuSchedule;
}

export interface StoreChannelMatrixEntry {
    storeId: string;
    channels: Record<MenuChannelType, boolean>;
}

export interface MenuCreationFormData {
    name: string;
    description: string;
    primaryChannel: MenuChannelType;
    publishStatus: MenuPublishStatus;
    tags: string[];
    isDefault: boolean;

    // Support Contact Details
    supportEmail: string;
    supportPhone: string;
    supportPhoneCountry: 'US' | 'CA';

    // References and metadata
    selectedCategoryIds: string[];
    categorySections: Record<string, {
        sectionType: SectionType;
        displayName: string;
        description: string;
        isVisible: boolean;
        includedItemIds: string[];
        excludedItemIds: string[];
        featuredItemIds: string[];
    }>;

    // Store assignment
    storeScope: 'ALL_STORES' | 'SPECIFIC_STORES';
    selectedStoreIds: string[];
    regionFilter: string;

    // Channel Matrix
    storeChannelMatrix: Record<string, Record<MenuChannelType, boolean>>; // StoreId -> ChannelType -> Enabled

    // Schedules
    globalSchedule: MenuSchedule;
    storeSchedules: Record<string, MenuSchedule>; // StoreId -> MenuSchedule
    scheduleOverrides: CreationScheduleOverride[]; // overrides per store/channel
}

interface MenuCreationState {
    isOpen: boolean;
    currentStep: CreationStep;
    formData: MenuCreationFormData;
    isDirty: boolean;
    editMenuId: string | null;

    // Preview Drawer
    previewTarget: { type: 'category' | 'item'; id: string } | null;

    // Actions
    openWizard: () => void;
    openWizardForEdit: (menu: Menu) => void;
    closeWizard: () => void;
    setStep: (step: CreationStep) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Form updates
    updateForm: (updates: Partial<MenuCreationFormData>) => void;
    setCategorySelected: (categoryId: string, selected: boolean) => void;
    updateSectionConfig: (categoryId: string, updates: Partial<MenuCreationFormData['categorySections'][string]>) => void;
    setItemSelected: (categoryId: string, itemId: string, selected: boolean) => void;
    toggleItemFeatured: (categoryId: string, itemId: string) => void;
    toggleItemVisibility: (categoryId: string, itemId: string) => void;

    // Store/Channel Overrides
    setStoreChannelMatrix: (storeId: string, channel: MenuChannelType, enabled: boolean) => void;
    bulkApplyChannels: (channel: MenuChannelType, enabled: boolean) => void;

    // Schedules
    setGlobalSchedule: (updates: Partial<MenuSchedule>) => void;
    setStoreSchedule: (storeId: string, updates: Partial<MenuSchedule>) => void;
    applyStoreScheduleToAll: (sourceStoreId: string) => void;
    addScheduleOverride: (override: CreationScheduleOverride) => void;
    removeScheduleOverride: (index: number) => void;

    // Preview
    setPreviewTarget: (target: { type: 'category' | 'item'; id: string } | null) => void;

    // Save
    submitMenu: () => void;
}

const DEFAULT_SCHEDULE = (): MenuSchedule => ({
    isAlwaysActive: true,
    activeDays: [
        { day: 'MON', startTime: '09:00', endTime: '22:00', isActive: true },
        { day: 'TUE', startTime: '09:00', endTime: '22:00', isActive: true },
        { day: 'WED', startTime: '09:00', endTime: '22:00', isActive: true },
        { day: 'THU', startTime: '09:00', endTime: '22:00', isActive: true },
        { day: 'FRI', startTime: '09:00', endTime: '23:00', isActive: true },
        { day: 'SAT', startTime: '09:00', endTime: '23:00', isActive: true },
        { day: 'SUN', startTime: '09:00', endTime: '22:00', isActive: true },
    ]
});

const INITIAL_FORM_DATA = (): MenuCreationFormData => ({
    name: '',
    description: '',
    primaryChannel: 'POS',
    publishStatus: 'DRAFT',
    tags: [],
    isDefault: false,
    supportEmail: '',
    supportPhone: '',
    supportPhoneCountry: 'CA', // Default to Canada as required
    selectedCategoryIds: [],
    categorySections: {},
    storeScope: 'ALL_STORES',
    selectedStoreIds: [],
    regionFilter: 'ALL',
    storeChannelMatrix: {},
    globalSchedule: DEFAULT_SCHEDULE(),
    storeSchedules: {},
    scheduleOverrides: []
});

export const useMenuCreationStore = create<MenuCreationState>((set, get) => ({
    isOpen: false,
    currentStep: 'BASIC_DETAILS',
    formData: INITIAL_FORM_DATA(),
    isDirty: false,
    previewTarget: null,
    editMenuId: null,

    openWizard: () => {
        set({
            isOpen: true,
            currentStep: 'BASIC_DETAILS',
            formData: INITIAL_FORM_DATA(),
            isDirty: false,
            editMenuId: null,
            previewTarget: null
        });
    },

    openWizardForEdit: (menu) => {
        const categorySections: Record<string, any> = {};
        menu.sections.forEach(sec => {
            categorySections[sec.catalogCategoryId] = {
                sectionType: sec.sectionType || 'STANDARD',
                displayName: sec.displayName || '',
                description: sec.description || '',
                isVisible: sec.isVisible !== false,
                includedItemIds: sec.includedItemIds || [],
                excludedItemIds: sec.excludedItemIds || [],
                featuredItemIds: sec.featuredItemIds || []
            };
        });

        const storeScope = menu.storeAssignment.scope === 'ALL_STORES' ? 'ALL_STORES' : 'SPECIFIC_STORES';
        const selectedStoreIds = menu.storeAssignment.targetStoreIds || [];

        // Try parsing menu's metadata if present or default
        const supportEmail = (menu as any).supportEmail || '';
        const supportPhone = (menu as any).supportPhone || '';
        const supportPhoneCountry = (menu as any).supportPhoneCountry || 'CA';

        set({
            isOpen: true,
            currentStep: 'BASIC_DETAILS',
            editMenuId: menu.id,
            isDirty: false,
            previewTarget: null,
            formData: {
                name: menu.name,
                description: menu.description || '',
                primaryChannel: menu.primaryChannel,
                publishStatus: menu.publishStatus || 'DRAFT',
                tags: [],
                isDefault: menu.isDefault || false,
                supportEmail,
                supportPhone,
                supportPhoneCountry,
                selectedCategoryIds: menu.sections.map(s => s.catalogCategoryId),
                categorySections,
                storeScope,
                selectedStoreIds,
                regionFilter: 'ALL',
                storeChannelMatrix: menu.storeChannelMatrix || {},
                globalSchedule: menu.schedule || DEFAULT_SCHEDULE(),
                storeSchedules: menu.storeSchedules || {},
                scheduleOverrides: []
            }
        });
    },

    closeWizard: () => {
        set({ isOpen: false, editMenuId: null });
    },

    setStep: (step) => {
        set({ currentStep: step });
    },

    nextStep: () => {
        const steps: CreationStep[] = [
            'BASIC_DETAILS',
            'CATEGORY_COMPOSITION',
            'PLACEMENT_CONFIG',
            'STORE_DEPLOYMENT',
            'CHANNEL_MATRIX',
            'SCHEDULING',
            'DEPLOYMENT_SUMMARY'
        ];
        const idx = steps.indexOf(get().currentStep);
        if (idx < steps.length - 1) {
            set({ currentStep: steps[idx + 1] });
        }
    },

    prevStep: () => {
        const steps: CreationStep[] = [
            'BASIC_DETAILS',
            'CATEGORY_COMPOSITION',
            'PLACEMENT_CONFIG',
            'STORE_DEPLOYMENT',
            'CHANNEL_MATRIX',
            'SCHEDULING',
            'DEPLOYMENT_SUMMARY'
        ];
        const idx = steps.indexOf(get().currentStep);
        if (idx > 0) {
            set({ currentStep: steps[idx - 1] });
        }
    },

    updateForm: (updates) => {
        set(state => ({
            formData: { ...state.formData, ...updates },
            isDirty: true
        }));
    },

    setCategorySelected: (categoryId, selected) => {
        const { categories, items } = useCatalogStore.getState();
        const cat = categories.find(c => c.id === categoryId);

        set(state => {
            const selectedCategoryIds = selected
                ? [...state.formData.selectedCategoryIds, categoryId]
                : state.formData.selectedCategoryIds.filter(id => id !== categoryId);

            const categorySections = { ...state.formData.categorySections };
            if (selected && !categorySections[categoryId]) {
                // Initialize default section configuration for this category reference
                const catItems = items.filter(item => item.categoryId === categoryId).map(i => i.id);
                categorySections[categoryId] = {
                    sectionType: 'STANDARD',
                    displayName: cat?.name || 'Untitled Section',
                    description: cat?.description || '',
                    isVisible: true,
                    includedItemIds: catItems,
                    excludedItemIds: [],
                    featuredItemIds: []
                };
            } else if (!selected) {
                delete categorySections[categoryId];
            }

            return {
                formData: {
                    ...state.formData,
                    selectedCategoryIds,
                    categorySections
                },
                isDirty: true
            };
        });
    },

    updateSectionConfig: (categoryId, updates) => {
        set(state => {
            const current = state.formData.categorySections[categoryId];
            if (!current) return state;

            return {
                formData: {
                    ...state.formData,
                    categorySections: {
                        ...state.formData.categorySections,
                        [categoryId]: { ...current, ...updates }
                    }
                },
                isDirty: true
            };
        });
    },

    setItemSelected: (categoryId, itemId, selected) => {
        set(state => {
            const sec = state.formData.categorySections[categoryId];
            if (!sec) return state;

            const includedItemIds = selected
                ? [...sec.includedItemIds, itemId]
                : sec.includedItemIds.filter(id => id !== itemId);

            const excludedItemIds = selected
                ? sec.excludedItemIds.filter(id => id !== itemId)
                : [...sec.excludedItemIds, itemId];

            // Clean up featured item if we deselect
            const featuredItemIds = selected
                ? sec.featuredItemIds
                : sec.featuredItemIds.filter(id => id !== itemId);

            return {
                formData: {
                    ...state.formData,
                    categorySections: {
                        ...state.formData.categorySections,
                        [categoryId]: {
                            ...sec,
                            includedItemIds,
                            excludedItemIds,
                            featuredItemIds
                        }
                    }
                },
                isDirty: true
            };
        });
    },

    toggleItemFeatured: (categoryId, itemId) => {
        set(state => {
            const sec = state.formData.categorySections[categoryId];
            if (!sec) return state;

            const isFeatured = sec.featuredItemIds.includes(itemId);
            const featuredItemIds = isFeatured
                ? sec.featuredItemIds.filter(id => id !== itemId)
                : [...sec.featuredItemIds, itemId];

            return {
                formData: {
                    ...state.formData,
                    categorySections: {
                        ...state.formData.categorySections,
                        [categoryId]: { ...sec, featuredItemIds }
                    }
                },
                isDirty: true
            };
        });
    },

    toggleItemVisibility: (categoryId, itemId) => {
        set(state => {
            const sec = state.formData.categorySections[categoryId];
            if (!sec) return state;

            const isExcluded = sec.excludedItemIds.includes(itemId);
            const excludedItemIds = isExcluded
                ? sec.excludedItemIds.filter(id => id !== itemId)
                : [...sec.excludedItemIds, itemId];

            return {
                formData: {
                    ...state.formData,
                    categorySections: {
                        ...state.formData.categorySections,
                        [categoryId]: { ...sec, excludedItemIds }
                    }
                },
                isDirty: true
            };
        });
    },

    setStoreChannelMatrix: (storeId, channel, enabled) => {
        set(state => {
            const currentMatrix = state.formData.storeChannelMatrix[storeId] || {
                POS: false, ONLINE: false, UBER_EATS: false, DOORDASH: false, KIOSK: false, CATERING: false, CUSTOM: false
            };

            return {
                formData: {
                    ...state.formData,
                    storeChannelMatrix: {
                        ...state.formData.storeChannelMatrix,
                        [storeId]: {
                            ...currentMatrix,
                            [channel]: enabled
                        }
                    }
                },
                isDirty: true
            };
        });
    },

    bulkApplyChannels: (channel, enabled) => {
        set(state => {
            const stores = state.formData.selectedStoreIds;
            const updatedMatrix = { ...state.formData.storeChannelMatrix };

            stores.forEach(storeId => {
                const currentMatrix = updatedMatrix[storeId] || {
                    POS: false, ONLINE: false, UBER_EATS: false, DOORDASH: false, KIOSK: false, CATERING: false, CUSTOM: false
                };
                updatedMatrix[storeId] = {
                    ...currentMatrix,
                    [channel]: enabled
                };
            });

            return {
                formData: {
                    ...state.formData,
                    storeChannelMatrix: updatedMatrix
                },
                isDirty: true
            };
        });
    },

    setGlobalSchedule: (updates) => {
        set(state => ({
            formData: {
                ...state.formData,
                globalSchedule: { ...state.formData.globalSchedule, ...updates }
            },
            isDirty: true
        }));
    },

    setStoreSchedule: (storeId, updates) => {
        set(state => {
            const current = state.formData.storeSchedules[storeId] || DEFAULT_SCHEDULE();
            return {
                formData: {
                    ...state.formData,
                    storeSchedules: {
                        ...state.formData.storeSchedules,
                        [storeId]: { ...current, ...updates }
                    }
                },
                isDirty: true
            };
        });
    },

    applyStoreScheduleToAll: (scheduleKey) => {
        set(state => {
            const [sourceStoreId, channelId] = scheduleKey.split(':');
            const sourceSchedule = state.formData.storeSchedules[scheduleKey] || DEFAULT_SCHEDULE();
            const storeSchedules = { ...state.formData.storeSchedules };

            state.formData.selectedStoreIds.forEach(sid => {
                const targetKey = `${sid}:${channelId}`;
                storeSchedules[targetKey] = JSON.parse(JSON.stringify(sourceSchedule));
            });

            return {
                formData: {
                    ...state.formData,
                    storeSchedules
                },
                isDirty: true
            };
        });
    },

    addScheduleOverride: (override) => {
        set(state => ({
            formData: {
                ...state.formData,
                scheduleOverrides: [...state.formData.scheduleOverrides, override]
            },
            isDirty: true
        }));
    },

    removeScheduleOverride: (index) => {
        set(state => ({
            formData: {
                ...state.formData,
                scheduleOverrides: state.formData.scheduleOverrides.filter((_, i) => i !== index)
            },
            isDirty: true
        }));
    },

    setPreviewTarget: (target) => {
        set({ previewTarget: target });
    },

    submitMenu: () => {
        const { formData, editMenuId } = get();
        const now = new Date().toISOString();

        // Map section records
        const sections: MenuSection[] = formData.selectedCategoryIds.map((catId, index) => {
            const secConfig = formData.categorySections[catId];
            return {
                id: 'sec-' + Date.now() + '-' + index,
                sectionType: secConfig.sectionType || 'STANDARD',
                catalogCategoryId: catId,
                displayName: secConfig.displayName,
                description: secConfig.description,
                sortOrder: index + 1,
                isVisible: secConfig.isVisible,
                includedItemIds: secConfig.includedItemIds,
                excludedItemIds: secConfig.excludedItemIds,
                featuredItemIds: secConfig.featuredItemIds
            };
        });

        // Collect all distinct product IDs included across all sections
        const productIds = Array.from(new Set(
            sections.flatMap(s => s.includedItemIds)
        ));

        // Format store assignments
        const storeAssignment: MenuStoreAssignment = {
            scope: formData.storeScope,
            targetStoreIds: formData.selectedStoreIds
        };

        // Format channels configurations
        const activeChannels = new Set<MenuChannelType>();
        Object.values(formData.storeChannelMatrix).forEach(channelsMap => {
            Object.entries(channelsMap).forEach(([ch, enabled]) => {
                if (enabled) activeChannels.add(ch as MenuChannelType);
            });
        });

        const channels: MenuChannelAssignment[] = Array.from(activeChannels).map(ch => ({
            channelType: ch,
            isActive: true,
            syncState: 'IDLE'
        }));

        if (editMenuId) {
            useMenuStore.getState().updateMenu(editMenuId, {
                name: formData.name,
                description: formData.description,
                primaryChannel: formData.primaryChannel,
                publishStatus: formData.publishStatus,
                channels,
                storeAssignment,
                sections,
                productIds,
                schedule: formData.globalSchedule,
                storeSchedules: formData.storeSchedules,
                storeChannelMatrix: formData.storeChannelMatrix,
                isDefault: formData.isDefault,
                isLocked: false,
                isArchived: false
            });
        } else {
            useMenuStore.getState().createMenu({
                name: formData.name,
                description: formData.description,
                primaryChannel: formData.primaryChannel,
                publishStatus: formData.publishStatus,
                syncState: 'IDLE',
                channels,
                storeAssignment,
                sections,
                productIds,
                itemOverrides: [],
                schedule: formData.globalSchedule,
                storeSchedules: formData.storeSchedules,
                storeChannelMatrix: formData.storeChannelMatrix,
                isDefault: formData.isDefault,
                isLocked: false,
                isArchived: false
            });
        }

        set({ isOpen: false, isDirty: false, editMenuId: null });
    }
}));
