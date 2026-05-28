'use client';

import React, { useState, useMemo } from 'react';
import { Tag, Search, Plus, Trash2, Edit3, X, Save, Layers, Package, FileText } from 'lucide-react';
import { useCatalogStore } from '../../state/catalogStore';
import { Category } from '../../types/items';
import { cn } from '@/utils';

export const CategoriesPanel: React.FC = () => {
    const { categories, items, addCategory, updateCategory, deleteCategory } = useCatalogStore();

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');

    // Modal/Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const openCreateModal = () => {
        setEditingCategory(null);
        setName('');
        setDescription('');
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setName(cat.name);
        setDescription(cat.description || '');
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (editingCategory) {
            updateCategory(editingCategory.id, {
                name: name.trim(),
                description: description.trim(),
            });
        } else {
            addCategory({
                id: 'cat-' + Date.now(),
                name: name.trim(),
                description: description.trim(),
            });
        }

        setIsModalOpen(false);
    };

    // Filter categories based on search query
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return cat.name.toLowerCase().includes(q) || (cat.description || '').toLowerCase().includes(q);
        });
    }, [categories, searchQuery]);

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6; // 6 cards per page
    const totalPages = Math.ceil(filteredCategories.length / pageSize);

    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredCategories.slice(start, start + pageSize);
    }, [filteredCategories, currentPage, pageSize]);

    // Reset pagination to page 1 on search change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-slate-950 rounded-2xl shadow-md">
                        <Layers className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Product Categories</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                            Organize your products into catalog sections for easier menu browsing & POS navigation
                        </p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
                >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    Create Category
                </button>
            </div>

            {/* Toolbar: Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 shadow-inner">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-wide focus:border-slate-900 transition-all outline-none"
                    />
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-2">
                    Total Categories: {categories.length}
                </div>
            </div>

            {/* Categories Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedCategories.map(cat => {
                    // Count how many products fall under this category
                    const productCount = items.filter(item => item.categoryId === cat.id).length;

                    return (
                        <div
                            key={cat.id}
                            className="bg-white rounded-[2rem] border border-slate-200/60 p-6 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md hover:border-slate-300"
                        >
                            {/* Card Top */}
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700">
                                            <Tag className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{cat.name}</h4>
                                            <span className="text-[8px] font-mono font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider">
                                                {cat.id}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                        <Package className="w-3 h-3" />
                                        {productCount} product{productCount !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-4.5 leading-normal">
                                    {cat.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Card Bottom Actions */}
                            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
                                <button
                                    onClick={() => openEditModal(cat)}
                                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                    title="Edit Category"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete the "${cat.name}" category? Any assigned items will need to be reallocated.`)) {
                                            deleteCategory(cat.id);
                                        }
                                    }}
                                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Delete Category"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {Math.min(filteredCategories.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredCategories.length, currentPage * pageSize)} of {filteredCategories.length} Categories
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 transition-all active:scale-95"
                        >
                            Previous
                        </button>
                        <span className="text-[10px] font-black text-slate-800 px-2 uppercase tracking-wider">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 transition-all active:scale-95"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {filteredCategories.length === 0 && (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm">
                    <Layers className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">No categories found</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                        Try adjusting your search terms or create a new category above
                    </p>
                </div>
            )}

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 bg-slate-950 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl text-emerald-400">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-widest">
                                    {editingCategory ? 'Edit Category' : 'Create Category'}
                                </h4>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {/* Category Name Input */}
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Signature Pizza, Appetizers, Beverages..."
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-slate-950 transition-all"
                                />
                            </div>

                            {/* Description Input */}
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide details about products in this category..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-950 transition-all resize-none leading-normal"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] ml-auto shadow-md"
                                >
                                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                                    {editingCategory ? 'Save Changes' : 'Create Category'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
