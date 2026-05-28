'use client';

import React, { useMemo, useState } from 'react';
import {
    Plus, Eye, EyeOff, Star, Sparkles, GripVertical, Package, Search,
    ChevronUp, ChevronDown, ArrowRight, X, Layers, Tag, Zap, Store as StoreIcon,
    AlertTriangle, Image as ImageIcon
} from 'lucide-react';
import { useMenuBuilderStore } from '../../state/menuBuilderStore';
import { useCatalogStore } from '../../state/catalogStore';
import type { MenuSection, SectionType } from '../../types/menu';
import type { Item } from '../../types/items';
import { cn } from '@/utils';

const TYPE_BADGE: Record<SectionType, { label: string; color: string }> = {
    STANDARD: { label: 'Standard', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    FEATURED: { label: 'Featured', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    PROMO: { label: 'Promo', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    DYNAMIC: { label: 'Dynamic', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    STORE_OVERRIDE: { label: 'Store Override', color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

// ─── Product Row ─────────────────────────────────────────────────────────────

interface ProductRowProps {
    item: Item;
    section: MenuSection;
    index: number;
}

const ProductRow: React.FC<ProductRowProps> = ({ item, section, index }) => {
    const {
        toggleItemVisibility, toggleItemFeatured, removeItemFromSection,
        reorderItemInSection, selectItem, selectedItemId, draftItemOverrides, draftSections,
    } = useMenuBuilderStore();

    const isExcluded = section.excludedItemIds.includes(item.id);
    const isFeatured = section.featuredItemIds.includes(item.id);
    const isSelected = selectedItemId === item.id;
    const override = draftItemOverrides.find(o => o.itemId === item.id);
    const canMoveUp = index > 0;
    const canMoveDown = index < section.includedItemIds.length - 1;
    const otherSections = draftSections.filter(s => s.id !== section.id);

    const displayName = override?.displayNameOverride || item.name;
    const displayPrice = override?.priceOverride ?? item.baseProductPrice ?? 0;

    return (
        <div
            onClick={() => selectItem(item.id)}
            className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer",
                isSelected ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-white border-slate-100 hover:border-slate-250 hover:shadow-sm",
                isExcluded && "opacity-40"
            )}
        >
            <GripVertical className="w-3 h-3 text-slate-300 cursor-grab shrink-0" />

            {/* Image */}
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon className="w-4 h-4 text-slate-300" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className={cn("text-[11px] font-bold truncate", isExcluded ? "text-slate-400 line-through" : "text-slate-900")}>{displayName}</span>
                    {isFeatured && <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />}
                    {override && <span className="text-[7px] font-black text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 uppercase shrink-0">Override</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 font-medium">
                    <span className="font-mono font-bold text-slate-600">${displayPrice.toFixed(2)}</span>
                    <span>·</span>
                    <span className="uppercase">{item.productType}</span>
                    {item.sku && <><span>·</span><span className="font-mono">{item.sku}</span></>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                {canMoveUp && (
                    <button onClick={() => reorderItemInSection(section.id, index, index - 1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
                        <ChevronUp className="w-3 h-3" />
                    </button>
                )}
                {canMoveDown && (
                    <button onClick={() => reorderItemInSection(section.id, index, index + 1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
                        <ChevronDown className="w-3 h-3" />
                    </button>
                )}
                <button
                    onClick={() => toggleItemFeatured(section.id, item.id)}
                    className={cn("p-1 rounded-lg transition-colors", isFeatured ? "bg-amber-50 text-amber-600" : "hover:bg-amber-50 text-slate-300 hover:text-amber-500")}
                    title={isFeatured ? 'Remove featured' : 'Mark as featured'}
                >
                    <Star className="w-3 h-3" />
                </button>
                <button
                    onClick={() => toggleItemVisibility(section.id, item.id)}
                    className={cn("p-1 rounded-lg transition-colors", isExcluded ? "text-slate-400 hover:bg-emerald-50 hover:text-emerald-500" : "hover:bg-slate-100 text-emerald-500")}
                    title={isExcluded ? 'Show product' : 'Hide product'}
                >
                    {isExcluded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                    onClick={() => removeItemFromSection(section.id, item.id)}
                    className="p-1 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
                    title="Remove from section"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

// ─── Section Canvas Block ────────────────────────────────────────────────────

interface SectionBlockProps {
    section: MenuSection;
}

const SectionBlock: React.FC<SectionBlockProps> = ({ section }) => {
    const { addItemToSection, selectSection, selectedSectionId } = useMenuBuilderStore();
    const { items, categories } = useCatalogStore();
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [addSearch, setAddSearch] = useState('');

    const cat = categories.find(c => c.id === section.catalogCategoryId);
    const isActive = selectedSectionId === section.id;
    const badge = TYPE_BADGE[section.sectionType || 'STANDARD'];

    // Resolve products: included items + items from linked category
    const sectionItems = useMemo(() => {
        const included = new Set(section.includedItemIds);
        // Also include items that belong to this category
        const categoryItems = items.filter(i => i.categoryId === section.catalogCategoryId);
        categoryItems.forEach(i => included.add(i.id));
        // Remove excluded
        section.excludedItemIds.forEach(id => included.delete(id));
        // Return in order: includedItemIds order first, then category items
        const orderedIds = [...section.includedItemIds];
        included.forEach(id => { if (!orderedIds.includes(id)) orderedIds.push(id); });
        return orderedIds.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[];
    }, [items, section]);

    // Available items to add (not already in this section)
    const existingIds = new Set(sectionItems.map(i => i.id));
    const availableItems = items.filter(i =>
        !existingIds.has(i.id) &&
        (addSearch ? i.name.toLowerCase().includes(addSearch.toLowerCase()) || i.id.includes(addSearch) : true)
    );

    return (
        <div
            onClick={() => selectSection(section.id)}
            className={cn(
                "bg-white rounded-2xl border shadow-sm transition-all",
                isActive ? "border-slate-300 shadow-md ring-1 ring-slate-200" : "border-slate-200/80"
            )}
        >
            {/* Section Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base font-black text-slate-900 truncate">{section.displayName || cat?.name}</span>
                    <span className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border shrink-0", badge.color)}>
                        {badge.label}
                    </span>
                    {!section.isVisible && (
                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border bg-slate-100 text-slate-400 border-slate-200 shrink-0 flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5" /> Hidden
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{sectionItems.length} products</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowAddProduct(!showAddProduct); }}
                        className="p-1.5 bg-slate-950 text-white rounded-lg hover:bg-slate-900 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Add Product Search */}
            {showAddProduct && (
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-150">
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            value={addSearch}
                            onChange={e => setAddSearch(e.target.value)}
                            placeholder="Search products to add..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900 placeholder:text-slate-300"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {availableItems.slice(0, 8).map(item => (
                            <button
                                key={item.id}
                                onClick={() => { addItemToSection(section.id, item.id); setAddSearch(''); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white transition-colors text-left"
                            >
                                <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="text-[10px] font-bold text-slate-700 truncate">{item.name}</span>
                                <span className="text-[8px] font-mono text-slate-400 ml-auto shrink-0">${(item.baseProductPrice || 0).toFixed(2)}</span>
                            </button>
                        ))}
                        {availableItems.length === 0 && (
                            <div className="text-center py-3 text-[10px] text-slate-400 font-bold">No products available</div>
                        )}
                    </div>
                </div>
            )}

            {/* Product List */}
            <div className="px-4 py-3 space-y-1.5">
                {sectionItems.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                        <Package className="w-6 h-6 text-slate-200 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400">No products in this section</span>
                        <button
                            onClick={() => setShowAddProduct(true)}
                            className="mt-2 text-[9px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                        >
                            + Add Products
                        </button>
                    </div>
                ) : (
                    sectionItems.map((item, idx) => (
                        <ProductRow key={item.id} item={item} section={section} index={idx} />
                    ))
                )}
            </div>
        </div>
    );
};

// ─── Main Canvas Component ───────────────────────────────────────────────────

export const BuilderCanvas: React.FC = () => {
    const { draftSections, draftName } = useMenuBuilderStore();
    const sortedSections = useMemo(
        () => [...draftSections].sort((a, b) => a.sortOrder - b.sortOrder),
        [draftSections]
    );

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50/50 px-6 py-5">
            {sortedSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <Layers className="w-12 h-12 text-slate-200 mb-3" />
                    <h3 className="text-sm font-bold text-slate-600">No sections configured</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Use the left sidebar to add category sections to this menu</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {sortedSections.map(section => (
                        <SectionBlock key={section.id} section={section} />
                    ))}
                </div>
            )}
        </div>
    );
};
