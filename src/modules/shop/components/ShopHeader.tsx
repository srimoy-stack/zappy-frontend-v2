'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '../mock/data';
import { Settings } from 'lucide-react';

export const ShopHeader: React.FC = () => {
    const pathname = usePathname();

    return (
        <header className="bg-white border-b border-slate-100 sticky top-14 z-30">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left: Navigation Categories */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    {CATEGORIES.map((cat) => {
                        const isActive = pathname === `/backoffice/shop/${cat.id}` || (pathname === '/backoffice/shop' && cat.id === 'packaging');
                        return (
                            <Link
                                key={cat.id}
                                href={`/backoffice/shop/${cat.id}`}
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all rounded-xl shrink-0 ${isActive
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {cat.name}
                            </Link>
                        )
                    })}
                </div>

                {/* Right: Admin Link */}
                <Link
                    href="/backoffice/shop/admin"
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${pathname === '/backoffice/shop/admin'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                        : 'bg-slate-900 text-white hover:bg-black'
                        }`}
                >
                    <Settings size={14} className={pathname === '/backoffice/shop/admin' ? 'animate-spin-slow' : ''} />
                    {pathname === '/backoffice/shop/admin' ? 'Shop Admin' : 'Control Panel'}
                </Link>
            </div>
        </header>
    );
};
