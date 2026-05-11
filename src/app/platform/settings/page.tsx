'use client';

import { useState } from 'react';
import { 
    Settings, 
    ShieldCheck, 
    Palette, 
    Globe, 
    Bell, 
    Database, 
    Cloud, 
    Save, 
    Mail, 
    Smartphone,
    Lock,
    Key,
    UserCheck,
    CreditCard
} from 'lucide-react';
import { cn } from '@/utils';

export default function PlatformSettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'appearance' | 'notifications'>('general');

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
                    <p className="text-slate-500 font-medium mt-1">Configure global environment variables and governance policies</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
                    <Save size={20} />
                    Save All Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all border-2",
                                activeTab === tab.id 
                                    ? "bg-white border-slate-900 text-slate-900 shadow-sm" 
                                    : "bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
                    <div className="p-10">
                        {activeTab === 'general' && <GeneralSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {activeTab === 'appearance' && <AppearanceSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GeneralSettings() {
    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-xl font-black text-slate-900">Platform Identity</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Basic identification for your multi-tenant environment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Platform Name</label>
                    <input 
                        type="text" 
                        defaultValue="Zyappy Enterprise"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Support Email</label>
                    <input 
                        type="email" 
                        defaultValue="support@zyappy.com"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Domain</label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            type="text" 
                            defaultValue="admin.zyappy.cloud"
                            className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Default Region</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none cursor-pointer">
                        <option>US East (N. Virginia)</option>
                        <option>Canada Central (Toronto)</option>
                        <option>Europe (Frankfurt)</option>
                    </select>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Database size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900">Maintenance Mode</h4>
                        <p className="text-xs text-slate-400 font-medium">Prevents all tenant access while performing system updates</p>
                    </div>
                </div>
                <button className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors">
                    Enable
                </button>
            </div>
        </div>
    );
}

function SecuritySettings() {
    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-xl font-black text-slate-900">Authentication & Access</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Global security protocols and password policies</p>
            </div>

            <div className="space-y-6">
                {[
                    { 
                        title: 'Multi-Factor Authentication (MFA)', 
                        desc: 'Enforce MFA for all platform and tenant administrators',
                        icon: UserCheck,
                        enabled: true
                    },
                    { 
                        title: 'Single Sign-On (SSO)', 
                        desc: 'Allow enterprise tenants to connect their own IDPs (Okta, Azure AD)',
                        icon: Key,
                        enabled: true
                    },
                    { 
                        title: 'IP Whitelisting', 
                        desc: 'Restrict platform login to specific corporate IP addresses',
                        icon: Lock,
                        enabled: false
                    }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <item.icon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                                <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                            </div>
                        </div>
                        <div className={cn(
                            "w-12 h-6 rounded-full relative transition-all cursor-pointer",
                            item.enabled ? "bg-emerald-500" : "bg-slate-200"
                        )}>
                            <div className={cn(
                                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                                item.enabled ? "left-7" : "left-1"
                            )} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-black text-slate-900 mb-4">API Token Governance</h4>
                <div className="p-6 bg-slate-900 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Cloud size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active System Key</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Rotated 3 days ago</span>
                    </div>
                    <code className="block text-white font-mono text-sm break-all opacity-80">
                        zy_live_8f9e0a2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p
                    </code>
                </div>
            </div>
        </div>
    );
}

function AppearanceSettings() {
    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-xl font-black text-slate-900">Global Theming</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Platform-wide branding defaults (overridable by tenants)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Brand Color</label>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border-4 border-white shadow-lg" />
                            <input 
                                type="text" 
                                defaultValue="#0F172A"
                                className="flex-1 px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-mono font-bold text-slate-900 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Typography</label>
                        <select className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 outline-none">
                            <option>Inter (Default)</option>
                            <option>Roboto</option>
                            <option>Outfit</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Logo</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-slate-400 transition-all cursor-pointer bg-slate-50/50">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm mb-3">
                                <Palette size={24} />
                            </div>
                            <span className="text-xs font-black text-slate-900">Replace Logo</span>
                            <span className="text-[10px] text-slate-400 font-medium mt-1">SVG or PNG (Max 2MB)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NotificationSettings() {
    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-xl font-black text-slate-900">System Alerts</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Communication channels for critical system events</p>
            </div>

            <div className="space-y-6">
                {[
                    { title: 'Email Gateway', icon: Mail, value: 'SMTP (Twilio SendGrid)' },
                    { title: 'SMS Gateway', icon: Smartphone, value: 'Active (Twilio)' },
                    { title: 'Billing Notifications', icon: CreditCard, value: 'Stripe Webhooks' }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <item.icon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                                <p className="text-xs text-slate-400 font-medium">{item.value}</p>
                            </div>
                        </div>
                        <button className="text-xs font-black text-slate-900 hover:underline">Configure</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
