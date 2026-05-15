'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Mail,
    Phone,
    Image as ImageIcon,
    Upload,
    Check,
    ChevronRight,
    ShieldCheck,
    UserCircle,
    Key,
    UserPlus,
    AlertCircle,
    LayoutGrid,
    CheckCircle2,
    Calendar,
    Settings2,
    Store,
    Globe,
    Coins,
    Trash2,
    Copy,
    Plus,
    Receipt,
    StickyNote,
    Loader2,
    Rocket,
    FileText,
    Send,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function FormSectionTitle({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="flex items-center gap-3 border-l-4 border-slate-900 pl-4 mb-6">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <Icon className="w-4 h-4 text-slate-900" />
            </div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h4>
        </div>
    );
}

function InputWrapper({ label, required, children }: { label: string, required?: boolean, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function ReviewField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold text-slate-900 leading-relaxed">{value || <span className="text-slate-300 italic">— Not provided</span>}</p>
        </div>
    );
}

const ORCHESTRATION_STEPS = [
    'Create brand',
    'Create default tax profile',
    'Create default payment terms',
    'Create brand default roles',
    'Create brand super admin',
    'Create stores',
    'Create module entitlements',
    'Create module states',
    'Save logos',
    'Create audit logs',
    'Send invite',
];

// ─── Components ─────────────────────────────────────────────────────────────────

