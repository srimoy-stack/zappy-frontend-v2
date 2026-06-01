import { create } from 'zustand';
import {
    VARIANT_TEMPLATES, MODIFIER_TEMPLATES, ADDON_TEMPLATES,
    VariantTemplate, ModifierTemplate, AddonTemplate
} from '../mock/templates';

interface TemplateStoreState {
    variantTemplates: VariantTemplate[];
    modifierTemplates: ModifierTemplate[];
    addonTemplates: AddonTemplate[];

    // Variant Template Actions
    addVariantTemplate: (tpl: VariantTemplate) => void;
    updateVariantTemplate: (id: string, updates: Partial<VariantTemplate>) => void;
    deleteVariantTemplate: (id: string) => void;

    // Modifier Template Actions
    addModifierTemplate: (tpl: ModifierTemplate) => void;
    updateModifierTemplate: (id: string, updates: Partial<ModifierTemplate>) => void;
    deleteModifierTemplate: (id: string) => void;

    // Addon Template Actions
    addAddonTemplate: (tpl: AddonTemplate) => void;
    updateAddonTemplate: (id: string, updates: Partial<AddonTemplate>) => void;
    deleteAddonTemplate: (id: string) => void;
}

const STORAGE_KEY = 'zyappy_template_store';

const loadFromStorage = (): Partial<TemplateStoreState> | null => {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached);
    } catch {}
    return null;
};

const persist = (state: Pick<TemplateStoreState, 'variantTemplates' | 'modifierTemplates' | 'addonTemplates'>) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            variantTemplates: state.variantTemplates,
            modifierTemplates: state.modifierTemplates,
            addonTemplates: state.addonTemplates,
        }));
    }
};

export const useTemplateStore = create<TemplateStoreState>((set, get) => {
    const cached = loadFromStorage();

    return {
        variantTemplates: cached?.variantTemplates || [...VARIANT_TEMPLATES],
        modifierTemplates: cached?.modifierTemplates || [...MODIFIER_TEMPLATES],
        addonTemplates: cached?.addonTemplates || [...ADDON_TEMPLATES],

        // Variant
        addVariantTemplate: (tpl) => {
            const updated = [...get().variantTemplates, tpl];
            set({ variantTemplates: updated });
            persist({ ...get(), variantTemplates: updated });
        },
        updateVariantTemplate: (id, updates) => {
            const updated = get().variantTemplates.map(t => t.id === id ? { ...t, ...updates } : t);
            set({ variantTemplates: updated });
            persist({ ...get(), variantTemplates: updated });
        },
        deleteVariantTemplate: (id) => {
            const updated = get().variantTemplates.filter(t => t.id !== id);
            set({ variantTemplates: updated });
            persist({ ...get(), variantTemplates: updated });
        },

        // Modifier
        addModifierTemplate: (tpl) => {
            const updated = [...get().modifierTemplates, tpl];
            set({ modifierTemplates: updated });
            persist({ ...get(), modifierTemplates: updated });
        },
        updateModifierTemplate: (id, updates) => {
            const updated = get().modifierTemplates.map(t => t.id === id ? { ...t, ...updates } : t);
            set({ modifierTemplates: updated });
            persist({ ...get(), modifierTemplates: updated });
        },
        deleteModifierTemplate: (id) => {
            const updated = get().modifierTemplates.filter(t => t.id !== id);
            set({ modifierTemplates: updated });
            persist({ ...get(), modifierTemplates: updated });
        },

        // Addon
        addAddonTemplate: (tpl) => {
            const updated = [...get().addonTemplates, tpl];
            set({ addonTemplates: updated });
            persist({ ...get(), addonTemplates: updated });
        },
        updateAddonTemplate: (id, updates) => {
            const updated = get().addonTemplates.map(t => t.id === id ? { ...t, ...updates } : t);
            set({ addonTemplates: updated });
            persist({ ...get(), addonTemplates: updated });
        },
        deleteAddonTemplate: (id) => {
            const updated = get().addonTemplates.filter(t => t.id !== id);
            set({ addonTemplates: updated });
            persist({ ...get(), addonTemplates: updated });
        },
    };
});
