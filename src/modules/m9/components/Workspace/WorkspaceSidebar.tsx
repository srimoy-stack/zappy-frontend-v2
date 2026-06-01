import React, { useState } from 'react';
import { 
    Package, Layers, Settings2, CloudLightning, 
    ShieldCheck, RefreshCw, Layers3, Activity, AlertCircle,
    Plus, ChevronDown, ChevronUp, Eye, Boxes, Puzzle
} from 'lucide-react';
import { useWorkspaceNavStore, WorkspacePanel } from '../../state/workspaceNavStore';
import { useCatalogStore } from '../../state/catalogStore';
import { useTemplateStore } from '../../state/templateStore';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';
import { cn } from '@/utils';

interface SidebarNavItem {
    id: WorkspacePanel;
    label: string;
    icon: any;
    badgeCount?: number;
    badgeColor?: string;
    category: 'CATALOG' | 'OPERATION' | 'GOVERNANCE';
}

export const WorkspaceSidebar: React.FC = () => {
    const { activePanel, setActivePanel } = useWorkspaceNavStore();
    const { items } = useCatalogStore();
    const { variantTemplates, modifierTemplates, addonTemplates } = useTemplateStore();
    const { userType, isSuperAdmin } = useRouteAccess();

    const isAdmin = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN;

    // Collapsible sections
    const [expandedSection, setExpandedSection] = useState<string | null>('variants');

    // Calculate active operational counters
    const draftCount = items.filter(item => 
        item.channelSyncs?.some(sync => sync.status === 'DRAFT')
    ).length;

    const failedSyncs = items.filter(item => 
        item.channelSyncs?.some(sync => sync.status === 'FAILED')
    ).length;

    const overrideCount = items.filter(item => 
        (item.storeOverridesResolver && item.storeOverridesResolver.length > 0) || 
        (item.storeOverrides && item.storeOverrides.length > 0)
    ).length;

    const navItems: SidebarNavItem[] = [
        // Catalog section
        { id: 'ITEMS', label: 'Products', icon: Package, category: 'CATALOG' },
        
        // Operation section
        { id: 'PUBLISH', label: 'Publishing', icon: ShieldCheck, badgeCount: draftCount > 0 ? draftCount : undefined, badgeColor: 'bg-amber-100 text-amber-800 font-bold', category: 'OPERATION' },
        { id: 'SYNC', label: 'Channel Sync', icon: CloudLightning, badgeCount: failedSyncs > 0 ? failedSyncs : undefined, badgeColor: 'bg-rose-100 text-rose-700 font-black animate-pulse', category: 'OPERATION' },
        { id: 'OVERRIDES', label: 'Store Overrides', icon: Layers3, badgeCount: overrideCount > 0 ? overrideCount : undefined, badgeColor: 'bg-emerald-50 text-emerald-700', category: 'OPERATION' },
        { id: 'RECOVERY', label: 'Recovery', icon: RefreshCw, category: 'OPERATION' },
        
        // Governance
        { id: 'AUDIT', label: 'Audit Log', icon: Activity, category: 'GOVERNANCE' },
    ];

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const renderNavButton = (item: SidebarNavItem) => {
        const Icon = item.icon;
        const isActive = activePanel === item.id;
        return (
            <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 outline-none text-left",
                    isActive 
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
            >
                <div className="flex items-center gap-3">
                    <Icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-400" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                </div>
                {item.badgeCount !== undefined && (
                    <span className={cn("px-2 py-0.5 rounded-full text-[8px] tracking-normal font-mono", item.badgeColor || "bg-slate-100 text-slate-600")}>
                        {item.badgeCount}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="w-72 flex-shrink-0 bg-white border border-slate-200/60 rounded-[2.5rem] p-5 space-y-6 shadow-sm h-fit">
            {/* Sidebar Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 px-1">
                <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                    <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-none">Catalog Plane</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Enterprise Operations</p>
                </div>
            </div>

            {/* Products & Categories */}
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-3 block mb-1.5">Products</span>
                {navItems.filter(n => n.category === 'CATALOG').map(renderNavButton)}
            </div>

            {/* ─── Template Libraries ────────────────────────── */}
            <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-3 block mb-1.5">Template Libraries</span>

                {/* Variant Groups */}
                <TemplateSidebarSection
                    title="Variant Groups"
                    icon={<Boxes className="w-3.5 h-3.5" />}
                    panelId="VARIANT_GROUPS"
                    isActive={activePanel === 'VARIANT_GROUPS'}
                    isExpanded={expandedSection === 'variants'}
                    onToggle={() => toggleSection('variants')}
                    onNavigate={() => setActivePanel('VARIANT_GROUPS')}
                    items={variantTemplates.map(t => ({ emoji: t.emoji, name: t.name, count: t.groups.reduce((s, g) => s + g.variants.length, 0) }))}
                    badgeCount={variantTemplates.length}
                />

                {/* Modifier Groups */}
                <TemplateSidebarSection
                    title="Modifier Groups"
                    icon={<Settings2 className="w-3.5 h-3.5" />}
                    panelId="MODIFIER_GROUPS"
                    isActive={activePanel === 'MODIFIER_GROUPS'}
                    isExpanded={expandedSection === 'modifiers'}
                    onToggle={() => toggleSection('modifiers')}
                    onNavigate={() => setActivePanel('MODIFIER_GROUPS')}
                    items={modifierTemplates.map(t => ({ emoji: t.emoji, name: t.name, count: t.groups.reduce((s, g) => s + g.options.length, 0) }))}
                    badgeCount={modifierTemplates.length}
                />

                {/* Add-On Groups */}
                <TemplateSidebarSection
                    title="Add-On Groups"
                    icon={<Puzzle className="w-3.5 h-3.5" />}
                    panelId="ADDON_GROUPS"
                    isActive={activePanel === 'ADDON_GROUPS'}
                    isExpanded={expandedSection === 'addons'}
                    onToggle={() => toggleSection('addons')}
                    onNavigate={() => setActivePanel('ADDON_GROUPS')}
                    items={addonTemplates.map(t => ({ emoji: t.emoji, name: t.name, count: t.items.length }))}
                    badgeCount={addonTemplates.length}
                />
            </div>

            {/* Operations */}
            {isAdmin && (
                <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-3 block mb-1.5">Operations</span>
                    {navItems.filter(n => n.category === 'OPERATION').map(renderNavButton)}
                </div>
            )}

            {/* Governance */}
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-3 block mb-1.5">Governance</span>
                {navItems.filter(n => n.category === 'GOVERNANCE').map(renderNavButton)}
            </div>

            {failedSyncs > 0 && isAdmin && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-wider leading-none">Sync Alarms</h4>
                        <p className="text-[9px] text-rose-600 font-bold uppercase tracking-tight mt-1 leading-normal">
                            {failedSyncs} items failing sync.
                        </p>
                        <button 
                            onClick={() => setActivePanel('SYNC')}
                            className="mt-2 text-[9px] font-black uppercase text-rose-800 tracking-wider hover:underline"
                        >
                            Open Monitor →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Template Sidebar Section ────────────────────────────────

interface TemplateSidebarSectionProps {
    title: string;
    icon: React.ReactNode;
    panelId: WorkspacePanel;
    isActive: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onNavigate: () => void;
    items: { emoji: string; name: string; count: number }[];
    badgeCount: number;
}

const TemplateSidebarSection: React.FC<TemplateSidebarSectionProps> = ({
    title, icon, panelId, isActive, isExpanded, onToggle, onNavigate, items, badgeCount
}) => (
    <div className={cn("rounded-xl border transition-all", isActive ? "border-slate-300 bg-slate-50/50" : "border-transparent")}>
        {/* Section Header */}
        <button
            onClick={() => { onNavigate(); onToggle(); }}
            className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all outline-none text-left",
                isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
        >
            <div className="flex items-center gap-3">
                <span className={cn(isActive ? "text-emerald-500" : "text-slate-400")}>{icon}</span>
                <span>{title}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-mono">{badgeCount}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
            </div>
        </button>

        {/* Expanded Items */}
        {isExpanded && (
            <div className="px-3 pb-3 space-y-1 animate-in slide-in-from-top-1 duration-150">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white text-left transition-all group cursor-default"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{item.emoji}</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">{item.name}</span>
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 font-bold">{item.count}</span>
                    </div>
                ))}
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate(); }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-200 hover:border-slate-400 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-wider transition-all hover:bg-white mt-1"
                >
                    <Plus className="w-3 h-3" /> Create New
                </button>
            </div>
        )}
    </div>
);
