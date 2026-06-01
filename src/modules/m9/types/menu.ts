/**
 * Menu Management — Type Definitions
 *
 * Core Principle: Catalog = WHAT is sold. Menu = WHERE and HOW it is shown.
 *
 * A Menu is a presentation/publishing/channel orchestration layer.
 * It references products and categories from the master catalog
 * without duplicating them.
 */

// ─── Menu Channel Types ──────────────────────────────────────────────────────

export type MenuChannelType =
    | 'POS'
    | 'ONLINE'
    | 'UBER_EATS'
    | 'DOORDASH'
    | 'KIOSK'
    | 'CATERING'
    | 'CUSTOM';

export const MENU_CHANNEL_LABELS: Record<MenuChannelType, string> = {
    POS: 'POS Terminal',
    ONLINE: 'Online Ordering',
    UBER_EATS: 'Uber Eats',
    DOORDASH: 'DoorDash',
    KIOSK: 'Self-Service Kiosk',
    CATERING: 'Catering',
    CUSTOM: 'Custom Channel',
};

export const MENU_CHANNEL_COLORS: Record<MenuChannelType, { bg: string; text: string; border: string }> = {
    POS: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    ONLINE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    UBER_EATS: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
    DOORDASH: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    KIOSK: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    CATERING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    CUSTOM: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

// ─── Publishing Lifecycle ────────────────────────────────────────────────────

export type MenuPublishStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
export type MenuSyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'PARTIAL';

// ─── Schedule ────────────────────────────────────────────────────────────────

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface MenuDaySchedule {
    day: DayOfWeek;
    startTime: string;   // HH:mm
    endTime: string;     // HH:mm
    isActive: boolean;
}

export interface MenuSchedule {
    isAlwaysActive: boolean;
    activeDays: MenuDaySchedule[];
    effectiveFrom?: string;  // ISO date
    effectiveUntil?: string; // ISO date — null = indefinite
}

// ─── Channel Assignment ──────────────────────────────────────────────────────

export interface MenuChannelAssignment {
    channelType: MenuChannelType;
    isActive: boolean;
    syncState: MenuSyncState;
    lastSyncedAt?: string;
    syncErrorMessage?: string;
    /** Channel-specific pricing overrides (future) */
    pricingRuleId?: string;
}

// ─── Store Assignment ────────────────────────────────────────────────────────

export type MenuStoreScope = 'ALL_STORES' | 'SPECIFIC_STORES' | 'STORE_GROUPS';

export interface MenuStoreAssignment {
    scope: MenuStoreScope;
    targetStoreIds: string[];
    /** Store groups (future expansion) */
    targetGroupIds?: string[];
}

// ─── Section Types ───────────────────────────────────────────────────────────

export type SectionType = 'STANDARD' | 'FEATURED' | 'PROMO' | 'DYNAMIC' | 'STORE_OVERRIDE';

// ─── Menu Section (Category References) ──────────────────────────────────────

export interface MenuSection {
    id: string;
    sectionType: SectionType;
    /** References a Category ID from the master catalog */
    catalogCategoryId: string;
    displayName?: string;  // Override display name for this menu context
    description?: string;
    sortOrder: number;
    isVisible: boolean;
    /** Item IDs from this category that are included in this menu */
    includedItemIds: string[];
    /** Item IDs explicitly excluded from this section */
    excludedItemIds: string[];
    /** Item IDs marked as featured within this section */
    featuredItemIds: string[];
}

// ─── Builder Types ───────────────────────────────────────────────────────────

export type ChannelPreviewMode = MenuChannelType;

export interface BuilderDraftSnapshot {
    sections: MenuSection[];
    itemOverrides: MenuItemOverride[];
    timestamp: string;
}

export interface PublishReadinessIssue {
    severity: 'error' | 'warning';
    message: string;
    sectionId?: string;
    itemId?: string;
}

// ─── Menu Runtime Override ───────────────────────────────────────────────────

export interface MenuItemOverride {
    itemId: string;
    /** Price override specific to this menu context */
    priceOverride?: number;
    /** Availability override specific to this menu */
    isAvailableOverride?: boolean;
    /** Display name override for this menu */
    displayNameOverride?: string;
    /** Sort order within its section */
    sortOrder?: number;
}

// ─── Version Metadata ────────────────────────────────────────────────────────

export interface MenuVersionMetadata {
    version: number;
    lastModifiedBy: string;
    lastModifiedAt: string;
    lastPublishedAt?: string;
    lastPublishedBy?: string;
    activeDraftHash: string;
}

// ─── Audit Entry ─────────────────────────────────────────────────────────────

export interface MenuAuditEntry {
    timestamp: string;
    user: string;
    action: string;
    details?: string;
}

// ─── Core Menu Entity ────────────────────────────────────────────────────────

export interface Menu {
    id: string;
    name: string;
    description?: string;
    /** Primary channel type this menu targets */
    primaryChannel: MenuChannelType;

    // ── Publishing Lifecycle
    publishStatus: MenuPublishStatus;
    syncState: MenuSyncState;

    // ── Assignments
    channels: MenuChannelAssignment[];
    storeAssignment: MenuStoreAssignment;

    // ── Content Structure (references to catalog)
    sections: MenuSection[];
    /** Flat list of all product IDs included across all sections */
    productIds: string[];
    /** Item-level overrides for this menu context */
    itemOverrides: MenuItemOverride[];

    // ── Schedule
    schedule: MenuSchedule;
    storeSchedules?: Record<string, MenuSchedule>;
    storeChannelMatrix?: Record<string, Record<MenuChannelType, boolean>>;

    // ── Operational Metadata
    versionMetadata: MenuVersionMetadata;
    auditLog: MenuAuditEntry[];

    // ── Derived counts (computed, not stored)
    _productCount?: number;
    _categoryCount?: number;

    // ── Flags
    isDefault: boolean;    // Default menu for its channel type
    isLocked: boolean;     // Locked from edits (e.g., during sync)
    isArchived: boolean;
}

// ─── Filter Types ────────────────────────────────────────────────────────────

export type MenuFilterStatus = 'ALL' | MenuPublishStatus;
export type MenuFilterChannel = 'ALL' | MenuChannelType;
export type MenuFilterSync = 'ALL' | MenuSyncState;

export interface MenuFilters {
    status: MenuFilterStatus;
    channel: MenuFilterChannel;
    sync: MenuFilterSync;
    search: string;
    storeId: string | null;
}

// ─── Bulk Operations ─────────────────────────────────────────────────────────

export type MenuBulkAction =
    | 'PUBLISH'
    | 'UNPUBLISH'
    | 'ARCHIVE'
    | 'DUPLICATE'
    | 'ASSIGN_STORES'
    | 'SYNC';
