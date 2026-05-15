'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { iconMap } from '@/config/navigation';
import { SidebarItem } from './SidebarItem';
import { cn } from '@/utils';
import { useRouteAccess } from '@/hooks/useRouteAccess';

/**
 * Sidebar Component (Production Grade)
 * Renders dynamically from navigationConfig and current user permissions.
 */
export const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { role, getVisibleMenuItems } = useRouteAccess();
    const menuItems = getVisibleMenuItems();

    const isPlatform = role === 'PLATFORM_SUPER_ADMIN';
    const { isImpersonating, pathname } = useRouteAccess();

    // Determine brand logo link
    const getLogoLink = () => {
        if (isPlatform) {
            // If in backoffice/KDS or impersonating, clicking logo goes to items setup (requested focal point)
            if (isImpersonating || pathname?.startsWith('/backoffice') || pathname?.startsWith('/kds')) {
                return "/backoffice/items";
            }
            return "/platform/brands";
        }
        return "/backoffice";
    };

    // Primary action button allowed for BRAND_ADMIN, ADMIN and STORE_MANAGER roles (hidden for Platform)
    const showNewSale = (role === 'BRAND_ADMIN' || role === 'ADMIN' || role === 'STORE_MANAGER') && !isPlatform;

    return (
        <div
            className={cn(
                'flex flex-col bg-white fixed inset-y-0 z-50 border-r border-slate-200 transition-all duration-300',
                isCollapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Brand / Logo Area */}
            <div className={cn(
                'flex h-14 shrink-0 items-center px-4',
                isCollapsed ? 'justify-center border-b border-slate-50' : 'justify-start mb-2'
            )}>
                <Link
                    href={getLogoLink()}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center shadow transition-all",
                        isPlatform ? "bg-slate-900 shadow-slate-200" : "bg-emerald-600 shadow-emerald-100"
                    )}>
                        <span className="text-white text-[10px] font-bold tracking-tighter">Z</span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800 tracking-tight lowercase leading-none">
                                zyappy
                            </span>
                            {isPlatform && (
                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Platform</span>
                            )}
                        </div>
                    )}
                </Link>
            </div>

            {/* Primary Action Button */}
            {showNewSale && (
                <div className="px-4 mb-4 mt-2">
                    <button
                        onClick={() => alert('Opening POS Terminal for New Sale...')}
                        className={cn(
                            "w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center transition-all duration-200 active:scale-95",
                            isCollapsed ? "justify-center h-12" : "px-4 py-2 gap-2 h-11"
                        )}
                    >
                        <Plus className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="text-sm font-bold">New sale</span>}
                    </button>
                </div>
            )}

            {/* Navigation (Filtered by Role) */}
            <nav className="flex flex-1 flex-col px-3 gap-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                    return (
                        <SidebarItem
                            key={item.id}
                            label={item.label}
                            icon={IconComponent}
                            path={item.route}
                            isCollapsed={isCollapsed}
                        />
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-md text-[10px] font-bold text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all uppercase tracking-widest',
                        isCollapsed && 'justify-center'
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <>
                            <ChevronLeft className="h-5 w-5" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
