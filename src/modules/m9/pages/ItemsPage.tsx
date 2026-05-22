'use client';

// Dynamic Turbopack Incremental Cache Invalidation Node
import React from 'react';
import {
    Package, Layers, Settings2, Plus, Search, Edit3,
    TrendingUp, Target, Filter, ArrowUpRight, Star, Flame,
    Lock, Unlock, ShieldAlert, Sparkles, Eye, Trash2, Play, Copy, Archive
} from 'lucide-react';
import { Item, Category } from '../types/items';
import { mockCategories } from '../mock/items';
import { ItemEditScreen } from '../components/Items/ItemEditScreen';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';
import { cn } from '@/utils';

// Zustand stores
import { useCatalogStore } from '../state/catalogStore';
import { useWorkspaceNavStore } from '../state/workspaceNavStore';
import { useModifierPoolStore } from '../state/modifierPoolStore';

// Engines & Resolvers
import { PricingEngine } from '../engines/PricingEngine';
import { OverrideResolver } from '../engines/OverrideResolver';

// Workspace components
import { WorkspaceSidebar } from '../components/Workspace/WorkspaceSidebar';
import { WorkspaceRightPanel } from '../components/Workspace/WorkspaceRightPanel';
import { PublishCenterPanel } from '../components/Workspace/PublishCenterPanel';
import { SyncMonitorPanel } from '../components/Workspace/SyncMonitorPanel';
import { OverrideGridPanel } from '../components/Workspace/OverrideGridPanel';
import { RecoveryPanel } from '../components/Workspace/RecoveryPanel';
import { AuditTimelinePanel } from '../components/Workspace/AuditTimelinePanel';

