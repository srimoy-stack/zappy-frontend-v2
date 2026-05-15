'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface SidebarItemProps {
    label: string;
    icon: LucideIcon;
    path: string;
    isCollapsed: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    label,
    icon: Icon,
    path,
    isCollapsed,
}) => {
    const pathname = usePathname();
    const isActive = pathname === path || (pathname?.startsWith(path + '/') ?? false);

    return (
        <Link
            href={path}
            className={cn(
                'flex items-center gap-3 px-3 h-10 text-sm font-medium rounded-md relative',
                isActive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? label : undefined}
        >
            {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full" />
            )}
            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-emerald-600" : "text-slate-400")} aria-hidden="true" />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );
};
