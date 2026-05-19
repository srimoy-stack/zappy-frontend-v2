'use client';

import React, { useState } from 'react';
import {
    MessageSquare, Mail, Smartphone, Globe, CheckCircle2,
    AlertTriangle, Shield, Save, RefreshCw, Activity
} from 'lucide-react';
import { cn } from '@/utils';

export default function PlatformCommunicationPage() {
    const [emailProvider, setEmailProvider] = useState('sendgrid');
    const [smsProvider, setSmsProvider] = useState('twilio');
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const markDirty = () => setIsDirty(true);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsSaving(false);
        setIsDirty(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Communication Services</h1>
                    <p className="text-slate-500 font-medium mt-1">Platform-level defaults — tenants inherit unless they override</p>
                </div>
                {isDirty && (
                    <button onClick={handleSave} disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
                        <Save size={18} /> {isSaving ? 'Saving...' : 'Save Platform Defaults'}
                    </button>
                )}
            </div>

            {/* Governance Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-blue-800">Platform Default Configuration</p>
                    <p className="text-[10px] text-blue-600 mt-0.5">
                        These settings serve as defaults for all tenants. Individual tenants can override via their Communication tab.
                        Tenants using "inherit" will automatically use these platform-level settings.
                    </p>
                </div>
            </div>

            {/* Provider Health */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Provider</span>
                    <div className="text-lg font-black text-slate-900 mt-1 capitalize">{emailProvider}</div>
                    <div className="flex items-center gap-1 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Healthy</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SMS Provider</span>
                    <div className="text-lg font-black text-slate-900 mt-1 capitalize">{smsProvider}</div>
                    <div className="flex items-center gap-1 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Healthy</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tenants Inheriting</span>
                    <div className="text-lg font-black text-slate-900 mt-1">18 / 24</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Overrides</span>
                    <div className="text-lg font-black text-slate-900 mt-1">6</div>
                </div>
            </div>

            {/* Config Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Mail size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Email Provider (Platform Default)</h3>
                            <p className="text-[10px] text-slate-500 font-medium">All tenants using "inherit" will use this</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</label>
                            <select value={emailProvider} onChange={e => { setEmailProvider(e.target.value); markDirty(); }}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none">
                                <option value="smtp">SMTP</option>
                                <option value="sendgrid">SendGrid</option>
                                <option value="ses">AWS SES</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Sender Email</label>
                            <input defaultValue="noreply@zyappy.io" onChange={markDirty}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Sender Name</label>
                            <input defaultValue="Zyappy Platform" onChange={markDirty}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                        </div>
                    </div>
                </section>

                {/* SMS */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Smartphone size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">SMS Provider (Platform Default)</h3>
                            <p className="text-[10px] text-slate-500 font-medium">OTP verification and transactional SMS</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</label>
                            <select value={smsProvider} onChange={e => { setSmsProvider(e.target.value); markDirty(); }}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none">
                                <option value="twilio">Twilio</option>
                                <option value="vonage">Vonage</option>
                                <option value="aws-sns">AWS SNS</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Sender ID</label>
                            <input defaultValue="ZYAPPY" onChange={markDirty}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                        </div>
                    </div>
                </section>
            </div>

            {/* Webhook Registry */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Webhook Registry</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Delivery status and bounce handling</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Email Delivery Webhook', url: 'https://api.zyappy.io/webhooks/email/delivery', status: 'Active' },
                        { label: 'Email Bounce Webhook', url: 'https://api.zyappy.io/webhooks/email/bounce', status: 'Active' },
                        { label: 'SMS Delivery Webhook', url: 'https://api.zyappy.io/webhooks/sms/delivery', status: 'Active' },
                    ].map(webhook => (
                        <div key={webhook.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{webhook.label}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-600 block truncate">{webhook.url}</span>
                            <div className="flex items-center gap-1 mt-2">
                                <CheckCircle2 size={10} className="text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">{webhook.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
