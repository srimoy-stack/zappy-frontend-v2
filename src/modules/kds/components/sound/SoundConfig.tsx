'use client';

import React from 'react';
import { Volume2, VolumeX, Bell, AlertTriangle, XCircle, RefreshCw, CheckCircle, ChevronLeft } from 'lucide-react';
import { useKDSSound, SoundEvent } from './useKDSSound';
import { useFilterStore } from '../../store/useFilterStore';
import { KDSPermissionGuard } from '../security/KDSPermissionGuard';

export const SoundConfig: React.FC = () => {
    const { settings, toggleMute, setVolume, toggleEvent, playSound } = useKDSSound();
    const setViewMode = useFilterStore(state => state.setViewMode);

    return (
        <div className="flex-1 flex flex-col bg-[#F3F4F6] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setViewMode('KANBAN')}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                    >
                        <ChevronLeft size={24} className="text-gray-900" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Audio Control Center</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mt-1">Configure kitchen alerts & notifications</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleMute}
                        className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 border-b-4 ${settings.isMuted
                            ? 'bg-red-500 text-white border-red-700'
                            : 'bg-white border-gray-200 text-gray-900'
                            }`}
                    >
                        {settings.isMuted ? 'Unmute All Alerts' : 'Mute All Alerts'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-12">
                <KDSPermissionGuard permission="KDS_SETTING_EDIT">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Volume Section */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Master Volume</h3>
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${settings.volume > 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {settings.volume > 0 ? <Volume2 size={32} /> : <VolumeX size={32} />}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-center text-sm font-black uppercase">
                                            <span className="text-gray-900">Output Level</span>
                                            <span className="text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{Math.round(settings.volume * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={settings.volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
                                <p className="text-sm font-bold text-emerald-800 leading-relaxed italic">
                                    "Consistent audio feedback helps the kitchen staff stay synchronized without needing to look at the screen constantly."
                                </p>
                            </div>
                        </div>

                        {/* Event Toggles Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Notification Rules</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {(
                                    [
                                        { id: 'NEW_ORDER', label: 'New Order Arrived', icon: Bell, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                        { id: 'ORDER_UPDATED', label: 'Order Items Modified', icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50' },
                                        { id: 'ORDER_CANCELLED', label: 'Order Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
                                        { id: 'ORDER_DELAYED', label: 'Ticket Delay Alert', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
                                        { id: 'SLA_WARNING', label: 'SLA Threshold Warning', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                                        { id: 'SLA_BREACH', label: 'SLA Violation Alert', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
                                        { id: 'BUMP_ORDER', label: 'Order Fulfilled Sound', icon: CheckCircle, color: 'text-teal-500', bg: 'bg-teal-50' }
                                    ] as { id: SoundEvent; label: string; icon: any; color: string; bg: string; }[]
                                ).map((evt) => (
                                    <div
                                        key={evt.id}
                                        className={`flex items-center justify-between p-4 bg-white rounded-2xl border-2 transition-all group ${settings.enabledEvents[evt.id] ? 'border-black' : 'border-gray-100 opacity-60'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${evt.bg} ${evt.color}`}>
                                                <evt.icon size={20} />
                                            </div>
                                            <span className={`text-sm font-black uppercase tracking-tight ${settings.enabledEvents[evt.id] ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {evt.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => playSound(evt.id)}
                                                className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all border border-gray-100"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleEvent(evt.id)}
                                                className={`transition-colors relative inline-flex h-6 w-11 items-center rounded-full ${settings.enabledEvents[evt.id] ? 'bg-black' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.enabledEvents[evt.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </KDSPermissionGuard>
            </div>
        </div>
    );
};
