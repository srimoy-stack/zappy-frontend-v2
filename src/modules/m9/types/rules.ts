/**
 * Rules Library Types
 * Implements spec Sections 10-11: Attachable, reusable business rules
 * that can be linked to products, deals, combos, modifier groups, stores, or channels.
 */

export type RuleType =
    | 'TOPPING_EQUIVALENCY'
    | 'FREE_TOPPING_ALLOWANCE'
    | 'MAXIMUM_TOPPING'
    | 'HALF_AND_HALF'
    | 'PREMIUM_HALF_SIDE'
    | 'NO_LEFT_RIGHT'
    | 'MUST_BUY_WITH';

export type RuleTargetType =
    | 'PRODUCT'
    | 'DEAL'
    | 'COMBO'
    | 'MODIFIER_GROUP'
    | 'MODIFIER_OPTION'
    | 'STORE_OVERRIDE'
    | 'CHANNEL_OVERRIDE';

export type RuleStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export type CountMethod = 'PER_PIZZA' | 'SHARED_ACROSS_DEAL';

// ─── Individual Rule Configs ────────────────────────────────

export interface ToppingEquivalencyConfig {
    premiumMultiplier: number;      // e.g., 2.0 → premium counts as 2 regular
    appliesToModifierGroupIds: string[];
    storeOverrideAllowed: boolean;
}

export interface FreeToppingAllowanceConfig {
    includedToppings: number;       // e.g., 3 free toppings
    countMethod: CountMethod;
    extraToppingChargeMethod: 'FLAT' | 'PER_ITEM' | 'PERCENTAGE';
    extraToppingChargeValue: number;
    maxToppingsAllowed: number;
    blockCheckoutIfExceeded: boolean;
}

export interface MaximumToppingConfig {
    maxRegularEquivalentUnits: number;
    maxPhysicalToppings: number;
    applyPremiumMultiplier: boolean;
    managerOverrideAllowed: boolean;
}

export interface HalfAndHalfConfig {
    allowFull: boolean;
    allowLeftRight: boolean;
    allowQuarter: boolean;
    halfCountsAs: number;           // e.g., 0.5
    sameToppingMergeLogic: 'COUNT_AS_ONE' | 'COUNT_AS_TWO';
}

export interface PremiumHalfSideConfig {
    premiumFullUnits: number;       // e.g., 2
    premiumHalfUnits: number;       // e.g., 1
    samePremiumBothSidesUnits: number; // e.g., 2 (NOT 4)
    differentPremiumBothSidesUnits: number; // e.g., 2
}

export interface NoLeftRightConfig {
    allowFull: boolean;
    allowLeftRight: boolean;
    allowQuarter: boolean;
}

export interface MustBuyWithConfig {
    requiredProductType?: string;
    requiredCategoryId?: string;
    requiredProductId?: string;
    minimumQuantity: number;
    applyToChannels: string[];      // Empty = all channels
}

// ─── Unified Rule Type ──────────────────────────────────────

export type RuleConfig =
    | { type: 'TOPPING_EQUIVALENCY'; config: ToppingEquivalencyConfig }
    | { type: 'FREE_TOPPING_ALLOWANCE'; config: FreeToppingAllowanceConfig }
    | { type: 'MAXIMUM_TOPPING'; config: MaximumToppingConfig }
    | { type: 'HALF_AND_HALF'; config: HalfAndHalfConfig }
    | { type: 'PREMIUM_HALF_SIDE'; config: PremiumHalfSideConfig }
    | { type: 'NO_LEFT_RIGHT'; config: NoLeftRightConfig }
    | { type: 'MUST_BUY_WITH'; config: MustBuyWithConfig };

export interface Rule {
    id: string;
    name: string;
    description?: string;
    ruleType: RuleType;
    config: RuleConfig;
    status: RuleStatus;
    createdAt: string;
    updatedAt: string;
}

// ─── Rule Attachment ────────────────────────────────────────

export interface RuleAttachment {
    ruleId: string;
    targetType: RuleTargetType;
    targetId: string;
    priority: number;               // Lower = higher priority (spec §12)
    isActive: boolean;
}
