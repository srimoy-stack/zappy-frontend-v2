'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import {
    ArrowLeft,
    Printer,
    Edit3,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { InventoryEntry, InventoryStatus, PaymentStatus } from '../../types/inventory';
import { inventoryService } from '../../services/inventoryService';
import { useRouteAccess } from '@/hooks/useRouteAccess';

/**
 * Inventory Entry Detail Page
 * Read-only view of stock inward entry
 * 
 * Features:
 * - Full product grid
 * - Payment info
 * - Totals summary
 * - Audit trail
 * - Actions: Print, Edit (if Draft/Ordered), Delete (Admin only)
 */
export const InventoryEntryDetailPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { role } = useRouteAccess();

    const [entry, setEntry] = useState<InventoryEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadEntry();
    }, [id]);

    const loadEntry = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await inventoryService.getEntry(id);
            setEntry(data);
        } catch (error) {
            console.error('Failed to load entry:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async () => {
        if (!entry || !id) return;
        setActionLoading(true);
        try {
            await inventoryService.receiveInventory(id);
            await loadEntry();
            alert('Inventory received successfully! Stock has been updated.');
        } catch (error: any) {
            alert(error.message || 'Failed to receive inventory');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setActionLoading(true);
        try {
            await inventoryService.deleteEntry(id as string, role || '');
            alert('Entry deleted successfully');
            router.push('/backoffice/inventory/entries');
        } catch (error: any) {
            alert(error.message || 'Failed to delete entry');
        } finally {
            setActionLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const canEdit = entry && (entry.inventoryStatus === 'Draft' || entry.inventoryStatus === 'Ordered');
    const canDelete = role === 'ADMIN' && entry && entry.inventoryStatus !== 'Received' && entry.inventoryStatus !== 'Partial';
    const canReceive = entry && entry.inventoryStatus !== 'Received' && entry.inventoryStatus !== 'Cancelled';

    const getStatusColor = (status: InventoryStatus) => {
        switch (status) {
            case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'Ordered': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Received': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Partial': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-200';
        }
    };

    const getPaymentStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Unpaid': return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'Partial': return 'bg-amber-50 text-amber-600 border-amber-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Clock className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading entry...</p>
                </div>
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Entry not found</p>
                    <button
                        onClick={() => router.push('/backoffice/inventory/entries')}
                        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold"
                    >
                        Back to Entries
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
                    onClick={() => router.push('/backoffice/inventory/entries')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Entry Details</h1>
                    <p className="text-sm text-slate-500 font-medium">{entry.referenceNo}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                        <Printer size={14} />
                        Print
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => router.push(`/backoffice/inventory/entries/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                        >
                            <Edit3 size={14} />
                            Edit
                        </button>
                    )}
                    {canReceive && (
                        <button
                            onClick={handleReceive}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                            <CheckCircle size={14} />
                            Receive Inventory
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {/* Status & Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${getStatusColor(entry.inventoryStatus)}`}>
                        {entry.inventoryStatus}
                    </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Status</div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${getPaymentStatusColor(entry.paymentStatus)}`}>
                        {entry.paymentStatus}
                    </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</div>
                    <div className="text-sm font-black text-slate-900">
                        {new Date(entry.inventoryDate).toLocaleDateString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Grand Total</div>
                    <div className="text-lg font-black text-emerald-600">
                        ${entry.grandTotal.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Supplier & Store Info */}
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Supplier
                            </label>
                            <div className="text-base font-black text-slate-900">{entry.supplierName}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Business Location
                            </label>
                            <div className="text-base font-black text-slate-900">{entry.storeName}</div>
                        </div>
                        {entry.payTerm && (
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Payment Terms
                                </label>
                                <div className="text-sm font-bold text-slate-600">{entry.payTerm}</div>
                            </div>
                        )}
                        {entry.attachedDocument && (
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Attached Document
                                </label>
                                <a href={entry.attachedDocument} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                                    View Document
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Purchase Qty</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Cost (Before Tax)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tax %</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tax Amount</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Cost (After Tax)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {entry.products.map((product, index) => (
                                <tr key={product.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 text-sm font-bold text-slate-600">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-black text-slate-900">{product.inventoryItemName}</td>
                                    <td className="px-4 py-3 text-xs font-bold text-slate-500">{product.sku || '-'}</td>
                                    <td className="px-4 py-3 text-sm font-black text-slate-900 text-right tabular-nums">{product.purchaseQuantity}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-600 text-right tabular-nums">${product.unitCostBeforeTax.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-600 text-right tabular-nums">${product.subtotal.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-600 text-right tabular-nums">{product.taxPercentage}%</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-600 text-right tabular-nums">${product.taxAmount.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm font-black text-emerald-600 text-right tabular-nums">${product.unitCostAfterTax.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-base font-black text-slate-900 text-right tabular-nums">${product.lineTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer & Totals */}
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {entry.additionalNotes && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Additional Notes
                                    </label>
                                    <div className="text-sm text-slate-600">{entry.additionalNotes}</div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-600">Subtotal:</span>
                                <span className="text-base font-black text-slate-900 tabular-nums">${entry.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-600">Purchase Tax:</span>
                                <span className="text-base font-black text-slate-900 tabular-nums">${entry.purchaseTax.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-600">Product Tax:</span>
                                <span className="text-base font-black text-slate-900 tabular-nums">${(entry.totalTax - entry.purchaseTax).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-600">Shipping Charges:</span>
                                <span className="text-base font-black text-slate-900 tabular-nums">${entry.shippingCharges.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t-2 border-slate-300">
                                <span className="text-base font-black text-slate-900 uppercase tracking-wide">Grand Total:</span>
                                <span className="text-2xl font-black text-emerald-600 tabular-nums">${entry.grandTotal.toFixed(2)}</span>
                            </div>
                            {entry.paymentDue > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-rose-600">Payment Due:</span>
                                    <span className="text-lg font-black text-rose-600 tabular-nums">${entry.paymentDue.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Audit Trail */}
                <div className="p-6 border-t border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Audit Trail</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">Created by:</span>
                            <span className="font-bold text-slate-900">{entry.createdByName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">Created at:</span>
                            <span className="font-bold text-slate-900">{new Date(entry.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">Last updated:</span>
                            <span className="font-bold text-slate-900">{new Date(entry.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-rose-100 rounded-2xl">
                                <AlertCircle size={24} className="text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Delete Entry?</h3>
                                <p className="text-sm text-slate-600">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
