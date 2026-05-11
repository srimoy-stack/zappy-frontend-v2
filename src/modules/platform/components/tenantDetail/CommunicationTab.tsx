'use client';

import React, { useState } from 'react';
import { MessageSquare, Mail, Smartphone, CheckCircle2, AlertTriangle, Save, Globe } from 'lucide-react';
import type { BrandCommunicationConfig } from '@/shared/types/tenant';

interface CommunicationTabProps {
    tenantId: string;
    config?: BrandCommunicationConfig;
}

type EmailProvider = 'inherit' | 'smtp' | 'sendgrid' | 'ses';
type SmsProvider = 'inherit' | 'twilio' | 'vonage' | 'aws-sns';

export function CommunicationTab({ tenantId, config }: CommunicationTabProps) {
    const [emailProvider, setEmailProvider] = useState<EmailProvider>(config?.email?.provider || 'inherit');
    const [smsProvider, setSmsProvider] = useState<SmsProvider>(config?.sms?.provider || 'inherit');
    const [emailSender, setEmailSender] = useState(config?.email?.senderEmail || '');
    const [emailSenderName, setEmailSenderName] = useState(config?.email?.senderName || '');
    const [smsSenderId, setSmsSenderId] = useState(config?.sms?.senderId || '');
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const markDirty = () => setIsDirty(true);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: API call — PUT /tenants/{tenantId}/config/communication
            await new Promise(r => setTimeout(r, 1000));
            setIsDirty(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <MessageSquare size={18} />
                        Communication Configuration
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Email & SMS provider settings — inherit from platform defaults or configure custom
                    </p>
                </div>
                {isDirty && (
                    <button onClick={handleSave} disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email */}
                <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Mail size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">Email Provider</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Transactional email delivery</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</label>
                            <select value={emailProvider} onChange={e => { setEmailProvider(e.target.value as EmailProvider); markDirty(); }}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none">
                                <option value="inherit">Inherit Platform Default</option>
                                <option value="smtp">SMTP</option>
                                <option value="sendgrid">SendGrid</option>
                                <option value="ses">AWS SES</option>
                            </select>
                        </div>

                        {emailProvider === 'inherit' ? (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <Globe size={14} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700">Using platform default email provider</span>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender Email</label>
                                    <input value={emailSender} onChange={e => { setEmailSender(e.target.value); markDirty(); }}
                                        placeholder="noreply@brand.com"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender Name</label>
                                    <input value={emailSenderName} onChange={e => { setEmailSenderName(e.target.value); markDirty(); }}
                                        placeholder="Acme Pizza"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        emailProvider !== 'inherit' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                        <CheckCircle2 size={12} />
                        {emailProvider !== 'inherit' ? 'Custom configuration active' : 'Platform defaults inherited'}
                    </div>
                </section>

                {/* SMS */}
                <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Smartphone size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">SMS Provider</h4>
                            <p className="text-[10px] text-slate-500 font-medium">OTP verification & transactional SMS</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</label>
                            <select value={smsProvider} onChange={e => { setSmsProvider(e.target.value as SmsProvider); markDirty(); }}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none">
                                <option value="inherit">Inherit Platform Default</option>
                                <option value="twilio">Twilio</option>
                                <option value="vonage">Vonage</option>
                                <option value="aws-sns">AWS SNS</option>
                            </select>
                        </div>

                        {smsProvider === 'inherit' ? (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <Globe size={14} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700">Using platform default SMS provider</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender ID</label>
                                <input value={smsSenderId} onChange={e => { setSmsSenderId(e.target.value); markDirty(); }}
                                    placeholder="ACMEPZZA"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                            </div>
                        )}
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        smsProvider !== 'inherit' ? 'bg-violet-50 text-violet-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                        <CheckCircle2 size={12} />
                        {smsProvider !== 'inherit' ? 'Custom configuration active' : 'Platform defaults inherited'}
                    </div>
                </section>
            </div>
        </div>
    );
}
