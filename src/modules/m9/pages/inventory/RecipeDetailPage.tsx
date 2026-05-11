'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import {
    ArrowLeft,
    Edit3,
    Copy,
    Trash2,
    ChefHat,
    AlertCircle,
    Package
} from 'lucide-react';
import { Recipe } from '../../types/inventory';
import { recipeService } from '../../services/inventoryService';

/**
 * Recipe Detail Page
 * View recipe with ingredients, cost breakdown, and products using it
 */
export const RecipeDetailPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadRecipe();
    }, [id]);

    const loadRecipe = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await recipeService.getById(id);
            setRecipe(data);
        } catch (error) {
            console.error('Failed to load recipe:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicate = async () => {
        if (!id) return;
        setActionLoading(true);
        try {
            const newRecipe = await recipeService.duplicate(id);
            alert('Recipe duplicated successfully');
            router.push(`/backoffice/inventory/recipes/${newRecipe.id}`);
        } catch (error: any) {
            alert(error.message || 'Failed to duplicate recipe');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setActionLoading(true);
        try {
            await recipeService.delete(id);
            alert('Recipe deleted successfully');
            router.push('/backoffice/inventory/recipes');
        } catch (error: any) {
            alert(error.message || 'Failed to delete recipe');
        } finally {
            setActionLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading || !recipe) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <ChefHat className="w-12 h-12 text-slate-400 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading recipe...</p>
                </div>
            </div>
        );
    }

    const canDelete = recipe.usedByProductCount === 0;

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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{recipe.name}</h1>
                    {recipe.description && (
                        <p className="text-sm text-slate-500 font-medium">{recipe.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDuplicate}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all disabled:opacity-50"
                    >
                        <Copy size={14} />
                        Duplicate
                    </button>
                    <button
                        onClick={() => router.push(`/backoffice/inventory/recipes/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                    >
                        <Edit3 size={14} />
                        Edit
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={!canDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!canDelete ? 'Cannot delete - recipe is attached to products' : 'Delete recipe'}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-200">
                            <Package size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Ingredients</span>
                    </div>
                    <div className="text-3xl font-black text-orange-900 tracking-tight">
                        {recipe.ingredients.length}
                    </div>
                    <div className="text-xs text-orange-600 font-bold mt-1">
                        Total Items
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-3xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
                            <ChefHat size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Recipe Cost</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-900 tracking-tight">
                        ${recipe.totalRecipeCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">
                        Auto-Calculated
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <Package size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Used By</span>
                    </div>
                    <div className="text-3xl font-black text-blue-900 tracking-tight">
                        {recipe.usedByProductCount}
                    </div>
                    <div className="text-xs text-blue-600 font-bold mt-1">
                        Products
                    </div>
                </div>
            </div>

            {/* Recipe Info */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Recipe Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Recipe Name
                        </label>
                        <div className="text-base font-black text-slate-900">{recipe.name}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Status
                        </label>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${recipe.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}>
                            {recipe.status}
                        </span>
                    </div>
                    {recipe.description && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Description
                            </label>
                            <div className="text-sm text-slate-600">{recipe.description}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Ingredients Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Ingredients (Bill of Materials)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingredient</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty Used</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Wastage %</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Effective Qty</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Line Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recipe.ingredients.map((ingredient, index) => (
                                <tr key={ingredient.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900">{ingredient.inventoryItemName}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{ingredient.baseUnit}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900 text-right tabular-nums">
                                        {ingredient.quantityUsed.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-amber-600 text-right tabular-nums">
                                        {ingredient.wastagePercentage}%
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right tabular-nums">
                                        {ingredient.effectiveQuantity.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right tabular-nums">
                                        ${ingredient.unitCost.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-base font-black text-emerald-600 text-right tabular-nums">
                                        ${ingredient.lineCost.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50 font-black">
                                <td colSpan={7} className="px-6 py-4 text-right text-sm uppercase tracking-wider text-slate-900">
                                    Total Recipe Cost:
                                </td>
                                <td className="px-6 py-4 text-right text-xl text-emerald-600 tabular-nums">
                                    ${recipe.totalRecipeCost.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recipe Rules Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <AlertCircle size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-blue-900 tracking-tight mb-2">
                            Recipe Calculation Rules
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-700 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span><strong>Effective Quantity</strong> = Quantity Used + (Quantity Used × Wastage %)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span><strong>Line Cost</strong> = Effective Quantity × Unit Cost</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span><strong>Total Recipe Cost</strong> = Sum of all Line Costs (auto-calculated)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span>Unit costs are fetched from <strong>Inventory Items</strong> (average cost)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span><strong>NO manual cost overrides</strong> allowed</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-rose-100 rounded-2xl">
                                <AlertCircle size={24} className="text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Delete Recipe?</h3>
                                <p className="text-sm text-slate-600">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
