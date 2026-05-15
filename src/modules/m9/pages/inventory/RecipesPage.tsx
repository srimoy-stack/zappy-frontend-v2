'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
;
import {
    ArrowLeft,
    Search,
    Plus,
    Eye,
    Edit3,
    Copy,
    Trash2,
    ChefHat,
    AlertCircle
} from 'lucide-react';
import { RecipeStatus } from '../../types/inventory';
import { mockRecipes } from '../../mock/inventory';

/**
 * Recipes (BOM & Costing) Page
 * 
 * Rules:
 * - Uses Inventory Items ONLY
 * - Vendor changes NEVER affect recipes
 * - One recipe can attach to multiple products
 * - Recipe cost auto-calculated
 * - Inventory deduction always via recipe ingredients
 * - NO discounts or manual cost overrides
 */
export const RecipesPage: React.FC = () => {
    const router = useRouter();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<RecipeStatus | ''>('');

    // Filter recipes
    const filteredRecipes = mockRecipes.filter(recipe => {
        if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedStatus && recipe.status !== selectedStatus) return false;
        return true;
    });

    // Stats
    const totalRecipes = mockRecipes.length;
    const activeRecipes = mockRecipes.filter(r => r.status === 'Active').length;
    const avgRecipeCost = mockRecipes.reduce((sum, r) => sum + r.totalRecipeCost, 0) / mockRecipes.length;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.push('/backoffice/inventory')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recipes (BOM & Costing)</h1>
                    <p className="text-sm text-slate-500 font-medium">Bill of Materials and automatic cost calculation</p>
                </div>
                <button
                    onClick={() => router.push('/backoffice/inventory/recipes/create')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95"
                >
                    <Plus size={16} strokeWidth={3} />
                    Create Recipe
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-200">
                            <ChefHat size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Total Recipes</span>
                    </div>
                    <div className="text-3xl font-black text-orange-900 tracking-tight">
                        {totalRecipes}
                    </div>
                    <div className="text-xs text-orange-600 font-bold mt-1">
                        {activeRecipes} Active
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-3xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
                            <ChefHat size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Avg Cost</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-900 tracking-tight">
                        ${avgRecipeCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">
                        Per Recipe
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <ChefHat size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">In Use</span>
                    </div>
                    <div className="text-3xl font-black text-blue-900 tracking-tight">
                        {mockRecipes.reduce((sum, r) => sum + r.usedByProductCount, 0)}
                    </div>
                    <div className="text-xs text-blue-600 font-bold mt-1">
                        Product Attachments
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search recipes by name..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:border-orange-600 transition-all"
                        />
                    </div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as RecipeStatus | '')}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:border-orange-600"
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 font-medium">
                    Showing <span className="font-black text-slate-900">{filteredRecipes.length}</span> recipes
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipe Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Ingredients</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Recipe Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Used By (Products)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRecipes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <ChefHat size={32} className="text-slate-300" />
                                            <p className="text-sm text-slate-400 font-medium">No recipes found. Create your first recipe to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecipes.map((recipe) => (
                                    <tr key={recipe.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 rounded-xl">
                                                    <ChefHat size={16} className="text-orange-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900">{recipe.name}</div>
                                                    {recipe.description && (
                                                        <div className="text-xs text-slate-500 font-medium mt-1">{recipe.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-lg text-sm font-black border border-slate-200">
                                                {recipe.ingredients.length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-base font-black text-emerald-600 tabular-nums">
                                                ${recipe.totalRecipeCost.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-black border border-blue-200">
                                                {recipe.usedByProductCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${recipe.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                : 'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}>
                                                {recipe.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-600">
                                                {new Date(recipe.updatedAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium">
                                                {new Date(recipe.updatedAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => router.push(`/backoffice/inventory/recipes/${recipe.id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/backoffice/inventory/recipes/${recipe.id}/edit`)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {/* TODO: Duplicate recipe */ }}
                                                    className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    disabled={recipe.usedByProductCount > 0}
                                                    className={`p-2 transition-colors ${recipe.usedByProductCount > 0
                                                        ? 'text-slate-300 cursor-not-allowed'
                                                        : 'text-slate-400 hover:text-rose-600'
                                                        }`}
                                                    title={recipe.usedByProductCount > 0 ? 'Cannot delete - attached to products' : 'Delete'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <AlertCircle size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-blue-900 tracking-tight mb-2">
                            Recipe Rules
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-700 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span>Recipes use <strong>Inventory Items ONLY</strong> - vendor changes never affect recipes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span>One recipe can attach to <strong>multiple products</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span>Recipe cost is <strong>auto-calculated</strong> - no manual overrides allowed</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span>Inventory deduction <strong>always via recipe ingredients</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black">•</span>
                                <span><strong>NO discounts</strong> or manual cost overrides</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
