'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2, Store as StoreIcon, Settings, Activity, LayoutGrid, Users, Shield,
    MessageSquare, FileText,
} from 'lucide-react';

import { Brand } from '@/shared/types/tenant';
import { UserType } from '@/shared/types/auth';
import { useAuth } from '@/shared/contexts/AuthContext';
import { cn } from '@/utils';

import { storeService } from '@/shared/api/services/store.service';
import { tenantService } from '@/shared/api';
import type { Store } from '@/shared/types/store';

import {
    OverviewTab,
    ModulesTab,
    StoresTab,
    UsersTab,
    RolesTab,
    AuditTab,
} from '@/modules/platform/components/tenantDetail';
import { BrandCommunicationTab } from '@/modules/platform/components/tenantDetail/BrandCommunicationTab';

// ─── Top-Level Tab Config ───────────────────────────────────────────────────

type TopTab = 'brand' | 'stores';

const TOP_TABS: { id: TopTab; label: string; icon: any }[] = [
    { id: 'brand', label: 'Brand Settings', icon: Building2 },
    { id: 'stores', label: 'Stores', icon: StoreIcon },
];

// ─── Brand Settings Sub-Tab Config ──────────────────────────────────────────

type BrandSubTab = 'overview' | 'modules' | 'users' | 'roles' | 'communication' | 'audit';

const BRAND_SUB_TABS: { id: BrandSubTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'modules', label: 'Modules', icon: LayoutGrid },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'audit', label: 'Audit', icon: FileText },
];

// ─── Mock Data (dev fallback) ───────────────────────────────────────────────

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



const MOCK_USERS = [
    { id: 'u-1', name: 'John Doe', email: 'john@acmepizza.com', userType: UserType.BRAND_ADMIN, role: 'Brand Admin', storeAccess: 'All Locations', storeIds: [] as string[], status: 'Active' as const, lastLogin: '2026-05-07', createdAt: '2025-06-15' },
    { id: 'u-2', name: 'Sarah Chen', email: 'sarah@acmepizza.com', userType: UserType.MANAGER, role: 'Store Manager', storeAccess: 'Downtown Toronto', storeIds: ['store-01'], status: 'Active' as const, lastLogin: '2026-05-07', createdAt: '2025-07-05' },
    { id: 'u-3', name: 'Mike Patel', email: 'mike@acmepizza.com', userType: UserType.MANAGER, role: 'Store Manager', storeAccess: 'Midtown', storeIds: ['store-02'], status: 'Active' as const, lastLogin: '2026-05-06', createdAt: '2025-07-10' },
    { id: 'u-4', name: 'Lisa Wong', email: 'lisa@acmepizza.com', userType: UserType.POS_USER, role: 'POS User', storeAccess: 'Scarborough', storeIds: ['store-03'], status: 'Active' as const, lastLogin: '2026-05-06', createdAt: '2025-08-01' },
];

