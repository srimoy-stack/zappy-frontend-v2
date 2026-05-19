/**
 * Canonical User Types — Single Source of Truth
 *
 * ALL modules MUST import user types from here.
 * Do NOT define user types in module-local files.
 */

// ─── Role type is canonical — re-exported from auth.ts ──────────────────────
export { UserRole, UserType } from './auth';

/**
 * Raw backend role strings before normalization via resolveUserType().
 * Use this type ONLY when typing raw API responses.
 */
export type BackendRoleString = string;

export type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Disabled';

/**
 * Reference to a user's assigned role (permission container).
 */
export interface UserRoleRef {
    id: string;
    name: string;
    permissions: string[];
    isSystem: boolean;
}

/** Core user interface — aligned with GET /me and GET /users responses */
export interface User {
    id: string;
    name: string;
    fullName?: string;
    email: string;
    phone?: string;
    userType: UserType;          // system access classification
    role: UserRoleRef;           // assigned permission container
    storeIds: string[];
    tenantId: string;
    status: UserStatus;
    lastLogin: string | null;
    avatarUrl?: string;
    createdAt: string;
}

/** DTO for creating a user via POST /users */
export interface CreateUserDTO {
    fullName: string;
    email: string;
    phone?: string;
    userType: UserType;
    roleId: string;
    assignedStoreIds: string[];
    inviteMethod?: 'email' | 'sms' | 'manual';
}

/** DTO for updating a user via PATCH /users/:id */
export interface UpdateUserDTO {
    fullName?: string;
    email?: string;
    phone?: string;
    userType?: UserType;
    roleId?: string;
    assignedStoreIds?: string[];
    status?: UserStatus;
}
