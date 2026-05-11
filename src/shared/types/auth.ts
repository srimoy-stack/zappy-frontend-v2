/**
 * Auth Types — CANONICAL ROLE AUTHORITY
 *
 * This is the SINGLE SOURCE OF TRUTH for all role definitions,
 * backend role mapping, route base resolution, role hierarchy,
 * and access matrix.
 *
 * ALL modules, guards, middleware, navigation, and contexts MUST
 * import roles from this file. Do NOT define role types elsewhere.
 */

// ─── Canonical Role Enum ────────────────────────────────────────────────────

/**
 * UserType — CANONICAL AUTHORITY CLASSIFICATION
 * 
 * Controls system access, route groups, layouts, and operational interface.
 * This is SEPARATE from permissions (Role).
 */
export enum UserType {
    PLATFORM_SUPER_ADMIN = 'PLATFORM_SUPER_ADMIN',
    PLATFORM_ADMIN = 'PLATFORM_ADMIN',
    PLATFORM_SUPPORT = 'PLATFORM_SUPPORT',
    PLATFORM_OPERATIONS = 'PLATFORM_OPERATIONS',
    BRAND_ADMIN = 'BRAND_ADMIN',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    POS_USER = 'POS_USER',
    KITCHEN_USER = 'KITCHEN_USER',
    CALL_CENTER = 'CALL_CENTER',
    DELIVERY = 'DELIVERY',
    EMPLOYEE = 'EMPLOYEE',
}

/**
 * @deprecated Use UserType for system access and Role for permissions.
 * Existing code will be migrated in phases.
 */
export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    TENANT_ADMIN = 'TENANT_ADMIN',
    STORE_MANAGER = 'STORE_MANAGER',
    POS_USER = 'POS_USER',
    KITCHEN_USER = 'KITCHEN_USER',
    CALL_CENTER_USER = 'CALL_CENTER_USER',
}

// ─── User Type Groups ────────────────────────────────────────────────────────

/** Platform-level operators (Zyappy internal) — tenant_id = null */
export const PLATFORM_USER_TYPES = [
    UserType.PLATFORM_SUPER_ADMIN,
    UserType.PLATFORM_ADMIN,
    UserType.PLATFORM_SUPPORT,
    UserType.PLATFORM_OPERATIONS,
];

/** Tenant-scoped user types — tenant_id required */
export const TENANT_USER_TYPES = [
    UserType.BRAND_ADMIN,
    UserType.ADMIN,
    UserType.MANAGER,
    UserType.POS_USER,
    UserType.KITCHEN_USER,
    UserType.CALL_CENTER,
    UserType.DELIVERY,
    UserType.EMPLOYEE,
];

/** Administrators with platform or brand-wide visibility */
export const ADMIN_USER_TYPES = [
    UserType.PLATFORM_SUPER_ADMIN,
    UserType.PLATFORM_ADMIN,
    UserType.BRAND_ADMIN,
    UserType.ADMIN
];

/** Users capable of managing stores or staff */
export const MANAGEMENT_USER_TYPES = [
    ...ADMIN_USER_TYPES,
    UserType.MANAGER
];

/** Staff users focused on specific operational tasks (POS, KDS, etc.) */
export const OPERATIONAL_USER_TYPES = [
    UserType.POS_USER,
    UserType.KITCHEN_USER,
    UserType.CALL_CENTER,
    UserType.DELIVERY
];

// ─── Backend Role Normalization ─────────────────────────────────────────────

/**
 * Maps ALL known backend role strings → canonical UserType.
 *
 * FastAPI returns role names with spaces (e.g. "Super Admin", "Store Manager").
 * All keys must be lowercase. resolveUserType() normalizes input before lookup.
 */
