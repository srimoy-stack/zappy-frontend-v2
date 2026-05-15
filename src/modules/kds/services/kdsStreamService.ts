/**
 * kdsStreamService.ts
 *
 * Handles real-time event streaming for the KDS module using Server-Sent Events (SSE).
 *
 * Requirement 10.3: Order feed (real-time)
 *   Endpoint: GET /api/kds/stream?station_id=...
 *
 * Events Handled:
 *   - order.new
 *   - order.updated
 *   - order.cancelled
 *   - ticket.stage_changed
 *   - ticket.rerouted
 */

import { useKDSStore } from '../store/kdsStore';
import { KDSOrder, KDSOrderTicket } from '../types/kds';

class KDSStreamService {
    private mockInterval: any = null;

    eventSource: EventSource | null = null;
    stationId: string | null = null;

    /**
     * Connects to the KDS SSE stream for a specific station.
     */
    connect(stationId: string) {
        if (this.eventSource) {
            this.disconnect();
        }

        this.stationId = stationId;

        // In development, we might not have a real backend at this URL
        const url = `/api/kds/stream?station_id=${stationId}`;

        console.info(`[KDSStream] Connecting to ${url}...`);

        try {
            const es = new EventSource(url);
            this.eventSource = es;

            es.onopen = () => {
                console.info('[KDSStream] Connection established.');
                this.stopMockSimulation();
            };

            es.onerror = (error) => {
                // EventSource errors relate to the connection state
                if (es.readyState === EventSource.CLOSED) {
                    console.warn('[KDSStream] Connection failed or closed by server. Switching to simulation mode.');
                    this.startMockSimulation();
                } else if (es.readyState === EventSource.CONNECTING) {
                    console.debug('[KDSStream] Reconnecting...');
                } else {
                    console.debug('[KDSStream] Stream error occurred:', error);
                }
            };

            // ── 1. order.new ─────────────────────────────────────────────────────
            es.addEventListener('order.new', (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                const { order, ticket }: { order: KDSOrder; ticket?: KDSOrderTicket } = data;
                console.info(`[KDSStream] New Order: #${order.orderNumber}`);

                useKDSStore.getState().addOrUpdateOrder(order);
                if (ticket) {
                    // Handle ticket updates if the store supports it specifically, 
                    // or just rely on addOrUpdateOrder if it merges them.
                }
            });

            // ── 2. order.updated ─────────────────────────────────────────────────
            es.addEventListener('order.updated', (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                const { order }: { order: KDSOrder } = data;
                console.info(`[KDSStream] Order Updated: #${order.orderNumber}`);
                useKDSStore.getState().addOrUpdateOrder(order);
            });

            // ── 3. order.cancelled ───────────────────────────────────────────────
            es.addEventListener('order.cancelled', (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                const { orderId }: { orderId: string } = data;
                console.info(`[KDSStream] Order Cancelled: ${orderId}`);
                // Logic to remove or mark as cancelled
                useKDSStore.getState().removeOrder(orderId);
            });

            // ── 4. ticket.stage_changed ──────────────────────────────────────────
            es.addEventListener('ticket.stage_changed', (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                const { ticketId, orderId, newStage }: { ticketId: string; orderId: string; newStage: any } = data;
                console.info(`[KDSStream] Ticket Stage Changed: ${ticketId} -> ${newStage}`);

                // Update the order stage in the store
                useKDSStore.getState().updateOrderStage(orderId, newStage);
            });

            // ── 5. ticket.rerouted ───────────────────────────────────────────────
            es.addEventListener('ticket.rerouted', (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                const { ticket, order }: { ticket: KDSOrderTicket; order?: KDSOrder } = data;
                console.info(`[KDSStream] Ticket Rerouted: ${ticket.id}`);

                if (order) {
                    useKDSStore.getState().addOrUpdateOrder(order);
                }
                // Update tickets list in store if it differs from order items
            });
        } catch (err) {
            console.error('[KDSStream] Failed to initialize EventSource:', err);
            this.startMockSimulation();
        }
    }

    /**
     * Disconnects from the current stream.
     */
    disconnect() {
        if (this.eventSource) {
            console.info('[KDSStream] Disconnecting...');
            this.eventSource.close();
            this.eventSource = null;
        }
        this.stationId = null;
        this.stopMockSimulation();
    }

    /**
     * Reconnects to the stream (useful after network loss or station change).
     */
    reconnect() {
        if (this.stationId) {
            this.connect(this.stationId);
        }
    }

    /**
     * Starts a timer to simulate incoming orders when the backend is missing.
     */
    private startMockSimulation() {
        if (this.mockInterval) return;
        console.info('[KDSStream] Starting mock simulation (Random orders every 30-60s)...');

        this.mockInterval = setInterval(() => {
            // Randomly decide if we should push an update
            if (Math.random() > 0.7) {
                this.simulateNewOrder();
            }
        }, 15000); // Check every 15s
    }

    private stopMockSimulation() {
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
            this.mockInterval = null;
        }
    }

    private simulateNewOrder() {
        const orderId = `ext-${Math.random().toString(36).slice(2, 9)}`;
        const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();

        const newOrder: KDSOrder = {
            id: orderId,
            orderNumber,
            order_source: 'ONLINE',
            fulfillment_type: 'PICKUP',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stage: 'NEW',
            prepTimeMinutes: 15,
            estimatedReadyTime: new Date(Date.now() + 15 * 60000).toISOString(),
            isDelayed: false,
            trackingToken: `track-${orderId}`,
            customerName: 'Guest Sim',
            items: [
                {
                    id: `${orderId}-i1`,
                    name: 'Simulated Burger',
                    quantity: 1,
                    modifiers: [],
                    categoryId: 'BURGERS'
                }
            ]
        };

        console.info(`[KDSStream-MOCK] Simulating New Order: #${orderNumber}`);
        useKDSStore.getState().addOrUpdateOrder(newOrder);
    }
}

export const kdsStreamService = new KDSStreamService();
