import { Suspense } from 'react';
import { CustomerLookupPage } from '@/modules/pos/pages/CustomerLookupPage';

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading search...</div>}>
            <CustomerLookupPage />
        </Suspense>
    );
}
