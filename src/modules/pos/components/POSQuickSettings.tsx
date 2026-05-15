'use client';

import React, { useState } from 'react';
import {
    X,
    Printer,
    Globe,
    Moon,
    Sun,
    Volume2,
    VolumeX,
    Check,
    Cpu,
    Wifi,
    HardDrive,
    RefreshCcw,
    Power
} from 'lucide-react';
import { cn } from '@/utils';

interface POSQuickSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const POSQuickSettings: React.FC<POSQuickSettingsProps> = ({ isOpen, onClose }) => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [theme, setTheme] = useState<'LIGHT' | 'DARK'>('LIGHT');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-brand/40 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[4rem] p-12 max-w-4xl w-full shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)] animate-in zoom-in-105 duration-500 border-[12px] border-white flex flex-col">
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-brand/5 border-2 border-brand/10 rounded-[2rem] flex items-center justify-center text-brand">
                            <SettingsIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-brand tracking-tighter uppercase leading-none mb-2">Systems Console</h2>
                            <p className="text-[10px] font-black text-brand/30 uppercase tracking-[0.4em] ml-1">Hardware Diagnostics & UI Preferences</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-16 h-16 bg-white border-4 border-slate-100 rounded-[2rem] flex items-center justify-center text-brand/20 hover:text-brand hover:border-brand/20 hover:shadow-2xl transition-all active:scale-75">
                        <X size={32} />
                    </button>
                </header>

                <div className="grid grid-cols-2 gap-12">
                    {/* LEFT: HARDWARE & DIAGNOSTICS */}
                    <div className="space-y-10">
                        <section>
                            <h4 className="text-[11px] font-black text-brand/20 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <Cpu size={14} /> Unit Status
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <Wifi size={16} className="text-emerald-500" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Cloud Sync</span>
                                    <span className="text-sm font-black text-emerald-700">Connected</span>
                                </div>
                                <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <HardDrive size={16} className="text-brand/40" />
                                    </div>
                                    <span className="text-[9px] font-black text-brand/40 uppercase tracking-widest leading-none">Local SQLite</span>
                                    <span className="text-sm font-black text-brand">142MB / 2GB</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-[11px] font-black text-brand/20 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <Printer size={14} /> Printer Nodes
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { name: 'POS-RECEIPT-USB', status: 'ONLINE', icon: Printer },
                                    { name: 'KITCHEN-LAN-EP01', status: 'ONLINE', icon: Printer },
                                    { name: 'BAR-WIFI-BP10', status: 'OFFLINE', icon: Printer },
                                ].map((p) => (
                                    <button key={p.name} className={cn(
                                        "w-full p-5 rounded-2xl border-2 flex items-center justify-between group transition-all",
                                        p.status === 'ONLINE' ? "bg-white border-slate-100 hover:border-brand/20" : "bg-rose-50 border-rose-100"
                                    )}>
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={cn("p-2 rounded-lg", p.status === 'ONLINE' ? "bg-brand/5 text-brand" : "bg-rose-500/10 text-rose-500")}>
                                                <p.icon size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-brand uppercase tracking-tight">{p.name}</span>
                                                <span className={cn("text-[9px] font-bold uppercase tracking-widest", p.status === 'ONLINE' ? "text-emerald-500" : "text-rose-500")}>{p.status}</span>
                                            </div>
                                        </div>
                                        {p.status === 'ONLINE' ? <div className="w-2 h-2 rounded-full bg-emerald-500" /> : <RefreshCcw size={14} className="text-rose-500 animate-spin-slow" />}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: UI PREFERENCES */}
                    <div className="space-y-10">
                        <section>
                            <h4 className="text-[11px] font-black text-brand/20 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <Globe size={14} /> Localization
                            </h4>
                            <div className="relative">
                                <select className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-6 text-sm font-black text-brand uppercase tracking-widest outline-none border-4 border-transparent focus:border-brand/10 appearance-none">
                                    <option>English • UAE Edition</option>
                                    <option>Arabic • UAE Edition</option>
                                    <option>Spanish • EU Edition</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand/20 pointer-events-none" />
                            </div>
                        </section>

                        <section>
                            <h4 className="text-[11px] font-black text-brand/20 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <Sun size={14} /> Appearance Mode
                            </h4>
                            <div className="flex bg-slate-50 p-2 rounded-[2rem] gap-2">
                                <button
                                    onClick={() => setTheme('LIGHT')}
                                    className={cn(
                                        "flex-1 py-4 rounded-[1.5rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                        theme === 'LIGHT' ? "bg-white shadow-xl text-brand" : "text-brand/20 hover:text-brand/40"
                                    )}
                                >
                                    <Sun size={16} /> Light
                                </button>
                                <button
                                    onClick={() => setTheme('DARK')}
                                    className={cn(
                                        "flex-1 py-4 rounded-[1.5rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                        theme === 'DARK' ? "bg-[#1A1C1E] shadow-xl text-white" : "text-brand/20 hover:text-brand/40"
                                    )}
                                >
                                    <Moon size={16} /> Dark
                                </button>
                            </div>
                        </section>

                        <section className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100/50">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-black text-brand uppercase tracking-tight">System Audio</h4>
                                    <p className="text-[10px] font-bold text-brand/30 uppercase tracking-widest">Feedback for scans and alerts</p>
                                </div>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={cn(
                                        "w-20 h-10 rounded-full relative p-1.5 transition-all duration-500 flex items-center",
                                        soundEnabled ? "bg-brand" : "bg-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-7 h-7 bg-white rounded-full shadow-lg transform transition-all duration-500 flex items-center justify-center text-brand",
                                        soundEnabled ? "translate-x-10 scale-110" : "translate-x-0"
                                    )}>
                                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                                    </div>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="mt-12 pt-10 border-t-4 border-slate-50 flex gap-6">
                    <button onClick={onClose} className="flex-1 py-7 bg-slate-50 text-brand/40 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                        <Power size={18} /> System Shutdown
                    </button>
                    <button onClick={onClose} className="flex-[2] py-7 bg-brand text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-brand/40 flex items-center justify-center gap-4 transform active:scale-95 transition-all">
                        Sync & Save Changes <Check size={20} strokeWidth={4} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const SettingsIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const ChevronDown = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);
