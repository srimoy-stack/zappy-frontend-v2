'use client';

import React, { useState } from 'react';
import { Clock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils';
import type { OperatingHours, OperatingSlot, ChannelKey, DayOfWeek } from '@/shared/types/store';

interface StoreOperationsTabProps {
    operatingHours: OperatingHours;
    onSave: (hours: OperatingHours) => Promise<void>;
}

const CHANNELS: { key: ChannelKey; label: string; color: string }[] = [
    { key: 'pos', label: 'POS', color: 'bg-emerald-600' },
    { key: 'online', label: 'Online', color: 'bg-blue-600' },
    { key: 'kiosk', label: 'Kiosk', color: 'bg-purple-600' },
];

const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS: Record<DayOfWeek, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

export function StoreOperationsTab({ operatingHours, onSave }: StoreOperationsTabProps) {
    const [hours, setHours] = useState<OperatingHours>(operatingHours);
    const [activeChannel, setActiveChannel] = useState<ChannelKey>('pos');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const slots = hours[activeChannel];

    const updateSlot = (day: DayOfWeek, field: keyof OperatingSlot, value: any) => {
        setHours(prev => ({
            ...prev,
            [activeChannel]: prev[activeChannel].map(s =>
                s.day === day ? { ...s, [field]: value } : s
            ),
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(hours);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally { setIsSaving(false); }
    };

    const copyToAll = () => {
        const mondaySlot = slots.find(s => s.day === 'Monday');
        if (!mondaySlot) return;
        setHours(prev => ({
            ...prev,
            [activeChannel]: prev[activeChannel].map(s => ({
                ...s,
                openTime: mondaySlot.openTime,
                closeTime: mondaySlot.closeTime,
                isOpen: mondaySlot.isOpen,
            })),
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Channel Tabs */}
            <div className="flex items-center gap-2">
                {CHANNELS.map(ch => (
                    <button key={ch.key} onClick={() => setActiveChannel(ch.key)}
                        className={cn(
                            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                            activeChannel === ch.key
                                ? `${ch.color} text-white shadow-lg`
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        )}>
                        <Clock size={13} /> {ch.label}
                    </button>
                ))}
                <div className="flex-1" />
                <button onClick={copyToAll}
                    className="px-4 py-2 text-[10px] font-black text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest">
                    Copy Mon → All
                </button>
            </div>

            {/* Hours Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[120px_1fr_1fr_80px] gap-0 p-2 bg-slate-50 border-b border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">Day</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">Open</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">Close</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 text-center">Open?</span>
                </div>
                {ALL_DAYS.map(day => {
                    const slot = slots.find(s => s.day === day);
                    if (!slot) return null;
                    return (
                        <div key={day} className={cn(
                            'grid grid-cols-[120px_1fr_1fr_80px] gap-0 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors',
                            !slot.isOpen && 'opacity-40'
                        )}>
                            <span className="text-xs font-black text-slate-700 px-4 py-3">{SHORT_DAYS[day]}</span>
                            <div className="px-2 py-2">
                                <input type="time" value={slot.openTime} onChange={e => updateSlot(day, 'openTime', e.target.value)}
                                    disabled={!slot.isOpen}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition-all disabled:opacity-40" />
                            </div>
                            <div className="px-2 py-2">
                                <input type="time" value={slot.closeTime} onChange={e => updateSlot(day, 'closeTime', e.target.value)}
                                    disabled={!slot.isOpen}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition-all disabled:opacity-40" />
                            </div>
                            <div className="flex items-center justify-center px-4 py-3">
                                <button onClick={() => updateSlot(day, 'isOpen', !slot.isOpen)}
                                    className={cn(
                                        'w-10 h-6 rounded-full transition-all relative',
                                        slot.isOpen ? 'bg-emerald-500' : 'bg-slate-200'
                                    )}>
                                    <span className={cn(
                                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                                        slot.isOpen ? 'left-[18px]' : 'left-0.5'
                                    )} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Save */}
            <div className="flex items-center justify-end gap-3">
                {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                        <CheckCircle2 size={14} /> Hours saved
                    </span>
                )}
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save Hours'}
                </button>
            </div>
        </div>
    );
}
