'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertTriangle,
    XCircle,
    RefreshCcw,
    ArrowLeft,

} from 'lucide-react';

export const POSErrorScreen: React.FC = () => {
    const router = useRouter();
    const [scenario, setScenario] = useState<'AVAILABILITY' | 'PAYMENT'>('AVAILABILITY');

    return (
        <div className="flex h-screen bg-white text-brand font-sans overflow-hidden">
            <aside className="w-80 md:w-96 bg-brand/5 border-r border-brand/10 flex flex-col flex-shrink-0 animate-in slide-in-from-left duration-500">
                <header className="p-8 border-b border-brand/10 bg-white flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 border border-brand/10 rounded-lg text-brand/40 hover:text-brand">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-xl font-black text-brand tracking-tight">System Fault</h3>
                </header>
                <div className="p-6 space-y-3">
                    <button
                        onClick={() => setScenario('AVAILABILITY')}
                        className={`w-full p-6 rounded-[2rem] flex flex-col text-left transition-all border-4 ${scenario === 'AVAILABILITY' ? 'bg-amber-500 border-amber-500 text-white shadow-xl' : 'bg-white border-brand/5 text-brand/40'}`}
                    >
                        <AlertTriangle size={24} className="mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-[.2em]">Inventory Conflict</span>
                    </button>
                    <button
                        onClick={() => setScenario('PAYMENT')}
                        className={`w-full p-6 rounded-[2rem] flex flex-col text-left transition-all border-4 ${scenario === 'PAYMENT' ? 'bg-rose-500 border-rose-500 text-white shadow-xl' : 'bg-white border-brand/5 text-brand/40'}`}
                    >
                        <XCircle size={24} className="mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-[.2em]">Terminal Rejection</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col items-center justify-center p-12 bg-white">
                <div className="max-w-2xl w-full">
                    {scenario === 'AVAILABILITY' ? (
                        <div className="space-y-8 animate-in zoom-in duration-300">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-brand tracking-tighter mb-2">Item Depleted</h2>
                                <p className="text-brand/40 text-[10px] font-black uppercase tracking-[0.2em]">Double-Cheese Patty is currently out of stock</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-4">Recommended Substitutes</h4>
                                {[
                                    { name: 'Veggie Supreme Patty', desc: 'Plant-based alternative', match: '98% Match' },
                                    { name: 'Spicy Chicken Glaze', desc: 'Chef recommendation', match: '92% Match' }
                                ].map(item => (
                                    <button key={item.name} className="w-full p-6 bg-brand/5 border-2 border-brand/10 rounded-3xl flex items-center justify-between hover:border-brand transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand shadow-sm">
                                                <RefreshCcw size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-brand">{item.name}</div>
                                                <div className="text-[10px] font-bold text-brand/40 uppercase">{item.desc}</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-brand uppercase">{item.match}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in duration-300">
                            <div className="text-center text-rose-600">
                                <div className="w-20 h-20 bg-rose-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                                    <XCircle size={40} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter mb-2">Transaction Declined</h2>
                                <p className="text-rose-500/60 text-[10px] font-black uppercase tracking-[0.2em]">Contact Bank or Retry Settlement</p>
                            </div>

                            <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl space-y-4">
                                <div className="flex justify-between text-xs font-bold text-rose-600 uppercase tracking-widest">
                                    <span>Error Code</span>
                                    <span>E-502: Insufficient Funds</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-rose-600 uppercase tracking-widest">
                                    <span>Terminal ID</span>
                                    <span>TRM-8821</span>
                                </div>
                            </div>

                            <button className="w-full py-6 bg-rose-500 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3">
                                <RefreshCcw size={20} />
                                Attempt Retry Execution
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <aside className="w-80 md:w-96 bg-white border-l border-brand/10 flex flex-col flex-shrink-0 p-8">
                <div className="flex-1"></div>
                <button
                    onClick={() => router.push('/pos/menu')}
                    className="w-full py-6 bg-brand text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all flex items-center justify-center gap-3"
                >
                    <ArrowLeft size={20} />
                    Back to Selection
                </button>
            </aside>
        </div>
    );
};
