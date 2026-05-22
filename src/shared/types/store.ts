/**
 * Store Types — Single Source of Truth
 *
 * Includes delivery radius, geo-coordinate fields, operational config,
 * and extended detail configuration for the store management system.
 */

// ─── Status ─────────────────────────────────────────────────────────────────

export type StoreStatus = 'Active' | 'Inactive' | 'Pending' | 'Draft' | 'ComingSoon' | 'TemporarilyClosed';

export type BusinessType = 'single_store' | 'franchise' | 'corporate' | 'ghost_kitchen';

// ─── Operating Hours ────────────────────────────────────────────────────────

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface OperatingSlot {
    day: DayOfWeek;
    openTime: string;   // HH:mm
    closeTime: string;  // HH:mm
    isOpen: boolean;
    breakStart?: string; // HH:mm
    breakEnd?: string;   // HH:mm
    holidayOverride?: boolean;
}

export type ChannelKey = 'pos' | 'online' | 'kiosk' | 'delivery' | 'dineIn' | 'callCenter';

export type OperatingHours = Record<ChannelKey, OperatingSlot[]>;

// ─── Delivery Configuration ────────────────────────────────────────────────

export type DeliveryProviderType = 'internal' | 'uber_direct' | 'doordash_drive' | 'hybrid' | 'pickup_only';
export type DriverAssignmentMethod = 'auto' | 'manual' | 'nearest' | 'round_robin';

export interface DeliveryConfig {
    enabled: boolean;
    radiusKm: number;
    minimumOrder?: number;
    baseFee?: number;
    freeDeliveryThreshold?: number;
    estimatedMinutes?: number;
    providerType?: DeliveryProviderType;
    assignmentMethod?: DriverAssignmentMethod;
    peakHourSurcharge?: number;
    rainSurcharge?: number;
    scheduledDeliveryEnabled?: boolean;
    zones?: DeliveryZone[];
}

export interface DeliveryZone {
    id: string;
    name: string;
    radiusKm: number;
    fee: number;
}

// ─── Pickup Configuration ───────────────────────────────────────────────────

export interface PickupConfig {
    enabled: boolean;
    prepTimeMinutes: number;
    slotDurationMinutes: number;
    maxOrdersPerSlot?: number;
    instructions?: string;
    scheduledPickup?: boolean;
    curbsideEnabled?: boolean;
    vehicleRequired?: boolean;
}

// ─── Hardware Configuration ─────────────────────────────────────────────────

export interface HardwareDevice {
    id: string;
    type: 'printer' | 'terminal' | 'kds_display' | 'cash_drawer' | 'scanner' | 'label_printer' | 'customer_display' | 'menu_tv' | 'kiosk';
    name: string;
    model?: string;
    connectionType: 'usb' | 'network' | 'bluetooth';
    ipAddress?: string;
    macAddress?: string;
    station?: string;
    status: 'connected' | 'disconnected' | 'error';
}

export interface HardwareConfig {
    devices: HardwareDevice[];
}

// ─── Core Store Type ────────────────────────────────────────────────────────

export interface Store {
    id: string;
    name: string;
    code: string;
    tenantId: string;
    timezone: string;
    city: string;
    province: string;
    postalCode?: string;
    country?: string;
    address?: string;
    phone?: string;
    secondaryPhone?: string;
    email?: string;
    website?: string;
    status: StoreStatus;
    businessType?: BusinessType;
    storeNumber?: string;
    language?: string;
    currency?: string;
    paymentTerms: string;
    taxProfile: 'Inherit' | 'Override';
    taxScheme?: string;
    taxRate?: number;
    logoStatus: 'Set' | 'Default';
    // ─── Delivery Radius & Geo ──────────────────────────────────────────
    deliveryRadiusKm?: number;
    latitude?: number;
    longitude?: number;
    // ─── Enriched Fields (from API joins) ────────────────────────────────
    usersCount?: number;
    adminName?: string;
    adminEmail?: string;
    createdAt?: string;
    // ─── Extended Config (loaded on detail page) ────────────────────────
    operatingHours?: OperatingHours;
    deliveryConfig?: DeliveryConfig;
    pickupConfig?: PickupConfig;
    hardwareConfig?: HardwareConfig;
}

/** DTO for POST /stores */
export interface CreateStoreDTO {
    name: string;
    code?: string;
    address?: string;
    city: string;
    province: string;
    postalCode?: string;
    country?: string;
    timezone: string;
    phone?: string;
    email?: string;
    paymentTerms?: string;
    deliveryRadiusKm?: number;
    latitude?: number;
    longitude?: number;
    taxSetup?: {
        scheme: string;
        rate: number;
    };
    status?: StoreStatus;
}

