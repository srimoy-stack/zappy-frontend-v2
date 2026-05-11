'use client';

import React, { useState } from 'react';
import { SettingsLayout } from '../components/Settings/SettingsLayout';
import { User, Mail, Phone, Shield, Fingerprint } from 'lucide-react';

export const ProfileDetailSettings: React.FC = () => {
    const [formData, setFormData] = useState({
        name: 'John Doe',
        email: 'admin@zyappy.com',
        phone: '+1 (555) 123-4567',
        twoFactor: true
    });

    const handleSave = () => {
        alert('Profile updated successfully (Mock)');
    };

    return (
        <SettingsLayout
            title="Edit Profile"
            description="Manage your personal information and security preferences."
            onSave={handleSave}
        >
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-slate-900 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-slate-900 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-slate-900 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col justify-center">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.twoFactor}
                                    onChange={(e) => setFormData({ ...formData, twoFactor: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Two-Factor Authentication</span>
                                <span className="text-[10px] text-slate-500 font-medium">Add an extra layer of security to your account.</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        Account Governance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Assigned Role</p>
                            <p className="text-xs font-bold text-slate-900">Brand Admin</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Access Scope</p>
                            <p className="text-xs font-bold text-slate-900">All Stores (Full)</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Security Level</p>
                            <p className="text-xs font-bold text-slate-900">Highest (L1)</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <Fingerprint className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-wider">
                        Changes to your primary credentials may require re-verification.
                        Multi-store access permissions are managed by the master account holder.
                    </p>
                </div>
            </div>
        </SettingsLayout>
    );
};
