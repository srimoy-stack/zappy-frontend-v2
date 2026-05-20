'use client';

import React, { useState, useMemo } from 'react';
import { ModuleTreeSelector } from '../tenants/ModuleTreeSelector';
import { getModuleNodes } from '@/shared/config/modules';
import { LayoutGrid, Save, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/shared/api/apiClient';

interface ModulesTabProps {
    tenantId: string;
    initialPaths: string[];
}

export function ModulesTab({ tenantId, initialPaths }: ModulesTabProps) {
    const [selectedPaths, setSelectedPaths] = useState<string[]>(initialPaths);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleChange = (paths: string[]) => {
        setSelectedPaths(paths);
        setIsDirty(true);
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const modules = selectedPaths.map(id => ({
                moduleId: id,
                purchased: true,
                enabled: true,
            }));
            // API call — PUT /tenants/{tenantId}/modules
            await apiClient.put(`/tenants/${tenantId}/modules`, { modules });
            setIsDirty(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('[ModulesTab] Save failed:', err);
            alert('Failed to update entitlements. Changes were not saved.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSelectedPaths(initialPaths);
        setIsDirty(false);
        setSaveSuccess(false);
    };

    const moduleNodes = getModuleNodes();
    const configurableModules = moduleNodes.filter(
        (node) => !node.isSystem && node.status === 'active'
    );

    const enabledCount = selectedPaths.length;
    const totalAvailable = configurableModules.length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <LayoutGrid size={18} />
                        Module Entitlements
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {enabledCount} of {totalAvailable} modules enabled — synced with onboarding entitlements step.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                            <CheckCircle2 size={14} /> Saved
                        </span>
                    )}
                    {isDirty && (
                        <>
                            <button onClick={handleReset}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all">
                                <RotateCcw size={14} /> Revert
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                                <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Entitlement Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <span className="text-2xl font-black text-emerald-600">{enabledCount}</span>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Enabled</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <span className="text-2xl font-black text-slate-400">{totalAvailable - enabledCount}</span>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Available</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <span className="text-2xl font-black text-slate-900">{totalAvailable}</span>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Modules</span>
                </div>
            </div>

            {/* Tree Selector — uses same getModuleNodes() as onboarding */}
            <ModuleTreeSelector
                modules={configurableModules}
                selectedPaths={selectedPaths}
                onChange={handleChange}
            />
        </div>
    );
}
