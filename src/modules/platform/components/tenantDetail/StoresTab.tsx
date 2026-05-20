'use client';

import React, { useState, useMemo } from 'react';
import {
    Store as StoreIcon, Eye, Ban, RefreshCw, Search, MapPin,
    CheckCircle2, Plus, X, Users, Navigation, Loader2, AlertTriangle,
} from 'lucide-react';
import type { Store, CreateStoreDTO } from '@/shared/types/store';
import { cn } from '@/utils';

// ─── Props ──────────────────────────────────────────────────────────────────

interface StoresTabProps {
    tenantId: string;
    stores: Store[];
    maxStores?: number; // Platform-configured limit
    onCreateStore?: (dto: CreateStoreDTO) => Promise<void>;
    onSuspendStore?: (storeId: string) => Promise<void>;
    onReactivateStore?: (storeId: string) => Promise<void>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function StoresTab({
    tenantId,
    stores: initialStores,
    maxStores = 50,
    onCreateStore,
    onSuspendStore,
    onReactivateStore,
}: StoresTabProps) {
    const [stores, setStores] = useState(initialStores);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // ── Form state ──
    const [formName, setFormName] = useState('');
    const [formCode, setFormCode] = useState('');
    const [formCity, setFormCity] = useState('');
    const [formProvince, setFormProvince] = useState('Ontario');
    const [formAddress, setFormAddress] = useState('');
    const [formPostalCode, setFormPostalCode] = useState('');
    const [formTimezone, setFormTimezone] = useState('America/Toronto');
    const [formPhone, setFormPhone] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formRadius, setFormRadius] = useState('5');
    const [formLat, setFormLat] = useState('');
    const [formLng, setFormLng] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filtered = useMemo(() =>
        stores.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.code.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [stores, searchQuery]);

    const activeCount = stores.filter(s => s.status === 'Active').length;
    const remaining = Math.max(0, maxStores - stores.length);

