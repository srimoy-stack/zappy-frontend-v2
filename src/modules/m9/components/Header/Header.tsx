'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StoreSelector } from './StoreSelector';
import { DateRangePicker } from './DateRangePicker';
import { Search, Bell, Store, ChevronDown, User, LogOut, Settings, Shield, Menu } from 'lucide-react';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { cn } from '@/utils';
import { usePathname } from 'next/navigation';
import { ShopSearch } from '@/modules/shop/components/ShopSearch';
import { ShopCartTrigger } from '@/modules/shop/components/ShopCartTrigger';
import { UserType } from '@/shared/types/auth';
import { logout } from '@/shared/utils/auth';

export const Header: React.FC = () => {
    const { user, userType, isSuperAdmin } = useRouteAccess();
    const pathname = usePathname();
    const isShop = pathname?.startsWith('/backoffice/shop');

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const isPlatformRoot = isSuperAdmin || pathname?.startsWith('/platform');

    // Ref to handle closing menus when clicking outside
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getRoleBadgeColor = () => {
        switch (userType) {
            case UserType.PLATFORM_SUPER_ADMIN: 
                return 'bg-slate-950 text-white border-slate-950 shadow-sm';
            case UserType.BRAND_ADMIN: 
                return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
            case UserType.ADMIN: 
                return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
            case UserType.MANAGER: 
                return 'bg-blue-50 text-blue-700 border-blue-200/80';
            case UserType.POS_USER: 
                return 'bg-slate-50 text-slate-700 border-slate-200';
            default: 
                return 'bg-slate-50 text-slate-600 border-slate-250';
        }
    };

    return (
        <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm/50 backdrop-blur-md">
            {/* Left: Brand Identity & Role Info */}
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-950 rounded-xl shadow-md text-white">
                        <Store className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
                            {user?.tenantName || "Zappy Brand Admin"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1 leading-none">
                            {isPlatformRoot ? "Platform Control" : "Master Catalogue"}
                        </span>
                    </div>
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div className="flex items-center gap-2.5">
                    {/* Dynamic Role Badge */}
                    <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                        getRoleBadgeColor()
                    )}>
                        {userType ? userType.replace('_', ' ') : 'USER'}
                    </span>

                    {/* Active Store Context Selection */}
                    {!isPlatformRoot && (
                        <div className="flex items-center">
                            <StoreSelector />
                        </div>
                    )}
                </div>
            </div>

            {/* Center: Search / Date Range Picker (Enterprise Layout) */}
            <div className="flex-1 flex justify-center max-w-xl mx-6">
                {isShop ? (
                    <ShopSearch />
                ) : isPlatformRoot ? (
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                        🛡️ Secure Administrator Platform
                    </div>
                ) : (
                    <div className="flex items-center bg-slate-50 border border-slate-200/80 px-3.5 py-1 rounded-xl shadow-inner max-w-sm w-full justify-center">
                        <DateRangePicker />
                    </div>
                )}
            </div>

            {/* Right: Quick Utilities & Account Control */}
            <div className="flex items-center gap-3">
                {isShop ? (
                    <ShopCartTrigger />
                ) : (
                    <button
                        type="button"
                        onClick={() => alert('Global Search Coming Soon!')}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                        title="Global Search"
                    >
                        <Search className="w-4.5 h-4.5" />
                    </button>
                )}

                {/* Notifications Panel */}
                <div className="relative" ref={notificationRef}>
                    <button
                        type="button"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={cn(
                            "p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all relative",
                            showNotifications && "bg-slate-50 text-slate-900"
                        )}
                        title="Notifications"
                    >
                        <Bell className="w-4.5 h-4.5" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4.5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notifications</span>
                                <span className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer uppercase tracking-wider">Mark all as read</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <p className="text-xs font-bold text-slate-900">New Sale Recorded</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Sale #12940 was completed for $420.00</p>
                                    <p className="text-[8px] text-slate-400 mt-1 font-bold">2 MINUTES AGO</p>
                                </div>
                                <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <p className="text-xs font-bold text-slate-900">Inventory Alert</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Item "Z-Phone Case" is low on stock (5 left)</p>
                                    <p className="text-[8px] text-slate-400 mt-1 font-bold">1 HOUR AGO</p>
                                </div>
                            </div>
                            <div className="p-2 border-t border-slate-100 text-center">
                                <button className="text-xs font-black text-slate-500 hover:text-slate-900 py-1 w-full transition-colors uppercase tracking-wider">View All Notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-5 w-[1px] bg-slate-200" />

                {/* Professional User Dropdown Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        type="button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={cn(
                            "flex items-center gap-2.5 pl-2 pr-1.5 py-1.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent",
                            showUserMenu && "bg-slate-50 border-slate-200/80 shadow-sm"
                        )}
                    >
                        <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-950 flex items-center justify-center text-xs font-black text-emerald-400 uppercase relative shadow-inner">
                            {user?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide leading-none">
                                {user?.name || "Administrator"}
                            </span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-1 leading-none">
                                {user?.email || "admin@zyappy.com"}
                            </span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-1.5">
                                <div className="px-3.5 py-2.5 border-b border-slate-100 mb-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Control</p>
                                </div>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left">
                                    <User className="w-4 h-4 text-slate-400" />
                                    Profile Settings
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left">
                                    <Settings className="w-4 h-4 text-slate-400" />
                                    Company Settings
                                </button>
                                <div className="h-px bg-slate-100 my-1.5" />
                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left uppercase tracking-wider"
                                >
                                    <LogOut className="w-4 h-4 text-rose-500" />
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
