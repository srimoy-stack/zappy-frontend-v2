export type IntegrationProvider = 'UBER_EATS' | 'DOORDASH';
export type IntegrationStatus = 'ENABLED' | 'DISABLED';
export type MenuPublishMode = 'FULL' | 'PARTIAL';
export type PlacementRule = 'FULL' | 'LEFT' | 'RIGHT';

export interface StoreIntegration {
    id: string;
    storeId: string;
    storeName: string;
    provider: IntegrationProvider;
    status: IntegrationStatus;
    providerStoreId?: string;
    acceptOrders: boolean;
    autoAccept: boolean;
    defaultPlacement: PlacementRule;
    menuPublishMode: MenuPublishMode;
    isCatalogMappingComplete: boolean;
    lastUpdatedAt: string;
    lastPublishedAt?: string;
    lastCatalogUpdateAt?: string;
    republishRequired?: boolean;
}
