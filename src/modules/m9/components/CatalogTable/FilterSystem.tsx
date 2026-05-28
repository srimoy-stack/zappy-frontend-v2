'use client';

import React, { useState } from 'react';
import {
    Filter, X, Search, Save, Trash2, ChevronDown, ChevronUp,
    Zap, Tag, Store, Radio, BarChart3, Layers, Bookmark
} from 'lucide-react';
import { 
    useBulkOperationsStore,
    OperationalStatus, CatalogType, RuntimeFilter, BusinessFilter, ChannelFilter
} from '../../state/bulkOperationsStore';
import { mockCategories } from '../../mock/items';
import { cn } from '@/utils';

// ─── Metadata Maps ──────────────────────────────────────────────

const OPERATIONAL_STATUSES: { id: OperationalStatus; label: string; color: string; emoji: string }[] = [
    { id: 'DRAFT', label: 'Draft', color: 'bg-amber-50 text-amber-700 border-amber-200', emoji: '📝' },
    { id: 'PUBLISHED', label: 'Published', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', emoji: '✅' },
    { id: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200', emoji: '🕐' },
    { id: 'ARCHIVED', label: 'Archived', color: 'bg-slate-50 text-slate-500 border-slate-200', emoji: '📦' },
    { id: 'SYNC_FAILED', label: 'Sync Failed', color: 'bg-rose-50 text-rose-700 border-rose-200', emoji: '⚠️' },
];

const CATALOG_TYPES: { id: CatalogType; label: string; emoji: string }[] = [
    { id: 'SINGLE', label: 'Single', emoji: '🍕' },
    { id: 'COMBO', label: 'Combo', emoji: '📦' },
    { id: 'CONFIGURABLE_DEAL', label: 'Deal', emoji: '🎯' },
    { id: 'FIXED_COMBO', label: 'Fixed Combo', emoji: '🔒' },
];

const RUNTIME_FILTERS: { id: RuntimeFilter; label: string; emoji: string }[] = [
    { id: 'ASSIGNED_STORES', label: 'Assigned to Stores', emoji: '🏪' },
    { id: 'UNASSIGNED', label: 'Unassigned Products', emoji: '❌' },
    { id: 'MISSING_PRICING', label: 'Missing Pricing', emoji: '💰' },
    { id: 'MISSING_MODIFIER', label: 'Missing Modifier Mapping', emoji: '🔧' },
    { id: 'STORE_OVERRIDE', label: 'Store Override Exists', emoji: '🔄' },
    { id: 'CHANNEL_CONFLICT', label: 'Channel Conflict', emoji: '⚡' },
];

const BUSINESS_FILTERS: { id: BusinessFilter; label: string; emoji: string }[] = [
    { id: 'RECENTLY_UPDATED', label: 'Recently Updated', emoji: '🕑' },
    { id: 'HIGH_SELLING', label: 'High Selling', emoji: '🔥' },
    { id: 'LOW_SELLING', label: 'Low Selling', emoji: '📉' },
    { id: 'MOST_ASSIGNED', label: 'Most Assigned', emoji: '📊' },
    { id: 'INVENTORY_LINKED', label: 'Inventory Linked', emoji: '📋' },
];

const CHANNEL_FILTERS: { id: ChannelFilter; label: string; emoji: string }[] = [
    { id: 'POS', label: 'POS', emoji: '🖥️' },
    { id: 'ONLINE', label: 'Online Ordering', emoji: '🌐' },
    { id: 'UBER_EATS', label: 'Uber Eats', emoji: '🚗' },
    { id: 'DOORDASH', label: 'DoorDash', emoji: '🚀' },
];

// ─── FilterSection Component ────────────────────────────────────

const FilterSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {isOpen && <div className="px-5 pb-4 pt-1">{children}</div>}
        </div>
    );
};

// ─── FilterChipGroup Component ──────────────────────────────────

