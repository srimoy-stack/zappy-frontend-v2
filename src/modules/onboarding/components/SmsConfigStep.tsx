'use client';

import React from 'react';
import { Smartphone, Key, Send, CheckCircle2, AlertCircle } from 'lucide-react';
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
                    Configure dedicated SMS routing for POS alerts, OTP verification, and customer notifications.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputWrapper label="SMS Provider">
                        <select
                            value={sms.provider}
                            onChange={(e) => onUpdate({ provider: e.target.value as any })}
                            className={INPUT_CLASS}
                        >
                            <option value="inherit">Inherit Platform Default</option>
                            <option value="twilio">Twilio</option>
                            <option value="vonage">Vonage</option>
                            <option value="aws-sns">AWS SNS</option>
                        </select>
                    </InputWrapper>

                    {sms.provider === 'inherit' && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl col-span-full">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-blue-800">Using Platform Defaults</p>
                                <p className="text-[10px] text-blue-600 mt-1">This brand will use the platform's global SMS infrastructure. No additional configuration needed.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* API Credentials */}
            {isCustomProvider && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <FormSectionTitle icon={Key} title="API Credentials" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sms.provider === 'twilio' && (
                            <InputWrapper label="Account SID">
                                <input
                                    type="text"
                                    value={sms.accountSid || ''}
                                    onChange={(e) => onUpdate({ accountSid: e.target.value })}
                                    placeholder="AC••••••••••••"
                                    className={INPUT_CLASS}
                                />
                            </InputWrapper>
                        )}

                        <InputWrapper label="API Key">
                            <input
                                type="password"
                                value={sms.apiKey || ''}
                                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                                placeholder="sk_••••••••••••"
                                className={INPUT_CLASS}
                            />
                        </InputWrapper>

                        <InputWrapper label="API Secret">
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
                        <InputWrapper label="Sender ID / From Number">
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
