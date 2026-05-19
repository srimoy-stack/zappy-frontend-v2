'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, ChevronRight, Building2, Activity, Shield, LayoutGrid,
    Store, Users, MessageSquare, FileText, Ban, RefreshCw, LogIn, Pencil,
} from 'lucide-react';

import { Brand, TenantStatus, TENANT_STATUS_CONFIG } from '@/shared/types/tenant';
import { UserType } from '@/shared/types/auth';
import { cn } from '@/utils';

import {
    OverviewTab,
    ModulesTab,
    StoresTab,
    UsersTab,
    RolesTab,
    CommunicationTab,
    AuditTab,
} from '@/modules/platform/components/tenantDetail';

// ─── Tab Config ─────────────────────────────────────────────────────────────

type TenantTab = 'overview' | 'modules' | 'stores' | 'users' | 'roles' | 'communication' | 'audit';

interface TabDef {
    id: TenantTab;
    label: string;
    icon: any;
}

const TABS: TabDef[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'modules', label: 'Modules', icon: LayoutGrid },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'audit', label: 'Audit', icon: FileText },
];

// ─── Mock Data (dev fallback — replace with API) ────────────────────────────

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
    status: 'Operational',
    createdDate: '2025-06-15',
    createdBy: 'Platform Admin',
    totalStores: 12,
    totalUsers: 28,
    province: 'Ontario',
    modulesPurchasedCount: 5,
    enabledModules: ['pos', 'inventory', 'online-ordering', 'reports', 'email-campaigns'],
    plan: 'Enterprise',
    slug: 'acme-pizza',
    lightLogo: '',
    darkLogo: '',
    defaultPaymentTerms: 'Net 30',
    defaultTaxScheme: 'HST (Ontario)',
    defaultTaxRate: 13,
    lastActivity: '2026-05-07T18:30:00Z',
    onboardingProgress: 100,
};

