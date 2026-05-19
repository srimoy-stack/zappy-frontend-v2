'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, Clock, ChevronRight } from 'lucide-react';
import { useImpersonation } from '@/app/providers/ImpersonationProvider';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatTimeRemaining(expiresAt: number): string {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';
    const minutes = Math.floor(remaining / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1000);
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m remaining`;
    }
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s remaining`;
}

// ─── Component ──────────────────────────────────────────────────────────────────

/**
 * ImpersonationBanner
 *
 * A fixed banner displayed at the top of the Back Office when a Super Admin
 * is impersonating a brand's admin session.
 *
 * Features:
 *  - Displays brand name + actor name
 *  - Live countdown timer until session expires
 *  - "Return to Super Admin" button that ends the session and redirects back
 */
export const ImpersonationBanner: React.FC = () => {
    const { session, isImpersonating, endImpersonation } = useImpersonation();
    const router = useRouter();
    const [timeLabel, setTimeLabel] = useState('');

    // Update the countdown every second
    useEffect(() => {
        if (!session) return;
        const tick = () => setTimeLabel(formatTimeRemaining(session.expiresAt));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [session]);

    if (!isImpersonating || !session) return null;

    const handleReturn = () => {
        endImpersonation();
        router.push('/platform/tenants');
    };

    return (
        <div
            className="
                w-full z-[9999] 
                bg-gradient-to-r from-amber-500 via-orange-500 to-red-500
                text-white
                flex items-center justify-between
                px-4 py-2
                shadow-lg
                animate-in slide-in-from-top-2 duration-300
            "
            role="alert"
            aria-live="polite"
        >
            {/* Left: Warning Icon + Message */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <ShieldAlert className="w-4 h-4 text-white" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-80">
                        Super Admin Access
                    </span>
                    <ChevronRight className="w-3 h-3 opacity-60 flex-shrink-0" />
                    <span className="text-sm font-black tracking-tight">
                        You are accessing{' '}
                        <span className="underline decoration-white/50">
                            {session.brandName}
                        </span>{' '}
                        as Super Admin
                    </span>
                    <span className="text-[10px] font-medium opacity-70 hidden sm:inline">
                        · Actor: {session.actorName}
                    </span>
                </div>
            </div>

            {/* Right: Timer + Exit */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {/* Countdown */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full backdrop-blur-sm">
                    <Clock className="w-3 h-3 opacity-70" />
                    <span className="text-[11px] font-bold tabular-nums">{timeLabel}</span>
                </div>

                {/* Return Button */}
                <button
                    onClick={handleReturn}
                    id="impersonation-return-btn"
                    className="
                        flex items-center gap-2
                        px-4 py-1.5
                        bg-white text-orange-600
                        rounded-full
                        text-[11px] font-black uppercase tracking-wider
                        hover:bg-orange-50
                        transition-all active:scale-95
                        shadow-sm
                        whitespace-nowrap
                    "
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Return to Super Admin
                </button>
            </div>
        </div>
    );
};
