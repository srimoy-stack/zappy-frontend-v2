/**
 * HTTP Adapter — Real FastAPI Backend
 *
 * Calls actual FastAPI endpoints. Used when NEXT_PUBLIC_API_MODE=live.
 *
 * Route mapping:
 *   Auth:    /api/auth/*
 *   Users:   /api/users/*
 *   Roles:   /api/roles/*
 *   Tenants: /pos/tenants/*
 *   Stores:  /pos/stores/*
 */

import { apiClient } from '@/shared/api/apiClient';
import type { ApiAdapter } from './adapter.interface';
import type { MeResponse, PaginatedResponse } from '@/shared/types/api';
import type { User, CreateUserDTO } from '@/shared/types/user';
import type { Brand, CreateTenantDTO } from '@/shared/types/tenant';
import type { Store, CreateStoreDTO } from '@/shared/types/store';
import type { Role, CreateRoleDTO } from '@/shared/types/role';
import type { TenantModule } from '@/shared/types/module';
import type { BackendPermission, BackendPermissionsByModule } from './normalizeBackend';
import {
    normalizeTenant,
    normalizeUser,
    normalizeRole,
    normalizeStore,
    wrapAsPaginated,
} from './normalizeBackend';

export const httpAdapter: ApiAdapter = {
    // ─── Auth ────────────────────────────────────────────
    async getMe(): Promise<MeResponse> {
        const { data } = await apiClient.get('/api/auth/me');
        // Map FastAPI UserMeResponse → frontend MeResponse
        return {
            id: String(data.id),
            name: data.full_name || '',
            email: data.email || '',
            role: data.role || '',
            tenant: null,
            stores: [],
            permissions: data.permissions || [],
            enabledModules: [],
        };
    },

    // ─── Tenants (FastAPI: /pos/tenants/) ─────────────────
    async getTenants(params): Promise<PaginatedResponse<Brand>> {
        const skip = params?.page ? (params.page - 1) * (params?.pageSize || 50) : 0;
        const limit = params?.pageSize || 50;
        const { data } = await apiClient.get('/pos/tenants/', {
            params: { skip, limit },
        });
        // Backend returns flat array
        const items = Array.isArray(data) ? data : (data.data || []);
        const normalized = items.map(normalizeTenant);
        return wrapAsPaginated(normalized, params?.page || 1, limit);
    },

    async getTenant(id): Promise<Brand> {
        const { data } = await apiClient.get(`/pos/tenants/${id}`);
        return normalizeTenant(data);
    },

    async createTenant(dto): Promise<Brand> {
        const payload = {
            name: dto.brandName || dto.brandLegalName,
            slug: (dto.brandName || dto.brandLegalName || '')
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
            status: 'active',
        };
        const { data } = await apiClient.post('/pos/tenants/', payload);
        return normalizeTenant(data);
    },

    async updateTenant(id, dto): Promise<Brand> {
        const payload: Record<string, any> = {};
        if (dto.brandName) payload.name = dto.brandName;
        if (dto.slug) payload.slug = dto.slug;
        if (dto.status) payload.status = dto.status.toLowerCase();
        const { data } = await apiClient.patch(`/pos/tenants/${id}`, payload);
        return normalizeTenant(data);
    },

    async suspendTenant(id): Promise<Brand> {
        // No dedicated endpoint — use PATCH with status
        const { data } = await apiClient.patch(`/pos/tenants/${id}`, { status: 'suspended' });
        return normalizeTenant(data);
    },

    async activateTenant(id): Promise<Brand> {
        const { data } = await apiClient.patch(`/pos/tenants/${id}`, { status: 'active' });
        return normalizeTenant(data);
    },

    async deleteTenant(id): Promise<void> {
        await apiClient.delete(`/pos/tenants/${id}`);
    },

    // ─── Stores (FastAPI: /pos/stores/) ──────────────────
    async getStores(tenantId): Promise<Store[]> {
        const { data } = await apiClient.get('/pos/stores/', {
            params: { tenant_id: tenantId },
        });
        const items = Array.isArray(data) ? data : (data.data || []);
        return items.map(normalizeStore);
    },

    async getStore(_tenantId, storeId): Promise<Store> {
        const { data } = await apiClient.get(`/pos/stores/${storeId}`);
        return normalizeStore(data);
    },

    async createStore(tenantId, dto): Promise<Store> {
        const payload = {
            tenant_id: tenantId,
            name: dto.name,
            phone: dto.phone || null,
            address_line_1: dto.address || null,
            city: dto.city || null,
            province: dto.province || null,
            postal_code: dto.postalCode || null,
        };
        const { data } = await apiClient.post('/pos/stores/', payload);
        return normalizeStore(data);
    },

    async updateStore(_tenantId, storeId, dto): Promise<Store> {
        const payload: Record<string, any> = {};
        if (dto.name) payload.name = dto.name;
        if (dto.phone) payload.phone = dto.phone;
        if (dto.city) payload.city = dto.city;
        if (dto.province) payload.province = dto.province;
        if (dto.postalCode) payload.postal_code = dto.postalCode;
        if (dto.status !== undefined) payload.is_active = dto.status === 'Active';
        const { data } = await apiClient.patch(`/pos/stores/${storeId}`, payload);
        return normalizeStore(data);
    },

    // ─── Users (FastAPI: /api/users/) ────────────────────
    async getUsers(params): Promise<PaginatedResponse<User>> {
        const skip = params?.page ? (params.page - 1) * (params?.pageSize || 50) : 0;
        const limit = params?.pageSize || 50;
        const { data } = await apiClient.get('/api/users/', {
            params: { skip, limit },
        });
        const items = Array.isArray(data) ? data : (data.data || []);
        const normalized = items.map(normalizeUser);
        return wrapAsPaginated(normalized, params?.page || 1, limit);
    },

    async getUser(id): Promise<User> {
        const { data } = await apiClient.get(`/api/users/${id}`);
        return normalizeUser(data);
    },

    async createUser(dto): Promise<User> {
        const payload = {
            full_name: dto.fullName,
            email: dto.email,
            phone: dto.phone || null,
            password: 'TempPass123!', // Default password — user should change on first login
            role_id: dto.roleId ? Number(dto.roleId) : null,
            is_active: true,
        };
        const { data } = await apiClient.post('/api/users/', payload);
        return normalizeUser(data);
    },

    async updateUser(id, dto): Promise<User> {
        const payload: Record<string, any> = {};
        if (dto.fullName) payload.full_name = dto.fullName;
        if (dto.phone) payload.phone = dto.phone;
        if (dto.roleId) payload.role_id = Number(dto.roleId);
        const { data } = await apiClient.patch(`/api/users/${id}`, payload);
        return normalizeUser(data);
    },

    async deleteUser(id): Promise<void> {
        // FastAPI has no DELETE /users/:id — use PATCH to deactivate
        await apiClient.patch(`/api/users/${id}`, { is_active: false });
    },

    // ─── Roles (FastAPI: /api/roles/) ────────────────────
    async getRoles(): Promise<Role[]> {
        const { data } = await apiClient.get('/api/roles/');
        const items = Array.isArray(data) ? data : (data.data || []);
        return items.map(normalizeRole);
    },

    async getRole(id): Promise<Role> {
        const { data } = await apiClient.get(`/api/roles/${id}`);
        return normalizeRole(data);
    },

    async createRole(dto): Promise<Role> {
        const payload = {
            name: dto.name,
            description: dto.description || null,
            permission_codes: dto.permissions || [],
        };
        const { data } = await apiClient.post('/api/roles/', payload);
        return normalizeRole(data);
    },

    async updateRole(id, dto): Promise<Role> {
        const payload: Record<string, any> = {};
        if (dto.name) payload.name = dto.name;
        if (dto.description !== undefined) payload.description = dto.description;
        if (dto.permissions) payload.permission_codes = dto.permissions;
        // FastAPI uses PUT for role updates
        const { data } = await apiClient.put(`/api/roles/${id}`, payload);
        return normalizeRole(data);
    },

    async deleteRole(id): Promise<void> {
        await apiClient.delete(`/api/roles/${id}`);
    },

    // ─── Permissions (FastAPI: /api/roles/permissions/) ──
    async getPermissions(): Promise<BackendPermission[]> {
        const { data } = await apiClient.get('/api/roles/permissions/all');
        return Array.isArray(data) ? data : [];
    },

    async getPermissionsByModule(): Promise<BackendPermissionsByModule[]> {
        const { data } = await apiClient.get('/api/roles/permissions/by-module');
        return Array.isArray(data) ? data : [];
    },

    async assignPermission(roleId, permissionId): Promise<void> {
        await apiClient.post('/api/roles/assign-permission', {
            role_id: roleId,
            permission_id: permissionId,
        });
    },

    async removePermission(roleId, permissionId): Promise<void> {
        await apiClient.post('/api/roles/remove-permission', {
            role_id: roleId,
            permission_id: permissionId,
        });
    },

    // ─── Modules (not yet in FastAPI — graceful fallback) ─
    async getModules(): Promise<TenantModule[]> {
        console.warn('[HTTP] getModules: Not implemented in FastAPI backend');
        return [];
    },

    async getTenantModules(_tenantId): Promise<TenantModule[]> {
        console.warn('[HTTP] getTenantModules: Not implemented in FastAPI backend');
        return [];
    },

    async setTenantModules(_tenantId, _modules): Promise<TenantModule[]> {
        console.warn('[HTTP] setTenantModules: Not implemented in FastAPI backend');
        return [];
    },

    // ─── Config (not yet in FastAPI — graceful fallback) ──
    async getTenantConfig(_tenantId: string): Promise<any> {
        console.warn('[HTTP] getTenantConfig: Not implemented in FastAPI backend');
        return {
            email: { provider: 'smtp', senderEmail: '', senderName: '' },
            sms: { provider: 'twilio', senderId: '' },
        };
    },

    async updateTenantConfig(_tenantId: string, _data: any): Promise<any> {
        console.warn('[HTTP] updateTenantConfig: Not implemented in FastAPI backend');
        return _data;
    },
};
