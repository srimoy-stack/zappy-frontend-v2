import { Item, ItemVariant, ModifierOption } from '../types/items';
import { OverrideResolver } from './OverrideResolver';

export interface PricingRuleConfig {
    id: string;
    name: string;
    scope: 'TENANT' | 'STORE';
    targetType: 'PRODUCT' | 'VARIANT' | 'MODIFIER';
    changeType: 'PERCENTAGE' | 'FIXED' | 'OVERRIDE';
    changeValue: number;
    conditions?: {
        days: string[];
        timeStart: string;
        timeEnd: string;
        channels: string[];
        dateStart?: string;
        dateEnd?: string;
    };
}

export class PricingEngine {
    /**
     * Resolves the base price of an item variant, taking store overrides into account.
     */
    static calculateBasePrice(item: Item, variantId: string, storeId?: string): number {
        // Find the variant
        let variant: ItemVariant | undefined;
        for (const vg of item.variantGroups) {
            variant = vg.variants.find(v => v.id === variantId);
            if (variant) break;
        }

        if (!variant) return 0;

        // If a storeId is provided, resolve value via the OverrideResolver
        if (storeId) {
            return OverrideResolver.resolveValue(item, storeId, `variant_price_${variantId}`, variant.basePrice);
        }

        return variant.basePrice;
    }

    /**
     * Resolves the price of a modifier option, applying option-level overrides if applicable.
     */
    static calculateOptionSurcharge(
        option: ModifierOption,
        item?: Item,
        storeId?: string,
        priceOverrides?: Record<string, number>
    ): number {
        let price = option.price;

        // Apply local attachment level overrides first if present
        if (priceOverrides && priceOverrides[option.id] !== undefined) {
            price = priceOverrides[option.id];
        }

        // Apply store-level override if applicable
        if (item && storeId) {
            price = OverrideResolver.resolveValue(item, storeId, `option_price_${option.id}`, price);
        }

        return price;
    }

    /**
     * Validates if a dynamic pricing rule is applicable under the current runtime environment variables.
     */
    static isRuleActive(
        rule: PricingRuleConfig,
        channel: string,
        currentTime?: string, // e.g. "14:30"
        currentDay?: string,  // e.g. "MON"
        currentDate?: string   // e.g. "2026-05-23"
    ): boolean {
        const conds = rule.conditions;
        if (!conds) return true; // No conditions means rule is always active

        // 1. Channel constraint check
        if (conds.channels && conds.channels.length > 0) {
            if (!conds.channels.includes(channel.toUpperCase())) {
                return false;
            }
        }

        // 2. Date range constraint check
        if (currentDate) {
            if (conds.dateStart && currentDate < conds.dateStart) return false;
            if (conds.dateEnd && currentDate > conds.dateEnd) return false;
        }

        // 3. Weekly schedule day constraint check
        if (currentDay && conds.days && conds.days.length > 0) {
            if (!conds.days.includes(currentDay.toUpperCase())) {
                return false;
            }
        }

        // 4. Time of day constraint check
        if (currentTime && conds.timeStart && conds.timeEnd) {
            if (currentTime < conds.timeStart || currentTime > conds.timeEnd) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluates active pricing rules and applies adjustments to base calculations.
     */
    static applyPricingRules(
        basePrice: number,
        rules: PricingRuleConfig[],
        channel: string,
        currentTime?: string,
        currentDay?: string,
        currentDate?: string
    ): number {
        let finalPrice = basePrice;
        const activeRules = rules
            .filter(rule => this.isRuleActive(rule, channel, currentTime, currentDay, currentDate));

        // Process adjustments sequentially
        activeRules.forEach(rule => {
            if (rule.changeType === 'OVERRIDE') {
                finalPrice = rule.changeValue;
            } else if (rule.changeType === 'FIXED') {
                finalPrice += rule.changeValue;
            } else if (rule.changeType === 'PERCENTAGE') {
                finalPrice += basePrice * (rule.changeValue / 100);
            }
        });

        // Price cannot drop below zero
        return Math.max(0, finalPrice);
    }

    /**
     * Top-level calculation resolving full item costs (base variant + sycharges + rules).
     */
    static calculateTotalPrice(
        item: Item,
        config: {
            variantIds: string[];
            selectedModifiers: { option: ModifierOption; priceOverrides?: Record<string, number> }[];
            storeId?: string;
            channel?: string;
            currentTime?: string;
            currentDay?: string;
            currentDate?: string;
            pricingRules?: PricingRuleConfig[];
        }
    ): number {
        // 1. Resolve sum of variants base prices
        let baseSum = 0;
        config.variantIds.forEach(vid => {
            baseSum += this.calculateBasePrice(item, vid, config.storeId);
        });

        // 2. Resolve modifier option surcharges
        let modifiersSum = 0;
        config.selectedModifiers.forEach(m => {
            modifiersSum += this.calculateOptionSurcharge(m.option, item, config.storeId, m.priceOverrides);
        });

        const rawPriceSum = baseSum + modifiersSum;

        // 3. Apply active Dynamic Pricing Rules if supplied
        if (config.pricingRules && config.pricingRules.length > 0 && config.channel) {
            return this.applyPricingRules(
                rawPriceSum,
                config.pricingRules,
                config.channel,
                config.currentTime,
                config.currentDay,
                config.currentDate
            );
        }

        return rawPriceSum;
    }
}