export default function BrandOnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Identity
        brandLegalName: '',
        brandName: '',
        tradeName: '',
        // Step 1: Address
        addressLine1: '',
        addressLine2: '',
        city: '',
        province: 'Ontario',
        postalCode: '',
        country: 'Canada',
        // Step 1: Business Settings
        timezone: 'Eastern Standard Time (EST)',
        currency: 'CAD ($)',
        contactEmail: '',
        contactPhone: '',
        // Step 1: Branding
        lightLogo: null as string | null,
        darkLogo: null as string | null,
        // Step 1: Payment Terms
        paymentTermType: 'NET_DAYS',
        netDays: 30,

        // Step 2: Brand Super Admin
        adminName: '',
        adminEmail: '',
        adminPhone: '',
        inviteMethod: 'MAGIC_LINK' as 'MAGIC_LINK' | 'TEMP_PASSWORD',

        // Step 3: Stores
        stores: [] as {
            id: string;
            storeName: string;
            shortCode: string;
            addressLine1: string;
            addressLine2: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
            phone: string;
            email: string;
            storeLogo: string | null;
            paymentTermType: 'INHERIT_BRAND' | 'PREPAID' | 'NET_DAYS' | 'DUE_ON_RECEIPT';
            netDays: number;
            taxSetup: 'INHERIT_BRAND' | 'OVERRIDE';
            taxProvince: string;
            taxManualRate: string;
        }[],

        // Step 4: Modules
        modules: [
            { id: 'pos', name: 'Point of Sale', purchased: true, enabled: true, isCore: true, startDate: new Date().toISOString().split('T')[0], notes: 'Core system module — always active.' },
            { id: 'inventory', name: 'Inventory Control', purchased: false, enabled: false, startDate: '', notes: '' },
            { id: 'kiosk', name: 'Self-Service Kiosk', purchased: false, enabled: false, startDate: '', notes: '' },
            { id: 'loyalty', name: 'Loyalty & Rewards', purchased: false, enabled: false, startDate: '', notes: '' },
            { id: 'analytics', name: 'Advanced Analytics', purchased: false, enabled: false, startDate: '', notes: '' },
            { id: 'web-shop', name: 'Web Shop / Online Ordering', purchased: false, enabled: false, startDate: '', notes: '' },
        ] as any[],
    });

    const steps = [
        { id: 1, title: 'Brand Details', description: 'Core identity & localization' },
        { id: 2, title: 'Brand Admin', description: 'Super admin provisioning' },
        { id: 3, title: 'Stores', description: 'Optional store setup' },
        { id: 4, title: 'Modules', description: 'Entitlements & licensing' },
        { id: 5, title: 'Review', description: 'Final verification' },
    ];

    const TOTAL_STEPS = steps.length;
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        setSubmitProgress(0);

        // Simulate transactional orchestration — each step takes ~400-800ms
        for (let i = 0; i < ORCHESTRATION_STEPS.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
            setSubmitProgress(i + 1);
        }

        // Final delay before success
        await new Promise(resolve => setTimeout(resolve, 600));
        setSubmitting(false);
        setSubmitted(true);
    }, []);

    const addStore = () => {
        setFormData(prev => ({
            ...prev,
            stores: [
                ...prev.stores,
                {
                    id: `store-${Date.now()}`,
                    storeName: '',
                    shortCode: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    province: 'Ontario',
                    postalCode: '',
                    country: 'Canada',
                    phone: '',
                    email: '',
                    storeLogo: null,
                    paymentTermType: 'INHERIT_BRAND',
                    netDays: 30,
                    taxSetup: 'INHERIT_BRAND',
                    taxProvince: 'Ontario',
                    taxManualRate: '',
                },
            ],
        }));
    };

    const removeStore = (storeId: string) => {
        setFormData(prev => ({
            ...prev,
            stores: prev.stores.filter(s => s.id !== storeId),
        }));
    };

    const updateStore = (storeId: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            stores: prev.stores.map(s =>
                s.id === storeId ? { ...s, [field]: value } : s
            ),
        }));
    };

    const duplicateStore = (storeId: string) => {
        setFormData(prev => {
            const source = prev.stores.find(s => s.id === storeId);
            if (!source) return prev;
            return {
                ...prev,
                stores: [
                    ...prev.stores,
                    {
                        ...source,
                        id: `store-${Date.now()}`,
                        storeName: `${source.storeName} (Copy)`,
                        shortCode: '',
                    },
                ],
            };
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                {/* Top Row: Back + Title */}
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/platform/brands')}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                        <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight">Brand Onboarding</h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Configuration Wizard</p>
                    </div>
                </div>

                {/* Bottom Row: Step Progress */}
                <div className="max-w-3xl mx-auto px-6 pb-4 pt-1">
                    <div className="flex items-center">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                {/* Step Indicator */}
                                <div className="flex flex-col items-center gap-1.5 relative">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all shrink-0 ${currentStep > step.id
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : currentStep === step.id
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200'
                                            : 'bg-white border-slate-200 text-slate-400'
                                        }`}>
                                        {currentStep > step.id ? <Check className="w-3.5 h-3.5" /> : step.id}
                                    </div>
                                    <div className="text-center whitespace-nowrap">
                                        <p className={`text-[9px] font-black uppercase tracking-wide leading-none transition-colors ${currentStep === step.id ? 'text-slate-900' : currentStep > step.id ? 'text-emerald-600' : 'text-slate-400'
                                            }`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors mt-[-18px] ${currentStep > step.id ? 'bg-emerald-400' : 'bg-slate-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="max-w-3xl mx-auto">
                    {currentStep === 1 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Identity Section */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <FormSectionTitle icon={Building2} title="Market Identity" />
                                <div className="grid grid-cols-1 gap-6">
                                    <InputWrapper label="Brand Legal Name">
                                        <input
                                            type="text"
                                            value={formData.brandLegalName}
                                            onChange={e => setFormData({ ...formData, brandLegalName: e.target.value })}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-bold placeholder:text-slate-300"
                                            placeholder="e.g. Zyappy QSR Global Ltd."
                                        />
                                    </InputWrapper>
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputWrapper label="Brand Display Name" required>
                                            <input
                                                required
                                                type="text"
                                                value={formData.brandName}
                                                onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-bold placeholder:text-slate-300"
                                                placeholder="e.g. Zyappy"
                                            />
                                        </InputWrapper>
                                        <InputWrapper label="Trade Name">
                                            <input
                                                type="text"
                                                value={formData.tradeName}
                                                onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-bold placeholder:text-slate-300"
                                                placeholder="e.g. Zyappy Pizza"
                                            />
                                        </InputWrapper>
                                    </div>
                                </div>
                            </section>

                            {/* Address Section */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <FormSectionTitle icon={MapPin} title="Global Headquarters" />
                                <div className="space-y-6">
                                    <InputWrapper label="Address Line 1" required>
                                        <input
                                            required
                                            value={formData.addressLine1}
                                            onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                                            placeholder="Street address or P.O. box"
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Address Line 2 (Optional)">
                                        <input
                                            value={formData.addressLine2}
                                            onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                                            placeholder="Apartment, suite, unit, building, floor, etc."
                                        />
                                    </InputWrapper>
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputWrapper label="City" required>
                                            <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" />
                                        </InputWrapper>
                                        <InputWrapper label="Province / State" required>
                                            <select value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem_1.25rem]">
                                                <option>Ontario</option>
                                                <option>British Columbia</option>
                                                <option>Quebec</option>
                                                <option>Alberta</option>
                                            </select>
                                        </InputWrapper>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputWrapper label="Postal / Zip Code" required>
                                            <input required value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-mono uppercase" />
                                        </InputWrapper>
                                        <InputWrapper label="Country" required>
                                            <input disabled value={formData.country} className="w-full px-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm opacity-60 cursor-not-allowed" />
                                        </InputWrapper>
                                    </div>
                                </div>
                            </section>

                            {/* Business Settings Section */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <FormSectionTitle icon={Globe} title="Operational Config" />
                                <div className="grid grid-cols-2 gap-6">
                                    <InputWrapper label="System Timezone" required>
                                        <select value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem_1.25rem]">
                                            <option>Eastern Standard Time (EST)</option>
                                            <option>Pacific Standard Time (PST)</option>
                                        </select>
                                    </InputWrapper>
                                    <InputWrapper label="Base Currency" required>
                                        <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem_1.25rem]">
                                            <option>CAD ($)</option>
                                            <option>USD ($)</option>
                                        </select>
                                    </InputWrapper>
                                    <InputWrapper label="Primary Contact Email">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium" placeholder="admin@brand.com" />
                                        </div>
                                    </InputWrapper>
                                    <InputWrapper label="Primary Contact Phone">
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="tel" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-mono" placeholder="+1 (000) 000-0000" />
                                        </div>
                                    </InputWrapper>
                                </div>
                            </section>

                            {/* Branding Section */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <FormSectionTitle icon={ImageIcon} title="Identity Assets" />
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo (Light Mode)</p>
                                        <div className="aspect-[3/1] rounded-2x border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center group hover:border-slate-900 hover:bg-slate-50 cursor-pointer transition-all">
                                            <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-slate-900 transition-colors" />
                                            <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">Upload PNG/SVG</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo (Dark Mode – Optional)</p>
                                        <div className="aspect-[3/1] rounded-2x border-2 border-dashed border-slate-800 bg-slate-900 flex flex-col items-center justify-center group hover:border-slate-700 cursor-pointer transition-all">
                                            <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-white transition-colors" />
                                            <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Upload PNG/SVG</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Payment Terms Section */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <FormSectionTitle icon={Coins} title="Default Payment Terms" />
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'PREPAID', label: 'Prepaid' },
                                            { id: 'NET_DAYS', label: 'Net Days' },
                                            { id: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setFormData({ ...formData, paymentTermType: opt.id })}
                                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${formData.paymentTermType === opt.id
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                <span className="text-[11px] font-black uppercase tracking-widest">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {formData.paymentTermType === 'NET_DAYS' && (
                                        <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl animate-in slide-in-from-top-2 duration-300">
                                            <InputWrapper label="Net Days (Maturity Period)">
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="number"
                                                        value={formData.netDays}
                                                        onChange={e => setFormData({ ...formData, netDays: parseInt(e.target.value) || 0 })}
                                                        className="w-32 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                                        min="1"
                                                    />
                                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Days after invoice emission</span>
                                                </div>
                                            </InputWrapper>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Action Footer */}
                            <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-200">
                                <button
                                    onClick={() => router.push('/platform/brands')}
                                    className="px-8 py-4 bg-white text-slate-600 rounded-2xl text-sm font-black border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                >
                                    Cancel & Return
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 flex items-center gap-2 group"
                                >
                                    Setup Brand Admin
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Admin Identity Section */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <FormSectionTitle icon={UserCircle} title="Super Admin Identity" />
                                <div className="grid grid-cols-1 gap-6">
                                    <InputWrapper label="Full Legal Name" required>
                                        <div className="relative">
                                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                required
                                                type="text"
                                                value={formData.adminName}
                                                onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-bold placeholder:text-slate-300"
                                                placeholder="e.g. Alexander Pierce"
                                            />
                                        </div>
                                    </InputWrapper>
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputWrapper label="Email Address" required>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.adminEmail}
                                                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-bold"
                                                    placeholder="admin@brand.com"
                                                />
                                            </div>
                                        </InputWrapper>
                                        <InputWrapper label="Direct Phone">
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    value={formData.adminPhone}
                                                    onChange={e => setFormData({ ...formData, adminPhone: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-mono"
                                                    placeholder="+1 (000) 000-0000"
                                                />
                                            </div>
                                        </InputWrapper>
                                    </div>
                                </div>
                            </section>

                            {/* System Role Auto-Assignment (Informational) */}
                            <section className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 text-white space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">System Auto-Assignments</h4>
                                        <p className="text-sm font-bold text-white">Permissions for this profile will be locked to enterprise maximum.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'User Type', value: 'Admin User' },
                                        { label: 'System Role', value: 'Brand Admin' },
                                        { label: 'Store Scope', value: 'All Locations' },
                                    ].map((attr) => (
                                        <div key={attr.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{attr.label}</p>
                                            <p className="text-xs font-black text-white">{attr.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Invite Method Section */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <FormSectionTitle icon={Key} title="Invitation Strategy" />
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        {
                                            id: 'MAGIC_LINK',
                                            label: 'Magic Invite Link',
                                            desc: 'Secure email verification link. No initial password required.',
                                            icon: Mail
                                        },
                                        {
                                            id: 'TEMP_PASSWORD',
                                            label: 'Temporary Password',
                                            desc: 'User must change password upon first login attempt.',
                                            icon: Key
                                        },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFormData({ ...formData, inviteMethod: opt.id as any })}
                                            className={`flex flex-col gap-4 p-8 rounded-3xl border text-left transition-all ${formData.inviteMethod === opt.id
                                                ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-lg'
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.inviteMethod === opt.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <opt.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-slate-900 block mb-1">{opt.label}</span>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{opt.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-black text-blue-900 uppercase tracking-tight">Security Hardening</h5>
                                        <p className="text-xs text-blue-700/80 font-medium leading-relaxed">
                                            The invitation token will be cryptographically hashed. The link/password will remain valid for <span className="font-black">48 hours</span> and is strictly <span className="font-black">single-use only</span>.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Action Footer */}
                            <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-200">
                                <button
                                    onClick={prevStep}
                                    className="px-8 py-4 bg-white text-slate-600 rounded-2xl text-sm font-black border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                >
                                    Back to Brand Details
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 flex items-center gap-2 group"
                                >
                                    Add Stores
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        STEP 3 — ADD STORES (OPTIONAL)
                    ═══════════════════════════════════════════════════════════════ */}
                    {currentStep === 3 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Header + Add Button */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <FormSectionTitle icon={Store} title="Store Locations" />
                                    <button
                                        onClick={addStore}
                                        className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Store
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-2">
                                    You can add stores now, or skip this step and add them later from the brand dashboard.
                                </p>

                                {formData.stores.length === 0 && (
                                    <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                                            <Store className="w-7 h-7 text-slate-300" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-600 mb-1">No stores added yet</h4>
                                        <p className="text-xs text-slate-400 font-medium max-w-xs">
                                            Click &quot;Add Store&quot; above to register your first location, or skip this step entirely.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Store Cards */}
                            {formData.stores.map((store, storeIndex) => (
                                <section
                                    key={store.id}
                                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
                                >
                                    {/* Store Card Header */}
                                    <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                                <Store className="w-5 h-5 text-slate-900" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">
                                                    {store.storeName || `Store ${storeIndex + 1}`}
                                                </h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {store.shortCode ? `Code: ${store.shortCode}` : `ID: ${store.id}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => duplicateStore(store.id)}
                                                title="Duplicate Store"
                                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeStore(store.id)}
                                                title="Remove Store"
                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-10">
                                        {/* Store Identity */}
                                        <div className="space-y-6">
                                            <FormSectionTitle icon={Building2} title="Store Identity" />
                                            <div className="grid grid-cols-2 gap-6">
                                                <InputWrapper label="Store Name" required>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={store.storeName}
                                                        onChange={e => updateStore(store.id, 'storeName', e.target.value)}
                                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-bold placeholder:text-slate-300"
                                                        placeholder="e.g. Downtown Main St."
                                                    />
                                                </InputWrapper>
                                                <InputWrapper label="Short Code (Optional)">
                                                    <input
                                                        type="text"
                                                        value={store.shortCode}
                                                        onChange={e => updateStore(store.id, 'shortCode', e.target.value.toUpperCase())}
                                                        maxLength={8}
                                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-mono uppercase placeholder:text-slate-300"
                                                        placeholder="e.g. DT-MAIN"
                                                    />
                                                </InputWrapper>
                                            </div>
                                        </div>

                                        {/* Store Address */}
                                        <div className="space-y-6">
                                            <FormSectionTitle icon={MapPin} title="Store Address" />
                                            <div className="space-y-6">
                                                <InputWrapper label="Address Line 1" required>
                                                    <input
                                                        required
                                                        value={store.addressLine1}
                                                        onChange={e => updateStore(store.id, 'addressLine1', e.target.value)}
                                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                                                        placeholder="Street address"
                                                    />
                                                </InputWrapper>
                                                <InputWrapper label="Address Line 2">
                                                    <input
                                                        value={store.addressLine2}
                                                        onChange={e => updateStore(store.id, 'addressLine2', e.target.value)}
                                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                                                        placeholder="Suite, unit, floor, etc."
                                                    />
                                                </InputWrapper>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <InputWrapper label="City" required>
                                                        <input required value={store.city} onChange={e => updateStore(store.id, 'city', e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" />
                                                    </InputWrapper>
                                                    <InputWrapper label="Province / State" required>
                                                        <select value={store.province} onChange={e => updateStore(store.id, 'province', e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem_1.25rem]">
                                                            <option>Ontario</option>
                                                            <option>British Columbia</option>
                                                            <option>Quebec</option>
                                                            <option>Alberta</option>
                                                            <option>Manitoba</option>
                                                            <option>Saskatchewan</option>
                                                            <option>Nova Scotia</option>
                                                            <option>New Brunswick</option>
                                                        </select>
                                                    </InputWrapper>
                                                </div>
                                                <div className="grid grid-cols-3 gap-6">
                                                    <InputWrapper label="Postal / Zip Code" required>
                                                        <input required value={store.postalCode} onChange={e => updateStore(store.id, 'postalCode', e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-mono uppercase" />
                                                    </InputWrapper>
                                                    <InputWrapper label="Country" required>
                                                        <input disabled value={store.country} className="w-full px-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm opacity-60 cursor-not-allowed" />
                                                    </InputWrapper>
                                                    <InputWrapper label="Phone">
                                                        <div className="relative">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <input type="tel" value={store.phone} onChange={e => updateStore(store.id, 'phone', e.target.value)} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-mono" placeholder="+1 (000) 000-0000" />
                                                        </div>
                                                    </InputWrapper>
                                                </div>
                                                <InputWrapper label="Email">
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input type="email" value={store.email} onChange={e => updateStore(store.id, 'email', e.target.value)} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium" placeholder="store@brand.com" />
                                                    </div>
                                                </InputWrapper>
                                            </div>
                                        </div>

                                        {/* Store Branding */}
                                        <div className="space-y-6">
                                            <FormSectionTitle icon={ImageIcon} title="Store Branding" />
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Store Logo (Optional)</p>
                                                <div className="aspect-[4/1] max-w-xs rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center group hover:border-slate-900 hover:bg-slate-50 cursor-pointer transition-all">
                                                    <Upload className="w-5 h-5 text-slate-400 mb-1.5 group-hover:text-slate-900 transition-colors" />
                                                    <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">Upload PNG/SVG</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Store Payment Terms */}
                                        <div className="space-y-6">
                                            <FormSectionTitle icon={Coins} title="Payment Terms" />
                                            <div className="grid grid-cols-4 gap-3">
                                                {([
                                                    { id: 'INHERIT_BRAND', label: 'Inherit Brand', desc: 'Use brand default' },
                                                    { id: 'PREPAID', label: 'Prepaid', desc: 'Pay in advance' },
                                                    { id: 'NET_DAYS', label: 'Net Days', desc: 'Invoice period' },
                                                    { id: 'DUE_ON_RECEIPT', label: 'Due on Receipt', desc: 'Immediate' },
                                                ] as const).map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => updateStore(store.id, 'paymentTermType', opt.id)}
                                                        className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all ${store.paymentTermType === opt.id
                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                                                        <span className={`text-[8px] font-bold uppercase tracking-wider ${store.paymentTermType === opt.id ? 'text-white/60' : 'text-slate-400'}`}>{opt.desc}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {store.paymentTermType === 'NET_DAYS' && (
                                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl animate-in slide-in-from-top-2 duration-300">
                                                    <InputWrapper label="Net Days (Maturity Period)">
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                type="number"
                                                                value={store.netDays}
                                                                onChange={e => updateStore(store.id, 'netDays', parseInt(e.target.value) || 0)}
                                                                className="w-28 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-center text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                                                min="1"
                                                            />
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Days after invoice</span>
                                                        </div>
                                                    </InputWrapper>
                                                </div>
                                            )}

                                            {store.paymentTermType === 'INHERIT_BRAND' && (
                                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                                                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                                                        This store will use the brand-level payment terms: <span className="font-black">{formData.paymentTermType === 'NET_DAYS' ? `Net ${formData.netDays} Days` : formData.paymentTermType.replace('_', ' ')}</span>.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tax Setup */}
                                        <div className="space-y-6">
                                            <FormSectionTitle icon={Receipt} title="Tax Setup" />
                                            <div className="grid grid-cols-2 gap-4">
                                                {([
                                                    { id: 'INHERIT_BRAND', label: 'Inherit Brand', desc: 'Use brand-level tax config' },
                                                    { id: 'OVERRIDE', label: 'Override', desc: 'Custom tax for this store' },
                                                ] as const).map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => updateStore(store.id, 'taxSetup', opt.id)}
                                                        className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all ${store.taxSetup === opt.id
                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                                                        <span className={`text-[8px] font-bold uppercase tracking-wider ${store.taxSetup === opt.id ? 'text-white/60' : 'text-slate-400'}`}>{opt.desc}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {store.taxSetup === 'INHERIT_BRAND' && (
                                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                                                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                                                        This store will inherit the brand-level tax configuration.
                                                    </p>
                                                </div>
                                            )}

                                            {store.taxSetup === 'OVERRIDE' && (
                                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                    <InputWrapper label="Province-based Tax Scheme" required>
                                                        <select
                                                            value={store.taxProvince}
                                                            onChange={e => updateStore(store.id, 'taxProvince', e.target.value)}
                                                            className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem_1.25rem] focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                                                        >
                                                            <option value="Ontario">Ontario — HST 13%</option>
                                                            <option value="British Columbia">British Columbia — GST 5% + PST 7%</option>
                                                            <option value="Quebec">Quebec — GST 5% + QST 9.975%</option>
                                                            <option value="Alberta">Alberta — GST 5%</option>
                                                            <option value="Manitoba">Manitoba — GST 5% + PST 7%</option>
                                                            <option value="Saskatchewan">Saskatchewan — GST 5% + PST 6%</option>
                                                            <option value="Nova Scotia">Nova Scotia — HST 15%</option>
                                                            <option value="New Brunswick">New Brunswick — HST 15%</option>
                                                        </select>
                                                    </InputWrapper>

                                                    <InputWrapper label="Manual Tax Rate Override (Optional)">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={store.taxManualRate}
                                                                    onChange={e => updateStore(store.id, 'taxManualRate', e.target.value)}
                                                                    className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-center text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all pr-10"
                                                                    placeholder="—"
                                                                />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">%</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Overrides province scheme if specified</span>
                                                        </div>
                                                    </InputWrapper>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            ))}

                            {/* Action Footer */}
                            <div className="pt-8 flex items-center justify-between border-t border-slate-200">
                                <span className="text-xs font-bold text-slate-400">
                                    {formData.stores.length} store{formData.stores.length !== 1 ? 's' : ''} configured
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={prevStep}
                                        className="px-8 py-4 bg-white text-slate-600 rounded-2xl text-sm font-black border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                    >
                                        Back to Admin Setup
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 flex items-center gap-2 group"
                                    >
                                        {formData.stores.length === 0 ? 'Skip to Modules' : 'Review Modules'}
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        STEP 4 — MODULES
                    ═══════════════════════════════════════════════════════════════ */}
                    {currentStep === 4 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Modules Strategy Section */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <FormSectionTitle icon={LayoutGrid} title="Module Entitlements" />
                                <div className="grid grid-cols-1 gap-4">
                                    {formData.modules.map((mod, index) => (
                                        <div
                                            key={mod.id}
                                            className={`rounded-3xl border transition-all overflow-hidden ${mod.purchased ? 'bg-white border-slate-200 shadow-sm' : 'bg-white border-slate-100 opacity-60'
                                                }`}
                                        >
                                            {/* Module Header Row */}
                                            <div className={`px-6 py-4 flex items-center justify-between gap-4 ${mod.purchased ? 'bg-slate-50 border-b border-slate-100' : ''}`}>
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${mod.purchased ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-300'
                                                        }`}>
                                                        <LayoutGrid className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="text-sm font-black text-slate-900">{mod.name}</h5>
                                                            {mod.isCore && (
                                                                <span className="px-2 py-0.5 bg-slate-900 text-[8px] font-black text-white uppercase tracking-widest rounded-full">Core</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Module ID: {mod.id}</p>
                                                    </div>
                                                </div>

                                                {/* Purchased Toggle */}
                                                <button
                                                    disabled={mod.isCore}
                                                    onClick={() => {
                                                        const newModules = [...formData.modules];
                                                        newModules[index].purchased = !newModules[index].purchased;
                                                        if (!newModules[index].purchased) {
                                                            newModules[index].enabled = false;
                                                            newModules[index].startDate = '';
                                                        }
                                                        setFormData({ ...formData, modules: newModules });
                                                    }}
                                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${mod.purchased
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                                        : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                                        }`}
                                                >
                                                    {mod.purchased ? '✓ Purchased' : 'Not Licensed'}
                                                </button>
                                            </div>

                                            {/* Module Detail Row — only shown when purchased */}
                                            {mod.purchased && (
                                                <div className="px-6 py-5 space-y-4">
                                                    <div className="flex items-center gap-6">
                                                        {/* Enabled Toggle */}
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Operational Status</span>
                                                            <button
                                                                disabled={mod.isCore}
                                                                onClick={() => {
                                                                    const newModules = [...formData.modules];
                                                                    newModules[index].enabled = !newModules[index].enabled;
                                                                    setFormData({ ...formData, modules: newModules });
                                                                }}
                                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-fit ${mod.enabled
                                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                                    : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                                                    }`}
                                                            >
                                                                {mod.enabled ? 'Active' : 'Inactive'}
                                                            </button>
                                                        </div>

                                                        {/* Divider */}
                                                        <div className="h-10 w-px bg-slate-200" />

                                                        {/* Start Date */}
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Activation Date</span>
                                                            <div className="relative">
                                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                                <input
                                                                    type="date"
                                                                    value={mod.startDate}
                                                                    onChange={e => {
                                                                        const newModules = [...formData.modules];
                                                                        newModules[index].startDate = e.target.value;
                                                                        setFormData({ ...formData, modules: newModules });
                                                                    }}
                                                                    className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Notes */}
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1">
                                                            <StickyNote className="w-3 h-3" />
                                                            Notes
                                                        </span>
                                                        <textarea
                                                            value={mod.notes}
                                                            onChange={e => {
                                                                const newModules = [...formData.modules];
                                                                newModules[index].notes = e.target.value;
                                                                setFormData({ ...formData, modules: newModules });
                                                            }}
                                                            rows={2}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all resize-none placeholder:text-slate-300 font-medium"
                                                            placeholder="Optional notes about this module entitlement…"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Rules & Governance Section */}
                            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                                    <Settings2 className="w-6 h-6 text-slate-900" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Module Governance Rules</h4>
                                        <p className="text-xs text-slate-500 font-medium">System constraints applied during the onboarding process.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                                        {[
                                            'Core POS is forced purchased and cannot be disabled.',
                                            'Enabling a module requires a purchased entitlement.',
                                            'Each module entitlement record (module_entitlement) is saved.',
                                            'Module access is strictly scoped by brand ID.',
                                            'Start dates drive initial billing cycle and provisioning.',
                                        ].map((rule) => (
                                            <div key={rule} className="flex items-center gap-2 group">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{rule}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Action Footer */}
                            <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-200">
                                <button
                                    onClick={prevStep}
                                    className="px-8 py-4 bg-white text-slate-600 rounded-2xl text-sm font-black border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                >
                                    Back to Stores
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 flex items-center gap-2 group"
                                >
                                    Proceed to Review
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        STEP 5 — REVIEW & CONFIRM
                    ═══════════════════════════════════════════════════════════════ */}
                    {currentStep > 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* ── Submission In-Progress Overlay ── */}
                            {submitting && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-3 pt-4">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center mx-auto shadow-2xl shadow-slate-300">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Provisioning Brand</h2>
                                        <p className="text-xs text-slate-500 font-medium">Executing transactional orchestration&hellip;</p>
                                    </div>

                                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                                        {ORCHESTRATION_STEPS.map((step, idx) => {
                                            const done = idx < submitProgress;
                                            const active = idx === submitProgress;
                                            return (
                                                <div key={step} className={`flex items-center gap-3 py-2.5 px-4 rounded-2xl transition-all duration-300 ${done ? 'bg-emerald-50/60' : active ? 'bg-blue-50/60' : 'opacity-40'
                                                    }`}>
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-300'
                                                        }`}>
                                                        {done ? <Check className="w-3.5 h-3.5" /> : active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-[9px] font-black">{idx + 1}</span>}
                                                    </div>
                                                    <span className={`text-xs font-bold transition-colors ${done ? 'text-emerald-700' : active ? 'text-blue-700' : 'text-slate-400'
                                                        }`}>{step}</span>
                                                </div>
                                            );
                                        })}
                                    </section>

                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-900 rounded-full transition-all duration-500" style={{ width: `${(submitProgress / ORCHESTRATION_STEPS.length) * 100}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* ── Success State ── */}
                            {submitted && !submitting && (
                                <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center border border-emerald-100 animate-in zoom-in-50 duration-700">
                                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Brand Created Successfully</h2>
                                        <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
                                            <span className="font-black text-slate-900">{formData.brandName || formData.brandLegalName}</span> has been fully provisioned. All {ORCHESTRATION_STEPS.length} operations completed transactionally.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4">
                                        <button onClick={() => router.push('/platform/brands')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 flex items-center gap-2">
                                            <Rocket className="w-4 h-4" />
                                            Go to Brands
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Review Content (hidden during submit) ── */}
                            {!submitting && !submitted && (
                                <>
                                    {/* Header */}
                                    <div className="text-center space-y-2 pt-2">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Review &amp; Confirm</h2>
                                        <p className="text-xs text-slate-500 font-medium">Double-check every section before final submission. This operation is transactional.</p>
                                    </div>

                                    {/* 1 · Brand Details Summary */}
                                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                                    <Building2 className="w-4 h-4 text-slate-900" />
                                                </div>
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900">Brand Details</h4>
                                            </div>
                                            <button onClick={() => setCurrentStep(1)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                                                <ReviewField label="Brand Legal Name" value={formData.brandLegalName} />
                                                <ReviewField label="Display Name" value={formData.brandName} />
                                                <ReviewField label="Trade Name" value={formData.tradeName} />
                                                <ReviewField label="Address" value={[formData.addressLine1, formData.addressLine2].filter(Boolean).join(', ')} />
                                                <ReviewField label="City / Province" value={`${formData.city}, ${formData.province}`} />
                                                <ReviewField label="Postal / Country" value={`${formData.postalCode} ${formData.country}`} />
                                                <ReviewField label="Timezone" value={formData.timezone} />
                                                <ReviewField label="Currency" value={formData.currency} />
                                                <ReviewField label="Contact" value={formData.contactEmail || formData.contactPhone || '—'} />
                                                <ReviewField label="Payment Terms" value={formData.paymentTermType === 'NET_DAYS' ? `Net ${formData.netDays} Days` : formData.paymentTermType.replace(/_/g, ' ')} />
                                            </div>
                                        </div>
                                    </section>

                                    {/* 2 · Super Admin Summary */}
                                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                                    <UserCircle className="w-4 h-4 text-slate-900" />
                                                </div>
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900">Super Admin</h4>
                                            </div>
                                            <button onClick={() => setCurrentStep(2)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                                                <ReviewField label="Admin Name" value={formData.adminName} />
                                                <ReviewField label="Email" value={formData.adminEmail} />
                                                <ReviewField label="Phone" value={formData.adminPhone} />
                                                <ReviewField label="Invite Method" value={formData.inviteMethod === 'MAGIC_LINK' ? 'Magic Invite Link' : 'Temporary Password'} />
                                                <ReviewField label="System Role" value="Brand Admin" />
                                                <ReviewField label="Store Scope" value="All Locations" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* 3 · Stores Summary */}
                                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                                    <Store className="w-4 h-4 text-slate-900" />
                                                </div>
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900">Stores</h4>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formData.stores.length} location{formData.stores.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <button onClick={() => setCurrentStep(3)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                                        </div>
                                        <div className="p-6">
                                            {formData.stores.length === 0 ? (
                                                <p className="text-xs text-slate-400 font-medium text-center py-4">No stores configured. Stores can be added later from the brand dashboard.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {formData.stores.map((s, i) => (
                                                        <div key={s.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-[10px] font-black text-slate-400">{i + 1}</div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900">{s.storeName || `Store ${i + 1}`}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400">{[s.city, s.province].filter(Boolean).join(', ') || 'No address'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <span>{s.paymentTermType === 'INHERIT_BRAND' ? 'Brand Terms' : s.paymentTermType.replace(/_/g, ' ')}</span>
                                                                <span>{s.taxSetup === 'INHERIT_BRAND' ? 'Brand Tax' : s.taxProvince}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* 4 · Modules Summary */}
                                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                                    <LayoutGrid className="w-4 h-4 text-slate-900" />
                                                </div>
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900">Module Entitlements</h4>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{formData.modules.filter(m => m.purchased).length} purchased</span>
                                            </div>
                                            <button onClick={() => setCurrentStep(4)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-2">
                                                {formData.modules.map((mod) => (
                                                    <div key={mod.id} className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-all ${mod.purchased ? 'bg-slate-50 border border-slate-100' : 'opacity-40'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${mod.purchased ? (mod.enabled ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200'}`} />
                                                            <span className="text-xs font-black text-slate-900">{mod.name}</span>
                                                            {mod.isCore && <span className="text-[7px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Core</span>}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {mod.purchased && mod.notes && (
                                                                <span className="text-[9px] font-medium text-slate-400 max-w-[200px] truncate">{mod.notes}</span>
                                                            )}
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${mod.purchased ? (mod.enabled ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400'}`}>
                                                                {mod.purchased ? (mod.enabled ? 'Active' : 'Inactive') : 'Not Licensed'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Core Business Rules */}
                                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-900 flex items-center gap-3">
                                            <ShieldCheck className="w-4 h-4 text-white" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-white">Core Business Rules</h4>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {([
                                                { rule: 'Brand cannot exist without at least one admin.', color: 'text-red-500' },
                                                { rule: 'Store cannot exist without brand.', color: 'text-red-500' },
                                                { rule: 'Brand suspension disables all users, all stores, and all module access.', color: 'text-amber-500' },
                                                { rule: 'Module cannot be enabled if not purchased.', color: 'text-amber-500' },
                                                { rule: 'Store payment terms override brand only if explicitly set.', color: 'text-blue-500' },
                                                { rule: 'Store tax profile overrides brand only if explicitly set.', color: 'text-blue-500' },
                                                { rule: 'Store logo overrides brand logo in store context.', color: 'text-blue-500' },
                                                { rule: 'Strict brand isolation — no cross-brand data access.', color: 'text-red-500' },
                                            ]).map((item) => (
                                                <div key={item.rule} className="flex items-start gap-3 group">
                                                    <CheckCircle2 className={`w-4 h-4 ${item.color} shrink-0 mt-0.5`} />
                                                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight leading-relaxed">
                                                        {item.rule}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Orchestration Preview */}
                                    <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                                                <FileText className="w-5 h-5 text-slate-900" />
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Transactional Orchestration</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium">The following {ORCHESTRATION_STEPS.length} operations will execute atomically. If any step fails, the entire transaction rolls back.</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                                    {ORCHESTRATION_STEPS.map((step, idx) => (
                                                        <div key={step} className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black text-slate-400 w-4 shrink-0">{idx + 1}.</span>
                                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Action Footer */}
                                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-200">
                                        <button
                                            onClick={prevStep}
                                            className="px-8 py-4 bg-white text-slate-600 rounded-2xl text-sm font-black border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                        >
                                            Back to Modules
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="px-12 py-4 bg-emerald-500 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-2xl shadow-emerald-200 flex items-center gap-2 group"
                                        >
                                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            Create Brand
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
