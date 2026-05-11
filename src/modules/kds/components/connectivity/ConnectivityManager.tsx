'use client';

import React from 'react';
import { WifiOff, AlertCircle, Unplug } from 'lucide-react';
import { useKDSStore } from '../../store/kdsStore';
import { useKDSWebSocket } from '../../context/KDSWebSocketContext';

export const ConnectivityManager: React.FC = () => {
    const { isOnline } = useKDSStore();
    const { isConnected } = useKDSWebSocket();

    // ── Both network and WebSocket are healthy — nothing to show ───────────────
    if (isOnline && isConnected) return null;

    // ── Network offline (takes priority) ──────────────────────────────────────
    if (!isOnline) {
        return (
            <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300 z-[100] shadow-lg border-b border-red-500">
                <WifiOff size={20} className="animate-pulse" />
                <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-widest leading-none">Offline Mode Active</span>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">
                        Actions will be queued and synced automatically on reconnect
                    </span>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Connection</span>
                </div>
            </div>
        );
    }

    // ── Network online but WebSocket disconnected ─────────────────────────────
    return (
        <div className="bg-amber-500 text-white px-6 py-3 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300 z-[100] shadow-lg border-b border-amber-600">
            <Unplug size={20} className="animate-pulse" />
            <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-widest leading-none">Connecting to Kitchen Server…</span>
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">
                    Live updates will resume once the connection is established
                </span>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Reconnecting</span>
            </div>
        </div>
    );
};
