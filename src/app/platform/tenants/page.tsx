'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Plus,
    ChevronDown,
    Eye,
    ShieldBan,
    X,
    AlertTriangle,
    Building2,
    ChevronLeft,
    ChevronRight,
    LogIn,
} from 'lucide-react';
import { UserRole } from '@/shared/types/auth';
import { Brand, TenantStatus, TENANT_STATUS_CONFIG } from '@/shared/types/tenant';
import { cn } from '@/utils';

// ─── Mock Data (aligned with adapter) ──────────────────────────────────────────

const MOCK_BRANDS: Brand[] = [
    {
        id: 'brand-001', brandLegalName: 'Acme Pizza Co. Ltd.', brandName: 'Acme Pizza Co.',
        tradeName: 'Acme Pizza', address: '123 Main St, Toronto', timezone: 'America/Toronto',
        currency: 'CAD', primaryContact: 'john@acmepizza.com', contactPhone: '+1-416-555-0100',
        status: 'Operational', createdDate: '2025-06-15', createdBy: 'admin', totalStores: 12,
        totalUsers: 45, enabledModules: ['pos', 'inventory', 'online-ordering', 'reports', 'email-campaigns'],
        province: 'Ontario', modulesPurchasedCount: 5, plan: 'Enterprise', slug: 'acme-pizza',
        lightLogo: '', darkLogo: '', defaultPaymentTerms: 'Net 30',
        defaultTaxScheme: 'HST', defaultTaxRate: 13,
        lastActivity: '2026-05-07T14:30:00Z', onboardingProgress: 100
    },
    {
        id: 'brand-002', brandLegalName: 'QuickBite Foods Ltd.', brandName: 'QuickBite Foods',
        tradeName: 'QuickBite', address: '456 Elm St, Vancouver', timezone: 'America/Vancouver',
        currency: 'CAD', primaryContact: 'sarah@quickbite.ca', contactPhone: '+1-604-555-0200',
        status: 'Configuring', createdDate: '2025-08-22', createdBy: 'admin', totalStores: 8,
        totalUsers: 12, enabledModules: ['pos', 'inventory', 'reports'],
        province: 'British Columbia', modulesPurchasedCount: 3, plan: 'Growth', slug: 'quickbite',
        lightLogo: '', darkLogo: '', defaultPaymentTerms: 'Net 15',
        defaultTaxScheme: 'GST+PST', defaultTaxRate: 12,
        lastActivity: '2026-05-06T09:15:00Z', onboardingProgress: 65
    },
    {
        id: 'brand-003', brandLegalName: 'Burger Nation Inc.', brandName: 'Burger Nation',
        tradeName: 'Burger Nation', address: '789 Oak Ave, Calgary', timezone: 'America/Edmonton',
        currency: 'CAD', primaryContact: 'admin@burgernation.ca', contactPhone: '+1-403-555-0300',
        status: 'Suspended', createdDate: '2025-03-04', createdBy: 'admin', totalStores: 3,
        totalUsers: 5, enabledModules: ['pos', 'inventory'],
        province: 'Alberta', modulesPurchasedCount: 2, plan: 'Starter', slug: 'burger-nation',
        lightLogo: '', darkLogo: '', defaultPaymentTerms: 'Net 30',
        defaultTaxScheme: 'GST', defaultTaxRate: 5,
        lastActivity: '2026-01-20T11:00:00Z', onboardingProgress: 100
    },
    {
        id: 'brand-004', brandLegalName: 'Sushi Express Holdings', brandName: 'Sushi Express',
        tradeName: 'Sushi Express', address: '101 Bay St, Toronto', timezone: 'America/Toronto',
        currency: 'CAD', primaryContact: 'ops@sushiexpress.com', contactPhone: '+1-416-555-0400',
        status: 'Operational', createdDate: '2024-11-10', createdBy: 'admin', totalStores: 22,
        totalUsers: 85, enabledModules: ['pos', 'inventory', 'online-ordering'],
        province: 'Ontario', modulesPurchasedCount: 7, plan: 'Enterprise', slug: 'sushi-express',
        lightLogo: '', darkLogo: '', defaultPaymentTerms: 'Net 30',
        defaultTaxScheme: 'HST', defaultTaxRate: 13,
        onboardingProgress: 100
    },
];

