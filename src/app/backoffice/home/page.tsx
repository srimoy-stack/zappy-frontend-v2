'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { UserType } from '@/shared/types/auth';
import { HomePage } from '@/modules/m9/pages';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function Page() {
    const { user, role, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    // Role-based Access Control: Only Brand Admins (or higher) get this specific Executive Dashboard
    const isBrandAdmin = role === UserType.BRAND_ADMIN || role === UserType.PLATFORM_SUPER_ADMIN;

    if (!isBrandAdmin) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-10 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Access Restricted</h2>
                    <p className="text-slate-500 font-medium">
                        The Executive Dashboard is highly restricted and only available to Brand Administrators. 
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Context-aware Greeting */}
            <div className="absolute top-8 right-8 z-50 text-right hidden lg:block">
                <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-lg shadow-emerald-500/10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logged in as</p>
                    <p className="text-sm font-bold text-slate-800">{user?.name || 'Brand Executive'}</p>
                </div>
            </div>
            
            {/* Render the Beautiful Dashboard */}
            <HomePage />
        </div>
    );
}
