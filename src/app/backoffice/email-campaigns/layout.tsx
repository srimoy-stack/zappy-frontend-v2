'use client';

import { ReactNode } from 'react';
import { EmailCampaignTabs } from '@/modules/m9/email-campaigns/components/EmailCampaignTabs';

/**
 * Email Campaigns Layout (M9 – Marketing / Customer Engagement)
 *
 * Provides the shared tabbed navigation and layout structure for all sub-pages.
 * Strictly aligned with the M9 module architecture.
 */
export default function EmailCampaignsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* ── Module Header (Sticky) ────────────────────────────── */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 lg:px-6">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <EmailCampaignTabs />
                    </div>
                </div>
            </header>

            {/* ── Main Module Content ────────────────────────────────── */}
            <main className="flex-1 w-full bg-slate-50/30">
                <div className="py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
