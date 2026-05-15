export type KDSRole =
    | 'KITCHEN_STAFF'
    | 'EXPO_LEAD'
    | 'STORE_MANAGER'
    | 'ADMIN'
    | 'KDS_USER'; // Deprecated alias for KITCHEN_STAFF

export function canStartStage(_role: KDSRole) {
    return true; // All KDS roles can progress orders
}

export function canCompleteStage(_role: KDSRole) {
    return true;
}

export function canDelayOrder(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'ADMIN';
}

export function canCancelOrder(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'ADMIN';
}

export function canOverrideStage(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'EXPO_LEAD' || role === 'ADMIN';
}

export function canSendCustomMessage(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'ADMIN';
}

export function canReopenOrder(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'EXPO_LEAD' || role === 'ADMIN'; // KDS.RECALL_REFIRE
}

export function canReassignStation(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'EXPO_LEAD' || role === 'ADMIN'; // KDS.REASSIGN_STATION
}

export function canManageConfig(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'ADMIN'; // KDS.SOUND_CONFIG, KDS.STATION_CONFIG
}

/**
 * Requirement 8.2: Permission gating for customer status updates.
 * Only users with KDS.CUSTOMER_MESSAGE can trigger status messages.
 */
export function canSendCustomerStatus(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'EXPO_LEAD' || role === 'ADMIN'; // KDS.CUSTOMER_MESSAGE
}

/**
 * Requirement 8.2: Permission gating for delay adjustments.
 * Only users with KDS.DELAY_ORDER can adjust delay increments.
 */
export function canAdjustDelay(role: KDSRole) {
    return role === 'STORE_MANAGER' || role === 'ADMIN'; // KDS.DELAY_ORDER
}
