/**
 * m9/types/users.ts — Compatibility Shim
 *
 * Re-exports shared canonical types. DO NOT define new types here.
 * Legacy-only types (AuditLog) are kept until UI components are fully migrated.
 *
 * Migration: Replace all imports from this file with '@/shared/types'.
 */

// ─── Re-exports from shared canonical types ──────────────────────────────────
export type { UserType, UserStatus, User, CreateUserDTO } from '@/shared/types/user';
export type { Role, Permission, PermissionCategory, CreateRoleDTO } from '@/shared/types/role';

// ─── Legacy-only types (no shared equivalent yet) ────────────────────────────
export interface AuditLog {
    id: string;
    action: string;
    details: string;
    performedBy: string;
    timestamp: string;
}
