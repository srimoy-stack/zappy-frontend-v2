'use client';

import React from 'react';
import {
    Edit3, Eye, Copy, Archive, Trash2, MoreHorizontal, Lock, Unlock,
    TrendingUp, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Item } from '../../types/items';
import { useBulkOperationsStore } from '../../state/bulkOperationsStore';
import { useCatalogStore } from '../../state/catalogStore';
import { cn } from '@/utils';

interface CatalogTableRowProps {
    item: Item;
    index: number;
    isSelected: boolean;
    onEdit: (item: Item) => void;
    onView: (item: Item) => void;
    onSelectToggle: (e: React.MouseEvent, id: string) => void;
}

export const CatalogTableRow: React.FC<CatalogTableRowProps> = ({
    item,
    index,
    isSelected,
    onEdit,
    onView,
    onSelectToggle
}) => {
    const { deleteItem, createItem, updateItem, categories } = useCatalogStore();
    const { openDetailPanel } = useBulkOperationsStore();
    const [showMenu, setShowMenu] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Operational statuses
    const activeSync = item.channelSyncs?.find(c => c.channelId === 'POS')?.status || 'SYNCED';
    const isVeg = item.dietaryFlags?.includes('vegetarian') || item.tags?.some(t => t.toLowerCase() === 'vegetarian');
    const isBestseller = item.tags?.some(tag => tag.toLowerCase() === 'bestseller');

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        createItem({
            ...item,
            id: 'item-' + Date.now(),
            name: `${item.name} (Duplicate)`,
            sku: `${item.sku || 'SKU'}-DUP`,
            channelSyncs: [
                { channelId: 'POS', status: 'DRAFT' },
                { channelId: 'ONLINE', status: 'DRAFT' }
            ]
        });
    };

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        if (confirm(`Archive ${item.name}? This will take it offline across all channels.`)) {
            updateItem(item.id, {
                isAvailable: false,
                channelSyncs: [
                    { channelId: 'POS', status: 'DRAFT' },
                    { channelId: 'ONLINE', status: 'DRAFT' }
                ]
            });
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        const isLinkedToCombo = item.productType === 'COMBO' || item.name.includes('Classic') || item.name.includes('Gourmet');
        const isLinkedToRecipe = item.taxRate !== undefined && (item.taxRate === 0 || item.taxRate > 5);

        if (isLinkedToCombo || isLinkedToRecipe) {
            alert(`DELETE BLOCKED:\n\nThis item is connected to active Combo Slot elements or Linked Recipes. Please use "Archive" instead.`);
            return;
        }

        if (confirm(`Permanently delete ${item.name}?`)) {
            deleteItem(item.id);
        }
    };

    return (
        <tr
            className={cn(
                "group border-b border-slate-100 hover:bg-slate-50/70 transition-all cursor-pointer relative",
                isSelected && "bg-slate-50/90"
            )}
            onClick={() => openDetailPanel(item.id)}
        >
            {/* Checkbox column */}
            <td className="pl-6 pr-2 py-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectToggle(e as any, item.id)}
                        onClick={(e) => {
                            if (e.shiftKey) {
                                onSelectToggle(e as any, item.id);
                            }
                        }}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                </div>
            </td>

            {/* Product image */}
            <td className="px-4 py-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-150 flex-shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] font-bold text-slate-400">IMG</span>
                    )}
                </div>
            </td>

            {/* Product Name */}
            <td className="px-4 py-4 text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                {item.name}
            </td>

            {/* Product Type */}
            <td className="px-4 py-4 text-xs text-slate-800 font-semibold">
                {item.productType}
            </td>

            {/* SKU */}
            <td className="px-4 py-4 text-xs font-mono text-slate-850 font-bold">
                {item.sku || '—'}
            </td>

            {/* Item ID */}
            <td className="px-4 py-4 text-xs font-mono text-slate-700 font-semibold">
                {item.id}
            </td>

            {/* Item Type badge */}
            <td className="px-4 py-4">
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
                    item.productType === 'SINGLE' ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                    item.productType === 'COMBO' ? "bg-violet-50 text-violet-850 border-violet-200" :
                    "bg-amber-50 text-amber-850 border-amber-200"
                )}>
                    {item.productType}
                </span>
            </td>

            {/* Veg/Non-Veg icon */}
            <td className="px-4 py-4 text-center">
                <div className="inline-flex items-center justify-center">
                    {isVeg ? (
                        <div className="w-5 h-5 border border-emerald-600 rounded flex items-center justify-center p-0.5 bg-emerald-50/50" title="Vegetarian">
                            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
                        </div>
                    ) : (
                        <div className="w-5 h-5 border border-rose-800 rounded flex items-center justify-center p-0.5 bg-rose-50/50" title="Non-Vegetarian">
                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-rose-800" />
                        </div>
                    )}
                </div>
            </td>

            {/* Bestseller badge */}
            <td className="px-4 py-4 text-center">
                {isBestseller ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-amber-650 fill-amber-500" />
                        Best
                    </span>
                ) : (
                    <span className="text-slate-400 text-xs font-semibold">—</span>
                )}
            </td>

            {/* Category */}
            <td className="px-4 py-4 text-xs text-slate-900 font-bold">
                {categories.find(c => c.id === item.categoryId)?.name || 'Uncategorized'}
            </td>

            {/* Added to Menu */}
            <td className="px-4 py-4 text-center">
                <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                    item.isAvailable 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                        : "bg-slate-100 text-slate-650 border-slate-300"
                )}>
                    {item.isAvailable ? 'Active' : 'Inactive'}
                </span>
            </td>

            {/* Added to Store */}
            <td className="px-4 py-4 text-xs font-bold text-slate-900">
                {item.scopeConfig?.scope === 'STORE_SPECIFIC' ? (
                    <span className="text-amber-900" title={item.scopeConfig.targetedStoreIds.join(', ')}>
                        {item.scopeConfig.targetedStoreIds.length} Stores
                    </span>
                ) : (
                    <span className="text-indigo-850">Global</span>
                )}
            </td>

            {/* Channel */}
            <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1 max-w-[120px]">
                    {item.channelVisibility && item.channelVisibility.length > 0 ? (
                        item.channelVisibility.map(ch => (
                            <span key={ch} className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px] font-bold text-slate-700 uppercase">
                                {ch}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-405 text-xs font-semibold">—</span>
                    )}
                </div>
            </td>

            {/* Publish */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                    <span className={cn(
                        "w-2 h-2 rounded-full",
                        activeSync === 'SYNCED' ? "bg-emerald-500" :
                        activeSync === 'FAILED' ? "bg-rose-500 animate-pulse" :
                        activeSync === 'QUEUED' ? "bg-blue-500 animate-bounce" : "bg-amber-500"
                    )} />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide font-mono">
                        {activeSync}
                    </span>
                </div>
            </td>

            {/* Detail screen trigger */}
            <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onView(item)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-650 hover:text-emerald-700 transition-colors"
                >
                    <Eye className="w-3.5 h-3.5" />
                    Detail
                </button>
            </td>

            {/* Structured action panel trigger */}
            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="relative inline-block text-left" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg transition-colors text-slate-500"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 focus:outline-none animate-in fade-in duration-100">
                            <button
                                onClick={() => { setShowMenu(false); onView(item); }}
                                className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <Eye className="w-3.5 h-3.5 text-slate-400" /> Preview
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); onEdit(item); }}
                                className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit Product
                            </button>
                            <button
                                onClick={handleDuplicate}
                                className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                            </button>
                            <button
                                onClick={handleArchive}
                                className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider text-amber-700 hover:bg-amber-50/50 transition-colors flex items-center gap-2"
                            >
                                <Archive className="w-3.5 h-3.5 text-amber-500" /> Archive
                            </button>
                            <div className="h-[1px] bg-slate-100 my-1" />
                            <button
                                onClick={handleDelete}
                                className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};
