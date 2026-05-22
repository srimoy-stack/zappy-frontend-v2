'use client';

import React, { useState, useMemo } from 'react';
import {
    Store as StoreIcon, Eye, Ban, RefreshCw, Search, MapPin,
    Plus, Loader2, Pencil, Power, ToggleLeft, ToggleRight,
    ChevronDown, ArrowUpDown, Phone, Shield, Truck, Calendar, User,
} from 'lucide-react';
import type { Store, CreateStoreDTO, StoreStatus } from '@/shared/types/store';
import { cn } from '@/utils';
import { StoreStatusBadge } from '@/modules/stores/components/shared/StoreStatusBadge';
import { StoreOnboardingWizard } from '@/modules/stores/components/shared/StoreOnboardingWizard';

// ─── Props ──────────────────────────────────────────────────────────────────

interface StoresTabProps {
    tenantId: string;
    stores: Store[];
    maxStores?: number;
    onCreateStore?: (dto: CreateStoreDTO) => Promise<void>;
    onUpdateStore?: (storeId: string, dto: CreateStoreDTO) => Promise<void>;
    onSuspendStore?: (storeId: string) => Promise<void>;
    onReactivateStore?: (storeId: string) => Promise<void>;
    onViewStore?: (storeId: string) => void;
    onConfigureStore?: (storeId: string) => void;
}

// ─── Filter Config ──────────────────────────────────────────────────────────

