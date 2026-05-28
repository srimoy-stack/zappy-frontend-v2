'use client';

import React, { useState } from 'react';
import {
    X, Store, AlertTriangle, HelpCircle, Layers, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useBulkOperationsStore, StoreAssignmentMode } from '../../state/bulkOperationsStore';
import { useCatalogStore } from '../../state/catalogStore';
import { cn } from '@/utils';

export const BulkAssignModal: React.FC = () => {
    const {
        selectedIds,
        activeBulkAction,
        closeBulkAction,
        clearSelection
    } = useBulkOperationsStore();

    const { items, updateItem } = useCatalogStore();

    const [scopeType, setScopeType] = useState<'ALL' | 'SPECIFIC'>('SPECIFIC');
    const [selectedStores, setSelectedStores] = useState<string[]>(['store-chicago']);
    const [assignMode, setAssignMode] = useState<StoreAssignmentMode>('MERGE');
    const [showImpactPreview, setShowImpactPreview] = useState(false);

    if (activeBulkAction !== 'ASSIGN_STORES') return null;

    const mockStores = [
        { id: 'store-chicago', name: 'Chicago Loop Outlet' },
        { id: 'store-newyork', name: 'Manhattan Broad Ave' },
        { id: 'store-miami', name: 'Miami Beach Plaza' }
    ];

    const affectedProductsCount = selectedIds.size;
    const targetStoresCount = scopeType === 'ALL' ? mockStores.length : selectedStores.length;

    const toggleStore = (id: string) => {
        setSelectedStores(curr =>
            curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]
        );
    };

    const handleApply = () => {
        const storeIds = scopeType === 'ALL' ? mockStores.map(s => s.id) : selectedStores;
        
        selectedIds.forEach(itemId => {
            const product = items.find(i => i.id === itemId);
            if (!product) return;

            let finalStoreIds = [...(product.scopeConfig?.targetedStoreIds || [])];

            if (assignMode === 'REPLACE') {
                finalStoreIds = storeIds;
            } else if (assignMode === 'MERGE') {
                finalStoreIds = Array.from(new Set([...finalStoreIds, ...storeIds]));
            } else if (assignMode === 'REMOVE') {
                finalStoreIds = finalStoreIds.filter(id => !storeIds.includes(id));
            }

            const nextScope = finalStoreIds.length === 0 ? 'GLOBAL' : 'STORE_SPECIFIC';

            updateItem(itemId, {
                scopeConfig: {
                    scope: nextScope as any,
                    targetedStoreIds: finalStoreIds
                }
            });
        });

        alert(`Successfully adjusted store scope assignments for ${affectedProductsCount} products!`);
        clearSelection();
        closeBulkAction();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-emerald-500" />
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                Bulk Store Scope Assignment
                            </h3>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">
                                Modify physical store visibility targets
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={closeBulkAction}
                        className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {!showImpactPreview ? (
                    <div className="p-6 space-y-5">
                        {/* Scope select */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Visibility scope</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setScopeType('ALL')}
                                    className={cn(
                                        "p-4 rounded-2xl border text-left transition-all",
                                        scopeType === 'ALL' 
                                            ? "border-slate-950 bg-slate-50/50 shadow-sm" 
                                            : "border-slate-200 hover:border-slate-350"
                                    )}
                                >
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">All Stores</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Deploy global omnichannel sync</span>
                                </button>
                                <button
                                    onClick={() => setScopeType('SPECIFIC')}
                                    className={cn(
                                        "p-4 rounded-2xl border text-left transition-all",
                                        scopeType === 'SPECIFIC' 
                                            ? "border-slate-950 bg-slate-50/50 shadow-sm" 
                                            : "border-slate-200 hover:border-slate-350"
                                    )}
                                >
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Target Specific Stores</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Scoped micro-overrides mapping</span>
                                </button>
                            </div>
                        </div>

                        {/* Stores Multiselect */}
                        {scopeType === 'SPECIFIC' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-150">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Select Target Stores</label>
                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-slate-100 rounded-2xl p-3 bg-slate-50/30">
                                    {mockStores.map(store => {
                                        const active = selectedStores.includes(store.id);
                                        return (
                                            <button
                                                key={store.id}
                                                onClick={() => toggleStore(store.id)}
                                                className={cn(
                                                    "w-full px-3.5 py-2.5 rounded-xl border text-left text-[10px] font-black uppercase tracking-wider flex items-center justify-between transition-all bg-white",
                                                    active ? "border-slate-900 text-slate-950 shadow-sm" : "border-slate-150 text-slate-500 hover:border-slate-300"
                                                )}
                                            >
                                                {store.name}
                                                {active && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Assignment Mode */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Scope Allocation mode</label>
                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-150">
                                {([
                                    { id: 'MERGE', label: 'Merge Map' },
                                    { id: 'REPLACE', label: 'Replace All' },
                                    { id: 'REMOVE', label: 'Remove Scope' }
                                ] as const).map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setAssignMode(m.id)}
                                        className={cn(
                                            "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                                            assignMode === m.id ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                        )}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary details banner */}
                        <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-slate-400" />
                            <div>
                                <span className="text-[9px] font-black text-slate-800 uppercase block">Impact parameters:</span>
                                <span className="text-[8.5px] text-slate-500 font-bold uppercase mt-0.5 block">
                                    Modifying <span className="text-slate-900 font-black">{affectedProductsCount} products</span> scoped across <span className="text-slate-900 font-black">{targetStoresCount} targeted stores</span>.
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Impact Preview Panel
                    <div className="p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="border border-amber-150 rounded-2xl p-4 bg-amber-50/20 space-y-2.5">
                            <div className="flex items-center gap-2 text-amber-700">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-[9.5px] font-black text-amber-900 uppercase tracking-wider">Enterprise Override Conflict Check</span>
                            </div>
                            <p className="text-[8.5px] text-amber-800 font-bold uppercase leading-relaxed">
                                Warning: {affectedProductsCount} items might possess active custom store-level pricing overrides. Applying a "Replace All" mode will wipe existing localized menus for selected stores.
                            </p>
                        </div>

                        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Proposed Allocation preview</span>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                                    <span>Allocation Mode:</span>
                                    <span className="text-slate-950 font-black">{assignMode}</span>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                                    <span>Affected Products Count:</span>
                                    <span className="text-slate-950 font-black">{affectedProductsCount}</span>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                                    <span>Target Store Count:</span>
                                    <span className="text-slate-950 font-black">{targetStoresCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer buttons */}
                <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button
                        onClick={closeBulkAction}
                        className="px-5 py-3 border border-slate-200 hover:border-slate-350 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all"
                    >
                        Cancel
                    </button>
                    {!showImpactPreview ? (
                        <button
                            onClick={() => setShowImpactPreview(true)}
                            className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                        >
                            Preview Impact
                        </button>
                    ) : (
                        <button
                            onClick={handleApply}
                            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                        >
                            Confirm Allocation
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
