import axios from 'axios';
import type { CartItem, OrderType } from '@/store/kioskStore';

// ─── Base Configuration ────────────────────────────────────────────────────────
const POS_API_BASE = process.env.NEXT_PUBLIC_POS_API || '';
const pos = axios.create({ baseURL: POS_API_BASE, timeout: 15000 });
pos.interceptors.request.use(config => config);

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface OrderPayload {
    items: CartItem[];
    orderType: OrderType;
    customerId?: string;
    restaurantId: string;
    subtotal: number;
    tax: number;
    total: number;
}

export interface OrderResponse {
    success: boolean;
    orderId: string;
    orderNumber: number;
    estimatedMinutes: number;
    receiptUrl?: string;
}

export interface PrinterStatus {
    available: boolean;
    hasPaper: boolean;
    isOnline: boolean;
    message: string;
}

// ─── POS Service ───────────────────────────────────────────────────────────────
export const posService = {
    /**
     * Submit an order to the POS system
     * This establishes the "handshake" between Kiosk and Kitchen
     */
    submitOrder: async (payload: OrderPayload): Promise<OrderResponse> => {
        try {
            // Real Integration:
            // const res = await pos.post('/orders', payload);
            // return res.data;

            await new Promise(resolve => setTimeout(resolve, 1800));
            const queueCount = await posService.getKitchenQueue(payload.restaurantId);

            return {
                success: true,
                orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                orderNumber: Math.floor(100 + Math.random() * 899),
                estimatedMinutes: 8 + (queueCount * 2), // 8 mins base + 2 mins per order in queue
            };
        } catch (error) {
            console.error('[posService] Order submission failed:', error);
            throw error;
        }
    },

    /**
     * Physical hardware handshake for the receipt printer
     * Usually communicates via a local bridge or direct IPP
     */
    checkPrinter: async (): Promise<PrinterStatus> => {
        try {
            // Real Integration (check local printer agent):
            // const res = await axios.get('http://localhost:9100/status');

            await new Promise(resolve => setTimeout(resolve, 400));
            const isOnline = true;
            const hasPaper = Math.random() > 0.05;

            return {
                available: isOnline,
                hasPaper,
                isOnline,
                message: isOnline && hasPaper ? 'Printer ready' : !hasPaper ? 'OUT OF PAPER' : 'PRINTER OFFLINE',
            };
        } catch {
            return { available: false, hasPaper: false, isOnline: false, message: 'PRINTER BRIDGE UNREACHABLE' };
        }
    },

    /**
     * Get current kitchen queue count for dynamic ETA calculation
     */
    getKitchenQueue: async (_restaurantId: string): Promise<number> => {
        try {
            // const res = await pos.get(`/status/queue?restaurantId=${_restaurantId}`);
            // return res.data.count;
            return Math.floor(Math.random() * 6); // 0-5 orders in queue
        } catch {
            return 3; // Fallback
        }
    },
};
