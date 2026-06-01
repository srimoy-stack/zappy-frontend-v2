'use client';

import React, { useState, useMemo } from 'react';
import {
    Store as StoreIcon, Eye, Ban, RefreshCw, Search, MapPin,
    Plus, Loader2, Pencil, Power, ToggleLeft, ToggleRight,
    ChevronDown, ArrowUpDown, Phone, Shield, Truck, Calendar, User,
    SlidersHorizontal, X,
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

    // Extra filter console state
    const [showFilters, setShowFilters] = useState(false);
    const [cityFilter, setCityFilter] = useState('');
    const [timezoneFilter, setTimezoneFilter] = useState('');
    const [taxFilter, setTaxFilter] = useState('');
    const [deliveryFilter, setDeliveryFilter] = useState('');

    const cities = useMemo(() => Array.from(new Set(stores.map(s => s.city).filter(Boolean))), [stores]);
    const timezones = useMemo(() => Array.from(new Set(stores.map(s => s.timezone).filter(Boolean))), [stores]);
    const taxProfiles = useMemo(() => Array.from(new Set(stores.map(s => s.taxProfile).filter(Boolean))), [stores]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (cityFilter) count++;
        if (timezoneFilter) count++;
        if (taxFilter) count++;
        if (deliveryFilter) count++;
        return count;
    }, [cityFilter, timezoneFilter, taxFilter, deliveryFilter]);

    const filtered = useMemo(() => {
        let result = stores.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            const matchesCity = !cityFilter || s.city === cityFilter;
            const matchesTimezone = !timezoneFilter || s.timezone === timezoneFilter;
            const matchesTax = !taxFilter || s.taxProfile === taxFilter;
            
            let matchesDelivery = true;
            if (deliveryFilter === 'has-delivery') {
                matchesDelivery = (s.deliveryRadiusKm || 0) > 0;
            } else if (deliveryFilter === 'no-delivery') {
                matchesDelivery = !(s.deliveryRadiusKm || 0) || (s.deliveryRadiusKm || 0) === 0;
            }

            return matchesSearch && matchesStatus && matchesCity && matchesTimezone && matchesTax && matchesDelivery;
        });
        result = [...result].sort((a, b) => {
            const aVal = a[sortField] || '';
            const bVal = b[sortField] || '';
            return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
        return result;
    }, [stores, searchQuery, statusFilter, cityFilter, timezoneFilter, taxFilter, deliveryFilter, sortField, sortDir]);

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Toolbar: Title + Add Store ───────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        <StoreIcon size={22} className="text-slate-400" /> Store Governance
                    </h3>
                    <p className="text-[13px] text-slate-500 mt-1">
                        {activeCount} active · {stores.length} total — {remaining} remaining of {maxStores} allowed
                    </p>
                </div>
                <button onClick={() => setView('create')} disabled={remaining <= 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-[13px] font-semibold transition-all shadow-sm hover:shadow shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0">
                    <Plus size={14} className="stroke-[2.5]" /> Add Store
                </button>
            </div>

            {/* ── Capacity Gauge Card ──────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 flex-1 max-w-md">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Store Capacity</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                        <div className={cn('h-full rounded-full transition-all duration-700',
                            stores.length / maxStores > 0.9 ? 'bg-rose-500' :
                            stores.length / maxStores > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                        )} style={{ width: `${Math.min(100, (stores.length / maxStores) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{stores.length} / {maxStores}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active: <strong className="text-slate-800 font-semibold">{activeCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Inactive: <strong className="text-slate-800 font-semibold">{stores.length - activeCount - draftCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>Draft: <strong className="text-slate-800 font-semibold">{draftCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Remaining: <strong className="text-slate-800 font-semibold">{remaining}</strong></span>
                    </div>
                </div>
            </div>

            {/* ── Search + Filters Console ──────────────────────────────── */}
            <div className="space-y-4">
                {/* Search Bar Row (Full Width) */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input type="text" placeholder="Search stores by name or code…" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all" />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-semibold hover:bg-slate-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
                            showFilters && 'border-slate-300 bg-slate-50'
                        )}>
                        <SlidersHorizontal size={14} className="text-slate-400" />
                        <span>Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Status Tabs Row */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {STATUS_FILTERS.map(sf => (
                        <button key={sf.key} onClick={() => setStatusFilter(sf.key)}
                            className={cn(
                                'px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
                                statusFilter === sf.key
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                            )}>
                            {sf.label}
                            {statusCounts[sf.key] > 0 && (
                                <span className={cn('ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold',
                                    statusFilter === sf.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                )}>
                                    {statusCounts[sf.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Filter Console Panel */}
                {showFilters && (
                    <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-250">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <SlidersHorizontal size={11} /> Advanced Filtering
                            </span>
                            {activeFiltersCount > 0 && (
                                <button onClick={() => {
                                    setCityFilter('');
                                    setTimezoneFilter('');
                                    setTaxFilter('');
                                    setDeliveryFilter('');
                                }} className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 rounded px-1">
                                    <X size={12} /> Clear all filters
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {/* City / Location */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location (City)</label>
                                <div className="relative">
                                    <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[12px] text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 appearance-none">
                                        <option value="">All Locations</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Timezone */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timezone</label>
                                <div className="relative">
                                    <select value={timezoneFilter} onChange={(e) => setTimezoneFilter(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[12px] text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 appearance-none">
                                        <option value="">All Timezones</option>
                                        {timezones.map(tz => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Tax Settings */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tax Profile</label>
                                <div className="relative">
                                    <select value={taxFilter} onChange={(e) => setTaxFilter(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[12px] text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 appearance-none">
                                        <option value="">All Profiles</option>
                                        {taxProfiles.map(tp => (
                                            <option key={tp} value={tp}>{tp}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Delivery Options */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Operations</label>
                                <div className="relative">
                                    <select value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[12px] text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 appearance-none">
                                        <option value="">All Options</option>
                                        <option value="has-delivery">Has Delivery Enabled</option>
                                        <option value="no-delivery">Pickup / Dine-in Only</option>
                                    </select>
                                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ Store Table ═══ */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/60">
                            <th className="text-left px-6 py-3.5">
                                <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1 rounded">
                                    Store <ArrowUpDown size={10} className={sortField === 'name' ? 'text-slate-900' : ''} />
                                </button>
                            </th>
                            <th className="text-left px-4 py-3.5">
                                <button onClick={() => toggleSort('city')} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1 rounded">
                                    Location <ArrowUpDown size={10} className={sortField === 'city' ? 'text-slate-900' : ''} />
                                </button>
                            </th>
                            <th className="text-left px-4 py-3.5">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Manager</span>
                            </th>
                            <th className="text-left px-4 py-3.5 hidden xl:table-cell">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone</span>
                            </th>
                            <th className="text-left px-4 py-3.5">
                                <button onClick={() => toggleSort('status')} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1 rounded">
                                    Status <ArrowUpDown size={10} className={sortField === 'status' ? 'text-slate-900' : ''} />
                                </button>
                            </th>
                            <th className="text-center px-4 py-3.5">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Users</span>
                            </th>
                            <th className="text-center px-4 py-3.5 hidden lg:table-cell">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tax</span>
                            </th>
                            <th className="text-center px-4 py-3.5 hidden lg:table-cell">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Delivery</span>
                            </th>
                            <th className="text-center px-4 py-3.5 hidden xl:table-cell">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Timezone</span>
                            </th>
                            <th className="text-left px-4 py-3.5 hidden xl:table-cell">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created</span>
                            </th>
                            <th className="text-right px-6 py-3.5">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(store => (
                            <tr key={store.id} className="group hover:bg-slate-50/50 transition-colors">
                                {/* Store Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                            <StoreIcon size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[13px] font-semibold text-slate-900 block truncate">{store.name}</span>
                                            <span className="text-[11px] text-slate-400 tracking-wide">{store.code}</span>
                                        </div>
                                    </div>
                                </td>
                                {/* Location */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1.5 text-[13px] text-slate-600">
                                        <MapPin size={12} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{store.city}, {store.province}</span>
                                    </div>
                                </td>
                                {/* Manager */}
                                <td className="px-4 py-4">
                                    {store.adminName && store.adminName !== '—' ? (
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center text-[10px] font-semibold shrink-0 border border-amber-200">
                                                {store.adminName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[12px] font-medium text-slate-800 block truncate">{store.adminName}</span>
                                                {store.adminEmail && <span className="text-[10px] text-slate-400 block truncate">{store.adminEmail}</span>}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[12px] text-slate-300">Unassigned</span>
                                    )}
                                </td>
                                {/* Phone */}
                                <td className="px-4 py-4 hidden xl:table-cell">
                                    {store.phone ? (
                                        <span className="text-[12px] text-slate-600 flex items-center gap-1.5">
                                            <Phone size={11} className="text-slate-400" />{store.phone}
                                        </span>
                                    ) : (
                                        <span className="text-[12px] text-slate-300">—</span>
                                    )}
                                </td>
                                {/* Status */}
                                <td className="px-4 py-4">
                                    <StoreStatusBadge status={store.status} />
                                </td>
                                {/* Users */}
                                <td className="px-4 py-4 text-center">
                                    <span className="text-[13px] font-semibold text-slate-700">{store.usersCount ?? 0}</span>
                                </td>
                                {/* Tax Profile */}
                                <td className="px-4 py-4 text-center hidden lg:table-cell">
                                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border',
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
                                        <span className="text-[12px] text-slate-600 flex items-center justify-center gap-1">
                                            <Truck size={11} className="text-slate-400" />{store.deliveryRadiusKm} km
                                        </span>
                                    ) : (
                                        <span className="text-[12px] text-slate-300">—</span>
                                    )}
                                </td>
                                {/* Timezone */}
                                <td className="px-4 py-4 text-center hidden xl:table-cell">
                                    <span className="text-[11px] text-slate-500">{store.timezone || '—'}</span>
                                </td>
                                {/* Created */}
                                <td className="px-4 py-4 hidden xl:table-cell">
                                    {store.createdAt ? (
                                        <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                            <Calendar size={10} className="text-slate-400" />
                                            {new Date(store.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-slate-300">—</span>
                                    )}
                                </td>
                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1">
                                        {/* View */}
                                        <button onClick={() => onViewStore?.(store.id) || onConfigureStore?.(store.id)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950" title="View store">
                                            <Eye size={14} />
                                        </button>
                                        {/* Edit */}
                                        <button onClick={() => onConfigureStore?.(store.id)}
                                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950" title="Edit store">
                                            <Pencil size={14} />
                                        </button>
                                        {/* Enable / Disable Toggle */}
                                        {actionLoading === store.id ? (
                                            <Loader2 size={14} className="animate-spin text-slate-400 mx-2" />
                                        ) : store.status === 'Active' ? (
                                            <button onClick={() => handleSuspend(store.id)}
                                                className="p-2 text-emerald-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950" title="Disable store">
                                                <ToggleRight size={16} />
                                            </button>
                                        ) : store.status === 'Inactive' ? (
                                            <button onClick={() => handleReactivate(store.id)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950" title="Enable store">
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
                    <div className="text-center py-20 px-6">
                        <StoreIcon className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                        {stores.length === 0 ? (
                            <>
                                <h3 className="text-base font-semibold text-slate-900 mb-1.5">No Stores Yet</h3>
                                <p className="text-[13px] text-slate-500 max-w-sm mx-auto mb-6">
                                    Create your first store location to start configuring POS, delivery, and operations.
                                </p>
                                <button onClick={() => setView('create')}
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-[13px] font-semibold hover:bg-slate-800 transition-colors">
                                    <Plus size={14} className="inline mr-1.5" /> Create First Store
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-base font-semibold text-slate-900 mb-1.5">No Results</h3>
                                <p className="text-[13px] text-slate-500">
                                    No stores match &quot;{searchQuery}&quot; with filter &quot;{statusFilter}&quot;
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Table Footer */}
                {filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                            Showing {filtered.length} of {stores.length} stores
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
