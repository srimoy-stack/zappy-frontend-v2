'use client';


import { Truck, ShoppingBag, UtensilsCrossed, Monitor, Package, Brain, Heart, Megaphone, CalendarClock } from 'lucide-react';
import { cn } from '@/utils';
import type { StoreWizardData } from './wizard.types';

interface Props {
    data: StoreWizardData;
    update: (field: keyof StoreWizardData, value: any) => void;
}

const SERVICES: { field: keyof StoreWizardData; label: string; desc: string; icon: any; color: string }[] = [
    { field: 'enablePickup', label: 'Pickup', desc: 'Customer picks up in-store', icon: ShoppingBag, color: 'bg-emerald-500' },
    { field: 'enableDelivery', label: 'Delivery', desc: 'Driver delivers to customer', icon: Truck, color: 'bg-blue-500' },
    { field: 'enableDineIn', label: 'Dine-In', desc: 'Eat-in with table service', icon: UtensilsCrossed, color: 'bg-orange-500' },
    { field: 'enableKiosk', label: 'Kiosk', desc: 'Self-service ordering kiosk', icon: Monitor, color: 'bg-purple-500' },
];

export function WizardStepServices({ data, update }: Props) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <section>
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-emerald-500" /> Order Channels
                </h4>
                <p className="text-xs text-slate-500 font-medium mb-5">Select which ordering methods this store will support. You can change these later.</p>
                <div className="grid grid-cols-2 gap-4">
                    {SERVICES.map(svc => {
                        const Icon = svc.icon;
                        const enabled = data[svc.field] as boolean;
                        return (
                            <button key={svc.field} type="button" onClick={() => update(svc.field, !enabled)}
                                className={cn(
                                    'p-5 rounded-2xl border-2 text-left transition-all group relative overflow-hidden',
                                    enabled
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                )}>
                                <div className={cn('absolute top-0 right-0 w-16 h-16 rounded-bl-[3rem] opacity-10', svc.color)} />
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                                        enabled ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                                    )}>
                                        <Icon size={17} />
                                    </div>
                                    <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                        enabled ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300'
                                    )}>
                                        {enabled && <span className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                </div>
                                <span className="text-sm font-black block">{svc.label}</span>
                                <span className={cn('text-[10px] font-medium', enabled ? 'text-slate-300' : 'text-slate-500')}>{svc.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Info callout */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <p className="text-[11px] text-blue-700 font-bold">
                    <CalendarClock size={12} className="inline mr-1.5" />
                    Enabled services will have dedicated configuration steps for operating hours, fees, and rules after the store is created.
                </p>
            </div>
        </div>
    );
}
