'use client';

import { useState, useEffect, useCallback } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { menuService } from '@/services/kiosk/menuService';
import { ATTRACT_SLIDES } from '../config/attractSlides';

/**
 * AttractScreen - Fullscreen infinite slideshow for Kiosk.
 * Features:
 * - Auto-advancing slides every 6s
 * - Fade transitions
 * - Background data prefetch
 * - Tap anywhere to start
 */
export function AttractScreen() {
    const { startSession, navigateTo } = useKioskStore();
    const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const nextSlide = useCallback(() => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentSlideIdx((prev) => (prev + 1) % ATTRACT_SLIDES.length);
            setIsTransitioning(false);
        }, 600); // Fade duration
    }, []);

    useEffect(() => {
        const interval = setInterval(nextSlide, 6000);

        // Prefetch background data (Step 7)
        if (typeof window !== 'undefined' && !(window as any).kioskPrefetched) {
            const prefetchData = async () => {
                try {
                    await Promise.all([
                        menuService.getMenu('default'),
                        // Mocking other required fetches as they use the same data source for now
                        new Promise(resolve => setTimeout(resolve, 500))
                    ]);
                    (window as any).kioskPrefetched = true;
                    console.log('Kiosk background data prefetched');
                } catch (err) {
                    console.warn('Data prefetch failed', err);
                }
            };
            prefetchData();
        }

        // Preload next image (Step 8)
        const nextIdx = (currentSlideIdx + 1) % ATTRACT_SLIDES.length;
        const nextSlideData = ATTRACT_SLIDES[nextIdx];
        if (nextSlideData?.type === 'image' && nextSlideData.mediaUrl) {
            const img = new Image();
            img.src = nextSlideData.mediaUrl;
        }

        return () => clearInterval(interval);
    }, [nextSlide, currentSlideIdx]);

    const handleStart = () => {
        startSession();
        // Step 5: Navigate to next step
        navigateTo('identity');
    };

    const currentSlide = ATTRACT_SLIDES[currentSlideIdx];

    if (!currentSlide) return null;

    return (
        <div className="kiosk-attract-root" onClick={handleStart}>
            {/* Background Media */}
            <div className={`kiosk-attract-media-container ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                {currentSlide.type === 'image' ? (
                    <img
                        src={currentSlide.mediaUrl}
                        alt={currentSlide.title}
                        className="kiosk-attract-media"
                    />
                ) : (
                    <video
                        src={currentSlide.mediaUrl}
                        className="kiosk-attract-media"
                        muted
                        autoPlay
                        loop
                        playsInline
                    />
                )}
            </div>

            {/* Dark Overlay (Step 4) */}
            <div className="kiosk-attract-overlay" />

            {/* Text Content Block (Step 4) */}
            <div className="kiosk-attract-content">
                {currentSlide.badge && (
                    <div className="kiosk-attract-badge">{currentSlide.badge}</div>
                )}
                <h1 className="kiosk-attract-title">{currentSlide.title}</h1>
                {currentSlide.subtitle && (
                    <p className="kiosk-attract-subtitle">{currentSlide.subtitle}</p>
                )}
                {currentSlide.priceHighlight && (
                    <div className="kiosk-attract-price">{currentSlide.priceHighlight}</div>
                )}
            </div>

            {/* Tap to Start (Step 5) */}
            <div className="kiosk-attract-tap-hint">
                TAP ANYWHERE TO START
            </div>
        </div>
    );
}