/** DTO for PATCH /stores/:id — superset of create with optional status transition */
export interface UpdateStoreDTO extends Partial<CreateStoreDTO> {
    taxProfile?: 'Inherit' | 'Override';
    taxScheme?: string;
    taxRate?: number;
    operatingHours?: OperatingHours;
    deliveryConfig?: DeliveryConfig;
    pickupConfig?: PickupConfig;
    hardwareConfig?: HardwareConfig;
}

// ─── Dine-In Configuration ──────────────────────────────────────────────────

export interface DineInConfig {
    enabled: boolean;
    qrOrdering?: boolean;
    tableService?: boolean;
    counterService?: boolean;
    reservationEnabled?: boolean;
    waitlistEnabled?: boolean;
    diningAreas?: DiningArea[];
}

export interface DiningArea {
    id: string;
    name: string;
    sections: { id: string; name: string; tables: { id: string; number: string; capacity: number }[] }[];
}

// ─── Payment Configuration ──────────────────────────────────────────────────

export type PaymentProvider = 'moneris' | 'clover' | 'stripe' | 'square' | 'bambora' | 'fiserv';

export interface PaymentConfig {
    provider?: PaymentProvider;
    merchantId?: string;
    terminalId?: string;
    tipsEnabled?: boolean;
    refundEnabled?: boolean;
    splitPaymentEnabled?: boolean;
    partialPaymentEnabled?: boolean;
}

// ─── Store Settings (Feature Toggles) ───────────────────────────────────────

export interface StoreSettings {
    acceptOrders: boolean;
    enablePickup: boolean;
    enableDelivery: boolean;
    enableDineIn: boolean;
    enableKiosk: boolean;
    enableInventory: boolean;
    enableAI: boolean;
    enableLoyalty: boolean;
    enableMarketing: boolean;
    futureOrdersEnabled: boolean;
    prepCapacityLimit?: number;
    orderThrottleLimit?: number;
}

export function createDefaultStoreSettings(): StoreSettings {
    return {
        acceptOrders: true,
        enablePickup: true,
        enableDelivery: false,
        enableDineIn: false,
        enableKiosk: false,
        enableInventory: false,
        enableAI: false,
        enableLoyalty: false,
        enableMarketing: false,
        futureOrdersEnabled: false,
    };
}

/** Extended store config (separate API endpoint for heavy settings) */
export interface StoreDetailConfig {
    operatingHours: OperatingHours;
    deliveryConfig: DeliveryConfig;
    pickupConfig: PickupConfig;
    hardwareConfig: HardwareConfig;
    integrations: StoreIntegration[];
    dineInConfig: DineInConfig;
    paymentConfig: PaymentConfig;
    storeSettings: StoreSettings;
}

export interface StoreIntegration {
    id: string;
    provider: string;
    type: 'aggregator' | 'payment' | 'loyalty' | 'analytics';
    status: 'active' | 'inactive' | 'error';
    config?: Record<string, any>;
    lastSyncAt?: string;
}

// ─── Store Users (scoped to a single store) ────────────────────────────────

export interface StoreUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive' | 'Pending';
    isManager: boolean;
    lastLogin?: string;
    createdAt?: string;
}

// ─── Go-Live Readiness ──────────────────────────────────────────────────────

export interface GoLiveCheckItem {
    id: string;
    label: string;
    description: string;
    passed: boolean;
    severity: 'required' | 'recommended';
}

export type GoLiveStatus = 'ready' | 'not_ready' | 'partial';

/**
 * Evaluate whether a store meets the minimum requirements to go live.
 * Returns a structured checklist with pass/fail for each criterion.
 */
