'use client';

/**
 * AuthContext — Shared authentication context.
 *
 * Fetches /me on mount. Seeds TenantContext and StoreContext.
 * Zero hardcoded values.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useTenant } from './TenantContext';
import { useStore } from './StoreContext';
import { useModules } from './ModuleContext';
import { UserType, resolveUserType, isSuperAdmin } from '@/shared/types/auth';
import { UserRoleRef } from '@/shared/types/user';
import { logAction } from '@/shared/utils/auditLogger';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '@/shared/types/audit';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    userType: UserType;
    role: UserRoleRef;
    tenantId?: string;
    tenantName?: string;
    storeIds?: string[];
    stores?: Array<{ id: string; name: string; code?: string }>;
    enabledModules?: string[];
    entitlementPaths?: string[];
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Authority Dimensions
    userType: UserType | null;
    roleName: string | null;
    permissions: string[];
    isSystemRole: boolean;
    isSuperAdmin: boolean;

    // Context Scopes
    tenantId: string | null;
    storeIds: string[];
    activeStoreId: string | null;
    enabledModules: string[];
    entitlementPaths: string[];

    // @deprecated Use userType
    role: UserType | null;
    accessToken: string | null;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    userType: null,
    roleName: null,
    permissions: [],
    isSystemRole: false,
    isSuperAdmin: false,
    tenantId: null,
    storeIds: [],
    activeStoreId: null,
    enabledModules: [],
    entitlementPaths: [],
    role: null,
    accessToken: null,
});

const getApiUrl = () => (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

// Role normalization now uses the canonical resolveRole() from auth.ts.
// All backend role strings are normalized to UserRole enum values.

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const { setTenantId, setTenantName } = useTenant();
    const { setStores } = useStore();
    const { setEnabledModules } = useModules();

    const [meData, setMeData] = useState<AuthUser | null>(null);
    const [meLoaded, setMeLoaded] = useState(false);

    const sessionLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const sessionUser = session?.user as any;
    const sessionIdentity = sessionUser?.id || sessionUser?.email || '';

    useEffect(() => {
        setMeData(null);
        setMeLoaded(false);
    }, [sessionIdentity]);

    // ── Fetch /me ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated || meLoaded) return;

        let cancelled = false;
        (async () => {
            try {
                const accessToken = sessionUser?.accessToken;
                if (!accessToken) {
                    throw new Error('Missing access token for auth/me');
                }

                const meRes = await fetch(`${getApiUrl()}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!meRes.ok) {
                    throw new Error(`auth/me failed with ${meRes.status}`);
                }

                const data = await meRes.json();
                if (cancelled) return;

                // Canonical UserType resolution
                const backendRole = data.role ?? sessionUser?.role;
                const resolvedUserType = resolveUserType(data.user_type || backendRole);
                
                // Normalizing backend role ref
                const roleRef: UserRoleRef = typeof data.role === 'object' && data.role !== null
                    ? {
                        id: String(data.role.id),
                        name: data.role.name,
                        permissions: data.role.permissions || [],
                        isSystem: !!data.role.is_system
                      }
                    : {
                        id: 'legacy',
                        name: typeof backendRole === 'string' ? backendRole : 'User',
                        permissions: data.permissions || sessionUser?.permissions || [],
                        isSystem: ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'ADMIN'].includes(resolvedUserType || '')
                      };

                const user: AuthUser = {
                    id: String(data.id || sessionUser?.id || ''),
                    name: data.name || data.full_name || sessionUser?.name || '',
                    email: data.email || sessionUser?.email || '',
                    userType: resolvedUserType || UserType.POS_USER,
                    role: roleRef,
                    tenantId: data.tenant?.id || data.tenant_id || sessionUser?.tenantId,
                    tenantName: data.tenant?.name,
                    storeIds: data.stores?.map((s: any) => s.id) || data.store_ids || sessionUser?.storeIds || [],
                    stores: data.stores || [],
                    enabledModules: data.enabledModules || [],
                    entitlementPaths: data.entitlementPaths || [],
                };

                setMeData(user);

                // ── Seed downstream contexts ──
                if (user.tenantId) setTenantId(user.tenantId);
                if (user.tenantName) setTenantName(user.tenantName);
                if (user.stores?.length) setStores(user.stores);
                if (user.enabledModules?.length) setEnabledModules(user.enabledModules);

                logAction({ 
                    action: AUDIT_ACTIONS.LOGIN, 
                    entity: AUDIT_ENTITIES.SESSION, 
                    entityId: user.id, 
                    metadata: { userType: user.userType, role: user.role.name, tenantId: user.tenantId } 
                });
            } catch (error) {
                console.error('Auth hydration failed:', error);
                // API unavailable — degrade gracefully, use session fallback
                if (!cancelled) {
                    const fallbackUserType = resolveUserType(sessionUser?.role) || UserType.POS_USER;
                    setMeData({
                        id: sessionUser?.id || '',
                        name: sessionUser?.name || '',
                        email: sessionUser?.email || '',
                        userType: fallbackUserType,
                        role: {
                            id: 'session',
                            name: sessionUser?.role || 'User',
                            permissions: sessionUser?.permissions || [],
                            isSystem: ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'ADMIN'].includes(fallbackUserType)
                        },
                        tenantId: sessionUser?.tenantId,
                        storeIds: sessionUser?.storeIds || [],
                        enabledModules: [],
                    });
                }
            } finally {
                if (!cancelled) setMeLoaded(true);
            }
        })();

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, meLoaded]);

    // ── Derive values ────────────────────────────────────────────────────────
    const userType = meData?.userType || null;
    const roleName = meData?.role.name || null;
    const permissions = meData?.role.permissions || [];
    const isSystemRole = meData?.role.isSystem || false;
    const isSuperAdminUser = isSuperAdmin(userType);
    const tenantId = meData?.tenantId || null;
    const storeIds = meData?.storeIds || [];
    const enabledModules = meData?.enabledModules || [];
    const entitlementPaths = meData?.entitlementPaths || [];

    const value: AuthContextValue = {
        user: meData,
        isAuthenticated,
        isLoading: sessionLoading || (isAuthenticated && !meLoaded),
        userType,
        roleName,
        permissions,
        isSystemRole,
        isSuperAdmin: isSuperAdminUser,
        tenantId,
        storeIds,
        activeStoreId: storeIds[0] || null,
        enabledModules,
        entitlementPaths,
        role: userType, // legacy support
        accessToken: sessionUser?.accessToken || null,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export { AuthContext };
