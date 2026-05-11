'use client';

/**
 * useImpersonation — Start/stop impersonation with audit logging.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logAction } from '@/shared/utils/auditLogger';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '@/shared/types/audit';

const IMPERSONATION_KEY = 'zyappy_impersonation';

interface ImpersonationTarget {
    tenantId: string;
    tenantName: string;
    userId?: string;
}

export function useImpersonation() {
    const router = useRouter();

    const startImpersonation = useCallback((target: ImpersonationTarget) => {
        try {
            sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(target));

            logAction({
                action: AUDIT_ACTIONS.IMPERSONATION_STARTED,
                entity: AUDIT_ENTITIES.SESSION,
                entityId: target.tenantId,
                metadata: {
                    tenantName: target.tenantName,
                    targetUserId: target.userId,
                },
            });

            router.push('/backoffice/home');
        } catch {
            // Never block UI
        }
    }, [router]);

    const stopImpersonation = useCallback(() => {
        try {
            const raw = sessionStorage.getItem(IMPERSONATION_KEY);
            const target = raw ? JSON.parse(raw) : null;

            sessionStorage.removeItem(IMPERSONATION_KEY);

            logAction({
                action: AUDIT_ACTIONS.IMPERSONATION_ENDED,
                entity: AUDIT_ENTITIES.SESSION,
                entityId: target?.tenantId,
                metadata: {
                    tenantName: target?.tenantName,
                },
            });

            router.push('/platform/tenants');
        } catch {
            router.push('/platform/tenants');
        }
    }, [router]);

    const isImpersonating = useCallback((): boolean => {
        try {
            return !!sessionStorage.getItem(IMPERSONATION_KEY);
        } catch {
            return false;
        }
    }, []);

    const getImpersonationTarget = useCallback((): ImpersonationTarget | null => {
        try {
            const raw = sessionStorage.getItem(IMPERSONATION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    return {
        startImpersonation,
        stopImpersonation,
        isImpersonating,
        getImpersonationTarget,
    };
}
