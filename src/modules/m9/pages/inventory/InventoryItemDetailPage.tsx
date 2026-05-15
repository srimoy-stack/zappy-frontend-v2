'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import {
    ArrowLeft,
    Edit3,
    TrendingUp,
    Package,
    AlertTriangle,
    FileText,
    Plus,
    Minus,
    Scale,
    History
} from 'lucide-react';
import { InventoryItem, InventoryLedgerEntry } from '../../types/inventory';
import { inventoryItemService } from '../../services/inventoryService';
import { SelfAdjustModal } from './SelfAdjustModal';

/**
 * Inventory Item Detail Page
 * View item details, stock levels, and ledger history
 * 
 * Features:
 * - Item information
 * - Current stock & value
 * - Stock adjustment
 * - Ledger history
 */
export const InventoryItemDetailPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [item, setItem] = useState<InventoryItem | null>(null);
    const [ledger, setLedger] = useState<InventoryLedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showSelfAdjustModal, setShowSelfAdjustModal] = useState(false);
    const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
    const [adjustReason, setAdjustReason] = useState('');
    const [adjustLoading, setAdjustLoading] = useState(false);

    useEffect(() => {
        loadItem();
        loadLedger();
    }, [id]);

    const loadItem = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await inventoryItemService.getById(id);
            setItem(data);
        } catch (error) {
            console.error('Failed to load item:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLedger = async () => {
        if (!id) return;
        try {
            const data = await inventoryItemService.getLedger(id);
            setLedger(data);
        } catch (error) {
            console.error('Failed to load ledger:', error);
        }
    };

    const handleAdjustStock = async () => {
        if (!id || !adjustReason.trim() || adjustQuantity === 0) {
            alert('Please enter quantity and reason');
            return;
        }

        setAdjustLoading(true);
        try {
            await inventoryItemService.adjustStock(id, adjustQuantity, adjustReason, 'USER001');
            await loadItem();
            await loadLedger();
            setShowAdjustModal(false);
            setAdjustQuantity(0);
            setAdjustReason('');
            alert('Stock adjusted successfully');
        } catch (error: any) {
            alert(error.message || 'Failed to adjust stock');
        } finally {
            setAdjustLoading(false);
        }
    };

    if (loading || !item) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Package className="w-12 h-12 text-slate-400 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading item...</p>
                </div>
            </div>
        );
    }

    const isLowStock = item.currentStock <= item.lowStockThreshold;
    const stockValue = item.currentStock * item.averageCost;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.push('/backoffice/inventory/list')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{item.name}</h1>
                    <p className="text-sm text-slate-500 font-medium">SKU: {item.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAdjustModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all text-nowrap"
                    >
                        <TrendingUp size={14} />
                        Adjust Stock
                    </button>
                    <button
                        onClick={() => setShowSelfAdjustModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all text-nowrap"
                    >
                        <Scale size={14} />
                        Self Adjust
                    </button>
                    <button
                        onClick={() => router.push(`/backoffice/inventory/items/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all text-nowrap"
                    >
                        <Edit3 size={14} />
                        Edit Item
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`p-6 rounded-3xl border shadow-sm ${isLowStock ? 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl shadow-lg ${isLowStock ? 'bg-rose-600 shadow-rose-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
                            <Package size={20} className="text-white" />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest ${isLowStock ? 'text-rose-600' : 'text-emerald-600'}`}>Current Stock</span>
                    </div>
                    <div className={`text-3xl font-black tracking-tight ${isLowStock ? 'text-rose-900' : 'text-emerald-900'}`}>
                        {item.currentStock.toFixed(2)}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${isLowStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {item.baseUnit}
                        {isLowStock && ' - LOW STOCK!'}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Average Cost</span>
                    </div>
                    <div className="text-3xl font-black text-blue-900 tracking-tight">
                        ${item.averageCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-blue-600 font-bold mt-1">
                        Per {item.baseUnit}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-6 rounded-3xl border border-violet-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-200">
                            <Package size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-violet-600 uppercase tracking-widest">Stock Value</span>
                    </div>
                    <div className="text-3xl font-black text-violet-900 tracking-tight">
                        ${stockValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-violet-600 font-bold mt-1">
                        Total Value
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-3xl border border-amber-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-600 rounded-2xl shadow-lg shadow-amber-200">
                            <AlertTriangle size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Low Stock Alert</span>
                    </div>
                    <div className="text-3xl font-black text-amber-900 tracking-tight">
                        {item.lowStockThreshold}
                    </div>
                    <div className="text-xs text-amber-600 font-bold mt-1">
                        Threshold
                    </div>
                </div>
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Item Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Item Name
                        </label>
                        <div className="text-base font-black text-slate-900">{item.name}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            SKU
                        </label>
                        <div className="text-base font-bold text-slate-600">{item.sku}</div>
                    </div>
                    {item.description && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Description
                            </label>
                            <div className="text-sm text-slate-600">{item.description}</div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Base Unit
                        </label>
                        <div className="text-base font-bold text-slate-600">{item.baseUnit}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Status
                        </label>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${item.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}>
                            {item.status}
                        </span>
                    </div>
                </div>

                {item.lastAdjustedBy && (
                    <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Last Adjusted By
                            </label>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                                    {item.lastAdjustedByName?.charAt(0) || '?'}
                                </div>
                                {item.lastAdjustedByName} (ID: {item.lastAdjustedBy})
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Last Adjusted Date & Time
                            </label>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <History size={14} className="text-slate-400" />
                                {new Date(item.lastAdjustedAt!).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Ledger History */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText size={20} className="text-slate-600" />
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Stock Movement History</h2>
                    </div>
                    <button
                        onClick={() => router.push(`/backoffice/inventory/items/${id}/ledger`)}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                    >
                        View Full Ledger →
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Change</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance After</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ledger.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400 font-medium">No stock movements yet</p>
                                    </td>
                                </tr>
                            ) : (
                                ledger.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${entry.sourceType === 'inventory' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                entry.sourceType === 'sale' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    entry.sourceType === 'return' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                        'bg-violet-50 text-violet-600 border-violet-200'
                                                }`}>
                                                {entry.sourceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                                            {entry.sourceReference}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-base font-black tabular-nums ${entry.changeQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                {entry.changeQuantity > 0 ? '+' : ''}{entry.changeQuantity.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-base font-black text-slate-900 tabular-nums">
                                                {entry.balanceAfter.toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stock Adjustment Modal */}
            {showAdjustModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Adjust Stock</h3>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Adjustment Quantity
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setAdjustQuantity(Math.max(-item.currentStock, adjustQuantity - 1))}
                                        className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <input
                                        type="number"
                                        value={adjustQuantity}
                                        onChange={(e) => setAdjustQuantity(parseFloat(e.target.value) || 0)}
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-center text-lg font-black"
                                        placeholder="0"
                                    />
                                    <button
                                        onClick={() => setAdjustQuantity(adjustQuantity + 1)}
                                        className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    New stock: {(item.currentStock + adjustQuantity).toFixed(2)} {item.baseUnit}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Reason (Required)
                                </label>
                                <textarea
                                    value={adjustReason}
                                    onChange={(e) => setAdjustReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                                    rows={3}
                                    placeholder="Enter reason for adjustment..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setShowAdjustModal(false);
                                    setAdjustQuantity(0);
                                    setAdjustReason('');
                                }}
                                disabled={adjustLoading}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdjustStock}
                                disabled={adjustLoading || !adjustReason.trim() || adjustQuantity === 0}
                                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all disabled:opacity-50"
                            >
                                {adjustLoading ? 'Adjusting...' : 'Adjust Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Self Adjust Modal */}
            {item && (
                <SelfAdjustModal
                    isOpen={showSelfAdjustModal}
                    onClose={() => setShowSelfAdjustModal(false)}
                    onSave={() => {
                        loadItem();
                        loadLedger();
                    }}
                    item={item}
                />
            )}
        </div>
    );
};
