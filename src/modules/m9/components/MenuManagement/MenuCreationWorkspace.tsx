'use client';

import React, { useState, useMemo } from 'react';
import {
    X, ArrowLeft, ArrowRight, Check, AlertTriangle, Search, Info,
    Eye, Edit, Copy, ChevronRight, Layers, Package, Calendar, Clock,
    Monitor, Globe, Truck, Settings2, Shield, Plus, Building, Star, Sparkles
} from 'lucide-react';
import { useMenuCreationStore, CreationStep } from '../../state/menuCreationStore';
import { useCatalogStore } from '../../state/catalogStore';
import { mockStores } from '../../mock/stores';
import { cn } from '@/utils';

const STEPS: { id: CreationStep; label: string; desc: string }[] = [
    { id: 'BASIC_DETAILS', label: '1. Basic Details', desc: 'Identity & type' },
    { id: 'CATEGORY_COMPOSITION', label: '2. Categories', desc: 'Link category assets' },
    { id: 'PRODUCT_COMPOSITION', label: '3. Products', desc: 'Refine item catalogs' },
    { id: 'STORE_DEPLOYMENT', label: '4. Stores', desc: 'Target locations' },
    { id: 'CHANNEL_MATRIX', label: '5. Channels', desc: 'Per-store channel matrix' },
    { id: 'SCHEDULING', label: '6. Scheduling', desc: 'Global & overrides' },
    { id: 'DEPLOYMENT_SUMMARY', label: '7. Summary', desc: 'Validation & release' }
];

const CHANNELS: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'POS', label: 'POS Terminal', icon: <Monitor className="w-3.5 h-3.5" /> },
    { id: 'ONLINE', label: 'Online Store', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'UBER_EATS', label: 'Uber Eats', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'DOORDASH', label: 'DoorDash', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'KIOSK', label: 'Self Kiosk', icon: <Settings2 className="w-3.5 h-3.5" /> },
    { id: 'CATERING', label: 'Catering', icon: <Info className="w-3.5 h-3.5" /> },
    { id: 'CUSTOM', label: 'Custom App', icon: <Layers className="w-3.5 h-3.5" /> }
];

