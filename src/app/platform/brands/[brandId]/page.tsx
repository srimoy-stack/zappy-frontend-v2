'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Activity,
    ChevronRight,
    Zap,
    ArrowUpRight,
    ArrowLeft,
    Building2,
    Package,
    Store,
    Users,
    Mail,
    Phone,
    MapPin,
    Shield,
    Globe,
    Coins,
    ShieldAlert,
    Upload,
    FileText,
    Image as ImageIcon,
    AlertTriangle,
    Info,
    Plus,
    Eye,
    X,
    Pencil,
    Check,
    Ban,
    RefreshCw,
    Search,
    Code,
    ChevronDown,
    ChevronUp,
    Terminal,
    UserPlus,
    LogIn,
} from 'lucide-react';

import { TenantModule as ModuleEntitlement } from '@/shared/types/module';
import { Store as StoreType } from '@/shared/types/store';
import { Brand } from '@/shared/types/tenant';
import { User as UserType, UserRole } from '@/shared/types/user';
import { cn } from '@/utils';

// ─── Types ──────────────────────────────────────────────────────────────────────

type BrandTab = 'overview' | 'modules' | 'stores' | 'users' | 'audit-log';

interface TabDef {
    id: BrandTab;
    label: string;
}

const TABS: TabDef[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'modules', label: 'Modules' },
    { id: 'stores', label: 'Stores' },
    { id: 'users', label: 'Users' },
    { id: 'audit-log', label: 'Audit Log' },
];

// ─── Mock Data ──────────────────────────────────────────────────────────────────

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
    lightLogo: 'https://placehold.co/200x80/f8fafc/0f172a?text=Acme+Light',
    darkLogo: 'https://placehold.co/200x80/0f172a/f8fafc?text=Acme+Dark',
    defaultPaymentTerms: 'Net 30',
    defaultTaxScheme: 'HST (Ontario)',
    defaultTaxRate: 13,
};

const MOCK_MODULES: ModuleEntitlement[] = [
    { id: 'pos', name: 'Point of Sale', purchased: true, enabled: true, startDate: '2025-06-15', notes: 'Core system module.', isCore: true },
    { id: 'inventory', name: 'Inventory', purchased: true, enabled: true, startDate: '2025-06-15', notes: 'Warehouse and recipe tracking.', isCore: false },
    { id: 'kiosk', name: 'Kiosk', purchased: true, enabled: true, startDate: '2025-07-01', notes: 'Self-service ordering.', isCore: false },
    { id: 'loyalty', name: 'Loyalty', purchased: true, enabled: false, startDate: '2025-08-10', notes: 'Points and rewards system.', isCore: false },
    { id: 'analytics', name: 'Analytics', purchased: false, enabled: false, startDate: null, notes: 'Contract pending review.', isCore: false },
];

