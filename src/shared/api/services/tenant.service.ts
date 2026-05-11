import { api } from '@/shared/api';
import type { Brand, CreateTenantDTO } from '@/shared/types/tenant';

export const tenantService = {
    list: (params?: { page?: number; pageSize?: number; status?: string }) =>
        api.getTenants(params),

    get: (id: string) =>
        api.getTenant(id),

    create: (data: CreateTenantDTO) =>
        api.createTenant(data),

    update: (id: string, data: Partial<CreateTenantDTO>) =>
        api.updateTenant(id, data),

    suspend: (id: string) =>
        api.suspendTenant(id),

    activate: (id: string) =>
        api.activateTenant(id),
};
