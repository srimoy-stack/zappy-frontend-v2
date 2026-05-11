'use client';

/**
 * ModuleTreeSelector — Registry-Driven Entitlement Configuration
 *
 * Renders a hierarchical tree of modules → submodules → pages.
 * Used during Super Admin brand onboarding to configure tenant entitlements.
 *
 * Features:
 * - Parent/child propagation (select module → selects all descendants)
 * - Core module enforcement (POS always enabled, cannot deselect)
 * - Protected path enforcement (audit, settings always available)
 * - Partial-check state for parent nodes
 */

import React from 'react';
import { 
    ChevronRight, ChevronDown, CheckCircle2, 
    Circle, Lock, Info 
} from 'lucide-react';
import { cn } from '@/utils';
import type { RegistryNode } from '@/shared/config/modules/types';
import { getChildren, getDescendants, getNode } from '@/shared/config/modules';
import { resolveIcon } from '@/shared/config/modules/iconMap';

interface ModuleTreeSelectorProps {
    /** Root module nodes from the registry */
    modules: RegistryNode[];
    /** Currently selected entitlement paths */
    selectedPaths: string[];
    /** Called with updated paths */
    onChange: (paths: string[]) => void;
    isLoading?: boolean;
}

export const ModuleTreeSelector: React.FC<ModuleTreeSelectorProps> = ({
    modules,
    selectedPaths,
    onChange,
    isLoading,
}) => {
    const [expandedModules, setExpandedModules] = React.useState<string[]>([]);
    const pathSet = React.useMemo(() => new Set(selectedPaths || []), [selectedPaths]);

    const toggleExpand = (id: string) => {
        setExpandedModules(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const isSelected = (path: string) => pathSet.has(path);

    /**
     * Has at least one descendant selected but not all — for partial check state.
     */
    const hasPartialSelection = (path: string): boolean => {
        const descendants = getDescendants(path);
        if (descendants.length === 0) return false;
        const selectedCount = descendants.filter(d => pathSet.has(d)).length;
        return selectedCount > 0 && selectedCount < descendants.length;
    };

    /**
     * Toggle a path and propagate to descendants.
     * - Selecting a parent → selects all descendants
     * - Deselecting a parent → deselects all descendants
     */
    const togglePath = (path: string) => {
        const node = getNode(path);
        if (!node) return;

        // Core modules cannot be deselected
        if (node.isCore && isSelected(path)) return;

        const currentlySelected = isSelected(path);
        let newPaths = new Set(selectedPaths || []);

        if (currentlySelected) {
            // Deselect self and all descendants
            newPaths.delete(path);
            for (const desc of getDescendants(path)) {
                newPaths.delete(desc);
            }
        } else {
            // Select self and all descendants
            newPaths.add(path);
            for (const desc of getDescendants(path)) {
                newPaths.add(desc);
            }
        }

        onChange(Array.from(newPaths));
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {modules.map((module) => {
                const Icon = resolveIcon(module.icon);
                const childIds = getChildren(module.id);
                const hasChildren = childIds.length > 0;
                const isExpanded = expandedModules.includes(module.id);
                const moduleSelected = isSelected(module.id);
                const partial = hasPartialSelection(module.id);

                return (
                    <div key={module.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all">
                        {/* Module Header */}
                        <div className={cn(
                            "flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors",
                            moduleSelected ? "bg-emerald-50/30" : ""
                        )}>
                            <div className="flex items-center gap-4" onClick={() => hasChildren && toggleExpand(module.id)}>
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    moduleSelected ? "bg-emerald-100" : "bg-slate-100"
                                )}>
                                    <Icon size={16} className={moduleSelected ? "text-emerald-600" : "text-slate-600"} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-900">{module.label}</h4>
                                        {module.isCore && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-wider rounded-full">
                                                <Lock size={8} /> Core
                                            </span>
                                        )}
                                        {module.isBeta && (
                                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[8px] font-black uppercase tracking-wider rounded-full">
                                                Beta
                                            </span>
                                        )}
                                    </div>
                                    {module.description && (
                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{module.description}</p>
                                    )}
                                </div>
                                {hasChildren && (
                                    <div className="ml-2">
                                        {isExpanded ? (
                                            <ChevronDown size={14} className="text-slate-400" />
                                        ) : (
                                            <ChevronRight size={14} className="text-slate-400" />
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => togglePath(module.id)}
                                disabled={module.isCore && moduleSelected}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                    module.isCore && moduleSelected ? "bg-emerald-600 text-white opacity-80 cursor-not-allowed" :
                                    moduleSelected 
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                                        : partial
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                )}
                            >
                                {module.isCore ? <Lock size={14} /> : moduleSelected ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                {module.isCore ? 'Required' : moduleSelected ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>

                        {/* Submodules & Pages */}
                        {isExpanded && hasChildren && (
                            <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4">
                                {childIds.map((childId) => {
                                    const sub = getNode(childId);
                                    if (!sub) return null;

                                    const subSelected = isSelected(sub.id);
                                    const subChildren = getChildren(sub.id);

                                    return (
                                        <div key={sub.id} className="ml-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    <span className="text-xs font-bold text-slate-700">{sub.label}</span>
                                                    {sub.isProtected && (
                                                        <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                                            Protected
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    disabled={!moduleSelected || sub.isProtected}
                                                    onClick={() => togglePath(sub.id)}
                                                    className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest transition-colors",
                                                        !moduleSelected ? "text-slate-200 cursor-not-allowed" :
                                                        sub.isProtected ? "text-amber-500 cursor-not-allowed" :
                                                        subSelected ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                                                    )}
                                                >
                                                    {sub.isProtected ? 'Always On' : subSelected ? 'Active' : 'Enable'}
                                                </button>
                                            </div>

                                            {/* Pages */}
                                            {subChildren.length > 0 && (
                                                <div className="grid grid-cols-2 gap-2 ml-4">
                                                    {subChildren.map((pageId) => {
                                                        const page = getNode(pageId);
                                                        if (!page) return null;
                                                        const pageSelected = isSelected(page.id);

                                                        return (
                                                            <div 
                                                                key={page.id}
                                                                onClick={() => subSelected && togglePath(page.id)}
                                                                className={cn(
                                                                    "flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer",
                                                                    !subSelected ? "opacity-30 cursor-not-allowed border-transparent" :
                                                                    pageSelected 
                                                                        ? "bg-white border-emerald-200 shadow-sm" 
                                                                        : "bg-slate-100/50 border-transparent hover:border-slate-200"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-3 h-3 rounded-full border flex items-center justify-center",
                                                                    pageSelected ? "bg-emerald-600 border-emerald-600" : "border-slate-300"
                                                                )}>
                                                                    {pageSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-600">{page.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
