'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomersTable } from '../components/Customers';
import { Customer, CustomerFilters, ColumnVisibilitySettings } from '../types/customers';
import { mockCustomers } from '../mock/customers';
import {
    Search,
    Filter,
    Download,
    Columns3,
    FileSpreadsheet,
    FileText,
    Printer,
    X,
    Plus
} from 'lucide-react';

import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';

export const CustomersPage: React.FC = () => {
    const router = useRouter();
    const { userType, isSuperAdmin } = useRouteAccess();

    const canAdd = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN || userType === UserType.MANAGER;

    // -- State --
    const [data, setData] = useState<Customer[]>([]);
    const [filteredData, setFilteredData] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<CustomerFilters>({
        searchQuery: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // -- Pagination State --
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Default visibility matching the screenshot mostly
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilitySettings>({
        action: true,
        contactId: true,
        businessName: true,
        name: true,
        email: true,
        taxNumber: true,
        creditLimit: true,
        payTerm: true,
        openingBalance: true,
        advanceBalance: true,
        addedOn: true,
        group: true,
        address: true,
        mobile: true,
        totalSaleDue: true,
        totalSellReturnDue: true,
        status: true,
    });

    // -- Data Fetching (Mock) --
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                setData(mockCustomers);
                setFilteredData(mockCustomers);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // -- Filtering --
    useEffect(() => {
        let result = [...data];

        // Search filter
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.mobile.includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.contactId.toLowerCase().includes(q) ||
                c.businessName?.toLowerCase().includes(q)
            );
        }

        // Date range filter
        if (filters.startDate && filters.endDate) {
            result = result.filter(c => {
                const addedDate = new Date(c.addedOn);
                const start = new Date(filters.startDate!);
                const end = new Date(filters.endDate!);
                return addedDate >= start && addedDate <= end;
            });
        }

        setFilteredData(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [filters, data]);

    // -- Pagination Logic --
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleRowClick = (customer: Customer) => {
        router.push(`/backoffice/customers/${customer.id}`);
    };

    const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
        console.log(`Exporting ${filteredData.length} customers as ${format.toUpperCase()}`);

        const exportData = filteredData.map(c => ({
            'Contact ID': c.contactId,
            'Business Name': c.businessName,
            'Name': c.name,
            'Email': c.email || 'N/A',
            'Added On': c.addedOn,
            'Mobile': c.mobile,
            'Total Sale Due': c.totalSaleDue,
            'Status': c.status
        }));

        alert(`Export initiated: ${format.toUpperCase()}\n\nExporting ${exportData.length} customers\n\n(In production, this would download a ${format.toUpperCase()} file)`);
    };

    const handlePrint = () => {
        window.print();
    };

    const toggleColumn = (column: keyof ColumnVisibilitySettings) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    const clearFilters = () => {
        setFilters({
            searchQuery: '',
            startDate: undefined,
            endDate: undefined
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 w-full overflow-hidden">
            <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Customers
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Manage your customers, contacts and their financial history.
                        </p>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Top Controls Bar */}
                    <div className="p-4 bg-white border-b border-slate-200">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            {/* Left: Search */}
                            <div className="relative flex-1 max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, mobile, email, or contact ID..."
                                    value={filters.searchQuery}
                                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                {filters.searchQuery && (
                                    <button
                                        onClick={clearFilters}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
                                    >
                                        <X className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                {canAdd && (
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                    >
                                        <Plus className="w-4 h-4 text-white" />
                                        Add Customer
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${showFilters
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </button>

                                <button
                                    onClick={() => setShowColumnSettings(!showColumnSettings)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${showColumnSettings
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <Columns3 className="w-4 h-4" />
                                    Columns
                                </button>

                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50">
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <div className="p-1">
                                            <button onClick={() => handleExport('csv')} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left rounded-lg">
                                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
                                            </button>
                                            <button onClick={() => handleExport('excel')} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left rounded-lg">
                                                <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export Excel
                                            </button>
                                            <button onClick={() => handleExport('pdf')} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left rounded-lg">
                                                <FileText className="w-4 h-4 text-red-600" /> Export PDF
                                            </button>
                                            <button onClick={handlePrint} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left rounded-lg">
                                                <Printer className="w-4 h-4 text-slate-600" /> Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column Settings */}
                    {showColumnSettings && (
                        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {Object.entries(columnVisibility).map(([key, value]) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => toggleColumn(key as keyof ColumnVisibilitySettings)}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                    />
                                    <span className="text-xs font-semibold text-slate-700 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Date Added (From)</label>
                                    <input
                                        type="date"
                                        value={filters.startDate || ''}
                                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Date Added (To)</label>
                                    <input
                                        type="date"
                                        value={filters.endDate || ''}
                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Bar */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                            Total Records: <span className="text-slate-900">{filteredData.length}</span>
                        </span>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                            <span className="text-xs text-slate-500 font-medium tracking-tight">Loading customer database...</span>
                        </div>
                    ) : (
                        <>
                            <CustomersTable
                                data={paginatedData}
                                onRowClick={handleRowClick}
                                columnVisibility={columnVisibility}
                            />

                            {/* Pagination Controls */}
                            <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rows per page</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {[10, 25, 50, 100].map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        Showing <span className="text-slate-900">{Math.min(startIndex + 1, filteredData.length)}</span> to <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-slate-900">{filteredData.length}</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Show first, last, and pages around current
                                            if (
                                                pageNum === 1 ||
                                                pageNum === totalPages ||
                                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                pageNum === currentPage - 2 ||
                                                pageNum === currentPage + 2
                                            ) {
                                                return <span key={pageNum} className="text-slate-400">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Add Customer Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Add New Customer</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Business Name</label>
                                        <input type="text" placeholder="e.g. Acme Corp" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Contact Name</label>
                                        <input type="text" placeholder="e.g. John Doe" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                                        <input type="email" placeholder="john@example.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mobile Number</label>
                                        <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Tax Number</label>
                                        <input type="text" placeholder="HST-XXXX" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Group</label>
                                        <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                            <option value="">Select Group</option>
                                            <option value="Regular">Regular</option>
                                            <option value="Wholesale">Wholesale</option>
                                            <option value="VIP">VIP</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Address</label>
                                        <textarea rows={2} placeholder="Enter full address..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Customer added successfully! (Mock)');
                                        setShowAddModal(false);
                                    }}
                                    className="px-6 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg active:scale-95"
                                >
                                    Create Customer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

