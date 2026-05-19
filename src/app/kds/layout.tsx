'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/shared/guards/RouteGuard';
// Role enforcement handled by RouteGuard + canAccessPrefix
import { KDSWebSocketProvider } from '@/modules/kds/context/KDSWebSocketContext';
import { useAuth } from '@/app/providers/AuthProvider';
import { isKDSModuleActive } from '@/modules/kds/utils/kdsModuleFlags';
import { useKDSStore } from '@/modules/kds/store/kdsStore';
import { useKDSAccessStore } from '@/modules/kds/store/kdsAccessStore';
import { bootstrapKDS } from '@/modules/kds/services/kdsBootstrapService';
import { getStationToken, getStationId } from '@/modules/kds/services/stationDeviceService';
import { KDSLoadingScreen } from '@/modules/kds/components/feedback/KDSLoadingScreen';
import { KDSPermissionGuard } from '@/modules/kds/components/security/KDSPermissionGuard';

import '@/modules/kds/styles/kds-master.css';



// ─────────────────────────────────────────────────────────────────────────────
//  Bootstrap State
// ─────────────────────────────────────────────────────────────────────────────

type BootstrapPhase = 'CHECKING_SESSION' | 'BOOTSTRAPPING' | 'READY' | 'ERROR';

// ─────────────────────────────────────────────────────────────────────────────
//  KDS Layout
//
//  Authentication + Bootstrap gating flow:
//    1. Check NextAuth session → redirect to /login if missing
//    2. Check KDS module activation → show inactive screen if disabled
//    3. Execute bootstrap → hydrate all stores
//    4. Render children only after bootstrap completes
// ─────────────────────────────────────────────────────────────────────────────

export default function KDSLayout({ children }: { children: React.ReactNode }) {
    const { status: sessionStatus } = useSession();
    const router = useRouter();
    const { enabledModules, isAuthenticated: isAuthedFromAuthProvider } = useAuth();
    const { setOnlineStatus } = useKDSStore();
    const isAuthenticated = useKDSAccessStore((s) => s.isAuthenticated);

    const [phase, setPhase] = useState<BootstrapPhase>('CHECKING_SESSION');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isActive = isKDSModuleActive({ module1A: enabledModules.includes('kds') });

    // ── 1. Session Check ──────────────────────────────────────────────────────
    useEffect(() => {
        const isActuallyLoggedIn = sessionStatus === 'authenticated' || isAuthedFromAuthProvider;

        if (sessionStatus === 'loading' && !isAuthedFromAuthProvider) {
            setPhase('CHECKING_SESSION');
            return;
        }

        if (sessionStatus === 'unauthenticated' && !isAuthedFromAuthProvider) {
            // Redirect to the login page configured in NextAuth
            router.replace('/login');
            return;
        }

        // Session exists → proceed to bootstrap if not already done
        if (isActuallyLoggedIn && !isAuthenticated && (phase === 'CHECKING_SESSION' || phase === 'BOOTSTRAPPING')) {
            if (phase !== 'BOOTSTRAPPING') {
                setPhase('BOOTSTRAPPING');
            }
        }
    }, [sessionStatus, isAuthenticated, router, isAuthedFromAuthProvider, phase]);


    // ── 2. Bootstrap Execution ────────────────────────────────────────────────
    const runBootstrap = useCallback(async () => {
        try {
            await bootstrapKDS();

            // ── Mock Station Mode Check ──
            const stationToken = getStationToken();
            const stationId = getStationId();

            if (stationToken && stationId) {
                useKDSAccessStore.getState().setStationContext({
                    stationId,
                    isStationMode: true
                });
            }

            setPhase('READY');

        } catch (err) {
            console.error('[KDSLayout] Bootstrap failed:', err);
            setErrorMessage(
                err instanceof Error ? err.message : 'Unknown bootstrap error'
            );
            setPhase('ERROR');
        }
    }, []);

    useEffect(() => {
        if (phase === 'BOOTSTRAPPING') {
            runBootstrap();
        }
    }, [phase, runBootstrap]);

    // If already authenticated (e.g., navigating between KDS sub-routes), skip
    useEffect(() => {
        const isActuallyLoggedIn = sessionStatus === 'authenticated' || isAuthedFromAuthProvider;
        if (isActuallyLoggedIn && isAuthenticated && phase !== 'READY') {
            setPhase('READY');
        }
    }, [sessionStatus, isAuthenticated, phase, isAuthedFromAuthProvider]);


    // ── 3. Online/Offline Listener ────────────────────────────────────────────
    useEffect(() => {
        const handleOnline = () => setOnlineStatus(true);
        const handleOffline = () => setOnlineStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setOnlineStatus]);

    // ── 4. Body class for KDS-specific styling ────────────────────────────────
    useEffect(() => {
        document.body.classList.add('kds-body');
        return () => {
            document.body.classList.remove('kds-body');
        };
    }, []);

    // ── Render Gates ──────────────────────────────────────────────────────────
    // Gate: Session loading
    if ((phase === 'CHECKING_SESSION' || sessionStatus === 'loading') && !isAuthedFromAuthProvider) {
        return (
            <KDSLoadingScreen
                message="Verifying Session"
                detail="System check in progress..."
            />
        );
    }


    // Gate: Unauthenticated (redirect happening)
    if (sessionStatus === 'unauthenticated' && !isAuthedFromAuthProvider) {
        return (
            <KDSLoadingScreen
                message="Authentication Required"
                detail="Redirecting to login gateway..."
            />
        );
    }


    // Gate: Module inactive
    if (!isActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
                <div className="max-w-md w-full bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                    <h1 className="text-3xl font-black text-white mb-4">Module Inactive</h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        The Kitchen Display System (KDS) module is not active for this store. Please contact your administrator.
                    </p>
                </div>
            </div>
        );
    }

    // Gate: Bootstrap in progress
    if (phase === 'BOOTSTRAPPING') {
        return (
            <KDSLoadingScreen
                message="Initializing KDS"
                detail="Loading stations, routing & open orders"
            />
        );
    }


    // Gate: Bootstrap error
    if (phase === 'ERROR') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
                <div className="max-w-md w-full bg-slate-900 p-12 rounded-[2.5rem] border border-red-900/30 shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">
                        Bootstrap Failed
                    </h1>
                    <p className="text-slate-400 font-medium leading-relaxed mb-6">
                        {errorMessage || 'Unable to initialize the Kitchen Display System.'}
                    </p>
                    <button
                        onClick={() => {
                            setErrorMessage(null);
                            setPhase('BOOTSTRAPPING');
                        }}
                        className="w-full py-4 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98]"
                    >
                        Retry Bootstrap
                    </button>
                </div>
            </div>
        );
    }

    // ── All gates passed — render KDS ─────────────────────────────────────────
    return (
        <RouteGuard allowedPrefix="/kds">
            <KDSPermissionGuard permission="KDS_ORDER_VIEW">
                <KDSWebSocketProvider>
                    <div className="kds-root">
                        {children}
                    </div>
                </KDSWebSocketProvider>
            </KDSPermissionGuard>
        </RouteGuard>
    );
}
