import { api } from '@/shared/api';
import type { Store, CreateStoreDTO, StoreDetailConfig, StoreUser, StorePageData } from '@/shared/types/store';

export const storeService = {
    list: (tenantId: string) =>
        api.getStores(tenantId),

    get: (tenantId: string, storeId: string) =>
        api.getStore(tenantId, storeId),

    create: (tenantId: string, data: CreateStoreDTO) =>
        api.createStore(tenantId, data),

    update: (tenantId: string, storeId: string, data: Partial<CreateStoreDTO>) =>
        api.updateStore(tenantId, storeId, data),

    suspend: (tenantId: string, storeId: string) =>
        api.suspendStore(tenantId, storeId),

    activate: (tenantId: string, storeId: string) =>
        api.activateStore(tenantId, storeId),

    delete: (tenantId: string, storeId: string) =>
        api.deleteStore(tenantId, storeId),

    getConfig: (tenantId: string, storeId: string) =>
        api.getStoreConfig(tenantId, storeId),

    updateConfig: (tenantId: string, storeId: string, config: Partial<StoreDetailConfig>) =>
        api.updateStoreConfig(tenantId, storeId, config),

    getPageData: (tenantId: string, storeId: string): Promise<StorePageData> =>
        api.getStorePageData(tenantId, storeId),

    getStoreUsers: (tenantId: string, storeId: string) =>
        api.getStoreUsers(tenantId, storeId),

    assignManager: (tenantId: string, storeId: string, userId: string) =>
        api.assignStoreManager(tenantId, storeId, userId),

    createStoreUser: (tenantId: string, storeId: string, user: { name: string; email: string; role: string; status: string; isManager: boolean }) =>
        api.createStoreUser(tenantId, storeId, user),
};

