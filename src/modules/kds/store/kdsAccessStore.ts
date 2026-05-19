import { create } from 'zustand';
import {
    KDSRole,
    canStartStage,
    canDelayOrder,
} from '../utils/kdsAccess';



// ─────────────────────────────────────────────────────────────────────────────
//  KDS Access Store
//
//  Dedicated authentication / identity store for the KDS module.
//  Populated during bootstrap, cleared on logout or session expiry.
//
//  No persist — always re-hydrated from GET /api/kds/bootstrap on page load.
//
//  RBAC evaluation is delegated to the existing helpers in kdsAccess.ts.
//  This store does NOT introduce new permission logic.
// ─────────────────────────────────────────────────────────────────────────────

export interface KDSAccessState {
    // ── Identity ──────────────────────────────────────────────────────────────
    userId?: string;
    roleId?: string;
    brandId?: string;
    storeId?: string;
    permissions: string[];

    // ── Station Context ───────────────────────────────────────────────────────
    isStationMode: boolean;
    stationId?: string;

    // ── Auth Status ───────────────────────────────────────────────────────────
    isAuthenticated: boolean;

    // ── Actions ───────────────────────────────────────────────────────────────

    /** Hydrate user identity from bootstrap response */
    setUserContext: (user: {
        userId: string;
        roleId: string;
        brandId: string;
        storeId: string;
        permissions: string[];
    }) => void;

    /** Hydrate station context from bootstrap response */
    setStationContext: (station: {
        stationId: string;
        isStationMode: boolean;
    }) => void;

    /** Clear all auth state (logout / session expiry) */
    clearAuth: () => void;

    // ── Helpers (delegate to kdsAccess.ts) ─────────────────────────────────

    /** Check if user holds a specific granular permission */
    hasPermission: (permission: string) => boolean;

    /** True if current role is STORE_MANAGER (delegates to kdsAccess RBAC) */
    isManager: () => boolean;

    /** True if current role is KDS_USER (kitchen line staff) */
    isKitchenStaff: () => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_STATE = {
    userId: undefined,
    roleId: undefined,
    brandId: undefined,
    storeId: undefined,
    permissions: [] as string[],
    isStationMode: false,
    stationId: undefined,
    isAuthenticated: false,
};

// ─────────────────────────────────────────────────────────────────────────────

import { resolveUserType, UserType, ADMIN_USER_TYPES } from '@/shared/types/auth';

/**
 * Safely cast the roleId string to a UserRole.
 * Now uses the canonical resolveRole helper.
 */
function toKDSRole(roleId?: string): UserType | undefined {
    return resolveUserType(roleId as string) || undefined;
}

// ─────────────────────────────────────────────────────────────────────────────

export const useKDSAccessStore = create<KDSAccessState>()((set, get) => ({
    ...INITIAL_STATE,

    // ── Actions ───────────────────────────────────────────────────────────────

    setUserContext: (user) =>
        set({
            userId: user.userId,
            roleId: user.roleId,
            brandId: user.brandId,
            storeId: user.storeId,
            permissions: user.permissions,
            isAuthenticated: true,
        }),

    setStationContext: (station) =>
        set({
            stationId: station.stationId,
            isStationMode: station.isStationMode,
        }),

    clearAuth: () => set(INITIAL_STATE),

    // ── Helpers ───────────────────────────────────────────────────────────────

    hasPermission: (permission: string) => {
        const { permissions, roleId } = get();
        const role = toKDSRole(roleId);

        // ADMIN and MANAGER inherit all permissions via the existing RBAC model
        if (role && (ADMIN_USER_TYPES.includes(role) || role === UserType.MANAGER)) {
            return true;
        }

        return permissions.includes(permission);
    },

    isManager: () => {
        const role = toKDSRole(get().roleId);
        // Delegates to the existing kdsAccess.ts pattern:
        // STORE_MANAGER is the only role that can delay, cancel, override, etc.
        return role !== undefined && canDelayOrder(role);
    },

    isKitchenStaff: () => {
        const role = toKDSRole(get().roleId);
        // KITCHEN_USER can start and complete stages but cannot delay/cancel
        return role === UserType.KITCHEN_USER && canStartStage(role) && !canDelayOrder(role);
    },
}));

// ─────────────────────────────────────────────────────────────────────────────
//  Standalone helpers (importable outside React / from Zustand actions)
// ─────────────────────────────────────────────────────────────────────────────

export function hasPermission(permission: string): boolean {
    return useKDSAccessStore.getState().hasPermission(permission);
}

export function isManager(): boolean {
    return useKDSAccessStore.getState().isManager();
}

export function isKitchenStaff(): boolean {
    return useKDSAccessStore.getState().isKitchenStaff();
}

/**
 * Get the current role as a KDSRole for direct use with kdsAccess.ts helpers.
 * Returns undefined if the user is not authenticated or has an unrecognised role.
 */
export function getCurrentKDSRole(): KDSRole | undefined {
    return toKDSRole(useKDSAccessStore.getState().roleId);
}
