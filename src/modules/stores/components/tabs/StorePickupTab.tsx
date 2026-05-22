'use client';

import React, { useState } from 'react';
import { ShoppingBag, Save, Loader2, CheckCircle2, Clock, FileText } from 'lucide-react';
import { cn } from '@/utils';
import type { PickupConfig } from '@/shared/types/store';

interface StorePickupTabProps {
    config: PickupConfig;
    onSave: (config: PickupConfig) => Promise<void>;
}

export function StorePickupTab({ config, onSave }: StorePickupTabProps) {
    const [pickup, setPickup] = useState<PickupConfig>(config);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const set = <K extends keyof PickupConfig>(key: K, value: PickupConfig[K]) =>
        setPickup(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setIsSaving(true);
        try { await onSave(pickup); setSaved(true); setTimeout(() => setSaved(false), 3000); }
        finally { setIsSaving(false); }
    };

    const inputCn = 'w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Enable Toggle */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center',
                            pickup.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        )}>
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Pickup Service</h3>
                            <p className="text-xs text-slate-500 font-medium">Enable customer pickup orders for this store</p>
                        </div>
                    </div>
                    <button onClick={() => set('enabled', !pickup.enabled)}
                        className={cn('w-12 h-7 rounded-full transition-all relative',
                            pickup.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                        )}>
                        <span className={cn('absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all',
                            pickup.enabled ? 'left-[22px]' : 'left-0.5'
                        )} />
                    </button>
                </div>
            </div>

            {pickup.enabled && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-orange-500" />
                        <Clock size={14} /> Pickup Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prep Time (minutes)</label>
                            <input type="number" min="1" max="120" value={pickup.prepTimeMinutes}
                                onChange={e => set('prepTimeMinutes', parseInt(e.target.value) || 15)}
                                className={inputCn} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slot Duration (minutes)</label>
                            <input type="number" min="5" max="60" step="5" value={pickup.slotDurationMinutes}
                                onChange={e => set('slotDurationMinutes', parseInt(e.target.value) || 15)}
                                className={inputCn} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Orders/Slot</label>
                            <input type="number" min="1" max="100" value={pickup.maxOrdersPerSlot ?? ''}
                                onChange={e => set('maxOrdersPerSlot', parseInt(e.target.value) || undefined)}
                                placeholder="Unlimited" className={inputCn} />
                        </div>
                    </div>
                    <div className="mt-5 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText size={11} /> Pickup Instructions
                        </label>
                        <textarea value={pickup.instructions || ''} onChange={e => set('instructions', e.target.value)}
                            placeholder="Enter pickup instructions for customers (e.g., 'Enter through the side door')"
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all resize-none" />
                    </div>
                </section>
            )}

            {/* Save */}
            <div className="flex items-center justify-end gap-3">
                {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                        <CheckCircle2 size={14} /> Pickup config saved
                    </span>
                )}
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save Pickup Config'}
                </button>
            </div>
        </div>
    );
}