export function evaluateGoLiveReadiness(
    store: Store,
    config?: StoreDetailConfig,
    users?: StoreUser[]
): { status: GoLiveStatus; checks: GoLiveCheckItem[]; score: number } {
    const checks: GoLiveCheckItem[] = [
        {
            id: 'name', label: 'Store name set', description: 'A display name is configured',
            passed: !!store.name && store.name.length >= 3, severity: 'required',
        },
        {
            id: 'address', label: 'Address configured', description: 'Street address, city, and province',
            passed: !!(store.address && store.city && store.province), severity: 'required',
        },
        {
            id: 'contact', label: 'Contact info', description: 'Phone or email is set',
            passed: !!(store.phone || store.email), severity: 'required',
        },
        {
            id: 'timezone', label: 'Timezone set', description: 'Operating timezone is configured',
            passed: !!store.timezone, severity: 'required',
        },
        {
            id: 'hours', label: 'Operating hours', description: 'At least one channel has hours configured',
            passed: !!(config?.operatingHours && Object.values(config.operatingHours).some(
                slots => slots.some(s => s.isOpen)
            )), severity: 'required',
        },
        {
            id: 'manager', label: 'Manager assigned', description: 'A store manager has been assigned',
            passed: !!(users && users.some(u => u.isManager)), severity: 'recommended',
        },
        {
            id: 'tax', label: 'Tax profile configured', description: 'Tax scheme and rate are set',
            passed: store.taxProfile === 'Inherit' || !!(store.taxScheme && store.taxRate !== undefined),
            severity: 'required',
        },
        {
            id: 'delivery', label: 'Delivery or pickup enabled', description: 'At least one fulfillment method',
            passed: !!(config?.deliveryConfig?.enabled || config?.pickupConfig?.enabled),
            severity: 'recommended',
        },
    ];

    const requiredChecks = checks.filter(c => c.severity === 'required');
    const requiredPassed = requiredChecks.filter(c => c.passed).length;
    const allPassed = checks.filter(c => c.passed).length;
    const score = Math.round((allPassed / checks.length) * 100);

    let status: GoLiveStatus = 'not_ready';
    if (requiredPassed === requiredChecks.length) {
        status = allPassed === checks.length ? 'ready' : 'partial';
    }

    return { status, checks, score };
}

// ─── Store Status Styling ───────────────────────────────────────────────────

export const STORE_STATUS_CONFIG: Record<StoreStatus, {
    color: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
    label: string;
}> = {
    Active: { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', dotColor: 'bg-emerald-500', label: 'Active' },
    Inactive: { color: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', dotColor: 'bg-slate-400', label: 'Inactive' },
    Draft: { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', dotColor: 'bg-amber-500', label: 'Draft' },
    Pending: { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', dotColor: 'bg-blue-500', label: 'Pending Review' },
    ComingSoon: { color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', dotColor: 'bg-purple-500', label: 'Coming Soon' },
    TemporarilyClosed: { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', dotColor: 'bg-orange-500', label: 'Temporarily Closed' },
};

// ─── Factory Functions ──────────────────────────────────────────────────────

const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function createDefaultOperatingHours(): OperatingHours {
    const makeSlots = (open: string, close: string): OperatingSlot[] =>
        ALL_DAYS.map(day => ({ day, openTime: open, closeTime: close, isOpen: true }));

    return {
        pos: makeSlots('09:00', '22:00'),
        online: makeSlots('10:00', '21:00'),
        kiosk: makeSlots('09:00', '22:00'),
        delivery: makeSlots('10:00', '21:00'),
        dineIn: makeSlots('11:00', '22:00'),
        callCenter: makeSlots('09:00', '18:00'),
    };
}

export function createDefaultDeliveryConfig(): DeliveryConfig {
    return { enabled: false, radiusKm: 5, minimumOrder: 15, baseFee: 3.99, estimatedMinutes: 30 };
}

export function createDefaultPickupConfig(): PickupConfig {
    return { enabled: true, prepTimeMinutes: 15, slotDurationMinutes: 15, instructions: '' };
}

export function createDefaultStoreDetailConfig(): StoreDetailConfig {
    return {
        operatingHours: createDefaultOperatingHours(),
        deliveryConfig: createDefaultDeliveryConfig(),
        pickupConfig: createDefaultPickupConfig(),
        hardwareConfig: { devices: [] },
        integrations: [],
        dineInConfig: { enabled: false },
        paymentConfig: {},
        storeSettings: createDefaultStoreSettings(),
    };
}

// ─── Delivery Radius Utilities ──────────────────────────────────────────────

/**
 * Haversine distance in km between two geo-coordinates.
 * Used to determine if a customer location falls within a store's delivery radius.
 */
export function calculateDistanceKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Check if a store can deliver to a given location.
 * Returns false if the store has no geo-data or radius configured.
 */
export function isStoreEligibleForDelivery(
    store: Store,
    customerLat: number,
    customerLng: number
): boolean {
    if (!store.latitude || !store.longitude || !store.deliveryRadiusKm) return false;
    const distance = calculateDistanceKm(store.latitude, store.longitude, customerLat, customerLng);
    return distance <= store.deliveryRadiusKm;
}
