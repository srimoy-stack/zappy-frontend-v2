import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundSettings {
    volume: number;
    newOrder: boolean;
    delayed: boolean;
    overdue: boolean;
}

interface SoundState {
    settings: SoundSettings;
    playedEvents: Set<string>;
    setVolume: (volume: number) => void;
    toggleEvent: (event: keyof Omit<SoundSettings, 'volume'>) => void;
    markEventPlayed: (eventId: string) => void;
    setSettings: (settings: SoundSettings) => void;
}


export const useSoundStore = create<SoundState>()(
    persist(
        (set) => ({
            settings: {
                volume: 0.5,
                newOrder: true,
                delayed: true,
                overdue: true,
            },
            playedEvents: new Set<string>(),
            setVolume: (volume) =>
                set((state) => ({ settings: { ...state.settings, volume } })),
            toggleEvent: (event) =>
                set((state) => ({
                    settings: { ...state.settings, [event]: !state.settings[event] },
                })),
            markEventPlayed: (eventId) =>
                set((state) => {
                    const newPlayed = new Set(state.playedEvents);
                    newPlayed.add(eventId);
                    return { playedEvents: newPlayed };
                }),
            setSettings: (settings) => set({ settings }),
        }),

        {
            name: 'kds-sound-settings',
            partialize: (state) => ({ settings: state.settings }), // Only persist settings
        }
    )
);