export const BACKEND_USER_TYPE_MAP: Record<string, UserType> = {
    // Platform roles (underscore format)
    'platform_super_admin': UserType.PLATFORM_SUPER_ADMIN,
    'platform_admin': UserType.PLATFORM_ADMIN,
    'platform_support': UserType.PLATFORM_SUPPORT,
    'platform_operations': UserType.PLATFORM_OPERATIONS,
    'super_admin': UserType.PLATFORM_SUPER_ADMIN,
    'brand_admin': UserType.BRAND_ADMIN,

    // FastAPI seeded role names (space format → must be pre-normalized)
    'super admin': UserType.PLATFORM_SUPER_ADMIN,
    'admin': UserType.PLATFORM_SUPER_ADMIN,
    'store manager': UserType.MANAGER,
    'pos cashier': UserType.POS_USER,
    'kitchen staff': UserType.KITCHEN_USER,
    'call agent': UserType.CALL_CENTER,
    'delivery staff': UserType.DELIVERY,

    // Legacy underscore variants
    'manager': UserType.MANAGER,
    'store_manager': UserType.MANAGER,
    'pos_user': UserType.POS_USER,
    'pos_cashier': UserType.POS_USER,
    'employee': UserType.EMPLOYEE,
    'kds_user': UserType.KITCHEN_USER,
    'kitchen_user': UserType.KITCHEN_USER,
    'kitchen_staff': UserType.KITCHEN_USER,
    'call_center_user': UserType.CALL_CENTER,
    'call_center': UserType.CALL_CENTER,
    'call_agent': UserType.CALL_CENTER,
    'delivery': UserType.DELIVERY,
    'delivery_staff': UserType.DELIVERY,
};

/**
 * Resolves a raw backend role string to the canonical UserType.
 *
 * Handles both space-separated ("Super Admin") and underscore-separated
 * ("super_admin") formats from any backend.
 */
export function resolveUserType(backendRole: string | undefined | null): UserType | null {
    if (!backendRole) return null;
    const normalized = backendRole.toLowerCase().trim();
    // Try exact match first (handles both "super admin" and "super_admin")
    return BACKEND_USER_TYPE_MAP[normalized] ?? null;
}

/**
 * Maps ALL known backend role strings → canonical UserRole enum.
 * @deprecated Use BACKEND_USER_TYPE_MAP.
 */
export const BACKEND_ROLE_MAP: Record<string, UserRole> = {
    'platform_super_admin': UserRole.SUPER_ADMIN,
    'super_admin': UserRole.SUPER_ADMIN,
    'super admin': UserRole.SUPER_ADMIN,
    'admin': UserRole.SUPER_ADMIN,
    'brand_admin': UserRole.TENANT_ADMIN,
    'tenant_admin': UserRole.TENANT_ADMIN,
    'store_manager': UserRole.STORE_MANAGER,
    'store manager': UserRole.STORE_MANAGER,
    'pos_user': UserRole.POS_USER,
    'pos cashier': UserRole.POS_USER,
    'pos_cashier': UserRole.POS_USER,
    'employee': UserRole.POS_USER,
    'kds_user': UserRole.KITCHEN_USER,
    'kitchen_user': UserRole.KITCHEN_USER,
    'kitchen staff': UserRole.KITCHEN_USER,
    'kitchen_staff': UserRole.KITCHEN_USER,
    'call_center_user': UserRole.CALL_CENTER_USER,
    'call_center': UserRole.CALL_CENTER_USER,
    'call agent': UserRole.CALL_CENTER_USER,
    'call_agent': UserRole.CALL_CENTER_USER,
};

/**
 * @deprecated Use resolveUserType().
 */
export function resolveRole(backendRole: string | undefined | null): UserRole | null {
    if (!backendRole) return null;
    const normalized = backendRole.toLowerCase().trim();
    return BACKEND_ROLE_MAP[normalized] ?? null;
}

// ─── Route Base Routes ──────────────────────────────────────────────────────

