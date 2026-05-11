import React from 'react';
import { ShopHeader } from '@/modules/shop/components/ShopHeader';

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <ShopHeader />
            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
