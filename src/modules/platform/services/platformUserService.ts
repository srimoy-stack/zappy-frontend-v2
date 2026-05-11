import { api } from '@/shared/api';
import { UserType, PLATFORM_USER_TYPES } from '@/shared/types/auth';

export interface PlatformUser {
    id: string;
    fullName: string;
    email: string;
    status: 'Active' | 'Disabled';
    userType: UserType;
    roleId: string;
    roleName: string;
    createdAt: string;
    lastLogin?: string;
}

/** Platform user type labels for UI display */
export const PLATFORM_USER_TYPE_LABELS: Record<string, string> = {
    [UserType.PLATFORM_SUPER_ADMIN]: 'Super Admin',
    [UserType.PLATFORM_ADMIN]: 'Platform Admin',
    [UserType.PLATFORM_SUPPORT]: 'Support',
    [UserType.PLATFORM_OPERATIONS]: 'Operations',
};

export const platformUserService = {
    // Platform Roles
    getRoles: async () => {
        const roles = await api.getRoles();
        return roles;
    },

    createRole: async (data: { name: string; description: string; permissions: string[] }) => {
        return api.createRole(data);
    },

    updateRole: async (id: string, data: any) => {
        return api.updateRole(id, data);
    },

    deleteRole: async (id: string) => {
        return api.deleteRole(id);
    },

    /**
     * Fetch platform-scoped users only (tenant_id = null).
     * Queries all platform user types and merges results.
     */
    getUsers: async (): Promise<PlatformUser[]> => {
        const results: PlatformUser[] = [];

        for (const userType of PLATFORM_USER_TYPES) {
            try {
                const response = await api.getUsers({ userType });
                const mapped = response.data.map((u: any) => ({
                    id: u.id,
                    fullName: u.fullName || u.name,
                    email: u.email,
                    status: u.status === 'Active' ? 'Active' as const : 'Disabled' as const,
                    userType: userType,
                    roleId: u.role?.id || '',
                    roleName: u.role?.name || 'No Role',
                    createdAt: u.createdAt,
                    lastLogin: u.lastLogin,
                }));
                results.push(...mapped);
            } catch {
                // Continue loading other types even if one fails
            }
        }

        return results;
    },

    /**
     * Create a platform user. tenant_id is always null.
     * Only platform user types are allowed.
     */
    createUser: async (data: {
        fullName: string;
        email: string;
        roleId: string;
        userType: UserType;
    }) => {
        if (!PLATFORM_USER_TYPES.includes(data.userType)) {
            throw new Error(`Invalid platform user type: ${data.userType}. Tenant users must be created from the tenant detail page.`);
        }

        return api.createUser({
            fullName: data.fullName,
            email: data.email,
            userType: data.userType,
            roleId: data.roleId,
            assignedStoreIds: [], // Platform users are never store-scoped
        });
    },
};
