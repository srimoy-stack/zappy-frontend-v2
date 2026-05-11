'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyAlerts } from '../../utils/chartTransformers';
import { ChartCard, EmptyChart, MiniMetric } from './CallVolumeTrend';

interface Props { data: DailyAlerts[]; }

export const AlertsTrend: React.FC<Props> = ({ data }) => {
    if (data.length === 0) return <EmptyChart label="No alerts data" />;

    const totals = data.reduce((a, d) => ({ h: a.h + d.high, m: a.m + d.medium }), { h: 0, m: 0 });

    return (
        <ChartCard>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Alerts Trend</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Alert volume by severity over time</p>
                </div>
                <div className="flex gap-3 text-right">
                    <MiniMetric label="High" value={totals.h.toString()} color="text-red-500" />
                    <MiniMetric label="Medium" value={totals.m.toString()} color="text-amber-500" />
                    <MiniMetric label="Total" value={(totals.h + totals.m).toString()} color="text-slate-700" />
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<AlertTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                    <Bar dataKey="high" name="High" stackId="sev" fill="#ef4444" />
                    <Bar dataKey="medium" name="Medium" stackId="sev" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

function AlertTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-slate-700">
            <p className="text-slate-400 mb-1">{label ? new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
                    <span>{p.name}: <span className="font-semibold">{p.value}</span></span>
                </div>
            ))}
        </div>
    );
}