const FilterChipGroup: React.FC<{
    items: { id: string; label: string; emoji?: string; color?: string }[];
    selected: string[];
    onToggle: (id: string) => void;
}> = ({ items, selected, onToggle }) => (
    <div className="flex flex-wrap gap-1.5">
        {items.map(item => {
            const isActive = selected.includes(item.id);
            return (
                <button
                    key={item.id}
                    onClick={() => onToggle(item.id)}
                    className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all",
                        isActive
                            ? (item.color || "bg-slate-950 text-white border-slate-800")
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                    )}
                >
                    {item.emoji && <span className="mr-1">{item.emoji}</span>}
                    {item.label}
                </button>
            );
        })}
    </div>
);

// ─── Active Filter Chips Bar ────────────────────────────────────

export const ActiveFilterChips: React.FC = () => {
    const {
        filters,
        toggleOperationalStatus,
        toggleCatalogType,
        toggleRuntimeFilter,
        toggleBusinessFilter,
        toggleChannelFilter,
        toggleCategoryFilter,
        toggleTagFilter,
        clearAllFilters,
        getActiveFilterCount,
        setSearchQuery,
    } = useBulkOperationsStore();

    const count = getActiveFilterCount();
    if (count === 0) return null;

    const chips: { label: string; onRemove: () => void }[] = [];

    if (filters.searchQuery) {
        chips.push({ label: `Search: "${filters.searchQuery}"`, onRemove: () => setSearchQuery('') });
    }
    filters.operationalStatuses.forEach(s => {
        const meta = OPERATIONAL_STATUSES.find(x => x.id === s);
        chips.push({ label: meta?.label || s, onRemove: () => toggleOperationalStatus(s) });
    });
    filters.catalogTypes.forEach(t => {
        const meta = CATALOG_TYPES.find(x => x.id === t);
        chips.push({ label: meta?.label || t, onRemove: () => toggleCatalogType(t) });
    });
    filters.runtimeFilters.forEach(f => {
        const meta = RUNTIME_FILTERS.find(x => x.id === f);
        chips.push({ label: meta?.label || f, onRemove: () => toggleRuntimeFilter(f) });
    });
    filters.businessFilters.forEach(f => {
        const meta = BUSINESS_FILTERS.find(x => x.id === f);
        chips.push({ label: meta?.label || f, onRemove: () => toggleBusinessFilter(f) });
    });
    filters.channelFilters.forEach(c => {
        const meta = CHANNEL_FILTERS.find(x => x.id === c);
        chips.push({ label: meta?.label || c, onRemove: () => toggleChannelFilter(c) });
    });
    filters.categoryIds.forEach(id => {
        const cat = mockCategories.find(c => c.id === id);
        chips.push({ label: cat?.name || id, onRemove: () => toggleCategoryFilter(id) });
    });
    filters.tags.forEach(tag => {
        chips.push({ label: `#${tag}`, onRemove: () => toggleTagFilter(tag) });
    });

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">
                {count} Active Filter{count > 1 ? 's' : ''}:
            </span>
            {chips.map((chip, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider">
                    {chip.label}
                    <button onClick={chip.onRemove} className="hover:text-rose-300 transition-colors ml-0.5">
                        <X className="w-2.5 h-2.5" />
                    </button>
                </span>
            ))}
            <button
                onClick={clearAllFilters}
                className="text-[9px] font-black text-rose-500 uppercase tracking-wider hover:text-rose-700 transition-colors ml-1"
            >
                Clear All
            </button>
        </div>
    );
};

// ─── Main FilterSystem Component ────────────────────────────────