const MOCK_STORES = [
    { id: 'store-01', name: 'Downtown Toronto', code: 'DT-001', status: 'Active' as const, city: 'Toronto', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Set', tenantId: 'brand-001', timezone: 'EST' },
    { id: 'store-02', name: 'Midtown', code: 'MT-002', status: 'Active' as const, city: 'Toronto', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Default', tenantId: 'brand-001', timezone: 'EST' },
    { id: 'store-03', name: 'Scarborough', code: 'SC-003', status: 'Active' as const, city: 'Scarborough', province: 'Ontario', paymentTerms: 'Net 15', taxProfile: 'Override', logoStatus: 'Set', tenantId: 'brand-001', timezone: 'EST' },
    { id: 'store-04', name: 'Mississauga Hub', code: 'MS-004', status: 'Inactive' as const, city: 'Mississauga', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Default', tenantId: 'brand-001', timezone: 'EST' },
    { id: 'store-05', name: 'North York', code: 'NY-005', status: 'Active' as const, city: 'North York', province: 'Ontario', paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Set', tenantId: 'brand-001', timezone: 'EST' },
];

const MOCK_USERS = [
    { id: 'u-1', name: 'John Doe', email: 'john@acmepizza.com', userType: UserType.BRAND_ADMIN, role: 'Brand Admin', storeAccess: 'All Locations', storeIds: [] as string[], status: 'Active' as const, lastLogin: '2026-05-07', createdAt: '2025-06-15' },
    { id: 'u-2', name: 'Sarah Chen', email: 'sarah@acmepizza.com', userType: UserType.MANAGER, role: 'Store Manager', storeAccess: 'Downtown Toronto', storeIds: ['store-01'], status: 'Active' as const, lastLogin: '2026-05-07', createdAt: '2025-07-05' },
    { id: 'u-3', name: 'Mike Patel', email: 'mike@acmepizza.com', userType: UserType.MANAGER, role: 'Store Manager', storeAccess: 'Midtown', storeIds: ['store-02'], status: 'Active' as const, lastLogin: '2026-05-06', createdAt: '2025-07-10' },
    { id: 'u-4', name: 'Lisa Wong', email: 'lisa@acmepizza.com', userType: UserType.POS_USER, role: 'POS User', storeAccess: 'Scarborough', storeIds: ['store-03'], status: 'Active' as const, lastLogin: '2026-05-06', createdAt: '2025-08-01' },
    { id: 'u-5', name: 'Carlos Rivera', email: 'carlos@acmepizza.com', userType: UserType.POS_USER, role: 'POS User', storeAccess: 'North York', storeIds: ['store-05'], status: 'Inactive' as const, lastLogin: '2026-01-15', createdAt: '2025-08-15' },
];

const MOCK_AUDIT = [
    { id: 'a-1', event: 'TENANT_CREATED', actor: 'Platform Admin', timestamp: '2025-06-15T09:00:00Z', details: 'Tenant Acme Pizza Co. created and provisioned.', payload: { brandName: 'Acme Pizza Co.', status: 'Provisioned' } },
    { id: 'a-2', event: 'MODULE_ENABLED', actor: 'Platform Admin', timestamp: '2025-06-15T09:30:00Z', details: 'Module "Point of Sale" enabled for tenant.', payload: { moduleId: 'pos', enabled: true } },
    { id: 'a-3', event: 'MODULE_ENABLED', actor: 'Platform Admin', timestamp: '2025-06-15T09:31:00Z', details: 'Module "Inventory" enabled for tenant.', payload: { moduleId: 'inventory', enabled: true } },
    { id: 'a-4', event: 'USER_CREATED', actor: 'Platform Admin', timestamp: '2025-06-15T10:00:00Z', details: 'Brand Admin "John Doe" provisioned with invite.', payload: { userId: 'u-1', userType: 'BRAND_ADMIN', email: 'john@acmepizza.com' } },
    { id: 'a-5', event: 'STORE_CREATED', actor: 'John Doe', timestamp: '2025-06-20T14:30:00Z', details: 'Store "Downtown Toronto" (DT-001) created.', payload: { storeId: 'store-01', code: 'DT-001' } },
    { id: 'a-6', event: 'USER_CREATED', actor: 'John Doe', timestamp: '2025-07-05T11:20:00Z', details: 'Store Manager "Sarah Chen" created and assigned.', payload: { userId: 'u-2', userType: 'STORE_MANAGER', storeIds: ['store-01'] } },
    { id: 'a-7', event: 'ENTITLEMENT_CHANGED', actor: 'Platform Admin', timestamp: '2025-08-10T14:00:00Z', details: 'Module "Email Campaigns" enabled for tenant.', payload: { moduleId: 'email-campaigns', action: 'enabled' } },
    { id: 'a-8', event: 'IMPERSONATION_START', actor: 'Support Agent', timestamp: '2026-03-15T16:00:00Z', details: 'Impersonation session started for Brand Admin.', payload: { targetUser: 'john@acmepizza.com', reason: 'Support ticket #4421' } },
    { id: 'a-9', event: 'COMMUNICATION_CONFIG', actor: 'John Doe', timestamp: '2026-04-01T12:00:00Z', details: 'Email provider changed from inherited to SendGrid.', payload: { provider: 'sendgrid', senderEmail: 'orders@acmepizza.com' } },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function TenantDetailPage() {
    const params = useParams();
    const router = useRouter();
    const tenantId = params?.tenantId as string | undefined;

    const [activeTab, setActiveTab] = useState<TenantTab>('overview');
    const [brand, setBrand] = useState<Brand>(MOCK_BRAND);

    // In real app, fetch from API on mount
    useEffect(() => {
        // TODO: const data = await api.getTenant(tenantId);
        setBrand(MOCK_BRAND);
    }, [tenantId]);

    const handleSuspend = () => {
        if (!confirm(`Are you sure you want to suspend ${brand.brandName}? All store operations will be halted.`)) return;
        setBrand(prev => ({ ...prev, status: 'Suspended' }));
    };

    const handleReactivate = () => {
        if (!confirm(`Reactivate ${brand.brandName}?`)) return;
        setBrand(prev => ({ ...prev, status: 'Operational' }));
    };

    const statusConfig = TENANT_STATUS_CONFIG[brand.status] || TENANT_STATUS_CONFIG.Draft;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-32 px-2 pt-2">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <button onClick={() => router.push('/platform/tenants')} className="flex items-center gap-1 hover:text-slate-900 transition-colors group">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    Tenants
                </button>
                <ChevronRight size={10} className="opacity-30" />
                <span className="text-slate-900">{brand.brandName}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                        <Building2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{brand.brandName}</h1>
                            <span className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                                statusConfig.bgColor, statusConfig.color, statusConfig.borderColor
                            )}>
                                <div className={cn('w-1.5 h-1.5 rounded-full', brand.status === 'Operational' ? 'bg-emerald-500 animate-pulse' : 'bg-current')} />
                                {brand.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                            <span>{brand.tradeName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">{brand.slug}</span>
                            <span className="text-slate-300">•</span>
                            <span>Since {formatDate(brand.createdDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/platform/tenants/${tenantId}/impersonate`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black hover:bg-amber-100 transition-all"
                    >
                        <LogIn size={14} /> Impersonate
                    </button>
                    <button
                        onClick={() => router.push(`/platform/tenants/${tenantId}/config`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-black hover:bg-slate-50 transition-all"
                    >
                        <Pencil size={14} /> Edit Brand
                    </button>
                    {brand.status === 'Suspended' ? (
                        <button onClick={handleReactivate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all">
                            <RefreshCw size={14} /> Reactivate
                        </button>
                    ) : (
                        <button onClick={handleSuspend}
                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-black hover:bg-rose-100 transition-all">
                            <Ban size={14} /> Suspend
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap',
                                    isActive
                                        ? 'text-slate-900 border-slate-900'
                                        : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-200'
                                )}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="pt-2">
                {activeTab === 'overview' && <OverviewTab brand={brand} />}
                {activeTab === 'modules' && <ModulesTab tenantId={tenantId || ''} initialPaths={brand.enabledModules || []} />}
                {activeTab === 'stores' && <StoresTab tenantId={tenantId || ''} stores={MOCK_STORES} />}
                {activeTab === 'users' && (
                    <UsersTab
                        tenantId={tenantId || ''}
                        users={MOCK_USERS}
                        stores={MOCK_STORES.map(s => ({ id: s.id, name: s.name }))}
                    />
                )}
                {activeTab === 'roles' && <RolesTab tenantId={tenantId || ''} />}
                {activeTab === 'communication' && <CommunicationTab tenantId={tenantId || ''} config={brand.communicationConfig} />}
                {activeTab === 'audit' && <AuditTab tenantId={tenantId || ''} events={MOCK_AUDIT} />}
            </div>
        </div>
    );
}
