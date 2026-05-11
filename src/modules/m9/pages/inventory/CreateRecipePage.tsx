'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
    ArrowLeft,
    Save,
    Search,
    Trash2,
    ChefHat,
    Info,
    X,
    MapPin,
} from 'lucide-react';
import { InventoryItem, RecipeStatus, CreateRecipeDTO } from '../../types/inventory';
import { Item } from '../../types/items';
import { mockItems } from '../../mock/items';
import { inventoryItemService, recipeService } from '../../services/inventoryService';

interface IngredientRow {
    tempId: string;
    inventoryItemId: string;
    inventoryItemName: string;
    baseUnit: string;
    usageUnit: string;
    unitCost: number;
    quantityUsed: number;
    wastagePercentage: number;
}

// Unit Conversion Helpers

const USAGE_UNITS = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'piece'];

const convertToQt = (qty: number, from: string, to: string): number => {
    if (from === to) return qty;

    // Gram/Kg conversions
    if (to === 'Kilogram') {
        if (from === 'g') return qty / 1000;
        if (from === 'lb') return qty * 0.453592;
        if (from === 'oz') return qty * 0.0283495;
    }
    if (to === 'Gram') {
        if (from === 'kg') return qty * 1000;
    }

    // Liter/Ml conversions
    if (to === 'Liter') {
        if (from === 'ml') return qty / 1000;
        if (from === 'fl oz') return qty * 0.0295735;
    }
    if (to === 'Milliliter') {
        if (from === 'l') return qty * 1000;
    }

    // Simplified fallback (should be refined for strict production)
    if ((from === 'g' || from === 'ml') && (to === 'kg' || to === 'l')) return qty / 1000;
    if ((from === 'kg' || from === 'l') && (to === 'g' || to === 'ml')) return qty * 1000;

    return qty; // Fallback 1:1
};

/**
 * Create Recipe Page
 * 
 * Flow:
 * 1. Enter Recipe Name & Basic Info
 * 2. Search & Add Ingredients from Inventory
 * 3. Configure Quantity & Wastage per ingredient
 * 4. System auto-calc effective quantity & costs
 * 5. Save
 */
