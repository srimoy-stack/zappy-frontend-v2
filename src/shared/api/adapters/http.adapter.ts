/**
 * HTTP Adapter — Real FastAPI Backend
 *
 * Calls actual endpoints. Used when NEXT_PUBLIC_API_MODE=live.
 */

import { apiClient } from '@/shared/api/apiClient';
import type { ApiAdapter } from './adapter.interface';
import type { MeResponse, PaginatedResponse } from '@/shared/types/api';
import type { User, CreateUserDTO } from '@/shared/types/user';
import type { Brand, CreateTenantDTO } from '@/shared/types/tenant';
import type { Store, CreateStoreDTO } from '@/shared/types/store';
import type { Role, CreateRoleDTO } from '@/shared/types/role';
import type { TenantModule } from '@/shared/types/module';

export const httpAdapter: ApiAdapter = {
    // ─── Auth ────────────────────────────────────────────
    async getMe(): Promise<MeResponse> {
        const { data } = await apiClient.get('/me');
        return data;
    },

    // ─── Tenants ─────────────────────────────────────────
    async getTenants(params): Promise<PaginatedResponse<Brand>> {
        const { data } = await apiClient.get('/tenants', { params });
        return data;
    },

    async getTenant(id): Promise<Brand> {
        const { data } = await apiClient.get(`/tenants/${id}`);
        return data;
    },

    async createTenant(dto): Promise<Brand> {
        const { data } = await apiClient.post('/tenants', dto);
        return data;
    },

    async updateTenant(id, dto): Promise<Brand> {
        const { data } = await apiClient.patch(`/tenants/${id}`, dto);
        return data;
    },

    async suspendTenant(id): Promise<Brand> {
        const { data } = await apiClient.post(`/tenants/${id}/suspend`);
        return data;
    },

    async activateTenant(id): Promise<Brand> {
        const { data } = await apiClient.post(`/tenants/${id}/activate`);
        return data;
    },

    // ─── Stores ──────────────────────────────────────────
    async getStores(tenantId): Promise<Store[]> {
        const { data } = await apiClient.get(`/tenants/${tenantId}/stores`);
        return data;
    },

    async getStore(tenantId, storeId): Promise<Store> {
        const { data } = await apiClient.get(`/tenants/${tenantId}/stores/${storeId}`);
        return data;
    },

    async createStore(tenantId, dto): Promise<Store> {
        const { data } = await apiClient.post(`/tenants/${tenantId}/stores`, dto);
        return data;
    },

    async updateStore(tenantId, storeId, dto): Promise<Store> {
        const { data } = await apiClient.patch(`/tenants/${tenantId}/stores/${storeId}`, dto);
        return data;
    },

    // ─── Users ───────────────────────────────────────────
    async getUsers(params): Promise<PaginatedResponse<User>> {
        const { data } = await apiClient.get('/users', { params });
        return data;
    },

    async getUser(id): Promise<User> {
        const { data } = await apiClient.get(`/users/${id}`);
        return data;
    },

    async createUser(dto): Promise<User> {
        const { data } = await apiClient.post('/users', dto);
        return data;
    },

    async updateUser(id, dto): Promise<User> {
        const { data } = await apiClient.patch(`/users/${id}`, dto);
        return data;
    },

    async deleteUser(id): Promise<void> {
        await apiClient.delete(`/users/${id}`);
    },

    // ─── Roles ───────────────────────────────────────────
    async getRoles(): Promise<Role[]> {
        const { data } = await apiClient.get('/roles');
        return data;
    },

    async getRole(id): Promise<Role> {
        const { data } = await apiClient.get(`/roles/${id}`);
        return data;
    },

    async createRole(dto): Promise<Role> {
        const { data } = await apiClient.post('/roles', dto);
        return data;
    },

    async updateRole(id, dto): Promise<Role> {
        const { data } = await apiClient.patch(`/roles/${id}`, dto);
        return data;
    },

    async deleteRole(id): Promise<void> {
        await apiClient.delete(`/roles/${id}`);
    },

    // ─── Modules ─────────────────────────────────────────
    async getTenantModules(tenantId): Promise<TenantModule[]> {
        const { data } = await apiClient.get(`/tenants/${tenantId}/modules`);
        return data;
    },

    async setTenantModules(tenantId, modules): Promise<TenantModule[]> {
        const { data } = await apiClient.post(`/tenants/${tenantId}/modules`, { modules });
        return data;
    },
};
