'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Store as StoreIcon, Settings, ChevronRight, Activity, Building2,
    Clock, Truck, ShoppingBag, Plug, Cpu, Receipt, Users, Ban,
    RefreshCw, Loader2, AlertTriangle, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/shared/contexts/AuthContext';
import { storeService } from '@/shared/api/services/store.service';
import type {
    Store, StoreDetailConfig, StoreUser, CreateStoreDTO, OperatingHours,
    DeliveryConfig, PickupConfig, HardwareConfig, StorePageData,
} from '@/shared/types/store';
import { createDefaultStoreDetailConfig } from '@/shared/types/store';

import { StoreSkeleton } from '@/modules/stores/components/shared/StoreSkeleton';
import { StoreStatusBadge } from '@/modules/stores/components/shared/StoreStatusBadge';
import {
    StoreOverviewTab,
    StoreOperationsTab,
    StoreDeliveryTab,
    StorePickupTab,
    StoreIntegrationsTab,
    StoreHardwareTab,
    StoreTaxPaymentsTab,
    StoreUsersTab,
} from '@/modules/stores/components/tabs';

// ─── Tab Config ─────────────────────────────────────────────────────────────

type StoreTab = 'overview' | 'operations' | 'delivery' | 'pickup' |
    'integrations' | 'hardware' | 'tax' | 'users';

