'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useKioskStore } from '@/store/kioskStore';

/**
 * Global idle timeout hook for the Kiosk.
 * Monitors user activity (touch, mouse, keyboard, scroll).
 * After 90s of inactivity:
 *   1. Clears cart
 *   2. Clears identity
 *   3. Navigates to start screen
 */
export function useIdleTimeout() {
    const resetSession = useKioskStore(s => s.resetSession);
    const sessionActive = useKioskStore(s => s.sessionActive);
    const currentScreen = useKioskStore(s => s.currentScreen);
    const idleTimeoutMs = useKioskStore(s => s.idleTimeoutMs);
    const touchActivity = useKioskStore(s => s.touchActivity);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Don't start idle timer on start screen or success screen
        if (!sessionActive || currentScreen === 'start' || currentScreen === 'success') {
            return;
        }

        // Don't reset during payment processing
        if (currentScreen === 'payment') {
            return;
        }

        touchActivity();

        timeoutRef.current = setTimeout(() => {
            resetSession();
        }, idleTimeoutMs);
    }, [sessionActive, currentScreen, idleTimeoutMs, resetSession, touchActivity]);

    useEffect(() => {
        const events: (keyof WindowEventMap)[] = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'touchmove',
            'click',
        ];

        const listener = () => resetTimer();

        events.forEach(event => {
            window.addEventListener(event, listener, { passive: true });
        });

        // Start the timer
        resetTimer();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, listener);
            });
        };
    }, [resetTimer]);
}
