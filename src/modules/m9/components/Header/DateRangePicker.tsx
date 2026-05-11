'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

/**
 * DateRangePicker Component (UI Only)
 * Matches Clover design: text-based preset selector with rounded borders
 */
export const DateRangePicker: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>('today');

    const presets = [
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'thisWeek', label: 'This Week' },
        { id: 'lastWeek', label: 'Last Week' },
        { id: 'thisMonth', label: 'This Month' },
        { id: 'lastMonth', label: 'Last Month' },
        { id: 'custom', label: 'Custom Date Range' },
    ];

    const selectedLabel = presets.find((p) => p.id === selectedPreset)?.label || 'Select Range';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-1.5 border border-slate-300 rounded-full bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 shadow-sm"
            >
                <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Date range</span>
                <span>{selectedLabel}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {/* Dropdown (UI Only) */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-1">
                        {presets.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => {
                                    setSelectedPreset(preset.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'w-full px-4 py-2 text-sm text-left rounded-md transition-colors',
                                    preset.id === selectedPreset
                                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                                        : 'text-slate-600 hover:bg-slate-50'
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