const STORE_TABS: { id: StoreTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'operations', label: 'Operations', icon: Clock },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'pickup', label: 'Pickup', icon: ShoppingBag },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'hardware', label: 'Hardware', icon: Cpu },
    { id: 'tax', label: 'Taxes & Payments', icon: Receipt },
    { id: 'users', label: 'Users', icon: Users },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function StoreDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { tenantId } = useAuth();
    const storeId = params?.storeId as string;

    const [store, setStore] = useState<Store | null>(null);
    const [config, setConfig] = useState<StoreDetailConfig>(createDefaultStoreDetailConfig());
    const [storeUsers, setStoreUsers] = useState<StoreUser[]>([]);
    const [pageData, setPageData] = useState<StorePageData | null>(null);
    const [activeTab, setActiveTab] = useState<StoreTab>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const resolvedTenantId = tenantId || 'brand-001';

    // ── Fetch store data ────────────────────────────────────────────────────
    const fetchStore = useCallback(async () => {
        if (!storeId) return;
        setLoading(true);
        setError(null);
        try {
            const [storeData, configData, usersData, pageDataResult] = await Promise.all([
                storeService.get(resolvedTenantId, storeId),
                storeService.getConfig(resolvedTenantId, storeId).catch(() => createDefaultStoreDetailConfig()),
                storeService.getStoreUsers(resolvedTenantId, storeId).catch(() => []),
                storeService.getPageData(resolvedTenantId, storeId).catch(() => null),
            ]);
            setStore(storeData);
            setConfig(configData);
            setStoreUsers(usersData);
            setPageData(pageDataResult);
        } catch (err: any) {
            console.error('Failed to fetch store:', err);
            setError(err?.message || 'Failed to load store details');
        } finally {
            setLoading(false);
        }
    }, [storeId, resolvedTenantId]);

    useEffect(() => { fetchStore(); }, [fetchStore]);

    // ── Mutation Handlers ───────────────────────────────────────────────────
    const handleGeneralSave = async (dto: Partial<CreateStoreDTO>) => {
        await storeService.update(resolvedTenantId, storeId, dto);
        const updated = await storeService.get(resolvedTenantId, storeId);
        setStore(updated);
    };

    const handleConfigSave = async (section: Partial<StoreDetailConfig>) => {
        const updated = await storeService.updateConfig(resolvedTenantId, storeId, section);
        setConfig(updated);
    };

    const handleOperationsSave = async (hours: OperatingHours) => {
        await handleConfigSave({ operatingHours: hours });
    };

    const handleDeliverySave = async (deliveryConfig: DeliveryConfig) => {
        await handleConfigSave({ deliveryConfig });
    };

    const handlePickupSave = async (pickupConfig: PickupConfig) => {
        await handleConfigSave({ pickupConfig });
    };

    const handleHardwareSave = async (hardwareConfig: HardwareConfig) => {
        await handleConfigSave({ hardwareConfig });
    };

    const handleTaxSave = async (data: { paymentTerms: string; taxInheritBrand: boolean; taxOverrideEnabled: boolean; taxConfig?: import('@/shared/types/store').TaxConfig }) => {
        const dto: Partial<CreateStoreDTO> = {
            paymentTerms: data.paymentTerms,
            taxInheritBrand: data.taxInheritBrand,
            taxOverrideEnabled: data.taxOverrideEnabled,
            ...(data.taxConfig ? { taxConfig: data.taxConfig } : {}),
        };
        await storeService.update(resolvedTenantId, storeId, dto);
        const updated = await storeService.get(resolvedTenantId, storeId);
        setStore(updated);
    };

    const handleAssignManager = async (userId: string) => {
        await storeService.assignManager(resolvedTenantId, storeId, userId);
        const usersData = await storeService.getStoreUsers(resolvedTenantId, storeId);
        setStoreUsers(usersData);
    };

    const handleCreateUser = async (user: { name: string; email: string; role: string; status: string; isManager: boolean }) => {
        await storeService.createStoreUser(resolvedTenantId, storeId, user);
        const usersData = await storeService.getStoreUsers(resolvedTenantId, storeId);
        setStoreUsers(usersData);
    };

    const handleSuspend = async () => {
        if (!confirm('Suspend this store? Active POS sessions will be terminated.')) return;
        setActionLoading(true);
        try {
            const updated = await storeService.suspend(resolvedTenantId, storeId);
            setStore(updated);
        } finally { setActionLoading(false); }
    };

    const handleActivate = async () => {
        setActionLoading(true);
        try {
            const updated = await storeService.activate(resolvedTenantId, storeId);
            setStore(updated);
        } finally { setActionLoading(false); }
    };

    const handlePublish = async () => {
        setActionLoading(true);
        try {
            const updated = await storeService.update(resolvedTenantId, storeId, { status: 'Active' } as any);
            setStore(updated);
        } finally { setActionLoading(false); }
    };

    // ── Loading State ───────────────────────────────────────────────────────
    if (loading) return <StoreSkeleton />;

    // ── Error State ─────────────────────────────────────────────────────────
    if (error || !store) {
        return (
            <div className="max-w-[1600px] mx-auto px-2 pt-2">
                <div className="bg-white rounded-3xl border border-rose-200 shadow-sm p-16 text-center">
                    <AlertTriangle className="w-14 h-14 text-rose-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 mb-2">Store Not Found</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">{error || 'The store could not be loaded.'}</p>
                    <button onClick={() => router.push('/backoffice/settings')}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                        Back to Settings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-32 px-2 pt-2">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <button onClick={() => router.push('/backoffice/settings')}
                    className="hover:text-slate-700 transition-colors flex items-center gap-1">
                    <ArrowLeft size={12} /> Settings
                </button>
                <ChevronRight size={12} />
                <button onClick={() => router.push('/backoffice/settings')}
                    className="hover:text-slate-700 transition-colors">Stores</button>
                <ChevronRight size={12} />
                <span className="text-slate-700 font-bold">{store.name}</span>
            </nav>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                        <StoreIcon className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{store.name}</h1>
                            <StoreStatusBadge status={store.status} size="md" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{store.code}</span>
                            <span>{store.city}, {store.province}</span>
                            {store.timezone && <span>TZ: {store.timezone}</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {actionLoading ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : store.status === 'Active' ? (
                        <button onClick={handleSuspend}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-50 transition-all">
                            <Ban size={14} /> Suspend
                        </button>
                    ) : store.status === 'Inactive' ? (
                        <button onClick={handleActivate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all">
                            <RefreshCw size={14} /> Reactivate
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-100">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {STORE_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap',
                                    isActive
                                        ? 'text-emerald-700 border-emerald-600'
                                        : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-200'
                                )}>
                                <Icon size={13} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="pt-2">
                {activeTab === 'overview' && (
                    <StoreOverviewTab
                        store={store} config={config} users={storeUsers}
                        pageData={pageData ?? undefined}
                        onPublish={store.status === 'Draft' ? handlePublish : undefined}
                        isPublishing={actionLoading}
                        onSaveGeneral={handleGeneralSave}
                    />
                )}
                {activeTab === 'operations' && (
                    <StoreOperationsTab operatingHours={config.operatingHours} onSave={handleOperationsSave} />
                )}
                {activeTab === 'delivery' && (
                    <StoreDeliveryTab config={config.deliveryConfig} onSave={handleDeliverySave} />
                )}
                {activeTab === 'pickup' && (
                    <StorePickupTab config={config.pickupConfig} onSave={handlePickupSave} />
                )}
                {activeTab === 'integrations' && (
                    <StoreIntegrationsTab integrations={config.integrations} />
                )}
                {activeTab === 'hardware' && (
                    <StoreHardwareTab config={config.hardwareConfig} onSave={handleHardwareSave} />
                )}
                {activeTab === 'tax' && (
                    <StoreTaxPaymentsTab store={store} onSave={handleTaxSave} />
                )}
                {activeTab === 'users' && (
                    <StoreUsersTab users={storeUsers} onAssignManager={handleAssignManager} onCreateUser={handleCreateUser} />
                )}
            </div>
        </div>
    );
}