interface AuditEvent {
    type: string;
    brandId: string;
    brandName: string;
    timestamp: string;
    actor: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const auditLog: AuditEvent[] = [];

function logAuditEvent(event: AuditEvent) {
    auditLog.push(event);
    console.log('[AUDIT]', JSON.stringify(event));
}

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function TenantsPage() {
    const router = useRouter();

    // Data
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | TenantStatus>('all');
    const [createdDateFilter, setCreatedDateFilter] = useState('');
    const [provinceFilter, setProvinceFilter] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Suspend modal
    const [suspendTarget, setSuspendTarget] = useState<Brand | null>(null);

    // ── Data Fetch (mock) ─────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            await new Promise((r) => setTimeout(r, 400));
            setBrands(MOCK_BRANDS);
            setIsLoading(false);
        };
        load();
    }, []);

    // ── Derived Values ────────────────────────────────────────────────────
    const provinces = useMemo(
        () => Array.from(new Set(brands.map((b) => b.province).filter(Boolean))) as string[],
        [brands],
    );

    const filteredBrands = useMemo(() => {
        let result = [...brands];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (b) =>
                    b.brandName.toLowerCase().includes(q) ||
                    b.tradeName.toLowerCase().includes(q),
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter((b) => b.status === statusFilter);
        }

        if (createdDateFilter) {
            result = result.filter((b) => b.createdDate >= createdDateFilter);
        }

        if (provinceFilter !== 'all') {
            result = result.filter((b) => b.province === provinceFilter);
        }

        return result;
    }, [brands, searchQuery, statusFilter, createdDateFilter, provinceFilter]);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, createdDateFilter, provinceFilter, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredBrands.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBrands = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleRowClick = useCallback(
        (brand: Brand) => {
            router.push(`/platform/tenants/${brand.id}`);
        },
        [router],
    );

    const handleSuspendConfirm = useCallback(() => {
        if (!suspendTarget) return;

        const isOperational = suspendTarget.status === 'Operational';
        const newStatus: TenantStatus = isOperational ? 'Suspended' : 'Operational';

        setBrands((prev) =>
            prev.map((b) =>
                b.id === suspendTarget.id ? { ...b, status: newStatus } : b,
            ),
        );

        logAuditEvent({
            type: newStatus === 'Suspended' ? 'TENANT_SUSPENDED' : 'TENANT_REACTIVATED',
            brandId: suspendTarget.id,
            brandName: suspendTarget.brandName,
            timestamp: new Date().toISOString(),
            actor: UserRole.SUPER_ADMIN,
        });

        setSuspendTarget(null);
    }, [suspendTarget]);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setStatusFilter('all');
        setCreatedDateFilter('');
        setProvinceFilter('all');
    }, []);

    const hasActiveFilters =
        searchQuery !== '' ||
        statusFilter !== 'all' ||
        createdDateFilter !== '' ||
        provinceFilter !== 'all';

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 w-full overflow-hidden">
            <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6 overflow-hidden text-slate-900">
                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Tenants
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Platform governance & multi-tenant orchestration.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/platform/tenants/onboarding')}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Onboard New Tenant
                    </button>
                </div>

                {/* ── Controls & Table Card ────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Top Controls Bar */}
                    <div className="p-5 bg-white border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="tenants-search"
                                    type="text"
                                    placeholder="Search by tenant name or trade name…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Status filter */}
                                <FilterSelect
                                    id="filter-status"
                                    value={statusFilter}
                                    onChange={(v) => setStatusFilter(v as 'all' | TenantStatus)}
                                    options={[
                                        { value: 'all', label: 'All Statuses' },
                                        { value: 'Draft', label: 'Draft' },
                                        { value: 'Provisioned', label: 'Provisioned' },
                                        { value: 'Configuring', label: 'Configuring' },
                                        { value: 'Operational', label: 'Operational' },
                                        { value: 'Suspended', label: 'Suspended' },
                                    ]}
                                />

                                {/* Created Date filter */}
                                <div className="relative">
                                    <input
                                        id="filter-created-date"
                                        type="date"
                                        value={createdDateFilter}
                                        onChange={(e) => setCreatedDateFilter(e.target.value)}
                                        className="px-4 py-2 bg-slate-50 border-2 border-slate-50 rounded-xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none min-w-[160px]"
                                    />
                                </div>

                                {/* Province filter */}
                                <FilterSelect
                                    id="filter-province"
                                    value={provinceFilter}
                                    onChange={setProvinceFilter}
                                    options={[
                                        { value: 'all', label: 'All Provinces' },
                                        ...provinces.map((p) => ({ value: p, label: p })),
                                    ]}
                                />

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Table / Loading / Empty ───────────────────────── */}
                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                            <span className="text-xs text-slate-500 font-black uppercase tracking-widest">
                                Orchestrating Tenants…
                            </span>
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                                <Building2 className="w-10 h-10 text-slate-200" />
                            </div>
                            <p className="text-lg font-black text-slate-900 tracking-tight">
                                No tenants matching your criteria
                            </p>
                            <p className="text-sm text-slate-500 font-medium mt-1 max-w-xs mx-auto">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters or search query to find the tenant you are looking for.'
                                    : 'Start by onboarding your first tenant to the platform.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[1100px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Tenant Identity
                                            </th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Operational Status
                                            </th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                                Scale (S/U)
                                            </th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Entitlements
                                            </th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Health / Onboarding
                                            </th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Created
                                            </th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                                Governance
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginatedBrands.map((brand) => (
                                            <tr
                                                key={brand.id}
                                                onClick={() => handleRowClick(brand)}
                                                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                            >
                                                {/* Tenant Identity */}
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-emerald-400 transition-all border border-transparent shadow-sm">
                                                            <Building2 className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-base font-black text-slate-900 tracking-tight group-hover:text-slate-900 transition-colors">
                                                                {brand.brandName}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                    {brand.tradeName}
                                                                </span>
                                                                <span className="text-slate-200 text-[10px]">•</span>
                                                                <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-50 px-1.5 rounded">
                                                                    {brand.slug}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-6 py-5">
                                                    <StatusBadge status={brand.status} />
                                                </td>

                                                {/* Scale (Stores / Users) */}
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-black text-slate-900 tabular-nums">
                                                            {brand.totalStores} <span className="text-[10px] text-slate-400 uppercase ml-1">Stores</span>
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 tabular-nums mt-0.5">
                                                            {brand.totalUsers} Users
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Entitlements */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-slate-900 uppercase">
                                                            {brand.modulesPurchasedCount} Modules
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-[150px]">
                                                            {brand.enabledModules.slice(0, 3).join(', ')}{brand.enabledModules.length > 3 ? '...' : ''}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Health / Onboarding */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1.5 w-32">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase">Onboarding</span>
                                                            <span className="text-[9px] font-black text-slate-900">{brand.onboardingProgress || 0}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn(
                                                                    'h-full rounded-full transition-all duration-1000',
                                                                    (brand.onboardingProgress || 0) === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                                                                )}
                                                                style={{ width: `${brand.onboardingProgress || 0}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Created Date */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-600 tabular-nums">
                                                            {formatDate(brand.createdDate)}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            {brand.province}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-8 py-5">
                                                    <div
                                                        className="flex items-center justify-center gap-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={() => handleRowClick(brand)}
                                                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/platform/tenants/${brand.id}/impersonate`)}
                                                            className="p-2.5 bg-amber-50 text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded-xl transition-all border border-amber-100"
                                                        >
                                                            <LogIn size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setSuspendTarget(brand)}
                                                            className={cn(
                                                                "p-2.5 rounded-xl transition-all border",
                                                                brand.status === 'Suspended'
                                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                                    : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                                                            )}
                                                        >
                                                            <ShieldBan size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Pagination ───────────────────────────────── */}
                            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Records
                                        </span>
                                        <select
                                            id="pagination-rows"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="bg-white border-2 border-slate-100 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 outline-none focus:border-slate-900 transition-all cursor-pointer"
                                        >
                                            {[5, 10, 25, 50].map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        Showing <span className="text-slate-900">{Math.min(startIndex + 1, filteredBrands.length)}</span> to <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, filteredBrands.length)}</span> of <span className="text-slate-900">{filteredBrands.length}</span> tenants
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {buildPageNumbers(currentPage, totalPages).map((item, idx) =>
                                            item === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="px-2 text-slate-300 text-xs font-black">...</span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    onClick={() => setCurrentPage(item as number)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl text-xs font-black transition-all border-2",
                                                        currentPage === item
                                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                                                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600"
                                                    )}
                                                >
                                                    {item}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Suspend Confirmation Modal ───────────────────────────────── */}
            {suspendTarget && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 flex flex-col items-center text-center">
                            <div
                                className={cn(
                                    "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl",
                                    suspendTarget.status === 'Operational' ? "bg-rose-100 text-rose-600 shadow-rose-100" : "bg-emerald-100 text-emerald-600 shadow-emerald-100"
                                )}
                            >
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {suspendTarget.status === 'Operational' ? 'Suspend Tenant Operations?' : 'Reactivate Tenant?'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-2 px-4">
                                {suspendTarget.status === 'Operational'
                                    ? `This will halt all store operations and POS access for ${suspendTarget.brandName}.`
                                    : `This will restore platform access and store operations for ${suspendTarget.brandName}.`}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-8 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSuspendTarget(null)}
                                className="px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspendConfirm}
                                className={cn(
                                    "px-6 py-4 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95",
                                    suspendTarget.status === 'Operational'
                                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                )}
                            >
                                {suspendTarget.status === 'Operational' ? 'Yes, Suspend' : 'Yes, Reactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TenantStatus }) {
    const config = TENANT_STATUS_CONFIG[status] || TENANT_STATUS_CONFIG.Draft;

    return (
        <span
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all',
                config.bgColor, config.color, config.borderColor
            )}
        >
            <div className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status === 'Operational' ? 'bg-emerald-500 animate-pulse' : 'bg-current')} />
            {config.label}
        </span>
    );
}

function FilterSelect({
    id,
    value,
    onChange,
    options,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="relative">
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-3 pr-8 py-2 bg-slate-50 border-2 border-slate-50 rounded-xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none appearance-none min-w-[150px]"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    );
}

function buildPageNumbers(
    current: number,
    total: number,
): (number | '...')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
    ) {
        pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}

