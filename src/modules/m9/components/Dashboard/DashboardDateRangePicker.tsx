import React, { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/utils';

interface DashboardDateRangePickerProps {
    onRangeChange?: (range: string) => void;
}

/**
 * DashboardDateRangePicker Component
 * Local filter for the dashboard data.
 */
export const DashboardDateRangePicker: React.FC<DashboardDateRangePickerProps> = ({ onRangeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>('today');

    const presets = [
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'thisWeek', label: 'This Week' },
        { id: 'lastWeek', label: 'Last Week' },
        { id: 'thisMonth', label: 'This Month' },
        { id: 'lastMonth', label: 'Last Month' },
    ];

    const selectedLabel = presets.find((p) => p.id === selectedPreset)?.label || 'Select Range';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-[11px] font-black text-slate-700 shadow-sm transition-all uppercase tracking-widest active:scale-95"
            >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-1">
                            {presets.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => {
                                        setSelectedPreset(preset.id);
                                        setIsOpen(false);
                                        onRangeChange?.(preset.id);
                                    }}
                                    className={cn(
                                        'w-full px-4 py-2 text-[10px] font-bold text-left rounded-lg transition-colors uppercase tracking-wider',
                                        preset.id === selectedPreset
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    )}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