export const FilterSystem: React.FC = () => {
    const {
        filters,
        isFilterPanelOpen,
        toggleFilterPanel,
        toggleOperationalStatus,
        toggleCatalogType,
        toggleRuntimeFilter,
        toggleBusinessFilter,
        toggleChannelFilter,
        toggleCategoryFilter,
        clearAllFilters,
        getActiveFilterCount,
        savedPresets,
        applyPreset,
        saveCurrentAsPreset,
        deletePreset,
        setSearchQuery,
    } = useBulkOperationsStore();

    const [saveName, setSaveName] = useState('');
    const [showSave, setShowSave] = useState(false);
    const filterCount = getActiveFilterCount();

    if (!isFilterPanelOpen) return null;

    return (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                    <Filter className="w-4 h-4 text-slate-600" />
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Advanced Filters</span>
                    {filterCount > 0 && (
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded-full text-[9px] font-black">
                            {filterCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {filterCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="text-[9px] font-black text-rose-500 uppercase tracking-wider hover:text-rose-700 transition-colors"
                        >
                            Reset All
                        </button>
                    )}
                    <button onClick={toggleFilterPanel} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Search inside filters */}
            <div className="px-5 py-3 border-b border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        value={filters.searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products by name, SKU, or ID..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 transition-all outline-none placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Filter Sections */}
            <div className="max-h-[400px] overflow-y-auto">
                <FilterSection title="Operational Status" icon={<Zap className="w-3 h-3 text-amber-500" />}>
                    <FilterChipGroup
                        items={OPERATIONAL_STATUSES}
                        selected={filters.operationalStatuses}
                        onToggle={(id) => toggleOperationalStatus(id as OperationalStatus)}
                    />
                </FilterSection>

                <FilterSection title="Product Type" icon={<Layers className="w-3 h-3 text-indigo-500" />}>
                    <FilterChipGroup
                        items={CATALOG_TYPES}
                        selected={filters.catalogTypes}
                        onToggle={(id) => toggleCatalogType(id as CatalogType)}
                    />
                </FilterSection>

                <FilterSection title="Category" icon={<Tag className="w-3 h-3 text-emerald-500" />} defaultOpen={false}>
                    <FilterChipGroup
                        items={mockCategories.map(c => ({ id: c.id, label: c.name }))}
                        selected={filters.categoryIds}
                        onToggle={toggleCategoryFilter}
                    />
                </FilterSection>

                <FilterSection title="Runtime Health" icon={<Radio className="w-3 h-3 text-rose-500" />} defaultOpen={false}>
                    <FilterChipGroup
                        items={RUNTIME_FILTERS}
                        selected={filters.runtimeFilters}
                        onToggle={(id) => toggleRuntimeFilter(id as RuntimeFilter)}
                    />
                </FilterSection>

                <FilterSection title="Channels" icon={<Store className="w-3 h-3 text-blue-500" />} defaultOpen={false}>
                    <FilterChipGroup
                        items={CHANNEL_FILTERS}
                        selected={filters.channelFilters}
                        onToggle={(id) => toggleChannelFilter(id as ChannelFilter)}
                    />
                </FilterSection>

                <FilterSection title="Business Intelligence" icon={<BarChart3 className="w-3 h-3 text-violet-500" />} defaultOpen={false}>
                    <FilterChipGroup
                        items={BUSINESS_FILTERS}
                        selected={filters.businessFilters}
                        onToggle={(id) => toggleBusinessFilter(id as BusinessFilter)}
                    />
                </FilterSection>
            </div>

            {/* Saved Presets */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Bookmark className="w-3 h-3" /> Saved Presets
                    </span>
                    {filterCount > 0 && (
                        <button
                            onClick={() => setShowSave(!showSave)}
                            className="text-[9px] font-black text-slate-600 uppercase tracking-wider hover:text-slate-900 transition-colors flex items-center gap-1"
                        >
                            <Save className="w-3 h-3" /> Save Current
                        </button>
                    )}
                </div>

                {showSave && (
                    <div className="flex items-center gap-2 mb-2 animate-in slide-in-from-top-1 duration-150">
                        <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Preset name..."
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-900"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && saveName.trim()) {
                                    saveCurrentAsPreset(saveName.trim());
                                    setSaveName('');
                                    setShowSave(false);
                                }
                            }}
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                if (saveName.trim()) {
                                    saveCurrentAsPreset(saveName.trim());
                                    setSaveName('');
                                    setShowSave(false);
                                }
                            }}
                            className="px-3 py-2 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-wider"
                        >
                            Save
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                    {savedPresets.length === 0 && (
                        <span className="text-[9px] text-slate-400 font-bold italic">No saved presets</span>
                    )}
                    {savedPresets.map(preset => (
                        <div key={preset.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg group">
                            <button
                                onClick={() => applyPreset(preset)}
                                className="text-[9px] font-black text-slate-600 uppercase tracking-wider hover:text-slate-900 transition-colors"
                            >
                                {preset.name}
                            </button>
                            <button
                                onClick={() => deletePreset(preset.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
