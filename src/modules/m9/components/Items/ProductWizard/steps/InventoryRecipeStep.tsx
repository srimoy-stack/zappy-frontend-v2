'use client';

import React, { useState, useMemo } from 'react';
import {
    Package, Plus, Trash2, Beaker, ChevronDown, AlertCircle,
    Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { RecipeFormEntry } from '../../../../types/wizard';
import { WizardSearch, WizardFilterChips, WizardPagination, paginateArray } from '../shared/WizardListControls';
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

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const InventoryRecipeStep: React.FC = () => {
    const { formData, updateFormData } = useWizardStore();
    const [newName, setNewName] = useState('');
    const [newQty, setNewQty] = useState(1);
    const [newUnit, setNewUnit] = useState<RecipeFormEntry['unit']>('piece');
    const [newCost, setNewCost] = useState(0);

    // Search & pagination state for mapped ingredients list
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Quick Add Library state
    const [quickAddSearch, setQuickAddSearch] = useState('');
    const [quickAddFilter, setQuickAddFilter] = useState('all');
    const [quickAddPage, setQuickAddPage] = useState(1);
    const QUICK_ADD_PAGE_SIZE = 8;

    const QUICK_ADD_FILTER_OPTIONS = [
        { id: 'all', label: 'All Items' },
        { id: 'weighed', label: 'Weighed (g/kg)' },
        { id: 'liquid', label: 'Liquid (ml/l)' },
        { id: 'piece', label: 'Pieces' },
    ];

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

    // ─── Filtered & Paginated Mapped Recipe ──────────────────────────────
    const filteredRecipe = useMemo(() => {
        if (!searchQuery.trim()) return recipe;
        const q = searchQuery.toLowerCase();
        return recipe.filter(r =>
            r.ingredientName.toLowerCase().includes(q) ||
            r.unit.toLowerCase().includes(q)
        );
    }, [recipe, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredRecipe.length / pageSize));

    // Clamp current page if it exceeds total after filter/delete
    const safePage = Math.min(currentPage, totalPages);
    if (safePage !== currentPage) setCurrentPage(safePage);

    const paginatedRecipe = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredRecipe.slice(start, start + pageSize);
    }, [filteredRecipe, safePage, pageSize]);

    const startIdx = filteredRecipe.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const endIdx = Math.min(safePage * pageSize, filteredRecipe.length);

    // ─── Filtered & Paginated Quick Add Library ──────────────────────────────
    const filteredCommonIngredients = useMemo(() => {
        let result = COMMON_INGREDIENTS;
        if (quickAddSearch.trim()) {
            const q = quickAddSearch.toLowerCase();
            result = result.filter(i => i.name.toLowerCase().includes(q));
        }

        if (quickAddFilter === 'weighed') {
            result = result.filter(i => ['g', 'kg'].includes(i.unit));
        } else if (quickAddFilter === 'liquid') {
            result = result.filter(i => ['ml', 'liter'].includes(i.unit));
        } else if (quickAddFilter === 'piece') {
            result = result.filter(i => i.unit === 'piece');
        }

        return result;
    }, [quickAddSearch, quickAddFilter]);

    const totalQuickAddPages = Math.max(1, Math.ceil(filteredCommonIngredients.length / QUICK_ADD_PAGE_SIZE));
    const paginatedCommonIngredients = paginateArray(filteredCommonIngredients, quickAddPage, QUICK_ADD_PAGE_SIZE);

    const handleQuickAddSearchChange = (v: string) => { setQuickAddSearch(v); setQuickAddPage(1); };
    const handleQuickAddFilterChange = (v: string) => { setQuickAddFilter(v); setQuickAddPage(1); };

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
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Inventory Recipe</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Quick Add Common Ingredients • Click to instantly add standard BOM entries</p>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <WizardSearch
                        value={quickAddSearch}
                        onChange={handleQuickAddSearchChange}
                        placeholder="Search common ingredients..."
                    />
                    <WizardFilterChips
                        options={QUICK_ADD_FILTER_OPTIONS}
                        activeId={quickAddFilter}
                        onChange={handleQuickAddFilterChange}
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {paginatedCommonIngredients.map(ing => {
                            const alreadyAdded = recipe.some(r => r.ingredientName === ing.name);
                            return (
                                <button key={ing.name} onClick={() => !alreadyAdded && addEntry({
                                    ingredientName: ing.name,
                                    quantity: ing.qty,
                                    unit: ing.unit,
                                    costPerUnit: ing.cost,
                                })}
                                    disabled={alreadyAdded}
                                    className={cn("p-3.5 border rounded-xl text-left transition-all",
                                        alreadyAdded
                                            ? "bg-emerald-50/50 border-emerald-250 text-emerald-700 opacity-70 cursor-default"
                                            : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]")}>
                                    <span className="font-bold text-slate-900 text-xs block">{ing.name}</span>
                                    <span className="text-[9px] text-slate-600 font-bold block mt-1">
                                        {ing.qty} {ing.unit} • ${ing.cost.toFixed(2)}/{ing.unit}
                                        {alreadyAdded && ' ✓'}
                                    </span>
                                </button>
                            );
                        })}
                        {paginatedCommonIngredients.length === 0 && (
                            <span className="col-span-full text-center py-4 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                No matching ingredients found
                            </span>
                        )}
                    </div>

                    {/* Quick Add Pagination */}
                    <WizardPagination
                        currentPage={quickAddPage}
                        totalPages={totalQuickAddPages}
                        totalItems={filteredCommonIngredients.length}
                        pageSize={QUICK_ADD_PAGE_SIZE}
                        onPageChange={setQuickAddPage}
                        className="mt-2"
                    />
                </div>
            </div>

            {/* Manual Ingredient Entry (Commented Out) */}
            {/* 
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Add Custom Ingredient</h4>
                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Ingredient Name *</label>
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Olive Oil"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-300"
                            onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Quantity</label>
                        <input type="number" step="0.01" value={newQty} onChange={(e) => setNewQty(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Unit</label>
                        <select value={newUnit} onChange={(e) => setNewUnit(e.target.value as RecipeFormEntry['unit'])}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 appearance-none">
                            {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Cost/Unit ($)</label>
                        <input type="number" step="0.001" value={newCost} onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
                    </div>
                    <div className="col-span-2 flex items-end">
                        <button onClick={handleManualAdd} disabled={!newName.trim()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95">
                            <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add
                        </button>
                    </div>
                </div>
            </div>
            */}

            {/* Recipe Table with Search & Pagination */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {recipe.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">No ingredients mapped yet</span>
                        <span className="text-[9px] text-slate-300 font-medium block mt-1">Use Quick Add above or add custom ingredients</span>
                    </div>
                ) : (
                    <>
                        {/* Search Bar & Controls */}
                        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    placeholder="Search ingredients by name or unit..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 shadow-sm rounded-xl text-[10px] font-bold outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                    {filteredRecipe.length === recipe.length
                                        ? `${recipe.length} total`
                                        : `${filteredRecipe.length} of ${recipe.length} shown`}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Per page</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                        className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 appearance-none cursor-pointer"
                                    >
                                        {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
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
                                    {paginatedRecipe.map(entry => (
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
                                    {paginatedRecipe.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-8 text-center">
                                                <Search className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                                    No ingredients match "{searchQuery}"
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-slate-200 bg-slate-50/80">
                                        <td colSpan={4} className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-right">Total Estimated COGS</td>
                                        <td className="px-5 py-3 text-sm font-mono font-black text-emerald-800">${totalCost.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                Showing {startIdx}–{endIdx} of {filteredRecipe.length} ingredient{filteredRecipe.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={safePage === 1}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    title="First page"
                                >
                                    <ChevronsLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    title="Previous page"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>

                                {/* Page number buttons */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        // Show first, last, current, and neighbors
                                        if (page === 1 || page === totalPages) return true;
                                        if (Math.abs(page - safePage) <= 1) return true;
                                        return false;
                                    })
                                    .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                                        if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                                        acc.push(page);
                                        return acc;
                                    }, [])
                                    .map((item, i) => (
                                        item === 'ellipsis' ? (
                                            <span key={`e-${item}-${i}`} className="px-1 text-[9px] text-slate-300 font-bold">…</span>
                                        ) : (
                                            <button
                                                key={item}
                                                onClick={() => setCurrentPage(item)}
                                                className={cn(
                                                    "w-7 h-7 rounded-lg text-[10px] font-black transition-all",
                                                    item === safePage
                                                        ? "bg-slate-950 text-white shadow-sm"
                                                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                                                )}
                                            >
                                                {item}
                                            </button>
                                        )
                                    ))
                                }

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    title="Next page"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={safePage === totalPages}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    title="Last page"
                                >
                                    <ChevronsRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </>
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
