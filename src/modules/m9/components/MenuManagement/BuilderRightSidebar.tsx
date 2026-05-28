'use client';

import React from 'react';
import {
    Settings2, Eye, Clock, Store, Globe, Monitor, Truck, ChefHat, Layers,
    Calendar, Shield, AlertTriangle, CheckCircle2, Info, Hash, Tag
} from 'lucide-react';
import { useMenuBuilderStore } from '../../state/menuBuilderStore';
import { useMenuStore } from '../../state/menuStore';
import { useCatalogStore } from '../../state/catalogStore';
import type { MenuChannelType, SectionType } from '../../types/menu';
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

// ─── Collapsible Panel ───────────────────────────────────────────────────────

const Panel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = true }) => {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 last:border-b-0">
            <button onClick={() => setOpen(!open)} className="w-full px-4 py-3 flex items-center gap-2 hover:bg-slate-50/50 transition-colors">
                <span className="text-slate-400">{icon}</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex-1 text-left">{title}</span>
                <span className={cn("text-slate-400 transition-transform", open && "rotate-180")}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
            </button>
            {open && <div className="px-4 pb-3">{children}</div>}
        </div>
    );
};

// ─── Section Settings ────────────────────────────────────────────────────────

const SectionSettings: React.FC = () => {
    const { selectedSectionId, draftSections, updateSection } = useMenuBuilderStore();
    const { categories } = useCatalogStore();
    const section = draftSections.find(s => s.id === selectedSectionId);

    if (!section) return (
        <div className="px-4 py-6 text-center">
            <Layers className="w-6 h-6 text-slate-200 mx-auto mb-2" />
            <span className="text-[10px] text-slate-400 font-bold block">Select a section to configure</span>
        </div>
    );

    const cat = categories.find(c => c.id === section.catalogCategoryId);
    const sectionTypes: SectionType[] = ['STANDARD', 'FEATURED', 'PROMO', 'DYNAMIC', 'STORE_OVERRIDE'];

    return (
        <>
            <Panel title="Section Identity" icon={<Layers className="w-3 h-3" />}>
                <div className="space-y-3">
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Display Name</label>
                        <input
                            value={section.displayName || ''}
                            onChange={e => updateSection(section.id, { displayName: e.target.value })}
                            placeholder={cat?.name}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 placeholder:text-slate-300"
                        />
                    </div>
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                        <textarea
                            value={section.description || ''}
                            onChange={e => updateSection(section.id, { description: e.target.value })}
                            placeholder="Optional section description..."
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 outline-none focus:border-slate-900 placeholder:text-slate-300 resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Section Type</label>
                        <div className="flex flex-wrap gap-1">
                            {sectionTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => updateSection(section.id, { sectionType: type })}
                                    className={cn(
                                        "px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider border transition-all",
                                        section.sectionType === type ? "bg-slate-950 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className="text-[9px] font-bold text-slate-600">Linked Category</span>
                        <span className="text-[9px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{cat?.name || section.catalogCategoryId}</span>
                    </div>
                </div>
            </Panel>

            <Panel title="Visibility" icon={<Eye className="w-3 h-3" />}>
                <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[10px] font-bold text-slate-700">Section Visible</span>
                        <button
                            onClick={() => updateSection(section.id, { isVisible: !section.isVisible })}
                            className={cn("w-9 h-5 rounded-full transition-colors relative", section.isVisible ? "bg-emerald-500" : "bg-slate-300")}
                        >
                            <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform", section.isVisible ? "left-[18px]" : "left-0.5")} />
                        </button>
                    </label>
                    <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Stats</span>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-600">{section.includedItemIds.length} included</span>
                            <span className="text-[10px] font-bold text-slate-400">{section.excludedItemIds.length} hidden</span>
                            <span className="text-[10px] font-bold text-amber-600">{section.featuredItemIds.length} featured</span>
                        </div>
                    </div>
                </div>
            </Panel>
        </>
    );
};

// ─── Item Settings ───────────────────────────────────────────────────────────

const ItemSettings: React.FC = () => {
    const { selectedItemId, draftItemOverrides, setItemOverride, removeItemOverride } = useMenuBuilderStore();
    const { items } = useCatalogStore();

    if (!selectedItemId) return null;

    const item = items.find(i => i.id === selectedItemId);
    if (!item) return null;

    const override = draftItemOverrides.find(o => o.itemId === selectedItemId);

    return (
        <Panel title="Item Override" icon={<Tag className="w-3 h-3" />}>
            <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Catalog Source</span>
                    <span className="text-[10px] font-bold text-slate-800 block mt-0.5">{item.name}</span>
                    <span className="text-[8px] font-mono text-slate-400 block">${(item.baseProductPrice || 0).toFixed(2)} · {item.productType}</span>
                </div>
                <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Display Name Override</label>
                    <input
                        value={override?.displayNameOverride || ''}
                        onChange={e => setItemOverride(selectedItemId, { displayNameOverride: e.target.value || undefined })}
                        placeholder={item.name}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 placeholder:text-slate-300"
                    />
                </div>
                <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price Override</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={override?.priceOverride ?? ''}
                            onChange={e => setItemOverride(selectedItemId, { priceOverride: e.target.value ? parseFloat(e.target.value) : undefined })}
                            placeholder={(item.baseProductPrice || 0).toFixed(2)}
                            className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 placeholder:text-slate-300 font-mono"
                        />
                    </div>
                </div>
                {override && (
                    <button onClick={() => removeItemOverride(selectedItemId)} className="w-full py-2 text-[9px] font-black text-rose-600 uppercase tracking-wider hover:bg-rose-50 rounded-lg transition-colors border border-rose-200">
                        Clear All Overrides
                    </button>
                )}
            </div>
        </Panel>
    );
};

// ─── Channel Preview ─────────────────────────────────────────────────────────

const ChannelPreview: React.FC = () => {
    const { previewChannel, setPreviewChannel } = useMenuBuilderStore();
    const channels: MenuChannelType[] = ['POS', 'ONLINE', 'UBER_EATS', 'DOORDASH', 'KIOSK'];

    return (
        <Panel title="Channel Preview" icon={<Globe className="w-3 h-3" />}>
            <div className="space-y-1.5">
                {channels.map(ch => {
                    const colors = MENU_CHANNEL_COLORS[ch];
                    return (
                        <button
                            key={ch}
                            onClick={() => setPreviewChannel(ch)}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all",
                                previewChannel === ch ? "bg-slate-950 text-white border-slate-800" : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                            )}
                        >
                            <span className={previewChannel === ch ? "text-emerald-400" : colors.text}>{CHANNEL_ICONS[ch]}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider">{MENU_CHANNEL_LABELS[ch]}</span>
                        </button>
                    );
                })}
            </div>
        </Panel>
    );
};

