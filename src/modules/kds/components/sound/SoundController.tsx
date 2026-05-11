'use client';

import React, { useEffect } from 'react';

/**
 * SoundController handles preloading of critical KDS sound assets.
 * This component should be rendered once at the root of the KDS layout.
 */
export const SoundController: React.FC = () => {
    useEffect(() => {
        const sounds = [
            '/sounds/new-order.mp3',
            '/sounds/confirm.mp3',
            '/sounds/alert.mp3',
            '/sounds/breach.mp3'
        ];

        sounds.forEach(src => {
            const audio = new Audio();
            audio.src = src;
            audio.preload = 'auto';
        });
    }, []);

    return null; // Headless component
};
