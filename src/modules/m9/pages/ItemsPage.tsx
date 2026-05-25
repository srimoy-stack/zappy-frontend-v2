'use client';

// Dynamic Turbopack Incremental Cache Invalidation Node
import React from 'react';
import {
    Package, Layers, Settings2, Plus, Search, Edit3,
    TrendingUp, Target, Filter, ArrowUpRight, Star, Flame,
    Lock, Unlock, ShieldAlert, Sparkles, Eye, Trash2, Play, Copy, Archive,
    ChevronLeft, Boxes, Puzzle, X
} from 'lucide-react';
import { VARIANT_TEMPLATES, MODIFIER_TEMPLATES, ADDON_TEMPLATES } from '../mock/templates';
import { useTemplateStore } from '../state/templateStore';
import { Item, Category } from '../types/items';
import { mockCategories } from '../mock/items';
import { ItemEditScreen } from '../components/Items/ItemEditScreen';
import { ProductWizard } from '../components/Items/ProductWizard/ProductWizard';
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
import { ModifierPoolsPanel } from '../components/Workspace/ModifierPoolsPanel';
import { RulesLibraryPanel } from '../components/Workspace/RulesLibraryPanel';
import { Scale } from 'lucide-react';

export const ItemsPage: React.FC = () => {
    const { items, selectItem, selectedItemId, createItem } = useCatalogStore();
    const { activePanel, setActivePanel, searchQuery, setSearchQuery, filterCategoryId, setFilterCategoryId } = useWorkspaceNavStore();
    const { pools, createPool } = useModifierPoolStore();
    const {
        variantTemplates, modifierTemplates, addonTemplates,
        addVariantTemplate, deleteVariantTemplate,
        addModifierTemplate, deleteModifierTemplate,
        addAddonTemplate, deleteAddonTemplate,
    } = useTemplateStore();
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
                {/* 1. Left Nav Panel - Always visible */}
                <WorkspaceSidebar />

                {/* 2. Central Operations Workspace area */}
                <div className="flex-1 min-w-0 space-y-7 w-full">
                    {/* Horizontal Navigation Bar when in directory/list mode */}
                    {!selectedItemId && (
                        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto shadow-inner">
                            {([
                                { id: 'ITEMS', label: 'Products', icon: Package },
                                { id: 'VARIANT_GROUPS', label: 'Variant Groups', icon: Boxes },
                                { id: 'MODIFIER_GROUPS', label: 'Modifier Groups', icon: Settings2 },
                                { id: 'ADDON_GROUPS', label: 'Add-On Groups', icon: Puzzle },

                                { id: 'POOLS', label: 'Pools', icon: Settings2 },
                                { id: 'RULES', label: 'Rules Library', icon: Scale },
                                { id: 'PUBLISH', label: 'Publish', icon: ShieldAlert },
                                { id: 'SYNC', label: 'Sync', icon: Sparkles },
                            ] as const).map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActivePanel(tab.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all outline-none flex-shrink-0",
                                            activePanel === tab.id
                                                ? "bg-slate-950 text-white shadow-md"
                                                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                        )}
                                    >
                                        <Icon className={cn("w-3.5 h-3.5", activePanel === tab.id ? "text-emerald-400" : "text-slate-400")} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Catalog Directory Tab Workspace */}
                    {activePanel === 'ITEMS' && (
                        <>
                            {selectedItemId === 'CREATE' ? (
                                <ProductWizard
                                    onClose={() => selectItem(null)}
                                />
                            ) : selectedItemId && selectedItem ? (
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

                    {/* Variant Groups Template Library */}
                    {activePanel === 'VARIANT_GROUPS' && (
                        <TemplateLibraryView
                            title="Variant Group Templates"
                            subtitle="Pre-built variant categories for quick product setup"
                            icon={<Boxes className="w-5 h-5 text-emerald-400" />}
                            templates={variantTemplates.map(t => ({
                                id: t.id, emoji: t.emoji, name: t.name, description: t.description,
                                groups: t.groups.map(g => ({ name: g.name, items: g.variants.map(v => ({ name: v.name, detail: v.priceAdjustment ? `+$${v.priceAdjustment.toFixed(2)}` : 'Base' })) })),
                            }))}
                            onCreateNew={(name, emoji, desc) => {
                                addVariantTemplate({
                                    id: 'vt-' + Date.now(),
                                    name, emoji, description: desc,
                                    groups: [{
                                        id: 'vg-' + Date.now(), name: 'Default Group', isRequired: true, defaultVariantId: '', sortOrder: 1,
                                        variants: [{ id: 'v-' + Date.now(), name: 'Standard', basePrice: 0, priceAdjustment: 0, isAvailable: true }],
                                    }],
                                });
                            }}
                            onDelete={(id) => { if (confirm('Delete this variant template?')) deleteVariantTemplate(id); }}
                            onDuplicate={(id) => {
                                const src = variantTemplates.find(t => t.id === id);
                                if (src) addVariantTemplate({ ...src, id: 'vt-' + Date.now(), name: src.name + ' (Copy)' });
                            }}
                        />
                    )}

                    {/* Modifier Groups Template Library */}
                    {activePanel === 'MODIFIER_GROUPS' && (
                        <TemplateLibraryView
                            title="Modifier Group Templates"
                            subtitle="Pre-built modifier categories — toppings, sauces, extras"
                            icon={<Settings2 className="w-5 h-5 text-emerald-400" />}
                            templates={modifierTemplates.map(t => ({
                                id: t.id, emoji: t.emoji, name: t.name, description: t.description,
                                groups: t.groups.map(g => ({ name: g.name, items: g.options.map(o => ({ name: o.name, detail: `$${o.price.toFixed(2)}${o.isPremium ? ' ★' : ''}` })) })),
                            }))}
                            onCreateNew={(name, emoji, desc) => {
                                addModifierTemplate({
                                    id: 'mt-' + Date.now(),
                                    name, emoji, description: desc,
                                    groups: [{
                                        id: 'mg-' + Date.now(), name: 'Default Group', isRequired: false, minSelection: 0, maxSelection: 10,
                                        isToppingGroup: false, isHalfAndHalfEnabled: false, isPremiumRuleEnabled: false,
                                        options: [],
                                    }],
                                });
                            }}
                            onDelete={(id) => { if (confirm('Delete this modifier template?')) deleteModifierTemplate(id); }}
                            onDuplicate={(id) => {
                                const src = modifierTemplates.find(t => t.id === id);
                                if (src) addModifierTemplate({ ...src, id: 'mt-' + Date.now(), name: src.name + ' (Copy)' });
                            }}
                        />
                    )}

                    {/* Add-On Groups Template Library */}
                    {activePanel === 'ADDON_GROUPS' && (
                        <TemplateLibraryView
                            title="Add-On Group Templates"
                            subtitle="Side items, drinks, and extras for combos and deals"
                            icon={<Puzzle className="w-5 h-5 text-emerald-400" />}
                            templates={addonTemplates.map(t => ({
                                id: t.id, emoji: t.emoji, name: t.name, description: t.description,
                                groups: [{ name: 'Items', items: t.items.map(i => ({ name: i.name, detail: `$${i.price.toFixed(2)}` })) }],
                            }))}
                            onCreateNew={(name, emoji, desc) => {
                                addAddonTemplate({
                                    id: 'at-' + Date.now(),
                                    name, emoji, description: desc,
                                    items: [],
                                });
                            }}
                            onDelete={(id) => { if (confirm('Delete this add-on template?')) deleteAddonTemplate(id); }}
                            onDuplicate={(id) => {
                                const src = addonTemplates.find(t => t.id === id);
                                if (src) addAddonTemplate({ ...src, id: 'at-' + Date.now(), name: src.name + ' (Copy)' });
                            }}
                        />
                    )}



                    {/* Modifier Pools Registry */}
                    {activePanel === 'POOLS' && <ModifierPoolsPanel />}

                    {/* Rules Library Panel */}
                    {activePanel === 'RULES' && <RulesLibraryPanel />}

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
                    { channelId: 'POS', status: 'DRAFT' },
                    { channelId: 'ONLINE', status: 'DRAFT' }
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
        const isLinkedToRecipe = item.taxRate !== undefined && (item.taxRate === 0 || item.taxRate > 5);

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

// ─── Template Library View ───────────────────────────────────

interface TemplateLibraryItem {
    id: string;
    emoji: string;
    name: string;
    description: string;
    groups: { name: string; items: { name: string; detail: string }[] }[];
}

const TemplateLibraryView: React.FC<{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    templates: TemplateLibraryItem[];
    onCreateNew: (name: string, emoji: string, description: string) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}> = ({ title, subtitle, icon, templates, onCreateNew, onDelete, onDuplicate }) => {
    const [expandedId, setExpandedId] = React.useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = React.useState(false);
    const [newName, setNewName] = React.useState('');
    const [newEmoji, setNewEmoji] = React.useState('📦');
    const [newDesc, setNewDesc] = React.useState('');

    const handleCreate = () => {
        if (!newName.trim()) return;
        onCreateNew(newName.trim(), newEmoji, newDesc.trim());
        setNewName('');
        setNewEmoji('📦');
        setNewDesc('');
        setShowCreateForm(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-slate-950 rounded-2xl shadow-sm">{icon}</div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{subtitle} • {templates.length} templates</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                        showCreateForm
                            ? "bg-white border border-slate-300 text-slate-600"
                            : "bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                    )}
                >
                    {showCreateForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5 text-emerald-400" /> Create New</>}
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">New Template</h4>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Emoji</label>
                            <input
                                value={newEmoji}
                                onChange={(e) => setNewEmoji(e.target.value)}
                                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-2xl text-center outline-none focus:border-slate-900 transition-all"
                                maxLength={4}
                            />
                        </div>
                        <div className="col-span-4">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Name *</label>
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Burger Sizes, Drink Extras..."
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                autoFocus
                            />
                        </div>
                        <div className="col-span-6">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                            <input
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Brief description of this template category"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={!newName.trim()}
                        className="mt-4 flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Template
                    </button>
                </div>
            )}

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map(tpl => {
                    const isExpanded = expandedId === tpl.id;
                    const totalItems = tpl.groups.reduce((s, g) => s + g.items.length, 0);

                    return (
                        <div
                            key={tpl.id}
                            className={cn(
                                "bg-white rounded-[2rem] border shadow-sm transition-all cursor-pointer group",
                                isExpanded
                                    ? "border-slate-900 shadow-lg col-span-1 md:col-span-2 lg:col-span-3"
                                    : "border-slate-200/60 hover:border-slate-400 hover:shadow-md"
                            )}
                        >
                            {/* Card Header */}
                            <div
                                className="p-6 flex items-start justify-between"
                                onClick={() => setExpandedId(isExpanded ? null : tpl.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{tpl.emoji}</span>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{tpl.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-relaxed">{tpl.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-mono font-bold">
                                        {tpl.groups.length} grp{tpl.groups.length !== 1 ? 's' : ''} • {totalItems} items
                                    </span>
                                    <div className={cn("p-1.5 rounded-lg transition-all", isExpanded ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100")}>
                                        <Eye className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-6 pb-6 border-t border-slate-100 pt-5 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tpl.groups.map((group, gi) => (
                                            <div key={gi} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                                                    {group.name}
                                                    <span className="font-mono text-slate-400 font-bold">{group.items.length}</span>
                                                </h5>
                                                <div className="space-y-1.5">
                                                    {group.items.map((item, ii) => (
                                                        <div key={ii} className="flex items-center justify-between py-1.5 px-2.5 bg-white rounded-lg border border-slate-100">
                                                            <span className="text-[10px] font-bold text-slate-700">{item.name}</span>
                                                            <span className="text-[9px] font-mono font-bold text-emerald-600">{item.detail}</span>
                                                        </div>
                                                    ))}
                                                    {group.items.length === 0 && (
                                                        <span className="text-[9px] text-slate-400 font-medium italic block py-2 text-center">No items yet — edit to add</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                                        {onDuplicate && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDuplicate(tpl.id); }}
                                                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-400 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all hover:bg-slate-50"
                                            >
                                                <Copy className="w-3 h-3" /> Duplicate
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(tpl.id); setExpandedId(null); }}
                                                className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ml-auto"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {templates.length === 0 && (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/60">
                    <Boxes className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">No templates yet</h4>
                    <p className="text-[10px] text-slate-300 font-medium mt-1">Click "Create New" to add your first template</p>
                </div>
            )}
        </div>
    );
};