// ─── Publish Readiness ───────────────────────────────────────────────────────

const PublishReadiness: React.FC = () => {
    const { validatePublishReadiness, publishIssues } = useMenuBuilderStore();

    return (
        <Panel title="Publish Readiness" icon={<Shield className="w-3 h-3" />} defaultOpen={false}>
            <div className="space-y-2">
                <button
                    onClick={() => validatePublishReadiness()}
                    className="w-full py-2 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
                >
                    Run Validation
                </button>
                {publishIssues.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                        {publishIssues.map((issue, i) => (
                            <div key={i} className={cn(
                                "flex items-start gap-2 px-3 py-2 rounded-lg text-[9px] font-bold",
                                issue.severity === 'error' ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                            )}>
                                {issue.severity === 'error' ? <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> : <Info className="w-3 h-3 shrink-0 mt-0.5" />}
                                <span>{issue.message}</span>
                            </div>
                        ))}
                    </div>
                )}
                {publishIssues.length === 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="text-[9px] font-bold text-emerald-700">Ready — run validation to check</span>
                    </div>
                )}
            </div>
        </Panel>
    );
};

// ─── Main Right Sidebar ─────────────────────────────────────────────────────

export const BuilderRightSidebar: React.FC = () => {
    const { activeMenuId } = useMenuBuilderStore();
    const menu = useMenuStore.getState().menus.find(m => m.id === activeMenuId);

    return (
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Runtime Settings</span>
                {menu && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-mono text-slate-400">{menu.id}</span>
                        <span className="text-[8px] font-bold text-slate-400">v{menu.versionMetadata.version}</span>
                    </div>
                )}
            </div>

            {/* Contextual Panels */}
            <SectionSettings />
            <ItemSettings />
            <ChannelPreview />
            <PublishReadiness />
        </div>
    );
};
