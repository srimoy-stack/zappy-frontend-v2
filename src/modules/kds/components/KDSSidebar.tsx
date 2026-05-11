'use client';

import React from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { useKDSStore } from '../store/kdsStore';
import {
    Settings2, History, Zap, Eye, EyeOff, X,
    Printer, LayoutGrid, List, Maximize, Package, Volume2, Monitor, LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useKDSAccessStore } from '../store/kdsAccessStore';
import { HistoryModal } from './modals/HistoryModal';

export const KDSSidebar: React.FC = () => {
    const clearAuth = useKDSAccessStore(state => state.clearAuth);
    const {
        isSidebarOpen, setIsSidebarOpen,
        viewMode, setViewMode,
        showRecentlyFulfilled, setShowRecentlyFulfilled
    } = useFilterStore();

    const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

    if (!isSidebarOpen) return null;

    const handleModeSwitch = (mode: any) => {
        setViewMode(mode);
        setIsSidebarOpen(false);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-300"
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar Shell */}
            <aside className="fixed left-0 top-0 bottom-0 w-[300px] bg-white border-r border-gray-200 z-[101] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">KDS Settings</h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">Global Controls</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* View Modes Section */}
                    <div className="space-y-3">
                        <span className="text-[9px] font-bold text-gray-400 uppercase ml-2">Layout Mode</span>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'KANBAN', label: 'Line View (Scroll)', icon: List },
                                { id: 'GRID', label: 'Grid 3xN', icon: LayoutGrid },
                                { id: 'COMPACT', label: 'Compact 4xN', icon: Maximize },
                                { id: 'ALL_DAY', label: 'All-Day View', icon: Package }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => handleModeSwitch(mode.id as any)}
                                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold text-sm ${viewMode === mode.id
                                        ? 'bg-black text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <mode.icon size={18} />
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="space-y-3">
                        <span className="text-[9px] font-bold text-gray-400 uppercase ml-2">System Configuration</span>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleModeSwitch('ROUTING')}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold text-sm ${viewMode === 'ROUTING' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Settings2 size={18} className={viewMode === 'ROUTING' ? 'text-white' : 'text-blue-500'} />
                                Station Routing
                            </button>
                            <button
                                onClick={() => handleModeSwitch('SOUND_SETTINGS')}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold text-sm ${viewMode === 'SOUND_SETTINGS' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Volume2 size={18} className={viewMode === 'SOUND_SETTINGS' ? 'text-white' : 'text-emerald-500'} />
                                Sound Alerts
                            </button>
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-100 transition-all font-bold text-sm text-gray-700"
                            >
                                <History size={18} className="text-purple-500" />
                                Order History
                            </button>
                            <button
                                onClick={() => setShowRecentlyFulfilled(!showRecentlyFulfilled)}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold text-sm ${showRecentlyFulfilled
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {showRecentlyFulfilled ? <Eye size={18} /> : <EyeOff size={18} />}
                                Completed Strip
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-100 transition-all font-bold text-sm text-gray-700"
                            >
                                <Printer size={18} className="text-gray-500" />
                                Print Screen
                            </button>
                            <button
                                onClick={() => window.open('/kds/status', '_blank', 'noopener,noreferrer')}
                                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-100 transition-all font-bold text-sm text-gray-700"
                            >
                                <Monitor size={18} className="text-orange-500" />
                                Customer Display
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone / Dev Tools */}
                    <div className="space-y-3 pt-4">
                        <span className="text-[9px] font-bold text-red-500 uppercase ml-2">Advanced</span>
                        <div className="space-y-2">
                            <button
                                onClick={() => useKDSStore.getState().injectStressTestOrders(50)}
                                className="flex items-center gap-3 w-full p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-sm uppercase"
                            >
                                <Zap size={18} />
                                Stress Test
                            </button>

                            <button
                                onClick={async () => {
                                    if (confirm('Log out from KDS?')) {
                                        clearAuth();
                                        await signOut({ callbackUrl: '/login' });
                                    }
                                }}
                                className="flex items-center gap-3 w-full p-3 rounded-xl bg-gray-50 text-gray-900 hover:bg-red-600 hover:text-white transition-all font-bold text-sm"
                            >
                                <LogOut size={18} className="text-red-600 group-hover:text-white" />
                                Logout Session
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Metrics */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Connected Node</span>
                        <span className="text-sm font-bold text-gray-900">Z-MASTER-01 Hardened v2.4</span>
                    </div>
                </div>
            </aside>

            {/* History Modal (Kept as Modal for quick reference) */}
            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </>
    );
};
