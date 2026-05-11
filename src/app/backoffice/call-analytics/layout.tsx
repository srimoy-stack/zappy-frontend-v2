'use client';

import { ReactNode } from 'react';
import { CallAnalyticsTabs } from '@/modules/ai-call-analytics/components/CallAnalyticsTabs';
import { DateRangeProvider } from '@/modules/ai-call-analytics/components/DateRangeContext';
import { GlobalDatePicker } from '@/modules/ai-call-analytics/components/GlobalDatePicker';

/**
 * AI Call Analytics Layout
 *
 * Provides the shared tabbed navigation, global date range filter,
 * and layout structure for all sub-pages.
 * Follows the same pattern as the Email Campaigns module layout.
 */
export default function CallAnalyticsLayout({ children }: { children: ReactNode }) {
    return (
        <DateRangeProvider defaultPreset="30d">
            <div className="flex flex-col min-h-screen">
                {/* Module Header (Sticky) */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 lg:px-6">
                    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 flex-wrap">
                            <CallAnalyticsTabs />
                        </div>
                        <GlobalDatePicker />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 w-full bg-slate-50/30">
                    <div className="py-6">
                        {children}
                    </div>
                </main>
            </div>
        </DateRangeProvider>
    );
}
