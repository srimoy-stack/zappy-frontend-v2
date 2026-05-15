/**
 * customerStatusService.ts
 *
 * Centralized Customer Status Update Service for requirement 8.
 *
 * Responsibilities:
 *   1. Manage customer-facing status updates triggered by KDS actions
 *   2. Generate appropriate status messages for each trigger event
 *   3. Support adjustable delay increments (+5 min)
 *   4. Provide real-time status via tracking token link
 *   5. Optionally trigger SMS/Email notifications
 *
 * Trigger events:
 *   - ACCEPT  → default "ready in 10 mins"
 *   - DELAY   → updated ETA with +5 min increments
 *   - READY   → order ready for pickup/delivery
 *   - COMPLETED → order fulfilled
 *   - CANCELLED → order cancelled (optional)
 *
 * Permission gating:
 *   - KDS.CUSTOMER_MESSAGE — can trigger customer-facing messages
 *   - KDS.DELAY_ORDER     — can delay order and trigger delay messages
 */

import { useKDSStore } from '../store/kdsStore';
import { emitEvent } from './kdsEventDispatcher';
import { logKDSAction } from './kdsAuditLogger';
import { hasPermission } from '../store/kdsAccessStore';
import { KDSOrder } from '../types/kds';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export type StatusTrigger =
    | 'ACCEPT'
    | 'DELAY'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';

export type NotificationChannel = 'SMS' | 'EMAIL' | 'BOTH' | 'LINK_ONLY';

export interface CustomerStatusUpdate {
    id: string;
    orderId: string;
    orderNumber: string;
    trigger: StatusTrigger;
    message: string;
    trackingUrl: string;
    estimatedReadyMinutes?: number;
    estimatedReadyTime?: string;
    channel: NotificationChannel;
    sentAt: string;
    sentBy: string;
    isAutoTriggered: boolean;
}

export interface StatusUpdateResult {
    success: boolean;
    update?: CustomerStatusUpdate;
    statusMessage: string;
    permissionDenied?: boolean;
}