const MOCK_STORES: StoreType[] = [
    { id: 'store-01', name: 'Downtown Toronto', code: 'DT-001', status: 'Active', city: 'Toronto', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Set', tenantId: 'tenant-demo', timezone: 'EST' },
    { id: 'store-02', name: 'Midtown', code: 'MT-002', status: 'Active', city: 'Toronto', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Default', tenantId: 'tenant-demo', timezone: 'EST' },
    { id: 'store-03', name: 'Scarborough', code: 'SC-003', status: 'Active', city: 'Scarborough', province: 'Ontario', paymentTerms: 'Net 15', taxProfile: 'Override', logoStatus: 'Set', tenantId: 'tenant-demo', timezone: 'EST' },
    { id: 'store-04', name: 'Mississauga Hub', code: 'MS-004', status: 'Inactive', city: 'Mississauga', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Default', tenantId: 'tenant-demo', timezone: 'EST' },
    { id: 'store-05', name: 'North York', code: 'NY-005', status: 'Active', city: 'North York', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Set', tenantId: 'tenant-demo', timezone: 'EST' },
];

const MOCK_USERS: (UserType & { storeAccess: string })[] = [
    { id: 'u-1', name: 'John Doe', email: 'john@acmepizza.com', userType: 'Staff', role: UserRole.TENANT_ADMIN, storeAccess: 'All Locations', storeIds: [], tenantId: 'tenant-demo', status: 'Active', lastLogin: '2026-02-23', createdAt: '2025-01-01' },
    { id: 'u-2', name: 'Sarah Chen', email: 'sarah@acmepizza.com', userType: 'Manager', role: UserRole.STORE_MANAGER, storeAccess: 'Downtown Toronto', storeIds: ['store-01'], tenantId: 'tenant-demo', status: 'Active', lastLogin: '2026-02-23', createdAt: '2025-01-01' },
    { id: 'u-3', name: 'Mike Patel', email: 'mike@acmepizza.com', userType: 'Manager', role: UserRole.STORE_MANAGER, storeAccess: 'Midtown', storeIds: ['store-02'], tenantId: 'tenant-demo', status: 'Active', lastLogin: '2026-02-22', createdAt: '2025-01-01' },
    { id: 'u-4', name: 'Lisa Wong', email: 'lisa@acmepizza.com', userType: 'Staff', role: UserRole.POS_USER, storeAccess: 'Scarborough', storeIds: ['store-03'], tenantId: 'tenant-demo', status: 'Active', lastLogin: '2026-02-21', createdAt: '2025-01-01' },
    { id: 'u-5', name: 'Carlos Rivera', email: 'carlos@acmepizza.com', userType: 'Driver', role: UserRole.POS_USER, storeAccess: 'North York', storeIds: ['store-05'], tenantId: 'tenant-demo', status: 'Inactive', lastLogin: '2026-01-15', createdAt: '2025-01-01' },
];

const MOCK_AUDIT_LOG = [
    {
        id: 'a-1',
        event: 'BRAND_CREATED',
        actor: 'Platform Admin',
        timestamp: '2025-06-15T09:00:00Z',
        details: 'Brand Acme Pizza Co. was created and registered in the platform.',
        payload: { brandName: 'Acme Pizza Co.', tradeName: 'Acme Pizza', owner: 'John Acme' }
    },
    {
        id: 'a-2',
        event: 'MODULE_PURCHASED',
        actor: 'Enterprise Sales',
        timestamp: '2025-06-15T09:30:00Z',
        details: 'Module "Point of Sale" contract entitlement added.',
        payload: { moduleId: 'pos', version: '2.4.0', plan: 'Enterprise' }
    },
    {
        id: 'a-3',
        event: 'MODULE_ENABLED',
        actor: 'Platform Admin',
        timestamp: '2025-06-15T10:00:00Z',
        details: 'Module "Point of Sale" operationally enabled for the brand.',
        payload: { moduleId: 'pos', environment: 'Production' }
    },
    {
        id: 'a-4',
        event: 'STORE_CREATED',
        actor: 'John Doe',
        timestamp: '2025-06-20T14:30:00Z',
        details: 'New store node "Downtown Toronto" (DT-001) added to network.',
        payload: { storeName: 'Downtown Toronto', code: 'DT-001', city: 'Toronto' }
    },
    {
        id: 'a-5',
        event: 'PAYMENT_TERMS_UPDATED',
        actor: 'System Admin',
        timestamp: '2025-06-25T11:00:00Z',
        details: 'Global brand payment terms adjusted to Net 30.',
        payload: { previous: 'Net 15', new: 'Net 30', scope: 'Brand' }
    },
    {
        id: 'a-6',
        event: 'TAX_UPDATED',
        actor: 'Compliance Officer',
        timestamp: '2025-07-01T09:15:00Z',
        details: 'HST tax profile updated for Ontario region stores.',
        payload: { rate: 13.00, region: 'Ontario', authority: 'CRA' }
    },
    {
        id: 'a-7',
        event: 'USER_CREATED',
        actor: 'John Doe',
        timestamp: '2025-07-05T11:20:00Z',
        details: 'Access provisioned for user "Sarah Chen" as STORE_MANAGER.',
        payload: { userId: 'u-2', role: 'STORE_MANAGER' }
    },
    {
        id: 'a-8',
        event: 'LOGO_UPDATED',
        actor: 'Brand Designer',
        timestamp: '2025-08-10T14:00:00Z',
        details: 'Brand identity assets replaced for Light Logo theme.',
        payload: { assetType: 'LIGHT_LOGO', dimensions: '400x120', format: 'SVG' }
    },
    {
        id: 'a-9',
        event: 'BRAND_SUSPENDED',
        actor: 'Platform Billing',
        timestamp: '2025-12-01T12:00:00Z',
        details: 'Global brand suspension initiated due to reconciliation delay.',
        payload: { reason: 'BILLING_INQUIRY', ticket: 'TIC-9921' }
    }
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
    if (!iso || iso === '—') return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTimestamp(iso: string | null | undefined): string {
    if (!iso || iso === '—') return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-CA', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ─── Shared Local Components ───────────────────────────────────────────────────

function FormSectionTitle({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="flex items-center gap-2 border-l-4 border-slate-900 pl-4">
            <Icon className="w-4 h-4 text-slate-400" />
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{title}</h4>
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

// ─── Component ──────────────────────────────────────────────────────────────────

export default function BrandDetailPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params?.brandId as string | undefined;
    const searchParams = useSearchParams();
    const isEditing = searchParams?.get('edit') === 'true';

    const [activeTab, setActiveTab] = useState<BrandTab>('overview');
    const [localBrand, setLocalBrand] = useState<Brand>(MOCK_BRAND);

    // Sync mock brand if needed (in a real app, this would be an API fetch)
    useEffect(() => {
        setLocalBrand(MOCK_BRAND);
    }, [brandId]);

    const handleUpdateBrand = (updatedData: Brand) => {
        setLocalBrand(updatedData);
        router.replace(`/platform/brands/${brandId}`);
    };

    const handleSuspend = () => {
        if (!window.confirm(`Are you sure you want to suspend ${localBrand.brandName}?`)) return;
        setLocalBrand({ ...localBrand, status: 'Suspended' });
    };

    const handleReactivate = () => {
        if (!window.confirm(`Are you sure you want to reactivate ${localBrand.brandName}?`)) return;
        setLocalBrand({ ...localBrand, status: 'Active' });
    };

    const brand = localBrand;

    return (
        <div className="max-w-[1700px] mx-auto space-y-8 pb-32 px-4 pt-4">
            {/* ── Breadcrumb ── */}
            <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <button
                    onClick={() => router.push('/platform/brands')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    Network
                </button>
                <ChevronRight size={10} className="opacity-30" />
                <span className="text-slate-900">{brand.brandName}</span>
            </nav>

            {/* ── 1. Header: Operational Pulse ── */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-200 group overflow-hidden relative">
                        <Building2 className="w-8 h-8 text-emerald-400 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                {brand.brandName}
                            </h1>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${brand.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${brand.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {brand.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-tight opacity-70 flex items-center gap-2">
                            <Globe size={12} className="text-slate-400" />
                            {brand.tradeName} · <span className="font-bold text-slate-900">{brandId}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-right">System Health</span>
                            <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-xs font-black text-slate-900">Stable</span>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-1 h-3 bg-emerald-500 rounded-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Access Brand Admin — Impersonation entry point */}
                    <button
                        id={`access-brand-admin-${brandId}`}
                        onClick={() => router.push(`/platform/brands/${brandId}/impersonate`)}
                        className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] shadow-2xl shadow-amber-200 hover:bg-amber-600 transition-all active:scale-95 group"
                    >
                        <LogIn size={14} className="group-hover:scale-125 transition-transform" />
                        Access Brand Admin
                    </button>

                    <button
                        onClick={() => router.push(`/platform/brands/${brandId}?edit=true`)}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 group"
                    >
                        <Pencil size={14} className="text-emerald-400 group-hover:scale-125 transition-transform" />
                        Modify Protocol
                    </button>
                </div>
            </div>

            {/* ── 2. Navigation Tabs ── */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl w-fit border border-slate-200 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-4 ring-slate-100/50'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── 3. Tab Content ── */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                {activeTab === 'overview' && (
                    <OverviewSection
                        brand={brand}
                        onSuspend={handleSuspend}
                        onReactivate={handleReactivate}
                    />
                )}
                {activeTab === 'modules' && <ModulesSection />}
                {activeTab === 'stores' && <StoresSection brand={brand} />}
                {activeTab === 'users' && <UsersSection />}
                {activeTab === 'audit-log' && <AuditLogSection />}
            </div>

            {/* Edit Brand Modal */}
            {isEditing && (
                <EditBrandModal
                    brand={brand}
                    onClose={() => router.replace(`/platform/brands/${brandId}`)}
                    onSave={handleUpdateBrand}
                />
            )}
        </div>
    );
}

function OverviewSection({
    brand,
    onSuspend,
    onReactivate
}: {
    brand: Brand,
    onSuspend: () => void,
    onReactivate: () => void
}) {
    const router = useRouter();
    const params = useParams();
    const brandId = params?.brandId as string | undefined;

    return (
        <div className="space-y-8">
            {/* Vital Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <VitalStatCard
                    icon={Store}
                    label="Network Nodes"
                    value={brand.totalStores.toString()}
                    sub="Active Storefronts"
                    color="blue"
                    trend="+1"
                />
                <VitalStatCard
                    icon={Package}
                    label="Module Flux"
                    value={brand.modulesPurchasedCount.toString()}
                    sub="Protocol Integrity"
                    color="emerald"
                    trend="Stable"
                />
                <VitalStatCard
                    icon={Users}
                    label="Team Capacity"
                    value={MOCK_USERS.length.toString()}
                    sub="Active Personas"
                    color="violet"
                    trend="+2"
                />
                <VitalStatCard
                    icon={Shield}
                    label="Protocol"
                    value={brand.plan.toUpperCase()}
                    sub="Governance Tier"
                    color="amber"
                    trend="Secure"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Column 1: Core Architecture */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Identity Matrix */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                            <Building2 className="w-64 h-64 text-slate-900" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
                                    <Building2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Identity Matrix</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Core Legal & Operational Definitions</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <ArchitectureRow label="Legal Name" value={brand.brandLegalName} icon={FileText} />
                                <ArchitectureRow label="Brand Signature" value={brand.brandName} icon={Terminal} />
                                <ArchitectureRow label="Trade Designation" value={brand.tradeName} icon={Globe} />
                                <ArchitectureRow label="Network Node Slug" value={brand.slug || '—'} icon={Code} mono />
                                <ArchitectureRow label="Geographic Anchor" value={brand.address} icon={MapPin} className="md:col-span-2" />
                            </div>

                            <div className="h-[1px] bg-slate-100" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <ArchitectureRow label="Temporal Zone" value={brand.timezone} icon={Globe} />
                                <ArchitectureRow label="Fiscal Denominator" value={brand.currency} icon={Coins} />
                                <ArchitectureRow label="Contact Vector" value={brand.primaryContact} icon={Mail} />
                                <ArchitectureRow label="Operational Pulse" value={brand.contactPhone} icon={Phone} />
                            </div>
                        </div>
                    </div>

                    {/* Fiscal Governance */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
                                    <ShieldAlert className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Fiscal Governance</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Network-wide default policies</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-slate-900 transition-all cursor-pointer">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Default Terms</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-black text-slate-900">{brand.defaultPaymentTerms || '—'}</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900" />
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-slate-900 transition-all cursor-pointer">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tax Architecture</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-black text-slate-900">{brand.defaultTaxScheme} ({brand.defaultTaxRate}%)</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Identity Assets & Actions */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Visual DNA */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Visual DNA</h3>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Phototropic (Light)</span>
                                        <button className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                                            <Upload size={10} /> Sync Asset
                                        </button>
                                    </div>
                                    <div className="w-full h-40 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center p-8 group hover:border-slate-900 transition-all">
                                        {brand.lightLogo ? (
                                            <img src={brand.lightLogo} alt="Light" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-slate-200" />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Scototropic (Dark)</span>
                                        <button className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                                            <Upload size={10} /> Sync Asset
                                        </button>
                                    </div>
                                    <div className="w-full h-40 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-center p-8 group hover:border-emerald-500 transition-all shadow-2xl">
                                        {brand.darkLogo ? (
                                            <img src={brand.darkLogo} alt="Dark" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-slate-700" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                            <div className="flex gap-4">
                                <div className="p-2 bg-white rounded-xl h-fit border border-slate-100">
                                    <Info size={14} className="text-slate-400" />
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Identity assets are distributed via CDN at <span className="text-slate-900 font-bold">edge nodes</span> for sub-50ms latency in POS terminals.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Overwatch Actions */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        <Zap className="absolute -top-12 -right-12 w-48 h-48 text-emerald-500/10 rotate-12" />
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight mb-2 uppercase italic text-emerald-400">Overwatch Actions</h3>
                                <p className="text-sm text-slate-400 font-medium">Platform-level governance overrides.</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push(`/platform/brands/${brandId}?edit=true`)}
                                    className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                                            <Pencil size={14} className="text-emerald-400" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Recalibrate Profile</span>
                                    </div>
                                    <ArrowUpRight size={16} className="text-slate-600 group-hover:text-white" />
                                </button>

                                {/* Access Brand Admin — Impersonation */}
                                <button
                                    id={`overwatch-access-brand-admin-${brandId}`}
                                    onClick={() => router.push(`/platform/brands/${brandId}/impersonate`)}
                                    className="w-full flex items-center justify-between p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl hover:bg-amber-500/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/20 rounded-lg">
                                            <LogIn size={14} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-widest text-amber-100 block">Access Brand Admin</span>
                                            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Secure impersonation · Time-limited</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-amber-600 group-hover:text-amber-400 transition-colors" />
                                </button>

                                {brand.status === 'Active' ? (
                                    <button
                                        onClick={onSuspend}
                                        className="w-full flex items-center justify-between p-5 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-500/20 rounded-lg">
                                                <Ban size={14} className="text-red-400" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-red-100">Suspend Network</span>
                                        </div>
                                        <ShieldAlert size={16} className="text-red-400 group-hover:scale-110 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={onReactivate}
                                        className="w-full flex items-center justify-between p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                <RefreshCw size={14} className="text-emerald-400" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Restore Network</span>
                                        </div>
                                        <Zap size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                    </button>
                                )}

                                {/* Communication Orchestration — SMTP/SMS config */}
                                <button
                                    id={`overwatch-config-comm-${brandId}`}
                                    onClick={() => router.push(`/platform/brands/${brandId}/config`)}
                                    className="w-full flex items-center justify-between p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Mail size={14} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-widest text-blue-100 block">Communication Orchestration</span>
                                            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Isolated SMTP & SMS Gateway</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-blue-600 group-hover:text-blue-400 transition-colors" />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArchitectureRow({ label, value, icon: Icon, mono = false, className = "" }: any) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-center gap-2">
                <Icon size={12} className="text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className={cn(
                "text-sm font-bold text-slate-900 border-b border-slate-50 pb-2 flex items-center gap-2",
                mono ? "font-mono text-[11px] bg-slate-50 px-2 py-1 rounded-lg border-none" : ""
            )}>
                {value}
            </div>
        </div>
    );
}

function VitalStatCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
    trend,
}: {
    icon: any;
    label: string;
    value: string;
    sub: string;
    color: 'blue' | 'emerald' | 'violet' | 'amber';
    trend: string;
}) {
    const colorMap = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'bg-blue-900', iconText: 'text-blue-400', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-emerald-900', iconText: 'text-emerald-400', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
        violet: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'bg-violet-900', iconText: 'text-violet-400', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-900', iconText: 'text-amber-400', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    };
    const c = colorMap[color];
    return (
        <div className={`${c.bg} border ${c.border} rounded-[2rem] p-6 flex flex-col gap-4 hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between">
                <div className={`p-3 ${c.icon} rounded-2xl shadow-lg`}>
                    <Icon className={`w-5 h-5 ${c.iconText}`} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${c.badge}`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${c.text}`}>{label}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>
            </div>
        </div>
    );
}



// ─── TAB: Modules ───────────────────────────────────────────────────────────────

function ModulesSection() {
    const [modules, setModules] = useState<ModuleEntitlement[]>(MOCK_MODULES);
    const [pendingChange, setPendingChange] = useState<{
        moduleId: string;
        field: 'purchased' | 'enabled';
        value: boolean;
    } | null>(null);

    const handleToggle = (id: string, field: 'purchased' | 'enabled', currentVal: boolean) => {
        const mod = modules.find(m => m.id === id);
        if (!mod) return;

        if (field === 'enabled' && !currentVal) {
            // Rule: Cannot enable if not purchased
            if (!mod.purchased) {
                alert("This module cannot be enabled without an active contract entitlement.");
                return;
            }
        }

        if (field === 'enabled' && currentVal && mod.isCore) {
            // Rule: Core POS cannot be disabled
            return;
        }

        if (field === 'purchased' && currentVal && mod.enabled) {
            // If unpurchasing, must also disable (will be handled in confirm)
        }

        setPendingChange({ moduleId: id, field, value: !currentVal });
    };

    const confirmChange = () => {
        if (!pendingChange) return;

        setModules(prev => prev.map(m => {
            if (m.id === pendingChange.moduleId) {
                const updated = { ...m, [pendingChange.field]: pendingChange.value };
                // Side effect: if unpurchased, must be disabled
                if (pendingChange.field === 'purchased' && !pendingChange.value) {
                    updated.enabled = false;
                }
                return updated;
            }
            return m;
        }));
        setPendingChange(null);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900">Brand Modules</h2>
                    <p className="text-[13px] text-slate-500">
                        Manage contracted and operational modules for this brand.
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                    <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Module Configuration</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
                        {modules.length}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40">
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Module</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Purchased (Contract)</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Enabled (Operational)</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modules.map((mod) => (
                                <tr key={mod.id} className="border-b border-slate-50 hover:bg-slate-50/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className="text-sm font-bold text-slate-900">{mod.name}</span>
                                            {mod.isCore && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-slate-900 text-[9px] font-black uppercase text-white rounded tracking-tighter">Core</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <Switch
                                                checked={mod.purchased}
                                                onChange={() => handleToggle(mod.id, 'purchased', mod.purchased)}
                                                color="emerald"
                                            />
                                            <span className={`text-[9px] font-black uppercase ${mod.purchased ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {mod.purchased ? 'Contract Active' : 'No Contract'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1 group relative">
                                            <Switch
                                                checked={mod.enabled}
                                                onChange={() => handleToggle(mod.id, 'enabled', mod.enabled)}
                                                disabled={!mod.purchased || (mod.isCore && mod.enabled)}
                                                color="blue"
                                            />
                                            <span className={`text-[9px] font-black uppercase ${mod.enabled ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {mod.enabled ? 'Enabled' : 'Disabled'}
                                            </span>

                                            {/* Validation hints */}
                                            {!mod.purchased && (
                                                <div className="absolute top-0 -translate-y-full mb-2 hidden group-hover:flex bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap z-10 flex-col items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                                    Cannot enable without active contract
                                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                                                </div>
                                            )}
                                            {mod.isCore && mod.enabled && (
                                                <div className="absolute top-0 -translate-y-full mb-2 hidden group-hover:flex bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap z-10 flex-col items-center gap-1">
                                                    <Info className="w-3 h-3 text-blue-400" />
                                                    Core POS cannot be disabled
                                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 tabular-nums">
                                        {!mod.startDate || mod.startDate === '—' ? '—' : formatDate(mod.startDate)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                                            {mod.notes}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            {pendingChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Module Update</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                Are you sure you want to {pendingChange.value ? 'enable' : 'disable'} the <span className="font-bold text-slate-900">{modules.find(m => m.id === pendingChange.moduleId)?.name}</span> {pendingChange.field === 'purchased' ? 'contract' : 'operation'}?
                                {pendingChange.field === 'purchased' && !pendingChange.value && (
                                    <span className="block mt-2 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100 font-medium">
                                        Warning: This will also disable the module operationally.
                                    </span>
                                )}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPendingChange(null)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmChange}
                                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                                >
                                    Confirm Change
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Shared UI Components ───────────────────────────────────────────────────────

function Switch({ checked, onChange, disabled, color = 'emerald' }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    color?: 'emerald' | 'blue';
}) {
    const activeColor = color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-600';

    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className={`
                relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                ${checked ? activeColor : 'bg-slate-200'}
                ${disabled ? 'opacity-40 cursor-not-allowed grayscale-[0.5]' : ''}
            `}
        >
            <span
                className={`
                    pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${checked ? 'translate-x-4' : 'translate-x-0'}
                `}
            />
        </button>
    );
}

// ─── TAB: Stores ────────────────────────────────────────────────────────────────

function StoresSection({ brand }: { brand: Brand }) {
    const router = useRouter();
    const [stores, setStores] = useState<StoreType[]>(MOCK_STORES);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<StoreType | null>(null);



    const handleViewStore = (id: string) => {
        router.push(`/platform/stores/${id}`);
    };

    const handleUpdateStore = (updatedStore: StoreType) => {
        setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
        setEditingStore(null);
    };

    const [form, setForm] = useState({
        name: '',
        code: '',
        address1: '',
        address2: '',
        city: '',
        province: 'Ontario',
        postalCode: '',
        country: 'Canada',
        phone: '',
        email: '',
        paymentTerms: 'INHERIT_BRAND',
        netDays: 30,
        taxSetup: 'INHERIT_BRAND',
        taxScheme: 'HST (Ontario)',
        taxRate: 13,
    });

    const handleAddStore = (e: React.FormEvent) => {
        e.preventDefault();
        const newStore: StoreType = {
            id: `store-${Date.now()}`,
            name: form.name,
            code: form.code,
            city: form.city,
            province: form.province,
            status: 'Active',
            paymentTerms: form.paymentTerms === 'INHERIT_BRAND' ? brand.defaultPaymentTerms : (form.paymentTerms === 'NET_DAYS' ? `Net ${form.netDays}` : form.paymentTerms),
            taxProfile: form.taxSetup === 'INHERIT_BRAND' ? 'Inherit' : 'Override',
            logoStatus: 'Default',
            tenantId: 'tenant-demo',
            timezone: 'EST'
        };
        setStores([newStore, ...stores]);
        setIsAddModalOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Network Topology</h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Active store nodes and regional operational status.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Logic Nodes:</span>
                        <span className="text-sm font-black text-slate-900">{stores.length}</span>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 group"
                    >
                        <Plus size={16} strokeWidth={3} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
                        Deploy New Node
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                    <div key={store.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:border-slate-900 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                            <Store className="w-32 h-32 text-slate-900" />
                        </div>

                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-colors duration-500">
                                    <Store className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{store.name}</h4>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{store.code}</p>
                                </div>
                            </div>
                            <MiniStatusBadge status={store.status} />
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <MapPin size={12} /> Regional Zone
                                </span>
                                <span className="text-slate-900">{store.city}, {store.province}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <Coins size={12} /> Fiscal Terms
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase border border-slate-200">
                                    {store.paymentTerms}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <Shield size={12} /> Tax Profile
                                </span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                                    store.taxProfile === 'Inherit' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100"
                                )}>
                                    {store.taxProfile}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleViewStore(store.id)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-transparent hover:border-white/10"
                            >
                                <Eye size={12} /> Enter Node
                            </button>
                            <button
                                onClick={() => setEditingStore(store)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-transparent hover:border-white/10"
                            >
                                <Pencil size={12} /> Recalibrate
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {stores.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-slate-200 border-dashed rounded-[2.5rem]">
                    <Store size={48} className="text-slate-100 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest italic">No Logic Nodes Discovered</p>
                </div>
            )}

            {/* Add Store Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 font-[family-name:var(--font-geist-sans)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                                    <Store className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New Store</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Store Onboarding</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleAddStore} className="flex-1 overflow-y-auto p-8 space-y-10 bg-white">
                            <div className="space-y-6">
                                <FormSectionTitle icon={Building2} title="Store Identity" />
                                <div className="grid grid-cols-2 gap-6">
                                    <InputWrapper label="Store Name" required>
                                        <input
                                            required
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                                            placeholder="Flagship Toronto"
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Short Code" required>
                                        <input
                                            required
                                            value={form.code}
                                            onChange={e => setForm({ ...form, code: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono placeholder:text-slate-300 uppercase"
                                            placeholder="TOR-01"
                                        />
                                    </InputWrapper>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <FormSectionTitle icon={MapPin} title="Store Address" />
                                <div className="grid grid-cols-1 gap-4">
                                    <InputWrapper label="Address Line 1" required>
                                        <input required value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300" placeholder="123 King Street West" />
                                    </InputWrapper>
                                    <InputWrapper label="Address Line 2 (Optional)">
                                        <input value={form.address2} onChange={e => setForm({ ...form, address2: e.target.value })} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300" placeholder="Suite 400" />
                                    </InputWrapper>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputWrapper label="City" required>
                                            <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300" placeholder="Toronto" />
                                        </InputWrapper>
                                        <InputWrapper label="Province" required>
                                            <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]">
                                                <option>Ontario</option>
                                                <option>British Columbia</option>
                                                <option>Alberta</option>
                                                <option>Quebec</option>
                                            </select>
                                        </InputWrapper>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputWrapper label="Postal Code" required>
                                            <input required value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono uppercase placeholder:text-slate-300" placeholder="M5V 1J2" />
                                        </InputWrapper>
                                        <InputWrapper label="Country" required>
                                            <input disabled value={form.country} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm opacity-60 cursor-not-allowed" />
                                        </InputWrapper>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputWrapper label="Phone" required>
                                            <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300" placeholder="+1 (416) 000-0000" />
                                        </InputWrapper>
                                        <InputWrapper label="Email" required>
                                            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300" placeholder="store@brand.com" />
                                        </InputWrapper>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <FormSectionTitle icon={ImageIcon} title="Store Branding" />
                                <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30 flex flex-col items-center justify-center group hover:border-emerald-400 hover:bg-emerald-50/20 transition-all cursor-pointer">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-slate-100">
                                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                                    </div>
                                    <p className="text-sm font-black text-slate-900">Upload Store Logo</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, SVG or JPG (Max 2MB)</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <FormSectionTitle icon={Coins} title="Payment Terms" />
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'INHERIT_BRAND', label: 'Inherit Brand' },
                                            { id: 'PREPAID', label: 'Prepaid' },
                                            { id: 'NET_DAYS', label: 'Net Days' },
                                            { id: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setForm({ ...form, paymentTerms: opt.id })}
                                                className={`flex items-center gap-3 px-4 py-4 rounded-2xl border text-left transition-all ${form.paymentTerms === opt.id
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.paymentTerms === opt.id ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300'
                                                    }`}>
                                                    {form.paymentTerms === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {form.paymentTerms === 'NET_DAYS' && (
                                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                                            <InputWrapper label="Net Days (Maturity Period)">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        value={form.netDays}
                                                        onChange={e => setForm({ ...form, netDays: parseInt(e.target.value) || 0 })}
                                                        className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center"
                                                        min="1"
                                                    />
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Days after invoice</span>
                                                </div>
                                            </InputWrapper>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <FormSectionTitle icon={Shield} title="Tax Configuration" />
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'INHERIT_BRAND', label: 'Inherit Global Policy' },
                                            { id: 'OVERRIDE', label: 'Custom Override' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setForm({ ...form, taxSetup: opt.id })}
                                                className={`flex-1 flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${form.taxSetup === opt.id
                                                    ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-100'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                                {form.taxSetup === opt.id && <Check className="w-5 h-5" />}
                                            </button>
                                        ))}
                                    </div>

                                    {form.taxSetup === 'OVERRIDE' && (
                                        <div className="p-8 bg-amber-50/20 border border-amber-200/50 rounded-3xl space-y-6 animate-in slide-in-from-top-2 duration-300 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Shield className="w-24 h-24 text-amber-500" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                                                <InputWrapper label="Province-based Tax Scheme">
                                                    <select
                                                        value={form.taxScheme}
                                                        onChange={e => setForm({ ...form, taxScheme: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23b45309%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem] text-amber-900"
                                                    >
                                                        <option>HST (Ontario)</option>
                                                        <option>GST + PST (BC)</option>
                                                        <option>QST (Quebec)</option>
                                                        <option>Manual Override</option>
                                                    </select>
                                                </InputWrapper>
                                                <InputWrapper label="Operational Tax Rate">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={form.taxRate}
                                                            onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                                                            className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-amber-900 pr-10"
                                                            step="0.01"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 font-black text-sm">%</span>
                                                    </div>
                                                </InputWrapper>
                                            </div>
                                            <p className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 p-3 rounded-xl border border-amber-100">
                                                <Info className="w-3.5 h-3.5" />
                                                Custom override will bypass brand-level tax inheritance for this store.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/30 sticky bottom-0 z-10 font-[family-name:var(--font-geist-sans)]">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-6 py-3 bg-white text-slate-600 rounded-2xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddStore}
                                className="px-10 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-2 group"
                            >
                                <Check className="w-5 h-5 group-hover:scale-110 transition-transform text-emerald-400" />
                                Create Store Node
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Store Modal */}
            {editingStore && (
                <EditStoreModal
                    store={editingStore}
                    brand={brand}
                    onClose={() => setEditingStore(null)}
                    onSave={handleUpdateStore}
                />
            )}
        </div>
    );
}

// ─── TAB: Users ─────────────────────────────────────────────────────────────────

function UsersSection() {
    const [users, setUsers] = useState<(UserType & { storeAccess: string })[]>(MOCK_USERS);
    const [userToDisable, setUserToDisable] = useState<(UserType & { storeAccess: string }) | null>(null);
    const [inviteRateLimitWarning, setInviteRateLimitWarning] = useState<string | null>(null);
    const [inviteHistory, setInviteHistory] = useState<Record<string, number[]>>({});
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [enrollForm, setEnrollForm] = useState({
        name: '',
        email: '',
        userType: 'Internal',
        role: 'STORE_MANAGER',
        storeAccess: 'All Stores'
    });

    const handleEnrollMember = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: UserType & { storeAccess: string } = {
            id: `user-${Date.now()}`,
            name: enrollForm.name,
            email: enrollForm.email,
            userType: enrollForm.userType,
            role: enrollForm.role as any,
            storeAccess: enrollForm.storeAccess,
            storeIds: enrollForm.storeAccess === 'All Stores' ? [] : ['store-01'],
            tenantId: 'tenant-demo',
            status: 'Active',
            lastLogin: new Date().toISOString()
        };
        setUsers([newUser, ...users]);
        setIsEnrollModalOpen(false);
        setEnrollForm({ name: '', email: '', userType: 'Internal', role: 'STORE_MANAGER', storeAccess: 'All Stores' });
    };

    const handleDisableUser = () => {
        if (!userToDisable) return;
        setUsers(users.map(u => u.id === userToDisable.id ? { ...u, status: 'Inactive' } : u));
        setUserToDisable(null);
    };

    const handleResendInvite = (userId: string) => {
        const now = Date.now();
        const history = inviteHistory[userId] || [];
        const recent = history.filter(t => now - t < 30000); // 30 second window

        if (recent.length >= 2) {
            setInviteRateLimitWarning("Security Rate Limit: You've resent invitations too many times. Please wait 30 seconds before trying again.");
            setTimeout(() => setInviteRateLimitWarning(null), 5000);
            return;
        }

        setInviteHistory({ ...inviteHistory, [userId]: [...recent, now] });
        // Simulation of success
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {inviteRateLimitWarning && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-sm font-bold leading-tight">{inviteRateLimitWarning}</p>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">User Management</h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Control brand-level and store-level access for your enterprise team.
                    </p>
                </div>
                <button
                    onClick={() => setIsEnrollModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                    <Plus className="w-5 h-5" />
                    Enroll New Member
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Team Members</h3>
                        <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                            {users.length} Records Found
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1100px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify / Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Access</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900">{user.name}</span>
                                            <span className="text-xs text-slate-400 font-bold mt-0.5">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-black rounded-lg uppercase tracking-tight">
                                            {user.userType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl w-fit">
                                            <Store className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{user.storeAccess}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <MiniStatusBadge status={user.status} />
                                    </td>
                                    <td className="px-6 py-6 text-xs font-black text-slate-400 tabular-nums uppercase tracking-tighter">
                                        {formatDate(user.lastLogin)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => handleResendInvite(user.id)}
                                                className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all group/btn"
                                                title="Resend Invitation"
                                            >
                                                <Mail className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                            <button
                                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group/btn"
                                                title="Force Local Password Reset"
                                            >
                                                <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                                            </button>
                                            <button
                                                onClick={() => setUserToDisable(user)}
                                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group/btn"
                                                title="Disable Profile"
                                            >
                                                <Ban className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Disable Confirmation Modal */}
            {userToDisable && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-10 space-y-8">
                            <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center border border-red-100 mx-auto shadow-inner">
                                <ShieldAlert className="w-10 h-10 text-red-600" />
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deactivate Member?</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed px-6">
                                    Are you certain you wish to disable access for <span className="font-black text-slate-900 underline decoration-red-200">{userToDisable.name}</span>?
                                    All current sessions will be terminated.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDisableUser}
                                    className="w-full py-4 bg-red-600 text-white rounded-[1.25rem] text-sm font-black hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-[0.98]"
                                >
                                    Confirm Deactivation
                                </button>
                                <button
                                    onClick={() => setUserToDisable(null)}
                                    className="w-full py-4 bg-white text-slate-500 rounded-[1.25rem] text-sm font-black border border-slate-100 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Enroll New Member Modal */}
            {isEnrollModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20 font-[family-name:var(--font-geist-sans)]">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black">
                                    <UserPlus className="w-5 h-5 text-slate-900" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Enroll Member</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Brand Team Addition</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEnrollMember} className="p-8 space-y-6">
                            <InputWrapper label="Full Name" required>
                                <input
                                    required
                                    value={enrollForm.name}
                                    onChange={e => setEnrollForm({ ...enrollForm, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-bold"
                                    placeholder="e.g. Michael Scott"
                                />
                            </InputWrapper>
                            <InputWrapper label="Email Address" required>
                                <input
                                    required
                                    type="email"
                                    value={enrollForm.email}
                                    onChange={e => setEnrollForm({ ...enrollForm, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                                    placeholder="michael@brand.com"
                                />
                            </InputWrapper>
                            <div className="grid grid-cols-2 gap-4">
                                <InputWrapper label="User Type" required>
                                    <select
                                        value={enrollForm.userType}
                                        onChange={e => setEnrollForm({ ...enrollForm, userType: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]"
                                    >
                                        <option>Internal</option>
                                        <option>External</option>
                                    </select>
                                </InputWrapper>
                                <InputWrapper label="System Role" required>
                                    <select
                                        value={enrollForm.role}
                                        onChange={e => setEnrollForm({ ...enrollForm, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]"
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="STORE_MANAGER">STORE MANAGER</option>
                                        <option value="EMPLOYEE">EMPLOYEE</option>
                                    </select>
                                </InputWrapper>
                            </div>
                            <InputWrapper label="Initial Store Access" required>
                                <select
                                    value={enrollForm.storeAccess}
                                    onChange={e => setEnrollForm({ ...enrollForm, storeAccess: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]"
                                >
                                    <option>All Stores</option>
                                    <option>Primary Node</option>
                                    <option>Warehouse Only</option>
                                </select>
                            </InputWrapper>

                            <div className="flex gap-3 pt-4 font-black">
                                <button
                                    type="button"
                                    onClick={() => setIsEnrollModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-white text-slate-600 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    Confirm Enrollment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── TAB: Audit Log ─────────────────────────────────────────────────────────────

function AuditLogSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const itemsPerPage = 5;

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    const filteredLogs = MOCK_AUDIT_LOG
        .filter(log =>
            log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">System Audit Lineage</h2>
                    <p className="text-sm text-slate-500 font-medium">Immutable record of all platform-level operations.</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by event, actor or details..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:content-['']">
                {paginatedLogs.map((log) => {
                    const isExpanded = expandedIds.has(log.id);
                    return (
                        <div key={log.id} className="relative group">
                            {/* Line Dot */}
                            <div className="absolute -left-[2.05rem] top-2">
                                <EventTimelineDot event={log.event} />
                            </div>

                            <div className={`bg-white border rounded-3xl transition-all duration-300 overflow-hidden ${isExpanded ? 'border-emerald-200 shadow-xl shadow-emerald-50' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getEventStyles(log.event)}`}>
                                                    {log.event.replace(/_/g, ' ')}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                                                    <span>by</span>
                                                    <span className="text-slate-900">{log.actor}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                                {log.details}
                                            </p>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                                            <span className="text-[11px] font-black text-slate-400 tabular-nums uppercase tracking-tighter">
                                                {formatTimestamp(log.timestamp)}
                                            </span>
                                            <button
                                                onClick={() => toggleExpand(log.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                {isExpanded ? <Code className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                                                {isExpanded ? 'Hide Payload' : 'View Payload'}
                                                {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-6 pt-6 border-t border-emerald-50 animate-in slide-in-from-top-2 duration-300">
                                            <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden group/code shadow-inner">
                                                <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                                                    <Terminal className="w-12 h-12 text-emerald-500" />
                                                </div>
                                                <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto text-emerald-400/90 custom-scrollbar">
                                                    <code>{JSON.stringify(log.payload, null, 2)}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredLogs.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Search className="w-6 h-6 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900">No matching events found</p>
                            <p className="text-xs text-slate-500 font-medium">Try adjusting your search query or event filters.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Lineage Control */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 bg-white hover:bg-slate-50 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-1.5 px-4">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 bg-white hover:bg-slate-50 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

function EventTimelineDot({ event }: { event: string }) {
    let color = 'bg-slate-200 border-slate-300';
    if (event.includes('CREATED')) color = 'bg-emerald-500 border-emerald-200';
    if (event.includes('ENABLED') || event.includes('PURCHASED') || event.includes('UPDATED')) color = 'bg-blue-500 border-blue-200';
    if (event.includes('SUSPENDED') || event.includes('DEACTIVATED')) color = 'bg-red-500 border-red-200';
    if (event.includes('LOGO') || event.includes('TAX')) color = 'bg-amber-500 border-amber-200';

    return (
        <div className={`w-7 h-7 rounded-full border-4 flex items-center justify-center ring-4 ring-white shadow-sm ${color}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </div>
    );
}

function getEventStyles(event: string) {
    if (event.includes('CREATED')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (event.includes('ENABLED') || event.includes('PURCHASED') || event.includes('UPDATED')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (event.includes('SUSPENDED') || event.includes('DEACTIVATED')) return 'bg-red-50 text-red-700 border-red-100';
    if (event.includes('LOGO') || event.includes('TAX')) return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-slate-100 text-slate-600 border-slate-200';
}

// ─── Shared Sub-components ──────────────────────────────────────────────────────

function MiniStatusBadge({ status }: { status: string }) {
    const isActive = status === 'Active';
    const isPending = status === 'Pending';

    let classes = 'bg-red-50 text-red-700 border-red-200';
    if (isActive) classes = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (isPending) classes = 'bg-amber-50 text-amber-700 border-amber-200';

    let dotColor = 'bg-red-500';
    if (isActive) dotColor = 'bg-emerald-500';
    if (isPending) dotColor = 'bg-amber-500';

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} />
            {status}
        </span>
    );
}

function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        ADMIN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        STORE_MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
        EMPLOYEE: 'bg-slate-100 text-slate-800 border-slate-200',
        POS_USER: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[role] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {role.replace(/_/g, ' ')}
        </span>
    );
}



// ─── MODAL: Edit Brand ──────────────────────────────────────────────────────────

interface EditBrandModalProps {
    brand: Brand;
    onClose: () => void;
    onSave: (data: Brand) => void;
}

function EditBrandModal({ brand, onClose, onSave }: EditBrandModalProps) {
    const [formData, setFormData] = useState({ ...brand });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API delay
        setTimeout(() => {
            onSave(formData);
            setIsSaving(false);
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20 font-[family-name:var(--font-geist-sans)]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                            <Pencil className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Brand Details</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configuration Engine</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form id="edit-brand-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 bg-white">
                    {/* Identity Section */}
                    <div className="space-y-6">
                        <FormSectionTitle icon={Building2} title="Trade Identity" />
                        <div className="grid grid-cols-1 gap-6">
                            <InputWrapper label="Brand Legal Name" required>
                                <input
                                    required
                                    value={formData.brandLegalName}
                                    onChange={e => setFormData({ ...formData, brandLegalName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                                />
                            </InputWrapper>
                            <div className="grid grid-cols-2 gap-6">
                                <InputWrapper label="Brand Display Name" required>
                                    <input
                                        required
                                        value={formData.brandName}
                                        onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </InputWrapper>
                                <InputWrapper label="Trade Name" required>
                                    <input
                                        required
                                        value={formData.tradeName}
                                        onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </InputWrapper>
                            </div>
                        </div>
                    </div>

                    {/* Globalization Section */}
                    <div className="space-y-6">
                        <FormSectionTitle icon={Globe} title="Globalization & Locale" />
                        <div className="grid grid-cols-2 gap-6">
                            <InputWrapper label="Primary Timezone" required>
                                <select
                                    value={formData.timezone}
                                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]"
                                >
                                    <option>Eastern Standard Time (EST)</option>
                                    <option>Pacific Standard Time (PST)</option>
                                    <option>Mountain Standard Time (MST)</option>
                                    <option>Central Standard Time (CST)</option>
                                </select>
                            </InputWrapper>
                            <InputWrapper label="Base Currency" required>
                                <select
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]"
                                >
                                    <option>CAD ($)</option>
                                    <option>USD ($)</option>
                                    <option>GBP (£)</option>
                                    <option>EUR (€)</option>
                                </select>
                            </InputWrapper>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-6">
                        <FormSectionTitle icon={Mail} title="Administrative Contact" />
                        <div className="grid grid-cols-2 gap-6">
                            <InputWrapper label="Root Admin Email" required>
                                <input
                                    type="email"
                                    required
                                    value={formData.primaryContact}
                                    onChange={e => setFormData({ ...formData, primaryContact: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </InputWrapper>
                            <InputWrapper label="Emergency Phone" required>
                                <input
                                    required
                                    value={formData.contactPhone}
                                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                                />
                            </InputWrapper>
                        </div>
                        <InputWrapper label="Headquarters Address" required>
                            <textarea
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                            />
                        </InputWrapper>
                    </div>

                    {/* Financial Defaults Section */}
                    <div className="space-y-6">
                        <FormSectionTitle icon={Coins} title="Global Financial Defaults" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputWrapper label="Default Brand Payment Terms" required>
                                <select
                                    value={formData.defaultPaymentTerms}
                                    onChange={e => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]"
                                >
                                    <option>Net 15</option>
                                    <option>Net 30</option>
                                    <option>Net 45</option>
                                    <option>Net 60</option>
                                    <option>Prepaid</option>
                                    <option>Due on Receipt</option>
                                </select>
                            </InputWrapper>
                            <div className="grid grid-cols-2 gap-4">
                                <InputWrapper label="Default Tax Scheme" required>
                                    <select
                                        value={formData.defaultTaxScheme}
                                        onChange={e => setFormData({ ...formData, defaultTaxScheme: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]"
                                    >
                                        <option>HST (Ontario)</option>
                                        <option>GST + PST (BC)</option>
                                        <option>GST only (Alberta)</option>
                                        <option>QST (Quebec)</option>
                                    </select>
                                </InputWrapper>
                                <InputWrapper label="Base Rate" required>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.defaultTaxRate}
                                            onChange={e => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-8"
                                            step="0.01"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                                    </div>
                                </InputWrapper>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/30 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-3 bg-white text-slate-600 rounded-2xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        form="edit-brand-form"
                        type="submit"
                        disabled={isSaving}
                        className="px-10 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-2 group min-w-[160px] justify-center"
                    >
                        {isSaving ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Check className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MODAL: Edit Store ──────────────────────────────────────────────────────────

interface EditStoreModalProps {
    store: StoreType;
    brand: Brand;
    onClose: () => void;
    onSave: (data: StoreType) => void;
}

function EditStoreModal({ store, brand, onClose, onSave }: EditStoreModalProps) {
    const [formData, setFormData] = useState({
        ...store,
        paymentTermType: store.paymentTerms.startsWith('Net') ? 'NET_DAYS' : (store.paymentTerms === 'Prepaid' ? 'PREPAID' : (store.paymentTerms === 'Due on Receipt' ? 'DUE_ON_RECEIPT' : 'INHERIT_BRAND')),
        netDays: store.paymentTerms.startsWith('Net') ? parseInt(store.paymentTerms.match(/\d+/)?.[0] || '30') : 30,
        taxSetup: store.taxProfile === 'Inherit' ? 'INHERIT_BRAND' : 'OVERRIDE',
        taxScheme: store.taxScheme || 'HST (Ontario)',
        taxRate: store.taxRate || 13,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const updatedStore: StoreType = {
            ...store,
            name: formData.name,
            code: formData.code,
            city: formData.city,
            province: formData.province,
            paymentTerms: formData.paymentTermType === 'INHERIT_BRAND' ? brand.defaultPaymentTerms : (formData.paymentTermType === 'NET_DAYS' ? `Net ${formData.netDays}` : formData.paymentTermType),
            taxProfile: formData.taxSetup === 'INHERIT_BRAND' ? 'Inherit' : 'Override',
        };

        setTimeout(() => {
            onSave(updatedStore);
            setIsSaving(false);
        }, 600);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Pencil className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Store Node</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{store.code}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form id="edit-store-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                    <div className="space-y-6">
                        <FormSectionTitle icon={Building2} title="Basic Information" />
                        <div className="grid grid-cols-2 gap-6">
                            <InputWrapper label="Store Name" required>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                            </InputWrapper>
                            <InputWrapper label="Short Code" required>
                                <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase" />
                            </InputWrapper>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <FormSectionTitle icon={MapPin} title="Localization" />
                        <div className="grid grid-cols-2 gap-6">
                            <InputWrapper label="City" required>
                                <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                            </InputWrapper>
                            <InputWrapper label="Province" required>
                                <select value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem]">
                                    <option>Ontario</option>
                                    <option>British Columbia</option>
                                    <option>Alberta</option>
                                    <option>Quebec</option>
                                </select>
                            </InputWrapper>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <FormSectionTitle icon={Coins} title="Payment Terms" />
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'INHERIT_BRAND', label: 'Inherit Brand' },
                                { id: 'PREPAID', label: 'Prepaid' },
                                { id: 'NET_DAYS', label: 'Net Days' },
                                { id: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentTermType: opt.id as any })}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-2xl border text-left transition-all ${formData.paymentTermType === opt.id
                                        ? 'bg-slate-900 border-slate-900 text-white'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.paymentTermType === opt.id ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300'}`}>
                                        {formData.paymentTermType === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        {formData.paymentTermType === 'NET_DAYS' && (
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                <InputWrapper label="Net Days">
                                    <input type="number" value={formData.netDays} onChange={e => setFormData({ ...formData, netDays: parseInt(e.target.value) || 0 })} className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-center" min="1" />
                                </InputWrapper>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <FormSectionTitle icon={Shield} title="Tax Configuration" />
                        <div className="flex gap-4">
                            {[
                                { id: 'INHERIT_BRAND', label: 'Inherit Global Policy' },
                                { id: 'OVERRIDE', label: 'Custom Override' },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, taxSetup: opt.id as any })}
                                    className={`flex-1 flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${formData.taxSetup === opt.id
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg'
                                        : 'bg-white border-slate-200 text-slate-600'
                                        }`}
                                >
                                    <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                    {formData.taxSetup === opt.id ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                                </button>
                            ))}
                        </div>
                        {formData.taxSetup === 'OVERRIDE' && (
                            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl grid grid-cols-2 gap-6">
                                <InputWrapper label="Tax Scheme">
                                    <select value={formData.taxScheme} onChange={e => setFormData({ ...formData, taxScheme: e.target.value })} className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm font-bold text-amber-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%200%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23b45309%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem] text-amber-900 border-amber-200">
                                        <option>HST (Ontario)</option>
                                        <option>GST + PST (BC)</option>
                                        <option>QST (Quebec)</option>
                                        <option>Manual Override</option>
                                    </select>
                                </InputWrapper>
                                <InputWrapper label="Tax Rate %">
                                    <input type="number" step="0.01" value={formData.taxRate} onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm font-black text-amber-900" />
                                </InputWrapper>
                            </div>
                        )}
                    </div>
                </form>

                <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/30 sticky bottom-0 z-10">
                    <button onClick={onClose} disabled={isSaving} className="px-6 py-3 bg-white text-slate-600 rounded-2xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
                    <button form="edit-store-form" type="submit" disabled={isSaving} className="px-10 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all flex items-center gap-2">
                        {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 text-emerald-400" />Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
