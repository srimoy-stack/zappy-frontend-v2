'use client';

import React, { useState } from 'react';
import {
    Package,
    Layers,
    Settings2,
    Plus,
    Search,
    Edit3,
    TrendingUp,
    Target,
    Filter,
    ArrowUpRight,
    Star,
    Flame
} from 'lucide-react';
import {
    Item,
    Category
} from '../types/items';
import { mockItems, mockCategories } from '../mock/items';
import { ItemEditScreen } from '../components/Items/ItemEditScreen';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { cn } from '@/utils';

type SubView = 'LIST' | 'CATEGORIES' | 'MODIFIERS' | 'EDIT';

export const ItemsPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<SubView>('LIST');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const { role } = useRouteAccess();

    const isAdmin = role === 'ADMIN' || role === 'PLATFORM_SUPER_ADMIN' || role === 'BRAND_ADMIN';

    const handleEditItem = (item: Item) => {
        setSelectedItem(item);
        setCurrentView('EDIT');
    };

    const handleCreateItem = () => {
        setSelectedItem(null);
        setCurrentView('EDIT');
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-24 px-4 pt-4">
            {/* 1. Header & Quick Strategy Stats */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-slate-900 rounded-lg">
                            <Target className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catalog Intelligence</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Menu engineering and architectural configuration for {mockItems.length} active SKUs.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Stars</span>
                            <div className="flex items-center gap-1.5 font-black text-slate-900">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                12 Items
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-200" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Index</span>
                            <div className="flex items-center gap-1.5 font-black text-emerald-600">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Stable
                            </div>
                        </div>
                    </div>

                    {isAdmin && currentView === 'LIST' && (
                        <button
                            onClick={handleCreateItem}
                            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 group"
                        >
                            <Plus size={16} strokeWidth={3} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
                            New Master Item
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Navigation & View Discovery */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit">
                    <button
                        onClick={() => setCurrentView('LIST')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            currentView === 'LIST' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"
                        )}
                    >
                        <Package size={14} />
                        Inventory List
                    </button>
                    <button
                        onClick={() => setCurrentView('CATEGORIES')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            currentView === 'CATEGORIES' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"
                        )}
                    >
                        <Layers size={14} />
                        Taxonomies
                    </button>
                    <button
                        onClick={() => setCurrentView('MODIFIERS')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            currentView === 'MODIFIERS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"
                        )}
                    >
                        <Settings2 size={14} />
                        Modifier Pools
                    </button>
                </div>

                {currentView === 'LIST' && (
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Scan SKU or Search..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-slate-900 transition-all font-bold w-64 outline-none"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* 3. Dynamic Discovery View Content */}
            <div className="min-h-[500px] animate-in slide-in-from-bottom-2 duration-500">
                {currentView === 'LIST' && (
                    <ItemListView onEdit={handleEditItem} items={mockItems} />
                )}
                {currentView === 'CATEGORIES' && (
                    <CategoryListView categories={mockCategories} />
                )}
                {currentView === 'MODIFIERS' && (
                    <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="p-4 bg-white rounded-2xl shadow-sm mb-6">
                            <Settings2 size={32} className="text-slate-200" strokeWidth={1.5} />
                        </div>
                        <p className="font-black uppercase tracking-[0.2em] text-xs text-slate-400">Global Pool Configuration</p>
                        <p className="mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-tight">Module deployment pending final release.</p>
                    </div>
                )}
                {currentView === 'EDIT' && (
                    <ItemEditScreen
                        item={selectedItem}
                        onClose={() => setCurrentView('LIST')}
                        categories={mockCategories}
                    />
                )}
            </div>
        </div>
    );
};

const ItemListView: React.FC<{ items: Item[], onEdit: (item: Item) => void }> = ({ items, onEdit }) => {
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Identity</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Engineering Badge</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Architectural Tier</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield Index</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {items.map((item, idx) => {
                        const allVariants = item.variantGroups.flatMap(vg => vg.variants);
                        const minPrice = allVariants.length > 0 ? Math.min(...allVariants.map(v => v.basePrice)) : 0;
                        const maxPrice = allVariants.length > 0 ? Math.max(...allVariants.map(v => v.basePrice)) : 0;

                        // Mock Engineering Logic
                        const isStar = idx % 4 === 0;
                        const isHot = item.name.toLowerCase().includes('pepperoni') || item.name.toLowerCase().includes('pizza');

                        return (
                            <tr
                                key={item.id}
                                className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                                onClick={() => onEdit(item)}
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[1.25rem] overflow-hidden border border-slate-100 flex-shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={24} className="text-slate-200" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-base font-black text-slate-900 tracking-tight mb-1 group-hover:text-emerald-600 transition-colors uppercase">{item.name}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight font-mono">ID: {item.id}</span>
                                                <div className="h-2 w-[1px] bg-slate-200" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    {mockCategories.find(c => c.id === item.categoryId)?.name || 'Default Tier'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {isStar ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 w-fit">
                                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Menu Star</span>
                                        </div>
                                    ) : isHot ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 w-fit">
                                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">High Volume</span>
                                        </div>
                                    ) : (
                                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-1">Standard Performer</div>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center">
                                                <Layers className="w-3 h-3 text-slate-500" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.variantGroups.length} Variant Pools</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center">
                                                <Settings2 className="w-3 h-3 text-slate-500" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.modifierGroups.length} Active Modifiers</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right tabular-nums">
                                    <div className="text-sm font-black text-slate-900 tracking-tight">
                                        ${minPrice.toFixed(2)} — ${maxPrice.toFixed(2)}
                                    </div>
                                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-bold text-emerald-600 uppercase">
                                        <TrendingUp size={10} />
                                        Profit: High
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all inline-block",
                                        item.isAvailable
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-slate-50 text-slate-300 border-slate-100"
                                    )}>
                                        {item.isAvailable ? 'Operational' : 'Disabled'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center justify-end">
                                        <div className="p-3 bg-white border border-slate-100 text-slate-300 group-hover:text-slate-900 group-hover:border-slate-900 rounded-2xl transition-all shadow-sm">
                                            <Edit3 size={18} />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const CategoryListView: React.FC<{ categories: Category[] }> = ({ categories }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
                <div key={cat.id} className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm hover:border-slate-900 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Layers size={80} className="text-slate-900" strokeWidth={1} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-slate-200 group-hover:scale-110 transition-transform">
                                <Layers size={24} className="text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Tier</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">{cat.name}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-tight line-clamp-2">
                            {cat.description || 'Architectural taxonomy node with no active documentation provided.'}
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Connected SKUs</span>
                            <span className="text-lg font-black text-slate-900 tracking-tighter">24 Items</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
