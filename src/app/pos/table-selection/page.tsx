import { Suspense } from 'react';
import { TableSelectionPage } from '@/modules/pos/pages';

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase">Loading Floor Map...</div>}>
            <TableSelectionPage />
        </Suspense>
    );
}
