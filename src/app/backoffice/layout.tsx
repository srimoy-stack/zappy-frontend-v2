'use client';

import React, { Suspense } from 'react';
import { Sidebar } from '@/modules/m9/components/Sidebar/Sidebar';
import { Header } from '@/modules/m9/components/Header/Header';
import { RoleGuard } from '@/modules/m9/components/Auth/RoleGuard';
import { ImpersonationBanner } from '@/modules/m9/components/Auth/ImpersonationBanner';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { CartProvider } from '@/modules/shop/context/CartContext';
import { ToastProvider } from '@/modules/shop/context/ToastContext';

export default function BackofficeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isShop = pathname?.startsWith('/backoffice/shop');

    return (
        <RoleGuard>
            <ToastProvider>
                <CartProvider>
                    <Suspense fallback={null}>
                        <div className="min-h-screen bg-slate-50 flex flex-col">
                            {/* Impersonation warning banner — only visible when Super Admin is impersonating */}
                            <ImpersonationBanner />
                            <div className="flex flex-1">
                                <Sidebar />
                                <div className="flex-1 flex flex-col min-h-screen ml-64 transition-all duration-300 min-w-0">
                                    <Header />
                                    <main className={cn(
                                        "flex-1 overflow-y-auto overflow-x-hidden",
                                        isShop ? "p-0" : "p-6"
                                    )}>
                                        <div className="animate-in fade-in duration-500">
                                            {children}
                                        </div>
                                    </main>
                                </div>
                            </div>
                        </div>
                    </Suspense>
                </CartProvider>
            </ToastProvider>
        </RoleGuard>
    );
}
