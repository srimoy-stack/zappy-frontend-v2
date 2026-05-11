'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Settings2, Bell, AlertTriangle, Clock, XCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useKDSSound } from './useKDSSound';

export const SoundSettings: React.FC = () => {
    const { settings, toggleMute, setVolume, toggleEvent, playSound } = useKDSSound();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const enabledCount = Object.values(settings.enabledEvents).filter(Boolean).length;

    return (
        <div className="relative" ref={containerRef}>
            <button
                className={`kds-header-btn transition-all relative ${isOpen ? 'bg-slate-700' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Sound Settings"
            >
                {settings.isMuted || settings.volume === 0 ? (
                    <VolumeX size={28} className="text-red-400" />
                ) : (
                    <Volume2 size={28} className="text-[#1FA4A9]" />
                )}
                {isMounted && !settings.isMuted && enabledCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1FA4A9] rounded-full text-[10px] flex items-center justify-center font-black text-white shadow-lg">
                        {enabledCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                            <Settings2 size={14} />
                            Audio Configuration
                        </h3>
                        <button
                            onClick={toggleMute}
                            className={`text-[10px] font-black px-2 py-1 rounded transition-all ${settings.isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                        >
                            {settings.isMuted ? 'UNMUTE' : 'MUTE ALL'}
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Volume Control */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                <span>Master Volume</span>
                                <span className="text-[#1FA4A9]">{Math.round(settings.volume * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={settings.volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#1FA4A9] border border-slate-700"
                            />
                        </div>

                        {/* Event Toggles */}
                        <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase text-slate-500 mb-2">Event Alerts</div>

                            <ToggleItem
                                Icon={Bell}
                                label="New Orders"
                                active={settings.enabledEvents.NEW_ORDER}
                                onClick={() => toggleEvent('NEW_ORDER')}
                                onTest={() => playSound('NEW_ORDER')}
                                color="text-green-400"
                            />

                            <ToggleItem
                                Icon={RefreshCw}
                                label="Order Updates"
                                active={settings.enabledEvents.ORDER_UPDATED}
                                onClick={() => toggleEvent('ORDER_UPDATED')}
                                onTest={() => playSound('ORDER_UPDATED')}
                                color="text-[#1FA4A9]"
                            />

                            <ToggleItem
                                Icon={XCircle}
                                label="Cancellations"
                                active={settings.enabledEvents.ORDER_CANCELLED}
                                onClick={() => toggleEvent('ORDER_CANCELLED')}
                                onTest={() => playSound('ORDER_CANCELLED')}
                                color="text-red-400"
                            />

                            <ToggleItem
                                Icon={AlertTriangle}
                                label="Delayed"
                                active={settings.enabledEvents.ORDER_DELAYED}
                                onClick={() => toggleEvent('ORDER_DELAYED')}
                                onTest={() => playSound('ORDER_DELAYED')}
                                color="text-orange-400"
                            />

                            <ToggleItem
                                Icon={Clock}
                                label="SLA Breach"
                                active={settings.enabledEvents.SLA_BREACH}
                                onClick={() => toggleEvent('SLA_BREACH')}
                                onTest={() => playSound('SLA_BREACH')}
                                color="text-red-600"
                            />

                            <ToggleItem
                                Icon={AlertTriangle}
                                label="SLA Warning"
                                active={settings.enabledEvents.SLA_WARNING}
                                onClick={() => toggleEvent('SLA_WARNING')}
                                onTest={() => playSound('SLA_WARNING')}
                                color="text-yellow-500"
                            />

                            <ToggleItem
                                Icon={CheckCircle}
                                label="Ticket Bump"
                                active={settings.enabledEvents.BUMP_ORDER}
                                onClick={() => toggleEvent('BUMP_ORDER')}
                                onTest={() => playSound('BUMP_ORDER')}
                                color="text-blue-400"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                            Local Persistence Active
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

interface ToggleProps {
    Icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
    onTest: () => void;
    color: string;
}

const ToggleItem: React.FC<ToggleProps> = ({ Icon, label, active, onClick, onTest, color }) => (
    <div className="flex items-center gap-2">
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 ${active ? 'bg-slate-800 border border-slate-700' : 'bg-transparent border border-transparent opacity-40'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-slate-900 ${active ? color : 'text-slate-500'}`}>
                    <Icon size={14} />
                </div>
                <span className="text-[11px] font-black text-slate-200 tracking-tight">{label}</span>
            </div>
            <div className={`w-7 h-3.5 rounded-full relative transition-colors duration-200 ${active ? 'bg-[#1FA4A9]' : 'bg-slate-700'}`}>
                <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-200 ${active ? 'right-0.5' : 'left-0.5'}`} />
            </div>
        </button>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onTest();
            }}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
            title="Test Sound"
        >
            <Volume2 size={14} />
        </button>
    </div>
);
