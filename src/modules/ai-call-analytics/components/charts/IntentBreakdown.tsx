'use client';

import React from 'react';
import type { IntentBar } from '../../utils/chartTransformers';
import { ChartCard, EmptyChart, MiniMetric } from './CallVolumeTrend';

interface Props { data: IntentBar[]; }

const PALETTE = ['#6366f1', '#8b5cf6', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185', '#f97316', '#eab308', '#22c55e'];

export const IntentBreakdown: React.FC<Props> = ({ data }) => {
    if (data.length === 0) return <EmptyChart label="No intent data" />;

    const max = Math.max(...data.map(d => d.count));
    const total = data.reduce((s, d) => s + d.count, 0);
    const topIntent = data[0]!;

    return (
        <ChartCard>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Customer Intent</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">What customers are calling about</p>
                </div>
                <div className="flex gap-3 text-right">
                    <MiniMetric label="Top Intent" value={topIntent.intent} color="text-indigo-600" />
                    <MiniMetric label="Categories" value={data.length.toString()} color="text-slate-700" />
                </div>
            </div>

            <div className="space-y-2">
                {data.map((item, i) => {
                    const pct = max > 0 ? (item.count / max) * 100 : 0;
                    const pctTotal = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    const color = PALETTE[i % PALETTE.length];
                    return (
                        <div key={i} className="group">
                            <div className="flex items-center justify-between mb-1">
                                <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold text-white" style={{ backgroundColor: color }}>
                                        {i + 1}
                                    </span>
                                    <span className="capitalize">{item.intent}</span>
                                </span>
                                <span className="text-xs text-slate-500">
                                    <span className="font-bold text-slate-800">{item.count}</span>
                                    <span className="text-slate-400 ml-1">({pctTotal}%)</span>
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                                    style={{ width: `${pct}%`, backgroundColor: color }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </ChartCard>
    );
};
