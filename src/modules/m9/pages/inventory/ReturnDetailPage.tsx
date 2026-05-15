'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import {
    ArrowLeft,
    Printer,
    Calendar,
    RotateCcw,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { InventoryReturn } from '../../types/inventory';
import { returnService } from '../../services/inventoryService';

/**
 * Return Detail Page
 * 
 * View details of a processed return/adjustment.
 * Returns are final and cannot be edited.
 */
export const ReturnDetailPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [ret, setRet] = useState<InventoryReturn | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReturn = async () => {
            if (!id) return;
            try {
                const data = await returnService.getById(id);
                setRet(data);
            } catch (error) {
                console.error('Failed to load return:', error);
            } finally {
                setLoading(false);
            }
        };
        loadReturn();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RotateCcw className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading return details...</p>
                </div>
            </div>
        );
    }

    if (!ret) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Return not found</p>
                    <button
                        onClick={() => router.push('/backoffice/inventory/returns')}
                        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold"
                    >
                        Back to Returns
                    </button>
                </div>
            </div>
        );
    }

    const getReturnTypeColor = (type: string) => {
        switch (type) {
            case 'Supplier Return': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Damaged': return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'Expired': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Adjustment': return 'bg-violet-50 text-violet-600 border-violet-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.push('/backoffice/inventory/returns')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Return Details</h1>
                    <p className="text-sm text-slate-500 font-medium">{ret.referenceNo}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                        <Printer size={14} />
                        Print
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${getReturnTypeColor(ret.returnType)}`}>
                        {ret.returnType}
                    </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-sm font-black text-slate-900">
                            {new Date(ret.returnDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Amount</div>
                    <div className="text-lg font-black text-rose-600">
                        ${ret.totalAmount.toFixed(2)}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Processed By</div>
                    <div className="text-sm font-black text-slate-900">{ret.createdByName}</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header Info */}
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Business Location
                            </label>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-slate-400" />
                                <span className="text-base font-black text-slate-900">{ret.storeName}</span>
                            </div>
                        </div>
                        {ret.supplierName && (
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Supplier
                                </label>
                                <div className="text-base font-black text-slate-900">{ret.supplierName}</div>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Reason / Notes
                            </label>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-600">
                                {ret.reason || 'No reason provided.'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ret.products.map((item: any, index: number) => (
                                <tr key={item.inventoryItemId} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900">
                                        {/* Name might not be directly in ReturnItem if not populated in backend mock properly, 
                                            but usually backend returns populated data. Assuming yes for now based on service logic */}
                                        {item.inventoryItemName || 'Item ' + item.inventoryItemId}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900 text-right tabular-nums">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right tabular-nums">
                                        ${item.unitCost.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-base font-black text-rose-600 text-right tabular-nums">
                                        ${item.lineTotal.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200">
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wide">
                                    Grand Total
                                </td>
                                <td className="px-6 py-4 text-right text-xl font-black text-rose-600 tabular-nums">
                                    ${ret.totalAmount.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Audit Trail */}
                <div className="p-6 border-t border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Audit Trail</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">Processed by:</span>
                            <span className="font-bold text-slate-900">{ret.createdByName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">Processed at:</span>
                            <span className="font-bold text-slate-900">{new Date(ret.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
