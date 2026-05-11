'use client';

/**
 * ModuleGate — Blocks children if a module is not enabled.
 *
 * Usage:
 *   <ModuleGate module="inventory">
 *     <InventoryPage />
 *   </ModuleGate>
 *
 *   <ModuleGate module="kds" fallback={<UpgradeBanner />}>
 *     <KDSDashboard />
 *   </ModuleGate>
 */

import React, { ReactNode } from 'react';
import { useModuleAccess } from '@/shared/hooks/useModuleAccess';
import { Lock } from 'lucide-react';

interface ModuleGateProps {
    children: ReactNode;
    /** Module ID to check */
    module: string;
    /** Custom fallback when module is disabled */
    fallback?: ReactNode;
    /** If true, render nothing instead of the default disabled screen */
    silent?: boolean;
}

function DefaultModuleDisabled({ moduleId }: { moduleId: string }) {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
            <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-10 flex flex-col items-center text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Lock className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-slate-900">Module Not Available</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            The <span className="font-semibold text-slate-700">{moduleId}</span> module
                            is not enabled for your organization. Contact your administrator to activate it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ModuleGate({ children, module, fallback, silent = false }: ModuleGateProps) {
    const { hasModule } = useModuleAccess();

    if (!hasModule(module)) {
        if (silent) return null;
        if (fallback) return <>{fallback}</>;
        return <DefaultModuleDisabled moduleId={module} />;
    }

    return <>{children}</>;
}
