'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
;
import {
    ArrowLeft,
    Search,
    Trash2,
    RotateCcw
} from 'lucide-react';
import { ReturnType, InventoryItem } from '../../types/inventory';
import { inventoryItemService } from '../../services/inventoryService';

interface ReturnItem {
    id: string; // temp id
    inventoryItemId: string;
    inventoryItemName: string;
    sku: string;
    baseUnit: string;
    quantity: number;
    unitCost: number; // Current average cost
    lineTotal: number;
}

/**
 * Create Return / Adjustment Page
 * 
 * Handles:
 * - Supplier Returns (Stock Out)
 * - Waste / Damaged (Stock Out)
 * - Internal Usage (Stock Out)
 */
export const CreateReturnPage: React.FC = () => {
    const router = useRouter();

    // Header
    const [returnType, setReturnType] = useState<ReturnType>('Damaged');
    const [referenceNo, setReferenceNo] = useState('');
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const storeId = 'STORE001';
    const [reason, setReason] = useState('');
    const [supplierId, setSupplierId] = useState(''); // Only if type is Supplier Return

    // Items
    const [items, setItems] = useState<ReturnItem[]>([]);

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

    useEffect(() => {
        // Load items for search
        const loadItems = async () => {
            const data = await inventoryItemService.getAll({ status: 'Active' });
            setInventoryItems(data);
        };
        loadItems();
    }, []);

    // Filter search
    useEffect(() => {
        if (searchQuery.trim()) {
            const results = inventoryItems.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 5);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, inventoryItems]);

    const addItem = (item: InventoryItem) => {
        const newItem: ReturnItem = {
            id: `TEMP_${Date.now()}`,
            inventoryItemId: item.id,
            inventoryItemName: item.name,
            sku: item.sku,
            baseUnit: item.baseUnit,
            quantity: 1,
            unitCost: item.averageCost,
            lineTotal: item.averageCost * 1
        };
        setItems([...items, newItem]);
        setSearchQuery('');
        setShowResults(false);
    };

    const updateItem = (id: string, field: keyof ReturnItem, value: number) => {
        setItems(items.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, [field]: value };
            if (field === 'quantity' || field === 'unitCost') {
                updated.lineTotal = updated.quantity * updated.unitCost;
            }
            return updated;
        }));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

    const handleSave = async () => {
        if (items.length === 0) {
            alert('Please add at least one item');
            return;
        }
        if (!reason) {
            alert('Please provide a reason');
            return;
        }

        const payload = {
            returnType,
            referenceNo,
            returnDate,
            storeId,
            supplierId: returnType === 'Supplier Return' ? supplierId : undefined,
            reason,
            items: items.map((i: ReturnItem) => ({
                inventoryItemId: i.inventoryItemId,
                quantity: i.quantity,
                unitCost: i.unitCost,
                lineTotal: i.lineTotal
            })),
            totalAmount
        };

        console.log('Saving return:', payload);
        // await inventoryService.createReturn(payload); // Mock call
        alert('Return/Adjustment created successfully!');
        router.push('/backoffice/inventory/returns');
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Return / Adjustment</h1>
                    <p className="text-sm text-slate-500 font-medium">Record stock wastage, damage, or supplier returns</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Type</label>
                                <select
                                    value={returnType}
                                    onChange={(e) => setReturnType(e.target.value as ReturnType)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-600 outline-none"
                                >
                                    <option value="Damaged">Damaged (Waste)</option>
                                    <option value="Expired">Expired (Waste)</option>
                                    <option value="Supplier Return">Supplier Return</option>
                                    <option value="Adjustment">Inventory Adjustment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Date</label>
                                <input
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Reference No</label>
                                <input
                                    type="text"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-600 outline-none"
                                />
                            </div>
                            {returnType === 'Supplier Return' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Supplier</label>
                                    <input
                                        type="text"
                                        value={supplierId}
                                        onChange={(e) => setSupplierId(e.target.value)}
                                        placeholder="Supplier ID / Name"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-600 outline-none"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Reason / Notes *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-600 outline-none resize-none"
                                placeholder="Describe why stock is being returned or adjusted..."
                            />
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onFocus={() => setShowResults(true)}
                                    placeholder="Search item to add..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-rose-600 outline-none"
                                />
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                        {searchResults.map((item: InventoryItem) => (
                                            <button
                                                key={item.id}
                                                onClick={() => addItem(item)}
                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                                            >
                                                <div className="text-sm font-bold text-slate-900">{item.name}</div>
                                                <div className="text-xs text-slate-500">SKU: {item.sku} | Stock: {item.currentStock} {item.baseUnit}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400 font-medium">
                                                No items added. Search above.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item: ReturnItem) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-bold text-slate-900">{item.inventoryItemName}</div>
                                                    <div className="text-[10px] text-slate-400">{item.sku}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right text-sm focus:border-rose-600 outline-none"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-slate-600">
                                                    ${item.unitCost.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                    ${item.lineTotal.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-slate-400 hover:text-rose-600 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
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

                {/* Right: Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Summary</h3>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-600 font-bold text-sm">Total Items</span>
                            <span className="text-slate-900 font-black">{items.length}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Total Value</span>
                            <span className="text-2xl font-black text-rose-600">${totalAmount.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            This value will be deducted from your inventory valuation.
                        </p>

                        <button
                            onClick={handleSave}
                            className="w-full mt-6 py-3 bg-rose-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={16} />
                            Process Return
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
