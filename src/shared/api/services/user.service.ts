import { api } from '@/shared/api';
import type { User, CreateUserDTO } from '@/shared/types/user';

export const userService = {
    list: (params?: { page?: number; pageSize?: number; roleId?: string; status?: string }) =>
        api.getUsers(params),

    get: (id: string) =>
        api.getUser(id),

    create: (data: CreateUserDTO) =>
        api.createUser(data),

    update: (id: string, data: Partial<CreateUserDTO>) =>
        api.updateUser(id, data),

    delete: (id: string) =>
        api.deleteUser(id),
};
