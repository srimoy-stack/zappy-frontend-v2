'use client';


import { ShoppingBag, UtensilsCrossed, Car, QrCode, Armchair, CalendarCheck, Users } from 'lucide-react';
import { cn } from '@/utils';
import type { StoreWizardData } from './wizard.types';

interface Props {
    data: StoreWizardData;
    update: (field: keyof StoreWizardData, value: any) => void;
}

const I = 'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all';
const L = 'text-[10px] font-black text-slate-600 uppercase tracking-widest';

function Toggle({ on, onToggle, label, icon: Icon }: { on: boolean; onToggle: () => void; label: string; icon: any }) {
    return (
        <button type="button" onClick={onToggle}
            className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all w-full text-left',
                on ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200'
            )}>
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                on ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
            )}>
                <Icon size={15} />
            </div>
            <span className={cn('text-xs font-black flex-1', on ? 'text-emerald-700' : 'text-slate-500')}>{label}</span>
            <div className={cn('w-10 h-6 rounded-full transition-all relative', on ? 'bg-emerald-500' : 'bg-slate-200')}>
                <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} />
            </div>
        </button>
    );
}

export function WizardStepPickupDineIn({ data, update }: Props) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Pickup */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-emerald-500" />
                    <ShoppingBag size={13} /> Pickup Configuration
                </h4>
                {!data.enablePickup ? (
                    <p className="text-xs text-slate-400 font-medium py-6 text-center">Pickup not enabled. Enable in the Services step.</p>
                ) : (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={L}>Prep Time (min)</label>
                                <input type="number" min="1" max="120" value={data.pickupPrepTime}
                                    onChange={e => update('pickupPrepTime', e.target.value)} className={I} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={L}>Slot Duration (min)</label>
                                <input type="number" min="5" max="60" step="5" value={data.pickupSlotDuration}
                                    onChange={e => update('pickupSlotDuration', e.target.value)} className={I} />
                            </div>
                        </div>
                        <Toggle on={data.pickupCurbside} onToggle={() => update('pickupCurbside', !data.pickupCurbside)}
                            label="Curbside Pickup" icon={Car} />
                        <div className="space-y-1.5">
                            <label className={L}>Pickup Instructions</label>
                            <textarea value={data.pickupInstructions} onChange={e => update('pickupInstructions', e.target.value)}
                                placeholder="e.g. Enter through the side door, pickup counter on the left"
                                rows={2} className={cn(I, 'resize-none')} />
                        </div>
                    </div>
                )}
            </section>

            {/* Dine-In */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-orange-500" />
                    <UtensilsCrossed size={13} /> Dine-In Configuration
                </h4>
                {!data.enableDineIn ? (
                    <p className="text-xs text-slate-400 font-medium py-6 text-center">Dine-in not enabled. Enable in the Services step.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Toggle on={data.dineInQR} onToggle={() => update('dineInQR', !data.dineInQR)}
                            label="QR Code Ordering" icon={QrCode} />
                        <Toggle on={data.dineInTableService} onToggle={() => update('dineInTableService', !data.dineInTableService)}
                            label="Table Service" icon={Armchair} />
                        <Toggle on={data.dineInReservation} onToggle={() => update('dineInReservation', !data.dineInReservation)}
                            label="Reservations" icon={CalendarCheck} />
                        <Toggle on={data.dineInWaitlist} onToggle={() => update('dineInWaitlist', !data.dineInWaitlist)}
                            label="Waitlist" icon={Users} />
                    </div>
                )}
            </section>
        </div>
    );
}
