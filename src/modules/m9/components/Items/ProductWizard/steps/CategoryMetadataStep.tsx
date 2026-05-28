'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Percent, Leaf, Globe, Calendar, Search, Plus, Save, X } from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { StepHeader, StepCard } from '../shared/StepHeader';
import { FormField, SelectInput } from '../shared/FormField';
import { useCatalogStore } from '../../../../state/catalogStore';
import { useDietaryStore } from '../../../../state/dietaryStore';
import { cn } from '@/utils';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const CategoryMetadataStep: React.FC = () => {
    const { formData, updateFormData, stepValidations } = useWizardStore();
    const { categories, addCategory } = useCatalogStore();
    const { dietaryItems } = useDietaryStore();
    const errors = stepValidations['CATEGORY_META']?.errors || [];

    // Quick Category Create Form states
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');

    // Dietary Search, Filter, and Pagination states
    const [dietarySearch, setDietarySearch] = useState('');
    const [dietaryFilter, setDietaryFilter] = useState<'all' | 'allergens' | 'preferences'>('all');
    const [dietaryPage, setDietaryPage] = useState(1);
    const dietaryPageSize = 4; // 4 cards per page in creation wizard step

    const handleQuickCreateCategory = () => {
        if (!newCatName.trim()) return;
        const newId = 'cat-' + Date.now();
        addCategory({
            id: newId,
            name: newCatName.trim(),
            description: newCatDesc.trim(),
        });
        updateFormData('categoryId', newId);
        setNewCatName('');
        setNewCatDesc('');
        setIsCreatingCategory(false);
    };

    const handleDayToggle = (day: string) => {
        const current = formData.availabilitySchedule;
        const currentDays = current?.days || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        updateFormData('availabilitySchedule', {
            days: newDays,
            timeStart: current?.timeStart || '00:00',
            timeEnd: current?.timeEnd || '23:59',
        });
    };

    // Filter dietary items based on search query and category tab selection
    const filteredDietary = useMemo(() => {
        return dietaryItems.filter(item => {
            // Search filter
            if (dietarySearch) {
                const q = dietarySearch.toLowerCase();
                const matchesName = item.name.toLowerCase().includes(q);
                const matchesKey = item.key.toLowerCase().includes(q);
                if (!matchesName && !matchesKey) return false;
            }

            // Category filter (allergen vs preference)
            const lowerKey = item.key.toLowerCase();
            const representsAllergen = lowerKey.includes('nuts') || lowerKey.includes('dairy') || lowerKey.includes('allergen') || lowerKey.includes('gluten') || item.emoji === '🥜' || item.emoji === '🥛';
            
            if (dietaryFilter === 'allergens') {
                return representsAllergen;
            } else if (dietaryFilter === 'preferences') {
                return !representsAllergen;
            }

            return true;
        });
    }, [dietaryItems, dietarySearch, dietaryFilter]);

    const totalDietaryPages = Math.ceil(filteredDietary.length / dietaryPageSize);

    const paginatedDietary = useMemo(() => {
        const start = (dietaryPage - 1) * dietaryPageSize;
        return filteredDietary.slice(start, start + dietaryPageSize);
    }, [filteredDietary, dietaryPage, dietaryPageSize]);

    // Reset pagination page to 1 when search query or filter changes
    useEffect(() => {
        setDietaryPage(1);
    }, [dietarySearch, dietaryFilter]);

    return (
        <div className="space-y-6">
            <StepCard>
                <StepHeader
                    icon={<Layers className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Category"
                    subtitle="Organizational placement within the menu structure"
                />
                <div className="w-full">
                    <div className="flex items-end justify-between gap-3">
                        <div className="flex-1">
                            <FormField label="Primary Category" required error={errors.find(e => e.includes('category'))}>
                                <SelectInput value={formData.categoryId} onChange={(e) => updateFormData('categoryId', e.target.value)} hasError={!!errors.find(e => e.includes('category'))}>
                                    <option value="">Select a category...</option>
                                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                </SelectInput>
                            </FormField>
                        </div>
                        {!isCreatingCategory && (
                            <button
                                type="button"
                                onClick={() => setIsCreatingCategory(true)}
                                className="mb-1.5 flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98]"
                            >
                                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                Create Category
                            </button>
                        )}
                    </div>

                    {/* Expandable Category Creator section */}
                    {isCreatingCategory && (
                        <div className="mt-4 p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Quick Create Category</span>
                                <button type="button" onClick={() => setIsCreatingCategory(false)} className="text-slate-400 hover:text-slate-600 transition-all">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">Category Name *</label>
                                    <input 
                                        type="text" 
                                        value={newCatName} 
                                        onChange={(e) => setNewCatName(e.target.value)} 
                                        placeholder="e.g. Desserts, Side Dishes..." 
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wide focus:border-slate-900 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">Description (Optional)</label>
                                    <textarea 
                                        value={newCatDesc} 
                                        onChange={(e) => setNewCatDesc(e.target.value)} 
                                        placeholder="Brief details about this category..." 
                                        rows={2} 
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-slate-900 outline-none resize-none leading-normal"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreatingCategory(false)} 
                                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleQuickCreateCategory} 
                                    disabled={!newCatName.trim()}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                    <Save className="w-3 h-3 text-emerald-400" />
                                    Save Category
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </StepCard>

            <StepCard>
                <StepHeader icon={<Leaf className="w-4.5 h-4.5 text-emerald-400" />} title="Dietary Information" subtitle="Help customers find products that match their dietary needs" />
                
                {/* Search and Filters toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 shadow-inner">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={dietarySearch}
                            onChange={(e) => setDietarySearch(e.target.value)}
                            placeholder="Search dietary tags..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider focus:border-slate-900 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        {([
                            { id: 'all', label: 'All Tags' },
                            { id: 'preferences', label: 'Dietary Preferences' },
                            { id: 'allergens', label: 'Allergens & Safety' }
                        ] as const).map(f => (
                            <button
                                type="button"
                                key={f.id}
                                onClick={() => setDietaryFilter(f.id)}
                                className={cn(
                                    "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
                                    dietaryFilter === f.id
                                        ? "bg-slate-950 text-white border-slate-950"
                                        : "bg-white text-slate-500 hover:text-slate-800 border-slate-200"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dietary Tags grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {paginatedDietary.map(flag => {
                        // Make matches case insensitive by matching formatted lowercase key or exact id
                        const flagId = flag.key.toLowerCase();
                        const isActive = formData.dietaryFlags.includes(flagId) || formData.dietaryFlags.includes(flag.id);
                        return (
                            <button 
                                key={flag.id} 
                                type="button"
                                onClick={() => { 
                                    const nf = isActive 
                                        ? formData.dietaryFlags.filter(f => f !== flagId && f !== flag.id) 
                                        : [...formData.dietaryFlags, flagId]; 
                                    updateFormData('dietaryFlags', nf); 
                                }}
                                className={cn("flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all text-left", isActive ? "border-emerald-400 bg-emerald-50/50 shadow-sm" : "border-slate-150 hover:border-slate-300 bg-white")}
                            >
                                <span className="text-lg">{flag.emoji}</span>
                                <span className={cn("text-[10px] font-black uppercase tracking-wider leading-tight", isActive ? "text-emerald-700" : "text-slate-500")}>
                                    {flag.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {filteredDietary.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-2xl border border-slate-200/50 mt-2">
                        <Leaf className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching dietary tags</h5>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Adjust search criteria or filters</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalDietaryPages > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {Math.min(filteredDietary.length, (dietaryPage - 1) * dietaryPageSize + 1)}-{Math.min(filteredDietary.length, dietaryPage * dietaryPageSize)} of {filteredDietary.length} Tags
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={dietaryPage === 1}
                                onClick={() => setDietaryPage(prev => Math.max(1, prev - 1))}
                                className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 transition-all active:scale-95"
                            >
                                Prev
                            </button>
                            <span className="text-[9px] font-black text-slate-800 px-2 uppercase tracking-wider">
                                Page {dietaryPage} of {totalDietaryPages}
                            </span>
                            <button
                                type="button"
                                disabled={dietaryPage === totalDietaryPages}
                                onClick={() => setDietaryPage(prev => Math.min(totalDietaryPages, prev + 1))}
                                className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 transition-all active:scale-95"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </StepCard>

            <StepCard>
                <StepHeader icon={<Calendar className="w-4.5 h-4.5 text-emerald-400" />} title="Availability Schedule" subtitle="Optional time-based availability restrictions" />
                <FormField label="Active Days" hint="Leave empty for always available">
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => {
                            const isActive = formData.availabilitySchedule?.days?.includes(day);
                            return (<button key={day} type="button" onClick={() => handleDayToggle(day)} className={cn("w-12 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border", isActive ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>{day}</button>);
                        })}
                    </div>
                </FormField>
                {formData.availabilitySchedule?.days && formData.availabilitySchedule.days.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField label="Start Time">
                            <input type="time" value={formData.availabilitySchedule?.timeStart || '00:00'} onChange={(e) => updateFormData('availabilitySchedule', { ...formData.availabilitySchedule!, timeStart: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-slate-900 outline-none" />
                        </FormField>
                        <FormField label="End Time">
                            <input type="time" value={formData.availabilitySchedule?.timeEnd || '23:59'} onChange={(e) => updateFormData('availabilitySchedule', { ...formData.availabilitySchedule!, timeEnd: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-slate-900 outline-none" />
                        </FormField>
                    </div>
                )}
            </StepCard>
        </div>
    );
};
