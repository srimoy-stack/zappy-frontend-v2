import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    RefreshCcw, 
    Cpu, 
    Network, 
    Activity, 
    Wifi, 
    Globe, 
    CheckCircle, 
    Zap, 
    AlertTriangle,
    Bell,
    ChevronDown,
    SlidersHorizontal,
    Rocket
} from 'lucide-react';
import { cn } from '@/utils';
import { DashboardDateRangePicker } from './DashboardDateRangePicker';

interface DashboardHeaderProps {
    brandName: string;
    userName: string;
    storeCount: number;
    isLoading: boolean;
    onRefresh: () => void;
    onPublishMenu: () => void;
    onForceSync: () => void;
    onToggleRushMode: (active: boolean) => void;
    isRushMode: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    brandName,
    userName,
    storeCount,
    isLoading,
    onRefresh,
    onPublishMenu,
    onForceSync,
    onToggleRushMode,
    isRushMode,
}) => {
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    // Mock runtime statistics
    const runtimeStats = {
        latency: 18, // ms
        uptime: '99.98%',
        load: '38%',
        activeNodes: '12/12'
    };

    // Active Integrations Statuses
    const integrations = [
        { name: 'POS Server', status: 'online', type: 'core' },
        { name: 'Zomato', status: 'online', type: 'channel' },
        { name: 'Swiggy', status: 'online', type: 'channel' },
        { name: 'UberEats', status: 'degraded', type: 'channel' },
        { name: 'Stripe Gateway', status: 'online', type: 'payment' }
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl p-6 relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[100px] bg-indigo-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 z-10">
                {/* 1. Brand & User Identity */}
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-3.5 rounded-2xl shadow-lg ring-4 ring-white/5 transition-all duration-500",
                        isRushMode 
                            ? "bg-gradient-to-br from-rose-500 to-orange-500 animate-pulse shadow-rose-500/30"
                            : "bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-500 shadow-emerald-500/30"
                    )}>
                        <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                {brandName || 'Zyappy Brand'} Admin
                            </h1>
                            <div className={cn(
                                "text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5",
                                isRushMode 
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            )}>
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isRushMode ? "bg-rose-400 animate-ping" : "bg-emerald-400 animate-pulse"
                                )}></span>
                                {isRushMode ? 'Rush Mode Active' : 'Live Syncing'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-bold text-slate-400">
                                Operational Cockpit · Welcome back, <span className="text-slate-200">{userName || 'Executive'}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Runtime Statistics */}
                <div className="hidden xl:flex items-center gap-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sys Latency</p>
                            <p className="text-xs font-black text-slate-200">{runtimeStats.latency}ms</p>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-indigo-400" />
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Uptime</p>
                            <p className="text-xs font-black text-slate-200">{runtimeStats.uptime}</p>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Engine Load</p>
                            <p className="text-xs font-black text-slate-200">{runtimeStats.load}</p>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-teal-400" />
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</p>
                            <p className="text-xs font-black text-slate-200">{runtimeStats.activeNodes}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Action Center & Filter Presets */}
                <div className="flex items-center gap-3">
                    {/* Live Refresh */}
                    <button
                        onClick={onRefresh}
                        className="p-3 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 shadow-sm transition-all active:scale-95 group"
                        title="Force Refresh Data"
                    >
                        <RefreshCcw className={cn("w-5 h-5 group-hover:rotate-180 transition-transform duration-500", isLoading && "animate-spin")} />
                    </button>

                    {/* Date Picker */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/40">
                        <DashboardDateRangePicker onRangeChange={(range) => console.log('Selected timeframe:', range)} />
                    </div>

                    {/* Quick Actions Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsActionsOpen(!isActionsOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                        >
                            <span>Quick Actions</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {isActionsOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsActionsOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                onPublishMenu();
                                                setIsActionsOpen(false);
                                            }}
                                            className="w-full px-3 py-2 text-left rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-2"
                                        >
                                            <Globe className="w-3.5 h-3.5 text-emerald-400" />
                                            Publish Menus
                                        </button>
                                        <button
                                            onClick={() => {
                                                onForceSync();
                                                setIsActionsOpen(false);
                                            }}
                                            className="w-full px-3 py-2 text-left rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-2"
                                        >
                                            <RefreshCcw className="w-3.5 h-3.5 text-indigo-400" />
                                            Force POS Sync
                                        </button>
                                        <button
                                            onClick={() => {
                                                onToggleRushMode(!isRushMode);
                                                setIsActionsOpen(false);
                                            }}
                                            className="w-full px-3 py-2 text-left rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-2"
                                        >
                                            <AlertTriangle className={cn("w-3.5 h-3.5", isRushMode ? "text-slate-400" : "text-rose-400")} />
                                            {isRushMode ? 'Disable Rush Mode' : 'Enable Rush Mode'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Active Integration Sync Indicator Row */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5" /> Core Integrations Status
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        {integrations.map((integration) => (
                            <div 
                                key={integration.name}
                                className={cn(
                                    "px-3 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 transition-colors",
                                    integration.status === 'online'
                                        ? "bg-slate-950/40 text-emerald-400 border-emerald-500/20"
                                        : "bg-slate-950/40 text-amber-400 border-amber-500/20"
                                )}
                            >
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                    integration.status === 'online' ? "bg-emerald-400" : "bg-amber-400"
                                )}></span>
                                <span className="text-slate-300">{integration.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Operational Scope: <span className="text-indigo-400">{storeCount} Stores Active</span>
                </div>
            </div>
        </div>
    );
};
