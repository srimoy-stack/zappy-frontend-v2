/**
 * kdsModifierRenderer.ts
 * 
 * Hardened KDS modifier rendering logic.
 * Rules enforced per group_type spec:
 *
 *   PLACEMENT_TOPPING:
 *     - Default placement to FULL if missing
 *     - Never show quantity
 *     - Never infer LEFT/RIGHT automatically
 *
 *   CHOICE_ONE:
 *     - Ensure only a single modifier is selected
 *     - If >1 present in a group, flag as DATA_ERROR
 *
 *   QUANTITY_ONLY:
 *     - Always show quantity number
 *     - Never assign placement
 *
 *   UNKNOWN group_type:
 *     - Log console.error
 *     - Render safely with a fallback badge
 */

import { KDSModifier } from '../types/kds';

export type KnownGroupType = 'PLACEMENT_TOPPING' | 'CHOICE_ONE' | 'QUANTITY_ONLY';

export interface RenderedModifier {
    /** The modifier's display name */
    name: string;
    /** Resolved placement to show (FULL as fallback for PLACEMENT_TOPPING, null for others) */
    resolvedPlacement: 'FULL' | 'LEFT' | 'RIGHT' | 'QUARTER' | null;
    /** Quantity to show (only for QUANTITY_ONLY) */
    resolvedQuantity: number | null;
    /** True when this modifier carries a data integrity issue */
    hasDataError: boolean;
    /** Human-readable error message for the badge */
    dataErrorMessage: string | null;
    /** The normalized group type (unknown coerced to string) */
    groupType: string;
    /** True when group_type is completely unrecognised */
    isUnknownGroupType: boolean;
}

const KNOWN_GROUP_TYPES: KnownGroupType[] = ['PLACEMENT_TOPPING', 'CHOICE_ONE', 'QUANTITY_ONLY'];
const VALID_PLACEMENTS = ['FULL', 'LEFT', 'RIGHT', 'QUARTER'] as const;

function isKnownGroupType(t: string): t is KnownGroupType {
    return KNOWN_GROUP_TYPES.includes(t as KnownGroupType);
}

function isValidPlacement(p?: string): p is 'FULL' | 'LEFT' | 'RIGHT' | 'QUARTER' {
    return VALID_PLACEMENTS.includes(p as 'FULL' | 'LEFT' | 'RIGHT' | 'QUARTER');
}

/**
 * Harden a single modifier and produce a safe-to-render descriptor.
 */
export function resolveModifier(mod: KDSModifier): RenderedModifier {
    const groupType = mod.groupType as string;

    // ─── Defensive: unknown group_type ────────────────────────────────────────
    if (!isKnownGroupType(groupType)) {
        console.error(
            `[KDS] Unknown modifier group_type "${groupType}" on modifier "${mod.name}". ` +
            `Rendering safely without placement or quantity.`
        );
        return {
            name: mod.name,
            resolvedPlacement: null,
            resolvedQuantity: null,
            hasDataError: true,
            dataErrorMessage: `Unknown type: "${groupType}"`,
            groupType,
            isUnknownGroupType: true
        };
    }

    // ─── PLACEMENT_TOPPING ────────────────────────────────────────────────────
    if (groupType === 'PLACEMENT_TOPPING') {
        // Rule: Never infer LEFT/RIGHT automatically.
        // Rule: Default to FULL if placement is missing or unrecognised.
        const placement: 'FULL' | 'LEFT' | 'RIGHT' | 'QUARTER' =
            isValidPlacement(mod.placement) ? mod.placement : 'FULL';

        return {
            name: mod.name,
            resolvedPlacement: placement,
            resolvedQuantity: null,          // Rule: ignore quantity
            hasDataError: false,
            dataErrorMessage: null,
            groupType,
            isUnknownGroupType: false
        };
    }

    // ─── CHOICE_ONE ───────────────────────────────────────────────────────────
    // (The per-modifier data here is fine; multi-choice validation happens at
    //  the group level in resolveModifierGroup below.)
    if (groupType === 'CHOICE_ONE') {
        return {
            name: mod.name,
            resolvedPlacement: null,         // No placement for choices
            resolvedQuantity: null,
            hasDataError: false,
            dataErrorMessage: null,
            groupType,
            isUnknownGroupType: false
        };
    }

    // ─── QUANTITY_ONLY ────────────────────────────────────────────────────────
    // Rule: Always show quantity. Never assign placement.
    if (groupType === 'QUANTITY_ONLY') {
        const qty = typeof mod.quantity === 'number' && mod.quantity > 0 ? mod.quantity : 1;
        return {
            name: mod.name,
            resolvedPlacement: null,         // Rule: never assign placement
            resolvedQuantity: qty,
            hasDataError: false,
            dataErrorMessage: null,
            groupType,
            isUnknownGroupType: false
        };
    }

    // Unreachable due to the guard above, but satisfies TypeScript exhaustive check
    return {
        name: mod.name,
        resolvedPlacement: null,
        resolvedQuantity: null,
        hasDataError: true,
        dataErrorMessage: 'Unhandled group type',
        groupType,
        isUnknownGroupType: false
    };
}

export interface RenderedModifierGroup {
    groupType: string;
    modifiers: RenderedModifier[];
    /** True if CHOICE_ONE has more than one selected modifier — data integrity error */
    multipleChoiceError: boolean;
}

/**
 * Resolve an entire group of modifiers that share the same group_type.
 * Enforces CHOICE_ONE cardinality constraint.
 */
export function resolveModifierGroup(mods: KDSModifier[]): RenderedModifierGroup {
    if (mods.length === 0) {
        return { groupType: '', modifiers: [], multipleChoiceError: false };
    }

    const groupType = mods[0]!.groupType as string;
    const resolved = mods.map(resolveModifier);

    // ─── CHOICE_ONE cardinality check ─────────────────────────────────────────
    const multipleChoiceError = groupType === 'CHOICE_ONE' && mods.length > 1;
    if (multipleChoiceError) {
        console.error(
            `[KDS] CHOICE_ONE group has ${mods.length} modifiers for "${mods.map(m => m.name).join(', ')}". ` +
            `Expected exactly 1. Flagging as data error.`
        );
        // Mark every item in this group as an error so UI can highlight them all
        return {
            groupType,
            modifiers: resolved.map(r => ({
                ...r,
                hasDataError: true,
                dataErrorMessage: `DATA ERROR: ${mods.length} choices selected (expected 1)`
            })),
            multipleChoiceError: true
        };
    }

    return { groupType, modifiers: resolved, multipleChoiceError: false };
}

/**
 * Helper: build grouped modifier descriptors from a flat KDSModifier[] array.
 * Groups consecutive modifiers with the same groupType together so
 * CHOICE_ONE cardinality can be checked per group.
 */
export function resolveAllModifiers(modifiers: KDSModifier[]): RenderedModifier[] {
    if (!modifiers || modifiers.length === 0) return [];

    // Group by consecutive groupType segments
    const segments: KDSModifier[][] = [];
    modifiers.forEach(mod => {
        const last = segments[segments.length - 1];
        // Safely handle the case where 'last' may be undefined (e.g., when segments is empty)
        if (last?.[0]?.groupType === mod.groupType) {
            // 'last' is guaranteed to be an array with at least one element here
            last.push(mod);
        } else {
            segments.push([mod]);
        }
    });

    return segments.flatMap(seg => resolveModifierGroup(seg).modifiers);
}
