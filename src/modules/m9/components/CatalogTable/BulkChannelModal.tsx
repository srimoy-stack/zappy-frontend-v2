'use client';

import React, { useState } from 'react';
import {
    X, Globe, AlertTriangle, CheckCircle2, ShieldAlert, BookOpen, Sparkles
} from 'lucide-react';
import { useBulkOperationsStore } from '../../state/bulkOperationsStore';
import { useCatalogStore } from '../../state/catalogStore';
import { cn } from '@/utils';

export const BulkChannelModal: React.FC = () => {
    const {
        selectedIds,
        activeBulkAction,
        closeBulkAction,
        clearSelection
    } = useBulkOperationsStore();

    const { items, updateItem } = useCatalogStore();

    const [channels, setChannels] = useState<string[]>(['POS', 'ONLINE']);
    const [actionType, setActionType] = useState<'ASSIGN' | 'REMOVE' | 'PUBLISH'>('ASSIGN');
    const [showCompatibilityReport, setShowCompatibilityReport] = useState(false);

    if (activeBulkAction !== 'ASSIGN_CHANNELS') return null;

    const mockChannels = [
        { id: 'POS', name: 'POS Terminal System' },
        { id: 'ONLINE', name: 'Online Direct Ordering' },
        { id: 'UBER_EATS', name: 'Uber Eats Marketplace' },
        { id: 'DOORDASH', name: 'DoorDash Marketplace' }
    ];

    const affectedCount = selectedIds.size;

    // Simulate runtime validation compatibility reporting
    const ineligibleItems: { name: string; reasons: string[] }[] = [];
    selectedIds.forEach(id => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const errors: string[] = [];
        // High toppings/modifier groups incompatible with Uber Eats strict schemas
        if (item.modifierGroups && item.modifierGroups.length > 5) {
            errors.push('Modifier pool count exceeds aggregator limit (Max: 5)');
        }
        if (item.productType === 'COMBO' && channels.includes('UBER_EATS')) {
            errors.push('Marketplace partner does not support nested deal components.');
        }

        if (errors.length > 0) {
            ineligibleItems.push({ name: item.name, reasons: errors });
        }
    });

    const isFullyCompatible = ineligibleItems.length === 0;

    const toggleChannel = (id: string) => {
        setChannels(curr =>
            curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]
        );
    };

    const handleApply = () => {
        selectedIds.forEach(itemId => {
            const product = items.find(i => i.id === itemId);
            if (!product) return;

            let finalChannels = [...(product.channelVisibility || [])];

            if (actionType === 'ASSIGN') {
                finalChannels = Array.from(new Set([...finalChannels, ...channels]));
            } else if (actionType === 'REMOVE') {
                finalChannels = finalChannels.filter(c => !channels.includes(c));
            }

            updateItem(itemId, {
                channelVisibility: finalChannels
            });
        });

        alert(`Successfully updated channel mappings for ${affectedCount} products across ${channels.length} channels!`);
        clearSelection();
        closeBulkAction();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                OmniChannel Visibility Sync
                            </h3>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">
                                Publish products across omnichannel catalogs
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

                {!showCompatibilityReport ? (
                    <div className="p-6 space-y-5">
                        
                        {/* Selector type */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Action Scope Type</label>
                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-150">
                                {([
                                    { id: 'ASSIGN', label: 'Assign Maps' },
                                    { id: 'REMOVE', label: 'Remove Maps' },
                                    { id: 'PUBLISH', label: 'Publish Direct' }
                                ] as const).map(act => (
                                    <button
                                        key={act.id}
                                        onClick={() => setActionType(act.id)}
                                        className={cn(
                                            "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                                            actionType === act.id ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                        )}
                                    >
                                        {act.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Channels selection */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Select Publishing Channels</label>
                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-slate-100 rounded-2xl p-3 bg-slate-50/30">
                                {mockChannels.map(ch => {
                                    const active = channels.includes(ch.id);
                                    return (
                                        <button
                                            key={ch.id}
                                            onClick={() => toggleChannel(ch.id)}
                                            className={cn(
                                                "w-full px-3.5 py-2.5 rounded-xl border text-left text-[10px] font-black uppercase tracking-wider flex items-center justify-between transition-all bg-white",
                                                active ? "border-slate-900 text-slate-950 shadow-sm" : "border-slate-150 text-slate-500 hover:border-slate-300"
                                            )}
                                        >
                                            {ch.name}
                                            {active && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Compatibility Report View
                    <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto animate-in fade-in duration-200">
                        {isFullyCompatible ? (
                            <div className="border border-emerald-150 rounded-2xl p-4 bg-emerald-50/20 flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <span className="text-[10px] font-black text-emerald-950 uppercase block">100% Fully Compatible</span>
                                    <span className="text-[8px] text-emerald-700 font-bold uppercase mt-0.5 block">
                                        All chosen items strictly conform to marketplace schema restrictions!
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="border border-rose-150 rounded-2xl p-4 bg-rose-50/20 flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    <div>
                                        <span className="text-[10px] font-black text-rose-950 uppercase block">Schema Compatibility Conflict</span>
                                        <span className="text-[8px] text-rose-700 font-bold uppercase mt-0.5 block">
                                            {ineligibleItems.length} products fail external marketplace schema checks.
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Ineligibility Diagnostics</span>
                                    <div className="space-y-2">
                                        {ineligibleItems.map((item, idx) => (
                                            <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 text-left">
                                                <span className="text-[9px] font-black text-slate-900 uppercase block">{item.name}</span>
                                                <ul className="list-disc pl-4 text-[8px] text-rose-600 font-bold uppercase mt-1 space-y-0.5">
                                                    {item.reasons.map((r, ri) => (
                                                        <li key={ri}>{r}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button
                        onClick={closeBulkAction}
                        className="px-5 py-3 border border-slate-200 hover:border-slate-350 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all"
                    >
                        Cancel
                    </button>
                    {!showCompatibilityReport ? (
                        <button
                            onClick={() => setShowCompatibilityReport(true)}
                            className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                        >
                            Validate Compatibility
                        </button>
                    ) : (
                        <button
                            onClick={handleApply}
                            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                        >
                            Confirm Publish
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
