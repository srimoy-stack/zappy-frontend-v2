import { Item } from '../../types/items';
import { OverrideResolver } from '../OverrideResolver';
import { RuleInterpreter } from '../RuleInterpreter';
import { PricingEngine, PricingRuleConfig } from '../PricingEngine';

// Mock Item for testing
const testItem: Item = {
    id: 'test-pizza-1',
    productType: 'SINGLE',
    name: 'Gourmet Cheese Pizza',
    description: 'Fresh mozzarella with tomato sauce',
    categoryId: 'cat-pizza',
    isAvailable: true,
    taxRate: 5.0,
    storeOverrides: [],
    storeOverridesResolver: [
        {
            storeId: 'store-chicago',
            itemId: 'test-pizza-1',
            overrides: {
                price: 14.99,
                isAvailable: false,
                overriddenFields: ['price', 'isAvailable']
            }
        }
    ],
    variantGroups: [
        {
            id: 'vg-size',
            name: 'Size',
            isRequired: true,
            defaultVariantId: 'v-med',
            sortOrder: 1,
            variants: [
                { id: 'v-sm', name: 'Small', basePrice: 9.99, isAvailable: true },
                { id: 'v-med', name: 'Medium', basePrice: 12.99, isAvailable: true },
                { id: 'v-lg', name: 'Large', basePrice: 15.99, isAvailable: true }
            ]
        }
    ],
    modifierGroups: [],
    equivalencyRules: [
        {
            id: 'eq-paneer',
            name: 'Paneer Equivalency',
            targetId: 'opt-paneer',
            multiplier: 2.0,
            impactType: 'SELECTION_COUNT'
        }
    ]
};

// Reusable mock modifier options
const optOnion = { id: 'opt-onion', name: 'Onions', price: 0.99 };
const optPaneer = { id: 'opt-paneer', name: 'Paneer (Premium)', price: 2.50, isPremium: true };
const optMushroom = { id: 'opt-mushroom', name: 'Mushrooms', price: 1.25 };

