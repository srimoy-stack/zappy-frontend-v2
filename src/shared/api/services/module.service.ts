import { api } from '@/shared/api';
import type { TenantModule } from '@/shared/types/module';

export const moduleService = {
    list: (tenantId: string) =>
        api.getTenantModules(tenantId),

    update: (
        tenantId: string,
        modules: Array<{ moduleId: string; purchased: boolean; enabled: boolean; startDate?: string }>
    ) =>
        api.setTenantModules(tenantId, modules),
};
