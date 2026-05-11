'use client';

/**
 * EntitlementContext — Runtime Entitlement State
 *
 * Auto-seeds from AuthContext.entitlementPaths.
 * No circular dependency — placed AFTER AuthProvider in the tree.
 *
 * Provides:
 * - O(1) entitlement checks via Set
 * - Legacy isModuleEnabled() compatibility
 * - Access level resolution combining entitlement + RBAC
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
    isEntitled as checkEntitled,
    resolveAccess,
    deriveEnabledModules,
} from './entitlementResolver';
import type { AccessLevel } from '@/shared/config/accessMatrix';

// ─── Context Shape ───────────────────────────────────────────────────────────

interface EntitlementContextValue {
    /** Full hierarchical entitlement paths */
    entitlementPaths: string[];
    /** Flat list of root module IDs (legacy compat) */
    enabledModules: string[];
    /** O(1) check if a specific entitlement path is active */
    isEntitled: (path: string) => boolean;
    /** Legacy: check module-level enablement */
    isModuleEnabled: (moduleId: string) => boolean;
    /** Get combined access level (entitlement + RBAC) for current user */
    getAccessLevel: (entitlementKey: string) => AccessLevel;
    /** Admin setter — used during onboarding and config */
    setEntitlementPaths: (paths: string[]) => void;
}

const EntitlementContext = createContext<EntitlementContextValue>({
    entitlementPaths: [],
    enabledModules: [],
    isEntitled: () => false,
    isModuleEnabled: () => false,
    getAccessLevel: () => 'hidden',
    setEntitlementPaths: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function EntitlementProvider({ children }: { children: ReactNode }) {
    const { userType, isSuperAdmin: isSA, entitlementPaths: authPaths } = useAuth();
    const [localPaths, setLocalPaths] = useState<string[]>([]);

    // Auto-seed from AuthContext when auth hydrates
    useEffect(() => {
        if (authPaths && authPaths.length > 0) {
            setLocalPaths(authPaths);
        }
    }, [authPaths]);

    // Use local state (allows admin overrides during onboarding)
    const entitlementPaths = localPaths;

    const enabledModules = useMemo(
        () => deriveEnabledModules(entitlementPaths),
        [entitlementPaths]
    );

    const isEntitled = useCallback(
        (path: string): boolean => {
            if (isSA) return true;
            return checkEntitled(path, entitlementPaths);
        },
        [entitlementPaths, isSA]
    );

    const isModuleEnabled = useCallback(
        (moduleId: string): boolean => {
            if (isSA) return true;
            return enabledModules.includes(moduleId);
        },
        [enabledModules, isSA]
    );

    const getAccessLevel = useCallback(
        (entitlementKey: string): AccessLevel => {
            if (!userType) return 'hidden';
            return resolveAccess(userType, entitlementKey, entitlementPaths);
        },
        [userType, entitlementPaths]
    );

    const setEntitlementPaths = useCallback((paths: string[]) => {
        setLocalPaths(paths);
    }, []);

    const value = useMemo<EntitlementContextValue>(
        () => ({
            entitlementPaths,
            enabledModules,
            isEntitled,
            isModuleEnabled,
            getAccessLevel,
            setEntitlementPaths,
        }),
        [entitlementPaths, enabledModules, isEntitled, isModuleEnabled, getAccessLevel, setEntitlementPaths]
    );

    return (
        <EntitlementContext.Provider value={value}>
            {children}
        </EntitlementContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useEntitlements() {
    const ctx = useContext(EntitlementContext);
    if (!ctx) throw new Error('useEntitlements must be used within EntitlementProvider');
    return ctx;
}

export { EntitlementContext };