    const handleSuspend = async (storeId: string) => {
        if (!confirm('Suspend this store? Active POS sessions will be terminated.')) return;
        setActionLoading(storeId);
        try {
            if (onSuspendStore) await onSuspendStore(storeId);
            setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: 'Inactive' as const } : s));
        } finally { setActionLoading(null); }
    };

    const handleReactivate = async (storeId: string) => {
        setActionLoading(storeId);
        try {
            if (onReactivateStore) await onReactivateStore(storeId);
            setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: 'Active' as const } : s));
        } finally { setActionLoading(null); }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const dto: CreateStoreDTO = {
                name: formName, code: formCode, city: formCity, province: formProvince,
                address: formAddress, postalCode: formPostalCode, timezone: formTimezone,
                phone: formPhone || undefined, email: formEmail || undefined,
                deliveryRadiusKm: parseFloat(formRadius) || 5,
                latitude: parseFloat(formLat) || undefined,
                longitude: parseFloat(formLng) || undefined,
            };
            if (onCreateStore) await onCreateStore(dto);
            // Optimistic add
            const newStore: Store = {
                id: `store-${Date.now()}`, ...dto, tenantId, status: 'Active',
                paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Default',
                deliveryRadiusKm: dto.deliveryRadiusKm, latitude: dto.latitude,
                longitude: dto.longitude, usersCount: 0, createdAt: new Date().toISOString(),
            };
            setStores(prev => [...prev, newStore]);
            setIsCreateOpen(false);
            resetForm();
        } finally { setIsSubmitting(false); }
    };

    const resetForm = () => {
        setFormName(''); setFormCode(''); setFormCity(''); setFormAddress('');
        setFormPostalCode(''); setFormPhone(''); setFormEmail('');
        setFormRadius('5'); setFormLat(''); setFormLng('');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header + Capacity Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <StoreIcon size={18} /> Store Governance
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {activeCount} active / {stores.length} total — {remaining} remaining of {maxStores} allowed
                    </p>
                </div>
                <button onClick={() => setIsCreateOpen(true)} disabled={remaining <= 0}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Plus size={14} /> Add Store
                </button>
            </div>

            {/* Capacity Gauge */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Store Capacity</span>
                    <span className="text-xs font-black text-slate-900">{stores.length} / {maxStores}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-700',
                        stores.length / maxStores > 0.9 ? 'bg-rose-500' :
                        stores.length / maxStores > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                    )} style={{ width: `${Math.min(100, (stores.length / maxStores) * 100)}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                        <span className="text-2xl font-black text-slate-900">{activeCount}</span>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-slate-900">{stores.length - activeCount}</span>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Inactive</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-emerald-600">{remaining}</span>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Remaining</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search stores..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-6 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
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
                            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border',
                                store.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                            )}>
                                <CheckCircle2 size={10} /> {store.status}
                            </span>
                        </div>

                        {/* Location + Details */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><MapPin size={11} /> {store.city}, {store.province}</span>
                                <span>TZ: {store.timezone}</span>
                            </div>
                            {store.address && (
                                <p className="text-[11px] text-slate-400 font-medium truncate">{store.address}</p>
                            )}
                        </div>

                        {/* Enriched Stats Row */}
                        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                            <div className="text-center">
                                <span className="text-sm font-black text-slate-900">{store.usersCount ?? 0}</span>
                                <span className="block text-[8px] font-black text-slate-400 uppercase">Users</span>
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-black text-slate-900">{store.deliveryRadiusKm ?? '—'}</span>
                                <span className="block text-[8px] font-black text-slate-400 uppercase">Radius km</span>
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-black text-slate-900">{store.adminName || '—'}</span>
                                <span className="block text-[8px] font-black text-slate-400 uppercase">Admin</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all" aria-label="View store">
                                <Eye size={14} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" aria-label="Delivery zone">
                                <Navigation size={14} />
                            </button>
                            {actionLoading === store.id ? (
                                <Loader2 size={14} className="animate-spin text-slate-400 ml-1" />
                            ) : store.status === 'Active' ? (
                                <button onClick={() => handleSuspend(store.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" aria-label="Suspend store">
                                    <Ban size={14} />
                                </button>
                            ) : (
                                <button onClick={() => handleReactivate(store.id)}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" aria-label="Reactivate store">
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

            {/* ── Create Store Modal ─────────────────────────────────────────── */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Add Store</h3>
                                <p className="text-xs text-slate-500 font-medium">Scoped to tenant <code className="bg-slate-100 px-1 rounded">{tenantId}</code></p>
                            </div>
                            <button onClick={() => { setIsCreateOpen(false); resetForm(); }} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Name *</label>
                                    <input required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Downtown Toronto"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Code *</label>
                                    <input required value={formCode} onChange={e => setFormCode(e.target.value)} placeholder="DT-001"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                                <input value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="123 Main St"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City *</label>
                                    <input required value={formCity} onChange={e => setFormCity(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Province</label>
                                    <input value={formProvince} onChange={e => setFormProvince(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postal Code</label>
                                    <input value={formPostalCode} onChange={e => setFormPostalCode(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                            </div>

                            {/* Delivery Radius Section */}
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Navigation size={14} className="text-blue-600" />
                                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Delivery Configuration</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-blue-500 uppercase">Radius (km)</label>
                                        <input type="number" step="0.5" min="0" value={formRadius} onChange={e => setFormRadius(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border-2 border-blue-100 rounded-lg text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-blue-500 uppercase">Latitude</label>
                                        <input type="number" step="any" value={formLat} onChange={e => setFormLat(e.target.value)} placeholder="43.6532"
                                            className="w-full px-3 py-2.5 bg-white border-2 border-blue-100 rounded-lg text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-blue-500 uppercase">Longitude</label>
                                        <input type="number" step="any" value={formLng} onChange={e => setFormLng(e.target.value)} placeholder="-79.3832"
                                            className="w-full px-3 py-2.5 bg-white border-2 border-blue-100 rounded-lg text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <p className="text-[9px] text-blue-500 font-medium mt-2 flex items-center gap-1">
                                    <AlertTriangle size={9} /> Used for order delivery eligibility — which store can deliver to a customer
                                </p>
                            </div>

                            <button type="submit" disabled={isSubmitting}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50">
                                {isSubmitting ? 'Creating...' : 'Create Store'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
