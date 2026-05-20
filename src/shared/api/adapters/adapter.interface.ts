/**
 * API Adapter Interface
 *
 * Both mock and HTTP adapters implement this interface.
 * Services call adapter methods; the active adapter is determined by env config.
 */

import { MeResponse, PaginatedResponse } from '@/shared/types/api';
import { User, CreateUserDTO, UpdateUserDTO } from '@/shared/types/user';
import { Brand, CreateTenantDTO } from '@/shared/types/tenant';
import { Store, CreateStoreDTO } from '@/shared/types/store';
import { Role, CreateRoleDTO } from '@/shared/types/role';
import { UserType } from '@/shared/types/auth';
import { TenantModule } from '@/shared/types/module';
import type { BackendPermission, BackendPermissionsByModule } from './normalizeBackend';

export interface ApiAdapter {
    // ─── Auth ────────────────────────────────────────────
    getMe(): Promise<MeResponse>;

    // ─── Tenants / Brands ────────────────────────────────
    getTenants(params?: { page?: number; pageSize?: number; status?: string }): Promise<PaginatedResponse<Brand>>;
    getTenant(id: string): Promise<Brand>;
    createTenant(data: CreateTenantDTO): Promise<Brand>;
    updateTenant(id: string, data: Partial<Brand>): Promise<Brand>;
    suspendTenant(id: string): Promise<Brand>;
    activateTenant(id: string): Promise<Brand>;
    deleteTenant(id: string): Promise<void>;

    // ─── Stores ──────────────────────────────────────────
    getStores(tenantId: string): Promise<Store[]>;
    getStore(tenantId: string, storeId: string): Promise<Store>;
    createStore(tenantId: string, data: CreateStoreDTO): Promise<Store>;
    updateStore(tenantId: string, storeId: string, data: Partial<CreateStoreDTO>): Promise<Store>;

    // ─── Users ───────────────────────────────────────────
    getUsers(params?: { page?: number; pageSize?: number; userType?: UserType; roleId?: string; status?: string }): Promise<PaginatedResponse<User>>;
    getUser(id: string): Promise<User>;
    createUser(data: CreateUserDTO): Promise<User>;
    updateUser(id: string, data: UpdateUserDTO): Promise<User>;
    deleteUser(id: string): Promise<void>;

    // ─── Roles ───────────────────────────────────────────
    getRoles(): Promise<Role[]>;
    getRole(id: string): Promise<Role>;
    createRole(data: CreateRoleDTO): Promise<Role>;
    updateRole(id: string, data: Partial<CreateRoleDTO>): Promise<Role>;
    deleteRole(id: string): Promise<void>;

    // ─── Permissions ─────────────────────────────────────
    getPermissions(): Promise<BackendPermission[]>;
    getPermissionsByModule(): Promise<BackendPermissionsByModule[]>;
    assignPermission(roleId: number, permissionId: number): Promise<void>;
    removePermission(roleId: number, permissionId: number): Promise<void>;

    // ─── Modules ─────────────────────────────────────────
    getModules(): Promise<TenantModule[]>;
    getTenantModules(tenantId: string): Promise<TenantModule[]>;
    setTenantModules(tenantId: string, modules: Array<{ moduleId: string; purchased: boolean; enabled: boolean; startDate?: string }>): Promise<TenantModule[]>;

    // ─── Config ──────────────────────────────────────────
    getTenantConfig(tenantId: string): Promise<any>;
    updateTenantConfig(tenantId: string, data: Partial<any>): Promise<any>;
}
