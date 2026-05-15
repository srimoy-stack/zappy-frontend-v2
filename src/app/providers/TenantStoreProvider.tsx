'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tenant, Store, TenantStoreContextType } from '@/types';

const TenantStoreContext = createContext<TenantStoreContextType | undefined>(undefined);

export const useTenantStore = () => {
    const context = useContext(TenantStoreContext);
    if (!context) {
        throw new Error('useTenantStore must be used within a TenantStoreProvider');
    }
    return context;
};

interface TenantStoreProviderProps {
    children: ReactNode;
}

/**
 * TenantStoreProvider
 * Manages store context (scoping) independently of authentication.
 */
export const TenantStoreProvider: React.FC<TenantStoreProviderProps> = ({ children }) => {
    // Mock data for development bootstrapping
    const [tenant, setTenant] = useState<Tenant | null>({
        id: 'tenant-demo',
        name: 'Zyappy Demo',
        slug: 'zyappy-demo'
    });

    const [store, setStore] = useState<Store | null>({
        id: 'store-01',
        name: 'Flagship Store',
        code: 'FS-01',
        tenantId: 'tenant-demo',
        timezone: 'America/New_York',
        city: 'New York',
        province: 'New York',
        status: 'Active',
        paymentTerms: 'Net 30',
        taxProfile: 'Inherit',
        logoStatus: 'Default'
    });

    const [allStores] = useState<Store[]>([
        {
            id: 'store-01',
            name: 'Flagship Store',
            code: 'FS-01',
            tenantId: 'tenant-demo',
            timezone: 'America/New_York',
            city: 'New York',
            province: 'New York',
            status: 'Active',
            paymentTerms: 'Net 30',
            taxProfile: 'Inherit',
            logoStatus: 'Default'
        },
        {
            id: 'store-02',
            name: 'Warehouse Ops',
            code: 'WH-02',
            tenantId: 'tenant-demo',
            timezone: 'America/New_York',
            city: 'Jersey City',
            province: 'New Jersey',
            status: 'Active',
            paymentTerms: 'Net 15',
            taxProfile: 'Inherit',
            logoStatus: 'Default'
        }
    ]);

    const [isLoading] = useState(false);

    return (
        <TenantStoreContext.Provider value={{
            tenant,
            store,
            allStores,
            setTenant,
            setStore,
            isLoading
        }}>
            {children}
        </TenantStoreContext.Provider>
    );
};
