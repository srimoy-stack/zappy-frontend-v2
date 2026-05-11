'use client';

import { useEffect, useState } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { CheckCircle2, Receipt } from 'lucide-react';

export function SuccessScreen() {
    const { resetSession, kitchenQueueCount, identity } = useKioskStore();
    const [countdown, setCountdown] = useState(20);

    const orderNumber = Math.floor(100 + Math.random() * 900);
    const eta = kitchenQueueCount * 5;

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleReturn();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleReturn = () => {
        resetSession();
    };

    return (
        <div className="kiosk-success-screen">
            {/* Animated checkmark */}
            <div className="kiosk-success-icon-container">
                <div className="kiosk-success-icon">
                    <CheckCircle2 size={100} />
                </div>
            </div>

            <h1 className="kiosk-success-title">Order Confirmed!</h1>
            <p className="kiosk-success-subtitle">
                Thank you for your order. We&apos;re preparing it right now.
            </p>

            {/* Order Info Cards */}
            <div className="kiosk-success-cards">
                <div className="kiosk-success-card">
                    <span className="kiosk-success-card-label">Order Number</span>
                    <span className="kiosk-success-card-value order-huge">#{orderNumber}</span>
                </div>
                <div className="kiosk-success-card">
                    <span className="kiosk-success-card-label">Est. Ready In</span>
                    <div className="kiosk-success-card-time">
                        <span className="kiosk-success-card-value">{eta}</span>
                        <span className="kiosk-success-card-unit">mins</span>
                    </div>
                </div>
            </div>

            {/* Receipt */}
            <div className="kiosk-success-receipt">
                <Receipt size={40} />
                <p>
                    A receipt has been sent to<br />
                    <strong>{identity?.id || 'your phone'}</strong>
                </p>
            </div>

            {/* Finish */}
            <button onClick={handleReturn} className="kiosk-success-finish-btn">
                Finish
            </button>
            <p className="kiosk-success-countdown">
                Auto-return in {countdown}s
            </p>

            {/* Decorative elements */}
            <div className="kiosk-success-blur kiosk-success-blur--1" />
            <div className="kiosk-success-blur kiosk-success-blur--2" />
        </div>
    );
}
