'use client';

import { Suspense } from 'react';
import { POSCustomerScreen } from '@/modules/pos/pages';

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen bg-white flex items-center justify-center text-brand/40 font-black uppercase tracking-widest">Initialising Identity Hub...</div>}>
            <POSCustomerScreen />
        </Suspense>
    );
}
