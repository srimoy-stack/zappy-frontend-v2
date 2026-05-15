'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailySuccessBreakdown } from '../../utils/chartTransformers';
import { ChartCard, EmptyChart, MiniMetric } from './CallVolumeTrend';

interface Props { data: DailySuccessBreakdown[]; }

export const SuccessFailureTrend: React.FC<Props> = ({ data }) => {
    if (data.length === 0) return <EmptyChart label="No success/failure data" />;

    const totals = data.reduce((a, d) => ({ s: a.s + d.successful, p: a.p + d.partial, f: a.f + d.failed }), { s: 0, p: 0, f: 0 });
    const all = totals.s + totals.p + totals.f;
    const successRate = all > 0 ? ((totals.s / all) * 100).toFixed(1) : '0';

    return (
        <ChartCard>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Success vs Failure</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Call outcomes over time</p>
                </div>
                <div className="flex gap-3 text-right">
                    <MiniMetric label="Success Rate" value={`${successRate}%`} color={Number(successRate) >= 70 ? 'text-emerald-600' : 'text-amber-600'} />
                    <MiniMetric label="Successful" value={totals.s.toString()} color="text-emerald-600" />
                    <MiniMetric label="Failed" value={totals.f.toString()} color="text-red-500" />
                </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<StackTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                    <Bar dataKey="successful" name="Successful" stackId="s" fill="#10b981" />
                    <Bar dataKey="partial" name="Partial" stackId="s" fill="#f59e0b" />
                    <Bar dataKey="failed" name="Failed" stackId="s" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

function StackTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
    return (
        <div className="bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-slate-700 min-w-[150px]">
            <p className="text-slate-400 mb-1.5 pb-1 border-b border-slate-700">
                {label ? new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
            </p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex justify-between gap-3 py-0.5">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />{p.name}
                    </span>
                    <span className="font-semibold">{p.value} <span className="text-slate-500">({total > 0 ? Math.round((p.value/total)*100) : 0}%)</span></span>
                </div>
            ))}
            <div className="flex justify-between pt-1 mt-1 border-t border-slate-700 font-bold">
                <span>Total</span><span>{total}</span>
            </div>
        </div>
    );
}
