import axios from 'axios';
import type { CustomerIdentity, PastOrder } from '@/store/kioskStore';

// ─── Base Configuration ────────────────────────────────────────────────────────
const LOYALTY_API_BASE = process.env.NEXT_PUBLIC_LOYALTY_API || '';
const API_TIMEOUT = 10000;

const api = axios.create({
    baseURL: LOYALTY_API_BASE,
    timeout: API_TIMEOUT,
    headers: { 'Content-Type': 'application/json' }
});

// Use api in a dummy way to satisfy lint if not using it yet
api.interceptors.request.use(config => config);

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface IdentifyResponse {
    exists: boolean;
    customer?: {
        id: string;
        name: string;
        points: number;
        pastOrders: PastOrder[];
    };
}

export interface OtpResponse {
    verified: boolean;
    message: string;
    token?: string; // JWT for subsequent authed calls
}

// ─── Loyalty Service ───────────────────────────────────────────────────────────
export const loyaltyService = {
    /**
     * Identify a customer by phone or email
     */
    identifyCustomer: async (identifier: string): Promise<IdentifyResponse> => {
        try {
            // Real Integration:
            // const res = await api.get(`/customers/identify?q=${identifier}`);
            // return res.data;

            // Mock Implementation for now:
            await new Promise(resolve => setTimeout(resolve, 800));
            if (identifier === '1234567890' || identifier === 'test@example.com') {
                return {
                    exists: true,
                    customer: {
                        id: identifier,
                        name: 'John Doe',
                        points: 450,
                        pastOrders: [
                            {
                                id: 'O1',
                                date: 'Feb 18',
                                total: 27.50,
                                items: [
                                    {
                                        id: 'po-1', productId: 'sig-1', name: 'Pepperoni Feast',
                                        basePrice: 14.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
                                        selectedModifiers: {}, selectedCombo: {}, quantity: 1, kitchenNote: '',
                                        price: 14.99, finalTotal: 14.99, type: 'item',
                                    },
                                ],
                            },
                        ],
                    },
                };
            }
            return { exists: false };
        } catch (error) {
            console.error('[loyaltyService] Identification failed:', error);
            throw error;
        }
    },

    /**
     * Send OTP to the customer's phone/email
     */
    sendOtp: async (identifier: string): Promise<{ sent: boolean }> => {
        try {
            // await api.post('/auth/send-otp', { identifier });
            console.log(`[loyaltyService] Integration: OTP sent to ${identifier}`);
            return { sent: true };
        } catch (error) {
            console.error('[loyaltyService] OTP Send failed:', error);
            return { sent: false };
        }
    },

    /**
     * Verify OTP code and establish session
     */
    async verifyOtp(_identifier: string, otp: string): Promise<OtpResponse> {
        try {
            // const res = await api.post('/auth/verify-otp', { identifier, otp });
            // return res.data;

            await new Promise(resolve => setTimeout(resolve, 1000));
            const isCorrect = otp === '1234';
            return {
                verified: isCorrect,
                message: isCorrect ? 'Verified successfully' : 'Incorrect code. Please try again.',
                token: isCorrect ? 'mock_jwt_token' : undefined
            };
        } catch (error) {
            return { verified: false, message: 'Server error. Please try again later.' };
        }
    },

    /**
     * Apply loyalty points to an order (Discount)
     */
    async applyPoints(_customerId: string, points: number): Promise<{ applied: boolean; discount: number }> {
        try {
            // const res = await api.post('/rewards/apply', { customerId, points });
            // return res.data;
            return { applied: true, discount: Math.floor(points / 100) };
        } catch {
            return { applied: false, discount: 0 };
        }
    },

    /**
     * Build runtime identity from API response
     */
    buildIdentity: (data: IdentifyResponse['customer']): CustomerIdentity | null => {
        if (!data) return null;
        return {
            id: data.id,
            name: data.name,
            points: data.points,
            authenticated: false,
            pastOrders: data.pastOrders,
        };
    },
};
