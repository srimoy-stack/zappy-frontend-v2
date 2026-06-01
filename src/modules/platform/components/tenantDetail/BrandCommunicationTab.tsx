'use client';

/**
 * BrandCommunicationTab — Brand Admin Communication Config
 *
 * Two distinct sections:
 * 1. Campaign Email Config (read-only) — set by super admin during onboarding
 * 2. Brand Communication Config (editable) — email/SMS for stores, employees, ops
 */

import React, { useState } from 'react';
import {
    MessageSquare, Mail, Smartphone, CheckCircle2, Save, Globe,
    Lock, Pencil, X, Shield, Send, Users, AlertTriangle,
} from 'lucide-react';
import type { BrandCommunicationConfig } from '@/shared/types/tenant';
import { apiClient } from '@/shared/api/apiClient';
import { cn } from '@/utils';

// ─── Props ──────────────────────────────────────────────────────────────────

interface BrandCommunicationTabProps {
    tenantId: string;
    /** Campaign email config (set by super admin — read-only) */
    campaignEmailConfig?: {
        provider: string;
        senderEmail: string;
        senderName: string;
    };
    /** Brand's own communication config (editable by brand admin) */
    config?: BrandCommunicationConfig;
}

type EmailProvider = 'inherit' | 'smtp' | 'sendgrid' | 'ses';
type SmsProvider = 'inherit' | 'twilio' | 'vonage' | 'aws-sns';

// ─── Component ──────────────────────────────────────────────────────────────

export function BrandCommunicationTab({ tenantId, campaignEmailConfig, config }: BrandCommunicationTabProps) {
    // ── Brand comm state ──
    const [emailProvider, setEmailProvider] = useState<EmailProvider>(
        (config?.email?.provider as EmailProvider) || 'inherit'
    );
    const [smsProvider, setSmsProvider] = useState<SmsProvider>(
        (config?.sms?.provider as SmsProvider) || 'inherit'
    );
    const [emailSender, setEmailSender] = useState(config?.email?.senderEmail || '');
    const [emailSenderName, setEmailSenderName] = useState(config?.email?.senderName || '');
    const [smsSenderId, setSmsSenderId] = useState(config?.sms?.senderId || '');
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const isConfigured = emailProvider !== 'inherit' || smsProvider !== 'inherit';

    const markDirty = () => { setIsDirty(true); setSaveSuccess(false); };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiClient.patch(`/tenants/${tenantId}`, {
                settings: {
                    brandComm: {
                        email: emailProvider !== 'inherit' ? {
                            provider: emailProvider,
                            senderEmail: emailSender,
                            senderName: emailSenderName,
                        } : { provider: 'inherit' },
                        sms: smsProvider !== 'inherit' ? {
                            provider: smsProvider,
                            senderId: smsSenderId,
                        } : { provider: 'inherit' },
                    },
                },
            });
            setIsDirty(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to save communication config');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Section 1: Campaign Email (Read-Only) ──────────────────── */}
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Send size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                Email Campaign Service
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-wider rounded-full border border-amber-200">
                                    <Lock size={8} /> Managed by Platform
                                </span>
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                Email delivery provider for marketing campaigns — configured by super admin during onboarding
                            </p>
                        </div>
                    </div>
                </div>

                {campaignEmailConfig && campaignEmailConfig.provider ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Provider</span>
                            <span className="text-sm font-bold text-slate-900 capitalize">{campaignEmailConfig.provider}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sender Email</span>
                            <span className="text-sm font-bold text-slate-900">{campaignEmailConfig.senderEmail || '—'}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sender Name</span>
                            <span className="text-sm font-bold text-slate-900">{campaignEmailConfig.senderName || '—'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <AlertTriangle size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">
                            No campaign email service configured — contact your platform administrator to enable this.
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600">
                    <Shield size={12} />
                    Platform-managed — changes must be requested through your account manager
                </div>
            </section>

            {/* ── Section 2: Brand Communication Config (Editable) ────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Users size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">Brand Communication Services</h4>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                Email & SMS for store notifications, employee alerts, order updates, and operational communication
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveSuccess && (
                            <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                                <CheckCircle2 size={14} /> Saved
                            </span>
                        )}
                        {isDirty && (
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                                <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Email Provider */}
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Mail size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">Email Provider</h4>
                                <p className="text-[10px] text-slate-500 font-medium">Transactional & operational email delivery</p>
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
                                            placeholder="noreply@yourbrand.com"
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender Name</label>
                                        <input value={emailSenderName} onChange={e => { setEmailSenderName(e.target.value); markDirty(); }}
                                            placeholder="Your Brand Name"
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider",
                            emailProvider !== 'inherit' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400')}>
                            <CheckCircle2 size={12} />
                            {emailProvider !== 'inherit' ? 'Custom configuration active' : 'Platform defaults inherited'}
                        </div>
                    </section>

                    {/* SMS Provider */}
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                                <Smartphone size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">SMS Provider</h4>
                                <p className="text-[10px] text-slate-500 font-medium">OTP, order updates & employee notifications</p>
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
                                        placeholder="YOURBRAND"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                            )}
                        </div>

                        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider",
                            smsProvider !== 'inherit' ? 'bg-violet-50 text-violet-600' : 'bg-slate-50 text-slate-400')}>
                            <CheckCircle2 size={12} />
                            {smsProvider !== 'inherit' ? 'Custom configuration active' : 'Platform defaults inherited'}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
