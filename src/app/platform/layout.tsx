'use client';

import React, { Suspense } from 'react';
import { Sidebar } from '@/modules/m9/components/Sidebar/Sidebar';
import { Header } from '@/modules/m9/components/Header/Header';
import { RoleGuard } from '@/modules/m9/components/Auth/RoleGuard';
import { ToastProvider } from '@/modules/shop/context/ToastContext';

/**
 * PlatformLayout
 * gated exclusively to PLATFORM_SUPER_ADMIN users.
 */
export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={['PLATFORM_SUPER_ADMIN']} mode="403">
            <ToastProvider>
                <Suspense fallback={null}>
                    <div className="min-h-screen bg-slate-50 flex">
                        <Sidebar />
                        <div className="flex-1 flex flex-col min-h-screen ml-64 transition-all duration-300 min-w-0">
                            <Header />
                            <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                                <div className="animate-in fade-in duration-500">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                </Suspense>
            </ToastProvider>
        </RoleGuard>
    );
}
