import React from 'react';
import { cn } from '@/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
    label: string;
    value: string;
    trend?: {
        percentage: number;
        isPositive: boolean;
        timeframe: string;
    };
    target?: string;
    icon: LucideIcon;
    iconColor: string;
    isLoading?: boolean;
    sparklineData?: number[];
}

/**
 * Rebuilt Premium KPI Card Component
 */
export const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    trend,
    target,
    icon: Icon,
    iconColor,
    isLoading = false,
    sparklineData = [10, 20, 15, 30, 22, 35, 28, 40] // Mock default trend data
}) => {
    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl h-[120px] animate-pulse flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="h-2 bg-slate-100 rounded w-16"></div>
                        <div className="h-6 bg-slate-100 rounded w-24"></div>
                    </div>
                    <div className="w-10 h-10 bg-slate-150 rounded-xl" />
                </div>
                <div className="h-2 bg-slate-100 rounded w-full"></div>
            </div>
        );
    }

    const isNegative = value.includes('-') || (trend && !trend.isPositive);

    return (
        <div className="bg-white p-5 border border-slate-200 rounded-3xl flex flex-col justify-between gap-4 group hover:border-slate-350 hover:shadow-md transition-all duration-300 relative overflow-hidden">
            {/* Hover card glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

            <div className="flex items-start justify-between z-10">
                <div className="space-y-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block truncate">
                        {label}
                    </p>
                    <div className={cn(
                        'text-xl font-black tracking-tight block truncate',
                        isNegative && label.includes('Variance') ? 'text-rose-600' : 'text-slate-900'
                    )}>
                        {value}
                    </div>
                </div>
                <div className={cn("p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm border shrink-0", iconColor)}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>

            {/* Sparkline & Operational insights */}
            <div className="flex items-end justify-between gap-3 pt-2 border-t border-slate-50 mt-1">
                {trend ? (
                    <div className="flex flex-col gap-0.5">
                        <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-md self-start border",
                            trend.isPositive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                            {trend.isPositive ? "↑" : "↓"} {trend.percentage}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight block mt-0.5">{trend.timeframe}</span>
                    </div>
                ) : target ? (
                    <div>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider block">
                            {target}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight block mt-0.5">Target efficiency</span>
                    </div>
                ) : (
                    <div>
                        <span className="text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider block">
                            Stable
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight block mt-0.5">Metric status</span>
                    </div>
                )}

                {/* SVG Sparkline Graph */}
                <div className="w-16 h-8 shrink-0">
                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                        <path
                            d={`M ${sparklineData.map((val, idx) => `${(idx / (sparklineData.length - 1)) * 100} ${40 - (val / Math.max(...sparklineData)) * 30}`).join(' L ')}`}
                            fill="none"
                            stroke={isNegative && label.includes('Variance') ? '#F43F5E' : '#10B981'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};
