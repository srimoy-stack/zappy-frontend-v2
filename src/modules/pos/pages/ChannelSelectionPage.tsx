'use client';

import React from 'react';
import { usePOS } from '@/modules/pos/context/POSContext';
import { useRouter } from 'next/navigation';
import { OrderChannel } from '@/modules/pos/types/pos';
import {
    Utensils,
    ShoppingBag,
    Truck,
    Phone,
    Clock,
    LayoutGrid
} from 'lucide-react';

export const ChannelSelectionPage: React.FC = () => {
    const { session, setChannel, logout } = usePOS();
    const router = useRouter();

    if (!session) return null;

    const channels: { id: OrderChannel; label: string; icon: any; color: string; description: string; hidden?: boolean }[] = [
        {
            id: 'Dine-In',
            label: 'Dine-In',
            icon: Utensils,
            color: 'emerald',
            description: 'Customer eating at the restaurant',
            hidden: session.posType === 'CALL_CENTER'
        },
        {
            id: 'Pickup',
            label: 'Pickup',
            icon: ShoppingBag,
            color: 'blue',
            description: 'Customer collecting their order',
            hidden: session.posType === 'CALL_CENTER'
        },
        {
            id: 'Delivery',
            label: 'Delivery',
            icon: Truck,
            color: 'violet',
            description: 'Dispatching to customer address',
            hidden: session.posType === 'CALL_CENTER'
        },
        {
            id: 'Phone Order',
            label: 'Phone Order',
            icon: Phone,
            color: 'amber',
            description: 'Taking order via call center',
            hidden: session.posType === 'STORE'
        },
    ];

    const handleSelectChannel = (channel: OrderChannel) => {
        setChannel(channel);
        router.push('/pos/dashboard');
    };

    const activeChannels = channels.filter(c => !c.hidden);

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Header / Info */}
            <div className="w-full max-w-4xl text-center mb-12 z-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-20 h-20 bg-brand rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand/20 border border-brand/30">
                    <LayoutGrid size={40} className="text-white" />
                </div>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand/5 border border-brand/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-6">
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                    Operational Context Active
                </div>
                <h1 className="text-5xl font-black text-brand tracking-tighter mb-3">Select Order Channel</h1>
                <p className="text-brand/40 text-lg font-black">Define how this order session will be handled</p>
            </div>

            {/* Channel Grid */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 z-10">
                {activeChannels.map((channel, idx) => (
                    <button
                        key={channel.id}
                        onClick={() => handleSelectChannel(channel.id)}
                        className={`group relative p-10 bg-white border-2 border-brand/5 hover:border-brand hover:bg-brand/5 rounded-[3rem] transition-all text-left overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl shadow-brand/5`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        {/* Glow effect on hover */}
                        <div className={`absolute -right-4 -top-4 w-40 h-40 bg-brand/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                        <div className="flex items-start justify-between mb-10">
                            <div className={`p-6 bg-brand/5 rounded-[2rem] group-hover:bg-brand text-brand/40 group-hover:text-white transition-all shadow-lg border border-brand/10 group-hover:border-brand`}>
                                <channel.icon size={36} />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-brand/5 rounded-xl text-[10px] font-black text-brand/40 uppercase tracking-widest border border-brand/10">
                                <Clock size={14} />
                                Tracking On
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-brand mb-3 group-hover:translate-x-1 transition-transform">{channel.label}</h3>
                            <p className="text-brand/40 font-black text-sm leading-relaxed group-hover:text-brand/60 transition-colors">
                                {channel.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer Navigation */}
            <div className="w-full max-w-5xl mt-16 flex items-center justify-between z-10">
                <div className="flex items-center gap-3 text-brand/20 font-black text-sm uppercase tracking-widest px-6 py-3">
                    {/* Store selection removed */}
                </div>

                <div className="flex items-center gap-8 bg-white px-8 py-4 rounded-[1.5rem] border-2 border-brand/10 shadow-lg shadow-brand/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-brand/40 uppercase tracking-widest">Active Store</div>
                            <div className="text-brand font-black text-sm tracking-tight">{session.store.name}</div>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-brand/10"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                            <LayoutGrid size={20} />
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-brand/40 uppercase tracking-widest">Operator</div>
                            <div className="text-brand font-black text-sm tracking-tight">{session.user.name}</div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={logout}
                className="mt-12 px-8 py-3 bg-white border border-brand/10 text-brand/30 hover:bg-rose-500/10 hover:text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all z-10"
            >
                Terminate Session
            </button>
        </div>
    );
};
