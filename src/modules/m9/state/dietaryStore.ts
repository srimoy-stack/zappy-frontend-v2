import { create } from 'zustand';

export interface DietaryInfo {
    id: string;
    name: string;
    emoji: string;
    description: string;
    key: string;
}

interface DietaryStoreState {
    dietaryItems: DietaryInfo[];
    addDietaryItem: (item: DietaryInfo) => void;
    updateDietaryItem: (id: string, updates: Partial<DietaryInfo>) => void;
    deleteDietaryItem: (id: string) => void;
}

const STORAGE_KEY = 'zyappy_dietary_store';

const DEFAULT_DIETARY_ITEMS: DietaryInfo[] = [
    { id: 'diet-1', name: 'Vegetarian', emoji: '🥬', description: 'Suitable for vegetarians. Contains no meat, poultry, or seafood.', key: 'VEGETARIAN' },
    { id: 'diet-2', name: 'Vegan', emoji: '🌱', description: 'Contains no animal products or by-products.', key: 'VEGAN' },
    { id: 'diet-3', name: 'Gluten Free', emoji: '🌾', description: 'Formulated without wheat, barley, rye, or gluten proteins.', key: 'GLUTEN_FREE' },
    { id: 'diet-4', name: 'Halal', emoji: '☪', description: 'Prepared in accordance with Islamic dietary laws.', key: 'HALAL' },
    { id: 'diet-5', name: 'Contains Nuts', emoji: '🥜', description: 'This item contains peanuts or tree nuts.', key: 'CONTAINS_NUTS' },
    { id: 'diet-6', name: 'Dairy Free', emoji: '🥛', description: 'Contains no milk, lactose, or other dairy derivatives.', key: 'DAIRY_FREE' },
    { id: 'diet-7', name: 'Keto Friendly', emoji: '🥑', description: 'High fat, adequate protein, low carbohydrate profile.', key: 'KETO_FRIENDLY' },
    { id: 'diet-8', name: 'Organic', emoji: '🍃', description: 'Produced using organic farming practices.', key: 'ORGANIC' },
];

const loadFromStorage = (): DietaryInfo[] | null => {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached);
    } catch {}
    return null;
};

const persist = (items: DietaryInfo[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
};

export const useDietaryStore = create<DietaryStoreState>((set, get) => {
    const cached = loadFromStorage();
    return {
        dietaryItems: cached || [...DEFAULT_DIETARY_ITEMS],
        addDietaryItem: (item) => {
            const updated = [...get().dietaryItems, item];
            set({ dietaryItems: updated });
            persist(updated);
        },
        updateDietaryItem: (id, updates) => {
            const updated = get().dietaryItems.map(item => item.id === id ? { ...item, ...updates } : item);
            set({ dietaryItems: updated });
            persist(updated);
        },
        deleteDietaryItem: (id) => {
            const updated = get().dietaryItems.filter(item => item.id !== id);
            set({ dietaryItems: updated });
            persist(updated);
        }
    };
});
