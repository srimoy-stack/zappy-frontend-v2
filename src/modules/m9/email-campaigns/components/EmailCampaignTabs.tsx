'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Mail, FileText, BarChart3, Users, LayoutDashboard, Contact2, ShieldAlert, Settings, ScrollText } from 'lucide-react';

const TABS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/backoffice/email-campaigns/dashboard',
        icon: LayoutDashboard,
    },
    {
        id: 'campaigns',
        label: 'Campaigns',
        href: '/backoffice/email-campaigns/campaigns',
        icon: Mail,
    },
    {
        id: 'segments',
        label: 'Segments',
        href: '/backoffice/email-campaigns/segments',
        icon: Users,
    },
    {
        id: 'templates',
        label: 'Templates',
        href: '/backoffice/email-campaigns/templates',
        icon: FileText,
    },
    {
        id: 'contacts',
        label: 'Contacts',
        href: '/backoffice/email-campaigns/contacts',
        icon: Contact2,
    },
    {
        id: 'suppression',
        label: 'Suppression',
        href: '/backoffice/email-campaigns/suppression',
        icon: ShieldAlert,
    },
    {
        id: 'analytics',
        label: 'Analytics',
        href: '/backoffice/email-campaigns/analytics',
        icon: BarChart3,
    },
    {
        id: 'settings',
        label: 'Settings',
        href: '/backoffice/email-campaigns/settings',
        icon: Settings,
    },
    {
        id: 'audit',
        label: 'Audit Log',
        href: '/backoffice/email-campaigns/audit',
        icon: ScrollText,
    },
] as const;

export const EmailCampaignTabs: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl w-fit overflow-x-auto">
            {TABS.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => router.push(tab.href)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
                            ${isActive
                                ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200/50 ring-1 ring-slate-200/60'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                            }
                        `}
                    >
                        <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                        {tab.label}
                    </button>
                );
            })}
        </nav>
    );
};

