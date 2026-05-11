/**
 * pinAuthService.ts
 * 
 * Manages 4-digit PIN authentication for sensitive KDS actions.
 * Accepted PINs: "1234", "0000"
 */

export interface PinAuthResponse {
    action_token: string;
    expires_at: number;
}

// In-memory storage for the active action token
let activeActionToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Verifies a 4-digit PIN for sensitive actions.
 */
export async function verifyPin(pin: string): Promise<PinAuthResponse> {
    // Simulate slight network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const acceptedPins = ['1234', '0000'];

    if (!acceptedPins.includes(pin)) {
        throw new Error('Invalid PIN. Please try again.');
    }

    const response: PinAuthResponse = {
        action_token: 'mock-action-token-' + Math.random().toString(36).substring(7),
        expires_at: Date.now() + (10 * 60 * 1000) // 10 minutes expiry
    };

    activeActionToken = response.action_token;
    tokenExpiry = response.expires_at;

    return response;
}

/**
 * Checks if a valid, non-expired action token exists in memory.
 */
export function isActionAuthenticated(): boolean {
    if (!activeActionToken || !tokenExpiry) return false;
    return Date.now() <= tokenExpiry;
}

/**
 * Retrieves the current action token.
 */
export function getActionToken(): string | null {
    if (!isActionAuthenticated()) return null;
    return activeActionToken;
}

/**
 * Clears the authenticated session.
 */
export function clearActionAuth(): void {
    activeActionToken = null;
    tokenExpiry = null;
}
