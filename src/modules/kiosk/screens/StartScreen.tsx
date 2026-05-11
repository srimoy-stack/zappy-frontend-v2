'use client';

import { useEffect, useState, type MouseEvent, type TouchEvent } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { menuService } from '@/services/kiosk/menuService';

const SLIDES = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080&q=80',
        title: '30% OFF',
        subtitle: 'On All Large Pizzas',
        description: 'Valid for a limited time only. Order now and save big!',
        badge: 'FLASH DEAL'
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&q=80',
        title: 'Buy 1 Get 1',
        subtitle: 'FREE Every Monday',
        description: 'Double the joy with our legendary BOGO deal.',
        badge: 'MONDAY SPECIAL'
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=1080&q=80',
        title: 'Family Combo',
        subtitle: 'Full Meal for $24.99',
        description: 'Incl. 2 Medium Pizzas, 6 Wings & a Large Soda.',
        badge: 'BEST VALUE'
    },
    {
        id: '4',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=1080&q=80',
        title: 'Spicy Feast',
        subtitle: 'New Buffalo Wings',
        description: 'Experience the heat with our new signature sauce.',
        badge: 'NEW ARRIVAL'
    }
];

export function StartScreen() {
    const { startSession, resetSession, navigateTo } = useKioskStore();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        resetSession();
        menuService.getMenu('default');

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % SLIDES.length);
        }, 4000); // Auto-slide every 4 seconds

        return () => clearInterval(interval);
    }, []);

    const handleStart = (e: MouseEvent | TouchEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const scale = rect.width / 1920;

        const touch = 'touches' in e && e.touches.length > 0 ? e.touches[0] : null;
        const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
        const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

        const x = (clientX - rect.left) / scale;
        const y = (clientY - rect.top) / scale;

        setRipple({ x, y });

        setTimeout(() => {
            startSession();
            navigateTo('menu'); // On tap -> navigate to menu page
        }, 300);
    };

    return (
        <div className="kiosk-start-v4" onClick={handleStart}>
            {/* 1️⃣ Full Screen Slideshow Background */}
            <div className="kiosk-start-slider-v4">
                {SLIDES.map((slide, idx) => (
                    <div
                        key={slide.id}
                        className={`kiosk-start-slide-v4 ${idx === currentSlide ? 'active' : ''}`}
                    >
                        <img src={slide.image} alt="" />
                    </div>
                ))}
                {/* Dark atmospheric overlay */}
                <div className="kiosk-start-v4-overlay" />
            </div>

            {/* Content Layer */}
            <div className="kiosk-start-v4-content">
                {/* Branding - Top Centered */}
                <div className="kiosk-start-v4-brand">
                    <div className="v4-logo">Z</div>
                    <span className="v4-logo-text">ZYAPPY</span>
                </div>

                {/* 3️⃣ Middle Section - Trending Today */}
                <div className="kiosk-start-v4-middle">
                    <h3 className="v4-section-label">TRENDING TODAY</h3>
                    <div className="v4-trending-card">
                        <div className="v4-trending-badge">
                            {SLIDES[currentSlide]?.badge}
                        </div>
                        <h1 key={`title-${currentSlide}`} className="kiosk-screen-enter">
                            {SLIDES[currentSlide]?.title}
                        </h1>
                        <h2 key={`subtitle-${currentSlide}`} className="kiosk-screen-enter">
                            {SLIDES[currentSlide]?.subtitle}
                        </h2>
                        <p key={`desc-${currentSlide}`} className="kiosk-screen-enter">
                            {SLIDES[currentSlide]?.description}
                        </p>
                    </div>

                    {/* Minimal Dots Indicators */}
                    <div className="v4-slider-dots">
                        {SLIDES.map((_, idx) => (
                            <div
                                key={idx}
                                className={`v4-dot ${idx === currentSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 4️⃣ Bottom Fixed Section - "Tap anywhere to start" */}
                <div className="kiosk-start-v4-bottom">
                    <div className="v4-tap-bar">
                        <span className="v4-tap-text">TAP ANYWHERE TO START</span>
                        <div className="v4-tap-indicator" />
                    </div>
                </div>
            </div>

            {/* Interaction Feedback - Ripple */}
            {ripple && (
                <div
                    className="kiosk-start-ripple-v4"
                    style={{ left: ripple.x, top: ripple.y }}
                />
            )}
        </div>
    );
}