export const ItemsPage: React.FC = () => {
    const { items, selectItem, selectedItemId, createItem } = useCatalogStore();
    const { activePanel, setActivePanel, searchQuery, setSearchQuery, filterCategoryId, setFilterCategoryId } = useWorkspaceNavStore();
    const { pools, createPool } = useModifierPoolStore();
    const { userType, isSuperAdmin } = useRouteAccess();

    const isAdmin = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN;

    const selectedItem = selectedItemId === 'CREATE' ? null : (items.find(i => i.id === selectedItemId) || null);

    const handleEditItem = (item: Item) => {
        selectItem(item.id);
        setActivePanel('ITEMS');
    };

    const handleCreateItem = () => {
        selectItem('CREATE');
        setActivePanel('ITEMS');
    };

    const filteredItems = items.filter(item => {
        if (filterCategoryId && item.categoryId !== filterCategoryId) {
            return false;
        }
        if (!searchQuery) return true;
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               item.id.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="max-w-[1700px] mx-auto space-y-7 pb-24 px-4 pt-4 animate-in fade-in duration-500">
            {/* Top Workspace Header Panel */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-100 pb-7">
                <div>
                    <div className="flex items-center gap-3.5 mb-1">
                        <div className="p-2.5 bg-slate-950 rounded-2xl shadow-sm">
                            <Target className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Catalog Operations Control</h1>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                        Enterprise menu engine, target overrides, replication pipelines, and recovery protocols.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-150">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Master SKUs</span>
                            <span className="text-sm font-black text-slate-900 mt-1">{items.length} Registered</span>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-200" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Active pools</span>
                            <span className="text-sm font-black text-slate-900 mt-1">{pools.length} Modifier Pools</span>
                        </div>
                    </div>

                    {isAdmin && activePanel === 'ITEMS' && !selectedItemId && (
                        <button
                            onClick={handleCreateItem}
                            className="flex items-center gap-2.5 px-6 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-900 transition-all active:scale-95 group"
                        >
                            <Plus size={14} strokeWidth={3} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
                            Create Product
                        </button>
                    )}
                </div>
            </div>

            {/* Core 3-Column Workspace Framework */}
            <div className="flex flex-col lg:flex-row items-start gap-7">
                {/* 1. Left Nav Panel - Only visible when composing / editing */}
                {selectedItemId && <WorkspaceSidebar />}

                {/* 2. Central Operations Workspace area */}
                <div className="flex-1 min-w-0 space-y-7 w-full">
                    {/* Spacious Horizontal Navigation Bar when in directory/list mode */}
                    {!selectedItemId && (
                        <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-[2rem] border border-slate-200/60 overflow-x-auto shadow-inner">
                            {([
                                { id: 'ITEMS', label: 'Item Directory' },
                                { id: 'CATEGORIES', label: 'Taxonomies' },
                                { id: 'POOLS', label: 'Modifier Pools' },
                                { id: 'PUBLISH', label: 'Publish Center' },
                                { id: 'SYNC', label: 'Channel Sync' },
                                { id: 'OVERRIDES', label: 'Store Overrides' },
                                { id: 'RECOVERY', label: 'Recovery Center' },
                                { id: 'AUDIT', label: 'Audit Timeline' }
                            ] as const).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActivePanel(tab.id)}
                                    className={cn(
                                        "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all outline-none flex-shrink-0",
                                        activePanel === tab.id
                                            ? "bg-slate-950 text-white shadow-md scale-[1.01]"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-white/30"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Catalog Directory Tab Workspace */}
                    {activePanel === 'ITEMS' && (
                        <>
                            {selectedItemId && selectedItem ? (
                                <ItemEditScreen
                                    item={selectedItem}
                                    onClose={() => selectItem(null)}
                                    categories={mockCategories}
                                />
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Master Product Directory</h3>
                                            {filterCategoryId && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-wider text-emerald-700">
                                                    Category: {mockCategories.find(c => c.id === filterCategoryId)?.name || 'Filtered'}
                                                    <button 
                                                        onClick={() => setFilterCategoryId(null)}
                                                        className="hover:text-emerald-950 font-bold ml-1 font-mono"
                                                    >
                                                        (Clear)
                                                    </button>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative">
                                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search master index..."
                                                    className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:border-slate-900 transition-all w-60 outline-none uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <ItemListView onEdit={handleEditItem} items={filteredItems} />
                                </div>
                            )}
                        </>
                    )}

                    {/* Taxonomies Grid Tab Workspace */}
                    {activePanel === 'CATEGORIES' && (
                        <CategoryListView categories={mockCategories} />
                    )}

                    {/* Reusable Modifier pools library Tab Workspace */}
                    {activePanel === 'POOLS' && (
                        <div className="space-y-7">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Modifier Pool Registry</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1.5">Manage global reusable option pools.</p>
                                </div>
                                <button 
                                    onClick={() => createPool({ name: 'New Option Pool' })}
                                    className="px-4 py-2 border border-slate-900 text-slate-950 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Add Modifier Pool
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pools.map(pool => (
                                    <div key={pool.id} className="bg-white p-7 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-5">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{pool.name}</h4>
                                                <span className="text-[8.5px] font-mono text-slate-400 block mt-0.5">ID: {pool.id}</span>
                                            </div>
                                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[8px] uppercase tracking-wider font-mono">
                                                {pool.options.length} Options
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {pool.options.slice(0, 3).map(opt => (
                                                <div key={opt.id} className="flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                                                    <span>{opt.name}</span>
                                                    <span className="font-mono text-slate-800">${opt.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            {pool.options.length > 3 && (
                                                <span className="text-[9px] text-slate-355 block pt-1 font-bold uppercase italic">
                                                    + {pool.options.length - 3} more options
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Publishing center Tab Workspace */}
                    {activePanel === 'PUBLISH' && <PublishCenterPanel />}

                    {/* Sync channel monitor Tab Workspace */}
                    {activePanel === 'SYNC' && <SyncMonitorPanel />}

                    {/* Store pricing overrides matrix Tab Workspace */}
                    {activePanel === 'OVERRIDES' && <OverrideGridPanel />}

                    {/* Operational Recovery Retries Tab Workspace */}
                    {activePanel === 'RECOVERY' && <RecoveryPanel />}

                    {/* Mutation Audit logs timeline Tab Workspace */}
                    {activePanel === 'AUDIT' && <AuditTimelinePanel />}
                </div>

                {/* 3. Right Context Panel - Only visible when composing / editing */}
                {selectedItemId && <WorkspaceRightPanel />}
            </div>
        </div>
    );
};

const ItemListView: React.FC<{ items: Item[], onEdit: (item: Item) => void }> = ({ items, onEdit }) => {
    const { deleteItem, createItem, updateItem } = useCatalogStore();

    const handleDuplicate = (e: React.MouseEvent, item: Item) => {
        e.stopPropagation();
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
        alert(`Successfully duplicated ${item.name} as a new draft product!`);
    };

    const handleArchive = (e: React.MouseEvent, item: Item) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to archive ${item.name}?\n\nThis will take the product offline across all channels.`)) {
            updateItem(item.id, {
                isAvailable: false,
                channelSyncs: [
                    { channelId: 'POS', status: 'ARCHIVED' },
                    { channelId: 'ONLINE', status: 'ARCHIVED' }
                ]
            });
            alert(`${item.name} successfully archived.`);
        }
    };

    const handleDelete = (e: React.MouseEvent, item: Item) => {
        e.stopPropagation();
        
        // Block delete if linked (Rule: Delete blocked when sales exist, linked with combo, recipe, or offers)
        // Simulated: item name or attributes representing linked references
        const isLinkedToCombo = item.productType === 'COMBO' || item.name.includes('Classic') || item.name.includes('Gourmet');
        const isLinkedToRecipe = item.taxRate === 0 || item.taxRate > 5;

        if (isLinkedToCombo || isLinkedToRecipe) {
            alert(`DELETE BLOCKED:\n\nThis item is currently connected to active Combo Slot elements or Linked Recipes. Please use the "Archive" action instead to safely retire this product.`);
            return;
        }

        if (confirm(`Are you sure you want to permanently delete ${item.name}?`)) {
            deleteItem(item.id);
            alert(`Product ${item.name} successfully deleted.`);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Identity</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lock Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Scope</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Portal Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield Index</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {items.map((item, idx) => {
                            const allVariants = item.variantGroups.flatMap(vg => vg.variants);
                            const minPrice = allVariants.length > 0 ? Math.min(...allVariants.map(v => v.basePrice)) : 0;
                            const maxPrice = allVariants.length > 0 ? Math.max(...allVariants.map(v => v.basePrice)) : 0;

                            const isStar = idx % 4 === 0;
                            const isHot = item.name.toLowerCase().includes('pepperoni') || item.name.toLowerCase().includes('pizza');

                            const activeSync = item.channelSyncs?.find(c => c.channelId === 'POS')?.status || 'SYNCED';

                            return (
                                <tr
                                    key={item.id}
                                    className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                                    onClick={() => onEdit(item)}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] overflow-hidden border border-slate-100 flex-shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={22} className="text-slate-200" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors uppercase">{item.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight font-mono">ID: {item.id}</span>
                                                    <div className="h-2 w-[1px] bg-slate-200" />
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        {item.productType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {item.storeOverridesResolver && item.storeOverridesResolver.length > 0 ? (
                                            <div className="flex items-center gap-1.5 text-amber-600 text-[9px] font-black uppercase tracking-wider">
                                                <Unlock className="w-3 h-3 text-amber-500" /> Overridden ({item.storeOverridesResolver.length} L)
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                                                <Lock className="w-3 h-3 text-slate-355" /> Inherited Locked
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                            {item.scopeConfig?.scope || 'GLOBAL'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider font-mono border",
                                            activeSync === 'SYNCED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            activeSync === 'FAILED' ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" :
                                            "bg-slate-50 text-slate-400 border-slate-150"
                                        )}>
                                            {activeSync}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right tabular-nums">
                                        <div className="text-xs font-black text-slate-900 tracking-tight">
                                            ${minPrice.toFixed(2)} — ${maxPrice.toFixed(2)}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 mt-1 text-[8.5px] font-bold text-emerald-600 uppercase">
                                            <TrendingUp size={10} />
                                            Yield: High
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all inline-block",
                                            item.isAvailable
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : "bg-slate-50 text-slate-300 border-slate-100"
                                        )}>
                                            {item.isAvailable ? 'Operational' : 'Disabled'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-1.5">
                                            {activeSync === 'DRAFT' ? (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm active:scale-95 border border-emerald-500/20"
                                                    title="Resume Draft"
                                                >
                                                    <Play size={10} className="fill-current text-white" /> Resume
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm active:scale-95"
                                                    title="Edit Product"
                                                >
                                                    <Edit3 size={10} className="text-white" /> Edit
                                                </button>
                                            )}

                                            <button
                                                onClick={() => onEdit(item)}
                                                className="p-2 border border-slate-200 hover:border-slate-450 hover:bg-slate-50 text-slate-650 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                                                title="View Product"
                                            >
                                                <Eye size={11} className="text-slate-500" />
                                            </button>

                                            <button
                                                onClick={(e) => handleDuplicate(e, item)}
                                                className="p-2 border border-slate-200 hover:border-slate-450 hover:bg-slate-50 text-slate-650 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                                                title="Duplicate Product"
                                            >
                                                <Copy size={11} className="text-slate-500" />
                                            </button>

                                            <button
                                                onClick={(e) => handleArchive(e, item)}
                                                className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-100 hover:border-amber-200 text-amber-700 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                                                title="Archive Product"
                                            >
                                                <Archive size={11} />
                                            </button>

                                            <button
                                                onClick={(e) => handleDelete(e, item)}
                                                className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CategoryListView: React.FC<{ categories: Category[] }> = ({ categories }) => {
    const { setFilterCategoryId, setActivePanel } = useWorkspaceNavStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {categories.map((cat) => (
                <div 
                    key={cat.id} 
                    onClick={() => {
                        setFilterCategoryId(cat.id);
                        setActivePanel('ITEMS');
                    }}
                    className="bg-white p-9 rounded-[3rem] border border-slate-200/60 shadow-sm hover:border-slate-950 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Layers size={80} className="text-slate-900" strokeWidth={1} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 bg-slate-950 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
                                <Layers size={20} className="text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black text-slate-355 uppercase tracking-widest">Active Tier</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">{cat.name}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-tight line-clamp-2">
                            {cat.description || 'Architectural taxonomy node with no active documentation provided.'}
                        </p>
                    </div>

                    <div className="mt-10 pt-7 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-355 uppercase tracking-widest">Connected SKUs</span>
                            <span className="text-base font-black text-slate-900 tracking-tighter">12 Items</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-slate-950 group-hover:text-white transition-all">
                            <ArrowUpRight size={18} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
