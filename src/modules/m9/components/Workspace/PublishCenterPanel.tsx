import React, { useState } from 'react';
import { 
    ShieldCheck, Calendar, Clock, AlertTriangle, 
    ArrowRightLeft, FileDiff, Sparkles, Server, CheckCircle2,
    Store, HelpCircle, Layers, History
} from 'lucide-react';
import { useCatalogStore } from '../../state/catalogStore';
import { cn } from '@/utils';

type PublishScope = 'ALL_STORES' | 'SINGLE_STORE' | 'SELECTED_STORES';

export const PublishCenterPanel: React.FC = () => {
    const { items, publishDraft, rollbackToVersion, error, clearError, isLoading } = useCatalogStore();
    const [publishScope, setPublishScope] = useState<PublishScope>('ALL_STORES');
    const [selectedSingleStore, setSelectedSingleStore] = useState<string>('store-chicago');
    const [selectedMultipleStores, setSelectedMultipleStores] = useState<string[]>(['store-chicago', 'store-newyork']);
    const [targetDate, setTargetDate] = useState<string>('');
    const [targetTime, setTargetTime] = useState<string>('');

    const mockStores = [
        { id: 'store-chicago', name: 'Chicago Loop Outlet' },
        { id: 'store-newyork', name: 'Manhattan Broad Ave' },
        { id: 'store-miami', name: 'Miami Beach Plaza' }
    ];

    // Fetch items with active draft changes
    const draftItems = items.filter(item => 
        item.channelSyncs?.some(sync => sync.status === 'DRAFT')
    );

    const handleRelease = async (itemId: string) => {
        const success = await publishDraft(itemId);
        if (success) {
            alert('Draft released successfully and replication processes dispatched!');
        }
    };

    const handleToggleStoreSelection = (storeId: string) => {
        if (selectedMultipleStores.includes(storeId)) {
            setSelectedMultipleStores(selectedMultipleStores.filter(id => id !== storeId));
        } else {
            setSelectedMultipleStores([...selectedMultipleStores, storeId]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Header */}
            <div>
                <div className="flex items-center gap-3.5 mb-1.5">
                    <div className="p-2.5 bg-slate-900 rounded-2xl shadow-md">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Publishing Control Center</h2>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Deploy, schedule releases, and coordinate transactional rollbacks across outlets.</p>
            </div>

            {error && (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="text-[11px] font-black text-rose-950 uppercase tracking-widest leading-none">Deployment Validation Error</h4>
                        <p className="text-[10px] text-rose-700 font-bold uppercase tracking-tight mt-1.5">{error}</p>
                    </div>
                    <button onClick={clearError} className="text-[10px] font-black uppercase text-rose-600 hover:underline">Dismiss</button>
                </div>
            )}

            {/* 2. Unified Spacious Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Area: Staged releases Checklist (Takes 2 columns) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                            Pending Staged Releases Queue
                        </h3>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono font-bold">
                            {draftItems.length} Draft items
                        </span>
                    </div>

                    {draftItems.length === 0 ? (
                        <div className="py-14 text-center flex flex-col items-center">
                            <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-4" />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">All Active Catalogs Synced</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1.5">No modified draft revisions are pending deployment.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {draftItems.map(item => (
                                <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex items-center justify-between group">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                                            {item.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] text-slate-400 font-mono font-bold">ID: {item.id}</span>
                                            <div className="w-[1px] h-2 bg-slate-200" />
                                            <span className="text-[9px] text-slate-500 font-bold uppercase">Revision: v{(item.versionMetadata?.version || 1)}</span>
                                        </div>
                                    </div>
                                    <button 
                                        disabled={isLoading}
                                        onClick={() => handleRelease(item.id)}
                                        className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-300 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95"
                                    >
                                        Deploy Release
                                        <Server className="w-3.5 h-3.5 text-emerald-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Area: Deployment scheduler controls (Takes 1 column) */}
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
                        Deployment Scope Scheduler
                    </h3>

                    <div className="space-y-6">
                        {/* 1. Scope Target Options */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Scope Target Strategy</label>
                            <div className="flex flex-col gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                {([
                                    { id: 'ALL_STORES', label: 'All Stores' },
                                    { id: 'SINGLE_STORE', label: 'Single Store' },
                                    { id: 'SELECTED_STORES', label: 'Selected Stores' }
                                ] as const).map(option => (
                                    <button 
                                        key={option.id}
                                        onClick={() => setPublishScope(option.id)}
                                        className={cn(
                                            "w-full py-2.5 px-4 text-left text-[9.5px] font-black uppercase tracking-wider rounded-xl transition-all outline-none",
                                            publishScope === option.id 
                                                ? "bg-white text-slate-950 shadow-sm border border-slate-200/60 scale-[1.01]" 
                                                : "text-slate-500 hover:bg-white/40"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Conditional Store Target Selectors */}
                        {publishScope === 'SINGLE_STORE' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Select Target Outlet</label>
                                <select 
                                    value={selectedSingleStore}
                                    onChange={(e) => setSelectedSingleStore(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-slate-900 transition-all uppercase"
                                >
                                    {mockStores.map(store => (
                                        <option key={store.id} value={store.id}>{store.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {publishScope === 'SELECTED_STORES' && (
                            <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Select Outlets List</label>
                                <div className="space-y-2">
                                    {mockStores.map(store => {
                                        const isSelected = selectedMultipleStores.includes(store.id);
                                        return (
                                            <button
                                                key={store.id}
                                                onClick={() => handleToggleStoreSelection(store.id)}
                                                className={cn(
                                                    "w-full p-3 border rounded-xl text-left text-[10px] font-black uppercase flex items-center justify-between transition-all",
                                                    isSelected 
                                                        ? "border-emerald-500 bg-emerald-50/40 text-emerald-800" 
                                                        : "border-slate-150 hover:bg-slate-50 text-slate-600"
                                                )}
                                            >
                                                <span>{store.name}</span>
                                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 3. Date Time Pickers */}
                        <div className="space-y-3 pt-4 border-t border-slate-50">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Replication Schedule Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input 
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-mono font-bold outline-none focus:border-slate-900 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input 
                                        type="time"
                                        value={targetTime}
                                        onChange={(e) => setTargetTime(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-mono font-bold outline-none focus:border-slate-900 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={draftItems.length === 0}
                            className="w-full py-4.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black text-[9px] uppercase tracking-[0.18em] rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-98 flex items-center justify-center gap-2"
                        >
                            Schedule Staged Release
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Version rollbacks ledgers (Full-width wide space) */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <History className="w-4.5 h-4.5 text-slate-500" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                        Release Version Control Matrix
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Version Node</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Author / Deployer</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Release Date</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deployment Scope</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Recovery Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[10px] font-bold text-slate-700">
                            {items[0] && (
                                <>
                                    <tr>
                                        <td className="py-4.5 font-mono text-slate-900">Release v14 (Latest)</td>
                                        <td className="py-4.5 uppercase">Brand Admin</td>
                                        <td className="py-4.5 font-mono">Today, 00:48</td>
                                        <td className="py-4.5">
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[8.5px] uppercase tracking-wider font-mono">
                                                GLOBAL
                                            </span>
                                        </td>
                                        <td className="py-4.5 text-right">
                                            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-wider">
                                                CURRENT ACTIVE
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-all">
                                        <td className="py-4.5 font-mono text-slate-950">Release v13</td>
                                        <td className="py-4.5 uppercase text-slate-500">Brand Admin</td>
                                        <td className="py-4.5 font-mono text-slate-500">Yesterday, 14:22</td>
                                        <td className="py-4.5">
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[8.5px] uppercase tracking-wider font-mono">
                                                GLOBAL
                                            </span>
                                        </td>
                                        <td className="py-4.5 text-right">
                                            <button 
                                                onClick={() => rollbackToVersion(items[0].id, 13)}
                                                className="px-3.5 py-1.5 border border-purple-200 hover:border-purple-300 text-purple-700 hover:bg-purple-50 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ml-auto active:scale-95"
                                            >
                                                <FileDiff className="w-3 h-3" /> Rollback Release
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-all">
                                        <td className="py-4.5 font-mono text-slate-950">Release v12</td>
                                        <td className="py-4.5 uppercase text-slate-500">System Setup</td>
                                        <td className="py-4.5 font-mono text-slate-500">May 21, 17:58</td>
                                        <td className="py-4.5">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-550 rounded-lg text-[8.5px] uppercase tracking-wider font-mono">
                                                STORE SPECIFIC
                                            </span>
                                        </td>
                                        <td className="py-4.5 text-right">
                                            <button 
                                                onClick={() => rollbackToVersion(items[0].id, 12)}
                                                className="px-3.5 py-1.5 border border-purple-200 hover:border-purple-300 text-purple-700 hover:bg-purple-50 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ml-auto active:scale-95"
                                            >
                                                <FileDiff className="w-3 h-3" /> Rollback Release
                                            </button>
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
