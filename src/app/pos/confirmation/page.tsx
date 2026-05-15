'use client';

import { Suspense } from 'react';
import { POSConfirmationScreen } from '@/modules/pos/pages';

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen bg-brand/5 flex items-center justify-center font-black text-brand animate-pulse">GENERATING MANIFEST...</div>}>
            <POSConfirmationScreen />
        </Suspense>
    );
}
