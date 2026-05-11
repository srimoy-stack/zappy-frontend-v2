'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PhoneCall, Bell } from 'lucide-react';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', href: '/backoffice/call-analytics/dashboard', icon: LayoutDashboard },
    { id: 'calls', label: 'Calls', href: '/backoffice/call-analytics/calls', icon: PhoneCall },
    { id: 'alerts', label: 'Alerts', href: '/backoffice/call-analytics/alerts', icon: Bell },
] as const;

/**
 * Tab navigation for the AI Call Analytics module.
 * Follows the same pattern as EmailCampaignTabs.
 */
export const CallAnalyticsTabs: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1" role="tablist">
            {TABS.map((tab) => {
                const isActive = pathname?.startsWith(tab.href);
                const Icon = tab.icon;

                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        role="tab"
                        aria-selected={isActive}
                        id={`tab-${tab.id}`}
                        className={`
                            inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }
                        `}
                    >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
};
