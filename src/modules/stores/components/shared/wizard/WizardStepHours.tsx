'use client';


import { Clock, Sun, Moon } from 'lucide-react';
import { cn } from '@/utils';
import type { StoreWizardData } from './wizard.types';

interface Props {
    data: StoreWizardData;
    update: (field: keyof StoreWizardData, value: any) => void;
}

const I = 'w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all';

const PRESETS = [
    { label: 'Standard', posO: '09:00', posC: '22:00', onO: '10:00', onC: '21:00' },
    { label: '24/7', posO: '00:00', posC: '23:59', onO: '00:00', onC: '23:59' },
    { label: 'Late Night', posO: '11:00', posC: '03:00', onO: '11:00', onC: '02:00' },
    { label: 'Lunch Only', posO: '11:00', posC: '15:00', onO: '11:00', onC: '14:30' },
];

export function WizardStepHours({ data, update }: Props) {
    const applyPreset = (p: typeof PRESETS[0]) => {
        update('posOpen', p.posO);
        update('posClose', p.posC);
        update('onlineOpen', p.onO);
        update('onlineClose', p.onC);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Quick Presets */}
            <section>
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-amber-500" /> Quick Presets
                </h4>
                <p className="text-xs text-slate-500 font-medium mb-4">Choose a preset or customize hours below. Per-day schedules can be configured after creation.</p>
                <div className="grid grid-cols-4 gap-3">
                    {PRESETS.map(p => (
                        <button key={p.label} type="button" onClick={() => applyPreset(p)}
                            className={cn(
                                'p-3 rounded-xl border-2 text-center transition-all',
                                data.posOpen === p.posO && data.posClose === p.posC
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]'
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                            )}>
                            <span className="text-[11px] font-black block">{p.label}</span>
                            <span className={cn('text-[9px] font-medium', data.posOpen === p.posO && data.posClose === p.posC ? 'text-slate-500' : 'text-slate-400')}>
                                {p.posO}–{p.posC}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* POS Hours */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-emerald-500" />
                    <Clock size={13} /> POS / In-Store Hours
                </h4>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                            <Sun size={10} /> Opening Time
                        </label>
                        <input type="time" value={data.posOpen} onChange={e => update('posOpen', e.target.value)} className={I} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                            <Moon size={10} /> Closing Time
                        </label>
                        <input type="time" value={data.posClose} onChange={e => update('posClose', e.target.value)} className={I} />
                    </div>
                </div>
            </section>

            {/* Online Hours */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-blue-500" />
                    <Clock size={13} /> Online Ordering Hours
                </h4>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                            <Sun size={10} /> Opening Time
                        </label>
                        <input type="time" value={data.onlineOpen} onChange={e => update('onlineOpen', e.target.value)} className={I} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                            <Moon size={10} /> Closing Time
                        </label>
                        <input type="time" value={data.onlineClose} onChange={e => update('onlineClose', e.target.value)} className={I} />
                    </div>
                </div>
            </section>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-[11px] text-amber-700 font-bold">
                    <Clock size={12} className="inline mr-1.5" />
                    Holiday overrides, break hours, and per-day schedules per channel can be configured from the store detail page after creation.
                </p>
            </div>
        </div>
    );
}
