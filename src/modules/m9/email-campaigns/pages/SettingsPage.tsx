'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { SETTING_GROUPS, EmailSettings } from '../types/settings.types';
import { Save, RefreshCw, CheckCircle2, AlertTriangle, Loader2, Shield, ChevronDown, ChevronUp } from 'lucide-react';

export default function SettingsPage() {
    const { settings, loading, saving, error, successMessage, updateSettings, refreshSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState<EmailSettings>({});
    const [dirty, setDirty] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        sender: true, business: true, compliance: true, thresholds: true,
    });

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setLocalSettings({ ...settings });
            setDirty(false);
        }
    }, [settings]);

    const handleChange = (key: string, value: string) => {
        setLocalSettings((prev) => ({ ...prev, [key]: value }));
        setDirty(true);
    };

    const handleToggle = (key: string) => {
        const current = localSettings[key];
        const newValue = current === 'true' ? 'false' : 'true';
        handleChange(key, newValue);
    };

    const handleSave = async () => {
        // Only send changed values
        const changes: Partial<EmailSettings> = {};
        for (const key of Object.keys(localSettings)) {
            if (localSettings[key] !== settings[key]) {
                changes[key] = localSettings[key];
            }
        }
        if (Object.keys(changes).length > 0) {
            await updateSettings(changes);
            setDirty(false);
        }
    };

    const toggleGroup = (id: string) => {
        setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <span className="ml-3 text-slate-500 text-lg">Loading settings…</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Shield className="text-indigo-600" size={28} />
                        Email Compliance Settings
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Configure sender identity, compliance rules, and safety thresholds
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshSettings}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!dirty || saving}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                            dirty
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {successMessage && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3.5 rounded-xl mb-6 animate-in fade-in">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-xl mb-6">
                    <AlertTriangle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Settings Groups */}
            <div className="space-y-6">
                {SETTING_GROUPS.map((group) => (
                    <div
                        key={group.id}
                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm"
                    >
                        {/* Group Header */}
                        <button
                            onClick={() => toggleGroup(group.id)}
                            className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{group.icon}</span>
                                <div className="text-left">
                                    <h2 className="text-lg font-bold text-slate-800">{group.title}</h2>
                                    <p className="text-sm text-slate-500">{group.description}</p>
                                </div>
                            </div>
                            {expandedGroups[group.id]
                                ? <ChevronUp size={20} className="text-slate-400" />
                                : <ChevronDown size={20} className="text-slate-400" />
                            }
                        </button>

                        {/* Group Fields */}
                        {expandedGroups[group.id] && (
                            <div className="px-6 pb-6 space-y-5 border-t border-slate-100">
                                {group.fields.map((field) => (
                                    <div key={field.key} className="pt-5">
                                        {field.type === 'toggle' ? (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700">
                                                        {field.label}
                                                    </label>
                                                    <p className="text-xs text-slate-400 mt-0.5">{field.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle(field.key)}
                                                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                                                        localSettings[field.key] === 'true'
                                                            ? 'bg-indigo-600'
                                                            : 'bg-slate-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                                                            localSettings[field.key] === 'true'
                                                                ? 'translate-x-5'
                                                                : 'translate-x-0.5'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                                    {field.label}
                                                    {field.required && (
                                                        <span className="text-red-400 text-xs">*</span>
                                                    )}
                                                </label>
                                                <p className="text-xs text-slate-400 mt-0.5 mb-2">{field.description}</p>
                                                <input
                                                    type={field.type}
                                                    value={localSettings[field.key] || ''}
                                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    step={field.type === 'number' ? '0.01' : undefined}
                                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Compliance Notice */}
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                        <h3 className="font-bold text-amber-800 text-sm">CASL / CAN-SPAM Compliance Notice</h3>
                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                            All marketing emails must include a valid physical address, sender identity, and working
                            unsubscribe mechanism. These settings are enforced server-side and cannot be bypassed.
                            The compliance footer is auto-injected into every email before sending.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
