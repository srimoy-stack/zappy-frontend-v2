import React, { useState } from 'react';
import { 
    Layers3, Lock, Unlock, Settings2, RefreshCw, 
    Check, X, Building2, Store, HelpCircle 
} from 'lucide-react';
import { useCatalogStore } from '../../state/catalogStore';
import { OverrideResolver } from '../../engines/OverrideResolver';
import { PricingEngine } from '../../engines/PricingEngine';
import { cn } from '@/utils';

export const OverrideGridPanel: React.FC = () => {
    const { items, updateItem } = useCatalogStore();
    const [selectedStoreId, setSelectedStoreId] = useState<string>('store-chicago');
    
    // Inline editing states: itemId -> value
    const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});

    const stores = [
        { id: 'store-chicago', name: 'Chicago Loop Outlet', city: 'Chicago' },
        { id: 'store-newyork', name: 'Manhattan Broad Ave', city: 'New York' },
        { id: 'store-miami', name: 'Miami Beach Center', city: 'Miami' }
    ];

    const handleUnlockField = (itemId: string, currentPrice: number) => {
        // Unlock price field by applying an override equal to master price (initially inherited value)
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const updatedItem = OverrideResolver.applyOverride(item, selectedStoreId, 'price', currentPrice);
        updateItem(item.id, updatedItem);
    };

    const handleSaveOverride = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const value = editingPrices[itemId];
        if (!value) return;

        const updatedItem = OverrideResolver.applyOverride(item, selectedStoreId, 'price', parseFloat(value));
        updateItem(item.id, updatedItem);

        // Clear local edit buffers
        const newEdits = { ...editingPrices };
        delete newEdits[itemId];
        setEditingPrices(newEdits);

        alert(`Successfully customized override price for ${item.name}!`);
    };

    const handleResetOverride = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const updatedItem = OverrideResolver.removeOverride(item, selectedStoreId, 'price');
        updateItem(item.id, updatedItem);

        alert(`Reverted ${item.name} overrides back to Brand Master defaults.`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3.5 mb-1.5">
                        <div className="p-2.5 bg-slate-900 rounded-2xl shadow-md">
                            <Layers3 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Store Level Overrides</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Audit store customized prices, unlock fields and reconcile deviations.</p>
                </div>

                {/* Location Selection Dropdown */}
                <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                        value={selectedStoreId}
                        onChange={(e) => setSelectedStoreId(e.target.value)}
                        className="pl-10 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider outline-none focus:border-slate-950 transition-all appearance-none cursor-pointer w-64"
                    >
                        {stores.map(st => (
                            <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 2. Visual legend instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-100 rounded-3xl p-6">
                <div className="flex items-start gap-3.5">
                    <Lock className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                        <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Inherited Locked</h5>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1">Value is strictly locked at brand level. Click to unlock.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3.5">
                    <Unlock className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div>
                        <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none">Inherited Unlocked</h5>
                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight mt-1">Ready for custom store overrides.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3.5">
                    <Settings2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                        <h5 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest leading-none">Overridden State</h5>
                        <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-tight mt-1">Active local pricing. Reset to restore master rates.</p>
                    </div>
                </div>
            </div>

            {/* 3. Main Overrides Matrix Grid */}
            <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
                    Store Multi-Variant Pricing Overrides Matrix
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Identity</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Variant</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Brand Master Price</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Override Visual State</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Deviated Pricing / Lock Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[10px] font-bold text-slate-700">
                            {items.map(item => {
                                const activeVariant = item.variantGroups[0]?.variants[0];
                                if (!activeVariant) return null;

                                const isOverridden = OverrideResolver.isFieldOverridden(item, selectedStoreId, 'price');
                                const resolvedPrice = PricingEngine.calculateBasePrice(item, activeVariant.id, selectedStoreId);
                                
                                const isEditing = editingPrices[item.id] !== undefined;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="py-4.5 font-black text-slate-900 uppercase tracking-tight">{item.name}</td>
                                        <td className="py-4.5 font-mono text-slate-500 uppercase">{activeVariant.name}</td>
                                        <td className="py-4.5 font-mono text-slate-900">${activeVariant.basePrice.toFixed(2)}</td>
                                        <td className="py-4.5">
                                            {isOverridden ? (
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] uppercase tracking-wider font-black flex items-center gap-1.5 w-fit">
                                                    <Settings2 className="w-2.5 h-2.5" /> Customized
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-full text-[8px] uppercase tracking-wider font-bold flex items-center gap-1.5 w-fit">
                                                    <Lock className="w-2.5 h-2.5" /> Inherited
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4.5 text-right">
                                            <div className="flex items-center justify-end gap-3.5">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="number"
                                                            step="0.01"
                                                            value={editingPrices[item.id]}
                                                            onChange={(e) => setEditingPrices({ ...editingPrices, [item.id]: e.target.value })}
                                                            className="px-3 py-1.5 bg-slate-50 border border-slate-900 rounded-xl text-[10px] font-mono outline-none w-24 text-right"
                                                        />
                                                        <button 
                                                            onClick={() => handleSaveOverride(item.id)}
                                                            className="p-1.5 bg-slate-950 text-white rounded-lg hover:bg-slate-900"
                                                        >
                                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingPrices({ ...editingPrices, [item.id]: undefined as any })}
                                                            className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                                        >
                                                            <X className="w-3.5 h-3.5 text-slate-400" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {isOverridden ? (
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-mono text-emerald-600">${resolvedPrice.toFixed(2)}</span>
                                                                <button 
                                                                    onClick={() => setEditingPrices({ ...editingPrices, [item.id]: resolvedPrice.toString() })}
                                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] uppercase tracking-wide transition-all"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleResetOverride(item.id)}
                                                                    className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                                                                    title="Reset override price to brand master defaults"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleUnlockField(item.id, activeVariant.basePrice)}
                                                                className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-900 text-slate-500 hover:text-slate-950 text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                                                            >
                                                                <Unlock className="w-3 h-3 text-amber-500" /> Custom Price
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