export interface CustomerTrackingState {
    orderId: string;
    orderNumber: string;
    customerName?: string;
    currentStage: string;
    estimatedReadyMinutes: number;
    estimatedReadyTime: string;
    isDelayed: boolean;
    delayMinutes?: number;
    trackingUrl: string;
    statusHistory: CustomerStatusUpdate[];
    lastUpdatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PREP_TIME_MINS = 10;
const DELAY_INCREMENT_MINS = 5;
const TRACKING_BASE_URL = 'https://track.zyappy.com';

// In-memory status update log (newest first)
const _statusUpdateLog: CustomerStatusUpdate[] = [];
const MAX_STATUS_LOG = 500;

// ─────────────────────────────────────────────────────────────────────────────
//  Message Templates
// ─────────────────────────────────────────────────────────────────────────────

function buildTrackingUrl(trackingToken: string): string {
    return `${TRACKING_BASE_URL}/${trackingToken}`;
}

function buildStatusMessage(
    trigger: StatusTrigger,
    order: KDSOrder,
    additionalMinutes?: number
): string {
    const trackingUrl = buildTrackingUrl(order.trackingToken);
    const customerName = order.customerName || 'Valued Customer';
    const eta = order.estimatedReadyTime
        ? new Date(order.estimatedReadyTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `${order.prepTimeMinutes || DEFAULT_PREP_TIME_MINS} minutes`;

    switch (trigger) {
        case 'ACCEPT':
            return `Hi ${customerName}! Your order #${order.orderNumber} has been accepted and is being prepared. Estimated ready in ${order.prepTimeMinutes || DEFAULT_PREP_TIME_MINS} mins. Track your order: ${trackingUrl}`;

        case 'DELAY':
            const totalDelay = additionalMinutes || DELAY_INCREMENT_MINS;
            return `Hi ${customerName}, we're sorry — your order #${order.orderNumber} needs a bit more time. We've added ${totalDelay} minutes. New estimated ready time: ${eta}. Track progress: ${trackingUrl}`;

        case 'READY':
            return `Great news, ${customerName}! 🎉 Your order #${order.orderNumber} is READY for pickup! Please head to the counter. ${trackingUrl}`;

        case 'COMPLETED':
            return `Thank you, ${customerName}! Your order #${order.orderNumber} has been fulfilled. We hope you enjoy it! ${trackingUrl}`;

        case 'CANCELLED':
            return `We're sorry, ${customerName}. Your order #${order.orderNumber} has been cancelled. If you have questions, please contact us. Ref: ${trackingUrl}`;

        default:
            return `Update for order #${order.orderNumber}: ${trackingUrl}`;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Permission Checks
// ─────────────────────────────────────────────────────────────────────────────

function canSendStatusUpdate(trigger: StatusTrigger): boolean {
    // DELAY requires KDS.DELAY_ORDER permission
    if (trigger === 'DELAY') {
        return hasPermission('KDS.DELAY_ORDER') || hasPermission('KDS.CUSTOMER_MESSAGE');
    }
    // All other triggers require KDS.CUSTOMER_MESSAGE
    return hasPermission('KDS.CUSTOMER_MESSAGE');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Core API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a customer status update for an order.
 *
 * @param orderId           The KDS order ID
 * @param trigger           The event that triggered this update
 * @param channel           Notification channel
 * @param customMessage     Optional custom message override
 * @param additionalMinutes Optional delay minutes (for DELAY trigger)
 * @param isAutoTriggered   Whether this was auto-triggered by a KDS action
 */
export async function sendStatusUpdate(
    orderId: string,
    trigger: StatusTrigger,
    channel: NotificationChannel = 'LINK_ONLY',
    customMessage?: string,
    additionalMinutes?: number,
    isAutoTriggered: boolean = false
): Promise<StatusUpdateResult> {
    // ── 1. Permission gate ────────────────────────────────────────────────────
    if (!canSendStatusUpdate(trigger)) {
        console.warn(`[CustomerStatus] Permission denied for trigger "${trigger}".`);
        return {
            success: false,
            statusMessage: `Permission denied: requires KDS.CUSTOMER_MESSAGE or KDS.DELAY_ORDER`,
            permissionDenied: true,
        };
    }

    // ── 2. Validate order exists ──────────────────────────────────────────────
    const order = useKDSStore.getState().orders[orderId];
    if (!order) {
        return {
            success: false,
            statusMessage: `Order "${orderId}" not found.`,
        };
    }

    // ── 3. Build message ──────────────────────────────────────────────────────
    const message = customMessage || buildStatusMessage(trigger, order, additionalMinutes);
    const trackingUrl = buildTrackingUrl(order.trackingToken);

    // ── 4. Calculate estimated minutes ────────────────────────────────────────
    let estimatedReadyMinutes: number | undefined;
    if (order.estimatedReadyTime) {
        const readyTime = new Date(order.estimatedReadyTime).getTime();
        const now = Date.now();
        estimatedReadyMinutes = Math.max(0, Math.ceil((readyTime - now) / 60000));
    }

    // ── 5. Build status update entry ──────────────────────────────────────────
    const now = new Date().toISOString();
    const statusUpdate: CustomerStatusUpdate = {
        id: `status-${orderId}-${Date.now()}`,
        orderId,
        orderNumber: order.orderNumber,
        trigger,
        message,
        trackingUrl,
        estimatedReadyMinutes,
        estimatedReadyTime: order.estimatedReadyTime,
        channel,
        sentAt: now,
        sentBy: 'KDS_SYSTEM',
        isAutoTriggered,
    };

    // ── 6. Store in local log ─────────────────────────────────────────────────
    _statusUpdateLog.unshift(statusUpdate);
    if (_statusUpdateLog.length > MAX_STATUS_LOG) {
        _statusUpdateLog.pop();
    }

    // ── 7. Update order's notificationsLog ────────────────────────────────────
    if (channel !== 'LINK_ONLY') {
        useKDSStore.getState().sendCustomerMessage(
            orderId,
            channel === 'BOTH' ? 'BOTH' : channel === 'SMS' ? 'SMS' : 'EMAIL',
            message
        );
    }

    // ── 8. Emit domain event ──────────────────────────────────────────────────
    const idempotencyKey = `customer-status-${orderId}-${trigger}-${now}`;
    emitEvent('customer.status_update', {
        ...statusUpdate,
    }, { idempotencyKey });

    // ── 9. Audit log ──────────────────────────────────────────────────────────
    logKDSAction('customer.status_update', {
        orderId,
        orderNumber: order.orderNumber,
        trigger,
        channel,
        isAutoTriggered,
        messagePreview: message.slice(0, 50) + '...',
    });

    console.info(
        `[CustomerStatus] Status update sent — order: #${order.orderNumber}, ` +
        `trigger: ${trigger}, channel: ${channel}, auto: ${isAutoTriggered}`
    );

    return {
        success: true,
        update: statusUpdate,
        statusMessage: `Status update "${trigger}" sent for order #${order.orderNumber}.`,
    };
}

/**
 * Send a delay adjustment (+5 min increments).
 * Convenience wrapper for the DELAY trigger.
 */
export async function sendDelayUpdate(
    orderId: string,
    additionalMinutes: number = DELAY_INCREMENT_MINS,
    channel: NotificationChannel = 'LINK_ONLY'
): Promise<StatusUpdateResult> {
    return sendStatusUpdate(orderId, 'DELAY', channel, undefined, additionalMinutes);
}

/**
 * Adjust the delay increment for an order.
 * Returns the adjusted minutes snapped to 5-minute increments.
 */
export function snapToDelayIncrement(minutes: number): number {
    return Math.ceil(minutes / DELAY_INCREMENT_MINS) * DELAY_INCREMENT_MINS;
}

/**
 * Get the current customer-facing tracking state for an order.
 */
export function getCustomerTrackingState(orderId: string): CustomerTrackingState | null {
    const order = useKDSStore.getState().orders[orderId];
    if (!order) return null;

    const trackingUrl = buildTrackingUrl(order.trackingToken);
    const statusHistory = _statusUpdateLog.filter(s => s.orderId === orderId);

    let estimatedReadyMinutes = order.prepTimeMinutes || DEFAULT_PREP_TIME_MINS;
    if (order.estimatedReadyTime) {
        const readyTime = new Date(order.estimatedReadyTime).getTime();
        const now = Date.now();
        estimatedReadyMinutes = Math.max(0, Math.ceil((readyTime - now) / 60000));
    }

    let delayMinutes: number | undefined;
    if (order.isDelayed && order.delayLog?.length) {
        delayMinutes = order.delayLog.reduce((sum, entry) => sum + entry.minutes, 0);
    }

    return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        currentStage: order.stage,
        estimatedReadyMinutes,
        estimatedReadyTime: order.estimatedReadyTime,
        isDelayed: order.isDelayed,
        delayMinutes,
        trackingUrl,
        statusHistory,
        lastUpdatedAt: order.updatedAt,
    };
}

/**
 * Get the tracking state for a specific tracking token (customer-facing).
 */
export function getTrackingStateByToken(trackingToken: string): CustomerTrackingState | null {
    const orders = useKDSStore.getState().orders;
    const order = Object.values(orders).find(o => o.trackingToken === trackingToken);
    if (!order) return null;
    return getCustomerTrackingState(order.id);
}

/**
 * Get all status updates for an order.
 */
export function getStatusUpdatesForOrder(orderId: string): CustomerStatusUpdate[] {
    return _statusUpdateLog.filter(s => s.orderId === orderId);
}

/**
 * Get the full status update log.
 */
export function getStatusUpdateLog(): Readonly<CustomerStatusUpdate[]> {
    return [..._statusUpdateLog];
}

/**
 * Constants exported for UI consumption.
 */
export { DEFAULT_PREP_TIME_MINS, DELAY_INCREMENT_MINS, TRACKING_BASE_URL };
