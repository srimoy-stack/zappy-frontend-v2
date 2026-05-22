import React from 'react';
import { 
    Package, Layers, Settings2, CloudLightning, 
    ShieldCheck, RefreshCw, Layers3, Activity, AlertCircle 
} from 'lucide-react';
import { useWorkspaceNavStore, WorkspacePanel } from '../../state/workspaceNavStore';
import { useCatalogStore } from '../../state/catalogStore';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';
import { cn } from '@/utils';

interface SidebarNavItem {
    id: WorkspacePanel;
    label: string;
    icon: any;
    badgeCount?: number;
    badgeColor?: string;
    category: 'INTELLIGENCE' | 'OPERATION' | 'GOVERNANCE';
}

export const WorkspaceSidebar: React.FC = () => {
    const { activePanel, setActivePanel } = useWorkspaceNavStore();
    const { items } = useCatalogStore();
    const { userType, isSuperAdmin } = useRouteAccess();

    const isAdmin = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN;

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
        // Category 1: Intelligence
        { id: 'ITEMS', label: 'Item Directory', icon: Package, category: 'INTELLIGENCE' },
        { id: 'POOLS', label: 'Modifier Pools', icon: Settings2, badgeCount: 4, badgeColor: 'bg-slate-100 text-slate-600', category: 'INTELLIGENCE' },
        { id: 'CATEGORIES', label: 'Taxonomies', icon: Layers, category: 'INTELLIGENCE' },
        
        // Category 2: Operation
        { id: 'PUBLISH', label: 'Publishing Center', icon: ShieldCheck, badgeCount: draftCount > 0 ? draftCount : undefined, badgeColor: 'bg-amber-100 text-amber-800 font-bold', category: 'OPERATION' },
        { id: 'SYNC', label: 'Channel Sync', icon: CloudLightning, badgeCount: failedSyncs > 0 ? failedSyncs : undefined, badgeColor: 'bg-rose-100 text-rose-700 font-black animate-pulse', category: 'OPERATION' },
        { id: 'OVERRIDES', label: 'Store Overrides', icon: Layers3, badgeCount: overrideCount > 0 ? overrideCount : undefined, badgeColor: 'bg-emerald-50 text-emerald-700', category: 'OPERATION' },
        { id: 'RECOVERY', label: 'Recovery Center', icon: RefreshCw, category: 'OPERATION' },
        
        // Category 3: Governance
        { id: 'AUDIT', label: 'Audit Timeline', icon: Activity, category: 'GOVERNANCE' }
    ];

    const renderNavGroup = (category: 'INTELLIGENCE' | 'OPERATION' | 'GOVERNANCE', title: string) => {
        const groupItems = navItems.filter(item => item.category === category);
        
        // Scoped Visibility locks
        if (category === 'OPERATION' && !isAdmin) return null;

        return (
            <div className="space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">{title}</span>
                <div className="space-y-1">
                    {groupItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activePanel === item.id;
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActivePanel(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 outline-none text-left",
                                    isActive 
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]" 
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-3.5">
                                    <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                                    <span>{item.label}</span>
                                </div>
                                {item.badgeCount !== undefined && (
                                    <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] tracking-normal font-mono", item.badgeColor || "bg-slate-100 text-slate-600")}>
                                        {item.badgeCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="w-80 flex-shrink-0 bg-white border border-slate-200/60 rounded-[2.5rem] p-6 space-y-9 shadow-sm h-fit">
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-6 px-2">
                <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                    <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider leading-none">Catalog Plane</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Enterprise Operations</p>
                </div>
            </div>

            {renderNavGroup('INTELLIGENCE', 'Catalog Intelligence')}
            {renderNavGroup('OPERATION', 'Operational Engine')}
            {renderNavGroup('GOVERNANCE', 'Governance & Logs')}

            {failedSyncs > 0 && isAdmin && (
                <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 mt-6 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[11px] font-black text-rose-900 uppercase tracking-wider leading-none">Gateway Sync Alarms</h4>
                        <p className="text-[9px] text-rose-600 font-bold uppercase tracking-tight mt-1 leading-normal">
                            {failedSyncs} items are currently failing to synchronize with aggregators.
                        </p>
                        <button 
                            onClick={() => setActivePanel('SYNC')}
                            className="mt-3.5 text-[9px] font-black uppercase text-rose-800 tracking-wider hover:underline"
                        >
                            Open Sync Monitor →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
