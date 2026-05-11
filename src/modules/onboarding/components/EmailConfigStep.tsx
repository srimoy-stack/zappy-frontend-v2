'use client';

import React from 'react';
import { Mail, Server, Key, Send, CheckCircle2, AlertCircle } from 'lucide-react';
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

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Provider Selection */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <FormSectionTitle icon={Mail} title="Email Service Configuration" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                    Configure how this brand sends transactional emails — order confirmations, password resets, and campaign messages.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputWrapper label="Email Provider">
                        <select
                            value={email.provider}
                            onChange={(e) => onUpdate({ provider: e.target.value as any })}
                            className={INPUT_CLASS}
                        >
                            <option value="inherit">Inherit Platform Default</option>
                            <option value="smtp">Standard SMTP</option>
                            <option value="sendgrid">SendGrid API</option>
                            <option value="ses">Amazon SES</option>
                        </select>
                    </InputWrapper>

                    {email.provider === 'inherit' && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl col-span-full">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-blue-800">Using Platform Defaults</p>
                                <p className="text-[10px] text-blue-600 mt-1">This brand will use the platform's global email infrastructure. No additional configuration needed.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* SMTP / API Configuration */}
            {isCustomProvider && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <FormSectionTitle icon={Server} title="Connection Settings" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {email.provider === 'smtp' && (
                            <>
                                <InputWrapper label="SMTP Host">
                                    <input
                                        type="text"
                                        value={email.host || ''}
                                        onChange={(e) => onUpdate({ host: e.target.value })}
                                        placeholder="smtp.provider.com"
                                        className={INPUT_CLASS}
                                    />
                                </InputWrapper>
                                <InputWrapper label="SMTP Port">
                                    <input
                                        type="number"
                                        value={email.port || 587}
                                        onChange={(e) => onUpdate({ port: parseInt(e.target.value) || 587 })}
                                        placeholder="587"
                                        className={INPUT_CLASS}
                                    />
                                </InputWrapper>
                                <InputWrapper label="Username">
                                    <input
                                        type="text"
                                        value={email.username || ''}
                                        onChange={(e) => onUpdate({ username: e.target.value })}
                                        placeholder="smtp-user@provider.com"
                                        className={INPUT_CLASS}
                                    />
                                </InputWrapper>
                                <InputWrapper label="Password">
                                    <input
                                        type="password"
                                        value={email.password || ''}
                                        onChange={(e) => onUpdate({ password: e.target.value })}
                                        placeholder="••••••••"
                                        className={INPUT_CLASS}
                                    />
                                </InputWrapper>
                            </>
                        )}

                        {(email.provider === 'sendgrid' || email.provider === 'ses') && (
                            <InputWrapper label="API Key">
                                <input
                                    type="password"
                                    value={email.apiKey || ''}
                                    onChange={(e) => onUpdate({ apiKey: e.target.value })}
                                    placeholder="SG.••••••••••••"
                                    className={INPUT_CLASS}
                                />
                            </InputWrapper>
                        )}
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
                        <InputWrapper label="Sender Name">
                            <input
                                type="text"
                                value={email.senderName}
                                onChange={(e) => onUpdate({ senderName: e.target.value })}
                                placeholder="Acme Pizza Support"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                        <InputWrapper label="Sender Email">
                            <input
                                type="email"
                                value={email.senderEmail}
                                onChange={(e) => onUpdate({ senderEmail: e.target.value })}
                                placeholder="support@acmepizza.com"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                    </div>

                    {!email.senderEmail && isCustomProvider && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-amber-700 font-medium">Sender email is required when using a custom email provider.</p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
