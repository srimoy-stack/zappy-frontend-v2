/**
 * m9/types/users.ts — Compatibility Shim
 *
 * Re-exports shared canonical types. DO NOT define new types here.
 * Legacy-only types (AuditLog) are kept until UI components are fully migrated.
 *
 * Migration: Replace all imports from this file with '@/shared/types'.
 */

import { UserType } from '@/shared/types/user';

// ─── Re-exports from shared canonical types ──────────────────────────────────
export { UserType };
export type { UserStatus } from '@/shared/types/user';
export type { Role, Permission, PermissionCategory, CreateRoleDTO } from '@/shared/types/role';

export interface CreateUserDTO {
    fullName: string;
    email: string;
    type: UserType;
    roleId: string;
    assignedStores: string[];
    tenantId?: string;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    type: UserType;
    roleId: string;
    roleName?: string;
    assignedStores: string[];
    status: 'Active' | 'Disabled';
    createdAt: string;
}

// ─── Legacy-only types (no shared equivalent yet) ────────────────────────────
export interface AuditLog {
    id: string;
    action: string;
    details: string;
    performedBy: string;
    timestamp: string;
}
