'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
;
import {
    ArrowLeft,
    Search,
    Filter,
    Eye,
    Printer,
    Edit3,
    Trash2,
    Tag,

    Calendar,
    Loader
} from 'lucide-react';
import { InventoryStatus, PaymentStatus, InventoryEntry, Vendor } from '../../types/inventory';
import { inventoryService, vendorService } from '../../services/inventoryService';

import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';

/**
 * Inventory Entries (Transactions) Page
 * View all stock inward transactions with filters
 * 
 * Mandatory: Date Range filter
 * Edit: Only if status = Draft/Ordered
 * Delete: Admin only, before stock is received
 */
export const InventoryEntriesPage: React.FC = () => {
    const router = useRouter();
    const { userType, isSuperAdmin } = useRouteAccess();

    // Data State
    const [entries, setEntries] = useState<InventoryEntry[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedEntryStatus, setSelectedEntryStatus] = useState<InventoryStatus | ''>('');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | ''>('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [entriesData, vendorsData] = await Promise.all([
                inventoryService.getEntries(),
                vendorService.getAll()
            ]);
            setEntries(entriesData);
            setVendors(vendorsData);
        } catch (error) {
            console.error('Failed to load inventory entries:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter entries
    const filteredEntries = entries.filter(entry => {
        if (searchQuery && !entry.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedStore && entry.storeId !== selectedStore) return false;
        if (selectedSupplier && entry.supplierId !== selectedSupplier) return false;
        if (selectedEntryStatus && entry.inventoryStatus !== selectedEntryStatus) return false;
        if (selectedPaymentStatus && entry.paymentStatus !== selectedPaymentStatus) return false;
        if (dateFrom && new Date(entry.inventoryDate) < new Date(dateFrom)) return false;
        if (dateTo && new Date(entry.inventoryDate) > new Date(dateTo)) return false;
        return true;
    });

    // Status badge color
    const getStatusColor = (status: InventoryStatus) => {
        switch (status) {
            case 'Received': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Partial': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Ordered': return 'bg-violet-50 text-violet-600 border-violet-200';
            case 'Draft': return 'bg-slate-50 text-slate-600 border-slate-200';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-200';
        }
    };

    const getPaymentStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Partial': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Unpaid': return 'bg-rose-50 text-rose-600 border-rose-200';
        }
    };

    // Can edit/delete
    const canEdit = (entry: InventoryEntry) => {
        return entry.inventoryStatus === 'Draft' || entry.inventoryStatus === 'Ordered';
    };

    const canDelete = (entry: InventoryEntry) => {
        // Admin only, before stock is received
        const isAdmin = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN;
        return isAdmin && entry.inventoryStatus !== 'Received' && entry.inventoryStatus !== 'Partial';
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.push('/backoffice/inventory')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Entries</h1>
                    <p className="text-sm text-slate-500 font-medium">View all stock inward transactions</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by reference number..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:border-emerald-600 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showFilters
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                    >
                        <Filter size={14} />
                        Filters
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Supplier
                            </label>
                            <select
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600"
                            >
                                <option value="">All Suppliers</option>
                                {vendors.map(vendor => (
                                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Entry Status
                            </label>
                            <select
                                value={selectedEntryStatus}
                                onChange={(e) => setSelectedEntryStatus(e.target.value as InventoryStatus | '')}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600"
                            >
                                <option value="">All Statuses</option>
                                <option value="Draft">Draft</option>
                                <option value="Ordered">Ordered</option>
                                <option value="Received">Received</option>
                                <option value="Partial">Partial</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Payment Status
                            </label>
                            <select
                                value={selectedPaymentStatus}
                                onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus | '')}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600"
                            >
                                <option value="">All Statuses</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Partial">Partial</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Date From <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Date To <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSelectedStore('');
                                    setSelectedSupplier('');
                                    setSelectedEntryStatus('');
                                    setSelectedPaymentStatus('');
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                                className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 font-medium">
                    Showing <span className="font-black text-slate-900">{filteredEntries.length}</span> entries
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference No</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Grand Total</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Payment Due</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Added By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Calendar size={32} className="text-slate-300" />
                                            <p className="text-sm text-slate-400 font-medium">No entries found. Try adjusting your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEntries.map((entry) => (
                                    <tr key={entry.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => router.push(`/backoffice/inventory/entries/${entry.id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                                    title="Print"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                {canEdit(entry) && (
                                                    <button
                                                        onClick={() => router.push(`/backoffice/inventory/entries/${entry.id}/edit`)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                )}
                                                {canDelete(entry) && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this entry?')) {
                                                                // inventoryService.delete(entry.id).then(loadEntries); // Mock call
                                                                alert('Delete functionality not connected to backend yet.');
                                                            }
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => alert('Label printing would start here')}
                                                    className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                                                    title="Labels"
                                                >
                                                    <Tag size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {new Date(entry.inventoryDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-emerald-600">{entry.referenceNo}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {entry.id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{entry.storeName}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{entry.supplierName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(entry.inventoryStatus)}`}>
                                                {entry.inventoryStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getPaymentStatusColor(entry.paymentStatus)}`}>
                                                {entry.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-black text-slate-900 tabular-nums">${entry.grandTotal.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`text-sm font-black tabular-nums ${entry.paymentDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                ${entry.paymentDue.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-600">{entry.createdByName}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">
                                                {new Date(entry.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
