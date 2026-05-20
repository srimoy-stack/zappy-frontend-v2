'use client';
import React, { useMemo } from 'react';
import { LayoutGrid } from 'lucide-react';
import { FormSectionTitle } from './ui';
import { ModuleTreeSelector } from '@/modules/platform/components/tenants/ModuleTreeSelector';
import { getModuleNodes } from '@/shared/config/modules';

interface ModuleStepProps {
    selectedPaths: string[];
    onUpdatePaths: (paths: string[]) => void;
}

/**
 * Phase 1 modules — only these are available for selection during onboarding.
 * All other modules are rendered as "Coming Soon" (visible but not toggleable).
 * POS is always-on (isCore), so it doesn't need to be listed here.
 */
const PHASE_1_MODULE_IDS = new Set([
    'email-campaigns',
    'ai-call-analytics',
]);

/**
 * ModuleStep — Registry-driven module entitlement configuration.
 *
 * The registry IS the canonical module tree.
 * Modules NOT in PHASE_1_MODULE_IDS are shown as "Coming Soon".
 */
export function ModuleStep({ selectedPaths, onUpdatePaths }: ModuleStepProps) {
    // Registry is static — loaded at import time, zero async
    const moduleNodes = getModuleNodes();

    // Filter out system modules (e.g. Settings) — they're auto-provisioned
    const configurableModules = moduleNodes.filter(
        (node) => !node.isSystem && node.status === 'active'
    );

    // Modules not in Phase 1 → "Coming Soon" (visible, greyed out, not toggleable)
    // Updated: All entitlements are now active and selectable
    const comingSoonIds = useMemo(() => new Set<string>(), []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <FormSectionTitle icon={LayoutGrid} title="Granular Entitlements" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-4">
                    Configure high-fidelity access control. Enable parent modules and select specific sub-modules or pages to provision.
                </p>
                
                <ModuleTreeSelector 
                    modules={configurableModules}
                    selectedPaths={selectedPaths}
                    onChange={onUpdatePaths}
                    comingSoonIds={comingSoonIds}
                />
            </section>
        </div>
    );
}
