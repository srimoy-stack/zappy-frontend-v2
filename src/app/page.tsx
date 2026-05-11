'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { getDefaultPage } from '@/shared/types/auth';

export default function RootPage() {
    const { userType, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const target = userType ? getDefaultPage(userType) : '/backoffice/home';
        router.replace(target);
    }, [userType, isLoading, router]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
