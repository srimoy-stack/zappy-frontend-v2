'use client';

import React from 'react';
import { Globe, Server, Shield, Cpu, AlertCircle, Wifi, FileText } from 'lucide-react';
import { FormSectionTitle, InputWrapper, INPUT_CLASS } from './ui';
import type { OnboardingHostingConfig } from '../types/onboarding.types';

interface HostingConfigStepProps {
    hosting: OnboardingHostingConfig;
    onUpdate: (updates: Partial<OnboardingHostingConfig>) => void;
}

const HOSTING_PROVIDERS = [
    { value: 'zyappy-managed', label: 'Zyappy Managed', description: 'Fully managed by our platform — zero DevOps required' },
    { value: 'custom', label: 'Custom / Self-Hosted', description: 'Point DNS to your own infrastructure' },
    { value: 'cloudflare', label: 'Cloudflare Pages', description: 'Deploy via Cloudflare with edge caching' },
] as const;

const SSL_METHODS = [
    { value: 'auto-letsencrypt', label: "Let's Encrypt (Auto)", description: 'Free SSL — auto-provisioned and renewed' },
    { value: 'custom-cert', label: 'Custom Certificate', description: 'Upload your own SSL cert and key' },
    { value: 'cloudflare-origin', label: 'Cloudflare Origin', description: 'Use Cloudflare origin CA certificate' },
] as const;

const DNS_METHODS = [
    { value: 'cname', label: 'CNAME Record', description: 'Point a CNAME to our edge (recommended)' },
    { value: 'a-record', label: 'A Record', description: 'Point an A record to our server IP' },
    { value: 'ns-delegation', label: 'NS Delegation', description: 'Delegate nameservers for full DNS control' },
] as const;

