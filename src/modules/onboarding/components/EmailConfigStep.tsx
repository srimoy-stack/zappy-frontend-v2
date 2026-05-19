'use client';

import React from 'react';
import { Mail, Server, Key, Send, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { FormSectionTitle, InputWrapper, INPUT_CLASS } from './ui';
import type { OnboardingEmailConfig } from '../types/onboarding.types';

interface EmailConfigStepProps {
    email: OnboardingEmailConfig;
    onUpdate: (updates: Partial<OnboardingEmailConfig>) => void;
}

export function EmailConfigStep({ email, onUpdate }: EmailConfigStepProps) {
    if (!email) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
        );
    }

    const isCustomProvider = email.provider !== 'inherit';
    const isSmtp = email.provider === 'smtp';
    const isApi = email.provider === 'sendgrid' || email.provider === 'ses';

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Provider Selection */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <FormSectionTitle icon={Mail} title="Email Service Configuration" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                    Configure how this brand sends campaign emails, transactional messages, and notifications.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {([
                        { id: 'smtp' as const, label: 'SMTP', desc: 'Standard mail server' },
                        { id: 'sendgrid' as const, label: 'SendGrid', desc: 'SendGrid API' },
                        { id: 'ses' as const, label: 'Amazon SES', desc: 'AWS Simple Email' },
                        { id: 'inherit' as const, label: 'Platform Default', desc: 'Use global config' },
                    ]).map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onUpdate({ provider: opt.id })}
                            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border text-center transition-all ${
                                email.provider === opt.id
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                        >
                            <span className="text-xs font-black uppercase tracking-wider">{opt.label}</span>
                            <span className={`text-[9px] font-medium ${email.provider === opt.id ? 'text-white/60' : 'text-slate-400'}`}>{opt.desc}</span>
                        </button>
                    ))}
                </div>

                {email.provider === 'inherit' && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-blue-800">Using Platform Defaults</p>
                            <p className="text-[10px] text-blue-600 mt-1">This brand will use the platform&apos;s global email infrastructure. No additional configuration needed.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* SMTP Configuration */}
            {isSmtp && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <FormSectionTitle icon={Server} title="SMTP Connection" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputWrapper label="SMTP Host" required>
                            <input
                                type="text"
                                value={email.host || ''}
                                onChange={(e) => onUpdate({ host: e.target.value })}
                                placeholder="smtp.provider.com"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                        <div className="grid grid-cols-2 gap-4">
                            <InputWrapper label="Port" required>
                                <input
                                    type="number"
                                    value={email.port || 587}
                                    onChange={(e) => onUpdate({ port: parseInt(e.target.value) || 587 })}
                                    placeholder="587"
                                    className={INPUT_CLASS}
                                />
                            </InputWrapper>
                            <InputWrapper label="Encryption" required>
                                <select
                                    value={email.encryption || 'tls'}
                                    onChange={(e) => onUpdate({ encryption: e.target.value as 'tls' | 'ssl' | 'none' })}
                                    className={INPUT_CLASS}
                                >
                                    <option value="tls">TLS (Recommended)</option>
                                    <option value="ssl">SSL</option>
                                    <option value="none">None</option>
                                </select>
                            </InputWrapper>
                        </div>
                        <InputWrapper label="Username" required>
                            <input
                                type="text"
                                value={email.username || ''}
                                onChange={(e) => onUpdate({ username: e.target.value })}
                                placeholder="smtp-user@provider.com"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                        <InputWrapper label="Password" required>
                            <input
                                type="password"
                                value={email.password || ''}
                                onChange={(e) => onUpdate({ password: e.target.value })}
                                placeholder="••••••••"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                    </div>
                </section>
            )}

            {/* API Key Configuration */}
            {isApi && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <FormSectionTitle icon={Key} title={`${email.provider === 'sendgrid' ? 'SendGrid' : 'AWS SES'} API Configuration`} />

                    <div className="grid grid-cols-1 gap-6">
                        <InputWrapper label="API Key" required>
                            <input
                                type="password"
                                value={email.apiKey || ''}
                                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                                placeholder={email.provider === 'sendgrid' ? 'SG.••••••••••••' : 'AKIA••••••••••••'}
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                    </div>
                </section>
            )}

            {/* Sender Identity */}
            {isCustomProvider && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <FormSectionTitle icon={Send} title="Sender Identity" />
                    <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                        This is the name and email address recipients will see in their inbox.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputWrapper label="Sender Name" required>
                            <input
                                type="text"
                                value={email.senderName}
                                onChange={(e) => onUpdate({ senderName: e.target.value })}
                                placeholder="Acme Pizza Support"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                        <InputWrapper label="Sender Email" required>
                            <input
                                type="email"
                                value={email.senderEmail}
                                onChange={(e) => onUpdate({ senderEmail: e.target.value })}
                                placeholder="support@acmepizza.com"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                        <InputWrapper label="Reply-To Email">
                            <input
                                type="email"
                                value={email.replyTo || ''}
                                onChange={(e) => onUpdate({ replyTo: e.target.value })}
                                placeholder="reply@acmepizza.com (optional)"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                    </div>

                    {(!email.senderEmail || !email.senderName) && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-amber-700 font-medium">Sender name and email are required when using a custom email provider.</p>
                        </div>
                    )}
                </section>
            )}

            {/* Security Note */}
            {isCustomProvider && (
                <div className="flex items-start gap-3 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Credentials are encrypted at rest and never exposed in API responses. Only the Super Admin who configured them can update these values.
                    </p>
                </div>
            )}
        </div>
    );
}
