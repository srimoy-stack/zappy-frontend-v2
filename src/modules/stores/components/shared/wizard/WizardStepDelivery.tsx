'use client';


import { Truck, Navigation, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils';
import type { StoreWizardData } from './wizard.types';
import type { DeliveryProviderType } from '@/shared/types/store';

interface Props {
    data: StoreWizardData;
    update: (field: keyof StoreWizardData, value: any) => void;
}

const I = 'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all';
const L = 'text-[10px] font-black text-slate-600 uppercase tracking-widest';

const PROVIDERS: { value: DeliveryProviderType; label: string; desc: string }[] = [
    { value: 'internal', label: 'Internal Drivers', desc: 'Your own delivery fleet' },
    { value: 'uber_direct', label: 'Uber Direct', desc: 'Uber handles delivery' },
    { value: 'doordash_drive', label: 'DoorDash Drive', desc: 'DoorDash fulfillment' },
    { value: 'hybrid', label: 'Hybrid', desc: 'Internal + fallback to Uber' },
    { value: 'pickup_only', label: 'Pickup Only', desc: 'No delivery service' },
];

export function WizardStepDelivery({ data, update }: Props) {
    if (!data.enableDelivery) {
        return (
            <div className="text-center py-16 animate-in fade-in slide-in-from-right-4 duration-300">
                <Truck className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">Delivery Not Enabled</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                    You can enable delivery in the Services step, or skip this and configure later.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Provider Type */}
            <section>
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-blue-500" />
                    <Truck size={13} /> Delivery Provider
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    {PROVIDERS.filter(p => p.value !== 'pickup_only').map(p => (
                        <button key={p.value} type="button" onClick={() => update('deliveryProvider', p.value)}
                            className={cn(
                                'p-4 rounded-2xl border-2 text-left transition-all',
                                data.deliveryProvider === p.value
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]'
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                            )}>
                            <span className="text-xs font-black block mb-0.5">{p.label}</span>
                            <span className={cn('text-[10px] font-medium', data.deliveryProvider === p.value ? 'text-slate-300' : 'text-slate-500')}>{p.desc}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Delivery Settings */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-emerald-500" />
                    <Navigation size={13} /> Delivery Rules
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                        <label className={L}>Radius (km)</label>
                        <input type="number" step="0.5" min="0.5" max="100" value={data.deliveryRadius}
                            onChange={e => update('deliveryRadius', e.target.value)} className={I} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={L}>Min Order ($)</label>
                        <input type="number" step="0.01" min="0" value={data.deliveryMinOrder}
                            onChange={e => update('deliveryMinOrder', e.target.value)} className={I} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={L}>Base Fee ($)</label>
                        <input type="number" step="0.01" min="0" value={data.deliveryBaseFee}
                            onChange={e => update('deliveryBaseFee', e.target.value)} className={I} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={L}>Free Delivery Over ($)</label>
                        <input type="number" step="0.01" min="0" value={data.deliveryFreeThreshold}
                            onChange={e => update('deliveryFreeThreshold', e.target.value)} className={I} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={L}>Est. Minutes</label>
                        <input type="number" min="1" value={data.deliveryEstMinutes}
                            onChange={e => update('deliveryEstMinutes', e.target.value)} className={I} />
                    </div>
                </div>
            </section>

            {data.deliveryProvider === 'hybrid' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <p className="text-[11px] text-blue-700 font-bold">
                        <AlertTriangle size={12} className="inline mr-1.5" />
                        Hybrid mode: Orders under {data.deliveryRadius}km use internal drivers. If unavailable, routes to Uber Direct. Configure detailed routing rules from the store detail page.
                    </p>
                </div>
            )}
        </div>
    );
}
