'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types';

interface AuthContextType {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    role: UserRole | null;
    tenantId: string | null;
    storeIds: string[];
    enabledModules: string[];
    accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider — Reads from the real NextAuth session (JWT-backed).
 *
 * Phase 1: Admin-only login via Laravel JWT backend.
 * Phase 2: Multi-tenant RBAC with tenant_id, store_ids, and granular roles.
 *
 * The `accessToken` is the Laravel JWT token stored in the NextAuth session,
 * used by the axios interceptor to authenticate API requests.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { data: session, status } = useSession();

    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated' && !!session?.user;

    const user = session?.user ?? null;
    const sessionUser = session?.user as any;

    // Map the backend role to the frontend UserRole type
    // Phase 1: backend sends 'admin' → map to 'ADMIN'
    const mapRole = (backendRole: string | undefined): UserRole | null => {
        if (!backendRole) return null;
        const roleMap: Record<string, UserRole> = {
            'admin': 'ADMIN',
            'brand_admin': 'BRAND_ADMIN',
            'store_manager': 'STORE_MANAGER',
            'employee': 'EMPLOYEE',
            'pos_user': 'POS_USER',
            'kds_user': 'KDS_USER',
            'platform_super_admin': 'PLATFORM_SUPER_ADMIN',
        };
        return roleMap[backendRole.toLowerCase()] || 'ADMIN';
    };

    const value: AuthContextType = {
        user: user ? {
            id: sessionUser?.id || sessionUser?.sub || 'unknown',
            name: user.name,
            email: user.email,
            role: mapRole(sessionUser?.role) || 'ADMIN',
            tenantId: sessionUser?.tenantId || null,
            storeIds: sessionUser?.storeIds || [],
        } : null,
        isAuthenticated,
        isLoading,
        role: mapRole(sessionUser?.role),
        tenantId: sessionUser?.tenantId || null,
        storeIds: sessionUser?.storeIds || [],
        accessToken: sessionUser?.accessToken || null,
        // Phase 1: all modules enabled for admin
        enabledModules: ['pos', 'inventory', 'kiosk', 'kds', 'messaging', 'email-campaigns', 'analytics'],
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