export const CreateRecipePage: React.FC = () => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<RecipeStatus>('Active');
    const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

    // Product Link State
    const [linkedProducts, setLinkedProducts] = useState<Item[]>([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [productSearchResults, setProductSearchResults] = useState<Item[]>([]);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
    const [allInventoryItems, setAllInventoryItems] = useState<InventoryItem[]>([]);

    useEffect(() => {
        loadInventoryItems();
    }, []);

    const loadInventoryItems = async () => {
        try {
            const data = await inventoryItemService.getAll({ status: 'Active' });
            setAllInventoryItems(data);
        } catch (error) {
            console.error('Failed to load inventory items:', error);
        } finally {
        }
    };

    // Filter items based on search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const results = allInventoryItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results.slice(0, 5)); // Limit to 5 results
    }, [searchTerm, allInventoryItems]);

    const handleAddIngredient = (item: InventoryItem) => {
        // Check if already added
        if (ingredients.some(ing => ing.inventoryItemId === item.id)) {
            alert('Ingredient already added to recipe');
            return;
        }

        const newIngredient: IngredientRow = {
            tempId: Date.now().toString(),
            inventoryItemId: item.id,
            inventoryItemName: item.name,
            baseUnit: item.baseUnit,
            usageUnit: item.baseUnit === 'Kilogram' ? 'g' : (item.baseUnit === 'Liter' ? 'ml' : 'piece'), // Smart default
            unitCost: item.averageCost,
            quantityUsed: 1, // Default 1
            wastagePercentage: 0 // Default 0
        };

        setIngredients([...ingredients, newIngredient]);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleRemoveIngredient = (tempId: string) => {
        setIngredients(ingredients.filter(ing => ing.tempId !== tempId));
    };

    const updateIngredient = (tempId: string, field: keyof IngredientRow, value: number) => {
        setIngredients(ingredients.map(ing => {
            if (ing.tempId === tempId) {
                // If value is string (unit change), cast properly
                return { ...ing, [field]: value };
            }
            return ing;
        }));
    };

    // Product Search Handlers
    useEffect(() => {
        if (!productSearchTerm.trim()) {
            setProductSearchResults([]);
            return;
        }
        const results = mockItems.filter(item =>
            item.name.toLowerCase().includes(productSearchTerm.toLowerCase())
        );
        setProductSearchResults(results);
    }, [productSearchTerm]);

    const handleAddProduct = (item: Item) => {
        if (linkedProducts.some(p => p.id === item.id)) {
            setProductSearchTerm('');
            setProductSearchResults([]);
            return;
        }
        setLinkedProducts([...linkedProducts, item]);
        setProductSearchTerm('');
        setProductSearchResults([]);
    };

    const handleRemoveProduct = (id: string) => {
        setLinkedProducts(linkedProducts.filter(p => p.id !== id));
    };

    // Calculations
    const calculateLineCost = (ing: IngredientRow) => {
        const convertedQty = convertToQt(ing.quantityUsed, ing.usageUnit, ing.baseUnit);
        const effectiveQty = convertedQty + (convertedQty * ing.wastagePercentage / 100);
        return effectiveQty * ing.unitCost;
    };

    const totalRecipeCost = ingredients.reduce((sum, ing) => sum + calculateLineCost(ing), 0);
    const totalIngredients = ingredients.length;

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('Recipe name is required');
            return;
        }

        if (ingredients.length === 0) {
            alert('Please add at least one ingredient');
            return;
        }

        setSubmitting(true);
        try {
            const recipeData: CreateRecipeDTO = {
                name,
                description,
                status,
                ingredients: ingredients.map(ing => ({
                    inventoryItemId: ing.inventoryItemId,
                    baseUnit: ing.baseUnit as any, // Cast assuming valid unit
                    quantityUsed: ing.quantityUsed,
                    wastagePercentage: ing.wastagePercentage
                })),
                linkedProductIds: linkedProducts.map(p => p.id)
            };

            await recipeService.create(recipeData, 'TENANT001'); // Mock tenant
            alert('Recipe created successfully!');
            router.push('/backoffice/inventory/recipes');
        } catch (error: any) {
            alert('Failed to create recipe: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.push('/backoffice/inventory/recipes')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Recipe</h1>
                    <p className="text-sm text-slate-500 font-medium">Define BOM and costings</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/backoffice/inventory/recipes')}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:from-orange-700 hover:to-orange-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {submitting ? 'Saving...' : 'Save Recipe'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: List & Configuration */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <Info size={18} className="text-slate-400" />
                            Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recipe Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Spicy Chicken Burger Patch"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Internal notes about preparation..."
                                    className="w-full p-4 rounded-xl border border-slate-200 font-medium text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                                <div className="flex p-1 bg-slate-100 rounded-xl">
                                    {(['Active', 'Inactive'] as const).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStatus(s)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${status === s
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <ChefHat size={18} className="text-slate-400" />
                                Ingredients
                            </h2>
                            <div className="relative w-72 group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search specific ingredient..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => { }}
                                    onBlur={() => { }}
                                    className="w-full h-10 pl-11 pr-4 bg-slate-50 rounded-xl border-none font-bold text-sm focus:ring-2 focus:ring-orange-500/20 text-slate-900 placeholder:text-slate-400"
                                />
                                {/* Dropdown */}
                                {searchTerm && searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                                        {searchResults.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleAddIngredient(item)}
                                                className="w-full text-left p-3 hover:bg-orange-50 flex items-center justify-between group/item"
                                            >
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 group-hover/item:text-orange-700">{item.name}</div>
                                                    <div className="text-xs font-medium text-slate-500">{item.sku}</div>
                                                </div>
                                                <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                    Stock: {item.currentStock} {item.baseUnit}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {ingredients.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ChefHat size={32} className="text-orange-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No Ingredients Added</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    Search for inventory items above to build your recipe bill of materials.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Ingredient</th>
                                            <th className="px-4 py-4 text-right">Unit Cost (Base)</th>
                                            <th className="px-4 py-4 text-center">Usage Qty / Unit</th>
                                            <th className="px-4 py-4 text-center">Wastage %</th>
                                            <th className="px-4 py-4 text-right">Converted Qty (Base)</th>
                                            <th className="px-4 py-4 text-right">Line Cost</th>
                                            <th className="px-4 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {ingredients.map((ing) => {
                                            const convertedBaseQty = convertToQt(ing.quantityUsed, ing.usageUnit, ing.baseUnit);
                                            const effectiveQty = convertedBaseQty + (convertedBaseQty * ing.wastagePercentage / 100);
                                            const lineCost = effectiveQty * ing.unitCost;

                                            return (
                                                <tr key={ing.tempId} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-black text-slate-900">{ing.inventoryItemName}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">Base: {ing.baseUnit}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="text-sm font-bold text-slate-600">${ing.unitCost.toFixed(2)}</div>
                                                        <div className="text-[10px] text-slate-400">per {ing.baseUnit}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={ing.quantityUsed}
                                                                onChange={(e) => updateIngredient(ing.tempId, 'quantityUsed', parseFloat(e.target.value) || 0)}
                                                                className="w-20 h-10 px-2 text-center bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                                            />
                                                            <select
                                                                value={ing.usageUnit}
                                                                onChange={(e) => updateIngredient(ing.tempId, 'usageUnit', e.target.value as any)}
                                                                className="h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
                                                            >
                                                                {USAGE_UNITS.map(u => (
                                                                    <option key={u} value={u}>{u}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={ing.wastagePercentage}
                                                                onChange={(e) => updateIngredient(ing.tempId, 'wastagePercentage', parseFloat(e.target.value) || 0)}
                                                                className="w-16 h-10 px-2 text-center bg-white border border-slate-200 rounded-lg font-bold text-amber-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                                            />
                                                            <span className="text-xs font-black text-slate-400">%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="text-sm font-bold text-slate-600">{effectiveQty.toFixed(4)}</div>
                                                        <div className="text-[10px] text-slate-400">{ing.baseUnit} (incl. waste)</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="text-sm font-black text-emerald-600">${lineCost.toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <button
                                                            onClick={() => handleRemoveIngredient(ing.tempId)}
                                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}


                    </div>

                    {/* Usage Locations (Linked Products) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <MapPin size={18} className="text-slate-400" />
                                Recipe Usage Locations
                            </h2>
                        </div>

                        {/* Product Search */}
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products directly..."
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                className="w-full h-10 pl-11 pr-4 bg-slate-50 rounded-xl border-none font-bold text-sm focus:ring-2 focus:ring-orange-500/20 text-slate-900 placeholder:text-slate-400"
                            />
                            {/* Dropdown */}
                            {productSearchTerm && productSearchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                                    {productSearchResults.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleAddProduct(item)}
                                            className="w-full text-left p-3 hover:bg-orange-50 flex items-center justify-between group/item"
                                        >
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 group-hover/item:text-orange-700">{item.name}</div>
                                                <div className="text-xs font-medium text-slate-500">{item.productType}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-xs text-slate-500 font-medium mb-3">Linked menu items:</p>

                            {linkedProducts.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No products linked yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {linkedProducts.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs font-black">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{p.name}</div>
                                                    <div className="text-[10px] text-slate-500">Type: {p.productType}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveProduct(p.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Calculations & Rules */}
                <div className="space-y-6">
                    {/* Cost Summary Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                                Cost Analysis
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-300">Ingredient Count</span>
                                    <span className="font-bold">{totalIngredients}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-300">Avg Cost / Item</span>
                                    <span className="font-bold">
                                        ${ingredients.length > 0 ? (totalRecipeCost / ingredients.length).toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Recipe Cost</p>
                                <div className="text-4xl font-black tracking-tight text-white mb-1">
                                    ${totalRecipeCost.toFixed(2)}
                                </div>
                                <p className="text-xs font-medium text-emerald-400">
                                    Auto-calculated from ingredients
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rules Card */}
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info size={16} />
                            Recipe Rules
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-blue-800">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                <span>Costs are derived directly from Inventory Items (Average Cost).</span>
                            </li>
                            <li className="flex gap-3 text-sm text-blue-800">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                <span>Wastage % increases the effective quantity and cost but deducts base quantity from stock.</span>
                            </li>
                            <li className="flex gap-3 text-sm text-blue-800">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                <span>Manual cost overrides are <strong>disabled</strong> to ensure data integrity.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
