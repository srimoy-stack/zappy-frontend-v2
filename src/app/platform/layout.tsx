'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Sidebar } from '@/modules/m9/components/Sidebar/Sidebar';
import { Header } from '@/modules/m9/components/Header/Header';
import { RouteGuard } from '@/shared/guards/RouteGuard';
import { ToastProvider } from '@/modules/shop/context/ToastContext';
import { platformNavigation } from '@/shared/config/navigation/platform.nav';
import { ContextErrorBoundary } from '@/shared/components/ContextErrorBoundary';
import { cn } from '@/utils';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <RouteGuard allowedPrefix="/platform">
            <ToastProvider>
                <ContextErrorBoundary>
                    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
                        <Sidebar
                            navItems={platformNavigation}
                            variant="platform"
                            logoHref="/platform/tenants"
                        />
                        
                        <div className="flex-1 flex flex-col min-h-screen ml-64 transition-all duration-300 min-w-0">
                            <Header />
                            
                            <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                                <Suspense fallback={null}>
                                    {children}
                                </Suspense>
                            </main>
                        </div>
                    </div>
                </ContextErrorBoundary>
            </ToastProvider>
        </RouteGuard>
    );
}
