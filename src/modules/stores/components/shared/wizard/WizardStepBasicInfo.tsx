'use client';


import { Building2, MapPin, Phone, Mail, Hash } from 'lucide-react';
import { cn } from '@/utils';
import type { StoreWizardData } from './wizard.types';
import type { BusinessType } from '@/shared/types/store';

interface Props {
    data: StoreWizardData;
    errors: Record<string, string>;
    update: (field: keyof StoreWizardData, value: any) => void;
    isEdit: boolean;
}

const I = 'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all';
const L = 'text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1';
const S = cn(I, 'appearance-none');


const PROVINCES = ['Ontario','British Columbia','Quebec','Alberta','Manitoba','Saskatchewan','Nova Scotia','New Brunswick','Newfoundland','Prince Edward Island'];
const TIMEZONES = ['America/Toronto','America/Chicago','America/Denver','America/Los_Angeles','America/Halifax','America/Vancouver','America/Winnipeg','America/Edmonton','America/St_Johns'];

const BIZ_TYPES: { value: BusinessType; label: string; desc: string }[] = [
    { value: 'single_store', label: 'Single Store', desc: 'One location business' },
    { value: 'franchise', label: 'Franchise', desc: 'Franchise-operated location' },
    { value: 'corporate', label: 'Corporate', desc: 'Company-owned location' },
    { value: 'ghost_kitchen', label: 'Ghost Kitchen', desc: 'Delivery-only kitchen' },
];

export function WizardStepBasicInfo({ data, errors, update, isEdit }: Props) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Business Type */}
            <section>
                <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-0.5 h-4 rounded-full bg-slate-900" /> Business Type
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {BIZ_TYPES.map(bt => (
                        <button key={bt.value} type="button" onClick={() => update('businessType', bt.value)}
                            className={cn(
                                'p-4 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
                                data.businessType === bt.value
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            )}>
                            <span className="text-[13px] font-semibold block">{bt.label}</span>
                            <span className={cn('text-[11px]', data.businessType === bt.value ? 'text-slate-400' : 'text-slate-500')}>{bt.desc}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Identity */}
            <section>
                <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-0.5 h-4 rounded-full bg-emerald-500" />
                    <Building2 size={13} /> Store Identity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className={L}>Store Name <span className="text-rose-500">*</span></label>
                        <input value={data.name} onChange={e => update('name', e.target.value)} placeholder="Downtown Toronto"
                            className={cn(I, errors.name && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                        {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className={L}>Store Code <span className="text-rose-500">*</span></label>
                        <input value={data.code} onChange={e => update('code', e.target.value.toUpperCase())} placeholder="e.g. DOWNTOWN-TORONTO"
                            className={cn(I, 'font-mono uppercase', errors.code && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                        {errors.code && <p className="text-[11px] text-rose-500">{errors.code}</p>}
                    </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Short unique code used for URL & identifiers (auto-generated from name by default)</p>
            </section>

            {/* Address */}
            <section>
                <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-0.5 h-4 rounded-full bg-blue-500" />
                    <MapPin size={13} /> Address
                </h4>
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className={L}>Street Address <span className="text-rose-500">*</span></label>
                        <input value={data.address} onChange={e => update('address', e.target.value)} placeholder="123 Main St"
                            className={cn(I, errors.address && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                        {errors.address && <p className="text-[11px] text-rose-500">{errors.address}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className={L}>City <span className="text-rose-500">*</span></label>
                            <input value={data.city} onChange={e => update('city', e.target.value)}
                                className={cn(I, errors.city && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                            {errors.city && <p className="text-[11px] text-rose-500">{errors.city}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className={L}>Province <span className="text-rose-500">*</span></label>
                            <select value={data.province} onChange={e => update('province', e.target.value)}
                                className={cn(S, errors.province && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')}>
                                {PROVINCES.map(p => <option key={p}>{p}</option>)}
                            </select>
                            {errors.province && <p className="text-[11px] text-rose-500">{errors.province}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className={L}>Postal Code <span className="text-rose-500">*</span></label>
                            <input value={data.postalCode} onChange={e => update('postalCode', e.target.value)} placeholder="M5V 2T6"
                                className={cn(I, 'font-mono', errors.postalCode && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                            {errors.postalCode && <p className="text-[11px] text-rose-500">{errors.postalCode}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={L}>Timezone <span className="text-rose-500">*</span></label>
                            <select value={data.timezone} onChange={e => update('timezone', e.target.value)}
                                className={cn(S, errors.timezone && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')}>
                                {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
                            </select>
                            {errors.timezone && <p className="text-[11px] text-rose-500">{errors.timezone}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className={L}><Hash size={10} /> Lat</label>
                                <input type="number" step="any" value={data.latitude} onChange={e => update('latitude', e.target.value)} placeholder="43.6532"
                                    className={cn(I, 'font-mono text-[12px]', errors.latitude && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                                {errors.latitude && <p className="text-[11px] text-rose-500">{errors.latitude}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className={L}><Hash size={10} /> Lng</label>
                                <input type="number" step="any" value={data.longitude} onChange={e => update('longitude', e.target.value)} placeholder="-79.3832"
                                    className={cn(I, 'font-mono text-[12px]', errors.longitude && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                                {errors.longitude && <p className="text-[11px] text-rose-500">{errors.longitude}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section>
                <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-0.5 h-4 rounded-full bg-violet-500" />
                    <Phone size={13} /> Contact
                </h4>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className={L}><Phone size={10} /> Phone <span className="text-rose-500">*</span></label>
                        <input type="tel" value={data.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (416) 555-0100"
                            className={cn(I, errors.phone && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                        {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className={L}><Phone size={10} /> Secondary Phone</label>
                        <input type="tel" value={data.secondaryPhone} onChange={e => update('secondaryPhone', e.target.value)} placeholder="+1 (416) 555-0101"
                            className={cn(I, errors.secondaryPhone && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                        {errors.secondaryPhone && <p className="text-[11px] text-rose-500">{errors.secondaryPhone}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className={L}><Mail size={10} /> Email <span className="text-rose-500">*</span></label>
                        <input type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="store@brand.com"
                            className={cn(I, errors.email && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10')} />
                        {errors.email && <p className="text-[11px] text-rose-500">{errors.email}</p>}
                    </div>
                </div>
            </section>
        </div>
    );
}
