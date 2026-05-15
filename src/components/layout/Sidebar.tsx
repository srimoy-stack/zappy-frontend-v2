'use client';

import { LayoutDashboard, Store, Settings, Package, Users, BarChart3, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'POS Register', href: '/pos', icon: Receipt },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="flex bg-slate-900 w-64 flex-col fixed inset-y-0 z-50">
            <div className="flex h-16 shrink-0 items-center px-6 bg-slate-950">
                <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                    <Store className="h-6 w-6 text-emerald-500" />
                    <span>ZYAPPY</span>
                </div>
            </div>
            <nav className="flex flex-1 flex-col px-4 py-4 gap-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors'
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">John Doe</span>
                        <span className="text-xs text-slate-400">Admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
