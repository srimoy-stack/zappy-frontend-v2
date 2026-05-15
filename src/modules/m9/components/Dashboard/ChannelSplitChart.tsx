import React from 'react';
import { SalesChannel } from '../../types/dashboard';
import { formatCurrency } from '@/utils';

interface ChannelSplitChartProps {
    data: SalesChannel[];
    isLoading?: boolean;
}

export const ChannelSplitChart: React.FC<ChannelSplitChartProps> = ({ data, isLoading }) => {
    if (isLoading || !data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.sales, 0);
    // Professional color palette: Emerald, Blue, Amber, Rose
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E'];

    let cumulativePercentage = 0;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 drop-shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.map((item, index) => {
                        const percentage = (item.sales / total) * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = -cumulativePercentage;
                        cumulativePercentage += percentage;

                        return (
                            <circle
                                key={item.channel}
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth="10"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                pathLength="100"
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-in-out hover:stroke-width-[12] cursor-pointer"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total Revenue</span>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(total)}</span>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                {data.map((item, index) => (
                    <div key={item.channel} className="flex items-center gap-3">
                        <div
                            className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{item.channel}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400">{item.percentage.toFixed(1)}%</span>
                                <span className="text-[11px] font-black text-slate-600">{formatCurrency(item.sales)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
