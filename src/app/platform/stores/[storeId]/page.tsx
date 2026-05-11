'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    Store,
    MapPin,
    Shield,
    Globe,
    Coins,
    Package,
    ChevronRight,
    Edit,
    Clock,
    Layout,
    X
} from 'lucide-react';
import { Store as StoreType } from '@/shared/types/store';
import { Brand } from '@/shared/types/tenant';

// ─── Mock Data Helpers ──────────────────────────────────────────────────────────

const MOCK_BRAND: Brand = {
    id: 'brand-001',
    brandLegalName: 'Acme Pizza Corporation Ltd.',
    brandName: 'Acme Pizza Co.',
    tradeName: 'Acme Pizza',
    address: '100 King Street West, Toronto, ON M5X 1A1',
    timezone: 'Eastern Standard Time (EST)',
    currency: 'CAD ($)',
    primaryContact: 'john@acmepizza.com',
    contactPhone: '+1 (416) 555-0199',
    status: 'Active',
    createdDate: '2025-06-15',
    createdBy: 'System Admin',
    totalStores: 12,
    province: 'Ontario',
    modulesPurchasedCount: 5,
    plan: 'Enterprise',
    slug: 'acme-pizza',
    defaultPaymentTerms: 'Net 30',
    defaultTaxScheme: 'HST (Ontario)',
    defaultTaxRate: 13,
    lightLogo: '',
    darkLogo: ''
};

