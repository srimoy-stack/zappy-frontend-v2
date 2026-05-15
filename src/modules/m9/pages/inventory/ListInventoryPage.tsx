'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
;
import {
    ArrowLeft,
    Search,
    Filter,
    Plus,
    Eye,
    Edit3,
    TrendingDown,
    FileText,
    AlertTriangle,
    Package,
    Scale
} from 'lucide-react';
import { ItemStatus, InventoryItem } from '../../types/inventory';
import { inventoryItemService } from '../../services/inventoryService';
import { SelfAdjustModal } from './SelfAdjustModal';

/**
 * List Inventory (Inventory Items / Ingredients) Page
 * Canonical list of inventory items (ingredients)
 * 
 * Rules:
 * - Inventory items are tenant-wide
 * - Vendors supply items but do NOT define them
 * - Recipes & sales deduct stock from these items only
 */
export const ListInventoryPage: React.FC = () => {
    const router = useRouter();

    // Data State
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<ItemStatus | ''>('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await inventoryItemService.getAll();
            setItems(data);
        } catch (error) {
            console.error('Failed to load inventory items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    // Filter items
    const filteredItems = items.filter(item => {
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.sku.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedStatus && item.status !== selectedStatus) return false;
        if (showLowStockOnly && item.currentStock > item.lowStockThreshold) return false;
        return true;
    });

    // Stats
    const lowStockCount = items.filter(item => item.currentStock <= item.lowStockThreshold).length;
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.averageCost), 0);

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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">List Inventory</h1>
                    <p className="text-sm text-slate-500 font-medium">Canonical list of inventory items (ingredients)</p>
                </div>
                <button
                    onClick={() => router.push('/backoffice/inventory/items/create')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                >
                    <Plus size={16} strokeWidth={3} />
                    Add Item
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-3xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
                            <Package size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Total Items</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-900 tracking-tight">
                        {loading ? '...' : items.length}
                    </div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">
                        Active Ingredients
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <TrendingDown size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Total Value</span>
                    </div>
                    <div className="text-3xl font-black text-blue-900 tracking-tight">
                        ${totalValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-blue-600 font-bold mt-1">
                        Current Stock Value
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-3xl border border-amber-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-600 rounded-2xl shadow-lg shadow-amber-200">
                            <AlertTriangle size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Low Stock</span>
                    </div>
                    <div className="text-3xl font-black text-amber-900 tracking-tight">
                        {lowStockCount}
                    </div>
                    <div className="text-xs text-amber-600 font-bold mt-1">
                        Items Below Threshold
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
                            placeholder="Search by item name or SKU..."
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as ItemStatus | '')}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600"
                            >
                                <option value="">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showLowStockOnly}
                                    onChange={(e) => setShowLowStockOnly(e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm font-bold text-slate-600">Show Low Stock Only</span>
                            </label>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSelectedStatus('');
                                    setShowLowStockOnly(false);
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
                    Showing <span className="font-black text-slate-900">{filteredItems.length}</span> items
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Unit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Current Stock</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Average Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Stock Value</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Low Stock Threshold</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Package size={32} className="text-slate-300" />
                                            <p className="text-sm text-slate-400 font-medium">No items found. Try adjusting your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isLowStock = item.currentStock <= item.lowStockThreshold;
                                    const stockValue = item.currentStock * item.averageCost;

                                    return (
                                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-slate-900">{item.name}</div>
                                                {item.description && (
                                                    <div className="text-xs text-slate-500 font-medium mt-1">{item.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                                    {item.sku}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{item.baseUnit}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`text-sm font-black tabular-nums ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                                                    {item.currentStock.toFixed(2)}
                                                </div>
                                                {isLowStock && (
                                                    <div className="flex items-center justify-end gap-1 mt-1">
                                                        <AlertTriangle size={12} className="text-rose-500" />
                                                        <span className="text-[10px] text-rose-500 font-bold uppercase">Low</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-black text-slate-900 tabular-nums">
                                                    ${item.averageCost.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-black text-emerald-600 tabular-nums">
                                                    ${stockValue.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-slate-600 tabular-nums">
                                                    {item.lowStockThreshold}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${item.status === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/backoffice/inventory/items/${item.id}`)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="View Item"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/backoffice/inventory/items/${item.id}/edit`)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                        title="Edit Item"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setIsAdjustModalOpen(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                                                        title="Self Adjust"
                                                    >
                                                        <Scale size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/backoffice/inventory/items/${item.id}/ledger`)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="View Ledger"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Self Adjust Modal */}
            {selectedItem && (
                <SelfAdjustModal
                    isOpen={isAdjustModalOpen}
                    onClose={() => {
                        setIsAdjustModalOpen(false);
                        setSelectedItem(null);
                    }}
                    onSave={loadItems}
                    item={selectedItem}
                />
            )}
        </div>
    );
};
