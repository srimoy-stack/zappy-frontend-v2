'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
;
import {
    ArrowLeft,
    Search,
    Plus,
    Eye,
    Edit3,
    Trash2,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp
} from 'lucide-react';
import { mockVendors } from '../../mock/inventory';
import { useRouteAccess } from '@/hooks/useRouteAccess';

/**
 * Vendors Page
 * Manage suppliers and vendor relationships
 * 
 * Role-based access:
 * - Admin: Full access (View, Add, Edit, Delete)
 * - Inventory Manager: View + Add
 * - Store Manager: View only
 */
export const VendorsPage: React.FC = () => {
    const router = useRouter();
    const { role } = useRouteAccess();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');

    // Permission checks
    const canAddVendor = role === 'ADMIN';
    const canEditVendor = role === 'ADMIN';
    const canDeleteVendor = role === 'ADMIN';

    // Filter vendors
    const filteredVendors = mockVendors.filter(vendor => {
        if (searchQuery && !vendor.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Stats
    const totalVendors = mockVendors.length;
    const totalPurchases = mockVendors.reduce((sum, v) => sum + v.totalPurchases, 0);
    const totalDue = mockVendors.reduce((sum, v) => sum + v.totalDue, 0);

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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vendors</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage suppliers and vendor relationships</p>
                </div>
                {canAddVendor && (
                    <button
                        onClick={() => router.push('/backoffice/inventory/vendors/create')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Vendor
                    </button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200">
                            <Users size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Total Vendors</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                        {totalVendors}
                    </div>
                    <div className="text-xs text-slate-600 font-bold mt-1">
                        Active Suppliers
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-3xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Total Purchases</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-900 tracking-tight">
                        ${totalPurchases.toFixed(2)}
                    </div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">
                        All Time
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-3xl border border-rose-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-200">
                            <DollarSign size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Total Due</span>
                    </div>
                    <div className="text-3xl font-black text-rose-900 tracking-tight">
                        ${totalDue.toFixed(2)}
                    </div>
                    <div className="text-xs text-rose-600 font-bold mt-1">
                        Outstanding Payments
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vendors by name..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:border-slate-900 transition-all"
                    />
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 font-medium">
                    Showing <span className="font-black text-slate-900">{filteredVendors.length}</span> vendors
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Purchases</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Paid</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Due</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Inventory Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users size={32} className="text-slate-300" />
                                            <p className="text-sm text-slate-400 font-medium">No vendors found. Add your first vendor to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-xl">
                                                    <Users size={16} className="text-slate-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900">{vendor.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {vendor.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-900">{vendor.contactPerson || '-'}</div>
                                            <div className="text-xs text-slate-500 font-medium">{vendor.phone || '-'}</div>
                                            <div className="text-xs text-slate-500 font-medium">{vendor.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-black text-slate-900 tabular-nums">
                                                ${vendor.totalPurchases.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-black text-emerald-600 tabular-nums">
                                                ${vendor.totalPaid.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`text-sm font-black tabular-nums ${vendor.totalDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                ${vendor.totalDue.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-600">
                                                {vendor.lastInventoryDate
                                                    ? new Date(vendor.lastInventoryDate).toLocaleDateString()
                                                    : '-'
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => router.push(`/backoffice/inventory/vendors/${vendor.id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="View Vendor"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/backoffice/inventory/add?vendor=${vendor.id}`)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                    title="Add Inventory"
                                                >
                                                    <ShoppingCart size={16} />
                                                </button>
                                                {canEditVendor && (
                                                    <button
                                                        onClick={() => router.push(`/backoffice/inventory/vendors/${vendor.id}/edit`)}
                                                        className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                                                        title="Edit Vendor"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                )}
                                                {canDeleteVendor && (
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                                        title="Delete Vendor"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
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