const MOCK_STORES: StoreType[] = [
    {
        id: 'store-01',
        name: 'Downtown Toronto',
        code: 'DT-001',
        status: 'Active',
        city: 'Toronto',
        province: 'Ontario',
        paymentTerms: 'Net 30',
        taxProfile: 'Inherit',
        logoStatus: 'Set',
        tenantId: 'tenant-demo',
        timezone: 'EST'
    },
    { id: 'store-02', name: 'Midtown', code: 'MT-002', status: 'Active', city: 'Toronto', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Default', tenantId: 'tenant-demo', timezone: 'EST' },
    { id: 'store-03', name: 'Scarborough', code: 'SC-003', status: 'Active', city: 'Scarborough', province: 'Ontario', paymentTerms: 'Net 15', taxProfile: 'Override', logoStatus: 'Set', tenantId: 'tenant-demo', timezone: 'EST' },
];

// ─── Page Component ─────────────────────────────────────────────────────────────

export default function StoreDetailPage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.storeId as string;

    const [store, setStore] = useState<StoreType | null>(null);
    const [brand] = useState<Brand>(MOCK_BRAND);
    const [isLoading, setIsLoading] = useState(true);
    const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

    useEffect(() => {
        // Simulate API fetch
        const timer = setTimeout(() => {
            const foundStore = MOCK_STORES.find(s => s.id === storeId) || MOCK_STORES[0];
            setStore(foundStore ?? null);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [storeId]);

    const handleDeactivate = () => {
        if (!store) return;
        const confirmMsg = store.status === 'Active'
            ? `Are you sure you want to deactivate ${store.name}? This will suspend all terminal operations.`
            : `Reactiving ${store.name} will restore all system operations. Proceed?`;

        if (window.confirm(confirmMsg)) {
            setStore({
                ...store,
                status: store.status === 'Active' ? 'Inactive' : 'Active'
            } as StoreType);
        }
    };

    const handleViewLiveData = () => {
        router.push(`/pos/dashboard?storeId=${storeId}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Initialising Store Context...</p>
            </div>
        );
    }

    if (!store) return null;

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            {/* ── Breadcrumbs & Navigation ─────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <button onClick={() => router.push('/platform/tenants')} className="hover:text-slate-900 transition-colors">Platform</button>
                    <ChevronRight className="w-3 h-3" />
                    <button onClick={() => router.push(`/platform/tenants/${brand.id}`)} className="hover:text-slate-900 transition-colors">Acme Pizza Co.</button>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900">Store Node</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{store.name}</h1>
                                <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-tighter shadow-sm">
                                    {store.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">
                                Store Node ID: <code className="px-2 py-0.5 rounded bg-slate-100 text-xs font-mono">{store.id}</code> · Code: <span className="font-bold text-slate-700">{store.code}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 group">
                            <Edit className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                            Edit Configuration
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main Layout ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Core Identity & Localization */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-slate-400" />
                                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-[0.15em]">Localization & Contact</h3>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoItem icon={Building2} label="Operating City" value={store.city} />
                                <InfoItem icon={Globe} label="Province / State" value={store.province} />
                                <InfoItem icon={Clock} label="Operational Timezone" value={store.timezone} />
                                <InfoItem icon={Layout} label="Regional Currency" value={brand.currency} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Coins className="w-5 h-5 text-slate-400" />
                                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-[0.15em]">Financial & Tax Policy</h3>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Payment Terms</span>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-black rounded-xl border border-slate-200">
                                            {store.paymentTerms}
                                        </span>
                                        {store.paymentTerms === brand.defaultPaymentTerms && (
                                            <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase italic">
                                                <Shield className="w-3 h-3" /> Inherited
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tax Profile</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1.5 text-xs font-black rounded-xl border ${store.taxProfile === 'Inherit'
                                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {store.taxProfile} Global Policy
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Modules for this Store */}
                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-[0.15em]">Deployed Modules</h3>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { id: 'pos', name: 'Point of Sale', active: true, icon: Store },
                                    { id: 'inventory', name: 'Inventory', active: true, icon: Package },
                                    { id: 'kiosk', name: 'Kiosk', active: true, icon: Layout },
                                ].map((mod) => (
                                    <div key={mod.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                                        <div className="flex items-start justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm">
                                                <mod.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <span className="text-[9px] font-black text-emerald-600 uppercase">Operational</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-slate-900">{mod.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Mini KPI & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm p-8 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner cursor-pointer hover:bg-slate-100 transition-colors">
                            {store.logoStatus === 'Set' ? (
                                <Building2 className="w-10 h-10 text-slate-900" />
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-slate-300">
                                    <Building2 className="w-10 h-10" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Default</span>
                                </div>
                            )}
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">{store.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">{brand.brandName} · {store.city}</p>

                        <div className="w-full grid grid-cols-2 gap-3 mb-6">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Active Users</span>
                                <span className="text-xl font-black text-slate-900">12</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Transactions</span>
                                <span className="text-xl font-black text-emerald-600">4.2k</span>
                            </div>
                        </div>

                        <button
                            onClick={handleViewLiveData}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-200/50 active:scale-[0.98]"
                        >
                            View Store Live Data
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
                        <Store className="absolute -right-12 -bottom-12 w-48 h-48 text-white/[0.03] rotate-12" />
                        <h4 className="text-lg font-black mb-2 relative z-10">Administrative Help</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 relative z-10">
                            Configure regional overrides for tax profiles, payment gateways, and store-specific operational hours.
                        </p>
                        <div className="space-y-3 relative z-10">
                            <button
                                onClick={() => setIsOverrideModalOpen(true)}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5 backdrop-blur-md"
                            >
                                Regional Overrides
                            </button>
                            <button
                                onClick={handleDeactivate}
                                className={`w-full py-3 ${store.status === 'Active'
                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/10'
                                    } rounded-xl text-xs font-black uppercase tracking-widest transition-all border`}
                            >
                                {store.status === 'Active' ? 'Deactivate Node' : 'Activate Node'}
                            </button>
                        </div>
                    </div>

                </div>

            </div>

            {/* Override Modal Placeholder */}
            {isOverrideModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Regional Overrides</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Configuration Engine</p>
                                </div>
                                <button onClick={() => setIsOverrideModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4">
                                <Shield className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-slate-900">Governance Active</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        This node is currently inheriting <span className="font-bold text-slate-900">Brand Global Defaults</span>.
                                        Enabling overrides will disconnect this store from the global policy updates.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed border border-slate-200">
                                    Configure Tax Overrides
                                </button>
                                <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed border border-slate-200">
                                    Payment Gateway Rules
                                </button>
                                <button className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                    Enable Overrides Engine
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <Icon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <p className="text-sm font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}
