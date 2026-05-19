'use client';

import React from 'react';
import { Smartphone, Key, Send, CheckCircle2, AlertCircle, SkipForward } from 'lucide-react';
import { FormSectionTitle, InputWrapper, INPUT_CLASS } from './ui';
import type { OnboardingSmsConfig } from '../types/onboarding.types';

interface SmsConfigStepProps {
    sms: OnboardingSmsConfig;
    onUpdate: (updates: Partial<OnboardingSmsConfig>) => void;
}

export function SmsConfigStep({ sms, onUpdate }: SmsConfigStepProps) {
    if (!sms) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
        );
    }

    const isCustomProvider = sms.provider !== 'inherit';

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Provider Selection */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <FormSectionTitle icon={Smartphone} title="SMS Gateway Configuration" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                    Configure dedicated SMS routing for OTP verification and customer notifications. <span className="font-black text-slate-700">This step is optional</span> — you can skip it and configure later.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {([
                        { id: 'inherit' as const, label: 'Skip / Default', desc: 'Configure later', icon: SkipForward },
                        { id: 'twilio' as const, label: 'Twilio', desc: 'Twilio API', icon: Smartphone },
                        { id: 'vonage' as const, label: 'Vonage', desc: 'Vonage SMS', icon: Smartphone },
                        { id: 'aws-sns' as const, label: 'AWS SNS', desc: 'Amazon SNS', icon: Smartphone },
                    ]).map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onUpdate({ provider: opt.id })}
                            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border text-center transition-all ${
                                sms.provider === opt.id
                                    ? opt.id === 'inherit'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]'
                                        : 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                        >
                            <span className="text-xs font-black uppercase tracking-wider">{opt.label}</span>
                            <span className={`text-[9px] font-medium ${sms.provider === opt.id ? 'text-white/60' : 'text-slate-400'}`}>{opt.desc}</span>
                        </button>
                    ))}
                </div>

                {sms.provider === 'inherit' && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-blue-800">SMS Skipped</p>
                            <p className="text-[10px] text-blue-600 mt-1">No SMS gateway will be configured for this brand. You can set this up later from the brand settings.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* API Credentials */}
            {isCustomProvider && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <FormSectionTitle icon={Key} title="API Credentials" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sms.provider === 'twilio' && (
                            <InputWrapper label="Account SID" required>
                                <input
                                    type="text"
                                    value={sms.accountSid || ''}
                                    onChange={(e) => onUpdate({ accountSid: e.target.value })}
                                    placeholder="AC••••••••••••"
                                    className={INPUT_CLASS}
                                />
                            </InputWrapper>
                        )}

                        <InputWrapper label="API Key" required>
                            <input
                                type="password"
                                value={sms.apiKey || ''}
                                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                                placeholder="sk_••••••••••••"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>

                        <InputWrapper label="API Secret" required>
                            <input
                                type="password"
                                value={sms.apiSecret || ''}
                                onChange={(e) => onUpdate({ apiSecret: e.target.value })}
                                placeholder="••••••••••••"
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
                        The sender ID or phone number that recipients will see on incoming messages.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputWrapper label="Sender ID / From Number" required>
                            <input
                                type="text"
                                value={sms.senderId}
                                onChange={(e) => onUpdate({ senderId: e.target.value })}
                                placeholder="ACME-MSG or +14165550100"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>
                    </div>

                    {!sms.senderId && isCustomProvider && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-amber-700 font-medium">Sender ID is required when using a custom SMS provider.</p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