/** Base route prefix for each user type */
export const USER_TYPE_BASE_ROUTE: Record<UserType, string> = {
    [UserType.PLATFORM_SUPER_ADMIN]: '/platform',
    [UserType.PLATFORM_ADMIN]: '/platform',
    [UserType.PLATFORM_SUPPORT]: '/platform',
    [UserType.PLATFORM_OPERATIONS]: '/platform',
    [UserType.BRAND_ADMIN]: '/backoffice',
    [UserType.ADMIN]: '/backoffice',
    [UserType.MANAGER]: '/backoffice',
    [UserType.POS_USER]: '/pos',
    [UserType.KITCHEN_USER]: '/kds',
    [UserType.CALL_CENTER]: '/callcenter',
    [UserType.DELIVERY]: '/backoffice',
    [UserType.EMPLOYEE]: '/backoffice',
};

/** Default landing page for each user type */
export const USER_TYPE_DEFAULT_PAGE: Record<UserType, string> = {
    [UserType.PLATFORM_SUPER_ADMIN]: '/platform/brands',
    [UserType.PLATFORM_ADMIN]: '/platform/tenants',
    [UserType.PLATFORM_SUPPORT]: '/platform/tenants',
    [UserType.PLATFORM_OPERATIONS]: '/platform/dashboard',
    [UserType.BRAND_ADMIN]: '/backoffice/home',
    [UserType.ADMIN]: '/backoffice/home',
    [UserType.MANAGER]: '/backoffice/home',
    [UserType.POS_USER]: '/pos',
    [UserType.KITCHEN_USER]: '/kds/master',
    [UserType.CALL_CENTER]: '/callcenter/dashboard',
    [UserType.DELIVERY]: '/backoffice/home',
    [UserType.EMPLOYEE]: '/backoffice/home',
};

/** @deprecated Use USER_TYPE_BASE_ROUTE */
export const ROLE_BASE_ROUTE: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: '/platform',
    [UserRole.TENANT_ADMIN]: '/backoffice',
    [UserRole.STORE_MANAGER]: '/backoffice',
    [UserRole.POS_USER]: '/pos',
    [UserRole.KITCHEN_USER]: '/kds',
    [UserRole.CALL_CENTER_USER]: '/callcenter',
};

/** @deprecated Use USER_TYPE_DEFAULT_PAGE */
export const ROLE_DEFAULT_PAGE: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: '/platform/brands',
    [UserRole.TENANT_ADMIN]: '/backoffice/home',
    [UserRole.STORE_MANAGER]: '/backoffice/home',
    [UserRole.POS_USER]: '/pos',
    [UserRole.KITCHEN_USER]: '/kds/master',
    [UserRole.CALL_CENTER_USER]: '/callcenter/dashboard',
};

export function getBaseRoute(userType: UserType): string {
    return USER_TYPE_BASE_ROUTE[userType];
}

export function getDefaultPage(userType: UserType): string {
    return USER_TYPE_DEFAULT_PAGE[userType];
}

// ─── Hierarchy ──────────────────────────────────────────────────────────────

/**
 * User Type hierarchy level — higher number = more system authority.
 */
export const USER_TYPE_HIERARCHY: Record<UserType, number> = {
    [UserType.PLATFORM_SUPER_ADMIN]: 100,
    [UserType.PLATFORM_ADMIN]: 90,
    [UserType.PLATFORM_SUPPORT]: 85,
    [UserType.PLATFORM_OPERATIONS]: 85,
    [UserType.BRAND_ADMIN]: 80,
    [UserType.ADMIN]: 80,
    [UserType.MANAGER]: 60,
    [UserType.CALL_CENTER]: 40,
    [UserType.POS_USER]: 30,
    [UserType.KITCHEN_USER]: 30,
    [UserType.DELIVERY]: 20,
    [UserType.EMPLOYEE]: 25,
};

/** @deprecated Use USER_TYPE_HIERARCHY */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 100,
    [UserRole.TENANT_ADMIN]: 80,
    [UserRole.STORE_MANAGER]: 60,
    [UserRole.CALL_CENTER_USER]: 40,
    [UserRole.POS_USER]: 30,
    [UserRole.KITCHEN_USER]: 30,
};

// ─── Access Matrix ──────────────────────────────────────────────────────────

