import { create } from 'zustand';

// ─── Rule Types from Requirement Doc ─────────────────────────

export type RuleType =
    | 'TOPPING_EQUIVALENCY'
    | 'FREE_TOPPING_ALLOWANCE'
    | 'MAXIMUM_TOPPING'
    | 'HALF_AND_HALF'
    | 'PREMIUM_HALF_SIDE'
    | 'NO_LEFT_RIGHT'
    | 'MUST_BUY_WITH';

export type RulePriority =
    | 'STORE_OVERRIDE'
    | 'CHANNEL'
    | 'DEAL_COMBO'
    | 'PRODUCT'
    | 'MODIFIER_GROUP'
    | 'GLOBAL_BRAND';

export type RuleStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export type CountMethod = 'PER_PIZZA' | 'SHARED_ACROSS_DEAL';

export type SameToppingMergeLogic = 'COUNT_AS_ONE' | 'COUNT_INDIVIDUALLY';

export interface Rule {
    id: string;
    name: string;
    type: RuleType;
    status: RuleStatus;
    priority: RulePriority;
    appliesTo: string[]; // product/deal/combo/modifier IDs
    storeOverrideAllowed: boolean;
    createdAt: string;

    // Type-specific fields
    // TOPPING_EQUIVALENCY
    premiumMultiplier?: number;

    // FREE_TOPPING_ALLOWANCE
    includedToppings?: number;
    countMethod?: CountMethod;
    extraToppingChargeMethod?: 'FIXED' | 'PER_TOPPING';
    extraToppingCharge?: number;
    maxToppingsAllowed?: number;
    blockCheckoutIfExceeded?: boolean;

    // MAXIMUM_TOPPING
    maxRegularEquivalentUnits?: number;
    maxPhysicalToppings?: number;
    applyPremiumMultiplier?: boolean;
    managerOverrideAllowed?: boolean;

    // HALF_AND_HALF
    allowFull?: boolean;
    allowLeftRight?: boolean;
    allowQuarter?: boolean;
    halfCountsAs?: number;
    sameToppingMergeLogic?: SameToppingMergeLogic;

    // MUST_BUY_WITH
    requiredProductType?: string;
    requiredCategory?: string;
    requiredProduct?: string;
    minimumQuantity?: number;
    applyToChannels?: string[];
}

// ─── Rule Type Metadata ──────────────────────────────────────

export const RULE_TYPE_META: Record<RuleType, { name: string; emoji: string; description: string; color: string }> = {
    TOPPING_EQUIVALENCY: { name: 'Topping Equivalency', emoji: '⚖️', description: 'Premium topping = N regular toppings', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    FREE_TOPPING_ALLOWANCE: { name: 'Free Topping Allowance', emoji: '🎁', description: 'Include N free toppings, charge after', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    MAXIMUM_TOPPING: { name: 'Maximum Topping', emoji: '🚫', description: 'Cap the max toppings allowed', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    HALF_AND_HALF: { name: 'Half & Half', emoji: '🍕', description: 'Left/right, quarter pizza rules', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    PREMIUM_HALF_SIDE: { name: 'Premium Half-Side', emoji: '💎', description: 'Premium topping pricing on halves', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    NO_LEFT_RIGHT: { name: 'No Left/Right', emoji: '🔒', description: 'Disable half-half for specific deals', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    MUST_BUY_WITH: { name: 'Must Buy With', emoji: '🔗', description: 'Require another product in cart', color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

export const PRIORITY_ORDER: RulePriority[] = [
    'STORE_OVERRIDE', 'CHANNEL', 'DEAL_COMBO', 'PRODUCT', 'MODIFIER_GROUP', 'GLOBAL_BRAND'
];

// ─── Store ───────────────────────────────────────────────────

interface RulesStoreState {
    rules: Rule[];
    addRule: (rule: Rule) => void;
    updateRule: (id: string, updates: Partial<Rule>) => void;
    deleteRule: (id: string) => void;
    duplicateRule: (id: string) => void;
}

const STORAGE_KEY = 'zyappy_rules_library';

const loadRules = (): Rule[] => {
    if (typeof window === 'undefined') return getDefaultRules();
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached);
    } catch {}
    return getDefaultRules();
};

const persistRules = (rules: Rule[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    }
};

function getDefaultRules(): Rule[] {
    return [
        {
            id: 'rule-teq-1', name: 'Standard Topping Equivalency', type: 'TOPPING_EQUIVALENCY',
            status: 'ACTIVE', priority: 'GLOBAL_BRAND', appliesTo: [], storeOverrideAllowed: true,
            createdAt: new Date().toISOString(), premiumMultiplier: 2,
        },
        {
            id: 'rule-fta-1', name: '3 Free Toppings Deal', type: 'FREE_TOPPING_ALLOWANCE',
            status: 'ACTIVE', priority: 'DEAL_COMBO', appliesTo: [], storeOverrideAllowed: false,
            createdAt: new Date().toISOString(), includedToppings: 3, countMethod: 'PER_PIZZA',
            extraToppingChargeMethod: 'PER_TOPPING', extraToppingCharge: 1.50,
            maxToppingsAllowed: 8, blockCheckoutIfExceeded: false,
        },
        {
            id: 'rule-max-1', name: 'Max 5 Toppings', type: 'MAXIMUM_TOPPING',
            status: 'ACTIVE', priority: 'PRODUCT', appliesTo: [], storeOverrideAllowed: true,
            createdAt: new Date().toISOString(), maxRegularEquivalentUnits: 10,
            maxPhysicalToppings: 5, applyPremiumMultiplier: true, managerOverrideAllowed: true,
        },
        {
            id: 'rule-hh-1', name: 'Standard Half & Half', type: 'HALF_AND_HALF',
            status: 'ACTIVE', priority: 'GLOBAL_BRAND', appliesTo: [], storeOverrideAllowed: true,
            createdAt: new Date().toISOString(), allowFull: true, allowLeftRight: true,
            allowQuarter: false, halfCountsAs: 0.5, sameToppingMergeLogic: 'COUNT_AS_ONE',
        },
        {
            id: 'rule-mbw-1', name: 'Dip Requires Pizza', type: 'MUST_BUY_WITH',
            status: 'ACTIVE', priority: 'PRODUCT', appliesTo: [], storeOverrideAllowed: false,
            createdAt: new Date().toISOString(), requiredCategory: 'Pizza',
            minimumQuantity: 1, applyToChannels: ['POS', 'ONLINE'],
        },
    ];
}

export const useRulesStore = create<RulesStoreState>((set, get) => ({
    rules: loadRules(),

    addRule: (rule) => {
        const updated = [...get().rules, rule];
        set({ rules: updated });
        persistRules(updated);
    },

    updateRule: (id, updates) => {
        const updated = get().rules.map(r => r.id === id ? { ...r, ...updates } : r);
        set({ rules: updated });
        persistRules(updated);
    },

    deleteRule: (id) => {
        const updated = get().rules.filter(r => r.id !== id);
        set({ rules: updated });
        persistRules(updated);
    },

    duplicateRule: (id) => {
        const src = get().rules.find(r => r.id === id);
        if (!src) return;
        const dup: Rule = { ...src, id: 'rule-' + Date.now(), name: src.name + ' (Copy)', status: 'DRAFT', createdAt: new Date().toISOString() };
        const updated = [...get().rules, dup];
        set({ rules: updated });
        persistRules(updated);
    },
}));
