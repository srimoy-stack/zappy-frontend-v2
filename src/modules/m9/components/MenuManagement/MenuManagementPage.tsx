'use client';

import React, { useMemo, useState } from 'react';
import {
    Plus, Search, Filter, LayoutGrid, List, RefreshCw, Play, Pause,
    Archive, Copy, Trash2, X, ChevronDown, Monitor, Globe, Truck,
    ChefHat, Settings2, Layers, Menu as MenuIcon, Zap, Shield
} from 'lucide-react';
import { useMenuStore } from '../../state/menuStore';
import { useCatalogStore } from '../../state/catalogStore';
import { useMenuBuilderStore } from '../../state/menuBuilderStore';
import { useMenuCreationStore } from '../../state/menuCreationStore';
import { MenuCard } from './MenuCard';
import { MenuBuilderWorkspace } from './MenuBuilderWorkspace';
import { MenuCreationWorkspace } from './MenuCreationWorkspace';
import type { Menu, MenuChannelType, MenuPublishStatus, MenuBulkAction } from '../../types/menu';
import { MENU_CHANNEL_LABELS } from '../../types/menu';
import { cn } from '@/utils';

// ─── Create Menu Modal ──────────────────────────────────────────────────────

const CHANNEL_OPTIONS: { type: MenuChannelType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: 'POS', label: 'POS Terminal', icon: <Monitor className="w-5 h-5" />, desc: 'In-store point of sale' },
    { type: 'ONLINE', label: 'Online Ordering', icon: <Globe className="w-5 h-5" />, desc: 'Website & app orders' },
    { type: 'UBER_EATS', label: 'Uber Eats', icon: <Truck className="w-5 h-5" />, desc: 'Uber Eats marketplace' },
    { type: 'DOORDASH', label: 'DoorDash', icon: <Truck className="w-5 h-5" />, desc: 'DoorDash marketplace' },
    { type: 'KIOSK', label: 'Self-Service Kiosk', icon: <Settings2 className="w-5 h-5" />, desc: 'Customer self-ordering' },
    { type: 'CATERING', label: 'Catering', icon: <ChefHat className="w-5 h-5" />, desc: 'Large orders & events' },
    { type: 'CUSTOM', label: 'Custom Channel', icon: <Layers className="w-5 h-5" />, desc: 'Custom integration' },
];

interface CreateMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Partial<Menu>) => void;
}

