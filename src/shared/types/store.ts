/**
 * Store Types — Single Source of Truth
 *
 * Includes delivery radius and geo-coordinate fields for
 * distance eligibility logic (which store can deliver to a user's location).
 */

export type StoreStatus = 'Active' | 'Inactive' | 'Pending';

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
    email?: string;
    status: StoreStatus;
    paymentTerms: string;
    taxProfile: 'Inherit' | 'Override';
    taxScheme?: string;
    taxRate?: number;
    logoStatus: 'Set' | 'Default';
    // ─── Delivery Radius & Geo ──────────────────────────────────────────
    /** Delivery radius in kilometers — used for order eligibility */
    deliveryRadiusKm?: number;
    /** GPS latitude — for distance calculation & future map integration */
    latitude?: number;
    /** GPS longitude — for distance calculation & future map integration */
    longitude?: number;
    // ─── Enriched Fields (from API joins) ────────────────────────────────
    /** Number of registered users under this store */
    usersCount?: number;
    /** Store admin display name */
    adminName?: string;
    /** Store admin email */
    adminEmail?: string;
    /** ISO date string when the store was created */
    createdAt?: string;
}

/** DTO for POST /stores */
export interface CreateStoreDTO {
    name: string;
    code: string;
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
