import { UserType, isSuperAdmin } from '@/shared/types/auth';

/**
 * KDSRole — Legacy alias for canonical UserType.
 */
export type KDSRole = UserType | string;

export function canStartStage(_role: KDSRole) {
    return true; // All KDS roles can progress orders
}

export function canCompleteStage(_role: KDSRole) {
    return true;
}

export function canDelayOrder(role: KDSRole) {
    return role === UserType.MANAGER || isSuperAdmin(role as UserType);
}

export function canCancelOrder(role: KDSRole) {
    return role === UserType.MANAGER || isSuperAdmin(role as UserType);
}

export function canOverrideStage(role: KDSRole) {
    // Expo leads (KITCHEN_USER in canonical) were previously allowed to override.
    // We maintain this by allowing KITCHEN_USER + management roles.
    return role === UserType.MANAGER || role === UserType.KITCHEN_USER || isSuperAdmin(role as UserType);
}

export function canSendCustomMessage(role: KDSRole) {
    return role === UserType.MANAGER || isSuperAdmin(role as UserType);
}

export function canReopenOrder(role: KDSRole) {
    return role === UserType.MANAGER || role === UserType.KITCHEN_USER || isSuperAdmin(role as UserType);
}

export function canReassignStation(role: KDSRole) {
    return role === UserType.MANAGER || role === UserType.KITCHEN_USER || isSuperAdmin(role as UserType);
}

export function canManageConfig(role: KDSRole) {
    return role === UserType.MANAGER || isSuperAdmin(role as UserType);
}

/**
 * Permission gating for customer status updates.
 */
export function canSendCustomerStatus(role: KDSRole) {
    return role === UserType.MANAGER || role === UserType.KITCHEN_USER || isSuperAdmin(role as UserType);
}

/**
 * Permission gating for delay adjustments.
 */
export function canAdjustDelay(role: KDSRole) {
    return role === UserType.MANAGER || isSuperAdmin(role as UserType);
}
