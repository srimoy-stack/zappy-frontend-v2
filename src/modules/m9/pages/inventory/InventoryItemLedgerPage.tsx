'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Search,
    Package,
    Calendar,
    Download,
    History
} from 'lucide-react';
import { InventoryItem, InventoryLedgerEntry } from '../../types/inventory';
import { inventoryItemService } from '../../services/inventoryService';

/**
 * Inventory Item Ledger Page
 * Detailed history of stock movement for a single item
 */
export const InventoryItemLedgerPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [item, setItem] = useState<InventoryItem | null>(null);
    const [ledger, setLedger] = useState<InventoryLedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [itemData, ledgerData] = await Promise.all([
                inventoryItemService.getById(id!),
                inventoryItemService.getLedger(id!)
            ]);
            setItem(itemData);
            setLedger(ledgerData);
        } catch (error) {
            console.error('Failed to load ledger data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLedger = ledger.filter(entry => {
        if (filterType !== 'all' && entry.sourceType !== filterType) return false;
        if (searchQuery && !entry.sourceReference?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <History className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading ledger history...</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Package size={48} className="text-slate-300" />
                <h2 className="text-xl font-black text-slate-900">Item Not Found</h2>
                <button
                    onClick={() => router.push('/backoffice/inventory/list')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold"
                >
                    Back to Inventory
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stock Ledger</h1>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest border border-slate-200">
                            History
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        Detailed movement history for <span className="text-slate-900 font-black">{item.name}</span> ({item.sku})
                    </p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                    <Download size={14} />
                    Export PDF
                </button>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Stock</label>
                    <div className="text-2xl font-black text-slate-900">
                        {item.currentStock.toFixed(2)} <span className="text-sm font-bold text-slate-500">{item.baseUnit}</span>
                    </div>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Total Inward</label>
                    <div className="text-2xl font-black text-emerald-600">
                        +{ledger.filter(l => l.changeQuantity > 0).reduce((sum, l) => sum + l.changeQuantity, 0).toFixed(2)}
                    </div>
                </div>
                <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 shadow-sm">
                    <label className="block text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Total Outward</label>
                    <div className="text-2xl font-black text-rose-600">
                        {ledger.filter(l => l.changeQuantity < 0).reduce((sum, l) => sum + l.changeQuantity, 0).toFixed(2)}
                    </div>
                </div>
                <div className="bg-violet-50/50 p-6 rounded-3xl border border-violet-100 shadow-sm">
                    <label className="block text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2">Total Movements</label>
                    <div className="text-2xl font-black text-violet-600">
                        {ledger.length}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by reference number..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:border-slate-900 transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="flex-1 md:w-40 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:border-slate-900 outline-none"
                    >
                        <option value="all">All Sources</option>
                        <option value="inventory">Inventory Inward</option>
                        <option value="return">Returns / Wastage</option>
                        <option value="sale">Sales Deduction</option>
                        <option value="adjustment">Manual Adjustment</option>
                    </select>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference / Reason</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Change</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Stock Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLedger.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No stock movements found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredLedger.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(entry.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase ml-5">
                                                {new Date(entry.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${entry.sourceType === 'inventory' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                entry.sourceType === 'sale' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    entry.sourceType === 'return' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-violet-50 text-violet-600 border-violet-100'
                                                }`}>
                                                {entry.sourceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                                                {entry.sourceReference || 'N/A'}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                                ID: {entry.sourceId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`flex items-center justify-end gap-1.5 text-base font-black tabular-nums ${entry.changeQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                {entry.changeQuantity > 0 ? (
                                                    <TrendingUp size={16} />
                                                ) : (
                                                    <TrendingDown size={16} />
                                                )}
                                                {entry.changeQuantity > 0 ? '+' : ''}{entry.changeQuantity.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-base font-black text-slate-900 tabular-nums">
                                                {entry.balanceAfter.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                                {item.baseUnit}s
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
