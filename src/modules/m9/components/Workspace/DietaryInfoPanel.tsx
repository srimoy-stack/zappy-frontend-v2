'use client';

import React, { useState, useMemo } from 'react';
import { Leaf, Search, Plus, Trash2, Edit3, X, Save, ShieldAlert, Sparkles, Heart } from 'lucide-react';
import { useDietaryStore, DietaryInfo } from '../../state/dietaryStore';
import { cn } from '@/utils';

export const DietaryInfoPanel: React.FC = () => {
    const { dietaryItems, addDietaryItem, updateDietaryItem, deleteDietaryItem } = useDietaryStore();

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'allergens' | 'preferences'>('all');

    // Modal/Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DietaryInfo | null>(null);

    // Form fields
    const [emoji, setEmoji] = useState('🥬');
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [isAllergen, setIsAllergen] = useState(false); // Allergen category (Contains Nuts, Dairy etc)

    const openCreateModal = () => {
        setEditingItem(null);
        setEmoji('🥬');
        setName('');
        setKey('');
        setDescription('');
        setIsAllergen(false);
        setIsModalOpen(true);
    };

    const openEditModal = (item: DietaryInfo) => {
        setEditingItem(item);
        setEmoji(item.emoji);
        setName(item.name);
        setKey(item.key);
        setDescription(item.description);
        // Deduce allergen from description or name/key
        const lowerKey = item.key.toLowerCase();
        setIsAllergen(lowerKey.includes('nuts') || lowerKey.includes('dairy') || lowerKey.includes('allergen') || lowerKey.includes('gluten') || item.emoji === '🥜' || item.emoji === '🥛');
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !key.trim()) return;

        const formattedKey = key.trim().toUpperCase().replace(/\s+/g, '_');

        if (editingItem) {
            updateDietaryItem(editingItem.id, {
                name: name.trim(),
                emoji: emoji.trim(),
                key: formattedKey,
                description: description.trim(),
            });
        } else {
            addDietaryItem({
                id: 'diet-' + Date.now(),
                name: name.trim(),
                emoji: emoji.trim(),
                key: formattedKey,
                description: description.trim(),
            });
        }

        setIsModalOpen(false);
    };

    // Auto-generate key from name if not manually modified
    const handleNameChange = (val: string) => {
        setName(val);
        if (!editingItem) {
            setKey(val.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''));
        }
    };

    // Filtering logic
    const filteredItems = useMemo(() => {
        return dietaryItems.filter(item => {
            // Search filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesName = item.name.toLowerCase().includes(q);
                const matchesKey = item.key.toLowerCase().includes(q);
                const matchesDesc = item.description.toLowerCase().includes(q);
                if (!matchesName && !matchesKey && !matchesDesc) return false;
            }

            // Category filter
            const lowerKey = item.key.toLowerCase();
            const representsAllergen = lowerKey.includes('nuts') || lowerKey.includes('dairy') || lowerKey.includes('allergen') || lowerKey.includes('gluten') || item.emoji === '🥜' || item.emoji === '🥛';
            
            if (activeFilter === 'allergens') {
                return representsAllergen;
            } else if (activeFilter === 'preferences') {
                return !representsAllergen;
            }

            return true;
        });
    }, [dietaryItems, searchQuery, activeFilter]);

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6; // 6 cards per page
    const totalPages = Math.ceil(filteredItems.length / pageSize);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage, pageSize]);

    // Reset pagination to page 1 on filter or search change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeFilter]);

    const presetEmojis = ['🥬', '🌱', '🌾', '☪', '🥜', '🥛', '🥑', '🍃', '🥚', '🍤', '🥩', '🐟', '🍯', '🌶', '🥗', '🍎'];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-slate-950 rounded-2xl shadow-md">
                        <Leaf className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Dietary Information</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                            Help customers find products that match their dietary needs & allergen requirements
                        </p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
                >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    Create Tag
                </button>
            </div>

            {/* Toolbar: Search + Quick Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 shadow-inner">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search dietary tags..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-wide focus:border-slate-900 transition-all outline-none"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {([
                        { id: 'all', label: 'All Tags' },
                        { id: 'preferences', label: 'Dietary Preferences' },
                        { id: 'allergens', label: 'Allergens & Warnings' }
                    ] as const).map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                                activeFilter === f.id
                                    ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                                    : "bg-white text-slate-500 hover:text-slate-800 border-slate-200"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dietary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedItems.map(item => {
                    const lowerKey = item.key.toLowerCase();
                    const isWarn = lowerKey.includes('nuts') || lowerKey.includes('dairy') || lowerKey.includes('allergen') || lowerKey.includes('gluten') || item.emoji === '🥜' || item.emoji === '🥛';

                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "bg-white rounded-[2rem] border p-6 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md",
                                isWarn ? "border-amber-100 hover:border-amber-300 bg-gradient-to-br from-white to-amber-50/10" : "border-slate-200/60 hover:border-slate-300"
                            )}
                        >
                            {/* Card Top */}
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-100">{item.emoji}</span>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{item.name}</h4>
                                            <span className="text-[8px] font-mono font-black text-slate-400 bg-slate-150 px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider">
                                                {item.key}
                                            </span>
                                        </div>
                                    </div>
                                    {isWarn ? (
                                        <div className="p-1 bg-amber-50 text-amber-500 border border-amber-100 rounded-lg" title="Allergen or food safety concern">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                        </div>
                                    ) : (
                                        <div className="p-1 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-lg" title="Dietary Preference">
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-4.5 leading-normal">
                                    {item.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Card Bottom Actions */}
                            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                    title="Edit dietary tag"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete the "${item.name}" tag?`)) {
                                            deleteDietaryItem(item.id);
                                        }
                                    }}
                                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Delete dietary tag"
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
                        Showing {Math.min(filteredItems.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredItems.length, currentPage * pageSize)} of {filteredItems.length} Tags
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

            {filteredItems.length === 0 && (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm">
                    <Leaf className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">No tags found</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                        Try adjusting your filters, search terms, or create a new tag above
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
                                    <Leaf className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-widest">
                                    {editingItem ? 'Edit Dietary Tag' : 'Create Dietary Tag'}
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
                            {/* Emoji selector */}
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Emoji / Icon</label>
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <input
                                        type="text"
                                        value={emoji}
                                        onChange={(e) => setEmoji(e.target.value)}
                                        className="w-12 h-12 text-2xl text-center bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-950 transition-all font-sans"
                                        maxLength={4}
                                    />
                                    <div className="flex-1 flex flex-wrap gap-1.5 items-center justify-start overflow-y-auto max-h-[80px]">
                                        {presetEmojis.map(emo => (
                                            <button
                                                type="button"
                                                key={emo}
                                                onClick={() => setEmoji(emo)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all hover:bg-slate-200/60 active:scale-95",
                                                    emoji === emo ? "bg-slate-250 border border-slate-400" : "bg-transparent"
                                                )}
                                            >
                                                {emo}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tag Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Vegetarian, Gluten Free..."
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-slate-950 transition-all"
                                />
                            </div>

                            {/* Key Input */}
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">System Identifier Key *</label>
                                <input
                                    type="text"
                                    required
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    placeholder="e.g. VEGETARIAN, GLUTEN_FREE"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase tracking-widest outline-none focus:border-slate-950 transition-all"
                                />
                                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 block">
                                    Unique code identifier used for API bindings & translations
                                </span>
                            </div>

                            {/* Description Input */}
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide details about what this dietary tag represents..."
                                    rows={3}
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
                                    {editingItem ? 'Save Changes' : 'Create Tag'}
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
