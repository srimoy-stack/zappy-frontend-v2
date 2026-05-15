'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface ImpersonationSession {
    /** The brand being accessed */
    brandId: string;
    brandName: string;
    /** The Super Admin who initiated the session */
    actorId: string;
    actorName: string;
    /** ISO timestamp the session was created */
    startedAt: string;
    /** A pseudo-token (real backend would return a signed JWT) */
    token: string;
    /** Session expiry in ms since epoch  — 2 hours */
    expiresAt: number;
}

interface ImpersonationContextType {
    /** Null when not impersonating */
    session: ImpersonationSession | null;
    /** Returns true if a valid, non-expired session exists */
    isImpersonating: boolean;
    /**
     * Begin an impersonation session.
     * In a real system this would call an API to generate a signed token;
     * here it creates a local mock session and logs an audit event.
     */
    startImpersonation: (
        brandId: string,
        brandName: string,
        actor: { id: string; name: string }
    ) => ImpersonationSession;
    /** End the current impersonation session and return audit data */
    endImpersonation: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'zyappy_impersonation_session';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

function buildToken(brandId: string, actorId: string): string {
    // Pseudo-token (not cryptographically secure — replace with backend JWT in prod)
    const payload = btoa(JSON.stringify({ brandId, actorId, ts: Date.now() }));
    return `imp_${payload}`;
}

function readStoredSession(): ImpersonationSession | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed: ImpersonationSession = JSON.parse(raw);
        // Expire check
        if (Date.now() > parsed.expiresAt) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

function logAuditEvent(event: Record<string, unknown>) {
    // In production, POST to /api/audit
    console.info('[IMPERSONATION AUDIT]', JSON.stringify(event));
}

// ─── Context ────────────────────────────────────────────────────────────────────

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(
    undefined
);

export const useImpersonation = (): ImpersonationContextType => {
    const ctx = useContext(ImpersonationContext);
    if (!ctx) throw new Error('useImpersonation must be used within ImpersonationProvider');
    return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────────

export const ImpersonationProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [session, setSession] = useState<ImpersonationSession | null>(null);

    // Rehydrate from sessionStorage on mount
    useEffect(() => {
        setSession(readStoredSession());
    }, []);

    const isImpersonating =
        session !== null && Date.now() <= session.expiresAt;

    const startImpersonation = useCallback(
        (
            brandId: string,
            brandName: string,
            actor: { id: string; name: string }
        ): ImpersonationSession => {
            const now = Date.now();
            const newSession: ImpersonationSession = {
                brandId,
                brandName,
                actorId: actor.id,
                actorName: actor.name,
                startedAt: new Date(now).toISOString(),
                token: buildToken(brandId, actor.id),
                expiresAt: now + SESSION_DURATION_MS,
            };

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
            setSession(newSession);

            logAuditEvent({
                event: 'IMPERSONATION_STARTED',
                brandId,
                brandName,
                actorId: actor.id,
                actorName: actor.name,
                timestamp: newSession.startedAt,
                expiresAt: new Date(newSession.expiresAt).toISOString(),
                token: newSession.token,
            });

            return newSession;
        },
        []
    );

    const endImpersonation = useCallback(() => {
        if (!session) return;

        logAuditEvent({
            event: 'IMPERSONATION_ENDED',
            brandId: session.brandId,
            brandName: session.brandName,
            actorId: session.actorId,
            actorName: session.actorName,
            startedAt: session.startedAt,
            endedAt: new Date().toISOString(),
        });

        sessionStorage.removeItem(SESSION_KEY);
        setSession(null);
    }, [session]);

    return (
        <ImpersonationContext.Provider
            value={{ session, isImpersonating, startImpersonation, endImpersonation }}
        >
            {children}
        </ImpersonationContext.Provider>
    );
};
