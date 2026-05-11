'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import {
    ArrowLeft,
    Search,
    Upload,
    FileText,
    Trash2,
    Save,
    CheckCircle
} from 'lucide-react';
import { InventoryStatus, InventoryEntryProduct, CreateInventoryEntryDTO, Vendor, InventoryItem } from '../../types/inventory';
import { inventoryService, vendorService, inventoryItemService } from '../../services/inventoryService';

/**
 * Edit Inventory Entry Page
 * 
 * Allows editing of Draft/Ordered entries.
 * Received entries cannot be edited.
 */
export const EditInventoryEntryPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initial Data
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [allItems, setAllItems] = useState<InventoryItem[]>([]);

    // Header Fields
    const [supplierId, setSupplierId] = useState('');
    const [referenceNo, setReferenceNo] = useState('');
    const [inventoryDate, setInventoryDate] = useState('');
    const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus>('Draft');
    const [storeId, setStoreId] = useState('STORE001');
    const [payTerm, setPayTerm] = useState('');

    // Products
    const [products, setProducts] = useState<InventoryEntryProduct[]>([]);

    // Footer
    const [purchaseTax, setPurchaseTax] = useState(0);
    const [shippingCharges, setShippingCharges] = useState(0);
    const [additionalNotes, setAdditionalNotes] = useState('');

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (!id) return;
            try {
                const [entry, vendorList, itemList] = await Promise.all([
                    inventoryService.getEntry(id),
                    vendorService.getAll(),
                    inventoryItemService.getAll({ status: 'Active' })
                ]);

                if (!entry) {
                    alert('Entry not found');
                    router.push('/backoffice/inventory/entries');
                    return;
                }

                if (entry.inventoryStatus === 'Received' || entry.inventoryStatus === 'Partial') {
                    alert('Cannot edit received inventory');
                    router.push(`/backoffice/inventory/entries/${id}`);
                    return;
                }

                setVendors(vendorList);
                setAllItems(itemList);

                // Populate Form
                setSupplierId(entry.supplierId);
                setReferenceNo(entry.referenceNo);
                setInventoryDate(entry.inventoryDate);
                setInventoryStatus(entry.inventoryStatus);
                setStoreId(entry.storeId);
                setPayTerm(entry.payTerm || '');
                setProducts(entry.products);
                setPurchaseTax(entry.purchaseTax);
                setShippingCharges(entry.shippingCharges);
                setAdditionalNotes(entry.additionalNotes || '');

            } catch (error) {
                console.error('Failed to load entry:', error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [id]);

    // Add product to grid
    const addProduct = (inventoryItemId: string) => {
        const item = allItems.find(i => i.id === inventoryItemId);
        if (!item) return;

        const newProduct: InventoryEntryProduct = {
            id: `TEMP${Date.now()}`, // Temp ID
            inventoryItemId: item.id,
            inventoryItemName: item.name,
            sku: item.sku,
            purchaseQuantity: 1,
            unitCostBeforeTax: 0,
            subtotal: 0,
            taxPercentage: 0,
            taxAmount: 0,
            unitCostAfterTax: 0,
            lineTotal: 0
        };

        setProducts([...products, newProduct]);
        setSearchQuery('');
        setShowSearchResults(false);
    };

    // Update product field
    const updateProduct = (id: string, field: keyof InventoryEntryProduct, value: any) => {
        setProducts(products.map(p => {
            if (p.id !== id) return p;

            const updated = { ...p, [field]: value };

            // Recalculate
            const qty = updated.purchaseQuantity;
            const costBefore = updated.unitCostBeforeTax;
            const taxPct = updated.taxPercentage;

            updated.subtotal = qty * costBefore;
            updated.taxAmount = updated.subtotal * (taxPct / 100);
            updated.unitCostAfterTax = costBefore + (costBefore * taxPct / 100);
            updated.lineTotal = qty * updated.unitCostAfterTax;

            return updated;
        }));
    };

    // Remove product
    const removeProduct = (productId: string) => {
        setProducts(products.filter(p => p.id !== productId));
    };

    // Calculate totals
    const subtotal = products.reduce((sum, p) => sum + p.subtotal, 0);
    const totalTax = products.reduce((sum, p) => sum + p.taxAmount, 0) + purchaseTax;
    const grandTotal = subtotal + totalTax + shippingCharges;

    const handleUpdate = async (andReceive: boolean = false) => {
        if (!id) return;
        if (!supplierId) {
            alert('Please select a supplier');
            return;
        }
        if (products.length === 0) {
            alert('Please add at least one product');
            return;
        }

        setSaving(true);
        try {
            const entryData: CreateInventoryEntryDTO = {
                supplierId,
                referenceNo,
                inventoryDate,
                inventoryStatus: andReceive ? 'Received' : inventoryStatus,
                storeId,
                payTerm,
                products: products.map(p => ({
                    sku: p.sku,
                    inventoryItemId: p.inventoryItemId,
                    purchaseQuantity: p.purchaseQuantity,
                    unitCostBeforeTax: p.unitCostBeforeTax,
                    subtotal: p.subtotal,
                    taxPercentage: p.taxPercentage,
                    taxAmount: p.taxAmount,
                    unitCostAfterTax: p.unitCostAfterTax,
                    lineTotal: p.lineTotal
                })),
                purchaseTax,
                shippingCharges,
                additionalNotes
            };

            await inventoryService.updateEntry(id, entryData);

            if (andReceive) {
                await inventoryService.receiveInventory(id);
                alert('Inventory received & stock updated successfully!');
            } else {
                alert('Entry updated successfully!');
            }
            router.push('/backoffice/inventory/entries');
        } catch (error: any) {
            alert('Failed to update: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Search results
    const searchResults = searchQuery.trim()
        ? allItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Loading entry...</div>;
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Inventory Entry</h1>
                    <p className="text-sm text-slate-500 font-medium">{referenceNo}</p>
                </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header Fields */}
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Entry Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Supplier */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Supplier <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all"
                                required
                            >
                                <option value="">Select Supplier</option>
                                {vendors.map(vendor => (
                                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Reference No */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Reference No
                            </label>
                            <input
                                type="text"
                                value={referenceNo}
                                onChange={(e) => setReferenceNo(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all"
                            />
                        </div>

                        {/* Inventory Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Inventory Date
                            </label>
                            <input
                                type="date"
                                value={inventoryDate}
                                onChange={(e) => setInventoryDate(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all"
                            />
                        </div>

                        {/* Inventory Status */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Inventory Status
                            </label>
                            <select
                                value={inventoryStatus}
                                onChange={(e) => setInventoryStatus(e.target.value as InventoryStatus)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Ordered">Ordered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Pay Term */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Pay Term
                            </label>
                            <input
                                type="text"
                                value={payTerm}
                                onChange={(e) => setPayTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all"
                            />
                        </div>

                        {/* Attach Document */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Attach Document
                            </label>
                            <button className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                <Upload size={16} />
                                Upload Invoice/PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Entry Actions */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        {/* Search Product */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSearchResults(true);
                                }}
                                onFocus={() => setShowSearchResults(true)}
                                placeholder="Search Product / SKU / Barcode..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all"
                            />

                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                                    {searchResults.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => addProduct(item.id)}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            <div className="text-sm font-bold text-slate-900">{item.name}</div>
                                            <div className="text-xs text-slate-500">SKU: {item.sku} | Stock: {item.currentStock} {item.baseUnit}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">#</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Purchase Qty</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Cost (Before Tax)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tax %</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Cost (After Tax)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Line Total</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText size={32} className="text-slate-300" />
                                            <p className="text-sm text-slate-400 font-medium">No products added.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-bold text-slate-600">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-slate-900">{product.inventoryItemName}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500 font-medium">{product.sku}</td>
                                        <td className="px-4 py-3 text-right">
                                            <input
                                                type="number"
                                                value={product.purchaseQuantity}
                                                onChange={(e) => updateProduct(product.id, 'purchaseQuantity', parseFloat(e.target.value) || 0)}
                                                className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm text-right focus:border-emerald-600"
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <input
                                                type="number"
                                                value={product.unitCostBeforeTax}
                                                onChange={(e) => updateProduct(product.id, 'unitCostBeforeTax', parseFloat(e.target.value) || 0)}
                                                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm text-right focus:border-emerald-600"
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right tabular-nums">
                                            ${product.subtotal.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <input
                                                type="number"
                                                value={product.taxPercentage}
                                                onChange={(e) => updateProduct(product.id, 'taxPercentage', parseFloat(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm text-right focus:border-emerald-600"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right tabular-nums">
                                            ${product.unitCostAfterTax.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-base font-black text-emerald-600 text-right tabular-nums">
                                            ${product.lineTotal.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => removeProduct(product.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
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

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Additional Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Purchase Tax
                                </label>
                                <input
                                    type="number"
                                    value={purchaseTax}
                                    onChange={(e) => setPurchaseTax(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Shipping Charges
                                </label>
                                <input
                                    type="number"
                                    value={shippingCharges}
                                    onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 transition-all resize-none"
                                    placeholder="Any additional notes..."
                                />
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Summary</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Subtotal</span>
                                <span className="text-sm font-black text-slate-900 tabular-nums">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Tax</span>
                                <span className="text-sm font-black text-slate-900 tabular-nums">${totalTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Shipping</span>
                                <span className="text-sm font-black text-slate-900 tabular-nums">${shippingCharges.toFixed(2)}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Grand Total</span>
                                <span className="text-2xl font-black text-emerald-600 tabular-nums">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 bg-white border-t border-slate-200 flex items-center justify-end gap-4">
                    <button
                        onClick={() => router.push('/backoffice/inventory/entries')}
                        className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleUpdate(false)}
                        disabled={saving}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Update Entry'}
                    </button>
                    <button
                        onClick={() => handleUpdate(true)}
                        disabled={saving}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle size={16} />
                        Update & Receive
                    </button>
                </div>
            </div>
        </div>
    );
};