/**
 * Defines which route prefixes each user type is allowed to access.
 */
export const USER_TYPE_ACCESS_MATRIX: Record<UserType, string[]> = {
    [UserType.PLATFORM_SUPER_ADMIN]: ['/platform', '/backoffice', '/pos', '/kds', '/callcenter'],
    [UserType.PLATFORM_ADMIN]: ['/platform', '/backoffice'],
    [UserType.PLATFORM_SUPPORT]: ['/platform'],
    [UserType.PLATFORM_OPERATIONS]: ['/platform'],
    [UserType.BRAND_ADMIN]: ['/backoffice', '/pos', '/kds', '/callcenter'],
    [UserType.ADMIN]: ['/backoffice', '/pos', '/kds', '/callcenter'],
    [UserType.MANAGER]: ['/backoffice', '/pos', '/kds', '/callcenter'],
    [UserType.POS_USER]: ['/pos'],
    [UserType.KITCHEN_USER]: ['/kds'],
    [UserType.CALL_CENTER]: ['/callcenter'],
    [UserType.DELIVERY]: ['/backoffice'],
    [UserType.EMPLOYEE]: ['/backoffice'],
};

/** @deprecated Use USER_TYPE_ACCESS_MATRIX */
export const ROLE_ACCESS_MATRIX: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: ['/platform', '/backoffice', '/pos', '/kds', '/callcenter'],
    [UserRole.TENANT_ADMIN]: ['/backoffice', '/pos', '/kds', '/callcenter'],
    [UserRole.STORE_MANAGER]: ['/backoffice', '/pos', '/kds', '/callcenter'],
    [UserRole.POS_USER]: ['/pos'],
    [UserRole.KITCHEN_USER]: ['/kds'],
    [UserRole.CALL_CENTER_USER]: ['/callcenter'],
};

/**
 * Checks if a user type can access a specific route prefix.
 */
export function canAccessPrefix(userType: UserType, prefix: string): boolean {
    return USER_TYPE_ACCESS_MATRIX[userType]?.some((p) => prefix.startsWith(p)) ?? false;
}

/**
 * Checks if `userType` has access to a resource requiring `requiredType`.
 */
export function hasUserTypeAccess(userType: UserType, requiredType: UserType): boolean {
    return USER_TYPE_HIERARCHY[userType] >= USER_TYPE_HIERARCHY[requiredType];
}

/** @deprecated Use hasUserTypeAccess */
export function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Returns true if the given user type is a super admin.
 */
export function isSuperAdmin(userType: UserType | null): boolean {
    return userType === UserType.PLATFORM_SUPER_ADMIN;
}

/** @deprecated Use isSuperAdmin */
export function isSuperAdminRole(role: UserRole | null): boolean {
    return role === UserRole.SUPER_ADMIN;
}

// ─── Convenience Exports ────────────────────────────────────────────────────

/** All canonical user types as an array */
export const ALL_USER_TYPES = Object.values(UserType);

/** @deprecated Use ALL_USER_TYPES */
export const ALL_ROLES = Object.values(UserRole);

/** Management-level user types */
export const MANAGEMENT_TYPES: UserType[] = [
    UserType.PLATFORM_SUPER_ADMIN,
    UserType.PLATFORM_ADMIN,
    UserType.BRAND_ADMIN,
    UserType.ADMIN,
    UserType.MANAGER,
];

/** @deprecated Use MANAGEMENT_TYPES */
export const MANAGEMENT_ROLES: UserRole[] = [
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_MANAGER,
];

/** Operational user types */
export const OPERATIONAL_TYPES: UserType[] = [
    UserType.POS_USER,
    UserType.KITCHEN_USER,
    UserType.CALL_CENTER,
    UserType.DELIVERY,
    UserType.EMPLOYEE,
];

/** @deprecated Use OPERATIONAL_TYPES */
export const OPERATIONAL_ROLES: UserRole[] = [
    UserRole.POS_USER,
    UserRole.KITCHEN_USER,
    UserRole.CALL_CENTER_USER,
];
