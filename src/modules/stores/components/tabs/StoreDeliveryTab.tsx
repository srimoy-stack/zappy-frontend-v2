'use client';

import React, { useState } from 'react';
import { Truck, Save, Loader2, CheckCircle2, Plus, Trash2, Navigation, DollarSign } from 'lucide-react';
import { cn } from '@/utils';
import type { DeliveryConfig, DeliveryZone } from '@/shared/types/store';

interface StoreDeliveryTabProps {
    config: DeliveryConfig;
    onSave: (config: DeliveryConfig) => Promise<void>;
}

export function StoreDeliveryTab({ config, onSave }: StoreDeliveryTabProps) {
    const [delivery, setDelivery] = useState<DeliveryConfig>(config);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const set = <K extends keyof DeliveryConfig>(key: K, value: DeliveryConfig[K]) =>
        setDelivery(prev => ({ ...prev, [key]: value }));

    const addZone = () => {
        const zones = delivery.zones || [];
        set('zones', [...zones, { id: `zone-${Date.now()}`, name: `Zone ${zones.length + 1}`, radiusKm: 5, fee: 2.99 }]);
    };

    const removeZone = (id: string) => {
        set('zones', (delivery.zones || []).filter(z => z.id !== id));
    };

    const updateZone = (id: string, field: keyof DeliveryZone, value: any) => {
        set('zones', (delivery.zones || []).map(z => z.id === id ? { ...z, [field]: value } : z));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(delivery);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally { setIsSaving(false); }
    };

    const inputCn = 'w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Enable Toggle */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center',
                            delivery.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        )}>
                            <Truck size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Delivery Service</h3>
                            <p className="text-xs text-slate-500 font-medium">Enable delivery orders for this store</p>
                        </div>
                    </div>
                    <button onClick={() => set('enabled', !delivery.enabled)}
                        className={cn('w-12 h-7 rounded-full transition-all relative',
                            delivery.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                        )}>
                        <span className={cn('absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all',
                            delivery.enabled ? 'left-[22px]' : 'left-0.5'
                        )} />
                    </button>
                </div>
            </div>

            {delivery.enabled && (
                <>
                    {/* Core Settings */}
                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                            <span className="w-1 h-5 rounded-full bg-blue-500" />
                            <Navigation size={14} /> Delivery Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Radius (km)</label>
                                <input type="number" step="0.5" min="0.5" max="100" value={delivery.radiusKm}
                                    onChange={e => set('radiusKm', parseFloat(e.target.value) || 5)}
                                    className={inputCn} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minimum Order ($)</label>
                                <input type="number" step="0.01" min="0" value={delivery.minimumOrder ?? ''}
                                    onChange={e => set('minimumOrder', parseFloat(e.target.value) || 0)}
                                    className={inputCn} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Fee ($)</label>
                                <input type="number" step="0.01" min="0" value={delivery.baseFee ?? ''}
                                    onChange={e => set('baseFee', parseFloat(e.target.value) || 0)}
                                    className={inputCn} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Minutes</label>
                                <input type="number" min="1" value={delivery.estimatedMinutes ?? ''}
                                    onChange={e => set('estimatedMinutes', parseInt(e.target.value) || 30)}
                                    className={inputCn} />
                            </div>
                        </div>
                        <div className="mt-5 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Delivery Threshold ($)</label>
                            <input type="number" step="0.01" min="0" value={delivery.freeDeliveryThreshold ?? ''}
                                onChange={e => set('freeDeliveryThreshold', parseFloat(e.target.value) || undefined)}
                                placeholder="Leave blank for no free delivery"
                                className={cn(inputCn, 'max-w-sm')} />
                        </div>
                    </section>

                    {/* Delivery Zones */}
                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                                <span className="w-1 h-5 rounded-full bg-indigo-500" />
                                <DollarSign size={14} /> Delivery Zones
                            </h3>
                            <button onClick={addZone}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                                <Plus size={12} /> Add Zone
                            </button>
                        </div>
                        {(delivery.zones || []).length === 0 ? (
                            <div className="text-center py-8">
                                <Navigation className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-400">No delivery zones configured</p>
                                <p className="text-[10px] text-slate-400">Default radius will be used for all deliveries</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(delivery.zones || []).map(zone => (
                                    <div key={zone.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                        <input value={zone.name} onChange={e => updateZone(zone.id, 'name', e.target.value)}
                                            className="flex-1 px-3 py-2 bg-white border border-slate-100 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none" />
                                        <div className="flex items-center gap-1">
                                            <input type="number" step="0.5" min="0.5" value={zone.radiusKm}
                                                onChange={e => updateZone(zone.id, 'radiusKm', parseFloat(e.target.value) || 1)}
                                                className="w-20 px-2 py-2 bg-white border border-slate-100 rounded-lg text-sm font-bold text-center" />
                                            <span className="text-[9px] font-black text-slate-400">km</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-slate-400">$</span>
                                            <input type="number" step="0.01" min="0" value={zone.fee}
                                                onChange={e => updateZone(zone.id, 'fee', parseFloat(e.target.value) || 0)}
                                                className="w-20 px-2 py-2 bg-white border border-slate-100 rounded-lg text-sm font-bold text-center" />
                                        </div>
                                        <button onClick={() => removeZone(zone.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* Save */}
            <div className="flex items-center justify-end gap-3">
                {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                        <CheckCircle2 size={14} /> Delivery config saved
                    </span>
                )}
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save Delivery Config'}
                </button>
            </div>
        </div>
    );
}
