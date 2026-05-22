'use client';

import React, { useState, useEffect } from 'react';
import {
    Building2, MapPin, Clock, Phone, Mail, Globe, Hash, Save, X, Pencil,
    Loader2, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/utils';
import type { Store, CreateStoreDTO } from '@/shared/types/store';

interface StoreGeneralTabProps {
    store: Store;
    onSave: (dto: Partial<CreateStoreDTO>) => Promise<void>;
}

const TIMEZONES = [
    'America/Toronto', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Halifax', 'America/Vancouver', 'America/Winnipeg', 'America/Edmonton',
];
const PROVINCES = [
    'Ontario', 'British Columbia', 'Quebec', 'Alberta', 'Manitoba',
    'Saskatchewan', 'Nova Scotia', 'New Brunswick',
];

function EditField({ label, value, onChange, type = 'text', icon: Icon, placeholder, disabled, mono }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; icon?: any; placeholder?: string; disabled?: boolean; mono?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />}
                <input type={type} value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} disabled={disabled}
                    className={cn(
                        "w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all",
                        Icon && "pl-11", disabled && "opacity-50 cursor-not-allowed", mono && "font-mono"
                    )} />
            </div>
        </div>
    );
}

function SelectField({ label, value, onChange, options, icon: Icon }: {
    label: string; value: string; onChange: (v: string) => void;
    options: string[]; icon?: any;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />}
                <select value={value} onChange={e => onChange(e.target.value)}
                    className={cn(
                        "w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none",
                        Icon && "pl-11"
                    )}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon: Icon, mono, muted }: {
    label: string; value: string | undefined; icon?: any; mono?: boolean; muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-3.5 border-b border-slate-50/80 last:border-0 group hover:bg-slate-50/40 -mx-2 px-2 rounded-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-2.5">
                {Icon && <Icon size={13} className="text-slate-400" />}
                {label}
            </span>
            <span className={cn(
                'text-sm font-bold text-slate-900 max-w-[60%] text-right truncate',
                mono && 'font-mono text-xs bg-slate-100 px-2 py-0.5 rounded',
                muted && 'text-slate-400 font-medium'
            )}>
                {value || '—'}
            </span>
        </div>
    );
}

export function StoreGeneralTab({ store, onSave }: StoreGeneralTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [name, setName] = useState(store.name);
    const [address, setAddress] = useState(store.address || '');
    const [city, setCity] = useState(store.city);
    const [province, setProvince] = useState(store.province);
    const [postalCode, setPostalCode] = useState(store.postalCode || '');
    const [timezone, setTimezone] = useState(store.timezone);
    const [phone, setPhone] = useState(store.phone || '');
    const [email, setEmail] = useState(store.email || '');

    useEffect(() => {
        setName(store.name);
        setAddress(store.address || '');
        setCity(store.city);
        setProvince(store.province);
        setPostalCode(store.postalCode || '');
        setTimezone(store.timezone);
        setPhone(store.phone || '');
        setEmail(store.email || '');
    }, [store]);

    const handleCancel = () => {
        setName(store.name); setAddress(store.address || '');
        setCity(store.city); setProvince(store.province);
        setPostalCode(store.postalCode || ''); setTimezone(store.timezone);
        setPhone(store.phone || ''); setEmail(store.email || '');
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ name, address, city, province, postalCode, timezone, phone, email });
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch { /* handled upstream */ }
        finally { setIsSaving(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Edit Toggle */}
            <div className="flex items-center justify-end gap-3">
                {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                        <CheckCircle2 size={14} /> Saved successfully
                    </span>
                )}
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all">
                            <X size={14} /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-900 transition-all">
                        <Pencil size={14} /> Edit Details
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Identity */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-slate-900" />
                        <Building2 size={14} /> Store Identity
                    </h3>
                    {isEditing ? (
                        <div className="space-y-4">
                            <EditField label="Store Name" value={name} onChange={setName} icon={Building2} />
                            <EditField label="Store Code (read-only)" value={store.code} onChange={() => {}} disabled mono />
                        </div>
                    ) : (
                        <div className="space-y-0">
                            <InfoRow label="Store Name" value={name} icon={Building2} />
                            <InfoRow label="Store Code" value={store.code} mono />
                        </div>
                    )}
                </section>

                {/* Location */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-emerald-500" />
                        <MapPin size={14} /> Location
                    </h3>
                    {isEditing ? (
                        <div className="space-y-4">
                            <EditField label="Address" value={address} onChange={setAddress} icon={MapPin} placeholder="Street address" />
                            <div className="grid grid-cols-2 gap-4">
                                <EditField label="City" value={city} onChange={setCity} />
                                <SelectField label="Province" value={province} onChange={setProvince} options={PROVINCES} icon={Globe} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <EditField label="Postal Code" value={postalCode} onChange={setPostalCode} icon={Hash} mono placeholder="M5V 2T6" />
                                <SelectField label="Timezone" value={timezone} onChange={setTimezone} options={TIMEZONES} icon={Clock} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            <InfoRow label="Address" value={address} icon={MapPin} muted={!address} />
                            <InfoRow label="City" value={city} />
                            <InfoRow label="Province" value={province} />
                            <InfoRow label="Postal Code" value={postalCode} mono muted={!postalCode} />
                            <InfoRow label="Timezone" value={timezone} icon={Clock} />
                        </div>
                    )}
                </section>
            </div>

            {/* Contact */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2.5">
                    <span className="w-1 h-5 rounded-full bg-blue-500" />
                    <Phone size={14} /> Contact Information
                </h3>
                {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <EditField label="Phone" value={phone} onChange={setPhone} icon={Phone} type="tel" placeholder="+1 (416) 555-0100" />
                        <EditField label="Email" value={email} onChange={setEmail} icon={Mail} type="email" placeholder="store@brand.com" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-0">
                        <InfoRow label="Phone" value={phone} icon={Phone} muted={!phone} />
                        <InfoRow label="Email" value={email} icon={Mail} muted={!email} />
                    </div>
                )}
            </section>
        </div>
    );
}