const MOCK_AUDIT = [
    { id: 'a-1', event: 'TENANT_CREATED', actor: 'Platform Admin', timestamp: '2025-06-15T09:00:00Z', details: 'Tenant Acme Pizza Co. created and provisioned.', payload: { brandName: 'Acme Pizza Co.', status: 'Provisioned' } },
    { id: 'a-2', event: 'MODULE_ENABLED', actor: 'Platform Admin', timestamp: '2025-06-15T09:30:00Z', details: 'Module "Point of Sale" enabled for tenant.', payload: { moduleId: 'pos', enabled: true } },
    { id: 'a-3', event: 'USER_CREATED', actor: 'Platform Admin', timestamp: '2025-06-15T10:00:00Z', details: 'Brand Admin "John Doe" provisioned with invite.', payload: { userId: 'u-1', userType: 'BRAND_ADMIN', email: 'john@acmepizza.com' } },
    { id: 'a-4', event: 'STORE_CREATED', actor: 'John Doe', timestamp: '2025-06-20T14:30:00Z', details: 'Store "Downtown Toronto" (DT-001) created.', payload: { storeId: 'store-01', code: 'DT-001' } },
    { id: 'a-5', event: 'ENTITLEMENT_CHANGED', actor: 'Platform Admin', timestamp: '2025-08-10T14:00:00Z', details: 'Module "Email Campaigns" enabled for tenant.', payload: { moduleId: 'email-campaigns', action: 'enabled' } },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { tenantId } = useAuth();
    const router = useRouter();
    const [topTab, setTopTab] = useState<TopTab>('brand');
    const [brandSubTab, setBrandSubTab] = useState<BrandSubTab>('overview');
    const [brand, setBrand] = useState<Brand | null>(null);
    const [users, setUsers] = useState<typeof MOCK_USERS>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch tenant data for the current brand admin's tenant
    useEffect(() => {
        const fetchTenant = async () => {
            if (!tenantId) {
                setBrand(MOCK_BRAND);
                setUsers(MOCK_USERS);
                // Fetch stores from API even with mock brand
                try {
                    const apiStores = await storeService.list(MOCK_BRAND.id);
                    setStores(apiStores);
                } catch { setStores([]); }
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Fetch tenant via the official service (which uses the correct adapter and endpoint)
                const tenantData = await tenantService.get(tenantId);
                
                // Keep the same state update
                setBrand(tenantData);

                // Fetch stores from API
                try {
                    const apiStores = await storeService.list(tenantId);
                    setStores(apiStores);
                } catch { setStores([]); }

                // Map users from API
                const rawUsers = (tenantData as any).users;
                if (rawUsers) {
                    setUsers(rawUsers.map((u: any) => ({
                        id: String(u.id),
                        name: u.name,
                        email: u.email,
                        userType: u.role === 'brand_admin' ? UserType.BRAND_ADMIN : UserType.MANAGER,
                        role: u.role === 'brand_admin' ? 'Brand Admin' : u.role,
                        storeAccess: 'All Locations',
                        storeIds: [],
                        status: 'Active' as const,
                        lastLogin: '',
                        createdAt: '',
                    })));
                } else {
                    setUsers(MOCK_USERS);
                }
            } catch (err) {
                console.error('Failed to fetch tenant:', err);
                setBrand(MOCK_BRAND);
                setUsers(MOCK_USERS);
                try {
                    const apiStores = await storeService.list(MOCK_BRAND.id);
                    setStores(apiStores);
                } catch { setStores([]); }
            } finally {
                setLoading(false);
            }
        };

        fetchTenant();
    }, [tenantId]);

    if (loading || !brand) {
        return (
            <div className="max-w-[1600px] mx-auto space-y-6 pb-32 px-2 pt-2">
                <div className="animate-pulse space-y-6">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                        <div className="space-y-2">
                            <div className="h-7 w-64 bg-slate-200 rounded" />
                            <div className="h-4 w-48 bg-slate-100 rounded" />
                        </div>
                    </div>
                    <div className="h-10 w-full bg-slate-100 rounded" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
                    </div>
                    <div className="h-64 bg-slate-50 rounded-xl" />
                </div>
            </div>
        );
    }

    const resolvedTenantId = tenantId || brand.id;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-32 px-2 pt-2">
            {/* Header */}
            <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                    <Settings className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Manage your brand configuration, stores, and business operations
                    </p>
                </div>
            </div>

            {/* ── Top-Level Tabs ──────────────────────────────────────────── */}
            <div className="border-b border-slate-200">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {TOP_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = topTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setTopTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-widest border-b-3 transition-all whitespace-nowrap',
                                    isActive
                                        ? 'text-slate-900 border-slate-900'
                                        : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-200'
                                )}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Brand Settings Tab Content ──────────────────────────────── */}
            {topTab === 'brand' && (
                <div className="space-y-4">
                    {/* Sub-tabs */}
                    <div className="border-b border-slate-100">
                        <div className="flex items-center gap-1 overflow-x-auto">
                            {BRAND_SUB_TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = brandSubTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setBrandSubTab(tab.id)}
                                        className={cn(
                                            'flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap',
                                            isActive
                                                ? 'text-emerald-700 border-emerald-600'
                                                : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-200'
                                        )}
                                    >
                                        <Icon size={13} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sub-tab Content */}
                    <div className="pt-2">
                        {brandSubTab === 'overview' && (
                            <OverviewTab
                                brand={brand}
                                tenantId={resolvedTenantId}
                                onBrandUpdate={(updates) => setBrand(prev => prev ? ({ ...prev, ...updates }) : prev)}
                            />
                        )}
                        {brandSubTab === 'modules' && (
                            <ModulesTab
                                tenantId={resolvedTenantId}
                                initialPaths={brand.enabledModules || []}
                                readOnly
                            />
                        )}
                        {brandSubTab === 'users' && (
                            <UsersTab
                                tenantId={resolvedTenantId}
                                users={users}
                                stores={stores.map(s => ({ id: s.id, name: s.name }))}
                            />
                        )}
                        {brandSubTab === 'roles' && (
                            <RolesTab tenantId={resolvedTenantId} />
                        )}
                        {brandSubTab === 'communication' && (
                            <BrandCommunicationTab
                                tenantId={resolvedTenantId}
                                campaignEmailConfig={brand.communicationConfig?.email ? {
                                    provider: brand.communicationConfig.email.provider,
                                    senderEmail: brand.communicationConfig.email.senderEmail,
                                    senderName: brand.communicationConfig.email.senderName,
                                } : undefined}
                                config={brand.communicationConfig}
                            />
                        )}
                        {brandSubTab === 'audit' && (
                            <AuditTab
                                tenantId={resolvedTenantId}
                                events={MOCK_AUDIT}
                            />
                        )}
                    </div>
                </div>
            )}

            {topTab === 'stores' && (
                <div className="pt-2">
                    <StoresTab
                        tenantId={resolvedTenantId}
                        stores={stores}
                        maxStores={brand.maxStores || 50}
                        onViewStore={(storeId) => router.push(`/backoffice/settings/stores/${storeId}`)}
                        onConfigureStore={(storeId) => router.push(`/backoffice/settings/stores/${storeId}`)}
                        onCreateStore={async (dto) => {
                            await storeService.create(resolvedTenantId, dto);
                            const refreshed = await storeService.list(resolvedTenantId);
                            setStores(refreshed);
                        }}
                        onUpdateStore={async (storeId, dto) => {
                            await storeService.update(resolvedTenantId, storeId, dto);
                            const refreshed = await storeService.list(resolvedTenantId);
                            setStores(refreshed);
                        }}
                        onSuspendStore={async (storeId) => {
                            await storeService.suspend(resolvedTenantId, storeId);
                            const refreshed = await storeService.list(resolvedTenantId);
                            setStores(refreshed);
                        }}
                        onReactivateStore={async (storeId) => {
                            await storeService.activate(resolvedTenantId, storeId);
                            const refreshed = await storeService.list(resolvedTenantId);
                            setStores(refreshed);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
