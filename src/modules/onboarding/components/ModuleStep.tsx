'use client';
import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { FormSectionTitle } from './ui';
import { ModuleTreeSelector } from '@/modules/platform/components/tenants/ModuleTreeSelector';
import { getModuleNodes } from '@/shared/config/modules';

interface ModuleStepProps {
    selectedPaths: string[];
    onUpdatePaths: (paths: string[]) => void;
}

/**
 * ModuleStep — Registry-driven module entitlement configuration.
 *
 * No longer fetches modules from the API.
 * The registry IS the canonical module tree.
 * The API only stores which paths are enabled for this tenant.
 */
export function ModuleStep({ selectedPaths, onUpdatePaths }: ModuleStepProps) {
    // Registry is static — loaded at import time, zero async
    const moduleNodes = getModuleNodes();

    // Filter out system modules (e.g. Settings) — they're auto-provisioned
    const configurableModules = moduleNodes.filter(
        (node) => !node.isSystem && node.status === 'active'
    );

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
                />
            </section>
        </div>
    );
}
