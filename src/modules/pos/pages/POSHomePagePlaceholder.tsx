'use client';

import React from 'react';
import { usePOS } from '@/modules/pos/context/POSContext';
import { useRouter } from 'next/navigation';
import { LogOut, Store, LayoutGrid, Clock, User } from 'lucide-react';

export const POSHomePagePlaceholder: React.FC = () => {
    const { session, logout } = usePOS();
    const router = useRouter();

    // Live clock for POS taskbar
    React.useEffect(() => {
        const updateClock = () => {
            const clockEl = document.getElementById('pos-clock');
            if (clockEl) {
                clockEl.innerText = new Date().toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
            }
        };
        const interval = setInterval(updateClock, 1000);
        updateClock();
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        if (!session) {
            router.push('/pos/login');
        }
    }, [session, router]);

    if (!session) return null;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* POS Header */}
            <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                            <span className="text-white font-black">Z</span>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Zyappy POS</div>
                            <div className="text-sm font-black text-brand tracking-tight">Main Terminal</div>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200"></div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-lg">
                            <Store size={14} className="text-brand" />
                            <span className="text-xs font-bold text-brand">{session.store.name}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                            <LayoutGrid size={14} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-700">{session.channel}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 text-right">
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{session.user.role}</div>
                            <div className="text-sm font-black text-brand">{session.user.name}</div>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200">
                            <User size={20} />
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm border border-rose-200"
                        title="End Session"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Content Placeholder */}
            <main className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50">
                <div className="w-24 h-24 bg-white border border-gray-200 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8 animate-pulse shadow-sm">
                    <Clock size={48} />
                </div>
                <h2 className="text-4xl font-black text-brand tracking-tight mb-4">POS Home – Next Section</h2>
                <p className="text-gray-500 max-w-md mx-auto font-medium leading-relaxed">
                    Context initialized successfully. You are now in the <strong className="text-brand">{session.posType.replace('_', ' ')}</strong> environment at <strong className="text-brand">{session.store.name}</strong> for <strong className="text-brand">{session.channel}</strong>.
                </p>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white border border-gray-200 border-dashed rounded-[2rem] flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Section Placeholder</span>
                        </div>
                    ))}
                </div>
            </main>

            {/* POS Footer (Taskbar) */}
            <footer className="h-14 bg-white border-t border-gray-200 px-8 flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span>V1.0.0</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-brand">System Ready</span>
                </div>
                <div className="flex items-center gap-4">
                    <span id="pos-clock" className="text-gray-500">Thu, Feb 5, 8:45 PM</span>
                </div>
            </footer>
        </div>
    );
};
