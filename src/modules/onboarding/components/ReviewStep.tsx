'use client';

import React from 'react';
import { Building2, UserCircle, LayoutGrid, Mail, Smartphone, CheckCircle2, Bot } from 'lucide-react';
import { FormSectionTitle, ReviewField } from './ui';
import type { OnboardingFormData, OnboardingStep } from '../types/onboarding.types';
import { getNode } from '@/shared/config/modules';

interface ReviewStepProps {
    data: OnboardingFormData;
    onGoToStep: (step: OnboardingStep) => void;
    needsEmail?: boolean;
    needsSms?: boolean;
    needsVapi?: boolean;
}

export function ReviewStep({ data, onGoToStep, needsEmail = false, needsSms = false, needsVapi = false }: ReviewStepProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Brand Summary */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <FormSectionTitle icon={Building2} title="Brand Identity" />
                    <button onClick={() => onGoToStep(1)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <ReviewField label="Legal Name" value={data.brand.brandLegalName} />
                    <ReviewField label="Display Name" value={data.brand.brandName} />
                    <ReviewField label="Trade Name" value={data.brand.tradeName} />
                    <ReviewField label="City" value={data.brand.city} />
                    <ReviewField label="Province" value={data.brand.province} />
                    <ReviewField label="Country" value={data.brand.country} />
                    <ReviewField label="Timezone" value={data.brand.timezone} />
                    <ReviewField label="Currency" value={data.brand.currency} />
                    <ReviewField label="Contact Email" value={data.brand.contactEmail} />
                    <ReviewField label="Contact Phone" value={data.brand.contactPhone} />
                    <ReviewField label="Payment Terms" value={data.brand.paymentTermType === 'NET_DAYS' ? `Net ${data.brand.netDays} Days` : data.brand.paymentTermType} />
                </div>
            </section>

            {/* Module Entitlements */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <FormSectionTitle icon={LayoutGrid} title={`Modules (${data.enabledModuleIds.length})`} />
                    <button onClick={() => onGoToStep(2)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Edit</button>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {data.enabledModuleIds.map((id) => {
                            const node = getNode(id);
                            return (
                                <div key={id} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest">
                                    <CheckCircle2 size={12} />
                                    {node?.label || id}
                                </div>
                            );
                        })}
                    </div>
                    {data.selectedEntitlementPaths.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Entitlement Paths</span>
                            <div className="flex flex-wrap gap-1.5">
                                {data.selectedEntitlementPaths.map(path => (
                                    <span key={path} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-600">
                                        {path}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Email Configuration — only if enabled */}
            {needsEmail && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <FormSectionTitle icon={Mail} title="Email Configuration" />
                        <button onClick={() => onGoToStep(3)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <ReviewField label="Provider" value={data.email.provider === 'inherit' ? 'Platform Default (Inherited)' : data.email.provider.toUpperCase()} />
                        {data.email.provider !== 'inherit' && (
                            <>
                                <ReviewField label="Sender Name" value={data.email.senderName} />
                                <ReviewField label="Sender Email" value={data.email.senderEmail} />
                                {data.email.replyTo && <ReviewField label="Reply-To" value={data.email.replyTo} />}
                                {data.email.provider === 'smtp' && (
                                    <>
                                        <ReviewField label="SMTP Host" value={data.email.host || '—'} />
                                        <ReviewField label="Port" value={String(data.email.port || 587)} />
                                        <ReviewField label="Encryption" value={(data.email.encryption || 'tls').toUpperCase()} />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* SMS Configuration — only if enabled */}
            {needsSms && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <FormSectionTitle icon={Smartphone} title="SMS Configuration" />
                        <button onClick={() => onGoToStep(4)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <ReviewField label="Provider" value={data.sms.provider === 'inherit' ? 'Skipped (Not Configured)' : data.sms.provider.toUpperCase()} />
                        {data.sms.provider !== 'inherit' && (
                            <ReviewField label="Sender ID" value={data.sms.senderId} />
                        )}
                    </div>
                </section>
            )}

            {/* Vapi / AI Call Analytics — only if enabled */}
            {needsVapi && (
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <FormSectionTitle icon={Bot} title="AI Call Analytics" />
                        <button onClick={() => onGoToStep(5)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <ReviewField label="Assistant ID" value={data.vapi.assistantId || '—'} />
                        <ReviewField label="Phone Number" value={data.vapi.phoneNumber || '—'} />
                    </div>
                </section>
            )}

            {/* Tenant Admin */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <FormSectionTitle icon={UserCircle} title="Tenant Admin" />
                    <button onClick={() => onGoToStep(6)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <ReviewField label="Name" value={data.admin.adminName} />
                    <ReviewField label="Email" value={data.admin.adminEmail} />
                    <ReviewField label="Phone" value={data.admin.adminPhone} />
                    <ReviewField label="Invite Method" value={data.admin.inviteMethod === 'MAGIC_LINK' ? 'Magic Link' : 'Temporary Password'} />
                </div>
            </section>
        </div>
    );
}
