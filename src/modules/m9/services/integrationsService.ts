import { StoreIntegration } from '../types/integrations';

const MOCK_INTEGRATIONS: StoreIntegration[] = [
    {
        id: 'int-1',
        storeId: 'store-01',
        storeName: 'Downtown Kitchen',
        provider: 'UBER_EATS',
        status: 'ENABLED',
        providerStoreId: 'uber-dt-992',
        acceptOrders: true,
        autoAccept: true,
        defaultPlacement: 'FULL',
        menuPublishMode: 'FULL',
        isCatalogMappingComplete: true,
        lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        lastPublishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastCatalogUpdateAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        republishRequired: true
    },
    {
        id: 'int-2',
        storeId: 'store-01',
        storeName: 'Downtown Kitchen',
        provider: 'DOORDASH',
        status: 'DISABLED',
        providerStoreId: '',
        acceptOrders: false,
        autoAccept: false,
        defaultPlacement: 'FULL',
        menuPublishMode: 'PARTIAL',
        isCatalogMappingComplete: false,
        lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastPublishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        lastCatalogUpdateAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        republishRequired: true
    },
    {
        id: 'int-3',
        storeId: 'store-02',
        storeName: 'Uptown Express',
        provider: 'UBER_EATS',
        status: 'ENABLED',
        providerStoreId: 'uber-up-441',
        acceptOrders: true,
        autoAccept: false,
        defaultPlacement: 'FULL',
        menuPublishMode: 'FULL',
        isCatalogMappingComplete: true,
        lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        lastPublishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        lastCatalogUpdateAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        republishRequired: false
    }
];

let store = [...MOCK_INTEGRATIONS];

export const integrationsService = {
    getIntegrations: async (): Promise<StoreIntegration[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return [...store];
    },

    saveIntegrations: async (data: StoreIntegration[]): Promise<StoreIntegration[]> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        store = data.map(item => ({
            ...item,
            lastUpdatedAt: new Date().toISOString()
        }));
        return [...store];
    }
};
