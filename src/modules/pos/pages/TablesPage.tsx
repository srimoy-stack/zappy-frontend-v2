'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/modules/pos/context/POSContext';
import { useRouter } from 'next/navigation';
import {
    X,
    Move,
    SplitSquareVertical,
    Edit3,
    Plus
} from 'lucide-react';
import { mockPOSAreas } from '../mock/posData';
import { POSTable } from '../types/pos';

export const TablesPage: React.FC = () => {
    const { setTable, moveTable } = usePOS();
    const router = useRouter();

    const [activeArea, setActiveArea] = useState(mockPOSAreas[0]?.id);
    const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);
    const [isMoveMode, setIsMoveMode] = useState(false);
    const [tableToMove, setTableToMove] = useState<POSTable | null>(null);
    const [localTables, setLocalTables] = useState<POSTable[]>([]);

    useEffect(() => {
        const fetchTables = () => {
            const savedTables = localStorage.getItem('pos_tables');
            if (savedTables) {
                setLocalTables(JSON.parse(savedTables));
            }
        };
        fetchTables();
        const interval = setInterval(fetchTables, 2000);
        return () => clearInterval(interval);
    }, []);

    const filteredTables = localTables.filter(t => t.areaId === activeArea);

    const handleTableClick = (table: POSTable) => {
        if (isMoveMode && tableToMove) {
            if (table.status === 'FREE') {
                moveTable(tableToMove.id, table.id);
                setIsMoveMode(false);
                setTableToMove(null);
                setSelectedTable(null);
            }
            return;
        }

        if (table.status === 'FREE') {
            setTable(table);
            router.push('/pos/menu');
        } else {
            setSelectedTable(table);
        }
    };

    return (
        <div className="flex h-screen bg-[#F1F5F9] text-brand font-sans overflow-hidden">
            {/* AREA SELECTION SIDEBAR (Image 3) */}
            <aside className="w-56 bg-white border-r border-brand/5 flex flex-col flex-shrink-0 p-6 gap-3">
                {mockPOSAreas.map((area) => (
                    <button
                        key={area.id}
                        onClick={() => setActiveArea(area.id)}
                        className={`w-full py-4 rounded-xl text-sm font-black transition-all border-2 text-center uppercase tracking-widest ${activeArea === area.id
                            ? 'bg-brand text-white border-brand'
                            : 'bg-white text-brand border-brand/10 hover:border-brand/40'
                            }`}
                    >
                        {area.name}
                    </button>
                ))}
            </aside>

            {/* TABLE GRID (Image 3) */}
            <main className="flex-1 flex flex-col relative min-w-0 p-6">
                <div className="bg-white rounded-[2rem] shadow-sm border border-brand/5 flex-1 p-10 overflow-y-auto custom-scrollbar relative">
                    <header className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-black text-brand tracking-tighter">Select Table</h1>
                            <div className="flex items-center gap-6 ml-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#107F43] rounded-sm"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand/40">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#EF4F23] rounded-sm"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand/40">Occupied</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-3 bg-brand/5 border border-brand/10 rounded-xl text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2 hover:bg-brand hover:text-white transition-all">
                                <Plus size={14} /> New Order
                            </button>
                            <button onClick={() => router.back()} className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-5 gap-6 max-w-6xl mx-auto">
                        {filteredTables.map((table) => {
                            const isSpecial = table.name.includes('Lounge') || table.name.includes('Group');
                            return (
                                <button
                                    key={table.id}
                                    onClick={() => handleTableClick(table)}
                                    className={`relative p-6 flex flex-col items-center justify-center transition-all active:scale-95 text-white shadow-sm ${table.status === 'FREE' ? 'bg-[#107F43]' : 'bg-[#EF4F23]'
                                        } ${isSpecial ? 'col-span-1 row-span-2 h-72' : 'h-32'} rounded-xl group`}
                                >
                                    <div className="text-center">
                                        <div className="text-sm font-black mb-1 group-hover:scale-110 transition-transform">{table.name}</div>
                                        <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{table.seats} Seats</div>
                                    </div>

                                    {isMoveMode && table.status === 'FREE' && (
                                        <div className="absolute inset-0 border-4 border-white rounded-xl animate-pulse"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* MOVE MODE OVERLAY */}
                    {isMoveMode && (
                        <div className="absolute inset-x-0 bottom-0 bg-brand p-8 flex items-center justify-between text-white animate-in slide-in-from-bottom duration-300 z-20 rounded-t-[2rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Move size={32} />
                                </div>
                                <div>
                                    <h4 className="font-black text-xl leading-none mb-1">Moving Order from {tableToMove?.name}</h4>
                                    <p className="text-white/60 text-sm font-medium">Select a free target table to complete the move</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsMoveMode(false); setTableToMove(null); }}
                                className="px-10 py-4 bg-white text-brand rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                            >
                                Cancel Move
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* ORDER DETAILS PANEL (for occupied tables) - Matching Image 1 & 2 layout */}
            {selectedTable && !isMoveMode && (
                <aside className="w-[450px] bg-white border-l border-brand/5 flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-300">
                    <header className="p-8 border-b border-brand/5 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black text-brand/40 uppercase tracking-widest mb-1">Active Table Overview</div>
                            <h2 className="text-3xl font-black text-brand tracking-tighter">{selectedTable.name}</h2>
                        </div>
                        <button
                            onClick={() => setSelectedTable(null)}
                            className="w-12 h-12 bg-brand/5 rounded-xl flex items-center justify-center text-brand/20 hover:text-brand transition-all"
                        >
                            <X size={24} />
                        </button>
                    </header>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div>
                                <span className="text-[10px] font-black text-brand/40 uppercase tracking-widest block mb-2">Order Tracking</span>
                                <div className="text-base font-black text-brand">#{selectedTable.orderId || '1452310006'}</div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-brand/40 uppercase tracking-widest block mb-2">Order Status</span>
                                <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">PENDING</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3 text-xs font-bold text-brand uppercase tracking-widest">
                                <Edit3 size={14} className="text-brand/40" /> Edit Items
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-brand uppercase tracking-widest">
                                <SplitSquareVertical size={14} className="text-brand/40" /> Split Bill
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-brand uppercase tracking-widest">
                                <Move size={14} className="text-brand/40" /> Move Order
                            </div>
                        </div>

                        <div className="pt-8 border-t border-brand/5">
                            <h4 className="text-[10px] font-black text-brand/40 uppercase tracking-[0.2em] mb-6">Kitchen Display (KOT)</h4>
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center text-xs font-black">1</div>
                                        <div>
                                            <div className="text-sm font-black text-brand leading-none mb-1">BUTTERED SAVOY CABBAGE</div>
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase">Status: Prepared</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black">$3.00</div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center text-xs font-black">1</div>
                                        <div>
                                            <div className="text-sm font-black text-brand leading-none mb-1">SPICED SQUAB PIGEON</div>
                                            <div className="text-[10px] font-bold text-amber-500 uppercase">Status: Pending</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black">$6.00</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="p-8 bg-brand/5 border-t border-brand/5 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs font-black uppercase tracking-widest text-brand/60">
                            <span>Subtotal</span>
                            <span className="text-right">$9.00</span>
                            <span>Tax</span>
                            <span className="text-right">$0.81</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-brand/10">
                            <div className="text-[10px] font-black text-brand/40 uppercase tracking-widest">Total Bill</div>
                            <div className="text-4xl font-black text-brand tracking-tighter">$10.00</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={() => router.push('/pos/menu')}
                                className="py-5 bg-brand text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all"
                            >
                                Complete
                            </button>
                            <button
                                onClick={() => setSelectedTable(null)}
                                className="py-5 bg-white border-2 border-brand/10 text-brand rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Back
                            </button>
                        </div>
                    </footer>
                </aside>
            )}
        </div>
    );
};
