'use client';

// Dynamic Turbopack Incremental Cache Invalidation Node
import React from 'react';
import {
    Package, Layers, Settings2, Plus, Search, Edit3,
    TrendingUp, Target, Filter, ArrowUpRight, Star, Flame,
    Lock, Unlock, ShieldAlert, Sparkles, Eye, Trash2, Play, Copy, Archive,
    ChevronLeft, Boxes, Puzzle, X, Leaf
} from 'lucide-react';
import { VARIANT_TEMPLATES, MODIFIER_TEMPLATES, ADDON_TEMPLATES } from '../mock/templates';
import { useTemplateStore } from '../state/templateStore';
import { Item, Category } from '../types/items';
import { mockCategories } from '../mock/items';
import { ProductWizard } from '../components/Items/ProductWizard/ProductWizard';
import { ProductViewScreen } from '../components/Items/ProductViewScreen';
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
import { TemplateLibraryView } from '../components/Workspace/TemplateLibraryView';
import { CatalogTable } from '../components/CatalogTable/CatalogTable';
import { Scale } from 'lucide-react';
import { DietaryInfoPanel } from '../components/Workspace/DietaryInfoPanel';
import { CategoriesPanel } from '../components/Workspace/CategoriesPanel';

export const ItemsPage: React.FC = () => {
    const { items, selectItem, selectedItemId, createItem } = useCatalogStore();
    const { activePanel, setActivePanel, searchQuery, setSearchQuery, filterCategoryId, setFilterCategoryId } = useWorkspaceNavStore();
    const { pools, createPool } = useModifierPoolStore();
    const {
        variantTemplates, modifierTemplates, addonTemplates,
        addVariantTemplate, updateVariantTemplate, deleteVariantTemplate,
        addModifierTemplate, updateModifierTemplate, deleteModifierTemplate,
        addAddonTemplate, updateAddonTemplate, deleteAddonTemplate,
    } = useTemplateStore();
    const { userType, isSuperAdmin } = useRouteAccess();

    // Track whether the user opened a product in 'edit' or 'view' mode
    const [itemMode, setItemMode] = React.useState<'edit' | 'view' | null>(null);

    const isAdmin = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN;

    const selectedItem = selectedItemId === 'CREATE' ? null : (items.find(i => i.id === selectedItemId) || null);

    const handleEditItem = (item: Item) => {
        setItemMode('edit');
        selectItem(item.id);
        setActivePanel('ITEMS');
    };

    const handleViewItem = (item: Item) => {
        setItemMode('view');
        selectItem(item.id);
        setActivePanel('ITEMS');
    };

    const handleCloseItem = () => {
        setItemMode(null);
        selectItem(null);
    };

    const handleCreateItem = () => {
        setItemMode(null);
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
            {/* Main Content Area */}
            <div className="space-y-7 w-full">
                    {/* Horizontal Navigation Bar when in directory/list mode */}
                    {!selectedItemId && (
                        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto shadow-inner">
                            {([
                                { id: 'ITEMS', label: 'Products', icon: Package },
                                { id: 'VARIANT_GROUPS', label: 'Variant Groups', icon: Boxes },
                                { id: 'MODIFIER_GROUPS', label: 'Modifier Groups', icon: Settings2 },
                                { id: 'ADDON_GROUPS', label: 'Add-On Groups', icon: Puzzle },

                                // { id: 'POOLS', label: 'Pools', icon: Settings2 },
                                { id: 'RULES', label: 'Rules Library', icon: Scale },
                                // { id: 'PUBLISH', label: 'Publish', icon: ShieldAlert },
                                // { id: 'SYNC', label: 'Sync', icon: Sparkles },
                                { id: 'DIETARY', label: 'Dietary Info', icon: Leaf },
                                { id: 'CATEGORIES', label: 'Categories', icon: Layers },
                            ] as const).map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActivePanel(tab.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none flex-shrink-0",
                                            activePanel === tab.id
                                                ? "bg-slate-950 text-white shadow-md"
                                                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4", activePanel === tab.id ? "text-emerald-400" : "text-slate-400")} />
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
                                    onClose={handleCloseItem}
                                />
                            ) : selectedItemId && selectedItem && itemMode === 'view' ? (
                                <ProductViewScreen
                                    key={`view-${selectedItem.id}`}
                                    item={selectedItem}
                                    onClose={handleCloseItem}
                                    onEdit={handleEditItem}
                                />
                            ) : selectedItemId && selectedItem && itemMode === 'edit' ? (
                                <ProductWizard
                                    key={`edit-${selectedItem.id}`}
                                    editItem={selectedItem}
                                    onClose={handleCloseItem}
                                />
                            ) : (
                                <CatalogTable onEdit={handleEditItem} onView={handleViewItem} />
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
                                groups: t.groups.map(g => ({ name: g.name, items: g.variants.map(v => ({ name: v.name, detail: vgPriceDetail(v) })) })),
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
                            onEdit={(id, updates) => {
                                const existing = variantTemplates.find(t => t.id === id);
                                if (!existing) return;
                                updateVariantTemplate(id, {
                                    name: updates.name, emoji: updates.emoji, description: updates.description,
                                    groups: updates.groups.map((g, gi) => {
                                        const origGroup = existing.groups[gi];
                                        return {
                                            id: origGroup?.id || 'vg-' + Date.now() + '-' + gi,
                                            name: g.name,
                                            isRequired: origGroup?.isRequired ?? true,
                                            defaultVariantId: origGroup?.defaultVariantId || '',
                                            sortOrder: gi + 1,
                                            variants: g.items.map((item, vi) => {
                                                const origVariant = origGroup?.variants?.[vi];
                                                const priceStr = item.detail.replace(/[^0-9.\-]/g, '');
                                                const price = parseFloat(priceStr) || 0;
                                                return {
                                                    id: origVariant?.id || 'v-' + Date.now() + '-' + vi,
                                                    name: item.name,
                                                    basePrice: origVariant?.basePrice ?? price,
                                                    priceAdjustment: price,
                                                    isAvailable: origVariant?.isAvailable ?? true,
                                                };
                                            }),
                                        };
                                    }),
                                });
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
                            onEdit={(id, updates) => {
                                const existing = modifierTemplates.find(t => t.id === id);
                                if (!existing) return;
                                updateModifierTemplate(id, {
                                    name: updates.name, emoji: updates.emoji, description: updates.description,
                                    groups: updates.groups.map((g, gi) => {
                                        const origGroup = existing.groups[gi];
                                        return {
                                            id: origGroup?.id || 'mg-' + Date.now() + '-' + gi,
                                            name: g.name,
                                            isRequired: origGroup?.isRequired ?? false,
                                            minSelection: origGroup?.minSelection ?? 0,
                                            maxSelection: origGroup?.maxSelection ?? 10,
                                            isToppingGroup: origGroup?.isToppingGroup ?? false,
                                            isHalfAndHalfEnabled: origGroup?.isHalfAndHalfEnabled ?? false,
                                            isPremiumRuleEnabled: origGroup?.isPremiumRuleEnabled ?? false,
                                            options: g.items.map((item, oi) => {
                                                const origOpt = origGroup?.options?.[oi];
                                                const priceStr = item.detail.replace(/[^0-9.\-]/g, '').replace(/★/g, '');
                                                const price = parseFloat(priceStr) || 0;
                                                return {
                                                    id: origOpt?.id || 'opt-' + Date.now() + '-' + oi,
                                                    name: item.name,
                                                    price,
                                                    isPremium: origOpt?.isPremium ?? item.detail.includes('★'),
                                                    isTopping: origOpt?.isTopping ?? false,
                                                };
                                            }),
                                        };
                                    }),
                                });
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
                            onEdit={(id, updates) => {
                                updateAddonTemplate(id, {
                                    name: updates.name, emoji: updates.emoji, description: updates.description,
                                    items: (updates.groups[0]?.items || []).map(item => {
                                        const priceStr = item.detail.replace(/[^0-9.\-]/g, '');
                                        return {
                                            name: item.name,
                                            price: parseFloat(priceStr) || 0,
                                            included: false,
                                        };
                                    }),
                                });
                            }}
                        />
                    )}



                    {/* Modifier Pools Registry */}
                    {/* {activePanel === 'POOLS' && <ModifierPoolsPanel />} */}

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

                    {/* Dietary Info Tab Workspace */}
                    {activePanel === 'DIETARY' && <DietaryInfoPanel />}

                    {/* Categories Tab Workspace */}
                    {activePanel === 'CATEGORIES' && <CategoriesPanel />}
            </div>
        </div>
    );
};

const vgPriceDetail = (v: any) => {
    return v.priceAdjustment ? `+$${v.priceAdjustment.toFixed(2)}` : 'Base';
};

