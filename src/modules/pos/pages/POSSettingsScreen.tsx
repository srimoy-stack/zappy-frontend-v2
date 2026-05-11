'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Printer,
    Globe,
    Palette,
    Volume2,
    ArrowLeft,
    Wifi,
    Database,
    ShieldCheck,
    Monitor,
    Smartphone,
    Save,
    RotateCcw
} from 'lucide-react';

export const POSSettingsScreen: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'HARDWARE' | 'SYSTEM' | 'UI'>('HARDWARE');

    return (
        <div className="flex h-screen bg-white text-brand font-sans overflow-hidden">
            {/* LEFT: SETTINGS CATEGORIES (Section 17) */}
            <aside className="w-80 md:w-96 bg-brand/5 border-r border-brand/10 flex flex-col flex-shrink-0 animate-in slide-in-from-left duration-500">
                <header className="p-8 border-b border-brand/10 bg-white flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 border border-brand/10 rounded-lg text-brand/40 hover:text-brand">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-xl font-black text-brand tracking-tight">System Config</h3>
                </header>
                <div className="p-6 space-y-3">
                    <button
                        onClick={() => setActiveTab('HARDWARE')}
                        className={`w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all border-4 ${activeTab === 'HARDWARE' ? 'bg-brand border-brand text-white shadow-xl shadow-brand/20' : 'bg-white border-brand/5 text-brand/40 hover:border-brand/20'}`}
                    >
                        <Printer size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[.2em]">Hardware & Peripherals</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('SYSTEM')}
                        className={`w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all border-4 ${activeTab === 'SYSTEM' ? 'bg-brand border-brand text-white shadow-xl shadow-brand/20' : 'bg-white border-brand/5 text-brand/40 hover:border-brand/20'}`}
                    >
                        <ShieldCheck size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[.2em]">Security & Network</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('UI')}
                        className={`w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all border-4 ${activeTab === 'UI' ? 'bg-brand border-brand text-white shadow-xl shadow-brand/20' : 'bg-white border-brand/5 text-brand/40 hover:border-brand/20'}`}
                    >
                        <Palette size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[.2em]">UX & Visual Theme</span>
                    </button>
                </div>
            </aside>

            {/* CENTER: SETTINGS FORMS (Section 17) */}
            <main className="flex-1 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                <div className="p-12 max-w-4xl mx-auto w-full space-y-12">
                    {activeTab === 'HARDWARE' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <section>
                                <h4 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Printer size={16} /> Thermal Printers
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Receipt Printer (Main)', status: 'Connected', ip: '192.168.1.55' },
                                        { name: 'Kitchen KOT (Station 1)', status: 'Connected', ip: '192.168.1.56' },
                                        { name: 'Kitchen KOT (Station 2)', status: 'Offline', ip: '192.168.1.57' }
                                    ].map(p => (
                                        <div key={p.name} className="p-6 bg-brand/5 border border-brand/10 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${p.status === 'Connected' ? 'bg-brand' : 'bg-rose-500'}`}></div>
                                                <div>
                                                    <div className="text-sm font-black text-brand">{p.name}</div>
                                                    <div className="text-[10px] font-bold text-brand/40 uppercase tracking-widest">Network IP: {p.ip}</div>
                                                </div>
                                            </div>
                                            <button className="px-6 py-2 bg-white border border-brand/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand hover:bg-brand hover:text-white transition-all">
                                                Test Print
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h4 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Smartphone size={16} /> Payment Terminals
                                </h4>
                                <div className="p-6 border-2 border-brand/10 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center">
                                    <Monitor size={32} className="text-brand/20 mb-4" />
                                    <p className="text-sm font-bold text-brand/40 mb-6">No integrated payment terminal detected via USB or Network.</p>
                                    <button className="px-8 py-4 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20">
                                        Scan for Hardware
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'UI' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <section>
                                <h4 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Globe size={16} /> Regional & Context
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-2">Display Language</label>
                                        <select className="w-full h-14 bg-brand/5 border border-brand/10 rounded-2xl px-6 text-brand font-black outline-none focus:border-brand">
                                            <option>English (Global)</option>
                                            <option>Spanish (ES)</option>
                                            <option>French (FR)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-2">Currency Format</label>
                                        <div className="h-14 bg-brand text-white rounded-2xl px-6 flex items-center font-black">
                                            USD ($) - Central Bank Rates
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Volume2 size={16} /> Soundscapes & Feedback
                                </h4>
                                <div className="space-y-6">
                                    {[
                                        { label: 'KDS Fulfillment Alert', desc: 'Plays when a station completes an order' },
                                        { label: 'Incoming Order Notification', desc: 'Plays for online and call center orders' },
                                        { label: 'Tactile Touch Feedback', desc: 'System-wide haptic simulation' }
                                    ].map(s => (
                                        <div key={s.label} className="flex items-center justify-between p-2">
                                            <div>
                                                <div className="text-sm font-black text-brand">{s.label}</div>
                                                <div className="text-[10px] font-medium text-brand/40 uppercase tracking-widest">{s.desc}</div>
                                            </div>
                                            <div className="w-14 h-8 bg-brand rounded-full relative p-1 cursor-pointer">
                                                <div className="w-6 h-6 bg-white rounded-full absolute right-1"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'SYSTEM' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <section>
                                <h4 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Wifi size={16} /> Connectivity & Sync
                                </h4>
                                <div className="bg-brand/5 rounded-3xl p-8 border border-brand/10">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <Database size={28} />
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-brand">Cloud Database Link</div>
                                            <div className="text-[10px] font-black text-brand/40 uppercase tracking-widest">Latency: 24ms • Status: Synchronized</div>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-brand/10 rounded-full overflow-hidden mb-2">
                                        <div className="h-full w-full bg-brand"></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-brand/40 uppercase tracking-widest">
                                        <span>Local Storage: 1.2GB Free</span>
                                        <span>Last Sync: 2 Mins Ago</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {/* RIGHT: ACTION PANEL (Section 17) */}
            <aside className="w-80 md:w-96 bg-white border-l border-brand/10 flex flex-col flex-shrink-0">
                <div className="p-8 border-b border-brand/10">
                    <h3 className="text-xl font-black text-brand tracking-tight">Persistence</h3>
                </div>
                <div className="flex-1 p-8 space-y-6 flex flex-col">
                    <div className="flex-1"></div>
                    <button className="w-full py-6 bg-brand text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all flex items-center justify-center gap-3 active:scale-95">
                        <Save size={20} />
                        Commit Changes
                    </button>
                    <button className="w-full py-4 bg-white border-2 border-brand/10 text-brand rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-brand transition-all flex items-center justify-center gap-2">
                        <RotateCcw size={16} />
                        Revert to Defaults
                    </button>
                </div>
            </aside>
        </div>
    );
};
