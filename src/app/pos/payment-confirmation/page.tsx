import { Suspense } from 'react';
import { POSPaymentConfirmationScreen } from '@/modules/pos/pages';

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-black">VALIDATING TRANSACTION...</div>}>
            <POSPaymentConfirmationScreen />
        </Suspense>
    );
}
