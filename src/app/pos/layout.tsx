'use client';

import React, { Suspense } from 'react';
import { POSProvider } from '@/modules/pos/context/POSContext';
import { ToastProvider } from '@/modules/shop/context/ToastContext';
import { RouteGuard } from '@/shared/guards/RouteGuard';

import { ShiftOpeningModal } from '@/modules/pos/components/ShiftOpeningModal';
import { SyncingLoader } from '@/modules/pos/components/SyncingLoader';

export default function POSLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard allowedPrefix="/pos">
            <ToastProvider>
                <Suspense fallback={null}>
                    <POSProvider>
                        <div className="min-h-screen bg-slate-900 overflow-x-hidden">
                            {children}
                            <ShiftOpeningModal />
                            <SyncingLoader />
                        </div>
                    </POSProvider>
                </Suspense>
            </ToastProvider>
        </RouteGuard>
    );
}
