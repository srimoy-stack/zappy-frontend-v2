'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/shared/contexts/AuthContext';
import { storeService } from '@/shared/api/services/store.service';
import { tenantService } from '@/shared/api';
import type { Store } from '@/shared/types/store';
import { StoresTab } from '@/modules/platform/components/tenantDetail';

export default function StoreManagementPage() {
    const { tenantId } = useAuth();
    const router = useRouter();
    const [stores, setStores] = useState<Store[]>([]);
    const [maxStores, setMaxStores] = useState(50);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            const resolvedTenantId = tenantId || 'brand-001';
            setLoading(true);
            try {
                // Fetch tenant info to get maxStores
                try {
                    const tenantData = await tenantService.get(resolvedTenantId);
                    if (tenantData && tenantData.maxStores) {
                        setMaxStores(tenantData.maxStores);
                    }
                } catch (err) {
                    console.error('Failed to fetch tenant details:', err);
                }

                // Fetch stores
                const apiStores = await storeService.list(resolvedTenantId);
                setStores(apiStores);
            } catch (err) {
                console.error('Failed to fetch stores:', err);
                setStores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, [tenantId]);

    if (loading) {
        return (
            <div className="space-y-8 pb-32 pt-2">
                <div className="animate-pulse space-y-8">
                    {/* Stats skeleton */}
                    <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100" />
                    {/* Table skeleton */}
                    <div className="h-72 bg-slate-50 rounded-2xl border border-slate-100" />
                </div>
            </div>
        );
    }

    const resolvedTenantId = tenantId || 'brand-001';

    return (
        <div className="space-y-8 pb-32 pt-2">
            {/* ── Stores Content ───────────────────────────────────────── */}
            <StoresTab
                tenantId={resolvedTenantId}
                stores={stores}
                maxStores={maxStores}
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
    );
}
