/**
 * mockMessagingService.ts
 *
 * Simulated messaging service for the KDS module.
 *
 * Provides a mock implementation of customer notification delivery that:
 *   1. Simulates a 300ms network round-trip.
 *   2. Appends a log entry to the order's notificationsLog via the KDS store.
 *   3. Emits an "order.customer_notification" event through the event dispatcher.
 *
 * This service is a drop-in placeholder. When a real messaging backend is
 * available, replace the simulated delay with an actual HTTP / gRPC call while
 * keeping the same function signature.
 *
 * Usage:
 *   import { sendCustomerMessage } from './mockMessagingService';
 *
 *   await sendCustomerMessage('order-123', 'SMS', 'Your order is ready!');
 */

import { useKDSStore } from '../store/kdsStore';
import { emitEvent } from './kdsEventDispatcher';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export type MessageChannel = 'SMS' | 'EMAIL' | 'BOTH';

export interface SendMessageResult {
    success: boolean;
    /** The notification log entry that was appended (on success) */
    logEntry?: {
        channel: MessageChannel;
        message: string;
        sentAt: string;
        sentBy: string;
    };
    /** Human-readable status message */
    statusMessage: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Simulated network delay
// ─────────────────────────────────────────────────────────────────────────────

const SIMULATED_NETWORK_DELAY_MS = 300;

function simulateNetworkDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, SIMULATED_NETWORK_DELAY_MS));
}

// ─────────────────────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a customer-facing notification for an order.
 *
 * Simulates a 300ms network delay, then:
 *   - Appends a log entry to `order.notificationsLog` in the KDS store.
 *   - Emits an `order.customer_notification` event via the event dispatcher.
 *
 * @param orderId  The internal KDS order ID.
 * @param channel  Delivery channel — SMS, EMAIL, or BOTH.
 * @param message  The message body to send to the customer.
 *
 * @returns A result object indicating success/failure and the log entry.
 */
export async function sendCustomerMessage(
    orderId: string,
    channel: MessageChannel,
    message: string
): Promise<SendMessageResult> {
    // ── 1. Validate order exists ──────────────────────────────────────────────
    const order = useKDSStore.getState().orders[orderId];
    if (!order) {
        console.warn(
            `[MockMessaging] Order "${orderId}" not found — notification skipped.`
        );
        return {
            success: false,
            statusMessage: `Order "${orderId}" not found.`
        };
    }

    // ── 2. Simulate network round-trip ────────────────────────────────────────
    await simulateNetworkDelay();

    // ── 3. Build log entry ────────────────────────────────────────────────────
    const now = new Date().toISOString();
    const logEntry = {
        channel,
        message,
        sentAt: now,
        sentBy: 'KDS_SYSTEM'
    };

    // ── 4. Append to order.notificationsLog via store ─────────────────────────
    useKDSStore.setState((state) => {
        const currentOrder = state.orders[orderId];
        if (!currentOrder) return state;

        return {
            orders: {
                ...state.orders,
                [orderId]: {
                    ...currentOrder,
                    notificationsLog: [
                        ...(currentOrder.notificationsLog || []),
                        logEntry
                    ]
                }
            }
        };
    });

    // ── 5. Emit domain event ──────────────────────────────────────────────────
    const idempotencyKey = `notification-${orderId}-${now}`;
    emitEvent(
        'order.customer_notification',
        {
            orderId,
            orderNumber: order.orderNumber,
            channel,
            message,
            sentAt: now,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail
        },
        { idempotencyKey }
    );

    console.info(
        `[MockMessaging] Notification sent — order: #${order.orderNumber}, ` +
        `channel: ${channel}, message: "${message.slice(0, 60)}…"`
    );

    return {
        success: true,
        logEntry,
        statusMessage: `Message sent via ${channel} for order #${order.orderNumber}.`
    };
}
