'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    MoreHorizontal, Eye, Edit3, Copy, Archive, Trash2, Play, Pause,
    RefreshCw, Store, Clock, Layers, Package, CheckCircle2, AlertTriangle,
    Zap, Calendar, Lock, Globe, Monitor, Truck, ChefHat, Settings2
} from 'lucide-react';
import type { Menu, MenuChannelType } from '../../types/menu';
import { MENU_CHANNEL_LABELS, MENU_CHANNEL_COLORS } from '../../types/menu';
import { cn } from '@/utils';

const CHANNEL_ICONS: Record<MenuChannelType, React.ReactNode> = {
    POS: <Monitor className="w-3.5 h-3.5" />,
    ONLINE: <Globe className="w-3.5 h-3.5" />,
    UBER_EATS: <Truck className="w-3.5 h-3.5" />,
    DOORDASH: <Truck className="w-3.5 h-3.5" />,
    KIOSK: <Settings2 className="w-3.5 h-3.5" />,
    CATERING: <ChefHat className="w-3.5 h-3.5" />,
    CUSTOM: <Layers className="w-3.5 h-3.5" />,
};

const STATUS_CONFIG = {
    DRAFT: { label: 'Draft', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    PUBLISHED: { label: 'Published', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    SCHEDULED: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    ARCHIVED: { label: 'Archived', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};

const SYNC_CONFIG = {
    IDLE: { label: 'Idle', color: 'text-slate-400', icon: <Clock className="w-3 h-3" /> },
    SYNCING: { label: 'Syncing', color: 'text-blue-600', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
    SYNCED: { label: 'Synced', color: 'text-emerald-600', icon: <CheckCircle2 className="w-3 h-3" /> },
    FAILED: { label: 'Failed', color: 'text-rose-600', icon: <AlertTriangle className="w-3 h-3" /> },
    PARTIAL: { label: 'Partial', color: 'text-amber-600', icon: <AlertTriangle className="w-3 h-3" /> },
};

interface MenuCardProps {
    menu: Menu;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onPublish: (id: string) => void;
    onUnpublish: (id: string) => void;
    onArchive: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onSync: (id: string) => void;
    onView: (id: string) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    menu, isSelected, onSelect, onPublish, onUnpublish,
    onArchive, onDuplicate, onDelete, onSync, onView,
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const status = STATUS_CONFIG[menu.publishStatus];
    const sync = SYNC_CONFIG[menu.syncState];
    const chColors = MENU_CHANNEL_COLORS[menu.primaryChannel];
    const productCount = menu.productIds.length;
    const sectionCount = menu.sections.length;
    const storeLabel = menu.storeAssignment.scope === 'ALL_STORES'
        ? 'All Stores'
        : `${menu.storeAssignment.targetStoreIds.length} Stores`;
    const lastPublished = menu.versionMetadata.lastPublishedAt
        ? new Date(menu.versionMetadata.lastPublishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Never';

    return (
        <div className={cn(
            "group bg-white border rounded-2xl p-5 transition-all hover:shadow-lg hover:border-slate-300 relative",
            isSelected ? "border-emerald-400 ring-2 ring-emerald-100 shadow-md" : "border-slate-200/80 shadow-sm",
            menu.isArchived && "opacity-60"
        )}>
            {/* Top Row: Channel Icon + Name + Status */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(menu.id)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer mt-0.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className={cn("p-2.5 rounded-xl border shrink-0", chColors.bg, chColors.border)}>
                        <span className={chColors.text}>{CHANNEL_ICONS[menu.primaryChannel]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-slate-900 truncate leading-tight">{menu.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            {MENU_CHANNEL_LABELS[menu.primaryChannel]}
                            {menu.isDefault && <span className="ml-1.5 text-emerald-600">• DEFAULT</span>}
                            {menu.isLocked && <Lock className="w-3 h-3 inline ml-1 text-slate-400" />}
                        </p>
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="relative shrink-0" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 animate-in fade-in duration-100">
                            <button onClick={() => { setShowMenu(false); onView(menu.id); }} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Eye className="w-3.5 h-3.5 text-slate-400" /> View Details
                            </button>
                            {menu.publishStatus === 'DRAFT' && (
                                <button onClick={() => { setShowMenu(false); onPublish(menu.id); }} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 hover:bg-emerald-50 flex items-center gap-2">
                                    <Play className="w-3.5 h-3.5 text-emerald-500" /> Publish
                                </button>
                            )}
                            {menu.publishStatus === 'PUBLISHED' && (
                                <>
                                    <button onClick={() => { setShowMenu(false); onUnpublish(menu.id); }} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                                        <Pause className="w-3.5 h-3.5 text-amber-500" /> Unpublish
                                    </button>
                                    <button onClick={() => { setShowMenu(false); onSync(menu.id); }} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-50 flex items-center gap-2">
                                        <RefreshCw className="w-3.5 h-3.5 text-blue-500" /> Re-Sync
                                    </button>
                                </>
                            )}
                            <button onClick={() => { setShowMenu(false); onDuplicate(menu.id); }} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                            </button>
                            {!menu.isArchived && (
                                <button onClick={() => { setShowMenu(false); onArchive(menu.id); }} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                                    <Archive className="w-3.5 h-3.5 text-amber-500" /> Archive
                                </button>
                            )}
                            <div className="h-px bg-slate-100 my-1" />
                            <button onClick={() => { setShowMenu(false); onDelete(menu.id); }} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            {menu.description && (
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2 pl-[52px]">
                    {menu.description}
                </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Products</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">{productCount}</span>
                </div>
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Sections</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">{sectionCount}</span>
                </div>
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Stores</span>
                    <span className="text-[10px] font-black text-slate-900 block mt-1">{storeLabel}</span>
                </div>
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Version</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">v{menu.versionMetadata.version}</span>
                </div>
            </div>

            {/* Footer: Status + Sync + Schedule */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border", status.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                        {status.label}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider", sync.color)}>
                        {sync.icon} {sync.label}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                    <Calendar className="w-3 h-3" />
                    {menu.schedule.isAlwaysActive ? 'Always Active' : 'Scheduled'}
                    <span className="mx-1">·</span>
                    <span className="text-slate-500">{lastPublished}</span>
                </div>
            </div>
        </div>
    );
};
