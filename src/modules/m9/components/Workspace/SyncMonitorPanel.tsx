import React, { useState } from 'react';
import { 
    CloudLightning, RefreshCw, CheckCircle2, AlertTriangle, 
    Terminal, Clock, Eye, Sparkles, Filter 
} from 'lucide-react';
import { useCatalogStore } from '../../state/catalogStore';
import { cn } from '@/utils';

interface LogEntry {
    timestamp: string;
    itemId: string;
    itemName: string;
    channel: string;
    status: 'SUCCESS' | 'FAILED' | 'RETRY';
    payload: string;
}

export const SyncMonitorPanel: React.FC = () => {
    const { items, triggerChannelSync, syncQueue } = useCatalogStore();
    const [selectedChannelFilter, setSelectedChannelFilter] = useState<'ALL' | 'POS' | 'ONLINE' | 'UBEREATS'>('ALL');
    const [activeLog, setActiveLog] = useState<LogEntry | null>(null);

    // Mock payload feeds log list
    const mockLogs: LogEntry[] = [
        { 
            timestamp: new Date().toISOString(), 
            itemId: 'item-1', 
            itemName: 'Veggie Supreme Pizza', 
            channel: 'UBEREATS', 
            status: 'SUCCESS', 
            payload: '{"event": "CATALOG_REPLICATE", "sku": "VEG-SUP-12", "timestamp": "2026-05-23T00:52", "status": "200_OK"}' 
        },
        { 
            timestamp: new Date(Date.now() - 50000).toISOString(), 
            itemId: 'item-2', 
            itemName: 'Pepperoni Classic Pizza', 
            channel: 'POS', 
            status: 'SUCCESS', 
            payload: '{"event": "TERMINAL_PUSH", "sku": "PEP-CLS-14", "nodes": ["term-1", "term-2"], "status": "SYNCED"}' 
        },
        { 
            timestamp: new Date(Date.now() - 120000).toISOString(), 
            itemId: 'item-3', 
            itemName: 'Cheesy Garlic Bread', 
            channel: 'ONLINE', 
            status: 'FAILED', 
            payload: '{"event": "WEBHOOK_PUSH", "sku": "GAR-BRD-09", "error": "Gateway Timeout 504", "attempts": 3}' 
        }
    ];

    const channels = [
        { id: 'POS', label: 'Dine-In POS', speed: '240ms', uptime: '100.0%' },
        { id: 'ONLINE', label: 'Online Web Store', speed: '380ms', uptime: '99.9%' },
        { id: 'UBEREATS', label: 'UberEats Portal', speed: '1240ms', uptime: '98.8%' },
        { id: 'DOORDASH', label: 'DoorDash Gateway', speed: '1450ms', uptime: '98.5%' }
    ];

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'SYNCED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'QUEUED': return 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse';
            case 'FAILED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'DRAFT': default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3.5 mb-1.5">
                        <div className="p-2.5 bg-slate-900 rounded-2xl shadow-md">
                            <CloudLightning className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Sync & Channel Monitor</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Real-time synchronizations feeds and aggregator API gates.</p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button 
                        onClick={() => setSelectedChannelFilter('ALL')}
                        className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-200", selectedChannelFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 text-slate-600')}
                    >
                        All Portals
                    </button>
                    <button 
                        onClick={() => setSelectedChannelFilter('POS')}
                        className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-200", selectedChannelFilter === 'POS' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 text-slate-600')}
                    >
                        Dine-In POS
                    </button>
                </div>
            </div>

            {/* 2. Channel Performance Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {channels.map(ch => (
                    <div key={ch.id} className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                            <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest leading-none">{ch.label}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">latency</span>
                                <span className="text-xs font-mono font-black text-slate-800 mt-1 block">{ch.speed}</span>
                            </div>
                            <div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">availability</span>
                                <span className="text-xs font-mono font-black text-slate-800 mt-1 block">{ch.uptime}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Operational Active Items Sync Matrix */}
            <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
                    Active Catalog Synchronization Grid
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Product</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Dine-In POS</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Online Web</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">UberEats</th>
                                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Recovery</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[10px] font-bold text-slate-700">
                            {items.map(item => {
                                const posSync = item.channelSyncs?.find(c => c.channelId === 'POS');
                                const onlineSync = item.channelSyncs?.find(c => c.channelId === 'ONLINE') || { status: 'DRAFT' };
                                const ueSync = item.channelSyncs?.find(c => c.channelId === 'UBEREATS') || { status: 'DRAFT' };

                                const isSyncing = syncQueue.some(q => q.startsWith(item.id));

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="py-4.5 font-black text-slate-900 uppercase tracking-tight">{item.name}</td>
                                        <td className="py-4.5">
                                            <span className={cn("px-2.5 py-1 rounded-full text-[8px] uppercase tracking-wider font-mono border", getStatusColor(posSync?.status))}>
                                                {posSync?.status || 'DRAFT'}
                                            </span>
                                        </td>
                                        <td className="py-4.5">
                                            <span className={cn("px-2.5 py-1 rounded-full text-[8px] uppercase tracking-wider font-mono border", getStatusColor(onlineSync.status))}>
                                                {onlineSync.status}
                                            </span>
                                        </td>
                                        <td className="py-4.5">
                                            <span className={cn("px-2.5 py-1 rounded-full text-[8px] uppercase tracking-wider font-mono border", getStatusColor(ueSync.status))}>
                                                {ueSync.status}
                                            </span>
                                        </td>
                                        <td className="py-4.5 text-right">
                                            <button 
                                                disabled={isSyncing}
                                                onClick={() => triggerChannelSync(item.id, 'POS')}
                                                className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-950 disabled:bg-slate-50 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-black text-[8px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ml-auto"
                                            >
                                                <RefreshCw className={cn("w-2.5 h-2.5", isSyncing && "animate-spin")} />
                                                {isSyncing ? 'Syncing...' : 'Force Sync'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Sync Raw Logs & Payload Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Logs table */}
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
                        Integration Event Logger
                    </h3>
                    <div className="space-y-3.5">
                        {mockLogs.map((log, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setActiveLog(log)}
                                className={cn("p-4 border rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50/50", activeLog?.timestamp === log.timestamp ? 'border-slate-900 bg-slate-50/50' : 'border-slate-100 bg-white')}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-[9px] font-mono text-slate-400">00:52:12</span>
                                        <span className="text-[9px] font-black uppercase text-slate-900 tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-md">
                                            {log.channel}
                                        </span>
                                    </div>
                                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{log.itemName}</h5>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn("px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-mono", log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                                        {log.status}
                                    </span>
                                    <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-slate-900" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Console Log Inspector Panel */}
                <div className="bg-slate-950 p-7 rounded-[2.5rem] shadow-xl text-slate-100 font-mono space-y-5">
                    <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Gateway Payload Inspector</h4>
                    </div>

                    {activeLog ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-[9px] border-b border-slate-900 pb-3">
                                <div>
                                    <span className="text-slate-500 uppercase block">Event Timestamp</span>
                                    <span className="text-slate-300 block mt-0.5">{activeLog.timestamp}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 uppercase block">Port Gateway</span>
                                    <span className="text-slate-300 block mt-0.5">{activeLog.channel} API V2</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-500 uppercase block mb-2">Transmission JSON Block</span>
                                <pre className="bg-black/50 p-4 rounded-xl text-[9px] text-emerald-400 overflow-x-auto leading-relaxed border border-slate-900">
                                    {JSON.stringify(JSON.parse(activeLog.payload), null, 2)}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-[10px] text-slate-600 uppercase tracking-widest">
                            Select an Integration event to inspect the JSON payload
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
