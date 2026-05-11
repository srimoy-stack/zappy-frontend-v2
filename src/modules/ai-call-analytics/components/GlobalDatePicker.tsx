'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { useDateRange, type DatePreset } from './DateRangeContext';

const PRESETS: { value: DatePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
];

/**
 * Compact global date range picker displayed in the module header.
 * Shows preset buttons + custom date inputs.
 */
export const GlobalDatePicker: React.FC = () => {
    const { dateFrom, dateTo, setDateRange, preset, setPreset } = useDateRange();

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Preset Buttons */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                {PRESETS.map((p) => (
                    <button
                        key={p.value}
                        id={`date-preset-${p.value}`}
                        onClick={() => setPreset(p.value)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            preset === p.value
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Custom Date Inputs */}
            <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <input
                    id="global-date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateRange({ dateFrom: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">–</span>
                <input
                    id="global-date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateRange({ dateTo: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
};
