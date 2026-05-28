'use client';

import React, { useState } from 'react';
import {
    Plus, ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Trash2,
    Star, Zap, Tag, Store, Layers, Package, ChevronUp, Sparkles
} from 'lucide-react';
import { useMenuBuilderStore } from '../../state/menuBuilderStore';
import { useCatalogStore } from '../../state/catalogStore';
import type { MenuSection, SectionType } from '../../types/menu';
import { cn } from '@/utils';

const SECTION_TYPE_CONFIG: Record<SectionType, { label: string; icon: React.ReactNode; color: string }> = {
    STANDARD: { label: 'Standard', icon: <Layers className="w-3 h-3" />, color: 'text-slate-500' },
    FEATURED: { label: 'Featured', icon: <Star className="w-3 h-3" />, color: 'text-amber-500' },
    PROMO: { label: 'Promo', icon: <Tag className="w-3 h-3" />, color: 'text-rose-500' },
    DYNAMIC: { label: 'Dynamic', icon: <Zap className="w-3 h-3" />, color: 'text-blue-500' },
    STORE_OVERRIDE: { label: 'Store Override', icon: <Store className="w-3 h-3" />, color: 'text-violet-500' },
};

interface SectionItemProps {
    section: MenuSection;
    isSelected: boolean;
    onSelect: () => void;
    index: number;
}

const SectionItem: React.FC<SectionItemProps> = ({ section, isSelected, onSelect, index }) => {
    const { updateSection, removeSection, reorderSections, draftSections } = useMenuBuilderStore();
    const { categories, items } = useCatalogStore();
    const cat = categories.find(c => c.id === section.catalogCategoryId);
    const productCount = section.includedItemIds.length;
    const typeConfig = SECTION_TYPE_CONFIG[section.sectionType || 'STANDARD'];

    const canMoveUp = index > 0;
    const canMoveDown = index < draftSections.length - 1;

    return (
        <div
            onClick={onSelect}
            className={cn(
                "group px-3 py-2.5 rounded-xl border transition-all cursor-pointer",
                isSelected
                    ? "bg-slate-950 border-slate-800 text-white shadow-lg"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-800"
            )}
        >
            <div className="flex items-center gap-2">
                <GripVertical className={cn("w-3 h-3 shrink-0 cursor-grab", isSelected ? "text-slate-500" : "text-slate-300 group-hover:text-slate-400")} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className={cn("shrink-0", isSelected ? "text-emerald-400" : typeConfig.color)}>{typeConfig.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider truncate leading-tight">
                            {section.displayName || cat?.name || 'Untitled'}
                        </span>
                    </div>
                    <div className={cn("flex items-center gap-2 mt-1 text-[8px] font-bold uppercase tracking-widest", isSelected ? "text-slate-400" : "text-slate-400")}>
                        <span>{typeConfig.label}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Package className="w-2.5 h-2.5" /> {productCount}</span>
                        {section.featuredItemIds.length > 0 && (
                            <>
                                <span>·</span>
                                <span className="flex items-center gap-0.5 text-amber-500"><Sparkles className="w-2.5 h-2.5" /> {section.featuredItemIds.length}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {canMoveUp && (
                        <button onClick={() => reorderSections(index, index - 1)} className={cn("p-0.5 rounded hover:bg-white/10", isSelected ? "text-slate-500 hover:text-white" : "text-slate-300 hover:text-slate-600")}>
                            <ChevronUp className="w-3 h-3" />
                        </button>
                    )}
                    {canMoveDown && (
                        <button onClick={() => reorderSections(index, index + 1)} className={cn("p-0.5 rounded hover:bg-white/10", isSelected ? "text-slate-500 hover:text-white" : "text-slate-300 hover:text-slate-600")}>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => updateSection(section.id, { isVisible: !section.isVisible })}
                        className={cn("p-1 rounded-lg transition-colors", isSelected ? "hover:bg-white/10" : "hover:bg-slate-100")}
                        title={section.isVisible ? 'Hide section' : 'Show section'}
                    >
                        {section.isVisible
                            ? <Eye className={cn("w-3 h-3", isSelected ? "text-emerald-400" : "text-emerald-500")} />
                            : <EyeOff className={cn("w-3 h-3", isSelected ? "text-slate-500" : "text-slate-400")} />
                        }
                    </button>
                    <button
                        onClick={() => { if (confirm(`Remove section "${section.displayName}"?`)) removeSection(section.id); }}
                        className={cn("p-1 rounded-lg transition-colors", isSelected ? "hover:bg-white/10 text-slate-500 hover:text-rose-400" : "hover:bg-rose-50 text-slate-300 hover:text-rose-500")}
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Add Section Dropdown ────────────────────────────────────────────────────

const AddSectionDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { addSection, draftSections } = useMenuBuilderStore();
    const { categories } = useCatalogStore();

    // Filter out categories already added
    const usedCategoryIds = new Set(draftSections.map(s => s.catalogCategoryId));
    const availableCategories = categories.filter(c => !usedCategoryIds.has(c.id));

    const sectionTypes: SectionType[] = ['STANDARD', 'FEATURED', 'PROMO', 'DYNAMIC', 'STORE_OVERRIDE'];
    const [selectedType, setSelectedType] = useState<SectionType>('STANDARD');

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
            >
                <Plus className="w-3 h-3 text-emerald-400" /> Add Section
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-150">
                    {/* Section Type Selector */}
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Section Type</span>
                        <div className="flex flex-wrap gap-1">
                            {sectionTypes.map(type => {
                                const config = SECTION_TYPE_CONFIG[type];
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedType(type)}
                                        className={cn(
                                            "px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1",
                                            selectedType === type
                                                ? "bg-slate-950 text-white border-slate-800"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        {config.icon} {config.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category List */}
                    <div className="max-h-48 overflow-y-auto">
                        {availableCategories.length === 0 ? (
                            <div className="px-3 py-4 text-center text-[10px] text-slate-400 font-bold">All categories are already in this menu</div>
                        ) : (
                            availableCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { addSection(cat.id, selectedType); setIsOpen(false); }}
                                    className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 flex items-center gap-2"
                                >
                                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-800 block">{cat.name}</span>
                                        {cat.description && <span className="text-[8px] text-slate-400 font-medium">{cat.description}</span>}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Left Sidebar ───────────────────────────────────────────────────────

export const BuilderLeftSidebar: React.FC = () => {
    const { draftSections, selectedSectionId, selectSection, isDirty, draftName } = useMenuBuilderStore();

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Menu Structure</span>
                    {isDirty && <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">Unsaved</span>}
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider truncate">{draftName || 'Untitled Menu'}</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{draftSections.length} sections</p>
            </div>

            {/* Section List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {draftSections.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                        <Layers className="w-8 h-8 text-slate-200 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500">No sections yet</span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">Add a category to create a section</span>
                    </div>
                ) : (
                    draftSections
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((section, index) => (
                            <SectionItem
                                key={section.id}
                                section={section}
                                isSelected={selectedSectionId === section.id}
                                onSelect={() => selectSection(section.id)}
                                index={index}
                            />
                        ))
                )}
            </div>

            {/* Add Section */}
            <div className="px-3 py-3 border-t border-slate-100">
                <AddSectionDropdown />
            </div>
        </div>
    );
};
