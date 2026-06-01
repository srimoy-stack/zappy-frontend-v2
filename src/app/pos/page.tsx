'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function POSRoot() {
    const router = useRouter();

    useEffect(() => {
        router.push('/pos/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin shadow-lg shadow-brand/20"></div>
        </div>
    );
}
