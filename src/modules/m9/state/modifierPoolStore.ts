import { create } from 'zustand';
import { ModifierPool, ModifierOption } from '../types/items';
import { mockItems } from '../mock/items';

interface ModifierPoolState {
    pools: ModifierPool[];
    isLoading: boolean;

    // Actions
    setPools: (pools: ModifierPool[]) => void;
    createPool: (poolData: Partial<ModifierPool>) => ModifierPool;
    updatePool: (id: string, updates: Partial<ModifierPool>) => void;
    deletePool: (id: string) => void;

    // Option modifications inside pools
    addOptionToPool: (poolId: string, option: ModifierOption) => void;
    updateOptionInPool: (poolId: string, optionId: string, updates: Partial<ModifierOption>) => void;
    removeOptionFromPool: (poolId: string, optionId: string) => void;
}

export const useModifierPoolStore = create<ModifierPoolState>((set, get) => {
    // Generate initial shared modifier pools by extracting modifierGroups from veggie supreme seed mock data
    const getInitialPools = (): ModifierPool[] => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('zyappy_shared_modifier_pools');
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (e) {
                    console.error('Failed to parse cached modifier pools:', e);
                }
            }
        }

        // Gather pools from mockItems modifierGroups
        const extractedPools: ModifierPool[] = [];
        mockItems.forEach(item => {
            if (item.modifierGroups) {
                item.modifierGroups.forEach(mg => {
                    if (!extractedPools.some(p => p.id === mg.id)) {
                        extractedPools.push({
                            id: mg.id,
                            name: mg.name,
                            isToppingGroup: mg.isToppingGroup,
                            isHalfAndHalfEnabled: mg.isHalfAndHalfEnabled,
                            isPremiumRuleEnabled: mg.isPremiumRuleEnabled,
                            options: mg.options || []
                        });
                    }
                });
            }
        });

        // Add an extra global pool if empty
        if (extractedPools.length === 0) {
            extractedPools.push({
                id: 'pool-beverages',
                name: 'Beverage Sizes',
                isToppingGroup: false,
                isHalfAndHalfEnabled: false,
                isPremiumRuleEnabled: false,
                options: [
                    { id: 'bev-opt-sm', name: 'Regular size', price: 0 },
                    { id: 'bev-opt-lg', name: 'Large Size (+ $1.00)', price: 1.00 }
                ]
            });
        }

        return extractedPools;
    };

    const persistPools = (pools: ModifierPool[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('zyappy_shared_modifier_pools', JSON.stringify(pools));
        }
    };

    return {
        pools: getInitialPools(),
        isLoading: false,

        setPools: (pools) => {
            set({ pools });
            persistPools(pools);
        },

        createPool: (poolData) => {
            const newPool: ModifierPool = {
                id: 'pool-' + Date.now(),
                name: poolData.name || 'New Shared Modifier Pool',
                isToppingGroup: poolData.isToppingGroup !== undefined ? poolData.isToppingGroup : false,
                isHalfAndHalfEnabled: poolData.isHalfAndHalfEnabled !== undefined ? poolData.isHalfAndHalfEnabled : false,
                isPremiumRuleEnabled: poolData.isPremiumRuleEnabled !== undefined ? poolData.isPremiumRuleEnabled : false,
                options: poolData.options || []
            };

            const updatedPools = [...get().pools, newPool];
            set({ pools: updatedPools });
            persistPools(updatedPools);
            return newPool;
        },

        updatePool: (id, updates) => {
            const updatedPools = get().pools.map(p => (p.id === id ? { ...p, ...updates } : p));
            set({ pools: updatedPools });
            persistPools(updatedPools);
        },

        deletePool: (id) => {
            const updatedPools = get().pools.filter(p => p.id !== id);
            set({ pools: updatedPools });
            persistPools(updatedPools);
        },

        addOptionToPool: (poolId, option) => {
            const updatedPools = get().pools.map(p => {
                if (p.id === poolId) {
                    return {
                        ...p,
                        options: [...p.options, option]
                    };
                }
                return p;
            });
            set({ pools: updatedPools });
            persistPools(updatedPools);
        },

        updateOptionInPool: (poolId, optionId, updates) => {
            const updatedPools = get().pools.map(p => {
                if (p.id === poolId) {
                    return {
                        ...p,
                        options: p.options.map(o => (o.id === optionId ? { ...o, ...updates } : o))
                    };
                }
                return p;
            });
            set({ pools: updatedPools });
            persistPools(updatedPools);
        },

        removeOptionFromPool: (poolId, optionId) => {
            const updatedPools = get().pools.map(p => {
                if (p.id === poolId) {
                    return {
                        ...p,
                        options: p.options.filter(o => o.id !== optionId)
                    };
                }
                return p;
            });
            set({ pools: updatedPools });
            persistPools(updatedPools);
        }
    };
});