export function runSuite() {
    console.log('==================================================');
    console.log('RUNNING ZYAPPY MENU ENGINES VERIFICATION SUITE');
    console.log('==================================================\n');

    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, testName: string) => {
        if (condition) {
            console.log(`[PASS] ${testName}`);
            passed++;
        } else {
            console.error(`[FAIL] ${testName}`);
            failed++;
        }
    };

    // ─── OVERRIDE RESOLVER TESTS ──────────────────────────────────────────────
    try {
        // Test: isFieldOverridden
        assert(OverrideResolver.isFieldOverridden(testItem, 'store-chicago', 'price') === true, 'OverrideResolver: Detects overridden price field');
        assert(OverrideResolver.isFieldOverridden(testItem, 'store-chicago', 'isAvailable') === true, 'OverrideResolver: Detects overridden availability field');
        assert(OverrideResolver.isFieldOverridden(testItem, 'store-chicago', 'taxRate') === false, 'OverrideResolver: Detects non-overridden tax rate field');
        assert(OverrideResolver.isFieldOverridden(testItem, 'store-newyork', 'price') === false, 'OverrideResolver: Detects non-overridden store price field');

        // Test: resolveValue
        const resolvedPrice = OverrideResolver.resolveValue(testItem, 'store-chicago', 'price', 12.99);
        assert(resolvedPrice === 14.99, `OverrideResolver: Resolves overridden price ($14.99 === ${resolvedPrice})`);

        const inheritedPrice = OverrideResolver.resolveValue(testItem, 'store-newyork', 'price', 12.99);
        assert(inheritedPrice === 12.99, `OverrideResolver: Resolves inherited master price ($12.99 === ${inheritedPrice})`);

        // Test: applyOverride
        let updatedItem = OverrideResolver.applyOverride(testItem, 'store-newyork', 'price', 18.50);
        assert(OverrideResolver.isFieldOverridden(updatedItem, 'store-newyork', 'price') === true, 'OverrideResolver: Correctly applies new price override');
        assert(OverrideResolver.resolveValue(updatedItem, 'store-newyork', 'price', 12.99) === 18.50, 'OverrideResolver: Resolves newly overridden value');

        // Test: removeOverride
        updatedItem = OverrideResolver.removeOverride(updatedItem, 'store-newyork', 'price');
        assert(OverrideResolver.isFieldOverridden(updatedItem, 'store-newyork', 'price') === false, 'OverrideResolver: Correctly removes price override');
        assert(OverrideResolver.resolveValue(updatedItem, 'store-newyork', 'price', 12.99) === 12.99, 'OverrideResolver: Reverts back to inherited master price');
    } catch (e: any) {
        console.error('Error during OverrideResolver suite:', e);
        failed++;
    }

    // ─── RULE INTERPRETER TESTS ───────────────────────────────────────────────
    try {
        // Test: Selection Weights
        const weightNormal = RuleInterpreter.calculateSelectionWeight('opt-onion', testItem.equivalencyRules);
        const weightPremium = RuleInterpreter.calculateSelectionWeight('opt-paneer', testItem.equivalencyRules);
        assert(weightNormal === 1.0, `RuleInterpreter: Normal option has weight 1.0 (${weightNormal})`);
        assert(weightPremium === 2.0, `RuleInterpreter: Premium option has weight 2.0 (${weightPremium})`);

        // Test: evaluateSelectionTotals
        const selectionList = ['opt-onion', 'opt-paneer', 'opt-mushroom'];
        const totalWeight = RuleInterpreter.evaluateSelectionTotals(selectionList, testItem.equivalencyRules);
        assert(totalWeight === 4.0, `RuleInterpreter: Evaluates total weights correctly (4.0 === ${totalWeight})`);

        // Test: canAddSelection limits
        const canAddNormal = RuleInterpreter.canAddSelection('opt-mushroom', ['opt-onion', 'opt-paneer'], 4, testItem.equivalencyRules);
        const canAddPremium = RuleInterpreter.canAddSelection('opt-paneer', ['opt-onion', 'opt-paneer'], 4, testItem.equivalencyRules);
        
        assert(canAddNormal === true, 'RuleInterpreter: Normal topping fits within maximum selection limits');
        assert(canAddPremium === false, 'RuleInterpreter: Premium topping rejected due to selection count limits');
    } catch (e: any) {
        console.error('Error during RuleInterpreter suite:', e);
        failed++;
    }

    // ─── PRICING ENGINE TESTS ──────────────────────────────────────────────────
    try {
        // Test: calculateBasePrice
        const masterPrice = PricingEngine.calculateBasePrice(testItem, 'v-med');
        assert(masterPrice === 12.99, `PricingEngine: Resolves correct master base price ($12.99 === ${masterPrice})`);

        // Test: calculateOptionSurcharge
        const normalSurcharge = PricingEngine.calculateOptionSurcharge(optOnion);
        const overrideSurcharge = PricingEngine.calculateOptionSurcharge(optOnion, undefined, undefined, { 'opt-onion': 1.50 });
        assert(normalSurcharge === 0.99, `PricingEngine: Resolves standard option surcharge ($0.99 === ${normalSurcharge})`);
        assert(overrideSurcharge === 1.50, `PricingEngine: Resolves localized option surcharge override ($1.50 === ${overrideSurcharge})`);

        // Test: Pricing Rules
        const mockRules: PricingRuleConfig[] = [
            {
                id: 'rule-happy-hour',
                name: 'HAPPY HOUR',
                scope: 'TENANT',
                targetType: 'PRODUCT',
                changeType: 'PERCENTAGE',
                changeValue: -20.0, // 20% Off
                conditions: {
                    days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
                    timeStart: '14:00',
                    timeEnd: '17:00',
                    channels: ['POS', 'ONLINE']
                }
            }
        ];

        // Validating Active Rules constraints
        const activeMon = PricingEngine.isRuleActive(mockRules[0], 'ONLINE', '15:30', 'MON');
        const inactiveSun = PricingEngine.isRuleActive(mockRules[0], 'ONLINE', '15:30', 'SUN');
        const inactiveLate = PricingEngine.isRuleActive(mockRules[0], 'ONLINE', '19:30', 'MON');
        const inactiveChannel = PricingEngine.isRuleActive(mockRules[0], 'DELIVERY', '15:30', 'MON');

        assert(activeMon === true, 'PricingEngine: Identifies active rule under valid schedule conditions');
        assert(inactiveSun === false, 'PricingEngine: Rejects rule under invalid weekly schedule day');
        assert(inactiveLate === false, 'PricingEngine: Rejects rule outside active time slots');
        assert(inactiveChannel === false, 'PricingEngine: Rejects rule for non-matching order channels');

        // Test Total Prices
        const finalPrice = PricingEngine.calculateTotalPrice(testItem, {
            variantIds: ['v-med'],
            selectedModifiers: [
                { option: optOnion },
                { option: optPaneer }
            ],
            pricingRules: mockRules,
            channel: 'ONLINE',
            currentTime: '15:30',
            currentDay: 'MON'
        });

        // Calculations: Base 12.99 + onion 0.99 + paneer 2.50 = 16.48. 20% discount = 13.18
        assert(Math.abs(finalPrice - 13.18) < 0.05, `PricingEngine: Dynamic total matches expected happy-hour rule output ($13.18 === ${finalPrice})`);
    } catch (e: any) {
        console.error('Error during PricingEngine suite:', e);
        failed++;
    }

    console.log('\n==================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
        throw new Error(`${failed} tests failed!`);
    }
}
