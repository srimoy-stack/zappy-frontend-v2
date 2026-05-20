'use client';

import React, { useState, useEffect } from 'react';
import {
    Save,
    Mail,
    MessageSquare,
    Building2,
    Globe,
    Percent,
    Gift,
    LayoutGrid,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Upload,
    ChevronDown,
    Plus,
    Trash2,
    Power,
    ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserType } from '@/shared/types/auth';
;
import { useAuth } from '@/app/providers/AuthProvider';
import { businessOperationsService } from '../../services/businessOperationsService';
import {
    BusinessOperationsSettings,
    BusinessInfo,
    LocalizationSettings,
    TaxRule,
    SmtpSettings,
    SmsSettings,
    LoyaltySettings,
    ModuleSettings,
    BusinessLocation
} from '../../types/business-operations';

export const BusinessOperationsPage: React.FC = () => {
    const router = useRouter();
    const { userType, isSuperAdmin, tenantId } = useAuth();
    const [settings, setSettings] = useState<BusinessOperationsSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Permissions logic
    const canEdit = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN || userType === UserType.MANAGER;

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await businessOperationsService.getSettings(tenantId);
            setSettings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section: string, action: () => Promise<any>) => {
        if (!canEdit) return;
        setSaving(section);
        setMessage(null);
        try {
            await action();
            setMessage({ type: 'success', text: `${section} updated successfully.` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update.' });
        } finally {
            setSaving(null);
        }
    };

    if (loading || !settings) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto pb-24 space-y-8 animate-in fade-in duration-500 p-6">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200 -mx-6 px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Operations</h1>
                        <p className="text-sm text-slate-500 font-medium">Tenant-level system configuration & identity</p>
                    </div>
                </div>

                {message && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8">
                <BusinessInfoSection
                    data={settings.businessInfo}
                    canEdit={canEdit}
                    onSave={(data) => handleSave('Business Info', () => businessOperationsService.updateBusinessInfo(data))}
                    isSaving={saving === 'Business Info'}
                />

                <LocalizationSection
                    data={settings.localization}
                    canEdit={canEdit}
                    onSave={(data) => handleSave('Localization', () => businessOperationsService.updateLocalization(data))}
                    isSaving={saving === 'Localization'}
                />

                <LocationsSection
                    locations={settings.locations}
                    canEdit={canEdit}
                    onSave={(data) => handleSave('Locations', () => businessOperationsService.updateLocations(tenantId, data))}
                    isSaving={saving === 'Locations'}
                />

                <TaxSection
                    taxes={settings.taxes}
                    canEdit={canEdit}
                    onSave={(data) => handleSave('Taxes', () => businessOperationsService.updateTaxes(data))}
                    isSaving={saving === 'Taxes'}
                />

                <SmtpSection
                    data={settings.smtp}
                    canEdit={canEdit}
                    onSave={(data) => handleSave('SMTP Settings', () => businessOperationsService.updateSmtp(data))}
                    isSaving={saving === 'SMTP Settings'}
                />

                <SmsSection
                    data={settings.sms}
                    canEdit={canEdit}
                    onSave={(data) => handleSave('SMS Settings', () => businessOperationsService.updateSms(data))}
                    isSaving={saving === 'SMS Settings'}
                />

                <LoyaltySection
                    data={settings.loyalty}
                    canEdit={canEdit}
                    onSave={(data) => handleSave('Loyalty', () => businessOperationsService.updateLoyalty(data))}
                    isSaving={saving === 'Loyalty'}
                />

                <ModuleSection
                    data={settings.modules}
                    canEdit={canEdit}
                    onSave={(data) => handleSave('Modules', () => businessOperationsService.updateModules(data))}
                    isSaving={saving === 'Modules'}
                />
            </div>
        </div>
    );
};

const SectionHeader = ({ title, icon: Icon, colorClass = "text-slate-900" }: { title: string, icon: any, colorClass?: string }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className={`p-2 rounded-xl bg-slate-100 ${colorClass}`}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">{title}</h2>
    </div>
);

const BusinessInfoSection = ({ data, canEdit, onSave, isSaving }: { data: BusinessInfo, canEdit: boolean, onSave: (d: BusinessInfo) => void, isSaving: boolean }) => {
    const [form, setForm] = useState(data);
    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <SectionHeader title="Business Information" icon={Building2} colorClass="text-emerald-600" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 group hover:border-emerald-300 transition-all cursor-pointer">
                    {form.logoUrl ? (
                        <img src={form.logoUrl} alt="Logo" className="w-32 h-32 object-contain rounded-2xl mb-4" />
                    ) : (
                        <Upload size={32} className="text-slate-400 mb-4 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logo Upload</span>
                    <p className="text-[10px] text-slate-400 mt-1">Recommended 200x200px</p>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Business Name" value={form.businessName} onChange={(v: string) => setForm({ ...form, businessName: v })} required readOnly={!canEdit} />
                    <InputField label="Start Date" type="date" value={form.startDate} onChange={(v: string) => setForm({ ...form, startDate: v })} readOnly={!canEdit} />

                    <div className="space-y-4">
                        <InputField label="Website" value={form.website} onChange={(v: string) => setForm({ ...form, website: v })} readOnly={!canEdit} />
                        <ToggleField label="Publicly visible?" checked={form.isWebsitePublic} onChange={(v: boolean) => setForm({ ...form, isWebsitePublic: v })} disabled={!canEdit} />
                    </div>

                    <div className="space-y-4">
                        <InputField label="Phone" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} readOnly={!canEdit} />
                        <ToggleField label="Publicly visible?" checked={form.isPhonePublic} onChange={(v: boolean) => setForm({ ...form, isPhonePublic: v })} disabled={!canEdit} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Business Address</label>
                        <textarea
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            readOnly={!canEdit}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none min-h-[100px] resize-none"
                        />
                    </div>
                </div>
            </div>
            {canEdit && (
                <div className="mt-8 flex justify-end">
                    <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

const LocalizationSection = ({ data, canEdit, onSave, isSaving }: { data: LocalizationSettings, canEdit: boolean, onSave: (d: LocalizationSettings) => void, isSaving: boolean }) => {
    const [form, setForm] = useState(data);
    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <SectionHeader title="Financial & Localization" icon={Globe} colorClass="text-blue-600" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SelectField label="Currency" value={form.currency} options={['USD', 'EUR', 'GBP', 'INR', 'AED']} onChange={(v: string) => setForm({ ...form, currency: v })} disabled={!canEdit} />
                <SelectField label="Decimal Precision" value={form.decimalPrecision.toString()} options={['0', '1', '2', '3']} onChange={(v: string) => setForm({ ...form, decimalPrecision: parseInt(v) })} disabled={!canEdit} />
                <SelectField label="Time Zone" value={form.timezone} options={['America/Los_Angeles', 'America/New_York', 'UTC', 'Asia/Dubai', 'Asia/Kolkata']} onChange={(v: string) => setForm({ ...form, timezone: v })} disabled={!canEdit} />
                <SelectField label="Date Format" value={form.dateFormat} options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} onChange={(v: string) => setForm({ ...form, dateFormat: v })} disabled={!canEdit} />
                <SelectField label="Time Format" value={form.timeFormat} options={['12h', '24h']} onChange={(v: string) => setForm({ ...form, timeFormat: v as any })} disabled={!canEdit} />
            </div>
            {canEdit && (
                <div className="mt-8 flex justify-end">
                    <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Localization
                    </button>
                </div>
            )}
        </div>
    );
};

const TaxSection = ({ taxes, canEdit, onSave, isSaving }: { taxes: TaxRule[], canEdit: boolean, onSave: (d: TaxRule[]) => void, isSaving: boolean }) => {
    const [list, setList] = useState(taxes);

    const addTax = () => {
        const newTax: TaxRule = {
            id: Date.now().toString(),
            name: 'New Tax',
            percentage: 0,
            type: 'Exclusive',
            applicableChannels: ['POS'],
            status: 'Active'
        };
        setList([...list, newTax]);
    };

    const removeTax = (id: string) => {
        setList(list.filter(t => t.id !== id));
    };

    const updateTax = (id: string, field: keyof TaxRule, value: any) => {
        setList(list.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
                <SectionHeader title="Tax Configuration" icon={Percent} colorClass="text-orange-600" />
                {canEdit && (
                    <button onClick={addTax} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-all">
                        <Plus size={16} /> Add Tax
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0">Tax Name</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">%</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Channels</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {list.map(tax => (
                            <tr key={tax.id}>
                                <td className="px-4 py-4 pl-0">
                                    <input value={tax.name} onChange={e => updateTax(tax.id, 'name', e.target.value)} readOnly={!canEdit} className="bg-transparent border-none outline-none font-bold text-sm text-slate-900 w-full focus:bg-slate-50 p-1 rounded-lg" />
                                </td>
                                <td className="px-4 py-4">
                                    <input type="number" value={tax.percentage} onChange={e => updateTax(tax.id, 'percentage', parseFloat(e.target.value))} readOnly={!canEdit} className="bg-transparent border-none outline-none font-bold text-sm text-slate-900 w-16 focus:bg-slate-50 p-1 rounded-lg" />
                                </td>
                                <td className="px-4 py-4">
                                    <select value={tax.type} onChange={e => updateTax(tax.id, 'type', e.target.value)} disabled={!canEdit} className="bg-transparent border-none outline-none font-bold text-xs text-slate-500 uppercase tracking-wide">
                                        <option value="Inclusive">Inclusive</option>
                                        <option value="Exclusive">Exclusive</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex gap-1">
                                        {(['POS', 'Online', 'Kiosk'] as const).map(ch => (
                                            <button
                                                key={ch}
                                                onClick={() => {
                                                    const channels = tax.applicableChannels.includes(ch)
                                                        ? tax.applicableChannels.filter(c => c !== ch)
                                                        : [...tax.applicableChannels, ch];
                                                    updateTax(tax.id, 'applicableChannels', channels);
                                                }}
                                                disabled={!canEdit}
                                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border transition-all ${tax.applicableChannels.includes(ch)
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-400 border-slate-200'
                                                    }`}
                                            >
                                                {ch}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <button
                                        onClick={() => updateTax(tax.id, 'status', tax.status === 'Active' ? 'Inactive' : 'Active')}
                                        disabled={!canEdit}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${tax.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-slate-100 text-slate-400 border-slate-200'
                                            }`}
                                    >
                                        {tax.status}
                                    </button>
                                </td>
                                <td className="px-4 py-4 pr-0 text-right">
                                    {canEdit && (
                                        <button onClick={() => removeTax(tax.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {canEdit && (
                <div className="mt-8 flex justify-end">
                    <button onClick={() => onSave(list)} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Tax Config
                    </button>
                </div>
            )}
        </div>
    );
};

const SmtpSection = ({ data, canEdit, onSave, isSaving }: { data: SmtpSettings, canEdit: boolean, onSave: (d: SmtpSettings) => void, isSaving: boolean }) => {
    const [form, setForm] = useState(data);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);

    const testEmail = async () => {
        setTesting(true);
        try {
            const res = await businessOperationsService.sendTestEmail(form.senderEmail);
            setTestResult(res.message);
        } catch (err: any) {
            setTestResult('Error: ' + err.message);
        } finally {
            setTesting(false);
            setTimeout(() => setTestResult(null), 5000);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <SectionHeader title="Email (SMTP) Settings" icon={Mail} colorClass="text-purple-600" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="SMTP Host" value={form.host} onChange={(v: string) => setForm({ ...form, host: v })} readOnly={!canEdit} />
                <InputField label="Port" type="number" value={form.port.toString()} onChange={(v: string) => setForm({ ...form, port: parseInt(v) || 0 })} readOnly={!canEdit} />
                <SelectField label="Encryption" value={form.encryption} options={['None', 'SSL', 'TLS']} onChange={(v: string) => setForm({ ...form, encryption: v as any })} disabled={!canEdit} />
                <InputField label="Username" value={form.username} onChange={(v: string) => setForm({ ...form, username: v })} readOnly={!canEdit} />
                <InputField label="Password" type="password" value={form.password} onChange={(v: string) => setForm({ ...form, password: v })} readOnly={!canEdit} />
                <div className="md:col-span-1" />
                <InputField label="Sender Name" value={form.senderName} onChange={(v: string) => setForm({ ...form, senderName: v })} readOnly={!canEdit} />
                <InputField label="Sender Email" value={form.senderEmail} onChange={(v: string) => setForm({ ...form, senderEmail: v })} readOnly={!canEdit} />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={testEmail}
                        disabled={testing || !canEdit}
                        className="px-6 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 hover:bg-white transition-all disabled:opacity-50"
                    >
                        {testing ? 'Sending...' : 'Send Test Email'}
                    </button>
                    {testResult && (
                        <span className={`text-xs font-bold ${testResult.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {testResult}
                        </span>
                    )}
                </div>
                {canEdit && (
                    <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save SMTP
                    </button>
                )}
            </div>
        </div>
    );
};

const SmsSection = ({ data, canEdit, onSave, isSaving }: { data: SmsSettings, canEdit: boolean, onSave: (d: SmsSettings) => void, isSaving: boolean }) => {
    const [form, setForm] = useState(data);
    const [testing, setTesting] = useState(false);

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <SectionHeader title="SMS Settings" icon={MessageSquare} colorClass="text-emerald-600" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SelectField label="Provider" value={form.provider} options={['Twilio']} onChange={(v: string) => setForm({ ...form, provider: v as any })} disabled={!canEdit} />
                <InputField label="Account SID" value={form.accountSid} onChange={(v: string) => setForm({ ...form, accountSid: v })} readOnly={!canEdit} />
                <InputField label="Auth Token" type="password" value={form.authToken} onChange={(v: string) => setForm({ ...form, authToken: v })} readOnly={!canEdit} />
                <InputField label="Sender Number" value={form.senderNumber} onChange={(v: string) => setForm({ ...form, senderNumber: v })} readOnly={!canEdit} />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <button
                    onClick={() => { setTesting(true); setTimeout(() => { setTesting(false); alert('Test SMS Sent!'); }, 1000); }}
                    disabled={testing || !canEdit}
                    className="px-6 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 hover:bg-white transition-all"
                >
                    {testing ? 'Sending...' : 'Test SMS'}
                </button>
                {canEdit && (
                    <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save SMS
                    </button>
                )}
            </div>
        </div>
    );
};

const LoyaltySection = ({ data, canEdit, onSave, isSaving }: { data: LoyaltySettings, canEdit: boolean, onSave: (d: LoyaltySettings) => void, isSaving: boolean }) => {
    const [form, setForm] = useState(data);
    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
                <SectionHeader title="Rewards & Loyalty" icon={Gift} colorClass="text-rose-600" />
                <ToggleField label="" checked={form.isEnabled} onChange={(v: boolean) => setForm({ ...form, isEnabled: v })} disabled={!canEdit} />
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${form.isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <InputField label="Earning Rules" value={form.earningRules} onChange={(v: string) => setForm({ ...form, earningRules: v })} readOnly={!canEdit} placeholder="e.g. 1 point per $1 unit" />
                <InputField label="Redemption Rules" value={form.redemptionRules} onChange={(v: string) => setForm({ ...form, redemptionRules: v })} readOnly={!canEdit} placeholder="e.g. 100 points = $5" />
                <InputField label="Expiry Period (Months)" type="number" value={form.expiryPeriodMonths.toString()} onChange={(v: string) => setForm({ ...form, expiryPeriodMonths: parseInt(v) || 0 })} readOnly={!canEdit} />
            </div>

            {canEdit && (
                <div className="mt-8 flex justify-end">
                    <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Loyalty
                    </button>
                </div>
            )}
        </div>
    );
};

const ModuleSection = ({ data, canEdit, onSave, isSaving }: { data: ModuleSettings, canEdit: boolean, onSave: (d: ModuleSettings) => void, isSaving: boolean }) => {
    const [form, setForm] = useState(data);
    const modulesArr = Object.entries(form) as [keyof ModuleSettings, boolean][];

    const moduleLabels: Record<keyof ModuleSettings, string> = {
        pos: 'Point of Sale (POS)',
        onlineOrdering: 'Online Ordering',
        kiosk: 'Self-Serve Kiosk',
        inventory: 'Inventory & Stock',
        pricing: 'Dynamic Pricing',
        kitchen: 'Kitchen Display (KDS)',
        delivery: 'Delivery Management',
        marketing: 'Marketing Tools',
        aiPhoneOrdering: 'AI Phone Ordering',
        analytics: 'Advanced Analytics'
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <SectionHeader title="Module Management" icon={LayoutGrid} colorClass="text-emerald-700" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {modulesArr.map(([key, enabled]) => (
                    <div key={key} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${enabled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                        <span className="text-xs font-bold text-slate-800 truncate mr-2">{moduleLabels[key]}</span>
                        <button
                            onClick={() => setForm({ ...form, [key]: !enabled })}
                            disabled={!canEdit}
                            className={`w-10 h-5 rounded-full relative transition-all ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${enabled ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                ))}
            </div>
            {canEdit && (
                <div className="mt-8 flex justify-end">
                    <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Modules
                    </button>
                </div>
            )}
        </div>
    );
};

const LocationsSection = ({ locations, canEdit, onSave, isSaving }: { locations: BusinessLocation[], canEdit: boolean, onSave: (d: BusinessLocation[]) => void, isSaving: boolean }) => {
    const [list, setList] = useState(locations);
    const [expandedLoc, setExpandedLoc] = useState<string | null>(list[0]?.id || null);

    useEffect(() => {
        setList(locations);
        if (locations.length > 0 && !expandedLoc) {
            setExpandedLoc(locations[0]?.id || null);
        }
    }, [locations]);

    const updateLoc = (id: string, field: keyof BusinessLocation, value: any) => {
        setList(list.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const updateTiming = (locId: string, channel: keyof BusinessLocation['timings'], day: string, field: string, value: any) => {
        setList(list.map(l => {
            if (l.id !== locId) return l;
            const updatedChannel = l.timings[channel].map(t =>
                t.day === day ? { ...t, [field]: value } : t
            );
            return { ...l, timings: { ...l.timings, [channel]: updatedChannel } };
        }));
    };

    const addNewLocation = () => {
        const newLoc: BusinessLocation = {
            id: `loc_${Date.now()}`,
            name: 'New Location',
            address: '123 Main St, City',
            status: 'Active',
            timezone: 'America/New_York',
            timings: {
                pos: Array(7).fill(null).map((_, i) => ({
                    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                    openTime: '09:00',
                    closeTime: '22:00',
                    isOpen: true
                })),
                online: Array(7).fill(null).map((_, i) => ({
                    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                    openTime: '10:00',
                    closeTime: '21:00',
                    isOpen: true
                })),
                kiosk: Array(7).fill(null).map((_, i) => ({
                    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                    openTime: '09:00',
                    closeTime: '22:00',
                    isOpen: true
                }))
            }
        };
        setList([...list, newLoc]);
        setExpandedLoc(newLoc.id);
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <SectionHeader title="Locations (Operational Configuration)" icon={MapPin} colorClass="text-rose-700" />
                {canEdit && (
                    <button
                        onClick={addNewLocation}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Add New Location
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {list.map(loc => (
                    <div key={loc.id} className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                        <div
                            onClick={() => setExpandedLoc(expandedLoc === loc.id ? null : loc.id)}
                            className="p-6 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${loc.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{loc.name}</h3>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">{loc.address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right mr-4 hidden md:block">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Timezone</span>
                                    <span className="text-xs font-bold text-slate-800">{loc.timezone}</span>
                                </div>
                                <ChevronDown className={`text-slate-400 transition-transform ${expandedLoc === loc.id ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {expandedLoc === loc.id && (
                            <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="Location Name" value={loc.name} onChange={(v: string) => updateLoc(loc.id, 'name', v)} readOnly={!canEdit} />
                                    <SelectField label="Status" value={loc.status} options={['Active', 'Inactive']} onChange={(v: string) => updateLoc(loc.id, 'status', v as any)} disabled={!canEdit} />
                                    <SelectField label="Timezone Override" value={loc.timezone} options={['System Default', 'America/Los_Angeles', 'America/New_York']} onChange={(v: string) => updateLoc(loc.id, 'timezone', v)} disabled={!canEdit} />
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-2 border-b border-slate-100">Store Timings & Channel Availability</h4>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <ChannelTimings
                                            label="POS Channel"
                                            timings={loc.timings.pos}
                                            canEdit={canEdit}
                                            onChange={(day, field, val) => updateTiming(loc.id, 'pos', day, field, val)}
                                        />
                                        <ChannelTimings
                                            label="Online Ordering"
                                            timings={loc.timings.online}
                                            canEdit={canEdit}
                                            onChange={(day, field, val) => updateTiming(loc.id, 'online', day, field, val)}
                                        />
                                        <ChannelTimings
                                            label="Self-Serve Kiosk"
                                            timings={loc.timings.kiosk}
                                            canEdit={canEdit}
                                            onChange={(day, field, val) => updateTiming(loc.id, 'kiosk', day, field, val)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {canEdit && (
                <div className="mt-8 flex justify-end">
                    <button onClick={() => onSave(list)} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Operational Configuration
                    </button>
                </div>
            )}
        </div>
    );
};

const ChannelTimings = ({ label, timings, canEdit, onChange }: { label: string, timings: any[], canEdit: boolean, onChange: (day: string, field: string, val: any) => void }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{label}</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
        </div>
        <div className="space-y-2">
            {timings.map(t => (
                <div key={t.day} className="flex items-center justify-between group">
                    <span className="text-[11px] font-bold text-slate-500 w-16">{t.day}</span>
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="time"
                            disabled={!t.isOpen || !canEdit}
                            value={t.openTime}
                            onChange={(e) => onChange(t.day, 'openTime', e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-600 focus:border-emerald-500 outline-none disabled:opacity-30 disabled:border-transparent transition-all"
                        />
                        <span className="text-slate-300">-</span>
                        <input
                            type="time"
                            disabled={!t.isOpen || !canEdit}
                            value={t.closeTime}
                            onChange={(e) => onChange(t.day, 'closeTime', e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-600 focus:border-emerald-500 outline-none disabled:opacity-30 disabled:border-transparent transition-all"
                        />
                    </div>
                    <button
                        onClick={() => onChange(t.day, 'isOpen', !t.isOpen)}
                        disabled={!canEdit}
                        className={`w-12 h-6 flex items-center justify-center rounded-lg border transition-all ${t.isOpen ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'
                            }`}
                    >
                        <Power size={12} strokeWidth={3} />
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const InputField = ({ label, value, onChange, type = "text", required = false, readOnly = false, placeholder = "" }: any) => (
    <div className="space-y-1.5">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all ${readOnly ? 'cursor-default focus:border-slate-200' : ''}`}
        />
    </div>
);

const SelectField = ({ label, value, options, onChange, disabled = false }: any) => (
    <div className="space-y-1.5">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all ${disabled ? 'cursor-default opacity-60' : ''}`}
            >
                {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

const ToggleField = ({ label, checked, onChange, disabled = false }: any) => (
    <div className="flex items-center justify-between">
        {label && <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>}
        <button
            onClick={() => onChange(!checked)}
            disabled={disabled}
            className={`w-12 h-6 rounded-full relative transition-all ${checked ? 'bg-slate-900' : 'bg-slate-200'}`}
        >
            <div className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all ${checked ? 'left-7' : 'left-2'}`} />
        </button>
    </div>
);
