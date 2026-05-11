import React from 'react';
import { StoreSelector } from './StoreSelector';
import { DateRangePicker } from './DateRangePicker';
import { Search, Bell } from 'lucide-react';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { cn } from '@/utils';
import { usePathname } from 'next/navigation';
import { ShopSearch } from '@/modules/shop/components/ShopSearch';
import { ShopCartTrigger } from '@/modules/shop/components/ShopCartTrigger';

import { UserType } from '@/shared/types/auth';

/**
 * Header Component (Production Grade)
 * Adapts to user role, shows user profile, and removes dev-only controls.
 */
export const Header: React.FC = () => {
    const { user, userType, isSuperAdmin } = useRouteAccess();
    const pathname = usePathname();
    const isShop = pathname?.startsWith('/backoffice/shop');

    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const isPlatformRoot = isSuperAdmin || pathname?.startsWith('/platform');

    const getRoleBadgeColor = () => {
        switch (userType) {
            case UserType.PLATFORM_SUPER_ADMIN: return 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200';
            case UserType.BRAND_ADMIN: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case UserType.ADMIN: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case UserType.MANAGER: return 'bg-blue-100 text-blue-800 border-blue-200';
            case UserType.POS_USER: return 'bg-slate-100 text-slate-800 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left: Context & Role Badge */}
            <div className="flex items-center gap-4">
                {isPlatformRoot ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-900 bg-slate-900 rounded-full text-white shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">System Root</span>
                    </div>
                ) : (
                    <StoreSelector />
                )}

                <div className="h-6 w-[1px] bg-slate-200 mx-1" />
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all",
                    getRoleBadgeColor()
                )}>
                    {userType?.replace('_', ' ')}
                </span>
            </div>

            {/* Center: Top Priority Content */}
            <div className="flex-1 flex justify-center max-w-2xl mx-8 text-center">
                {isShop ? (
                    <ShopSearch />
                ) : isPlatformRoot ? (
                    <div className="animate-in fade-in duration-700">
                        {/* Empty or specific platform-wide utility could go here */}
                    </div>
                ) : (
                    <DateRangePicker />
                )}
            </div>

            {/* Right: User Actions & Profile */}
            <div className="flex items-center gap-2">
                {isShop ? (
                    <ShopCartTrigger />
                ) : (
                    <button
                        onClick={() => alert('Global Search Coming Soon!')}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                )}

                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={cn(
                            "p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all",
                            showNotifications && "bg-slate-100 text-slate-900"
                        )}
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notifications</span>
                                <span className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">Mark all as read</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <p className="text-xs font-bold text-slate-900">New Sale Recorded</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Sale #12940 was completed for $420.00</p>
                                    <p className="text-[9px] text-slate-400 mt-1 font-medium">2 MINUTES AGO</p>
                                </div>
                                <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <p className="text-xs font-bold text-slate-900">Inventory Alert</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Item "Z-Phone Case" is low on stock (5 left)</p>
                                    <p className="text-[9px] text-slate-400 mt-1 font-medium">1 HOUR AGO</p>
                                </div>
                            </div>
                            <div className="p-2 border-t border-slate-100 text-center">
                                <button className="text-xs font-bold text-slate-500 hover:text-slate-900 py-1 w-fullTransition-colors">View All Notifications</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                {/* User Profile Info */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={cn(
                            "flex items-center gap-3 ml-1 pl-2 border-l border-slate-100 hover:bg-slate-50 py-1 rounded-lg transition-all",
                            showUserMenu && "bg-slate-50"
                        )}
                    >
                        <div className="flex flex-col items-end hidden md:flex">
                            <span className="text-xs font-bold text-slate-900 leading-none">{user?.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">
                                {isSuperAdmin ? 'Zyappy Global' : `Tenant: ${user?.tenantId}`}
                            </span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                            {user?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-1">
                                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Settings</p>
                                </div>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                    Profile Settings
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                    Company Profile
                                </button>
                                <div className="h-px bg-slate-100 my-1 px-1" />
                                <button
                                    onClick={() => alert('Logging out...')}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
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
