'use client';

import React, { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { UserRole } from '@/types';
import { Lock, ArrowLeft } from 'lucide-react';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
    mode?: 'redirect' | '403';
}

const IMPERSONATION_KEY = 'zyappy_impersonation_session';

function hasValidImpersonationSession(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const raw = sessionStorage.getItem(IMPERSONATION_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return parsed?.expiresAt && Date.now() <= parsed.expiresAt;
    } catch {
        return false;
    }
}

/**
 * RoleGuard Component
 * UX-level protection for unauthorized routes.
 * Redirects unauthorized users or returns a 403 state.
 *
 * Impersonation-aware: if a PLATFORM_SUPER_ADMIN holds a valid impersonation
 * session token, they are granted pass-through access to all /backoffice/* routes.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    mode = 'redirect'
}) => {
    const { isAuthenticated, isLoading, role } = useAuth();
    const { isAuthorized, getVisibleMenuItems } = useRouteAccess();
    const pathname = usePathname();
    const router = useRouter();

    // Super Admin impersonating a brand → grant full backoffice access
    const isImpersonating =
        role === 'PLATFORM_SUPER_ADMIN' &&
        (pathname?.startsWith('/backoffice') ?? false) &&
        hasValidImpersonationSession();

    // Check if user has permission
    const isUserAuthorized = isImpersonating
        ? true
        : allowedRoles
            ? (role && allowedRoles.includes(role))
            : isAuthorized(pathname || '');

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (!isUserAuthorized && mode === 'redirect') {
                const allowedItems = getVisibleMenuItems();
                const firstAllowed = allowedItems[0];
                const fallback = firstAllowed ? firstAllowed.route : '/backoffice/home';

                console.warn(`Access denied to ${pathname}. Redirecting to ${fallback}`);
                router.replace(fallback);
            }
        } else if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, pathname, isUserAuthorized, getVisibleMenuItems, router, mode]);

    // Still loading session
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    // Path check
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!isUserAuthorized) {
        if (mode === '403') {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-12 flex flex-col items-center text-center space-y-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-red-50 flex items-center justify-center border border-red-100 shadow-inner">
                                <Lock className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    You don't have the required administrative permissions to access the platform root.
                                    Please contact your system coordinator.
                                </p>
                            </div>
                            <div className="w-full pt-4">
                                <button
                                    onClick={() => router.back()}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Return to Safety
                                </button>
                                <span className="block mt-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Error 403: Forbidden Identity</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return <>{children}</>;
};

