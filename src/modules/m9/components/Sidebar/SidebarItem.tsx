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
    children?: {
        id: string;
        label: string;
        href: string;
        icon: LucideIcon;
    }[];
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    label,
    icon: Icon,
    path,
    isCollapsed,
    children,
}) => {
    const pathname = usePathname();
    const hasChildren = children && children.length > 0;

    // Determine if parent is active (e.g. if we are on parent route or any child route)
    const isParentActive = pathname === path || (pathname?.startsWith(path + '/') ?? false) || (children?.some(child => pathname === child.href || pathname?.startsWith(child.href + '/')) ?? false);

    const [isOpen, setIsOpen] = React.useState(() => {
        // Keep open if one of children is active
        return children ? children.some(child => {
            const childPath = child.href.split('?')[0];
            return pathname === child.href || pathname === childPath || pathname?.startsWith(childPath + '/');
        }) : false;
    });

    // Sync open state when path changes to a child route
    React.useEffect(() => {
        if (children) {
            const hasActiveChild = children.some(child => {
                const childPath = child.href.split('?')[0];
                return pathname === child.href || pathname === childPath || pathname?.startsWith(childPath + '/');
            });
            if (hasActiveChild) {
                setIsOpen(true);
            }
        }
    }, [pathname, children]);

    if (hasChildren && !isCollapsed) {
        return (
            <div className="space-y-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'w-full flex items-center justify-between px-3 h-10 text-sm font-medium rounded-md relative text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all',
                        isParentActive && 'text-slate-900 font-semibold'
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5 shrink-0 transition-colors", isParentActive ? "text-emerald-600" : "text-slate-400")} aria-hidden="true" />
                        <span>{label}</span>
                    </div>
                    <svg
                        className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isOpen && (
                    <div className="pl-6 space-y-1 ml-5 border-l border-slate-100 animate-in slide-in-from-top-1 duration-200">
                        {children.map(child => {
                            // Match path correctly (ignoring query parameters for active state comparison if needed, or exact matching)
                            const childPathOnly = child.href.split('?')[0];
                            const isChildActive = pathname === child.href || pathname === childPathOnly || (childPathOnly !== '/backoffice/settings' && pathname?.startsWith(childPathOnly + '/'));
                            const ChildIcon = child.icon;

                            return (
                                <Link
                                    key={child.id}
                                    href={child.href}
                                    className={cn(
                                        'flex items-center gap-2 px-3 h-8 text-[11px] font-black uppercase tracking-wider rounded-md relative transition-all',
                                        isChildActive
                                            ? 'text-emerald-700 bg-emerald-50'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    )}
                                >
                                    {isChildActive && (
                                        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-600 rounded-r-full" />
                                    )}
                                    {ChildIcon && <ChildIcon className={cn("w-3.5 h-3.5 shrink-0", isChildActive ? "text-emerald-600" : "text-slate-400")} />}
                                    <span>{child.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Default item rendering
    return (
        <Link
            href={path}
            className={cn(
                'flex items-center gap-3 px-3 h-10 text-sm font-medium rounded-md relative',
                isParentActive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? label : undefined}
        >
            {isParentActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full" />
            )}
            <Icon className={cn("h-5 w-5 shrink-0", isParentActive ? "text-emerald-600" : "text-slate-400")} aria-hidden="true" />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );
};
