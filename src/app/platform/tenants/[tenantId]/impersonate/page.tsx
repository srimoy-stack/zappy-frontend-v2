'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { useImpersonation } from '@/app/providers/ImpersonationProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { UserType } from '@/shared/types/auth';

// ─── Mock Brand Name Resolver ────────────────────────────────────────────────────
// In production, resolve this from your API using the tenantId from the URL.
const BRAND_NAMES: Record<string, string> = {
    'brand-001': 'Acme Pizza Co.',
    'brand-002': 'QuickBite Foods Ltd.',
    'brand-003': 'Burger Nation Inc.',
    'brand-004': 'Sushi Express Holdings',
    'brand-005': 'Taco Loco Restaurants',
    'brand-006': 'Noodle House Asia',
    'brand-007': 'Café Bonheur Inc.',
    'brand-008': 'Prairie Grills Ltd.',
    'brand-009': 'Harvest Bowl Co.',
    'brand-010': 'Flame & Grill Steakhouse',
    'brand-011': 'Coastal Catches Seafood',
    'brand-012': 'Golden Wok Group',
};

// ─── Component ──────────────────────────────────────────────────────────────────

/**
 * ImpersonatePage
 *
 * This route acts as the secure handoff point:
 *   /platform/tenants/[tenantId]/impersonate
 *
 * On mount it:
 *  1. Validates the current user is SUPER_ADMIN
 *  2. Creates an impersonation session via ImpersonationProvider
 *  3. Shows a brief confirmation UI
 *  4. Redirects to /backoffice/home
 *
 * No credentials are ever exposed.
 */
export default function ImpersonatePage() {
    const router = useRouter();
    const params = useParams();
    const tenantId = params?.tenantId as string;
    const brandName = BRAND_NAMES[tenantId] ?? `Brand ${tenantId}`;

    const { role, user } = useAuth();
    const { startImpersonation } = useImpersonation();

    const [phase, setPhase] = useState<'authorizing' | 'generating' | 'redirecting' | 'denied'>(
        'authorizing'
    );

    useEffect(() => {
        if (!tenantId) return;

        // Guard: only SUPER_ADMIN may impersonate
        if (role !== UserType.PLATFORM_SUPER_ADMIN) {
            setPhase('denied');
            return;
        }

        // Simulate async token generation (real backend call would go here)
        setPhase('generating');

        const generate = async () => {
            // Artificial brief delay to show UX confirmation screen
            await new Promise((r) => setTimeout(r, 1200));

            startImpersonation(tenantId, brandName, {
                id: user?.id ?? 'unknown-admin',
                name: user?.name ?? 'Platform Super Admin',
            });

            setPhase('redirecting');
            await new Promise((r) => setTimeout(r, 700));
            router.replace('/backoffice/items');
        };

        generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, role]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">

                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                                <ShieldAlert className="w-10 h-10 text-white" />
                            </div>
                            {(phase === 'generating' || phase === 'redirecting') && (
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center border-2 border-slate-900 shadow-lg">
                                    {phase === 'redirecting' ? (
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    ) : (
                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {phase === 'denied' ? (
                        <div className="text-center space-y-4">
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                Access Denied
                            </h1>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Only <span className="text-white font-bold">Platform Super Admins</span> can
                                access brand impersonation.
                            </p>
                            <button
                                onClick={() => router.back()}
                                className="mt-6 w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-sm font-bold transition-all"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-5">
                            <div>
                                <p className="text-[11px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">
                                    {phase === 'authorizing' && 'Authorizing…'}
                                    {phase === 'generating' && 'Generating Secure Session…'}
                                    {phase === 'redirecting' && 'Session Ready — Redirecting…'}
                                </p>
                                <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                                    {brandName}
                                </h1>
                                <p className="text-sm text-slate-400 mt-1">Back Office Access</p>
                            </div>

                            {/* Progress Steps */}
                            <div className="space-y-3 py-4">
                                <ProgressStep
                                    label="Authenticating Super Admin"
                                    done={phase !== 'authorizing'}
                                    active={phase === 'authorizing'}
                                />
                                <ProgressStep
                                    label="Generating Impersonation Token"
                                    done={phase === 'redirecting'}
                                    active={phase === 'generating'}
                                />
                                <ProgressStep
                                    label="Opening Brand Admin Session"
                                    done={false}
                                    active={phase === 'redirecting'}
                                />
                            </div>

                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                This access is being{' '}
                                <span className="text-slate-300 font-bold">
                                    logged and time-limited
                                </span>
                                . Session expires in 2 hours.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Sub-component ──────────────────────────────────────────────────────────────

function ProgressStep({
    label,
    done,
    active,
}: {
    label: string;
    done: boolean;
    active: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${done
                    ? 'bg-emerald-500'
                    : active
                        ? 'bg-amber-500/20 border-2 border-amber-400'
                        : 'bg-white/5 border border-white/10'
                    }`}
            >
                {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : active ? (
                    <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                ) : null}
            </div>
            <span
                className={`text-[12px] font-medium transition-colors ${done
                    ? 'text-emerald-400'
                    : active
                        ? 'text-white font-bold'
                        : 'text-slate-600'
                    }`}
            >
                {label}
            </span>
        </div>
    );
}
