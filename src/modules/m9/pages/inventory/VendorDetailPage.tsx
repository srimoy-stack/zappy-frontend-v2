'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Edit3,
    Users
} from 'lucide-react';
import { Vendor, InventoryEntry, InventoryReturn } from '../../types/inventory';
import { vendorService, returnService } from '../../services/inventoryService';

/**
 * Vendor Detail Page
 * 
 * View supplier details, transaction history, and returns.
 */
export const VendorDetailPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [entries, setEntries] = useState<InventoryEntry[]>([]);
    const [returns, setReturns] = useState<InventoryReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'returns'>('overview');

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const [vData, eData, rData] = await Promise.all([
                    vendorService.getById(id),
                    vendorService.getVendorEntries(id),
                    returnService.getAll({ supplierId: id })
                ]);
                setVendor(vData);
                setEntries(eData);
                setReturns(rData);
            } catch (error) {
                console.error('Failed to load vendor data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Users className="w-12 h-12 text-slate-400 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading vendor details...</p>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-slate-600 font-medium">Vendor not found</p>
                    <button
                        onClick={() => router.push('/backoffice/inventory/vendors')}
                        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold"
                    >
                        Back to Vendors
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.push('/backoffice/inventory/vendors')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{vendor.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${vendor.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}>
                            {vendor.status}
                        </span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">ID: {vendor.id}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/backoffice/inventory/vendors/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                        <Edit3 size={14} />
                        Edit
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-3 text-sm font-bold rounded-t-xl transition-all ${activeTab === 'overview'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-4 py-3 text-sm font-bold rounded-t-xl transition-all ${activeTab === 'transactions'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                >
                    Transactions ({entries.length})
                </button>
                <button
                    onClick={() => setActiveTab('returns')}
                    className={`px-4 py-3 text-sm font-bold rounded-t-xl transition-all ${activeTab === 'returns'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                >
                    Returns ({returns.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Purchases</div>
                                <div className="text-3xl font-black text-slate-900 tabular-nums">
                                    ${vendor.totalPurchases.toFixed(2)}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount Paid</div>
                                <div className="text-3xl font-black text-emerald-600 tabular-nums">
                                    ${vendor.totalPaid.toFixed(2)}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Outstanding Balance</div>
                                <div className="text-3xl font-black text-rose-600 tabular-nums">
                                    ${vendor.totalDue.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Vendor Info */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {vendor.contactPerson && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl">
                                            <Users size={20} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Person</label>
                                            <div className="text-sm font-bold text-slate-900">{vendor.contactPerson}</div>
                                        </div>
                                    </div>
                                )}
                                {vendor.phone && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl">
                                            <Phone size={20} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                                            <div className="text-sm font-bold text-slate-900">{vendor.phone}</div>
                                        </div>
                                    </div>
                                )}
                                {vendor.email && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl">
                                            <Mail size={20} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                                            <div className="text-sm font-bold text-slate-900">{vendor.email}</div>
                                        </div>
                                    </div>
                                )}
                                {vendor.address && (
                                    <div className="flex items-start gap-4 md:col-span-2">
                                        <div className="p-3 bg-slate-50 rounded-2xl">
                                            <MapPin size={20} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</label>
                                            <div className="text-sm font-bold text-slate-900 max-w-md">{vendor.address}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'transactions' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference No</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Paid</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {entries.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        entries.map(entry => (
                                            <tr
                                                key={entry.id}
                                                className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                                                onClick={() => router.push(`/backoffice/inventory/entries/${entry.id}`)}
                                            >
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                    {new Date(entry.inventoryDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-blue-600">{entry.referenceNo}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{entry.inventoryStatus}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 tabular-nums">
                                                    ${entry.grandTotal.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600 tabular-nums">
                                                    ${(entry.grandTotal - entry.paymentDue).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-rose-600 tabular-nums">
                                                    ${entry.paymentDue.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'returns' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Vendor Returns</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference No</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {returns.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">
                                                No returns recorded for this vendor.
                                            </td>
                                        </tr>
                                    ) : (
                                        returns.map(ret => (
                                            <tr
                                                key={ret.id}
                                                className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                                                onClick={() => router.push(`/backoffice/inventory/returns/${ret.id}`)}
                                            >
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                    {new Date(ret.returnDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-rose-600">{ret.referenceNo}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{ret.returnType}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 tabular-nums">
                                                    ${ret.totalAmount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {ret.reason || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
