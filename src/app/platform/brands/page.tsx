'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Plus,
    ChevronDown,
    Eye,
    Pencil,
    ShieldBan,
    X,
    AlertTriangle,
    Building2,
    ChevronLeft,
    ChevronRight,
    LogIn,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────

type BrandStatus = 'Active' | 'Suspended';

interface Brand {
    id: string;
    brandName: string;
    tradeName: string;
    status: BrandStatus;
    totalStores: number;
    primaryContact: string;
    modulesPurchasedCount: number;
    createdDate: string;      // ISO date string
    province?: string;
}

interface AuditEvent {
    type: string;
    brandId: string;
    brandName: string;
    timestamp: string;
    actor: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_BRANDS: Brand[] = [
    {
        id: 'brand-001',
        brandName: 'Acme Pizza Co.',
        tradeName: 'Acme Pizza',
        status: 'Active',
        totalStores: 12,
        primaryContact: 'john@acmepizza.com',
        modulesPurchasedCount: 5,
        createdDate: '2025-06-15',
        province: 'Ontario',
    },
    {
        id: 'brand-002',
        brandName: 'QuickBite Foods Ltd.',
        tradeName: 'QuickBite',
        status: 'Active',
        totalStores: 8,
        primaryContact: 'sarah@quickbite.ca',
        modulesPurchasedCount: 3,
        createdDate: '2025-08-22',
        province: 'British Columbia',
    },
    {
        id: 'brand-003',
        brandName: 'Burger Nation Inc.',
        tradeName: 'Burger Nation',
        status: 'Suspended',
        totalStores: 3,
        primaryContact: 'admin@burgernation.ca',
        modulesPurchasedCount: 2,
        createdDate: '2025-03-04',
        province: 'Alberta',
    },
    {
        id: 'brand-004',
        brandName: 'Sushi Express Holdings',
        tradeName: 'Sushi Express',
        status: 'Active',
        totalStores: 22,
        primaryContact: 'ops@sushiexpress.com',
        modulesPurchasedCount: 7,
        createdDate: '2024-11-10',
        province: 'Ontario',
    },
    {
        id: 'brand-005',
        brandName: 'Taco Loco Restaurants',
        tradeName: 'Taco Loco',
        status: 'Active',
        totalStores: 5,
        primaryContact: 'hello@tacoloco.ca',
        modulesPurchasedCount: 4,
        createdDate: '2025-01-19',
        province: 'Quebec',
    },
    {
        id: 'brand-006',
        brandName: 'Noodle House Asia',
        tradeName: 'Noodle House',
        status: 'Active',
        totalStores: 15,
        primaryContact: 'manager@noodlehouse.ca',
        modulesPurchasedCount: 6,
        createdDate: '2024-09-01',
        province: 'British Columbia',
    },
    {
        id: 'brand-007',
        brandName: 'Café Bonheur Inc.',
        tradeName: 'Café Bonheur',
        status: 'Active',
        totalStores: 2,
        primaryContact: 'info@cafebonheur.ca',
        modulesPurchasedCount: 2,
        createdDate: '2025-10-30',
        province: 'Quebec',
    },
    {
        id: 'brand-008',
        brandName: 'Prairie Grills Ltd.',
        tradeName: 'Prairie Grills',
        status: 'Suspended',
        totalStores: 1,
        primaryContact: 'contact@prairiegrills.ca',
        modulesPurchasedCount: 1,
        createdDate: '2025-05-12',
        province: 'Manitoba',
    },
    {
        id: 'brand-009',
        brandName: 'Harvest Bowl Co.',
        tradeName: 'Harvest Bowl',
        status: 'Active',
        totalStores: 9,
        primaryContact: 'team@harvestbowl.com',
        modulesPurchasedCount: 4,
        createdDate: '2025-02-28',
        province: 'Ontario',
    },
    {
        id: 'brand-010',
        brandName: 'Flame & Grill Steakhouse',
        tradeName: 'Flame & Grill',
        status: 'Active',
        totalStores: 6,
        primaryContact: 'ops@flamegrill.ca',
        modulesPurchasedCount: 5,
        createdDate: '2025-07-08',
        province: 'Alberta',
    },
    {
        id: 'brand-011',
        brandName: 'Coastal Catches Seafood',
        tradeName: 'Coastal Catches',
        status: 'Active',
        totalStores: 4,
        primaryContact: 'hello@coastalcatches.ca',
        modulesPurchasedCount: 3,
        createdDate: '2025-09-14',
        province: 'Nova Scotia',
    },
    {
        id: 'brand-012',
        brandName: 'Golden Wok Group',
        tradeName: 'Golden Wok',
        status: 'Suspended',
        totalStores: 0,
        primaryContact: 'admin@goldenwok.ca',
        modulesPurchasedCount: 1,
        createdDate: '2025-04-01',
        province: 'Ontario',
    },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

const auditLog: AuditEvent[] = [];

function logAuditEvent(event: AuditEvent) {
    auditLog.push(event);
    console.log('[AUDIT]', JSON.stringify(event));
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function BrandsPage() {
    const router = useRouter();

    // Data
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | BrandStatus>('all');
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
            router.push(`/platform/brands/${brand.id}`);
        },
        [router],
    );

    const handleSuspendConfirm = useCallback(() => {
        if (!suspendTarget) return;

        const newStatus: BrandStatus =
            suspendTarget.status === 'Active' ? 'Suspended' : 'Active';

        setBrands((prev) =>
            prev.map((b) =>
                b.id === suspendTarget.id ? { ...b, status: newStatus } : b,
            ),
        );

        logAuditEvent({
            type: newStatus === 'Suspended' ? 'BRAND_SUSPENDED' : 'BRAND_ACTIVATED',
            brandId: suspendTarget.id,
            brandName: suspendTarget.brandName,
            timestamp: new Date().toISOString(),
            actor: 'PLATFORM_SUPER_ADMIN',
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
            <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6 overflow-hidden">
                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Brands
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Manage all brands registered on the platform.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/platform/brands/onboarding')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Brand
                    </button>
                </div>

                {/* ── Controls & Table Card ────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Top Controls Bar */}
                    <div className="p-4 bg-white border-b border-slate-200">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="brands-search"
                                    type="text"
                                    placeholder="Search by brand name…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
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
                                    onChange={(v) => setStatusFilter(v as 'all' | BrandStatus)}
                                    options={[
                                        { value: 'all', label: 'All Statuses' },
                                        { value: 'Active', label: 'Active' },
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
                                        className="pl-3 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-600 min-w-[140px]"
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
                                        className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Bar */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                            Total Records:{' '}
                            <span className="text-slate-900">{filteredBrands.length}</span>
                        </span>
                    </div>

                    {/* ── Table / Loading / Empty ───────────────────────── */}
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
                            <span className="text-xs text-slate-500 font-medium tracking-tight">
                                Loading brands…
                            </span>
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <Building2 className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">
                                No brands found
                            </p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters or clearing them to see all brands.'
                                    : 'Click "Add Brand" to onboard your first brand.'}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[900px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/60">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Brand Name
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Trade Name
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                                Total Stores
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Primary Contact
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                                Modules Purchased
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Created Date
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedBrands.map((brand) => (
                                            <tr
                                                key={brand.id}
                                                onClick={() => handleRowClick(brand)}
                                                className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                                            >
                                                {/* Brand Name */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all border border-transparent group-hover:border-emerald-100 shadow-sm">
                                                            <Building2 className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                                                                {brand.brandName}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                ID: {brand.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Trade Name */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {brand.tradeName}
                                                        </span>
                                                        {brand.province && (
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                {brand.province}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={brand.status} />
                                                </td>

                                                {/* Total Stores */}
                                                <td className="px-6 py-3.5 text-sm font-semibold text-slate-900 text-right tabular-nums">
                                                    {brand.totalStores}
                                                </td>

                                                {/* Primary Contact */}
                                                <td className="px-6 py-3.5 text-sm text-slate-600 truncate max-w-[200px]">
                                                    {brand.primaryContact}
                                                </td>

                                                {/* Modules Purchased Count */}
                                                <td className="px-6 py-3.5 text-sm font-semibold text-slate-900 text-right tabular-nums">
                                                    {brand.modulesPurchasedCount}
                                                </td>

                                                {/* Created Date */}
                                                <td className="px-6 py-3.5 text-sm text-slate-500 tabular-nums">
                                                    {formatDate(brand.createdDate)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-3.5">
                                                    <div
                                                        className="flex items-center justify-center gap-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={() => handleRowClick(brand)}
                                                            title="View Brand"
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                router.push(
                                                                    `/platform/brands/${brand.id}?edit=true`,
                                                                )
                                                            }
                                                            title="Edit Brand"
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setSuspendTarget(brand)}
                                                            title={
                                                                brand.status === 'Active'
                                                                    ? 'Suspend Brand'
                                                                    : 'Activate Brand'
                                                            }
                                                            className={`p-1.5 rounded-lg transition-all ${brand.status === 'Active'
                                                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                                }`}
                                                        >
                                                            <ShieldBan className="w-4 h-4" />
                                                        </button>
                                                        {/* ── Access Brand Admin (Impersonation) ── */}
                                                        <button
                                                            id={`access-brand-admin-${brand.id}`}
                                                            onClick={() =>
                                                                router.push(`/platform/brands/${brand.id}/impersonate`)
                                                            }
                                                            title="Access Brand Admin"
                                                            className="
                                                                p-1.5 rounded-lg transition-all
                                                                text-slate-400 hover:text-amber-600 hover:bg-amber-50
                                                                border border-transparent hover:border-amber-100
                                                            "
                                                        >
                                                            <LogIn className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Pagination ───────────────────────────────── */}
                            <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            Rows per page
                                        </span>
                                        <select
                                            id="pagination-rows"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                        >
                                            {[5, 10, 25, 50].map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        Showing{' '}
                                        <span className="text-slate-900">
                                            {Math.min(startIndex + 1, filteredBrands.length)}
                                        </span>{' '}
                                        to{' '}
                                        <span className="text-slate-900">
                                            {Math.min(startIndex + itemsPerPage, filteredBrands.length)}
                                        </span>{' '}
                                        of{' '}
                                        <span className="text-slate-900">{filteredBrands.length}</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {buildPageNumbers(currentPage, totalPages).map((item, idx) =>
                                            item === '...' ? (
                                                <span
                                                    key={`ellipsis-${idx}`}
                                                    className="px-1 text-slate-400 text-xs"
                                                >
                                                    …
                                                </span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    onClick={() => setCurrentPage(item as number)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === item
                                                        ? 'bg-emerald-600 text-white shadow-md'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {item}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                                        }
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Suspend Confirmation Modal ───────────────────────────────── */}
            {suspendTarget && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center ${suspendTarget.status === 'Active'
                                        ? 'bg-red-100'
                                        : 'bg-emerald-100'
                                        }`}
                                >
                                    <AlertTriangle
                                        className={`w-5 h-5 ${suspendTarget.status === 'Active'
                                            ? 'text-red-600'
                                            : 'text-emerald-600'
                                            }`}
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {suspendTarget.status === 'Active'
                                        ? 'Suspend Brand'
                                        : 'Activate Brand'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSuspendTarget(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">
                                {suspendTarget.status === 'Active' ? (
                                    <>
                                        Are you sure you want to suspend{' '}
                                        <strong className="text-slate-900">
                                            {suspendTarget.brandName}
                                        </strong>
                                        ? All stores under this brand will be immediately
                                        deactivated and an audit event{' '}
                                        <code className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-xs font-mono">
                                            BRAND_SUSPENDED
                                        </code>{' '}
                                        will be logged.
                                    </>
                                ) : (
                                    <>
                                        Re-activate{' '}
                                        <strong className="text-slate-900">
                                            {suspendTarget.brandName}
                                        </strong>
                                        ? This will restore access and log an audit event{' '}
                                        <code className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-mono">
                                            BRAND_ACTIVATED
                                        </code>
                                        .
                                    </>
                                )}
                            </p>

                            {/* Brand summary */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Brand
                                    </span>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                                        {suspendTarget.brandName}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Stores
                                    </span>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                                        {suspendTarget.totalStores}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Contact
                                    </span>
                                    <p className="text-sm text-slate-600 mt-0.5">
                                        {suspendTarget.primaryContact}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Current Status
                                    </span>
                                    <div className="mt-0.5">
                                        <StatusBadge status={suspendTarget.status} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSuspendTarget(null)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspendConfirm}
                                className={`px-6 py-2 text-sm font-black text-white rounded-lg transition-all shadow-lg active:scale-95 ${suspendTarget.status === 'Active'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                {suspendTarget.status === 'Active'
                                    ? 'Confirm Suspend'
                                    : 'Confirm Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BrandStatus }) {
    const styles: Record<BrandStatus, string> = {
        Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Suspended: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles[status]}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
            />
            {status}
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
                className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-600 appearance-none min-w-[130px]"
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
