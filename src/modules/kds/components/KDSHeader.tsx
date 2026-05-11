'use client';

import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown, MapPin, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useKDSStore } from '../store/kdsStore';
import { useFilterStore } from '../store/useFilterStore';
import { useKDSAccessStore } from '../store/kdsAccessStore';
import { kdsToast, KDSToastContainer } from './toast/KDSToast';
import { onPrintError } from '../services/printService';
import { SoundController } from './sound/SoundController';
import { ConnectivityManager } from './connectivity/ConnectivityManager';

export const KDSHeader: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const clearAuth = useKDSAccessStore(state => state.clearAuth);

    const activeCount = useKDSStore((state) => Object.keys(state.orders).length);
    const completedCount = useKDSStore((state) => state.fulfilledOrders.length);
    const { kds_stations, selectedStationId, setSelectedStation } = useKDSStore();

    const {
        setIsSidebarOpen,
        fulfillment, setFulfillment,
        source, setSource
    } = useFilterStore();

    const [activeMenu, setActiveMenu] = useState<'STATION' | 'SOURCE' | 'TYPE' | null>(null);

    // Auto-close menu when clicking anywhere else
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        if (activeMenu) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [activeMenu]);

    const toggleMenu = (e: React.MouseEvent, menu: 'STATION' | 'SOURCE' | 'TYPE') => {
        e.stopPropagation(); // Prevent immediate auto-close
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    useEffect(() => {
        onPrintError((msg) => kdsToast.printError(msg));
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const currentStationName = selectedStationId === 'ALL'
        ? 'UNIVERSAL'
        : kds_stations.find(s => s.station_id === selectedStationId)?.station_name || 'UNKNOWN';

    const handleLogout = async () => {
        if (confirm('Are you sure you want to log out from KDS?')) {
            clearAuth(); // Clear KDS store state
            await signOut({ callbackUrl: '/login' });
        }
    };

    return (
        <>
            <SoundController />
            <ConnectivityManager />
            <KDSToastContainer />
            <header className="h-[64px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50 select-none">
                {/* LEFT: Sidebar Toggle & Primary Filters */}
                <div className="flex items-center gap-6 w-1/3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-3 -ml-2 hover:bg-gray-100 rounded-xl transition-all text-gray-900 active:scale-90"
                    >
                        <Menu size={26} />
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Station Selector */}
                        <div className="relative">
                            <button
                                onClick={(e) => toggleMenu(e, 'STATION')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95 ${activeMenu === 'STATION' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-black text-white hover:bg-gray-800'}`}
                            >
                                <MapPin size={14} className={activeMenu === 'STATION' ? 'text-white' : 'text-emerald-400'} />
                                {currentStationName}
                                <ChevronDown size={14} className={`opacity-50 transition-transform ${activeMenu === 'STATION' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeMenu === 'STATION' && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-2xl py-3 z-[100] w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 text-[9px] font-bold text-gray-400 uppercase border-b border-gray-50 mb-2">Display Nodes</div>
                                    <button
                                        onClick={() => setSelectedStation('ALL')}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold uppercase hover:bg-gray-50 transition-colors ${selectedStationId === 'ALL' ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-600'}`}
                                    >
                                        Universal View
                                    </button>
                                    {kds_stations.filter(s => s.active).map(s => (
                                        <button
                                            key={s.station_id}
                                            onClick={() => setSelectedStation(s.station_id)}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold uppercase hover:bg-gray-50 transition-colors ${selectedStationId === s.station_id ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-600'}`}
                                        >
                                            {s.station_name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Source Filter */}
                        <div className="relative">
                            <button
                                onClick={(e) => toggleMenu(e, 'SOURCE')}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95 ${activeMenu === 'SOURCE' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                            >
                                SRC: {source}
                                <ChevronDown size={14} className={`transition-transform ${activeMenu === 'SOURCE' ? 'rotate-180 text-white' : 'text-gray-400'}`} />
                            </button>
                            {activeMenu === 'SOURCE' && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-2xl py-3 z-[100] w-[160px] animate-in fade-in slide-in-from-top-2 duration-200">
                                    {(['ALL', 'ONLINE', 'POS', 'KIOSK', 'CALL_CENTER', 'UBER_DIRECT', 'API'] as const).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSource(s as any)}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold uppercase hover:bg-gray-50 transition-colors ${source === s ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600'}`}
                                        >
                                            {s.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fulfillment Filter */}
                        <div className="relative">
                            <button
                                onClick={(e) => toggleMenu(e, 'TYPE')}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95 ${activeMenu === 'TYPE' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                            >
                                TYPE: {fulfillment.replace('_', ' ')}
                                <ChevronDown size={14} className={`transition-transform ${activeMenu === 'TYPE' ? 'rotate-180 text-white' : 'text-gray-400'}`} />
                            </button>
                            {activeMenu === 'TYPE' && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-2xl py-3 z-[100] w-[210px] animate-in fade-in slide-in-from-top-2 duration-200">
                                    {(['ALL', 'DINE_IN', 'PICKUP', 'STORE_DELIVERY', 'UBER_DIRECT_DELIVERY'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFulfillment(f as any)}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold uppercase hover:bg-gray-50 transition-colors ${fulfillment === f ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600'}`}
                                        >
                                            {f.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CENTER: Status Indicators (Efficient Counters) */}
                <div className="flex items-center h-full gap-8">
                    <div className="flex flex-col items-center group cursor-pointer">
                        <span className="text-xs font-bold text-gray-900 leading-none">{activeCount}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 group-hover:text-black transition-colors">ACTIVE</span>
                        <div className="h-1 w-4 bg-black rounded-full mt-1 opacity-100" />
                    </div>
                    <div className="flex flex-col items-center group cursor-pointer opacity-40 hover:opacity-100 transition-all">
                        <span className="text-xs font-bold text-gray-900 leading-none">0</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">LATER</span>
                        <div className="h-1 w-4 bg-black rounded-full mt-1 opacity-0 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-col items-center group cursor-pointer opacity-40 hover:opacity-100 transition-all">
                        <span className="text-xs font-bold text-gray-900 leading-none">{completedCount}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">DONE</span>
                        <div className="h-1 w-4 bg-black rounded-full mt-1 opacity-0 group-hover:opacity-100" />
                    </div>
                </div>

                {/* RIGHT: Clock & Brand */}
                <div className="flex items-center justify-end w-1/3 gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[11px] font-bold text-gray-900 uppercase">{formatTime(currentTime)}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{formatDate(currentTime)}</span>
                    </div>

                    <div className="h-8 w-px bg-gray-100 ml-2" />

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 group"
                    >
                        <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Logout</span>
                    </button>
                </div>
            </header>
        </>
    );
};
