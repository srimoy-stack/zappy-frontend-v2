'use client';

import { useState, useEffect } from 'react';
import { 
    Mail, Phone, Save, Loader2, AlertCircle, 
    CheckCircle2, Globe, Server, ShieldCheck,
    Send, Smartphone
} from 'lucide-react';
import { cn } from '@/utils';
import { api } from '@/shared/api';
import { BrandCommunicationConfig, EmailConfig, SmsConfig } from '@/shared/types/tenant';

interface BrandConfigPageProps {
    params: { brandId: string };
}

export default function BrandConfigPage({ params }: BrandConfigPageProps) {
    const brandId = params.brandId;
    const [config, setConfig] = useState<BrandCommunicationConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await api.getTenantConfig(brandId);
                setConfig(data);
            } catch (err) {
                console.error('Failed to load brand config', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, [brandId]);

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await api.updateTenantConfig(brandId, config);
            setMessage({ type: 'success', text: 'Configuration saved successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save configuration' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Communication Orchestration</h1>
                    <p className="text-sm font-medium text-slate-500">Configure tenant-isolated SMTP and SMS infrastructure</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-200 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                    message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
                )}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Email Configuration */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">SMTP & Email Infrastructure</h2>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Provider</label>
                                <select 
                                    value={config?.email.provider}
                                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, email: { ...prev.email, provider: e.target.value as any } }) : null)}
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                                >
                                    <option value="smtp">Standard SMTP</option>
                                    <option value="sendgrid">SendGrid API</option>
                                    <option value="ses">Amazon SES</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encryption</label>
                                <select 
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                                >
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                            <div className="relative">
                                <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="smtp.provider.com"
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sender Name</label>
                                <input 
                                    type="text" 
                                    value={config?.email.senderName}
                                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, email: { ...prev.email, senderName: e.target.value } }) : null)}
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sender Email</label>
                                <input 
                                    type="email" 
                                    value={config?.email.senderEmail}
                                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, email: { ...prev.email, senderEmail: e.target.value } }) : null)}
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                            <Send size={14} />
                            Send Test Email
                        </button>
                    </div>
                </section>

                {/* SMS Configuration */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                            <Smartphone size={20} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">SMS & Gateway Settings</h2>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMS Provider</label>
                            <select 
                                value={config?.sms.provider}
                                onChange={(e) => setConfig(prev => prev ? ({ ...prev, sms: { ...prev.sms, provider: e.target.value as any } }) : null)}
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-purple-500/20 transition-all"
                            >
                                <option value="twilio">Twilio</option>
                                <option value="vonage">Vonage</option>
                                <option value="aws-sns">AWS SNS</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sender ID / From Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    value={config?.sms.senderId}
                                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, sms: { ...prev.sms, senderId: e.target.value } }) : null)}
                                    placeholder="ACME-MSG"
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Key / Auth Token</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="password" 
                                    placeholder="••••••••••••••••"
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                            <Smartphone size={14} />
                            Send Test SMS
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
