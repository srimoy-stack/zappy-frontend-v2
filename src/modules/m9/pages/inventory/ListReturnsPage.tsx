'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
;
import {
    ArrowLeft,
    Search,
    Filter,
    Plus,
    Eye,
    RotateCcw,
    Calendar
} from 'lucide-react';
import { ReturnType } from '../../types/inventory';
import { mockInventoryReturns } from '../../mock/inventory';

/**
 * List Returns Page
 * View returns, wastage, and adjustments
 * 
 * Return Types:
 * - Supplier Return
 * - Damaged
 * - Expired
 * - Adjustment
 * 
 * Rules:
 * - Cannot exceed received quantity
 * - Partial returns allowed
 * - Stock reduced immediately
 * - Ledger entry created
 */
export const ListReturnsPage: React.FC = () => {
    const router = useRouter();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReturnType, setSelectedReturnType] = useState<ReturnType | ''>('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filter returns
    const filteredReturns = mockInventoryReturns.filter(ret => {
        if (searchQuery && !ret.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedReturnType && ret.returnType !== selectedReturnType) return false;
        if (dateFrom && new Date(ret.returnDate) < new Date(dateFrom)) return false;
        if (dateTo && new Date(ret.returnDate) > new Date(dateTo)) return false;
        return true;
    });

    // Stats
    const totalReturns = mockInventoryReturns.length;
    const totalAmount = mockInventoryReturns.reduce((sum, r) => sum + r.totalAmount, 0);

    // Return type badge color
    const getReturnTypeColor = (type: ReturnType) => {
        switch (type) {
            case 'Supplier Return': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Damaged': return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'Expired': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Adjustment': return 'bg-violet-50 text-violet-600 border-violet-200';
        }
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Returns</h1>
                    <p className="text-sm text-slate-500 font-medium">View returns, wastage, and adjustments</p>
                </div>
                <button
                    onClick={() => router.push('/backoffice/inventory/returns/create')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                >
                    <Plus size={16} strokeWidth={3} />
                    Create Return
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-3xl border border-rose-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-200">
                            <RotateCcw size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Total Returns</span>
                    </div>
                    <div className="text-3xl font-black text-rose-900 tracking-tight">
                        {totalReturns}
                    </div>
                    <div className="text-xs text-rose-600 font-bold mt-1">
                        All Time
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-3xl border border-amber-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-600 rounded-2xl shadow-lg shadow-amber-200">
                            <RotateCcw size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Total Amount</span>
                    </div>
                    <div className="text-3xl font-black text-amber-900 tracking-tight">
                        ${totalAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-amber-600 font-bold mt-1">
                        Return Value
                    </div>
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
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:border-rose-600 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showFilters
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                    >
                        <Filter size={14} />
                        Filters
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Return Type
                            </label>
                            <select
                                value={selectedReturnType}
                                onChange={(e) => setSelectedReturnType(e.target.value as ReturnType | '')}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-600"
                            >
                                <option value="">All Types</option>
                                <option value="Supplier Return">Supplier Return</option>
                                <option value="Damaged">Damaged</option>
                                <option value="Expired">Expired</option>
                                <option value="Adjustment">Adjustment</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-600"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-600"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 font-medium">
                    Showing <span className="font-black text-slate-900">{filteredReturns.length}</span> returns
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference No</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Return Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created By</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredReturns.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Calendar size={32} className="text-slate-300" />
                                            <p className="text-sm text-slate-400 font-medium">No returns found. Try adjusting your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredReturns.map((ret) => (
                                    <tr key={ret.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {new Date(ret.returnDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-rose-600">{ret.referenceNo}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {ret.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getReturnTypeColor(ret.returnType)}`}>
                                                {ret.returnType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                                            {ret.supplierName || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{ret.storeName}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-black text-rose-600 tabular-nums">
                                                ${ret.totalAmount.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 font-medium max-w-xs truncate">
                                                {ret.reason || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-600">{ret.createdByName}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">
                                                {new Date(ret.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => router.push(`/backoffice/inventory/returns/${ret.id}`)}
                                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
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
