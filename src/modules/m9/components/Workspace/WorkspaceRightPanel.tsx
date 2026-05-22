import React from 'react';
import { 
    Clock, RefreshCw, CheckCircle2, AlertTriangle, 
    ArrowRight, Sparkles, Database, FileDiff 
} from 'lucide-react';
import { useWorkspaceNavStore } from '../../state/workspaceNavStore';
import { useCatalogStore } from '../../state/catalogStore';
import { cn } from '@/utils';

export const WorkspaceRightPanel: React.FC = () => {
    const { isRightPanelOpen, rightPanelContent, setActivePanel } = useWorkspaceNavStore();
    const { items, publishDraft, triggerChannelSync, rollbackToVersion } = useCatalogStore();

    if (!isRightPanelOpen || !rightPanelContent) return null;

    // Filter dynamic states
    const draftItems = items.filter(item => 
        item.channelSyncs?.some(sync => sync.status === 'DRAFT')
    );

    const failedItems = items.filter(item => 
        item.channelSyncs?.some(sync => sync.status === 'FAILED')
    );

    const handleDeployAll = async () => {
        for (const item of draftItems) {
            await publishDraft(item.id);
        }
    };

    return (
        <div className="w-80 flex-shrink-0 bg-white border border-slate-200/60 rounded-[2.5rem] p-6 space-y-7 shadow-sm h-fit">
            {/* Context A: Active Drafts Queue */}
            {rightPanelContent === 'DRAFTS' && (
                <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Drafts Pipeline</h4>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1">Pending publication overrides</p>
                    </div>

                    {draftItems.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-2.5" />
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">All Clean</span>
                            <p className="text-[8px] text-slate-300 font-bold uppercase tracking-tight mt-1">No drafts in buffer</p>
                        </div>
                    ) : (
                        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                            {draftItems.map(item => (
                                <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-wide truncate max-w-[140px]">{item.name}</h5>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                                            {item.productType} • v{item.versionMetadata?.version || 1}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => publishDraft(item.id)}
                                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                                    </button>
                                </div>
                            ))}

                            <button 
                                onClick={handleDeployAll}
                                className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-98"
                            >
                                Deploy All Drafts
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Context B: Sync Telemetry Monitoring */}
            {rightPanelContent === 'TELEMETRY' && (
                <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Sync Intelligence</h4>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1">Real-time gateway feeds</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Replication</span>
                            <span className="text-xl font-mono font-black text-slate-900 mt-1 block">99.8%</span>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                            <span className="text-[8px] font-black text-rose-400 uppercase tracking-wider block">Sync Alarms</span>
                            <span className="text-xl font-mono font-black text-rose-700 mt-1 block">{failedItems.length}</span>
                        </div>
                    </div>

                    {failedItems.length > 0 && (
                        <div className="space-y-3.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block">Failed Channels</span>
                            <div className="space-y-2.5">
                                {failedItems.map(item => (
                                    <div key={item.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <h6 className="text-[9px] font-black text-rose-950 uppercase tracking-wide truncate max-w-[160px]">{item.name}</h6>
                                            <p className="text-[8px] text-rose-600 font-bold uppercase tracking-tight mt-0.5">
                                                Sync Failure
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => triggerChannelSync(item.id, 'POS')}
                                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-all"
                                        >
                                            <RefreshCw className="w-3 h-3 animate-spin-hover" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Context C: Version Rollback Histories */}
            {rightPanelContent === 'HISTORY' && (
                <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-purple-500" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Database Releases</h4>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1">Rollback points & version logs</p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative border-l-2 border-slate-100 pl-4 space-y-6 ml-2.5">
                            <div className="relative">
                                <div className="absolute -left-[23px] top-0 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-50" />
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-950 uppercase tracking-wider">Release v14 (Active)</h5>
                                    <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-tight mt-0.5">Deployed 3 mins ago</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[23px] top-0 w-3 h-3 bg-slate-300 rounded-full ring-4 ring-slate-50" />
                                <div className="group">
                                    <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Release v13</h5>
                                    <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-tight mt-0.5">Deployed 2 hours ago</span>
                                    <button 
                                        onClick={() => items[0] && rollbackToVersion(items[0].id, 13)}
                                        className="mt-2 flex items-center gap-1 text-[8px] font-black uppercase text-purple-700 tracking-wider hover:underline"
                                    >
                                        <FileDiff className="w-2.5 h-2.5" /> Restore Draft
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[23px] top-0 w-3 h-3 bg-slate-300 rounded-full ring-4 ring-slate-50" />
                                <div className="group">
                                    <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Release v12</h5>
                                    <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-tight mt-0.5">Deployed Yesterday</span>
                                    <button 
                                        onClick={() => items[0] && rollbackToVersion(items[0].id, 12)}
                                        className="mt-2 flex items-center gap-1 text-[8px] font-black uppercase text-purple-700 tracking-wider hover:underline"
                                    >
                                        <FileDiff className="w-2.5 h-2.5" /> Restore Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