export function HostingConfigStep({ hosting, onUpdate }: HostingConfigStepProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Info Banner */}
            <section className="bg-gradient-to-br from-cyan-50 to-sky-50 p-8 rounded-3xl border border-cyan-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-200">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-cyan-900">Online Ordering — Domain & Hosting</h3>
                        <p className="text-[10px] text-cyan-600 font-medium mt-0.5">
                            Configure the storefront domain, DNS routing, and SSL for this brand&apos;s online ordering portal.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/60 border border-cyan-100 rounded-2xl">
                    <AlertCircle className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-cyan-700 font-medium leading-relaxed">
                        The brand&apos;s customers will access their ordering portal through the custom domain configured here. 
                        DNS changes typically propagate within <span className="font-black">15–60 minutes</span>.
                    </p>
                </div>
            </section>

            {/* Domain Configuration */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <FormSectionTitle icon={Globe} title="Custom Domain" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                    Enter the domain where the online ordering storefront will be accessible.
                </p>

                <InputWrapper label="Storefront Domain" required>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={hosting.customDomain}
                            onChange={(e) => onUpdate({ customDomain: e.target.value })}
                            placeholder="e.g. order.mybrand.com"
                            className={`${INPUT_CLASS} pl-11 font-mono text-xs`}
                        />
                    </div>
                </InputWrapper>

                {hosting.customDomain && /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(hosting.customDomain.trim()) && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-[10px] text-emerald-700 font-medium">
                            Portal URL preview: <code className="font-mono font-black bg-emerald-100 px-1.5 py-0.5 rounded">https://{hosting.customDomain.trim()}</code>
                        </p>
                    </div>
                )}
            </section>

            {/* Hosting Provider */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <FormSectionTitle icon={Server} title="Hosting Provider" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                    Choose how the storefront will be hosted and served to customers.
                </p>

                <div className="grid grid-cols-1 gap-3">
                    {HOSTING_PROVIDERS.map((provider) => (
                        <button
                            key={provider.value}
                            type="button"
                            onClick={() => onUpdate({ hostingProvider: provider.value })}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all group ${
                                hosting.hostingProvider === provider.value
                                    ? 'border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-100'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-black ${
                                        hosting.hostingProvider === provider.value ? 'text-cyan-900' : 'text-slate-900'
                                    }`}>{provider.label}</p>
                                    <p className={`text-[10px] font-medium mt-0.5 ${
                                        hosting.hostingProvider === provider.value ? 'text-cyan-600' : 'text-slate-400'
                                    }`}>{provider.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    hosting.hostingProvider === provider.value
                                        ? 'border-cyan-500 bg-cyan-500'
                                        : 'border-slate-300'
                                }`}>
                                    {hosting.hostingProvider === provider.value && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* SSL Configuration */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <FormSectionTitle icon={Shield} title="SSL Certificate" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                    Choose how to provision the HTTPS certificate for secure ordering.
                </p>

                <div className="grid grid-cols-1 gap-3">
                    {SSL_METHODS.map((method) => (
                        <button
                            key={method.value}
                            type="button"
                            onClick={() => onUpdate({ sslMethod: method.value })}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                                hosting.sslMethod === method.value
                                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-black ${
                                        hosting.sslMethod === method.value ? 'text-emerald-900' : 'text-slate-900'
                                    }`}>{method.label}</p>
                                    <p className={`text-[10px] font-medium mt-0.5 ${
                                        hosting.sslMethod === method.value ? 'text-emerald-600' : 'text-slate-400'
                                    }`}>{method.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    hosting.sslMethod === method.value
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : 'border-slate-300'
                                }`}>
                                    {hosting.sslMethod === method.value && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Custom cert upload fields */}
                {hosting.sslMethod === 'custom-cert' && (
                    <div className="grid grid-cols-1 gap-5 pt-4 border-t border-slate-100">
                        <InputWrapper label="SSL Certificate (PEM)" required>
                            <textarea
                                value={hosting.sslCertPem || ''}
                                onChange={(e) => onUpdate({ sslCertPem: e.target.value })}
                                placeholder="-----BEGIN CERTIFICATE-----&#10;MIIFjTCCA3Wg..."
                                rows={4}
                                className={`${INPUT_CLASS} font-mono text-[10px] !py-3 resize-none`}
                            />
                        </InputWrapper>
                        <InputWrapper label="Private Key (PEM)" required>
                            <textarea
                                value={hosting.sslKeyPem || ''}
                                onChange={(e) => onUpdate({ sslKeyPem: e.target.value })}
                                placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;MIIEowIBAAKCA..."
                                rows={4}
                                className={`${INPUT_CLASS} font-mono text-[10px] !py-3 resize-none`}
                            />
                        </InputWrapper>
                    </div>
                )}
            </section>

            {/* DNS Configuration */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <FormSectionTitle icon={Cpu} title="DNS Verification" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                    Select how the domain ownership will be verified and traffic routed.
                </p>

                <div className="grid grid-cols-1 gap-3">
                    {DNS_METHODS.map((method) => (
                        <button
                            key={method.value}
                            type="button"
                            onClick={() => onUpdate({ dnsVerification: method.value })}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                                hosting.dnsVerification === method.value
                                    ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-black ${
                                        hosting.dnsVerification === method.value ? 'text-sky-900' : 'text-slate-900'
                                    }`}>{method.label}</p>
                                    <p className={`text-[10px] font-medium mt-0.5 ${
                                        hosting.dnsVerification === method.value ? 'text-sky-600' : 'text-slate-400'
                                    }`}>{method.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    hosting.dnsVerification === method.value
                                        ? 'border-sky-500 bg-sky-500'
                                        : 'border-slate-300'
                                }`}>
                                    {hosting.dnsVerification === method.value && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* DNS record preview */}
                {hosting.customDomain && (
                    <div className="p-5 bg-slate-900 rounded-2xl space-y-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DNS Record Required</span>
                        <div className="grid grid-cols-3 gap-4 text-[10px] font-mono">
                            <div>
                                <span className="text-slate-500 block mb-1">Type</span>
                                <span className="text-cyan-400 font-black">{hosting.dnsVerification === 'cname' ? 'CNAME' : hosting.dnsVerification === 'a-record' ? 'A' : 'NS'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-1">Name</span>
                                <span className="text-emerald-400 font-black">{hosting.customDomain.trim() || 'order.mybrand.com'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-1">Value</span>
                                <span className="text-amber-400 font-black">
                                    {hosting.dnsVerification === 'cname'
                                        ? 'proxy.zyappy.com'
                                        : hosting.dnsVerification === 'a-record'
                                            ? '198.51.100.42'
                                            : 'ns1.zyappy.com'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* CDN & Notes */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <FormSectionTitle icon={FileText} title="Additional Options" />

                {/* CDN Toggle */}
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                        <p className="text-sm font-black text-slate-900">CDN Caching</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Enable edge caching for static assets (images, scripts, styles) to improve load times.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onUpdate({ cdnEnabled: !hosting.cdnEnabled })}
                        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
                            hosting.cdnEnabled ? 'bg-cyan-500' : 'bg-slate-300'
                        }`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            hosting.cdnEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                {/* Notes */}
                <InputWrapper label="Special Requirements / Notes" optional>
                    <textarea
                        value={hosting.notes || ''}
                        onChange={(e) => onUpdate({ notes: e.target.value })}
                        placeholder="Any special hosting requirements, IP whitelisting, custom headers, etc."
                        rows={3}
                        className={`${INPUT_CLASS} resize-none`}
                    />
                </InputWrapper>
            </section>
        </div>
    );
}
