'use client';

import React, { useState } from 'react';
import { Store as StoreIcon, Eye, Ban, RefreshCw, Search, MapPin, CheckCircle2 } from 'lucide-react';
import type { Store } from '@/shared/types/store';

interface StoresTabProps {
    tenantId: string;
    stores: Store[];
}

export function StoresTab({ tenantId, stores: initialStores }: StoresTabProps) {
    const [stores, setStores] = useState(initialStores);
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = stores.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = stores.filter(s => s.status === 'Active').length;

    const handleSuspend = (storeId: string) => {
        if (!confirm('Suspend this store? Active POS sessions will be terminated.')) return;
        setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: 'Inactive' as any } : s));
    };

    const handleReactivate = (storeId: string) => {
        setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: 'Active' as any } : s));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <StoreIcon size={18} />
                        Store Governance
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {activeCount} active / {stores.length} total — Store creation is managed from tenant backoffice
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-6 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                />
            </div>

            {/* Store Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(store => (
                    <div key={store.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all text-slate-400">
                                    <StoreIcon size={18} />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-slate-900">{store.name}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{store.code}</span>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                store.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                                <CheckCircle2 size={10} />
                                {store.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4">
                            <span className="flex items-center gap-1"><MapPin size={11} /> {store.city}, {store.province}</span>
                            <span>TZ: {store.timezone}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                                <Eye size={14} />
                            </button>
                            {store.status === 'Active' ? (
                                <button
                                    onClick={() => handleSuspend(store.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Ban size={14} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleReactivate(store.id)}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16">
                    <StoreIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No stores found</p>
                </div>
            )}
        </div>
    );
}
