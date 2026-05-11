'use client';

import { Suspense } from 'react';
import { POSOrderSuccessScreen } from '@/modules/pos/pages';

export default function Page() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="animate-pulse text-[#10B981] font-black text-2xl">
                    FINALIZING ORDER...
                </div>
            </div>
        }>
            <POSOrderSuccessScreen />
        </Suspense>
    );
}
