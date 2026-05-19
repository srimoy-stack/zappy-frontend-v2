'use client';

import React from 'react';
import { UserCircle, UserPlus, Mail, Phone, ShieldCheck, Key, AlertCircle } from 'lucide-react';
import { FormSectionTitle, InputWrapper, INPUT_CLASS } from './ui';
import type { OnboardingAdminData } from '../types/onboarding.types';

interface AdminStepProps {
    data: OnboardingAdminData;
    onChange: (updates: Partial<OnboardingAdminData>) => void;
}

export function AdminStep({ data, onChange }: AdminStepProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Admin Identity */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={UserCircle} title="Super Admin Identity" />
                <div className="grid grid-cols-1 gap-6">
                    <InputWrapper label="Full Legal Name" required>
                        <div className="relative">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input required type="text" value={data.adminName} onChange={(e) => onChange({ adminName: e.target.value })} className={`${INPUT_CLASS} pl-11`} placeholder="e.g. Alexander Pierce" />
                        </div>
                    </InputWrapper>
                    <div className="grid grid-cols-2 gap-6">
                        <InputWrapper label="Email Address" required>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input required type="email" value={data.adminEmail} onChange={(e) => onChange({ adminEmail: e.target.value })} className={`${INPUT_CLASS} pl-11`} placeholder="admin@brand.com" />
                            </div>
                        </InputWrapper>
                        <InputWrapper label="Direct Phone">
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="tel" value={data.adminPhone} onChange={(e) => onChange({ adminPhone: e.target.value })} className={`${INPUT_CLASS} pl-11 font-mono`} placeholder="+1 (000) 000-0000" />
                            </div>
                        </InputWrapper>
                    </div>
                </div>
            </section>

            {/* System Auto-Assignments */}
            <section className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 text-white space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">System Auto-Assignments</h4>
                        <p className="text-sm font-bold text-white">Permissions for this profile will be locked to enterprise maximum.</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'User Type', value: 'Admin User' },
                        { label: 'System Role', value: 'Brand Admin' },
                        { label: 'Store Scope', value: 'All Locations' },
                    ].map((attr) => (
                        <div key={attr.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{attr.label}</p>
                            <p className="text-xs font-black text-white">{attr.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Invite Method */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={Key} title="Invitation Strategy" />
                <div className="grid grid-cols-2 gap-6">
                    {([
                        { id: 'MAGIC_LINK' as const, label: 'Magic Invite Link', desc: 'Secure email verification link. No initial password required.', icon: Mail },
                        { id: 'TEMP_PASSWORD' as const, label: 'Temporary Password', desc: 'User must change password upon first login attempt.', icon: Key },
                    ]).map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onChange({ inviteMethod: opt.id })}
                            className={`flex flex-col gap-4 p-8 rounded-3xl border text-left transition-all ${
                                data.inviteMethod === opt.id
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-lg'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                data.inviteMethod === opt.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                                <opt.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-sm font-black text-slate-900 block mb-1">{opt.label}</span>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{opt.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <h5 className="text-xs font-black text-blue-900 uppercase tracking-tight">Security Hardening</h5>
                        <p className="text-xs text-blue-700/80 font-medium leading-relaxed">
                            The invitation token will be cryptographically hashed. Valid for <span className="font-black">48 hours</span> — strictly <span className="font-black">single-use only</span>.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