export const MenuCreationWorkspace: React.FC = () => {
    const {
        isOpen, currentStep, formData, isDirty, previewTarget,
        closeWizard, setStep, nextStep, prevStep, updateForm,
        setCategorySelected, updateSectionConfig, setItemSelected,
        toggleItemFeatured, toggleItemVisibility, setStoreChannelMatrix,
        bulkApplyChannels, setGlobalSchedule, setStoreSchedule, applyStoreScheduleToAll,
        addScheduleOverride, removeScheduleOverride, setPreviewTarget, submitMenu
    } = useMenuCreationStore();

    const { categories, items } = useCatalogStore();

    // ── Local state for filtering / search
    const [catSearch, setCatSearch] = useState('');
    const [prodSearch, setProdSearch] = useState('');
    const [activeCategoryTab, setActiveCategoryTab] = useState<string>('');
    const [newTagInput, setNewTagInput] = useState('');
    const [activeScheduleStoreId, setActiveScheduleStoreId] = useState<string>('');
    const [activeScheduleChannelId, setActiveScheduleChannelId] = useState<string>('');

    // Previews / Contextual drawers
    const previewedCategory = useMemo(() => {
        if (previewTarget?.type === 'category') {
            return categories.find(c => c.id === previewTarget.id);
        }
        return null;
    }, [previewTarget, categories]);

    const previewedItem = useMemo(() => {
        if (previewTarget?.type === 'item') {
            return items.find(i => i.id === previewTarget.id);
        }
        return null;
    }, [previewTarget, items]);

    if (!isOpen) return null;

    // Set first selected category as active product composition tab if not set
    if (formData.selectedCategoryIds.length > 0 && !activeCategoryTab) {
        setActiveCategoryTab(formData.selectedCategoryIds[0]);
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
        c.description?.toLowerCase().includes(catSearch.toLowerCase())
    );

    const activeCatProducts = items.filter(i => i.categoryId === activeCategoryTab);
    const filteredProducts = activeCatProducts.filter(i =>
        i.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        i.sku.toLowerCase().includes(prodSearch.toLowerCase())
    );

    // Store calculations
    const filteredStores = mockStores.filter(store => {
        if (formData.regionFilter === 'ALL') return true;
        return store.region === formData.regionFilter;
    });

    const isStepValid = () => {
        if (currentStep === 'BASIC_DETAILS') {
            return formData.name.trim().length > 0 && formData.primaryChannel;
        }
        if (currentStep === 'CATEGORY_COMPOSITION') {
            return formData.selectedCategoryIds.length > 0;
        }
        if (currentStep === 'STORE_DEPLOYMENT') {
            if (formData.storeScope === 'SPECIFIC_STORES') {
                return formData.selectedStoreIds.length > 0;
            }
            return true;
        }
        return true;
    };

    return (
        <div className="w-full bg-white rounded-3xl border border-slate-200/60 flex flex-col overflow-hidden animate-in fade-in duration-300 h-[calc(100vh-120px)] shadow-sm">
                
                {/* ── Top Bar ─────────────────────────────────────────────── */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-950 text-white rounded-2xl">
                            <Plus className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">New Presentation Layer Wizard</h2>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Deploy new menus from canonical catalog assets</p>
                        </div>
                    </div>
                    
                    <button onClick={closeWizard} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* ── Horizontal Step Tracker ─────────────────────────────── */}
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto shrink-0">
                    <div className="flex items-center justify-between min-w-[800px] gap-2">
                        {STEPS.map((step, idx) => {
                            const isActive = currentStep === step.id;
                            const stepsList = STEPS.map(s => s.id);
                            const currentIdx = stepsList.indexOf(currentStep);
                            const stepIdx = stepsList.indexOf(step.id);
                            const isCompleted = stepIdx < currentIdx;

                            return (
                                <React.Fragment key={step.id}>
                                    {/* Step Tab Link */}
                                    <button
                                        onClick={() => setStep(step.id)}
                                        className="flex items-center gap-2.5 text-left focus:outline-none group relative py-1"
                                    >
                                        <div className={cn(
                                            "w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all border shadow-sm",
                                            isActive 
                                                ? "bg-slate-950 text-white border-slate-950 scale-110" 
                                                : isCompleted
                                                    ? "bg-emerald-500 text-white border-emerald-500"
                                                    : "bg-white text-slate-400 border-slate-200 group-hover:border-slate-400 group-hover:text-slate-700"
                                        )}>
                                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                        </div>
                                        <div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-wider block leading-tight",
                                                isActive ? "text-slate-900" : isCompleted ? "text-emerald-600 font-bold" : "text-slate-400 group-hover:text-slate-600"
                                            )}>
                                                {step.label.split('. ')[1]}
                                            </span>
                                            <span className="text-[8px] text-slate-400 font-bold block leading-none mt-0.5">{step.desc}</span>
                                        </div>

                                        {/* Active underline decoration */}
                                        {isActive && (
                                            <span className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-slate-950 rounded-full animate-in fade-in duration-300" />
                                        )}
                                    </button>

                                    {/* Connecting Line */}
                                    {idx < STEPS.length - 1 && (
                                        <div className="flex-1 h-0.5 bg-slate-100 rounded-full mx-2 relative min-w-[20px]">
                                            <div className={cn(
                                                "absolute inset-y-0 left-0 transition-all duration-300",
                                                isCompleted ? "w-full bg-emerald-500" : "w-0"
                                            )} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* ── Inner Content Panels ────────────────── */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Center Workspace Panels */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto p-6">
                        
                        {/* STEP 1: Basic Details */}
                        {currentStep === 'BASIC_DETAILS' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 1: Menu Basic Details</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Provide foundational metadata and default channel targets</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Menu Name *</label>
                                        <input
                                            value={formData.name}
                                            onChange={e => updateForm({ name: e.target.value })}
                                            placeholder="e.g. Summer Late Night Drink Specials"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Description (Optional)</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => updateForm({ description: e.target.value })}
                                            placeholder="Specify target user segments, seasonal goals, or operation scopes..."
                                            rows={3}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-slate-900 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Primary Target Channel</label>
                                            <select
                                                value={formData.primaryChannel}
                                                onChange={e => updateForm({ primaryChannel: e.target.value as MenuChannelType })}
                                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 cursor-pointer"
                                            >
                                                {CHANNELS.map(ch => (
                                                    <option key={ch.id} value={ch.id}>{ch.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Default Menu Status</label>
                                            <div className="flex items-center gap-4 mt-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isDefault}
                                                        onChange={e => updateForm({ isDefault: e.target.checked })}
                                                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                                    />
                                                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Set as Channel Default</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Runtime Tags (Press Enter)</label>
                                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                                            {formData.tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-wider">
                                                    {tag}
                                                    <button onClick={() => updateForm({ tags: formData.tags.filter(t => t !== tag) })} className="hover:text-rose-400">
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                value={newTagInput}
                                                onChange={e => setNewTagInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && newTagInput.trim()) {
                                                        e.preventDefault();
                                                        if (!formData.tags.includes(newTagInput.trim())) {
                                                            updateForm({ tags: [...formData.tags, newTagInput.trim()] });
                                                        }
                                                        setNewTagInput('');
                                                    }
                                                }}
                                                placeholder={formData.tags.length === 0 ? "e.g. Summer, NightShift" : ""}
                                                className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Category Composition */}
                        {currentStep === 'CATEGORY_COMPOSITION' && (
                            <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between shrink-0">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 2: Category Composition</h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Map category assets from the catalog into presentation sections</p>
                                    </div>
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={catSearch}
                                            onChange={e => setCatSearch(e.target.value)}
                                            placeholder="Search catalog categories..."
                                            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 w-full outline-none focus:border-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/20 p-4 space-y-3">
                                    {filteredCategories.map(cat => {
                                        const isSelected = formData.selectedCategoryIds.includes(cat.id);
                                        const config = formData.categorySections[cat.id];
                                        const count = items.filter(i => i.categoryId === cat.id).length;

                                        return (
                                            <div key={cat.id} className={cn(
                                                "p-4 rounded-2xl border transition-all flex items-start gap-4 bg-white",
                                                isSelected ? "border-slate-900 shadow-md" : "border-slate-200"
                                            )}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={e => setCategorySelected(cat.id, e.target.checked)}
                                                    className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{cat.name}</span>
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <Package className="w-2.5 h-2.5" /> {count} items
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">{cat.description || 'No description available'}</p>
                                                    
                                                    {isSelected && config && (
                                                        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                                                            <div>
                                                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Display Name Override</label>
                                                                <input
                                                                    value={config.displayName}
                                                                    onChange={e => updateSectionConfig(cat.id, { displayName: e.target.value })}
                                                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 mt-1 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Section Type</label>
                                                                <select
                                                                    value={config.sectionType}
                                                                    onChange={e => updateSectionConfig(cat.id, { sectionType: e.target.value as SectionType })}
                                                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 mt-1 outline-none"
                                                                >
                                                                    <option value="STANDARD">Standard Section</option>
                                                                    <option value="FEATURED">Featured Section</option>
                                                                    <option value="PROMO">Promo Section</option>
                                                                    <option value="DYNAMIC">Dynamic Section</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button onClick={() => setPreviewTarget({ type: 'category', id: cat.id })} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Preview metadata">
                                                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Product Composition */}
                        {currentStep === 'PRODUCT_COMPOSITION' && (
                            <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 3: Product Composition</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Toggle presentation visibility and featured properties inside selected categories</p>
                                </div>

                                <div className="flex-1 flex gap-4 min-h-0">
                                    {/* Tabs for selected categories */}
                                    <div className="w-48 border border-slate-100 rounded-2xl bg-slate-50/50 p-2 space-y-1 overflow-y-auto shrink-0">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-2 mb-2">Category Tabs</span>
                                        {formData.selectedCategoryIds.map(catId => {
                                            const cat = categories.find(c => c.id === catId);
                                            const sec = formData.categorySections[catId];
                                            const count = sec?.includedItemIds.length || 0;
                                            return (
                                                <button
                                                    key={catId}
                                                    onClick={() => setActiveCategoryTab(catId)}
                                                    className={cn(
                                                        "w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between",
                                                        activeCategoryTab === catId ? "bg-slate-900 text-white shadow-md" : "hover:bg-slate-200/50 text-slate-700"
                                                    )}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-wider truncate mr-2">{sec?.displayName || cat?.name}</span>
                                                    <span className="px-1.5 py-0.5 bg-white/20 text-white rounded text-[8px] font-bold">{count}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Product items table */}
                                    <div className="flex-1 flex flex-col min-w-0 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Catalog Products</span>
                                            <div className="relative w-48">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={prodSearch}
                                                    onChange={e => setProdSearch(e.target.value)}
                                                    placeholder="Search products..."
                                                    className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 w-full outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                                            {filteredProducts.map(prod => {
                                                const sec = formData.categorySections[activeCategoryTab];
                                                const isIncluded = sec?.includedItemIds.includes(prod.id) ?? false;
                                                const isFeatured = sec?.featuredItemIds.includes(prod.id) ?? false;

                                                return (
                                                    <div key={prod.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={isIncluded}
                                                                onChange={e => setItemSelected(activeCategoryTab, prod.id, e.target.checked)}
                                                                className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                                            />
                                                            <div className="min-w-0">
                                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">{prod.name}</span>
                                                                <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">SKU: {prod.sku} · ${prod.baseProductPrice}</span>
                                                            </div>
                                                        </div>

                                                        {isIncluded && (
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    onClick={() => toggleItemFeatured(activeCategoryTab, prod.id)}
                                                                    className={cn(
                                                                        "p-1.5 rounded-lg border transition-all flex items-center gap-1",
                                                                        isFeatured ? "bg-amber-50 text-amber-500 border-amber-200" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                                                    )}
                                                                    title="Mark as Featured Product"
                                                                >
                                                                    <Star className="w-3 h-3" />
                                                                    <span className="text-[8px] font-black uppercase tracking-wider">Featured</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button onClick={() => setPreviewTarget({ type: 'item', id: prod.id })} className="p-1 hover:bg-slate-100 rounded transition-colors shrink-0">
                                                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Store Deployment Flow */}
                        {currentStep === 'STORE_DEPLOYMENT' && (
                            <div className="space-y-6 max-w-3xl">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 4: Store Deployment Flow</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Determine which stores will have operational access to this menu</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => updateForm({ storeScope: 'ALL_STORES', selectedStoreIds: mockStores.map(s => s.id) })}
                                            className={cn(
                                                "flex-1 p-4 rounded-2xl border text-left transition-all",
                                                formData.storeScope === 'ALL_STORES' ? "border-slate-900 bg-slate-950 text-white shadow-lg" : "border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <Building className="w-5 h-5 text-emerald-400 mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-wider block">All Stores Deployment</span>
                                            <span className="text-[8px] text-slate-400 font-bold block mt-1">Make menu active across all brand retail outlets</span>
                                        </button>

                                        <button
                                            onClick={() => updateForm({ storeScope: 'SPECIFIC_STORES', selectedStoreIds: [] })}
                                            className={cn(
                                                "flex-1 p-4 rounded-2xl border text-left transition-all",
                                                formData.storeScope === 'SPECIFIC_STORES' ? "border-slate-900 bg-slate-950 text-white shadow-lg" : "border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <Building className="w-5 h-5 text-emerald-400 mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-wider block">Specific Outlets Only</span>
                                            <span className="text-[8px] text-slate-400 font-bold block mt-1">Select distinct stores manually based on region/city</span>
                                        </button>
                                    </div>

                                    {formData.storeScope === 'SPECIFIC_STORES' && (
                                        <div className="space-y-3 pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Select Target Stores</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Region Filter:</span>
                                                    <select
                                                        value={formData.regionFilter}
                                                        onChange={e => updateForm({ regionFilter: e.target.value })}
                                                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 outline-none"
                                                    >
                                                        <option value="ALL">All Regions</option>
                                                        <option value="NORTH_AMERICA">North America</option>
                                                        <option value="EUROPE">Europe</option>
                                                        <option value="ASIA">Asia</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/30 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                                                {filteredStores.map(store => {
                                                    const isChecked = formData.selectedStoreIds.includes(store.id);
                                                    return (
                                                        <label key={store.id} className={cn(
                                                            "p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer bg-white transition-all",
                                                            isChecked ? "border-slate-800" : "border-slate-200"
                                                        )}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={e => {
                                                                    const selectedStoreIds = e.target.checked
                                                                        ? [...formData.selectedStoreIds, store.id]
                                                                        : formData.selectedStoreIds.filter(id => id !== store.id);
                                                                    updateForm({ selectedStoreIds });
                                                                }}
                                                                className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                                            />
                                                            <div>
                                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">{store.name}</span>
                                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{store.city} ({store.region})</span>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 5: Channel Visibility Matrix */}
                        {currentStep === 'CHANNEL_MATRIX' && (
                            <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 5: Channel Visibility Matrix</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Toggle channel integrations per store deployment target</p>
                                </div>

                                <div className="flex items-center gap-2 pb-2 shrink-0">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mr-2">Bulk Enable:</span>
                                    {CHANNELS.map(ch => (
                                        <div key={ch.id} className="flex items-center gap-1 border border-slate-200 px-2 py-1 rounded-lg">
                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">{ch.label}</span>
                                            <button onClick={() => bulkApplyChannels(ch.id as MenuChannelType, true)} className="text-[8px] font-black text-emerald-600 uppercase hover:underline ml-1">On</button>
                                            <button onClick={() => bulkApplyChannels(ch.id as MenuChannelType, false)} className="text-[8px] font-black text-rose-600 uppercase hover:underline ml-1">Off</button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex-1 border border-slate-100 rounded-2xl overflow-hidden flex flex-col min-h-0 bg-white shadow-inner">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-950 text-white text-[8px] font-black uppercase tracking-widest divide-x divide-slate-800">
                                                <th className="p-3 w-48">Store Location</th>
                                                {CHANNELS.map(ch => (
                                                    <th key={ch.id} className="p-3 text-center">{ch.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 overflow-y-auto text-[10px] font-bold">
                                            {formData.selectedStoreIds.map(storeId => {
                                                const store = mockStores.find(s => s.id === storeId);
                                                const storeChannels = formData.storeChannelMatrix[storeId] || {};
                                                return (
                                                    <tr key={storeId} className="hover:bg-slate-50 divide-x divide-slate-100">
                                                        <td className="p-3">
                                                            <span className="font-black text-slate-800 uppercase tracking-wider block">{store?.name}</span>
                                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{store?.city}</span>
                                                        </td>
                                                        {CHANNELS.map(ch => {
                                                            const isChecked = storeChannels[ch.id as MenuChannelType] ?? false;
                                                            return (
                                                                <td key={ch.id} className="p-3 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={e => setStoreChannelMatrix(storeId, ch.id as MenuChannelType, e.target.checked)}
                                                                        className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Scheduling Engine */}
                        {currentStep === 'SCHEDULING' && (() => {
                            const currentStoreId = activeScheduleStoreId || formData.selectedStoreIds[0] || '';
                            const currentStoreObj = mockStores.find(s => s.id === currentStoreId);
                            
                            const storeChannelsMap = formData.storeChannelMatrix[currentStoreId] || {};
                            const enabledChannels = CHANNELS.filter(ch => storeChannelsMap[ch.id as MenuChannelType] === true);
                            
                            const activeChannelId = enabledChannels.some(c => c.id === activeScheduleChannelId)
                                ? activeScheduleChannelId
                                : (enabledChannels[0]?.id || 'POS');
                            const activeChannelObj = CHANNELS.find(c => c.id === activeChannelId) || CHANNELS[0];

                            const scheduleKey = `${currentStoreId}:${activeChannelId}`;
                            const storeSched = formData.storeSchedules[scheduleKey] || {
                                isAlwaysActive: false,
                                effectiveFrom: '',
                                effectiveUntil: '',
                                activeDays: [
                                    { day: 'MON', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'TUE', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'WED', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'THU', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'FRI', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'SAT', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'SUN', startTime: '09:00', endTime: '22:00', isActive: true },
                                ]
                            };

                            const handleUpdateStoreSched = (up: Partial<typeof storeSched>) => {
                                setStoreSchedule(scheduleKey, up);
                            };

                            const handleToggleDay = (dayCode: string) => {
                                const activeDays = storeSched.activeDays.map(d => {
                                    if (d.day === dayCode) return { ...d, isActive: !d.isActive };
                                    return d;
                                });
                                setStoreSchedule(scheduleKey, { activeDays });
                            };

                            const handleUpdateTimes = (startTime: string, endTime: string) => {
                                const activeDays = storeSched.activeDays.map(d => ({ ...d, startTime, endTime }));
                                setStoreSchedule(scheduleKey, { activeDays });
                            };

                            // Get common start/end times from the first active day, or default
                            const firstActiveDay = storeSched.activeDays.find(d => d.isActive) || storeSched.activeDays[0];
                            const commonStartTime = firstActiveDay?.startTime || '09:00';
                            const commonEndTime = firstActiveDay?.endTime || '22:00';

                            return (
                                <div className="space-y-4 flex-1 flex flex-col min-h-0 w-full">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 6: Scheduling Engine</h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Configure distinct active days, dates, and times for each store and selected channel separately</p>
                                    </div>

                                    <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                                        {/* Store tabs */}
                                        <div className="w-52 border border-slate-100 rounded-2xl bg-slate-50/50 p-2 space-y-1 overflow-y-auto shrink-0">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-2 mb-2">Store Schedule Contexts</span>
                                            {formData.selectedStoreIds.map(sid => {
                                                const st = mockStores.find(s => s.id === sid);
                                                const isActiveTab = currentStoreId === sid;

                                                return (
                                                    <button
                                                        key={sid}
                                                        onClick={() => {
                                                            setActiveScheduleStoreId(sid);
                                                            setActiveScheduleChannelId(''); // reset channel tab on store change
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between",
                                                            isActiveTab ? "bg-slate-900 text-white shadow-md" : "hover:bg-slate-200/50 text-slate-700"
                                                        )}
                                                    >
                                                        <div className="truncate mr-2">
                                                            <span className="text-[10px] font-black uppercase tracking-wider block truncate">{st?.name}</span>
                                                            <span className="text-[8px] opacity-70 block">{st?.city}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Schedule Config form for selected store */}
                                        {currentStoreId ? (
                                            <div className="flex-1 border border-slate-100 rounded-2xl p-5 bg-white space-y-4 overflow-y-auto flex flex-col">
                                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                                                    <div>
                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">{currentStoreObj?.name}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{currentStoreObj?.city} · {currentStoreObj?.region}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => applyStoreScheduleToAll(scheduleKey)}
                                                        className="px-3 py-1.5 border border-slate-200 hover:border-slate-900 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
                                                    >
                                                        Apply this schedule to all stores
                                                    </button>
                                                </div>

                                                {/* Active Channel Tabs for selected store */}
                                                {enabledChannels.length > 0 ? (
                                                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 shrink-0 overflow-x-auto">
                                                        {enabledChannels.map(ch => {
                                                            const isChActive = activeChannelId === ch.id;
                                                            return (
                                                                <button
                                                                    key={ch.id}
                                                                    onClick={() => setActiveScheduleChannelId(ch.id)}
                                                                    className={cn(
                                                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                                                                        isChActive
                                                                            ? "bg-slate-900 text-white shadow-sm"
                                                                            : "bg-slate-50 text-slate-500 border border-slate-200/60 hover:text-slate-900"
                                                                    )}
                                                                >
                                                                    {ch.icon}
                                                                    {ch.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[10px] font-medium flex items-center gap-2 shrink-0">
                                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                        No channels are enabled for this store. Please enable channels in Step 5.
                                                    </div>
                                                )}

                                                {enabledChannels.length > 0 && (
                                                    <div className="space-y-5 flex-1 pt-1">
                                                        <div className="flex items-center justify-between pb-1 border-b border-slate-50">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                Timings & Dates for {activeChannelObj.label}
                                                            </span>
                                                        </div>

                                                        {/* Week Days Selector (Default selected all) */}
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Weekdays (Default All Selected)</label>
                                                            <div className="flex items-center gap-1.5">
                                                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => {
                                                                    const dayData = storeSched.activeDays.find(d => d.day === day) || { day, isActive: true };
                                                                    const isSelected = dayData.isActive;
                                                                    return (
                                                                        <button
                                                                            key={day}
                                                                            type="button"
                                                                            onClick={() => handleToggleDay(day)}
                                                                            className={cn(
                                                                                "w-10 h-10 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center border shadow-sm",
                                                                                isSelected
                                                                                    ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 scale-105"
                                                                                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                                                            )}
                                                                        >
                                                                            {day.slice(0, 2)}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Date Range Config */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={storeSched.effectiveFrom || ''}
                                                                    onChange={e => handleUpdateStoreSched({ effectiveFrom: e.target.value })}
                                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">End Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={storeSched.effectiveUntil || ''}
                                                                    onChange={e => handleUpdateStoreSched({ effectiveUntil: e.target.value })}
                                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Time Range Config */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={commonStartTime}
                                                                    onChange={e => handleUpdateTimes(e.target.value, commonEndTime)}
                                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">End Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={commonEndTime}
                                                                    onChange={e => handleUpdateTimes(commonStartTime, e.target.value)}
                                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl text-[10px] text-slate-400 font-bold uppercase">
                                                Select a store to configure its custom schedule timings
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* STEP 7: Deployment Summary */}
                        {currentStep === 'DEPLOYMENT_SUMMARY' && (
                            <div className="space-y-6 max-w-3xl">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 7: Deployment Summary</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Validate configuration parameters before menu execution activation</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Structural Metrics</span>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                            <div>Mapped Categories:</div>
                                            <div className="text-right text-slate-900 font-black">{formData.selectedCategoryIds.length}</div>
                                            <div>Total Items Mapped:</div>
                                            <div className="text-right text-slate-900 font-black">
                                                {Object.values(formData.categorySections).reduce((sum, s) => sum + s.includedItemIds.length, 0)}
                                            </div>
                                            <div>Active Stores:</div>
                                            <div className="text-right text-slate-900 font-black">
                                                {formData.storeScope === 'ALL_STORES' ? 'ALL STORES' : formData.selectedStoreIds.length}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Release Strategy</span>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                            <div>Channel Target:</div>
                                            <div className="text-right text-slate-900 font-black">{formData.primaryChannel}</div>
                                            <div>Schedule:</div>
                                            <div className="text-right text-slate-900 font-black">
                                                {formData.globalSchedule.isAlwaysActive ? '24 / 7 ALWAYS' : 'TIMED CAMPAIGN'}
                                            </div>
                                            <div>Status Mode:</div>
                                            <div className="text-right text-slate-900 font-black">
                                                {formData.isDefault ? 'CHANNEL DEFAULT' : 'SUB-MENU LAYER'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 border border-emerald-200/50 rounded-2xl flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">Deployment Integrity Check Passed</span>
                                        <p className="text-[9px] text-emerald-600 font-bold mt-0.5 leading-relaxed">
                                            Presentation configs references only. Master catalog entities will not be modified upon submission.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Contextual Preview Drawer (Static/Slide style) */}
                    {previewTarget && (
                        <div className="w-80 border-l border-slate-100 bg-slate-50/50 flex flex-col h-full shrink-0 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Preview Drawer</span>
                                <button onClick={() => setPreviewTarget(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                    <X className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                            </div>

                            {previewedCategory && (
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Category Asset</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Category Name</span>
                                        <span className="text-xs font-bold text-slate-800 block mt-0.5">{previewedCategory.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Description</span>
                                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{previewedCategory.description || 'No description provided'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Linked Products Count</span>
                                        <span className="text-xs font-mono font-bold text-slate-800 mt-1 block">
                                            {items.filter(i => i.categoryId === previewedCategory.id).length} products
                                        </span>
                                    </div>
                                </div>
                            )}

                            {previewedItem && (
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Product Asset</span>
                                    </div>
                                    {previewedItem.imageUrl && (
                                        <img src={previewedItem.imageUrl} alt={previewedItem.name} className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                                    )}
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Product Name</span>
                                        <span className="text-xs font-bold text-slate-800 block mt-0.5">{previewedItem.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">SKU Identity</span>
                                        <span className="text-[10px] font-mono text-slate-600 block mt-0.5">{previewedItem.sku}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Base Pricing</span>
                                        <span className="text-xs font-bold text-slate-800 mt-0.5 block">${previewedItem.baseProductPrice}</span>
                                    </div>
                                    {previewedItem.tags && previewedItem.tags.length > 0 && (
                                        <div>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Product Tags</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {previewedItem.tags.map(t => (
                                                    <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] font-bold uppercase">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Action Footer ────────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 'BASIC_DETAILS'}
                        className="px-4 py-2 text-[10px] font-black text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest transition-colors flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Prev Step
                    </button>

                    {currentStep === 'DEPLOYMENT_SUMMARY' ? (
                        <button
                            onClick={submitMenu}
                            className="px-5 py-2 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Check className="w-4 h-4 text-emerald-400" /> Complete & Submit
                        </button>
                    ) : (
                        <button
                            onClick={nextStep}
                            disabled={!isStepValid()}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg",
                                isStepValid()
                                    ? "bg-slate-950 text-white hover:bg-slate-900"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            Next Step <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

            </div>
    );
};
