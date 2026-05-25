'use client';

import React, { useState } from 'react';
import {
    Package, Plus, Trash2, Beaker, ChevronDown, AlertCircle
} from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { RecipeFormEntry } from '../../../../types/wizard';
import { cn } from '@/utils';

const UNIT_OPTIONS: RecipeFormEntry['unit'][] = ['kg', 'g', 'liter', 'ml', 'piece'];

const COMMON_INGREDIENTS = [
    { name: 'Pizza Dough', unit: 'piece' as const, qty: 1, cost: 0.80 },
    { name: 'Mozzarella Cheese', unit: 'g' as const, qty: 150, cost: 0.02 },
    { name: 'Tomato Sauce', unit: 'ml' as const, qty: 60, cost: 0.01 },
    { name: 'Pepperoni', unit: 'g' as const, qty: 40, cost: 0.03 },
    { name: 'Mushroom', unit: 'g' as const, qty: 30, cost: 0.02 },
    { name: 'Green Pepper', unit: 'g' as const, qty: 25, cost: 0.01 },
    { name: 'Chicken Breast', unit: 'g' as const, qty: 60, cost: 0.04 },
    { name: 'Paneer', unit: 'g' as const, qty: 50, cost: 0.05 },
    { name: 'Soda Can', unit: 'piece' as const, qty: 1, cost: 0.45 },
    { name: 'Dip Cup', unit: 'piece' as const, qty: 1, cost: 0.30 },
    { name: 'Wing Piece', unit: 'piece' as const, qty: 1, cost: 0.35 },
    { name: 'Pasta Noodle', unit: 'g' as const, qty: 200, cost: 0.015 },
];

