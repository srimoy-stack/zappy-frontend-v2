import React, { useState } from 'react';
import { 
    RefreshCw, AlertTriangle, FileText, CheckCircle2, 
    ArrowRightLeft, Sparkles, AlertCircle, Database, HelpCircle 
} from 'lucide-react';
import { useCatalogStore } from '../../state/catalogStore';

export const RecoveryPanel: React.FC = () => {
    const { items, updateItem } = useCatalogStore();
    const [offlineBufferCount, setOfflineBufferCount] = useState<number>(3);
    const [collisionActive, setCollisionActive] = useState<boolean>(true);

    const handleClearOfflineBuffer = () => {
        setOfflineBufferCount(0);
        alert('Offline session cache flushed and localized databases sanitized!');
    };

    const handleResolveCollision = (itemId: string, choice: 'MASTER' | 'OVERRIDE') => {
        setCollisionActive(false);
        alert(`Concurrency conflict resolved! Accepted ${choice} values.`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Header */}
            <div>
                <div className="flex items-center gap-3.5 mb-1.5">
                    <div className="p-2.5 bg-slate-900 rounded-2xl shadow-md">
                        <RefreshCw className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Operational Recovery Hub</h2>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Recover connection sync targets, retry failed actions and resolve optimistic lock conflicts.</p>
            </div>

            {/* 2. Parallel state dashboards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Connection recovery card */}
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
                        Automatic Retry pipelines
                    </h3>
                    <div className="flex items-center gap-5 p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 animate-spin">
                            <RefreshCw className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest">Automatic connection retrying active</span>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1">Reconnection Attempt #3</h4>
                            <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Retrying integration API gateways in 32s...</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block">Offline session caches</span>
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white">
                            <div>
                                <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wide">Sync buffer backups</h5>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                                    {offlineBufferCount} draft versions cached in Local Storage
                                </p>
                            </div>
                            {offlineBufferCount > 0 ? (
                                <button 
                                    onClick={handleClearOfflineBuffer}
                                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-[8px] uppercase tracking-wider rounded-lg transition-all"
                                >
                                    Flush Cache
                                </button>
                            ) : (
                                <span className="text-[8px] font-black text-emerald-600 uppercase">Synchronized</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Optimistic Locking Conflict resolution panel */}
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
                        Optimistic Concurrency Collision Resolver
                    </h3>

                    {collisionActive && items[0] ? (
                        <div className="space-y-5">
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-3.5">
                                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h5 className="text-[10px] font-black text-rose-950 uppercase tracking-widest leading-none">Simultaneous Edit Collision</h5>
                                    <p className="text-[8.5px] text-rose-700 font-bold uppercase tracking-tight mt-1.5">
                                        Another brand admin has committed updates to version v{(items[0].versionMetadata?.version || 1)} of "{items[0].name}" since your edit session.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-slate-150 rounded-2xl space-y-3.5 relative overflow-hidden">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Option A</span>
                                    <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Brand Master Push</h6>
                                    <span className="font-mono text-xs font-black text-slate-900 mt-2 block">$14.99</span>
                                    <button 
                                        onClick={() => handleResolveCollision(items[0].id, 'MASTER')}
                                        className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white font-black text-[8px] uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        Accept Brand Master
                                    </button>
                                </div>

                                <div className="p-4 border border-slate-150 rounded-2xl space-y-3.5 relative overflow-hidden">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Option B</span>
                                    <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Your Local Draft</h6>
                                    <span className="font-mono text-xs font-black text-slate-900 mt-2 block">$15.50</span>
                                    <button 
                                        onClick={() => handleResolveCollision(items[0].id, 'OVERRIDE')}
                                        className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-black text-[8px] uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        Overwrite Master
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-14 text-center flex flex-col items-center">
                            <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-4" />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">No Collisions Encountered</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1.5">Your catalog updates are in complete sync with concurrent writers.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
