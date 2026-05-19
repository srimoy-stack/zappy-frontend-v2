'use client';

/**
 * useModuleAccess — Module entitlement checking.
 *
 * Wraps ModuleContext for component-level access checks.
 */

import { useModules } from '@/shared/contexts/ModuleContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { resolveRole, isSuperAdminRole } from '@/shared/types/auth';

export function useModuleAccess() {
    const { enabledModules, isModuleEnabled } = useModules();
    const { role: rawRole } = useAuth();

    const resolved = resolveRole(rawRole as string);
    const isSuperAdmin = isSuperAdminRole(resolved);

    /** Check if a module is enabled for this tenant */
    function hasModule(moduleId: string): boolean {
        if (isSuperAdmin) return true;
        return isModuleEnabled(moduleId);
    }

    /** Check if ANY of the listed modules are enabled */
    function hasAnyModule(moduleIds: string[]): boolean {
        if (isSuperAdmin) return true;
        return moduleIds.some((id) => isModuleEnabled(id));
    }

    return {
        enabledModules,
        hasModule,
        hasAnyModule,
        isSuperAdmin,
    };
}
