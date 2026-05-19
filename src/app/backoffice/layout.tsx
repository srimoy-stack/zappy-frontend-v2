'use client';

import React, { Suspense } from 'react';
import { Sidebar } from '@/modules/m9/components/Sidebar/Sidebar';
import { Header } from '@/modules/m9/components/Header/Header';
import { RouteGuard } from '@/shared/guards/RouteGuard';
// UserRole imported via canonical auth.ts through navigation resolver
import { ImpersonationBanner } from '@/modules/m9/components/Auth/ImpersonationBanner';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { CartProvider } from '@/modules/shop/context/CartContext';
import { ToastProvider } from '@/modules/shop/context/ToastContext';
import { getNavigationByUserType } from '@/shared/config/navigation';
import { useEntitlements } from '@/shared/entitlements';
import { useAuth } from '@/shared/contexts';
import { useImpersonation } from '@/app/providers/ImpersonationProvider';
import { UserType } from '@/shared/types/auth';

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isShop = pathname?.startsWith('/backoffice/shop');
    const { entitlementPaths } = useEntitlements();
    const { permissions, userType, isSuperAdmin } = useAuth();

    const filteredNav = getNavigationByUserType(userType, {
        entitlementPaths,
        permissions,
        isSuperAdmin,
    });

    const { isImpersonating } = useImpersonation();
    const canShowNewSale = (isImpersonating || !isSuperAdmin) && 
        userType && [UserType.BRAND_ADMIN, UserType.ADMIN, UserType.MANAGER].includes(userType);

    return (
        <RouteGuard allowedPrefix="/backoffice">
            <ToastProvider>
                <CartProvider>
                    <Suspense fallback={null}>
                        <div className="min-h-screen bg-slate-50 flex flex-col">
                            <ImpersonationBanner />
                            <div className="flex flex-1">
                                <Sidebar
                                    navItems={filteredNav}
                                    variant="backoffice"
                                    showNewSale={!!canShowNewSale}
                                    logoHref="/backoffice/home"
                                />
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
        </RouteGuard>
    );
}
