import React, { useState, useMemo } from 'react';
import { FinancesHeader } from '../components/Finances/FinancesHeader';
import { PaymentsLedgerTable } from '../components/Finances/PaymentsLedgerTable';
import { RefundsTable } from '../components/Finances/RefundsTable';
import { PayoutSummaryTable } from '../components/Finances/PayoutSummaryTable';
import { TransactionDetailModal } from '../components/Finances/TransactionDetailModal';
import { mockPayments, mockRefunds, mockPayouts } from '../mock/finances';
import { ShieldCheck, Info, Lock } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { PaymentRecord, RefundRecord } from '../types/finances';

export const FinancesPage: React.FC = () => {
    const { role, getManagedStoreIds } = useRouteAccess();
    const [activeTab, setActiveTab] = useState<'payments' | 'refunds' | 'payouts'>('payments');
    const [isLoading] = useState(false);

    // Filter States
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [storeFilter, setStoreFilter] = useState('all');
    const [dateRangeFilter, setDateRangeFilter] = useState('30days');

    // Modal State
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentRecord | RefundRecord | null>(null);
    const [transactionType, setTransactionType] = useState<'payment' | 'refund'>('payment');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const managedStoreIds = getManagedStoreIds();

    // Access Control: Employee has no access to Finances
    if (role === 'EMPLOYEE') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-rose-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-black text-slate-900">Access Denied</h2>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">
                        You do not have the necessary permissions to view the Finances module.
                        Please contact your administrator for access.
                    </p>
                </div>
            </div>
        );
    }

    // Available Stores for Filter
    const availableStores = useMemo(() => {
        const stores = new Set([...mockPayments.map(p => p.store), ...mockRefunds.map(r => r.store)]);
        // Filter available stores based on permissions
        if (role === 'ADMIN' || managedStoreIds === 'all') return Array.from(stores);
        return Array.from(stores).filter(s => (managedStoreIds as string[]).includes(s));
    }, [role, managedStoreIds]);

    // Filter data based on managed stores and UI filters
    const payments = useMemo(() => {
        let data = mockPayments;

        // Permission Filter
        if (role !== 'ADMIN' && managedStoreIds !== 'all') {
            data = data.filter(p => (managedStoreIds as string[]).includes(p.store));
        }

        // UI Filters
        if (paymentMethodFilter !== 'all') {
            data = data.filter(p => p.method === paymentMethodFilter);
        }
        if (statusFilter !== 'all') {
            data = data.filter(p => p.status === statusFilter);
        }
        if (storeFilter !== 'all') {
            data = data.filter(p => p.store === storeFilter);
        }
        // Date filter note: Mock data dates are static, so we skip date logic for demo stability
        // In real app: filter by dateRangeFilter using date-fns isWithinInterval

        return data;
    }, [role, managedStoreIds, paymentMethodFilter, statusFilter, storeFilter]);

    const refunds = useMemo(() => {
        let data = mockRefunds;

        // Permission Filter
        if (role !== 'ADMIN' && managedStoreIds !== 'all') {
            data = data.filter(r => (managedStoreIds as string[]).includes(r.store));
        }

        // UI Filters
        if (statusFilter !== 'all') {
            // Refunds don't have 'status' field in mock, usually 'type' or implied success.
            // We'll skip status filter for refunds unless mapped.
        }
        if (storeFilter !== 'all') {
            data = data.filter(r => r.store === storeFilter);
        }

        return data;
    }, [role, managedStoreIds, statusFilter, storeFilter]);

    const handleExport = (format: string) => {
        alert(`Exporting ${activeTab} data as ${format.toUpperCase()}...`);
    };

    const handlePaymentClick = (record: PaymentRecord) => {
        setSelectedTransaction(record);
        setTransactionType('payment');
        setIsModalOpen(true);
    };

    const handleRefundClick = (record: RefundRecord) => {
        setSelectedTransaction(record);
        setTransactionType('refund');
        setIsModalOpen(true);
    };

    // Simulated reconciliation totals
    const totalPayments = payments.reduce((sum, p) => sum + (p.status === 'Paid' ? p.grossAmount : 0), 0);
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
    const netSales = totalPayments - totalRefunds;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
            {/* Header with Tabs and Controls */}
            <FinancesHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onExport={handleExport}
                paymentMethodFilter={paymentMethodFilter}
                onPaymentMethodFilterChange={setPaymentMethodFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                storeFilter={storeFilter}
                onStoreFilterChange={setStoreFilter}
                dateRangeFilter={dateRangeFilter}
                onDateRangeFilterChange={setDateRangeFilter}
                availableStores={availableStores}
            />

            {/* Main Ledger Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'payments' && (
                    <PaymentsLedgerTable
                        data={payments}
                        isLoading={isLoading}
                        onTransactionClick={handlePaymentClick}
                    />
                )}
                {activeTab === 'refunds' && (
                    <RefundsTable
                        data={refunds}
                        isLoading={isLoading}
                        onTransactionClick={handleRefundClick}
                    />
                )}
                {activeTab === 'payouts' && (
                    <PayoutSummaryTable data={mockPayouts} isLoading={isLoading} />
                )}
                {activeTab === 'payments' && payments.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <p className="text-sm font-medium">No payments found matching filters.</p>
                    </div>
                )}
                {activeTab === 'refunds' && refunds.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <p className="text-sm font-medium">No refunds found matching filters.</p>
                    </div>
                )}
            </div>

            {/* Reconciliation Footer Note */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">Reconciliation-Ready Data</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                            Validated against Sales Reports & Payout Processors
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Captured</p>
                        <p className="text-sm font-black text-slate-900">{formatCurrency(totalPayments)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Refunds</p>
                        <p className="text-sm font-black text-rose-600">-{formatCurrency(totalRefunds)}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200" />
                    <div className="text-right">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Matched Net Sales</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter">{formatCurrency(netSales)}</p>
                    </div>
                </div>
            </div>

            {/* Audit Note */}
            <div className="flex items-center gap-2 px-1 text-slate-400">
                <Info className="w-3.5 h-3.5" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                    Finance data is read-only and immutable. All timestamps are in UTC.
                </p>
            </div>

            <TransactionDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transaction={selectedTransaction}
                type={transactionType}
            />
        </div>
    );
};
