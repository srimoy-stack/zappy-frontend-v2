'use client';

import React, { useState, useEffect } from 'react';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';
import {
    ActivityActionBar,
    ActivityFilterPanel,
    ActivityTable,
    TransactionDetailModal,
    AddActivityModal
} from '@/modules/m9/components/SalesActivity';
import { TransactionEvent, ActivityFilters } from '../types/sales-activity';
import { History } from 'lucide-react';

/**
 * SalesActivityPage (M9-T2)
 * Chronological Operational Ledger / System-of-Record
 * Enhanced to match Functional Overview (PDF)
 */
export const SalesActivityPage: React.FC = () => {
    const { userType, isSuperAdmin, user } = useRouteAccess();

    // -- State --
    const [data, setData] = useState<TransactionEvent[]>([]);
    const [filteredData, setFilteredData] = useState<TransactionEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionEvent | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Mandatory Date Range
    const [filters, setFilters] = useState<ActivityFilters>({
        refundsOnly: false,
        startDate: new Date().toISOString().split('T')[0] || null,
        endDate: new Date().toISOString().split('T')[0] || null,
        channel: [],
        searchQuery: ''
    });

    // -- Mock Data Generation --
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 800));

                const mockEvents: TransactionEvent[] = [
                    {
                        id: 'TX-1001',
                        timestamp: '2023-11-18T16:27:00Z',
                        type: 'ORDER_PAID',
                        invoiceNo: 'S4721',
                        customerName: 'parveen singh',
                        contactNumber: '112233',
                        channel: 'ONLINE',
                        location: 'BRAMPTON - NORTH PARK - 2530 N Park Dr, Brampton, ON',
                        storeId: 'store-01',
                        userName: 'System',
                        userId: 'sys-01',
                        paymentStatus: 'Paid',
                        paymentMethod: 'Cash',
                        totalAmount: 52.97,
                        basePrice: 53.00,
                        tax: 5.00,
                        netPrice: 54.00,
                        sellPrice: 5.86,
                        returnAmount: 0,
                        shipping: 1,
                        netDue: 1,
                        totalItems: 11,
                        currency: 'USD',
                        status: 'completed'
                    },
                    {
                        id: 'TX-1002',
                        timestamp: '2023-11-18T16:22:00Z',
                        type: 'REFUND',
                        invoiceNo: '5470',
                        customerName: 'jasbir',
                        contactNumber: '112233',
                        channel: 'UBER',
                        location: 'BRAMPTON - NORTH PARK - 2530 N Park Dr, Brampton, ON',
                        storeId: 'store-01',
                        userName: 'Manager1',
                        userId: 'mgr-01',
                        paymentStatus: 'Refunded',
                        paymentMethod: 'Cash',
                        totalAmount: 28.32,
                        basePrice: 28.32,
                        tax: 2.00,
                        netPrice: 31.77,
                        sellPrice: 11.23,
                        returnAmount: 28.32,
                        shipping: 1,
                        netDue: 0,
                        totalItems: 1.0,
                        currency: 'USD',
                        originalTransactionId: 'TX-1001',
                        status: 'completed'
                    },
                    {
                        id: 'TX-1003',
                        timestamp: new Date().toISOString(),
                        type: 'ORDER_PAID',
                        invoiceNo: 'S4723',
                        customerName: 'John Doe',
                        contactNumber: '998877',
                        channel: 'POS',
                        location: 'WAREHOUSE OPS - 100 Main St, Warehouse City',
                        storeId: 'store-02',
                        userName: 'Mark Smith',
                        userId: 'user-2',
                        paymentStatus: 'Partial',
                        paymentMethod: 'Card',
                        totalAmount: 125.50,
                        basePrice: 110.00,
                        tax: 15.50,
                        netPrice: 125.50,
                        sellPrice: 125.50,
                        returnAmount: 0,
                        shipping: 0,
                        netDue: 50.00,
                        totalItems: 4,
                        currency: 'USD',
                        status: 'completed'
                    }
                ];

                // Filter based on userType scope (Mock)
                let scopedData = mockEvents;
                if (userType === UserType.POS_USER && user) {
                    scopedData = mockEvents.filter(e => e.userId === user.id);
                } else if (userType === UserType.MANAGER && user) {
                    scopedData = mockEvents.filter(e => user.storeIds?.includes(e.storeId));
                }

                setData(scopedData);
                setFilteredData(scopedData);
            } catch (err) {
                console.error('Ledger fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userType, user]);

    // -- Side Effects: Filtering --
    useEffect(() => {
        let result = [...data];

        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(e =>
                e.invoiceNo.toLowerCase().includes(q) ||
                e.customerName.toLowerCase().includes(q) ||
                e.id.toLowerCase().includes(q)
            );
        }

        if (filters.paymentStatus && filters.paymentStatus.length > 0) {
            result = result.filter(e => filters.paymentStatus?.includes(e.paymentStatus));
        }

        if (filters.channel && filters.channel.length > 0) {
            result = result.filter(e => filters.channel?.includes(e.channel));
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [filters, data]);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExport = (format: string) => {
        console.log(`Exporting as ${format}...`);
    };

    const handleAddActivity = (newActivity: Partial<TransactionEvent>) => {
        const activity = {
            ...newActivity,
            location: 'Flagship Store - 123 Main St, New York, NY', // Default mock location
            storeId: 'store-01',
            status: 'completed' as const,
        } as TransactionEvent;

        setData(prev => [activity, ...prev]);
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-2 lg:px-4 space-y-6">
            {/* Page Header (Optional, sometimes integrated into Action Bar) */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2 bg-slate-900 rounded-lg shadow-lg">
                    <History className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales Activities</h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-80">Functional System of Record</p>
                </div>
            </div>

            {/* Filter Panel (Functional Overview Style) */}
            <ActivityFilterPanel
                filters={filters}
                onFilterChange={setFilters}
                onClear={() => setFilters({
                    refundsOnly: false,
                    startDate: new Date().toISOString().split('T')[0] || null,
                    endDate: new Date().toISOString().split('T')[0] || null,
                    channel: []
                })}
            />

            <div className="space-y-4">
                {/* Action Bar (Mockup Style) */}
                <ActivityActionBar
                    onSearch={(q: string) => setFilters({ ...filters, searchQuery: q })}
                    onExport={handleExport}
                    onAdd={() => setIsAddModalOpen(true)}
                />

                {/* Ledger Table (Detailed/Horizontal Scroll) */}
                <ActivityTable
                    data={paginatedData}
                    isLoading={isLoading}
                    onRowClick={setSelectedTransaction}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredData.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            {/* Transaction Audit Modal */}
            <TransactionDetailModal
                transaction={selectedTransaction}
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
            />

            {/* Add Activity Modal */}
            <AddActivityModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddActivity}
            />
        </div>
    );
};
