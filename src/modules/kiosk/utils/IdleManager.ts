'use client';


/**
 * IdleManager - Manages kiosk inactivity reset.
 * Behavior:
 * - 90s idle timer
 * - Resets on interaction (click, touch, keydown)
 * - On expire: Cleans up all state and returns to /kiosk/start
 */
export const IdleManager = {
    setup: (onReset: () => void) => {
        let timeout: ReturnType<typeof setTimeout>;
        const IDLE_TIME = 90000; // 90 seconds

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                onReset();
            }, IDLE_TIME);
        };

        const events = ['click', 'touchstart', 'keydown'];

        const attachListeners = () => {
            events.forEach(event => {
                window.addEventListener(event, resetTimer, { passive: true });
            });
        };

        const detachListeners = () => {
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
            clearTimeout(timeout);
        };

        attachListeners();
        resetTimer();

        return detachListeners;
    }
};

/**
 * Security Cleanup (Step 10)
 * Clears all PII, tokens, and storage
 */
export const performSecurityCleanup = () => {
    // 1. Clear LocalStorage
    localStorage.clear();

    // 2. Clear Session Cookies (if any - simulated here)
    document.cookie.split(";").forEach((c) => {
        document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 3. Clear Kiosk Specific Keys
    const kioskKeys = ['kiosk_session', 'kiosk_cart', 'kiosk_token', 'otp_cache'];
    kioskKeys.forEach(key => localStorage.removeItem(key));

    console.log('Security cleanup performed: PII and session data removed.');
};
