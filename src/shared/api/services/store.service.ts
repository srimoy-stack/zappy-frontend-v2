import { api } from '@/shared/api';
import type { Store, CreateStoreDTO } from '@/shared/types/store';

export const storeService = {
    list: (tenantId: string) =>
        api.getStores(tenantId),

    get: (tenantId: string, storeId: string) =>
        api.getStore(tenantId, storeId),

    create: (tenantId: string, data: CreateStoreDTO) =>
        api.createStore(tenantId, data),

    update: (tenantId: string, storeId: string, data: Partial<CreateStoreDTO>) =>
        api.updateStore(tenantId, storeId, data),
};
