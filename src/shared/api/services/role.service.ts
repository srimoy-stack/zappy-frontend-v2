import { api } from '@/shared/api';
import type { Role, CreateRoleDTO } from '@/shared/types/role';

export const roleService = {
    list: () =>
        api.getRoles(),

    get: (id: string) =>
        api.getRole(id),

    create: (data: CreateRoleDTO) =>
        api.createRole(data),

    update: (id: string, data: Partial<CreateRoleDTO>) =>
        api.updateRole(id, data),

    delete: (id: string) =>
        api.deleteRole(id),
};
