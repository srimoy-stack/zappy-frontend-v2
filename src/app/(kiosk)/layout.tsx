'use client';

import React, { useEffect, Suspense } from 'react';
import KioskViewController from '@/modules/kiosk/KioskViewController';

// Kiosk SPA Styles (bundled via JS imports)
import '@/modules/kiosk/kiosk.css';
import '@/modules/kiosk/kiosk-screens.css';
import '@/modules/kiosk/kiosk-extra.css';
import '@/modules/kiosk/kiosk-builder.css';

import { IdleManager, performSecurityCleanup } from '@/modules/kiosk/utils/IdleManager';
import { useKioskStore } from '@/store/kioskStore';
import { useRouter } from 'next/navigation';

/**
 * Kiosk Layout - Root SPA container.
 * - Locks down viewport (no zoom, no scroll, no select)
 * - Manages global idle timeout via IdleManager
 * - Renders the SPA view controller
 */
export default function KioskLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const resetSession = useKioskStore(s => s.resetSession);
    const router = useRouter();

    useEffect(() => {
        // Setup Idle Reset (Step 6)
        const cleanupIdle = IdleManager.setup(() => {
            console.log('Idle timeout reached. Resetting session and cleaning up...');

            // 1. Security Cleanup (Step 10)
            performSecurityCleanup();

            // 2. Clear state in store
            resetSession();

            // 3. Navigate to start (Step 6)
            router.push('/kiosk/start');
        });

        return () => cleanupIdle();
    }, [resetSession, router]);

    useEffect(() => {
        // Apply kiosk-specific lockdown styles
        document.documentElement.classList.add('kiosk-mode');
        document.body.classList.add('kiosk-mode');

        // Prevent pinch zoom
        const preventZoom = (e: TouchEvent) => {
            if (e.touches.length > 1) e.preventDefault();
        };
        const preventCtrlZoom = (e: WheelEvent) => {
            if (e.ctrlKey) e.preventDefault();
        };

        document.addEventListener('touchstart', preventZoom, { passive: false });
        document.addEventListener('wheel', preventCtrlZoom, { passive: false });

        return () => {
            document.documentElement.classList.remove('kiosk-mode');
            document.body.classList.remove('kiosk-mode');
            document.removeEventListener('touchstart', preventZoom);
            document.removeEventListener('wheel', preventCtrlZoom);
        };
    }, []);

    return (
        <Suspense fallback={null}>
            <div
                className="kiosk-root"
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="kiosk-frame">
                    <KioskViewController />
                    {/* {children} is included so Next.js doesn't complain, but is unused */}
                    <div style={{ display: 'none' }}>{children}</div>
                </div>
            </div>
        </Suspense>
    );
}
