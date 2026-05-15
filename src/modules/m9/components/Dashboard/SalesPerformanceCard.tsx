'use client';

import React, { useState } from 'react';
import { SalesChart } from './SalesChart';
import { cn } from '@/utils';

/**
 * SalesPerformanceCard Component (M9-T0.2)
 * The visual centerpiece of the Home page.
 * Features time interval toggles and the SalesChart.
 */
export const SalesPerformanceCard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');

    const tabs = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'This Week' },
        { id: 'month', label: 'This Month' },
    ] as const;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-full">
            <div className="px-6 pt-6 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Sales</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight">Revenue performance over time</p>
                </div>

                {/* Toggle Filters */}
                <div className="flex bg-slate-50 p-1 rounded-md border border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'px-4 py-1.5 text-[11px] font-bold rounded-sm transition-all uppercase tracking-wider',
                                activeTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-800'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 pb-8">
                <SalesChart />
            </div>
        </div>
    );
};
