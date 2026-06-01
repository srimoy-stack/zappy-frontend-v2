'use client';

import React, { useEffect, useCallback } from 'react';
import {
    ArrowLeft, Save, Undo2, Redo2, Play, Eye, Monitor, Globe, Truck,
    Settings2, ChefHat, Layers, PanelLeftClose, PanelRightClose,
    Menu as MenuIcon, CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';
import { useMenuBuilderStore } from '../../state/menuBuilderStore';
import { useMenuStore } from '../../state/menuStore';
import { BuilderLeftSidebar } from './BuilderLeftSidebar';
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderRightSidebar } from './BuilderRightSidebar';
import type { MenuChannelType } from '../../types/menu';
import { MENU_CHANNEL_LABELS } from '../../types/menu';
import { cn } from '@/utils';

const PREVIEW_CHANNELS: { type: MenuChannelType; icon: React.ReactNode }[] = [
    { type: 'POS', icon: <Monitor className="w-3.5 h-3.5" /> },
    { type: 'ONLINE', icon: <Globe className="w-3.5 h-3.5" /> },
    { type: 'UBER_EATS', icon: <Truck className="w-3.5 h-3.5" /> },
    { type: 'DOORDASH', icon: <Truck className="w-3.5 h-3.5" /> },
    { type: 'KIOSK', icon: <Settings2 className="w-3.5 h-3.5" /> },
];

export const MenuBuilderWorkspace: React.FC = () => {
    const {
        isOpen, activeMenuId, isDirty, draftName, draftSections,
        previewChannel, setPreviewChannel,
        leftSidebarCollapsed, rightSidebarCollapsed,
        toggleLeftSidebar, toggleRightSidebar,
        undoStack, redoStack, undo, redo,
        saveDraft, closeBuilder, validatePublishReadiness, publishIssues,
        lastAutoSave,
    } = useMenuBuilderStore();

    const { publishMenu } = useMenuStore();
    const menu = useMenuStore.getState().menus.find(m => m.id === activeMenuId);

    // Autosave every 30 seconds
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            useMenuBuilderStore.getState().autoSave();
        }, 30000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
            if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveDraft(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, undo, redo, saveDraft]);

    const handlePublish = () => {
        const issues = validatePublishReadiness();
        const errors = issues.filter(i => i.severity === 'error');
        if (errors.length > 0) {
            alert(`Cannot publish:\n\n${errors.map(e => '• ' + e.message).join('\n')}`);
            return;
        }
        saveDraft();
        if (activeMenuId) {
            publishMenu(activeMenuId);
            alert('Menu published successfully!');
        }
    };

    if (!isOpen || !menu) return null;

    const productCount = Array.from(new Set(draftSections.flatMap(s => s.includedItemIds))).length;
    const sectionCount = draftSections.length;

    return (
        <div className="fixed inset-0 z-[80] bg-white flex flex-col animate-in fade-in duration-300">
            {/* ── Top Toolbar ─────────────────────────────────────────────── */}
            <div className="h-14 bg-slate-950 flex items-center px-4 gap-3 shrink-0">
                {/* Back button */}
                <button onClick={closeBuilder} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Back</span>
                </button>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                {/* Menu identity */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                        <MenuIcon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-black text-white uppercase tracking-wider truncate block leading-tight">{draftName}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{sectionCount} sections · {productCount} products</span>
                    </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 ml-3">
                    <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border",
                        menu.publishStatus === 'PUBLISHED' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        menu.publishStatus === 'DRAFT' ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                        "bg-slate-700 text-slate-400 border-slate-600"
                    )}>
                        {menu.publishStatus}
                    </span>
                    {isDirty && (
                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /> Unsaved
                        </span>
                    )}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Channel Preview Switcher */}
                <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
                    {PREVIEW_CHANNELS.map(ch => (
                        <button
                            key={ch.type}
                            onClick={() => setPreviewChannel(ch.type)}
                            title={MENU_CHANNEL_LABELS[ch.type]}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                previewChannel === ch.type ? "bg-emerald-500 text-white shadow-lg" : "text-slate-500 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {ch.icon}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                    <button onClick={undo} disabled={undoStack.length === 0} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button onClick={redo} disabled={redoStack.length === 0} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Shift+Z)">
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                {/* Sidebar toggles */}
                <button onClick={toggleLeftSidebar} className={cn("p-2 rounded-xl transition-all", leftSidebarCollapsed ? "text-slate-500 hover:text-white hover:bg-white/10" : "text-emerald-400 bg-white/10")} title="Toggle left sidebar">
                    <PanelLeftClose className="w-4 h-4" />
                </button>
                <button onClick={toggleRightSidebar} className={cn("p-2 rounded-xl transition-all", rightSidebarCollapsed ? "text-slate-500 hover:text-white hover:bg-white/10" : "text-emerald-400 bg-white/10")} title="Toggle right sidebar">
                    <PanelRightClose className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                {/* Save & Publish */}
                <button onClick={saveDraft} className="px-4 py-2 border border-slate-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button onClick={handlePublish} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" /> Publish
                </button>
            </div>

            {/* Autosave indicator */}
            {lastAutoSave && (
                <div className="h-6 bg-slate-100 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Auto-saved {new Date(lastAutoSave).toLocaleTimeString()}
                    </span>
                </div>
            )}

            {/* ── Three-Panel Layout ──────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                {!leftSidebarCollapsed && <BuilderLeftSidebar />}
                <BuilderCanvas />
                {!rightSidebarCollapsed && <BuilderRightSidebar />}
            </div>
        </div>
    );
};
