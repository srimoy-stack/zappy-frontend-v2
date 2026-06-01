import { z } from 'zod';
import type { CreationStep, MenuCreationFormData } from '../state/menuCreationStore';

// ============================================================================
// REGEX PATTERNS – Production-grade input sanitization
// ============================================================================

/** Menu name: letters, numbers, spaces, hyphens, apostrophes, ampersands – no scripts/emojis */
const SAFE_NAME_REGEX = /^[a-zA-Z0-9\s\-'&.,()]+$/;

/** Tag value: alphanumeric + hyphens, no spaces, no specials */
const SAFE_TAG_REGEX = /^[a-zA-Z0-9\-_]+$/;

/** Description: general text, allow common punctuation, block <script> injections */
const SCRIPT_INJECTION_REGEX = /<script|javascript:|on\w+\s*=/i;

/** Section display name: letters, numbers, spaces, hyphens, ampersands */
const SECTION_NAME_REGEX = /^[a-zA-Z0-9\s\-'&.,()]+$/;

// ============================================================================
// STEP 1: BASIC DETAILS SCHEMA
// ============================================================================

const US_CA_PHONE_REGEX = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

export const basicDetailsSchema = z.object({
    name: z
        .string()
        .min(3, 'Menu name must be at least 3 characters')
        .max(80, 'Menu name cannot exceed 80 characters')
        .regex(SAFE_NAME_REGEX, 'Menu name contains invalid characters. Use letters, numbers, spaces, hyphens, and apostrophes only.')
        .refine(val => !SCRIPT_INJECTION_REGEX.test(val), 'Menu name contains prohibited content'),

    description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .refine(val => !val || !SCRIPT_INJECTION_REGEX.test(val), 'Description contains prohibited content')
        .optional()
        .or(z.literal('')),

    primaryChannel: z
        .enum(['POS', 'ONLINE', 'UBER_EATS', 'DOORDASH', 'KIOSK', 'CATERING', 'CUSTOM']),

    supportEmail: z
        .string()
        .min(1, 'Support contact email is required')
        .email('Invalid email address format (e.g. support@example.com)')
        .refine(val => !SCRIPT_INJECTION_REGEX.test(val), 'Prohibited characters detected in email'),

    supportPhone: z
        .string()
        .min(1, 'Support contact phone number is required')
        .regex(US_CA_PHONE_REGEX, 'Invalid phone number format. Must be a valid 10-digit number (e.g. 555-555-5555).'),

    supportPhoneCountry: z
        .enum(['US', 'CA']),

    tags: z
        .array(
            z.string()
                .min(2, 'Tag must be at least 2 characters')
                .max(30, 'Tag cannot exceed 30 characters')
                .regex(SAFE_TAG_REGEX, 'Tags can only contain letters, numbers, hyphens, and underscores')
        )
        .max(10, 'You can add a maximum of 10 tags'),
});

// ============================================================================
// STEP 2: CATEGORY COMPOSITION SCHEMA
// ============================================================================

export const categoryCompositionSchema = z.object({
    selectedCategoryIds: z
        .array(z.string())
        .min(1, 'Select at least one category to include in your menu'),

    categorySections: z.record(z.string(), z.object({
        sectionType: z.enum(['STANDARD', 'FEATURED', 'PROMO', 'HIDDEN']),
        displayName: z
            .string()
            .min(2, 'Section display name must be at least 2 characters')
            .max(60, 'Section display name cannot exceed 60 characters')
            .regex(SECTION_NAME_REGEX, 'Section name contains invalid characters'),
        description: z
            .string()
            .max(300, 'Section description cannot exceed 300 characters')
            .refine(val => !val || !SCRIPT_INJECTION_REGEX.test(val), 'Section description contains prohibited content')
            .optional()
            .or(z.literal('')),
        isVisible: z.boolean(),
        includedItemIds: z.array(z.string()).min(1, 'Each category must include at least one product'),
        excludedItemIds: z.array(z.string()),
        featuredItemIds: z.array(z.string()),
    })).refine(
        sections => Object.keys(sections).length > 0,
        'At least one category section must be configured'
    ),
});

// ============================================================================
// STEP 3: PLACEMENT CONFIG – no strict validation, arrangement only
// ============================================================================

export const placementConfigSchema = z.object({
    selectedCategoryIds: z
        .array(z.string())
        .min(1, 'Categories must be configured before adjusting placement'),
});

// ============================================================================
// STEP 4: STORE DEPLOYMENT SCHEMA
// ============================================================================

export const storeDeploymentSchema = z.object({
    storeScope: z.enum(['ALL_STORES', 'SPECIFIC_STORES']),
    selectedStoreIds: z.array(z.string()),
}).refine(
    data => data.storeScope === 'ALL_STORES' || data.selectedStoreIds.length > 0,
    {
        message: 'Select at least one store when using targeted deployment',
        path: ['selectedStoreIds'],
    }
);

// ============================================================================
// STEP 5: CHANNEL MATRIX SCHEMA
// ============================================================================

export const channelMatrixSchema = z.object({
    storeChannelMatrix: z.record(z.string(), z.record(z.string(), z.boolean())),
    selectedStoreIds: z.array(z.string()),
    storeScope: z.enum(['ALL_STORES', 'SPECIFIC_STORES']),
}).refine(
    data => {
        // For ALL_STORES, we don't require channel matrix to be filled
        if (data.storeScope === 'ALL_STORES') return true;
        // For specific stores, at least one store must have at least one channel enabled
        const storeIds = data.selectedStoreIds;
        return storeIds.some(storeId => {
            const channels = data.storeChannelMatrix[storeId];
            if (!channels) return false;
            return Object.values(channels).some(v => v === true);
        });
    },
    {
        message: 'At least one channel must be activated for your targeted stores',
        path: ['storeChannelMatrix'],
    }
);

// ============================================================================
// STEP 6: SCHEDULING SCHEMA
// ============================================================================

const dayScheduleSchema = z.object({
    day: z.string(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    isActive: z.boolean(),
}).refine(
    data => {
        if (!data.isActive) return true;
        return data.startTime < data.endTime;
    },
    {
        message: 'End time must be after start time',
        path: ['endTime'],
    }
);

export const schedulingSchema = z.object({
    globalSchedule: z.object({
        isAlwaysActive: z.boolean(),
        activeDays: z.array(dayScheduleSchema),
    }).refine(
        data => {
            if (data.isAlwaysActive) return true;
            return data.activeDays.some(d => d.isActive);
        },
        {
            message: 'At least one active day must be enabled when not using 24/7 mode',
            path: ['activeDays'],
        }
    ),
});

// ============================================================================
// STEP-LEVEL VALIDATION ENGINE
// ============================================================================

export interface StepValidationResult {
    isValid: boolean;
    errors: Record<string, string>; // field path -> error message
    firstError: string | null;
}

/**
 * Validates the form data for a specific step.
 * Returns a structured result with field-level errors.
 */
export function validateStep(step: CreationStep, formData: MenuCreationFormData): StepValidationResult {
    let schema: z.ZodType<any>;

    switch (step) {
        case 'BASIC_DETAILS':
            schema = basicDetailsSchema;
            break;
        case 'CATEGORY_COMPOSITION':
            schema = categoryCompositionSchema;
            break;
        case 'PLACEMENT_CONFIG':
            schema = placementConfigSchema;
            break;
        case 'STORE_DEPLOYMENT':
            schema = storeDeploymentSchema;
            break;
        case 'CHANNEL_MATRIX':
            schema = channelMatrixSchema;
            break;
        case 'SCHEDULING':
            schema = schedulingSchema;
            break;
        case 'DEPLOYMENT_SUMMARY':
            return { isValid: true, errors: {}, firstError: null };
        default:
            return { isValid: true, errors: {}, firstError: null };
    }

    const result = schema.safeParse(formData);

    if (result.success) {
        return { isValid: true, errors: {}, firstError: null };
    }

    const errors: Record<string, string> = {};
    let firstError: string | null = null;

    result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        const key = path || '_root';
        if (!errors[key]) {
            errors[key] = issue.message;
        }
        if (!firstError) {
            firstError = issue.message;
        }
    });

    return { isValid: false, errors, firstError };
}

/**
 * Validates a single tag value in real-time before adding
 */
export function validateTag(tag: string, existingTags: string[]): string | null {
    if (tag.length < 2) return 'Tag must be at least 2 characters';
    if (tag.length > 30) return 'Tag cannot exceed 30 characters';
    if (!SAFE_TAG_REGEX.test(tag)) return 'Tags can only contain letters, numbers, hyphens, and underscores';
    if (existingTags.includes(tag)) return 'This tag already exists';
    if (existingTags.length >= 10) return 'Maximum of 10 tags allowed';
    return null;
}

/**
 * Validates a menu name in real-time for inline feedback
 */
export function validateMenuName(name: string): string | null {
    if (!name.trim()) return 'Menu name is required';
    if (name.trim().length < 3) return 'Menu name must be at least 3 characters';
    if (name.length > 80) return 'Menu name cannot exceed 80 characters';
    if (!SAFE_NAME_REGEX.test(name)) return 'Menu name contains invalid characters';
    if (SCRIPT_INJECTION_REGEX.test(name)) return 'Menu name contains prohibited content';
    return null;
}

/**
 * Validates a section display name in real-time
 */
export function validateSectionName(name: string): string | null {
    if (!name.trim()) return 'Section name is required';
    if (name.trim().length < 2) return 'Section name must be at least 2 characters';
    if (name.length > 60) return 'Section name cannot exceed 60 characters';
    if (!SECTION_NAME_REGEX.test(name)) return 'Section name contains invalid characters';
    return null;
}

/**
 * Validates description text in real-time
 */
export function validateDescription(text: string, maxLen: number = 500): string | null {
    if (text.length > maxLen) return `Description cannot exceed ${maxLen} characters`;
    if (SCRIPT_INJECTION_REGEX.test(text)) return 'Description contains prohibited content';
    return null;
}

/**
 * Validates support email in real-time
 */
export function validateSupportEmail(email: string): string | null {
    if (!email.trim()) return 'Support contact email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address format';
    if (SCRIPT_INJECTION_REGEX.test(email)) return 'Prohibited content detected';
    return null;
}

/**
 * Validates support phone in real-time
 */
export function validateSupportPhone(phone: string): string | null {
    if (!phone.trim()) return 'Support contact phone number is required';
    if (!US_CA_PHONE_REGEX.test(phone)) return 'Invalid format. Must be a valid 10-digit number';
    return null;
}
