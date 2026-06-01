import type {
    Menu,
    MenuChannelType,
    MenuPublishStatus,
    MenuSyncState,
} from '../types/menu';

/**
 * Mock Menu Data — Seed data for the Menu Management module.
 *
 * Each menu references products and categories from the existing catalog
 * by ID only — no data duplication.
 */

export const mockMenus: Menu[] = [
    {
        id: 'menu-pos-main',
        name: 'Main POS Menu',
        description: 'Primary in-store POS menu for all dine-in and takeout orders. Contains full product catalog visibility.',
        primaryChannel: 'POS',
        publishStatus: 'PUBLISHED',
        syncState: 'SYNCED',
        channels: [
            { channelType: 'POS', isActive: true, syncState: 'SYNCED', lastSyncedAt: '2026-05-28T10:00:00Z' },
        ],
        storeAssignment: { scope: 'ALL_STORES', targetStoreIds: [] },
        sections: [
            { id: 'sec-1', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-1', sortOrder: 1, isVisible: true, includedItemIds: ['item-1'], excludedItemIds: [], featuredItemIds: ['item-1'] },
            { id: 'sec-2', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-2', sortOrder: 2, isVisible: true, includedItemIds: [], excludedItemIds: [], featuredItemIds: [] },
            { id: 'sec-3', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-3', sortOrder: 3, isVisible: true, includedItemIds: [], excludedItemIds: [], featuredItemIds: [] },
            { id: 'sec-4', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-4', sortOrder: 4, isVisible: true, includedItemIds: [], excludedItemIds: [], featuredItemIds: [] },
        ],
        productIds: ['item-1'],
        itemOverrides: [],
        schedule: {
            isAlwaysActive: true,
            activeDays: [
                { day: 'MON', startTime: '08:00', endTime: '23:00', isActive: true },
                { day: 'TUE', startTime: '08:00', endTime: '23:00', isActive: true },
                { day: 'WED', startTime: '08:00', endTime: '23:00', isActive: true },
                { day: 'THU', startTime: '08:00', endTime: '23:00', isActive: true },
                { day: 'FRI', startTime: '08:00', endTime: '00:00', isActive: true },
                { day: 'SAT', startTime: '09:00', endTime: '00:00', isActive: true },
                { day: 'SUN', startTime: '09:00', endTime: '22:00', isActive: true },
            ],
        },
        versionMetadata: {
            version: 3,
            lastModifiedBy: 'Brand Admin',
            lastModifiedAt: '2026-05-28T10:00:00Z',
            lastPublishedAt: '2026-05-28T10:00:00Z',
            lastPublishedBy: 'Brand Admin',
            activeDraftHash: 'hash-pos-main-v3',
        },
        auditLog: [
            { timestamp: '2026-05-28T10:00:00Z', user: 'Brand Admin', action: 'Published menu v3' },
            { timestamp: '2026-05-27T14:00:00Z', user: 'Brand Admin', action: 'Updated schedule' },
            { timestamp: '2026-05-20T09:00:00Z', user: 'System', action: 'Created menu' },
        ],
        isDefault: true,
        isLocked: false,
        isArchived: false,
    },
    {
        id: 'menu-online-storefront',
        name: 'Online Storefront',
        description: 'Customer-facing online ordering menu. Curated selection with delivery-optimized items only.',
        primaryChannel: 'ONLINE',
        publishStatus: 'PUBLISHED',
        syncState: 'SYNCED',
        channels: [
            { channelType: 'ONLINE', isActive: true, syncState: 'SYNCED', lastSyncedAt: '2026-05-28T09:30:00Z' },
        ],
        storeAssignment: { scope: 'ALL_STORES', targetStoreIds: [] },
        sections: [
            { id: 'sec-5', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-1', sortOrder: 1, isVisible: true, includedItemIds: ['item-1'], excludedItemIds: [], featuredItemIds: [] },
            { id: 'sec-6', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-3', sortOrder: 2, isVisible: true, includedItemIds: [], excludedItemIds: [], featuredItemIds: [] },
        ],
        productIds: ['item-1'],
        itemOverrides: [
            { itemId: 'item-1', priceOverride: 11.99, displayNameOverride: 'Veggie Supreme (Online Special)' },
        ],
        schedule: { isAlwaysActive: true, activeDays: [] },
        versionMetadata: {
            version: 5,
            lastModifiedBy: 'Brand Admin',
            lastModifiedAt: '2026-05-28T09:30:00Z',
            lastPublishedAt: '2026-05-28T09:30:00Z',
            lastPublishedBy: 'Brand Admin',
            activeDraftHash: 'hash-online-v5',
        },
        auditLog: [
            { timestamp: '2026-05-28T09:30:00Z', user: 'Brand Admin', action: 'Published menu v5' },
        ],
        isDefault: true,
        isLocked: false,
        isArchived: false,
    },
    {
        id: 'menu-uber-eats',
        name: 'Uber Eats Marketplace',
        description: 'Uber Eats integration menu. Subset of catalog optimized for delivery with aggregator-specific pricing.',
        primaryChannel: 'UBER_EATS',
        publishStatus: 'PUBLISHED',
        syncState: 'PARTIAL',
        channels: [
            { channelType: 'UBER_EATS', isActive: true, syncState: 'PARTIAL', lastSyncedAt: '2026-05-27T18:00:00Z', syncErrorMessage: '2 items failed modifier validation' },
        ],
        storeAssignment: { scope: 'SPECIFIC_STORES', targetStoreIds: ['store-chicago', 'store-newyork'] },
        sections: [
            { id: 'sec-7', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-1', sortOrder: 1, isVisible: true, includedItemIds: ['item-1'], excludedItemIds: [], featuredItemIds: [] },
        ],
        productIds: ['item-1'],
        itemOverrides: [
            { itemId: 'item-1', priceOverride: 14.99 },
        ],
        schedule: {
            isAlwaysActive: false,
            activeDays: [
                { day: 'MON', startTime: '11:00', endTime: '22:00', isActive: true },
                { day: 'TUE', startTime: '11:00', endTime: '22:00', isActive: true },
                { day: 'WED', startTime: '11:00', endTime: '22:00', isActive: true },
                { day: 'THU', startTime: '11:00', endTime: '22:00', isActive: true },
                { day: 'FRI', startTime: '11:00', endTime: '23:00', isActive: true },
                { day: 'SAT', startTime: '11:00', endTime: '23:00', isActive: true },
                { day: 'SUN', startTime: '12:00', endTime: '21:00', isActive: true },
            ],
        },
        versionMetadata: {
            version: 2,
            lastModifiedBy: 'Brand Admin',
            lastModifiedAt: '2026-05-27T18:00:00Z',
            lastPublishedAt: '2026-05-27T18:00:00Z',
            lastPublishedBy: 'Brand Admin',
            activeDraftHash: 'hash-uber-v2',
        },
        auditLog: [
            { timestamp: '2026-05-27T18:00:00Z', user: 'Brand Admin', action: 'Sync partial — 2 items failed' },
        ],
        isDefault: false,
        isLocked: false,
        isArchived: false,
    },
    {
        id: 'menu-doordash',
        name: 'DoorDash Marketplace',
        description: 'DoorDash delivery menu. Optimized for fast preparation items.',
        primaryChannel: 'DOORDASH',
        publishStatus: 'DRAFT',
        syncState: 'IDLE',
        channels: [
            { channelType: 'DOORDASH', isActive: false, syncState: 'IDLE' },
        ],
        storeAssignment: { scope: 'SPECIFIC_STORES', targetStoreIds: ['store-miami'] },
        sections: [
            { id: 'sec-8', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-1', sortOrder: 1, isVisible: true, includedItemIds: [], excludedItemIds: [], featuredItemIds: [] },
            { id: 'sec-9', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-4', sortOrder: 2, isVisible: true, includedItemIds: [], excludedItemIds: [], featuredItemIds: [] },
        ],
        productIds: [],
        itemOverrides: [],
        schedule: { isAlwaysActive: true, activeDays: [] },
        versionMetadata: {
            version: 1,
            lastModifiedBy: 'Brand Admin',
            lastModifiedAt: '2026-05-26T15:00:00Z',
            activeDraftHash: 'hash-doordash-v1',
        },
        auditLog: [
            { timestamp: '2026-05-26T15:00:00Z', user: 'Brand Admin', action: 'Created draft menu' },
        ],
        isDefault: false,
        isLocked: false,
        isArchived: false,
    },
    {
        id: 'menu-kiosk',
        name: 'Self-Service Kiosk',
        description: 'Simplified kiosk menu with image-heavy layout for customer self-ordering.',
        primaryChannel: 'KIOSK',
        publishStatus: 'SCHEDULED',
        syncState: 'IDLE',
        channels: [
            { channelType: 'KIOSK', isActive: false, syncState: 'IDLE' },
        ],
        storeAssignment: { scope: 'SPECIFIC_STORES', targetStoreIds: ['store-chicago'] },
        sections: [
            { id: 'sec-10', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-1', sortOrder: 1, isVisible: true, includedItemIds: ['item-1'], excludedItemIds: [], featuredItemIds: [] },
            { id: 'sec-11', sectionType: 'STANDARD' as const, catalogCategoryId: 'cat-3', sortOrder: 2, isVisible: true, includedItemIds: [], excludedItemIds: [], featuredItemIds: [] },
        ],
        productIds: ['item-1'],
        itemOverrides: [],
        schedule: {
            isAlwaysActive: false,
            effectiveFrom: '2026-06-01T00:00:00Z',
            activeDays: [
                { day: 'MON', startTime: '10:00', endTime: '20:00', isActive: true },
                { day: 'TUE', startTime: '10:00', endTime: '20:00', isActive: true },
                { day: 'WED', startTime: '10:00', endTime: '20:00', isActive: true },
                { day: 'THU', startTime: '10:00', endTime: '20:00', isActive: true },
                { day: 'FRI', startTime: '10:00', endTime: '21:00', isActive: true },
                { day: 'SAT', startTime: '10:00', endTime: '21:00', isActive: true },
                { day: 'SUN', startTime: '11:00', endTime: '19:00', isActive: true },
            ],
        },
        versionMetadata: {
            version: 1,
            lastModifiedBy: 'Brand Admin',
            lastModifiedAt: '2026-05-25T12:00:00Z',
            activeDraftHash: 'hash-kiosk-v1',
        },
        auditLog: [
            { timestamp: '2026-05-25T12:00:00Z', user: 'Brand Admin', action: 'Created scheduled menu' },
        ],
        isDefault: false,
        isLocked: false,
        isArchived: false,
    },
    {
        id: 'menu-catering',
        name: 'Catering & Events',
        description: 'Large-order catering menu with bulk pricing and minimum quantity requirements.',
        primaryChannel: 'CATERING',
        publishStatus: 'ARCHIVED',
        syncState: 'IDLE',
        channels: [
            { channelType: 'CATERING', isActive: false, syncState: 'IDLE' },
        ],
        storeAssignment: { scope: 'ALL_STORES', targetStoreIds: [] },
        sections: [],
        productIds: [],
        itemOverrides: [],
        schedule: { isAlwaysActive: false, activeDays: [] },
        versionMetadata: {
            version: 4,
            lastModifiedBy: 'Brand Admin',
            lastModifiedAt: '2026-05-10T09:00:00Z',
            lastPublishedAt: '2026-04-15T09:00:00Z',
            lastPublishedBy: 'Brand Admin',
            activeDraftHash: 'hash-catering-v4',
        },
        auditLog: [
            { timestamp: '2026-05-10T09:00:00Z', user: 'Brand Admin', action: 'Archived menu' },
        ],
        isDefault: false,
        isLocked: true,
        isArchived: true,
    },
];