const STATUS_FILTERS: { key: 'all' | StoreStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'Active', label: 'Active' },
    { key: 'Inactive', label: 'Inactive' },
    { key: 'Draft', label: 'Draft' },
    { key: 'Pending', label: 'Pending' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function StoresTab({
    tenantId,
    stores: initialStores,
    maxStores = 50,
    onCreateStore,
    onUpdateStore,
    onSuspendStore,
    onReactivateStore,
    onViewStore,
    onConfigureStore,
}: StoresTabProps) {
    const [stores, setStores] = useState(initialStores);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | StoreStatus>('all');
    const [view, setView] = useState<'list' | 'create'>('list');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [sortField, setSortField] = useState<'name' | 'city' | 'status'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const filtered = useMemo(() => {
        let result = stores.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        result = [...result].sort((a, b) => {
            const aVal = a[sortField] || '';
            const bVal = b[sortField] || '';
            return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
        return result;
    }, [stores, searchQuery, statusFilter, sortField, sortDir]);

    const activeCount = stores.filter(s => s.status === 'Active').length;
    const draftCount = stores.filter(s => s.status === 'Draft').length;
    const remaining = Math.max(0, maxStores - stores.length);

    const statusCounts = useMemo(() => ({
        all: stores.length,
        Active: activeCount,
        Inactive: stores.filter(s => s.status === 'Inactive').length,
        Draft: draftCount,
        Pending: stores.filter(s => s.status === 'Pending').length,
    }), [stores, activeCount, draftCount]);

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

    const handleFormSubmit = async (dto: CreateStoreDTO, storeId?: string) => {
        if (storeId && onUpdateStore) {
            await onUpdateStore(storeId, dto);
            setStores(prev => prev.map(s => s.id === storeId ? { ...s, ...dto } : s));
        } else if (onCreateStore) {
            await onCreateStore(dto);
            const newStore: Store = {
                id: `store-${Date.now()}`, ...dto, tenantId, status: 'Draft',
                name: dto.name, code: dto.code || `SC-${Date.now()}`, city: dto.city,
                province: dto.province, timezone: dto.timezone || 'America/Toronto',
                paymentTerms: 'Net 30', taxProfile: 'Inherit', logoStatus: 'Default',
                deliveryRadiusKm: dto.deliveryRadiusKm, latitude: dto.latitude,
                longitude: dto.longitude, usersCount: 0, createdAt: new Date().toISOString(),
            };
            setStores(prev => [...prev, newStore]);
        }
    };

    const toggleSort = (field: 'name' | 'city' | 'status') => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    // ── Inline wizard view ──
    if (view === 'create') {
        return (
            <StoreOnboardingWizard
                tenantId={tenantId}
                onCancel={() => setView('list')}
                onSubmit={async (dto) => {
                    await handleFormSubmit(dto);
                    setView('list');
                }}
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <StoreIcon size={18} /> Store Governance
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {activeCount} active / {stores.length} total — {remaining} remaining of {maxStores} allowed
                    </p>
                </div>
                <button onClick={() => setView('create')} disabled={remaining <= 0}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-200">
                    <Plus size={14} /> Add Store
                </button>
            </div>

            {/* Capacity Gauge */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Store Capacity</span>
                    <span className="text-xs font-black text-slate-900">{stores.length} / {maxStores}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-700',
                        stores.length / maxStores > 0.9 ? 'bg-rose-500' :
                        stores.length / maxStores > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                    )} style={{ width: `${Math.min(100, (stores.length / maxStores) * 100)}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                        <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-slate-900">{stores.length - activeCount - draftCount}</span>
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Inactive</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-amber-600">{draftCount}</span>
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Draft</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-emerald-600">{remaining}</span>
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Remaining</span>
                    </div>
                </div>
            </div>

            {/* Search + Status Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search stores by name or code..." value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-6 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                </div>
                <div className="flex items-center gap-1">
                    {STATUS_FILTERS.map(sf => (
                        <button key={sf.key} onClick={() => setStatusFilter(sf.key)}
                            className={cn(
                                'px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                                statusFilter === sf.key
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            )}>
                            {sf.label}
                            {statusCounts[sf.key] > 0 && (
                                <span className={cn('ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px]',
                                    statusFilter === sf.key ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'
                                )}>
                                    {statusCounts[sf.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ Store Table ═══ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left px-6 py-4">
                                <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">
                                    Store <ArrowUpDown size={10} className={sortField === 'name' ? 'text-slate-900' : ''} />
                                </button>
                            </th>
                            <th className="text-left px-4 py-4">
                                <button onClick={() => toggleSort('city')} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">
                                    Location <ArrowUpDown size={10} className={sortField === 'city' ? 'text-slate-900' : ''} />
                                </button>
                            </th>
                            <th className="text-left px-4 py-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manager</span>
                            </th>
                            <th className="text-left px-4 py-4 hidden xl:table-cell">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</span>
                            </th>
                            <th className="text-left px-4 py-4">
                                <button onClick={() => toggleSort('status')} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">
                                    Status <ArrowUpDown size={10} className={sortField === 'status' ? 'text-slate-900' : ''} />
                                </button>
                            </th>
                            <th className="text-center px-4 py-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Users</span>
                            </th>
                            <th className="text-center px-4 py-4 hidden lg:table-cell">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tax</span>
                            </th>
                            <th className="text-center px-4 py-4 hidden lg:table-cell">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivery</span>
                            </th>
                            <th className="text-center px-4 py-4 hidden xl:table-cell">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timezone</span>
                            </th>
                            <th className="text-left px-4 py-4 hidden xl:table-cell">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Created</span>
                            </th>
                            <th className="text-right px-6 py-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map(store => (
                            <tr key={store.id} className="group hover:bg-slate-50/60 transition-colors">
                                {/* Store Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                            <StoreIcon size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-sm font-black text-slate-900 block truncate">{store.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{store.code}</span>
                                        </div>
                                    </div>
                                </td>
                                {/* Location */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                        <MapPin size={11} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{store.city}, {store.province}</span>
                                    </div>
                                </td>
                                {/* Manager */}
                                <td className="px-4 py-4">
                                    {store.adminName && store.adminName !== '—' ? (
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-black shrink-0">
                                                {store.adminName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[11px] font-bold text-slate-800 block truncate">{store.adminName}</span>
                                                {store.adminEmail && <span className="text-[9px] text-slate-400 block truncate">{store.adminEmail}</span>}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-medium">Unassigned</span>
                                    )}
                                </td>
                                {/* Phone */}
                                <td className="px-4 py-4 hidden xl:table-cell">
                                    {store.phone ? (
                                        <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                                            <Phone size={10} className="text-slate-400" />{store.phone}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-medium">—</span>
                                    )}
                                </td>
                                {/* Status */}
                                <td className="px-4 py-4">
                                    <StoreStatusBadge status={store.status} />
                                </td>
                                {/* Users */}
                                <td className="px-4 py-4 text-center">
                                    <span className="text-sm font-black text-slate-700">{store.usersCount ?? 0}</span>
                                </td>
                                {/* Tax Profile */}
                                <td className="px-4 py-4 text-center hidden lg:table-cell">
                                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border',
                                        store.taxProfile === 'Override'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-slate-50 text-slate-500 border-slate-200'
                                    )}>
                                        <Shield size={8} />{store.taxProfile}
                                    </span>
                                </td>
                                {/* Delivery Radius */}
                                <td className="px-4 py-4 text-center hidden lg:table-cell">
                                    {store.deliveryRadiusKm ? (
                                        <span className="text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1">
                                            <Truck size={10} className="text-blue-400" />{store.deliveryRadiusKm} km
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-medium">—</span>
                                    )}
                                </td>
                                {/* Timezone */}
                                <td className="px-4 py-4 text-center hidden xl:table-cell">
                                    <span className="text-[10px] font-bold text-slate-500">{store.timezone || '—'}</span>
                                </td>
                                {/* Created */}
                                <td className="px-4 py-4 hidden xl:table-cell">
                                    {store.createdAt ? (
                                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                            <Calendar size={10} className="text-slate-400" />
                                            {new Date(store.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-medium">—</span>
                                    )}
                                </td>
                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1">
                                        {/* View */}
                                        <button onClick={() => onViewStore?.(store.id) || onConfigureStore?.(store.id)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View store">
                                            <Eye size={14} />
                                        </button>
                                        {/* Edit */}
                                        <button onClick={() => onConfigureStore?.(store.id)}
                                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all" title="Edit store">
                                            <Pencil size={14} />
                                        </button>
                                        {/* Enable / Disable Toggle */}
                                        {actionLoading === store.id ? (
                                            <Loader2 size={14} className="animate-spin text-slate-400 mx-2" />
                                        ) : store.status === 'Active' ? (
                                            <button onClick={() => handleSuspend(store.id)}
                                                className="p-2 text-emerald-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Disable store">
                                                <ToggleRight size={16} />
                                            </button>
                                        ) : store.status === 'Inactive' ? (
                                            <button onClick={() => handleReactivate(store.id)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Enable store">
                                                <ToggleLeft size={16} />
                                            </button>
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Empty State */}
                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <StoreIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        {stores.length === 0 ? (
                            <>
                                <h3 className="text-lg font-black text-slate-900 mb-2">No Stores Yet</h3>
                                <p className="text-sm text-slate-500 font-medium max-w-md mx-auto mb-6">
                                    Create your first store location to start configuring POS, delivery, and operations.
                                </p>
                                <button onClick={() => setView('create')}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                                    <Plus size={14} className="inline mr-2" /> Create First Store
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-black text-slate-900 mb-2">No Results</h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    No stores match &quot;{searchQuery}&quot; with filter &quot;{statusFilter}&quot;
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Table Footer */}
                {filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500">
                            Showing {filtered.length} of {stores.length} stores
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
