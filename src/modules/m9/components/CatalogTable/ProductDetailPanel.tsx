'use client';

import React from 'react';
import {
    X, Package, Store, Globe, Target, RefreshCw, Sparkles, Layers,
    Clock, ShieldAlert, BadgeAlert, ArrowUpRight, DollarSign, ListFilter, Play
} from 'lucide-react';
import { useBulkOperationsStore } from '../../state/bulkOperationsStore';
import { useCatalogStore } from '../../state/catalogStore';
import { mockCategories } from '../../mock/items';
import { cn } from '@/utils';

interface ProductDetailPanelProps {
    onEdit: (item: any) => void;
}

export const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({ onEdit }) => {
    const {
        detailPanelItemId,
        isDetailPanelOpen,
        closeDetailPanel
    } = useBulkOperationsStore();

    const { items, publishDraft } = useCatalogStore();

    const item = items.find(i => i.id === detailPanelItemId);

    if (!isDetailPanelOpen || !item) return null;

    const category = mockCategories.find(c => c.id === item.categoryId);
    const activeSync = item.channelSyncs?.find(c => c.channelId === 'POS')?.status || 'SYNCED';

    const allVariants = item.variantGroups?.flatMap(vg => vg.variants) || [];
    const minPrice = allVariants.length > 0 ? Math.min(...allVariants.map(v => v.basePrice)) : item.baseProductPrice || 0;
    const maxPrice = allVariants.length > 0 ? Math.max(...allVariants.map(v => v.basePrice)) : item.baseProductPrice || 0;

    // Check runtime conflicts/warnings
    const conflicts: string[] = [];
    if (item.productType === 'COMBO' && (!item.comboSlots || item.comboSlots.length === 0)) {
        conflicts.push('Combo Slots are unconfigured.');
    }
    if (allVariants.length === 0 && !item.baseProductPrice) {
        conflicts.push('Missing master price architecture.');
    }
    if (item.taxRate !== undefined && item.taxRate === 0) {
        conflicts.push('Zero-tax rating scope configured.');
    }

    const handlePublish = async () => {
        const ok = await publishDraft(item.id);
        if (ok) {
            alert(`Product ${item.name} published successfully!`);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-slate-200/80 shadow-2xl z-[90] flex flex-col animate-in slide-in-from-right duration-350">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-xl">
                        <Package className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Operational Details</span>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider block mt-0.5 max-w-[200px] truncate">
                            {item.name}
                        </h3>
                    </div>
                </div>
                <button
                    onClick={closeDetailPanel}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Scrollable content body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Image & Quick Action */}
                <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <Package className="w-8 h-8 text-slate-200" />
                        )}
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-150 rounded text-[8px] font-black uppercase tracking-wider">
                                {category?.name || 'No Category'}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-black uppercase tracking-wider">
                                {item.productType}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed line-clamp-2">
                            {item.description || 'No description assigned.'}
                        </p>
                    </div>
                </div>

                {/* Primary stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Price Range</span>
                        <span className="text-sm font-black text-slate-900 font-mono mt-1 block">
                            ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                        </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Status</span>
                        <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border mt-1.5",
                            item.isAvailable 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                            {item.isAvailable ? 'Operational' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {/* Runtime Conflicts/Health Warnings */}
                {conflicts.length > 0 && (
                    <div className="border border-amber-100 rounded-xl p-4 bg-amber-50/20 space-y-2">
                        <div className="flex items-center gap-2 text-amber-700">
                            <ShieldAlert className="w-4 h-4" />
                            <span className="text-[9px] font-black text-amber-900 uppercase tracking-wider">Runtime Health Warning</span>
                        </div>
                        <ul className="space-y-1 pl-4 list-disc text-[9px] text-amber-800 font-bold uppercase">
                            {conflicts.map((c, i) => (
                                <li key={i}>{c}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Scope & Overrides */}
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Target Scope Assignment</span>
                    <div className="border border-slate-100 rounded-xl p-4 bg-white space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-black uppercase">Publish Scope</span>
                            <span className="text-[9px] font-black text-slate-950 uppercase">{item.scopeConfig?.scope || 'GLOBAL'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-black uppercase">Overridden Stores</span>
                            <span className="text-[9px] font-black text-amber-600 uppercase">
                                {item.storeOverridesResolver?.length || item.storeOverrides?.length || 0} Stores
                            </span>
                        </div>
                    </div>
                </div>

                {/* Channel Compatibility Matrix */}
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Omnichannel Compatibility Matrix</span>
                    <div className="border border-slate-100 rounded-xl p-4 bg-white space-y-3.5 shadow-sm">
                        {([
                            { id: 'POS', label: 'POS Terminal', check: item.channelVisibility?.includes('POS') },
                            { id: 'ONLINE', label: 'Online Storefront', check: item.channelVisibility?.includes('ONLINE') },
                            { id: 'UBER_EATS', label: 'Uber Eats Marketplace', check: true },
                            { id: 'DOORDASH', label: 'DoorDash Marketplace', check: true }
                        ]).map(ch => (
                            <div key={ch.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[9.5px] text-slate-700 font-black uppercase">{ch.label}</span>
                                </div>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                                    ch.check ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                                )}>
                                    {ch.check ? 'COMPATIBLE' : 'DISENGAGED'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Variants Architecture */}
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Structural Variant Groups</span>
                    {item.variantGroups && item.variantGroups.length > 0 ? (
                        <div className="space-y-2">
                            {item.variantGroups.map(vg => (
                                <div key={vg.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between">
                                    <div>
                                        <span className="text-[9.5px] font-black text-slate-800 uppercase block">{vg.name}</span>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">
                                            {vg.variants.length} Options
                                        </span>
                                    </div>
                                    <span className="text-[8.5px] font-black text-slate-900 font-mono">
                                        ${Math.min(...vg.variants.map(v => v.basePrice))} - ${Math.max(...vg.variants.map(v => v.basePrice))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-[9.5px] text-slate-400 font-bold italic">No variant groups configured.</span>
                    )}
                </div>

                {/* Sync Audit logs */}
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Synchronization Logs</span>
                    <div className="border border-slate-100 rounded-xl p-4 bg-white space-y-3.5 shadow-sm">
                        {item.channelSyncs?.map(c => (
                            <div key={c.channelId} className="flex items-start justify-between">
                                <div>
                                    <span className="text-[9.5px] font-black text-slate-800 uppercase block">{c.channelId} Connector</span>
                                    {c.lastSyncedAt && (
                                        <span className="text-[7.5px] text-slate-400 font-mono block mt-0.5">
                                            SYNCED: {new Date(c.lastSyncedAt).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono",
                                    c.status === 'SYNCED' ? "bg-emerald-50 text-emerald-700" :
                                    c.status === 'FAILED' ? "bg-rose-50 text-rose-700 animate-pulse" : "bg-amber-50 text-amber-700"
                                )}>
                                    {c.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="p-6 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <button
                    onClick={() => { closeDetailPanel(); onEdit(item); }}
                    className="flex-1 py-3 border border-slate-200 hover:border-slate-350 text-slate-800 hover:bg-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                    <Layers className="w-3.5 h-3.5 text-slate-500" /> Edit Product
                </button>
                {activeSync === 'DRAFT' && (
                    <button
                        onClick={handlePublish}
                        className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-100 flex items-center justify-center gap-1.5"
                    >
                        <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" /> Publish Changes
                    </button>
                )}
            </div>
        </div>
    );
};
