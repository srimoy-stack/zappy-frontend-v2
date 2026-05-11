'use client';

import { useFilterStore } from '../store/useFilterStore';
import { useKDSStore, KDSState } from '../store/kdsStore';
import { useShallow } from 'zustand/react/shallow';
import { LayoutGrid, List, Maximize, Settings2, Package, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { StationConfigModal } from '@/modules/kds/components/modals/StationConfigModal';
import { HistoryModal } from './modals/HistoryModal';
import { History, Zap } from 'lucide-react';

export const KDSActionBar: React.FC = () => {
    const orders = useKDSStore(useShallow((state: KDSState) => Object.values(state.orders)));
    const { viewMode, setViewMode, showRecentlyFulfilled, setShowRecentlyFulfilled } = useFilterStore();
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const pendingSync = orders.filter(o => o.isPendingSync).length;

    return (
        <footer className="kds-action-bar">
            <div className="kds-action-group">
                <div className="kds-action-status">
                    <span className="kds-action-label">System Integrity</span>
                    <span className="kds-action-value uppercase">Harden v2.4</span>
                </div>
                {pendingSync > 0 && (
                    <div className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black rounded uppercase animate-pulse">
                        {pendingSync} Actions Pending Sync
                    </div>
                )}
                <button
                    onClick={() => setIsConfigOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all rounded-lg"
                >
                    <Settings2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Routing</span>
                </button>
                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all rounded-lg"
                >
                    <History size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                </button>
                <button
                    onClick={() => setShowRecentlyFulfilled(!showRecentlyFulfilled)}
                    className={`flex items-center gap-2 px-3 py-1.5 border transition-all rounded-lg ${showRecentlyFulfilled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                >
                    {showRecentlyFulfilled ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Strip</span>
                </button>
                <button
                    onClick={() => useKDSStore.getState().injectStressTestOrders(200)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all rounded-lg"
                >
                    <Zap size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Stress Test</span>
                </button>
            </div>

            <StationConfigModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
            />

            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />

            <div className="kds-action-group">
                <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('KANBAN')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'KANBAN' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <List size={14} />
                        Kanban
                    </button>
                    <button
                        onClick={() => setViewMode('GRID')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'GRID' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <LayoutGrid size={14} />
                        Grid 5x2
                    </button>
                    <button
                        onClick={() => setViewMode('COMPACT')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'COMPACT' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <Maximize size={14} />
                        Compact
                    </button>

                    <button
                        onClick={() => setViewMode('ALL_DAY')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ALL_DAY' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        <Package size={14} />
                        All-Day
                    </button>
                </div>
            </div>

            <div className="kds-action-group">
                <button
                    onClick={() => window.print()}
                    className="kds-header-btn border-slate-700 hover:border-[#1FA4A9] transition-colors"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest">Print All Tickets</span>
                </button>
                <div className="kds-action-status text-right">
                    <span className="kds-action-label">Connected Node</span>
                    <span className="kds-action-value">Z-MASTER-01</span>
                </div>
            </div>
        </footer>
    );
};