const CreateMenuModal: React.FC<CreateMenuModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [channel, setChannel] = useState<MenuChannelType>('POS');

    if (!isOpen) return null;

    const handleCreate = () => {
        if (!name.trim()) return;
        onCreate({ name: name.trim(), description: description.trim(), primaryChannel: channel });
        setName('');
        setDescription('');
        setChannel('POS');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-950 rounded-xl"><MenuIcon className="w-4 h-4 text-emerald-400" /></div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Create New Menu</h2>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Define a new presentation layer for your catalog</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="px-6 py-5 space-y-5">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Menu Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Weekend Brunch Menu" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-300 transition-all" autoFocus />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Description (Optional)</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this menu's purpose..." rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-slate-900 placeholder:text-slate-300 resize-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Primary Channel</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CHANNEL_OPTIONS.map(opt => (
                                <button key={opt.type} onClick={() => setChannel(opt.type)} className={cn(
                                    "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                                    channel === opt.type ? "border-slate-900 bg-slate-950 text-white shadow-lg" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                )}>
                                    <span className={channel === opt.type ? "text-emerald-400" : "text-slate-400"}>{opt.icon}</span>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider block leading-tight">{opt.label}</span>
                                        <span className={cn("text-[8px] font-bold block mt-0.5", channel === opt.type ? "text-slate-400" : "text-slate-400")}>{opt.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleCreate} disabled={!name.trim()} className={cn(
                        "px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                        name.trim() ? "bg-slate-950 text-white hover:bg-slate-900 shadow-lg" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}>
                        <Plus className="w-3.5 h-3.5" /> Create Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Status Filter Chips ─────────────────────────────────────────────────────

const STATUS_FILTERS: { value: string; label: string; dot?: string }[] = [
    { value: 'ALL', label: 'All Menus' },
    { value: 'PUBLISHED', label: 'Published', dot: 'bg-emerald-500' },
    { value: 'DRAFT', label: 'Drafts', dot: 'bg-amber-500' },
    { value: 'SCHEDULED', label: 'Scheduled', dot: 'bg-blue-500' },
    { value: 'ARCHIVED', label: 'Archived', dot: 'bg-slate-400' },
];

// ─── Main Page Component ─────────────────────────────────────────────────────

export const MenuManagementPage: React.FC = () => {
    const {
        menus, filters, selectedMenuIds,
        setFilters, resetFilters,
        createMenu, deleteMenu, duplicateMenu,
        publishMenu, unpublishMenu, archiveMenu, triggerSync,
        toggleMenuSelection, selectAllMenus, clearMenuSelection,
        executeBulkAction, selectMenu,
    } = useMenuStore();

    const { categories } = useCatalogStore();
    const { openBuilder, isOpen: isBuilderOpen } = useMenuBuilderStore();
    const { openWizard, isOpen: isWizardOpen } = useMenuCreationStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // ── Filtered + Searched Menus
    const filteredMenus = useMemo(() => {
        let results = [...menus];

        if (filters.status !== 'ALL') {
            results = results.filter(m => m.publishStatus === filters.status);
        }
        if (filters.channel !== 'ALL') {
            results = results.filter(m => m.primaryChannel === filters.channel);
        }
        if (filters.sync !== 'ALL') {
            results = results.filter(m => m.syncState === filters.sync);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            results = results.filter(m =>
                m.name.toLowerCase().includes(q) ||
                m.description?.toLowerCase().includes(q) ||
                m.id.toLowerCase().includes(q)
            );
        }

        return results.sort((a, b) => {
            if (a.isArchived !== b.isArchived) return a.isArchived ? 1 : -1;
            return new Date(b.versionMetadata.lastModifiedAt).getTime() - new Date(a.versionMetadata.lastModifiedAt).getTime();
        });
    }, [menus, filters]);

    const hasSelection = selectedMenuIds.size > 0;
    const allVisibleIds = filteredMenus.map(m => m.id);
    const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedMenuIds.has(id));

    // Counts by status
    const counts = useMemo(() => ({
        all: menus.length,
        published: menus.filter(m => m.publishStatus === 'PUBLISHED').length,
        draft: menus.filter(m => m.publishStatus === 'DRAFT').length,
        scheduled: menus.filter(m => m.publishStatus === 'SCHEDULED').length,
        archived: menus.filter(m => m.publishStatus === 'ARCHIVED').length,
    }), [menus]);

    const handleDelete = (id: string) => {
        const menu = menus.find(m => m.id === id);
        if (menu && confirm(`Permanently delete "${menu.name}"?`)) deleteMenu(id);
    };

    if (isWizardOpen) {
        return (
            <div className="max-w-[1700px] mx-auto space-y-6 pb-24 px-4 pt-4 animate-in fade-in duration-500">
                <MenuCreationWorkspace />
            </div>
        );
    }

    return (
        <div className="max-w-[1700px] mx-auto space-y-6 pb-24 px-4 pt-4 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-950 rounded-2xl shadow-lg">
                        <MenuIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-wider leading-none">Menu Management</h1>
                        <p className="text-[11px] text-slate-400 font-bold mt-1">
                            Presentation & publishing layer · {menus.length} menus configured
                        </p>
                    </div>
                </div>
                <button onClick={openWizard} className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" /> Create Menu
                </button>
            </div>

            {/* Operational Safety Banner */}
            <div className="bg-slate-950 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">Menu Publishing Safety Protocol</span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">
                        Menus are presentation layers only. Products, pricing, and catalog data remain in the master catalog.
                        Publishing a menu activates its channel visibility and store assignments without modifying source catalog records.
                    </p>
                </div>
            </div>

            {/* Status Filter Tabs + Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 shadow-inner overflow-x-auto">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilters({ status: f.value as any })}
                            className={cn(
                                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                filters.status === f.value
                                    ? "bg-slate-950 text-white shadow-md"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                            )}
                        >
                            {f.dot && <span className={cn("w-1.5 h-1.5 rounded-full", f.dot, filters.status === f.value && "opacity-80")} />}
                            {f.label}
                            <span className={cn("ml-1 text-[8px] font-mono", filters.status === f.value ? "text-emerald-400" : "text-slate-400")}>
                                {f.value === 'ALL' ? counts.all : f.value === 'PUBLISHED' ? counts.published : f.value === 'DRAFT' ? counts.draft : f.value === 'SCHEDULED' ? counts.scheduled : counts.archived}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* Channel Filter */}
                    <select
                        value={filters.channel}
                        onChange={e => setFilters({ channel: e.target.value as any })}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 outline-none focus:border-slate-900 cursor-pointer"
                    >
                        <option value="ALL">All Channels</option>
                        {Object.entries(MENU_CHANNEL_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={e => setFilters({ search: e.target.value })}
                            placeholder="Search menus..."
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 w-56 placeholder:text-slate-300 transition-all"
                        />
                        {filters.search && (
                            <button onClick={() => setFilters({ search: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded">
                                <X className="w-3 h-3 text-slate-400" />
                            </button>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5">
                        <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm" : "text-slate-400 hover:text-slate-700")}>
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white shadow-sm" : "text-slate-400 hover:text-slate-700")}>
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {hasSelection && (
                <div className="bg-slate-950 rounded-xl px-5 py-3 flex items-center justify-between animate-in slide-in-from-top-2 duration-200 shadow-xl">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedMenuIds.size} Selected</span>
                        <button onClick={clearMenuSelection} className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors">Clear</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => executeBulkAction('PUBLISH')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5">
                            <Play className="w-3 h-3" /> Publish
                        </button>
                        <button onClick={() => executeBulkAction('UNPUBLISH')} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5">
                            <Pause className="w-3 h-3" /> Unpublish
                        </button>
                        <button onClick={() => executeBulkAction('SYNC')} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3" /> Sync All
                        </button>
                        <button onClick={() => executeBulkAction('ARCHIVE')} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5">
                            <Archive className="w-3 h-3" /> Archive
                        </button>
                    </div>
                </div>
            )}

            {/* Select All / Results Count */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={allSelected} onChange={() => allSelected ? clearMenuSelection() : selectAllMenus(allVisibleIds)} className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select All</span>
                    </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {filteredMenus.length} of {menus.length} menus
                </span>
            </div>

            {/* Menu Grid/List */}
            {filteredMenus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <MenuIcon className="w-10 h-10 text-slate-200 mb-3" />
                    <span className="text-sm font-bold text-slate-700">No menus found</span>
                    <span className="text-xs text-slate-400 font-medium mt-1">
                        {filters.search || filters.status !== 'ALL' || filters.channel !== 'ALL'
                            ? 'Try adjusting your filters'
                            : 'Create your first menu to get started'}
                    </span>
                    {!filters.search && filters.status === 'ALL' && (
                        <button onClick={openWizard} className="mt-4 px-4 py-2 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create First Menu
                        </button>
                    )}
                </div>
            ) : (
                <div className={cn(
                    viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                        : "flex flex-col gap-3"
                )}>
                    {filteredMenus.map(menu => (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            isSelected={selectedMenuIds.has(menu.id)}
                            onSelect={toggleMenuSelection}
                            onPublish={publishMenu}
                            onUnpublish={unpublishMenu}
                            onArchive={archiveMenu}
                            onDuplicate={duplicateMenu}
                            onDelete={handleDelete}
                            onSync={triggerSync}
                            onView={id => openBuilder(id)}
                        />
                    ))}
                </div>
            )}

            {/* Create Menu Modal */}
            <CreateMenuModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={createMenu}
            />

            {/* Menu Builder Workspace Overlay */}
            <MenuBuilderWorkspace />
        </div>
    );
};
