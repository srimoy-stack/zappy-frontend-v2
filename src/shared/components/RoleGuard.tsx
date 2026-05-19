'use client';

/**
 * RoleGuard — Shared role-based route protection.
 *
 * Wraps a page/section and blocks access if the user's role
 * is not in the allowedRoles list.
 *
 * Modes:
 *   'redirect' — navigates to the first allowed route
 *   '403'      — renders an inline Access Denied page
 */

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { UserType } from '@/shared/types/auth';
import { Lock, ArrowLeft } from 'lucide-react';

interface RoleGuardProps {
    children: ReactNode;
    allowedUserTypes: UserType[];
    mode?: 'redirect' | '403';
    redirectTo?: string;
}

export function RoleGuard({
    children,
    allowedUserTypes,
    mode = 'redirect',
    redirectTo = '/backoffice/home',
}: RoleGuardProps) {
    const { isAuthenticated, isLoading, userType } = useAuth();
    const router = useRouter();

    const isAuthorized = !!userType && allowedUserTypes.includes(userType);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }
        if (!isAuthorized && mode === 'redirect') {
            router.replace(redirectTo);
        }
    }, [isLoading, isAuthenticated, isAuthorized, mode, redirectTo, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        );
    }

    if (!isAuthorized && mode === '403') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-12 flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                            <Lock className="w-9 h-9 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
                            <p className="text-sm text-slate-500">
                                You don't have the required permissions to access this area.
                            </p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        );
    }

    return <>{children}</>;
}
