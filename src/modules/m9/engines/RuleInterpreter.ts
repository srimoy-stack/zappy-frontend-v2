import { ModifierOption, EquivalencyRule, ModifierGroup } from '../types/items';

export class RuleInterpreter {
    /**
     * Calculates the selection weight of an option based on active rules.
     * For example, a premium topping option like "Paneer" might count as 2.0 regular selections.
     */
    static calculateSelectionWeight(optionId: string, rules?: EquivalencyRule[]): number {
        if (!rules) return 1.0;
        const rule = rules.find(r => r.targetId === optionId && r.impactType === 'SELECTION_COUNT');
        return rule ? rule.multiplier : 1.0;
    }

    /**
     * Evaluates total selection count inside a modifier pool using weight multiplier logic.
     * Ensures that premium items (which count as 2.0 regular) are validated correctly against maxSelection.
     */
    static evaluateSelectionTotals(selectedOptionIds: string[], rules?: EquivalencyRule[]): number {
        let totalWeight = 0;
        selectedOptionIds.forEach(id => {
            totalWeight += this.calculateSelectionWeight(id, rules);
        });
        return totalWeight;
    }

    /**
     * Validates whether the current selection counts comply with the modifier pool bounds.
     */
    static validateModifierGroupSelections(
        selectedOptionIds: string[],
        group: ModifierGroup | { minSelection: number; maxSelection: number },
        rules?: EquivalencyRule[]
    ): { isValid: boolean; currentCount: number; message?: string } {
        const currentCount = this.evaluateSelectionTotals(selectedOptionIds, rules);
        
        if (currentCount < group.minSelection) {
            return {
                isValid: false,
                currentCount,
                message: `Selection count (${currentCount}) is below the minimum required (${group.minSelection})`
            };
        }

        if (currentCount > group.maxSelection) {
            return {
                isValid: false,
                currentCount,
                message: `Selection count (${currentCount}) exceeds the maximum allowed (${group.maxSelection})`
            };
        }

        return { isValid: true, currentCount };
    }

    /**
     * Helper to verify if adding a specific option would violate the maximum selection count constraint.
     */
    static canAddSelection(
        incomingOptionId: string,
        activeOptionIds: string[],
        maxSelection: number,
        rules?: EquivalencyRule[]
    ): boolean {
        const currentWeight = this.evaluateSelectionTotals(activeOptionIds, rules);
        const incomingWeight = this.calculateSelectionWeight(incomingOptionId, rules);
        return currentWeight + incomingWeight <= maxSelection;
    }
}
