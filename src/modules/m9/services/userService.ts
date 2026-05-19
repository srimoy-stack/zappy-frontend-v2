/**
 * userService — Refactored to use Global API Adapter
 *
 * This service now delegates all operations to the 'api' adapter,
 * which automatically handles switching between Mock and HTTP (FastAPI) modes.
 */

import { api } from '@/shared/api';
import type { User, Role, AuditLog, CreateUserDTO } from '../types/users';
import type { User as SharedUser, Role as SharedRole } from '@/shared/types';
export { AVAILABLE_PERMISSIONS, PERMISSION_CATEGORIES } from '@/shared/types';

// ─── Type Mappers ────────────────────────────────────────────────────────────
// Maps between shared types and module-specific legacy types to prevent UI breakage.

function mapToModuleUser(u: SharedUser): User {
    return {
        id: u.id,
        fullName: u.fullName || u.name,
        email: u.email,
        type: u.userType as any, // Legacy type mapping
        roleId: u.roleId,
        roleName: u.roleName,
        assignedStores: u.storeIds,
        status: u.status === 'Active' ? 'Active' : 'Disabled',
        createdAt: u.createdAt,
    };
}

function mapToModuleRole(r: SharedRole): Role {
    return {
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
        isSystem: r.isSystem,
        createdAt: r.createdAt,
    };
}

// ─── Service Implementation ──────────────────────────────────────────────────

export const userService = {
    // USERS
    getUsers: async (): Promise<User[]> => {
        const response = await api.getUsers({ pageSize: 100 });
        return response.data.map(mapToModuleUser);
    },

    createUser: async (data: CreateUserDTO): Promise<User> => {
        const sharedUser = await api.createUser({
            fullName: data.fullName,
            email: data.email,
            userType: data.type as any,
            roleId: data.roleId,
            assignedStoreIds: data.assignedStores,
        });
        return mapToModuleUser(sharedUser);
    },

    updateUser: async (id: string, data: Partial<User>): Promise<User> => {
        const sharedUser = await api.updateUser(id, {
            fullName: data.fullName,
            email: data.email,
            userType: data.type as any,
            roleId: data.roleId,
            assignedStoreIds: data.assignedStores,
            status: data.status === 'Active' ? 'Active' : 'Disabled',
        });
        return mapToModuleUser(sharedUser);
    },

    toggleUserStatus: async (id: string): Promise<User> => {
        const user = await api.getUser(id);
        const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
        const updated = await api.updateUser(id, { status: newStatus as any });
        return mapToModuleUser(updated);
    },

    // ROLES
    getRoles: async (): Promise<Role[]> => {
        const roles = await api.getRoles();
        return roles.map(mapToModuleRole);
    },

    createRole: async (data: Omit<Role, 'id' | 'createdAt' | 'isSystem'>): Promise<Role> => {
        const role = await api.createRole({
            name: data.name,
            description: data.description,
            permissions: data.permissions,
        });
        return mapToModuleRole(role);
    },

    updateRole: async (id: string, data: Partial<Role>): Promise<Role> => {
        const role = await api.updateRole(id, {
            name: data.name,
            description: data.description,
            permissions: data.permissions,
        });
        return mapToModuleRole(role);
    },

    deleteRole: async (id: string): Promise<boolean> => {
        await api.deleteRole(id);
        return true;
    },

    // AUDIT LOGS
    // Note: Audit logs are currently still mocked or can be fetched from a generic endpoint
    getAuditLogs: async (): Promise<AuditLog[]> => {
        // For now, return empty or mock until backend has a dedicated /audit-logs endpoint
        return [];
    }
};
