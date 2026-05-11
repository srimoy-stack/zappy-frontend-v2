'use client';

/**
 * ApiContextBridge — Syncs TenantContext/StoreContext → apiClient headers.
 *
 * Renders nothing. Place inside the provider tree after Tenant+Store providers.
 */

import { useEffect } from 'react';
import { useTenant } from './TenantContext';
import { useStore } from './StoreContext';
import { useModules } from './ModuleContext';
import { setApiTenantId, setApiStoreId } from '@/shared/api/apiClient';

export function ApiContextBridge() {
    const { tenantId } = useTenant();
    const { activeStore } = useStore();
    const { setEnabledModules } = useModules();

    useEffect(() => {
        setApiTenantId(tenantId);
        
        // Mock loading enabled modules for the tenant
        if (tenantId) {
            // In a real app, this would be an API call: api.getEnabledModules(tenantId)
            const mockModules = ['POS', 'KDS', 'INVENTORY']; 
            setEnabledModules(mockModules);
        } else {
            setEnabledModules([]);
        }
    }, [tenantId, setEnabledModules]);

    useEffect(() => {
        setApiStoreId(activeStore?.id ?? null);
    }, [activeStore]);

    return null;
}
