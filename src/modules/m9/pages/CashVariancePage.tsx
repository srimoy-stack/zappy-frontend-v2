'use client';

import React, { useState, useEffect } from 'react';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { useRouter } from 'next/navigation';
;
import {
    CashVarianceTable,
    CashVarianceFilters as Filters,
    VarianceDetailDrawer,
    CashVarianceExportBar
} from '../components/CashVariance';
import { CashVarianceRecord, CashVarianceFilters } from '../types/cash-variance';
import { mockCashVarianceData } from '../mock/cash-variance';
import { Banknote, ShieldCheck } from 'lucide-react';

/**
 * M9-T7: Cash Variance (Reconciliation & Exceptions)
 * Financial control and audit screen.
 */
export const CashVariancePage: React.FC = () => {
    const { role, user } = useRouteAccess();
    const router = useRouter();

    // Role-Based Access Control (Strict)
    // EMPLOYEE: NO access - Direct URL access redirects away
    if (role === 'EMPLOYEE') {
        useEffect(() => { router.replace('/backoffice/home'); }, [router]); return null;
    }

    // -- State --
    const [data, setData] = useState<CashVarianceRecord[]>([]);
    const [filteredData, setFilteredData] = useState<CashVarianceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<CashVarianceRecord | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Mandatory Date Range Filters
    const [filters, setFilters] = useState<CashVarianceFilters>({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0] || null,
        endDate: new Date().toISOString().split('T')[0] || null,
        varianceOnly: false,
        searchQuery: ''
    });

    // -- Data Fetching (Mock) --
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                let scopedData = [...mockCashVarianceData];

                // Role restrictions (STORE_MANAGER: View ONLY own store)
                if (role === 'STORE_MANAGER' && user?.storeIds) {
                    scopedData = scopedData.filter(d => user.storeIds.includes(d.storeId));
                }

                setData(scopedData);
            } catch (error) {
                console.error('Failed to fetch cash variance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [role, user]);

    // -- Filtering Logic --
    useEffect(() => {
        let result = [...data];

        // Date Filter
        if (filters.startDate) {
            result = result.filter(d => d.date >= filters.startDate!);
        }
        if (filters.endDate) {
            result = result.filter(d => d.date <= filters.endDate!);
        }

        // Store Filter (Admin only)
        if (role === 'ADMIN' && filters.storeId) {
            result = result.filter(d => d.storeId === filters.storeId);
        }

        // Status Filter
        if (filters.status) {
            result = result.filter(d => d.status === filters.status);
        }

        // Variance Only toggle
        if (filters.varianceOnly) {
            result = result.filter(d => d.variance !== 0);
        }

        // Search Query
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(d =>
                d.userName.toLowerCase().includes(q) ||
                d.id.toLowerCase().includes(q)
            );
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [filters, data, role]);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRowClick = (record: CashVarianceRecord) => {
        setSelectedRecord(record);
        setIsDrawerOpen(true);
    };

    const handleExport = (format: string) => {
        console.log(`Exporting ${format} with current filters:`, filters);
        // In a real app, this would trigger a download with current query params
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                        <Banknote className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cash Variance</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                                <ShieldCheck className="w-3 h-3 text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audit Log</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">Physical reconciliation and exception tracking.</p>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            <Filters
                filters={filters}
                onFilterChange={setFilters}
                onClear={() => setFilters({
                    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0] || null,
                    endDate: new Date().toISOString().split('T')[0] || null,
                    varianceOnly: false,
                    searchQuery: ''
                })}
            />

            {/* Export Bar */}
            <CashVarianceExportBar
                onSearch={(q) => setFilters({ ...filters, searchQuery: q })}
                onExport={handleExport}
            />

            {/* Table */}
            <CashVarianceTable
                data={paginatedData}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredData.length}
                onPageChange={setCurrentPage}
            />

            {/* Read-Only Detail Drawer */}
            <VarianceDetailDrawer
                record={selectedRecord}
                isOpen={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedRecord(null);
                }}
            />

            {/* Footer Disclaimer */}
            <div className="pt-4 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Immutable Audit Trail • System of Record
            </div>
        </div>
    );
};
