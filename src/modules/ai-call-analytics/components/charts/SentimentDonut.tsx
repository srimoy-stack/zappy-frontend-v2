'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { SentimentSlice } from '../../utils/chartTransformers';
import { ChartCard, EmptyChart } from './CallVolumeTrend';

interface Props { data: SentimentSlice[]; }

const COLORS: Record<string, { fill: string; bg: string; emoji: string }> = {
    Positive: { fill: '#10b981', bg: 'bg-emerald-50', emoji: '😊' },
    Neutral: { fill: '#6366f1', bg: 'bg-indigo-50', emoji: '😐' },
    Negative: { fill: '#ef4444', bg: 'bg-red-50', emoji: '😞' },
};

export const SentimentDonut: React.FC<Props> = ({ data }) => {
    if (data.length === 0) return <EmptyChart label="No sentiment data" />;

    const total = data.reduce((s, d) => s + d.value, 0);
    const dominant = data.reduce((m, d) => d.value > m.value ? d : m, data[0]!);

    return (
        <ChartCard>
            <div className="flex items-start justify-between mb-1">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Sentiment Distribution</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Customer mood across {total} analyzed calls</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{dominant.name} {COLORS[dominant.name]?.emoji}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Dominant mood</p>
                </div>
            </div>

            <div className="flex items-center gap-5 mt-2">
                {/* Donut with center label */}
                <div className="relative w-[160px] h-[160px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                                paddingAngle={3} dataKey="value" nameKey="name" strokeWidth={0}>
                                {data.map((e, i) => <Cell key={i} fill={COLORS[e.name]?.fill || e.color} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-800">{total}</p>
                            <p className="text-[9px] text-slate-400">Total</p>
                        </div>
                    </div>
                </div>

                {/* Breakdown bars */}
                <div className="flex-1 space-y-3">
                    {data.map((item, i) => {
                        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        const cfg = COLORS[item.name] || { fill: item.color, bg: 'bg-slate-50', emoji: '' };
                        return (
                            <div key={i} className={`rounded-lg ${cfg.bg} p-2.5`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                        {cfg.emoji} {item.name}
                                    </span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-bold" style={{ color: cfg.fill }}>{pct}%</span>
                                        <span className="text-[10px] text-slate-400">({item.value})</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cfg.fill }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ChartCard>
    );
};
