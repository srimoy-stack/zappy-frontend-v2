/**
 * Payment Terminal SDK Abstraction Layer
 * Handles card terminal communication, tap-to-pay, NFC, etc.
 * This layer abstracts the physical payment terminal SDK.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────
export type PaymentMethod = 'card' | 'tap' | 'apple_pay' | 'google_pay';

export interface PaymentRequest {
    amount: number;
    orderId: string;
    method?: PaymentMethod;
}

export interface PaymentResponse {
    success: boolean;
    transactionId: string;
    method: PaymentMethod;
    last4?: string;
    message: string;
}

export type TerminalEvent =
    | { type: 'waiting'; message: string }
    | { type: 'card_detected'; message: string }
    | { type: 'processing'; message: string }
    | { type: 'approved'; transactionId: string }
    | { type: 'declined'; message: string }
    | { type: 'error'; message: string };

// ─── Payment Service ───────────────────────────────────────────────────────────
export const paymentService = {
    /**
     * Initialize the physical payment terminal hardware
     */
    initTerminal: async (): Promise<{ ready: boolean; hardwareInfo?: string }> => {
        // Real Integration:
        // return SDK.initialize({ apiKey: '...', deviceId: 'KIOSK-01' });

        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            ready: true,
            hardwareInfo: 'Verifone P400 - Connected v2.4.1'
        };
    },

    /**
     * Process a payment through the terminal SDK
     * Simulates the full state machine of a physical card terminal
     */
    processPayment: async (
        _request: PaymentRequest,
        onEvent?: (event: TerminalEvent) => void
    ): Promise<PaymentResponse> => {
        try {
            // 1. Initial Handshake
            onEvent?.({ type: 'waiting', message: 'Ready: Tap, Insert, or Swipe' });
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Simulate User Interaction (Card Detected)
            onEvent?.({ type: 'card_detected', message: 'Card Chip Detected - Do Not Remove' });
            await new Promise(resolve => setTimeout(resolve, 1200));

            // 3. Simulate SDK <-> Bank Communication
            onEvent?.({ type: 'processing', message: 'Authorizing with Bank...' });

            // Real Integration (pseudo-code):
            // const txn = await SDK.charge({ 
            //    amount: _request.amount, 
            //    currency: 'USD',
            //    capture: true 
            // });

            await new Promise(resolve => setTimeout(resolve, 1500));

            // 4. Handle Result (Simulated 95% success)
            const isApproved = Math.random() > 0.05;
            const transactionId = `AUTH-${Math.random().toString(36).toUpperCase().slice(2, 10)}`;

            if (isApproved) {
                onEvent?.({ type: 'approved', transactionId });
                return {
                    success: true,
                    transactionId,
                    method: 'tap',
                    last4: '9012',
                    message: 'APPROVED',
                };
            } else {
                const reasons = ['DECLINED', 'INSUFFICIENT FUNDS', 'TIMED OUT', 'CHIP ERROR'];
                const message = reasons[Math.floor(Math.random() * reasons.length)] || 'DECLINED';
                onEvent?.({ type: 'declined', message });
                return {
                    success: false,
                    transactionId: '',
                    method: 'card',
                    message: message,
                };
            }
        } catch (error) {
            onEvent?.({ type: 'error', message: 'Terminal Communication Failure' });
            return {
                success: false,
                transactionId: '',
                method: 'card',
                message: 'Integration Error',
            };
        }
    },

    /**
     * Cancel an active payment session on the terminal hardware
     */
    cancelPayment: async (): Promise<void> => {
        // await SDK.abort();
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('[paymentService] SDK: Abort signal sent to terminal');
    },

    /**
     * Real-time health check for the kiosk monitoring dashboard
     */
    checkTerminalHealth: async (): Promise<{ connected: boolean; batteryLevel?: number; status: string }> => {
        await new Promise(resolve => setTimeout(resolve, 150));
        return {
            connected: true,
            batteryLevel: 98,
            status: 'ONLINE'
        };
    },
};
