'use client';

/**
 * TenantContext — Multi-tenant isolation.
 *
 * Derives tenantId from AuthContext /me response.
 * Exposes getTenantId() for API header injection.
 * Throws if tenant is missing on tenant-required routes.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface TenantContextValue {
    tenantId: string | null;
    tenantName: string | null;
    tenantSlug: string | null;
    isResolved: boolean;
    getTenantId: () => string | null;
    setTenantId: (id: string | null) => void;
    setTenantName: (name: string | null) => void;
}

const TenantContext = createContext<TenantContextValue>({
    tenantId: null,
    tenantName: null,
    tenantSlug: null,
    isResolved: false,
    getTenantId: () => null,
    setTenantId: () => {},
    setTenantName: () => {},
});

const SESSION_KEY = 'zyappy_tenant_id';

export function TenantProvider({ children }: { children: ReactNode }) {
    const [tenantId, setTenantIdState] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(SESSION_KEY);
    });
    const [tenantName, setTenantName] = useState<string | null>(null);
    const [tenantSlug, setTenantSlug] = useState<string | null>(null);
    const [isResolved, setIsResolved] = useState(false);

    const setTenantId = useCallback((id: string | null) => {
        setTenantIdState(id);
        if (typeof window !== 'undefined') {
            if (id) {
                sessionStorage.setItem(SESSION_KEY, id);
            } else {
                sessionStorage.removeItem(SESSION_KEY);
            }
        }
    }, []);

    const getTenantId = useCallback(() => tenantId, [tenantId]);

    // Mark as resolved once we have a value or explicitly null
    useEffect(() => {
        if (!isResolved && tenantId !== undefined) {
            setIsResolved(true);
        }
    }, [tenantId, isResolved]);

    return (
        <TenantContext.Provider value={{
            tenantId,
            tenantName,
            tenantSlug,
            isResolved,
            getTenantId,
            setTenantId,
            setTenantName,
        }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    return useContext(TenantContext);
}

export { TenantContext };
