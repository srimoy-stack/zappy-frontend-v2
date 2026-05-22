'use client';


import { Building2, MapPin, Zap, Clock, Truck, ShoppingBag, UtensilsCrossed, CreditCard, Receipt, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/utils';
import type { StoreWizardData } from './wizard.types';

interface Props { data: StoreWizardData; }

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-400">{label}</span>
            <span className={cn('text-xs font-bold text-slate-900 text-right max-w-[55%] truncate',
                mono && 'font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded',
                !value && 'text-slate-300 italic'
            )}>{value || '—'}</span>
        </div>
    );
}

function Chip({ on, label }: { on: boolean; label: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border',
            on ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
        )}>
            {on ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
            {label}
        </span>
    );
}

export function WizardStepReview({ data }: Props) {
    const BIZ_LABELS: Record<string, string> = {
        single_store: 'Single Store', franchise: 'Franchise', corporate: 'Corporate', ghost_kitchen: 'Ghost Kitchen',
    };
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 size={12} className="inline mr-1.5" />
                    Review your store configuration. The store will be created in <strong>Draft</strong> status. Configure per-day hours, hardware, and integrations from the store detail page.
                </p>
            </div>

            {/* Identity */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <Building2 size={12} /> Store Identity
                </h4>
                <Field label="Store Name" value={data.name} />
                <Field label="Store Code" value="Auto-generated" />
                <Field label="Business Type" value={BIZ_LABELS[data.businessType] || data.businessType} />
            </section>

            {/* Location */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <MapPin size={12} /> Location
                </h4>
                <Field label="Address" value={data.address} />
                <Field label="City / Province" value={`${data.city}, ${data.province}`} />
                <Field label="Postal Code" value={data.postalCode} mono />
                <Field label="Timezone" value={data.timezone} />
                <Field label="Phone" value={data.phone} />
                <Field label="Email" value={data.email} />
            </section>

            {/* Services */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <Zap size={12} /> Enabled Services
                </h4>
                <div className="flex flex-wrap gap-2">
                    <Chip on={data.enablePickup} label="Pickup" />
                    <Chip on={data.enableDelivery} label="Delivery" />
                    <Chip on={data.enableDineIn} label="Dine-In" />
                    <Chip on={data.enableKiosk} label="Kiosk" />
                </div>
            </section>

            {/* Hours */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <Clock size={12} /> Operating Hours
                </h4>
                <Field label="POS" value={`${data.posOpen} – ${data.posClose}`} />
                <Field label="Online" value={`${data.onlineOpen} – ${data.onlineClose}`} />
            </section>

            {/* Delivery */}
            {data.enableDelivery && (
                <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                        <Truck size={12} /> Delivery
                    </h4>
                    <Field label="Provider" value={data.deliveryProvider} />
                    <Field label="Radius" value={`${data.deliveryRadius} km`} />
                    <Field label="Min Order" value={`$${data.deliveryMinOrder}`} />
                    <Field label="Base Fee" value={`$${data.deliveryBaseFee}`} />
                    <Field label="Est. Time" value={`${data.deliveryEstMinutes} min`} />
                </section>
            )}

            {/* Pickup */}
            {data.enablePickup && (
                <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                        <ShoppingBag size={12} /> Pickup
                    </h4>
                    <Field label="Prep Time" value={`${data.pickupPrepTime} min`} />
                    <Field label="Curbside" value={data.pickupCurbside ? 'Yes' : 'No'} />
                </section>
            )}

            {/* Dine-In */}
            {data.enableDineIn && (
                <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                        <UtensilsCrossed size={12} /> Dine-In
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        <Chip on={data.dineInQR} label="QR Ordering" />
                        <Chip on={data.dineInTableService} label="Table Service" />
                        <Chip on={data.dineInReservation} label="Reservations" />
                        <Chip on={data.dineInWaitlist} label="Waitlist" />
                    </div>
                </section>
            )}

            {/* Payments & Tax */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <CreditCard size={12} /> Payments & Tax
                </h4>
                <Field label="Provider" value={data.paymentProvider || 'Not selected'} />
                {data.merchantId && <Field label="Merchant ID" value={data.merchantId} mono />}
                <Field label="Tax Profile" value={data.taxProfile} />
                {data.taxProfile === 'Override' && data.taxRules.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {data.taxRules.map(r => (
                            <div key={r.id} className="flex items-center justify-between py-1.5 px-2 bg-amber-50 rounded-lg text-[10px]">
                                <span className="font-bold text-amber-800">{r.name || r.type}</span>
                                <span className="font-mono text-amber-700">{r.rate}% · {r.mode} · {r.channelScope}</span>
                            </div>
                        ))}
                    </div>
                )}
                {data.tipsEnabled && (
                    <Field label="Tip Presets" value={data.tipPresets.split(',').map(v => `${v.trim()}%`).join(', ')} />
                )}
                {data.feeRules.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Fees</span>
                        {data.feeRules.map(f => (
                            <div key={f.id} className="flex items-center justify-between py-1.5 px-2 bg-blue-50 rounded-lg text-[10px]">
                                <span className="font-bold text-blue-800">{f.type.replace('_', ' ')}</span>
                                <span className="font-mono text-blue-700">${f.value} · {f.taxable ? 'Taxable' : 'Non-taxable'}</span>
                            </div>
                        ))}
                    </div>
                )}
                <Field label="Payment Terms" value={data.paymentTerms} />
            </section>
        </div>
    );
}