export const InventoryRecipeStep: React.FC = () => {
    const { formData, updateFormData } = useWizardStore();
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newQty, setNewQty] = useState(1);
    const [newUnit, setNewUnit] = useState<RecipeFormEntry['unit']>('piece');
    const [newCost, setNewCost] = useState(0);

    const recipe = formData.recipe || [];

    const addEntry = (entry: Omit<RecipeFormEntry, 'id'>) => {
        const newEntry: RecipeFormEntry = {
            id: 'ing-' + Date.now() + '-' + Math.random().toString(36).substring(7),
            ...entry,
        };
        updateFormData('recipe', [...recipe, newEntry]);
    };

    const updateEntry = (id: string, updates: Partial<RecipeFormEntry>) => {
        updateFormData('recipe', recipe.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const removeEntry = (id: string) => {
        updateFormData('recipe', recipe.filter(r => r.id !== id));
    };

    const handleManualAdd = () => {
        if (!newName.trim()) return;
        addEntry({
            ingredientName: newName.trim(),
            quantity: newQty,
            unit: newUnit,
            costPerUnit: newCost,
        });
        setNewName('');
        setNewQty(1);
        setNewCost(0);
    };

    const totalCost = recipe.reduce((sum, r) => sum + (r.quantity * (r.costPerUnit || 0)), 0);

    return (
        <div className="space-y-7 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="p-3 bg-slate-950 rounded-2xl shadow-md">
                    <Beaker className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory & Recipe (BOM)</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                        Map raw ingredients for accurate inventory deduction • {recipe.length} ingredient{recipe.length !== 1 ? 's' : ''}
                    </p>
                </div>
                {totalCost > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-right">
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wider block">Est. COGS</span>
                        <span className="text-sm font-mono font-black text-emerald-800">${totalCost.toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Quick Add from Common Ingredients */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Add Common Ingredients</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Click to instantly add standard BOM entries</p>
                    </div>
                    <button onClick={() => setShowQuickAdd(!showQuickAdd)}
                        className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 hover:text-slate-900 transition-all">
                        {showQuickAdd ? 'Hide' : 'Show'} <ChevronDown className={cn("w-3 h-3 transition-transform", showQuickAdd && "rotate-180")} />
                    </button>
                </div>

                {showQuickAdd && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 animate-in slide-in-from-top-1 duration-150">
                        {COMMON_INGREDIENTS.map(ing => {
                            const alreadyAdded = recipe.some(r => r.ingredientName === ing.name);
                            return (
                                <button key={ing.name} onClick={() => !alreadyAdded && addEntry({
                                    ingredientName: ing.name,
                                    quantity: ing.qty,
                                    unit: ing.unit,
                                    costPerUnit: ing.cost,
                                })}
                                    disabled={alreadyAdded}
                                    className={cn("p-3 border rounded-xl text-left transition-all text-[10px]",
                                        alreadyAdded
                                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-600 opacity-60 cursor-default"
                                            : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]")}>
                                    <span className="font-black uppercase tracking-wider block">{ing.name}</span>
                                    <span className="text-[8px] text-slate-400 font-mono block mt-0.5">
                                        {ing.qty} {ing.unit} • ${ing.cost}/{ing.unit}
                                        {alreadyAdded && ' ✓'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Manual Ingredient Entry */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Add Custom Ingredient</h4>
                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Ingredient Name *</label>
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Olive Oil"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 placeholder:text-slate-300"
                            onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Quantity</label>
                        <input type="number" step="0.01" value={newQty} onChange={(e) => setNewQty(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Unit</label>
                        <select value={newUnit} onChange={(e) => setNewUnit(e.target.value as RecipeFormEntry['unit'])}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                            {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Cost/Unit ($)</label>
                        <input type="number" step="0.001" value={newCost} onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900" />
                    </div>
                    <div className="col-span-2 flex items-end">
                        <button onClick={handleManualAdd} disabled={!newName.trim()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95">
                            <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Recipe Table */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {recipe.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">No ingredients mapped yet</span>
                        <span className="text-[9px] text-slate-300 font-medium block mt-1">Use Quick Add above or add custom ingredients</span>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Ingredient</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Cost/Unit</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Line Cost</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recipe.map(entry => (
                                <tr key={entry.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-5 py-3.5 text-[10px] font-black text-slate-900 uppercase tracking-wider">{entry.ingredientName}</td>
                                    <td className="px-5 py-3.5">
                                        <input type="number" step="0.01" value={entry.quantity}
                                            onChange={(e) => updateEntry(entry.id, { quantity: parseFloat(e.target.value) || 0 })}
                                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900" />
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <select value={entry.unit} onChange={(e) => updateEntry(entry.id, { unit: e.target.value as RecipeFormEntry['unit'] })}
                                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none">
                                            {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs font-mono font-bold text-slate-600">${(entry.costPerUnit || 0).toFixed(3)}</td>
                                    <td className="px-5 py-3.5 text-xs font-mono font-bold text-emerald-700">${(entry.quantity * (entry.costPerUnit || 0)).toFixed(2)}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button onClick={() => removeEntry(entry.id)}
                                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-slate-200 bg-slate-50/80">
                                <td colSpan={4} className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-right">Total Estimated COGS</td>
                                <td className="px-5 py-3 text-sm font-mono font-black text-emerald-800">${totalCost.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>

            {/* Margin Indicator */}
            {recipe.length > 0 && formData.baseProductPrice > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Gross Margin Estimate</h5>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Based on base price ${formData.baseProductPrice.toFixed(2)} and estimated COGS ${totalCost.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <span className={cn("text-xl font-mono font-black",
                            ((formData.baseProductPrice - totalCost) / formData.baseProductPrice * 100) > 60 ? "text-emerald-600" :
                            ((formData.baseProductPrice - totalCost) / formData.baseProductPrice * 100) > 30 ? "text-amber-600" : "text-rose-600")}>
                            {((formData.baseProductPrice - totalCost) / formData.baseProductPrice * 100).toFixed(1)}%
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mt-0.5">Gross Margin</span>
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                    <h5 className="text-[10px] font-black text-blue-900 uppercase tracking-wider leading-none">Inventory Deduction Protocol</h5>
                    <p className="text-[9px] text-blue-700 font-bold uppercase tracking-tight mt-1 leading-normal">
                        Each ingredient listed here is deducted independently per order. For deals with multiple slots, each slot deducts its own recipe independently. COGS are estimated — actual deduction occurs at order fulfillment via the backend Inventory Engine.
                    </p>
                </div>
            </div>
        </div>
    );
};
