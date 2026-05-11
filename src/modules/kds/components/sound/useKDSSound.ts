'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type SoundEvent = 'NEW_ORDER' | 'ORDER_UPDATED' | 'ORDER_CANCELLED' | 'ORDER_DELAYED' | 'SLA_BREACH' | 'SLA_WARNING' | 'BUMP_ORDER';

interface SoundSettings {
    isMuted: boolean;
    volume: number;
    enabledEvents: Record<SoundEvent, boolean>;
}

const DEFAULT_SETTINGS: SoundSettings = {
    isMuted: false,
    volume: 0.8,
    enabledEvents: {
        NEW_ORDER: true,
        ORDER_UPDATED: false,
        ORDER_CANCELLED: true,
        ORDER_DELAYED: true,
        SLA_BREACH: true,
        SLA_WARNING: true,
        BUMP_ORDER: true,
    },
};

const STORAGE_KEY = 'zyappy_kds_sound_settings';

export function useKDSSound() {
    const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SETTINGS);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Load from localStorage once mounted
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse sound settings", e);
            }
        }
        setIsInitialized(true);
    }, []);

    const lastTriggered = useRef<Record<string, number>>({});

    // 2. Save to localStorage only after initialization
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
    }, [settings, isInitialized]);

    const soundMap: Record<SoundEvent, string> = {
        NEW_ORDER: '/sounds/new-order.mp3',
        ORDER_UPDATED: '/sounds/confirm.mp3',
        ORDER_CANCELLED: '/sounds/alert.mp3',
        ORDER_DELAYED: '/sounds/alert.mp3',
        SLA_BREACH: '/sounds/breach.mp3',
        SLA_WARNING: '/sounds/warning-beep.mp3',
        BUMP_ORDER: '/sounds/confirm.mp3',
    };

    const playSound = useCallback((eventType: SoundEvent, orderId?: string) => {
        if (settings.isMuted || !settings.enabledEvents[eventType]) return;

        // Duplicate trigger prevention
        const key = `${eventType}_${orderId || 'global'}`;
        const now = Date.now();
        if (lastTriggered.current[key] && now - lastTriggered.current[key] < 2000) {
            return;
        }
        lastTriggered.current[key] = now;

        try {
            const audio = new Audio(soundMap[eventType]);
            audio.volume = settings.volume;
            audio.play().catch(() => {
                // Silent catch for browser autoplay restrictions
            });
        } catch (e) {
            console.error('KDS Sound Error:', e);
        }
    }, [settings]);

    const toggleMute = () => {
        setSettings(prev => ({ ...prev, isMuted: !prev.isMuted }));
    };

    const setVolume = (value: number) => {
        setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, value)) }));
    };

    const toggleEvent = (eventType: SoundEvent) => {
        setSettings(prev => ({
            ...prev,
            enabledEvents: {
                ...prev.enabledEvents,
                [eventType]: !prev.enabledEvents[eventType],
            },
        }));
    };

    return {
        settings,
        playSound,
        toggleMute,
        setVolume,
        toggleEvent,
    };
}
