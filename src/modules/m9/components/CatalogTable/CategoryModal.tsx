'use client';

import React, { useState, useEffect } from 'react';
import {
    X, FolderPlus, ChevronDown, CheckCircle2, Calendar, Clock, Plus, Layers
} from 'lucide-react';
import { useCatalogStore } from '../../state/catalogStore';
import { Category, CategoryChannelSchedule } from '../../types/items';
import { cn } from '@/utils';

const CHANNELS = [
    { id: 'POS', name: 'POS Terminal' },
    { id: 'ONLINE', name: 'Online Ordering' },
    { id: 'UBER_EATS', name: 'Uber Eats' },
    { id: 'DOORDASH', name: 'DoorDash' },
];

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    editCategoryId?: string | null; // If provided, we're editing an existing category
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, editCategoryId }) => {
    const { categories, addCategory, updateCategory } = useCatalogStore();

    // ─── State ──────────────────────────────────────────────────
    const [mode, setMode] = useState<'select' | 'create'>('select');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // New category fields
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    // Visibility & scheduling
    const [visibilityMode, setVisibilityMode] = useState<'ALL' | 'CUSTOM'>('ALL');
    const [customChannels, setCustomChannels] = useState<string[]>([]);
    const [channelSchedules, setChannelSchedules] = useState<CategoryChannelSchedule[]>([]);

    // If editing, pre-fill from the existing category
    useEffect(() => {
        if (editCategoryId) {
            const cat = categories.find(c => c.id === editCategoryId);
            if (cat) {
                setMode('create');
                setNewName(cat.name);
                setNewDescription(cat.description || '');
                setVisibilityMode(cat.visibilityMode || 'ALL');
                setCustomChannels(cat.customChannels || []);
                setChannelSchedules(cat.channelSchedules || []);
            }
        }
    }, [editCategoryId, categories]);

    if (!isOpen) return null;

    // ─── Helpers ────────────────────────────────────────────────
    const toggleChannel = (id: string) => {
        setCustomChannels(prev => {
            const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
            // Auto-add schedule entry when a channel is newly checked
            if (!prev.includes(id)) {
                setChannelSchedules(s => [...s, { channelId: id }]);
            } else {
                setChannelSchedules(s => s.filter(cs => cs.channelId !== id));
            }
            return next;
        });
    };

    const updateSchedule = (channelId: string, field: keyof CategoryChannelSchedule, value: string) => {
        setChannelSchedules(prev => {
            const idx = prev.findIndex(s => s.channelId === channelId);
            if (idx === -1) {
                return [...prev, { channelId, [field]: value }];
            }
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    const getActiveChannels = (): string[] => {
        if (visibilityMode === 'ALL') return CHANNELS.map(c => c.id);
        return customChannels;
    };

    // ─── Submit ─────────────────────────────────────────────────
    const handleSave = () => {
        if (editCategoryId) {
            // Update existing
            updateCategory(editCategoryId, {
                name: newName.trim() || 'Untitled Category',
                description: newDescription.trim(),
                visibilityMode,
                customChannels: visibilityMode === 'CUSTOM' ? customChannels : [],
                channelSchedules: visibilityMode === 'CUSTOM' ? channelSchedules : [],
            });
            alert(`Category "${newName}" updated successfully!`);
        } else if (mode === 'create') {
            // Create new
            if (!newName.trim()) {
                alert('Please enter a category name.');
                return;
            }
            const newCat: Category = {
                id: 'cat-' + Date.now(),
                name: newName.trim(),
                description: newDescription.trim(),
                visibilityMode,
                customChannels: visibilityMode === 'CUSTOM' ? customChannels : [],
                channelSchedules: visibilityMode === 'CUSTOM' ? channelSchedules : [],
            };
            addCategory(newCat);
            alert(`Category "${newCat.name}" created successfully!`);
        } else if (mode === 'select' && selectedCategoryId) {
            // Update selected existing category with visibility settings
            updateCategory(selectedCategoryId, {
                visibilityMode,
                customChannels: visibilityMode === 'CUSTOM' ? customChannels : [],
                channelSchedules: visibilityMode === 'CUSTOM' ? channelSchedules : [],
            });
            const cat = categories.find(c => c.id === selectedCategoryId);
            alert(`Category "${cat?.name}" visibility updated!`);
        }
        onClose();
    };

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    // When selecting an existing category, load its visibility settings
    const handleSelectCategory = (catId: string) => {
        setSelectedCategoryId(catId);
        setDropdownOpen(false);
        const cat = categories.find(c => c.id === catId);
        if (cat) {
            setVisibilityMode(cat.visibilityMode || 'ALL');
            setCustomChannels(cat.customChannels || []);
            setChannelSchedules(cat.channelSchedules || []);
        }
    };

    const showVisibilitySection = mode === 'create' || (mode === 'select' && selectedCategoryId);

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* ─── Header ─────────────────────────────────────── */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-950 rounded-xl">
                            <FolderPlus className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                {editCategoryId ? 'Edit Category' : 'Create Category'}
                            </h3>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">
                                Manage menu categories & channel visibility
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ─── Body (scrollable) ───────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* Step 1: Choose existing or create new */}
                    {!editCategoryId && (
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                Select or Create Category
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setMode('select')}
                                    className={cn(
                                        "px-4 py-3 rounded-xl border text-left transition-all",
                                        mode === 'select'
                                            ? "border-slate-900 bg-slate-50 shadow-sm"
                                            : "border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Existing</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Choose from list</span>
                                </button>
                                <button
                                    onClick={() => setMode('create')}
                                    className={cn(
                                        "px-4 py-3 rounded-xl border text-left transition-all",
                                        mode === 'create'
                                            ? "border-slate-900 bg-slate-50 shadow-sm"
                                            : "border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block flex items-center gap-1">
                                        <Plus className="w-3 h-3 text-emerald-500" /> New Category
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">Create from scratch</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─── Mode: Select Existing ──────────────────── */}
                    {mode === 'select' && !editCategoryId && (
                        <div className="space-y-2 animate-in fade-in duration-150">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                Choose Category
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-left flex items-center justify-between hover:border-slate-400 transition-colors"
                                >
                                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                        {selectedCategory?.name || 'Select a category...'}
                                    </span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleSelectCategory(cat.id)}
                                                className={cn(
                                                    "w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors border-b border-slate-50 last:border-0",
                                                    selectedCategoryId === cat.id ? "bg-emerald-50" : "hover:bg-slate-50"
                                                )}
                                            >
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">{cat.name}</span>
                                                    {cat.description && (
                                                        <span className="text-[8px] text-slate-400 font-bold block mt-0.5">{cat.description}</span>
                                                    )}
                                                </div>
                                                {selectedCategoryId === cat.id && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── Mode: Create New ───────────────────────── */}
                    {(mode === 'create' || editCategoryId) && (
                        <div className="space-y-3 animate-in fade-in duration-150">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Category Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Signature Pizza, Drinks, Combos..."
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    placeholder="Short description..."
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    )}

                    {/* ─── Visibility Section ─────────────────────── */}
                    {showVisibilitySection && (
                        <div className="space-y-3 animate-in fade-in duration-200 pt-2 border-t border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                Channel Visibility
                            </label>

                            {/* All Channels Toggle */}
                            <button
                                onClick={() => setVisibilityMode('ALL')}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl border flex items-center gap-3 transition-all text-left",
                                    visibilityMode === 'ALL'
                                        ? "border-emerald-500 bg-emerald-50/50"
                                        : "border-slate-200 hover:border-slate-300"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                    visibilityMode === 'ALL' ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                                )}>
                                    {visibilityMode === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">All Channels</span>
                                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">
                                        Visible on POS, Online, Uber Eats, DoorDash
                                    </span>
                                </div>
                            </button>

                            {/* Custom Toggle */}
                            <button
                                onClick={() => setVisibilityMode('CUSTOM')}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl border flex items-center gap-3 transition-all text-left",
                                    visibilityMode === 'CUSTOM'
                                        ? "border-indigo-500 bg-indigo-50/50"
                                        : "border-slate-200 hover:border-slate-300"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                    visibilityMode === 'CUSTOM' ? "bg-indigo-500 border-indigo-500" : "border-slate-300"
                                )}>
                                    {visibilityMode === 'CUSTOM' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block">Custom Channels</span>
                                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">
                                        Select specific channels & configure schedule
                                    </span>
                                </div>
                            </button>

                            {/* ─── Custom Channel Selection + Per-Channel Scheduling ─── */}
                            {visibilityMode === 'CUSTOM' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                        Select Channels & Schedule
                                    </label>

                                    {CHANNELS.map(ch => {
                                        const isActive = customChannels.includes(ch.id);
                                        const schedule = channelSchedules.find(s => s.channelId === ch.id);

                                        return (
                                            <div
                                                key={ch.id}
                                                className={cn(
                                                    "rounded-xl border transition-all overflow-hidden",
                                                    isActive ? "border-slate-300 bg-white shadow-sm" : "border-slate-150"
                                                )}
                                            >
                                                {/* Channel Toggle Row */}
                                                <button
                                                    onClick={() => toggleChannel(ch.id)}
                                                    className={cn(
                                                        "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                                                        isActive ? "bg-slate-50/50" : "hover:bg-slate-50/50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                                        isActive ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                                                    )}>
                                                        {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{ch.name}</span>
                                                </button>

                                                {/* Per-Channel Date/Time Configuration */}
                                                {isActive && (
                                                    <div className="px-4 pb-3 pt-1 space-y-2 border-t border-slate-100 animate-in fade-in duration-150">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> Schedule for {ch.name}
                                                        </span>

                                                        {/* Start */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] font-bold text-slate-500 uppercase w-10 flex-shrink-0">Start</span>
                                                            <input
                                                                type="date"
                                                                value={schedule?.startDate || ''}
                                                                onChange={e => updateSchedule(ch.id, 'startDate', e.target.value)}
                                                                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                                                            />
                                                            <input
                                                                type="time"
                                                                value={schedule?.startTime || ''}
                                                                onChange={e => updateSchedule(ch.id, 'startTime', e.target.value)}
                                                                className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                                                            />
                                                        </div>

                                                        {/* End */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] font-bold text-slate-500 uppercase w-10 flex-shrink-0">End</span>
                                                            <input
                                                                type="date"
                                                                value={schedule?.endDate || ''}
                                                                onChange={e => updateSchedule(ch.id, 'endDate', e.target.value)}
                                                                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                                                            />
                                                            <input
                                                                type="time"
                                                                value={schedule?.endTime || ''}
                                                                onChange={e => updateSchedule(ch.id, 'endTime', e.target.value)}
                                                                className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Footer ─────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-slate-200 hover:border-slate-350 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={mode === 'create' && !newName.trim() && !editCategoryId}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md",
                            (mode === 'create' && !newName.trim() && !editCategoryId)
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-slate-950 text-white hover:bg-slate-900"
                        )}
                    >
                        {editCategoryId ? 'Update Category' : mode === 'create' ? 'Create Category' : 'Save Visibility'}
                    </button>
                </div>
            </div>
        </div>
    );
};
