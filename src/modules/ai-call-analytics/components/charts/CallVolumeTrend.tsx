'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyVolume } from '../../utils/chartTransformers';

interface Props { data: DailyVolume[]; }

export const CallVolumeTrend: React.FC<Props> = ({ data }) => {
    if (data.length === 0) return <EmptyChart label="No call volume data" />;

    const total = data.reduce((s, d) => s + d.total, 0);
    const avg = Math.round(total / data.length);
    const peak = data.reduce((m, d) => d.total > m.total ? d : m, data[0]!);

    return (
        <ChartCard>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Call Volume</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Daily call count over {data.length} days</p>
                </div>
                <div className="flex gap-4 text-right">
                    <MiniMetric label="Total" value={total.toLocaleString()} color="text-indigo-600" />
                    <MiniMetric label="Daily Avg" value={avg.toString()} color="text-slate-700" />
                    <MiniMetric label="Peak" value={`${peak.total} (${fmtShortDate(peak.date)})`} color="text-emerald-600" />
                </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <defs>
                        <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Area type="monotone" dataKey="total" name="Calls" stroke="#6366f1" strokeWidth={2.5}
                        fill="url(#volFill)" dot={false} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// ─── Shared ─────────────────────────────────────────────────────────────────

export function ChartCard({ children }: { children: React.ReactNode }) {
    return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">{children}</div>;
}

export function EmptyChart({ label }: { label: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <span className="text-2xl">📊</span>
            <p className="text-sm text-slate-400 mt-2">{label}</p>
        </div>
    );
}

export function MiniMetric({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div>
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
    );
}

export function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-slate-700">
            <p className="text-slate-400 mb-1">{label ? new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="font-semibold">{p.name}: <span className="text-indigo-300">{p.value}</span></p>
            ))}
        </div>
    );
}

function fmtShortDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
