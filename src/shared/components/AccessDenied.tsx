'use client';

/**
 * AccessDenied — Full-page fallback for unauthorized access.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
    title?: string;
    message?: string;
    showBack?: boolean;
}

export function AccessDenied({
    title = 'Access Denied',
    message = 'You don\'t have permission to access this page. Contact your administrator if you believe this is an error.',
    showBack = true,
}: AccessDeniedProps) {
    const router = useRouter();

    return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-12 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                        <ShieldAlert className="w-9 h-9 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
                    </div>
                    {showBack && (
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
