'use client';

/**
 * TenantStoreProvider — Legacy Compatibility Shim
 *
 * Maps useTenantStore() → useTenant() + useStore() from shared contexts.
 * Components still importing useTenantStore get the correct data.
 *
 * TODO: Migrate consumers to use useTenant()/useStore() directly, then delete this file.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useTenant } from '@/shared/contexts/TenantContext';
import { useStore } from '@/shared/contexts/StoreContext';

interface TenantStoreContextType {
    tenant: { id: string; name: string } | null;
    store: { id: string; name: string } | null;
    allStores: Array<{ id: string; name: string }>;
    setStore: (store: { id: string; name: string }) => void;
    isLoading: boolean;
}

const TenantStoreContext = createContext<TenantStoreContextType | undefined>(undefined);

export const useTenantStore = () => {
    const context = useContext(TenantStoreContext);
    if (!context) {
        throw new Error('useTenantStore must be used within a TenantStoreProvider');
    }
    return context;
};

export const TenantStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { tenantId, tenantName, isResolved } = useTenant();
    const { stores, activeStore, setActiveStore } = useStore();

    const value: TenantStoreContextType = {
        tenant: tenantId ? { id: tenantId, name: tenantName || '' } : null,
        store: activeStore ? { id: activeStore.id, name: activeStore.name } : null,
        allStores: stores.map((s) => ({ id: s.id, name: s.name })),
        setStore: (s) => setActiveStore({ id: s.id, name: s.name }),
        isLoading: !isResolved,
    };

    return (
        <TenantStoreContext.Provider value={value}>
            {children}
        </TenantStoreContext.Provider>
    );
};
