'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
    ArrowLeft,
    Search,
    Trash2,
    Loader,
    Upload,
    Plus,
} from 'lucide-react';
import { InventoryStatus, InventoryEntryProduct, Vendor } from '../../types/inventory';
import { inventoryService, inventoryItemService, vendorService } from '../../services/inventoryService';

import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';

/**
 * Add Inventory (Stock Inward) Page
 * 
 * Create new stock entry (Purchase)
 */
export const AddInventoryPage: React.FC = () => {
    const router = useRouter();
    const { userType, isSuperAdmin } = useRouteAccess();

    const canCreate = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN || userType === UserType.MANAGER;

    useEffect(() => {
        if (!canCreate) {
            router.replace('/backoffice/inventory');
        }
    }, [canCreate, router]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    if (!canCreate) return null;

    // Data lists
    const [vendors, setVendors] = useState<Vendor[]>([]);


    // Header Fields
    const [supplierId, setSupplierId] = useState('');
    const [referenceNo, setReferenceNo] = useState('');
    const [inventoryDate, setInventoryDate] = useState(new Date().toISOString().split('T')[0]);
    const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus>('Draft');
    const storeId = 'STORE001';
    const [payTerm, setPayTerm] = useState('');
    const [attachedDocument, setAttachedDocument] = useState<string | null>(null);

    // Products & Selection
    const [products, setProducts] = useState<InventoryEntryProduct[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

    // Vendor Creation State
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [newVendorName, setNewVendorName] = useState('');
    const [newVendorContact, setNewVendorContact] = useState('');
    const [newVendorPhone, setNewVendorPhone] = useState('');
    const [newVendorMobile, setNewVendorMobile] = useState('');
    const [newVendorEmail, setNewVendorEmail] = useState('');
    const [newVendorWebsite, setNewVendorWebsite] = useState('');
    const [newVendorAddress, setNewVendorAddress] = useState('');
    const [creatingVendor, setCreatingVendor] = useState(false);

    // Footer
    // const [purchaseTax, setPurchaseTax] = useState(0);
    const [shippingCharges, setShippingCharges] = useState(0);
    const [additionalNotes, setAdditionalNotes] = useState('');

    // Search
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vData, iData] = await Promise.all([
                vendorService.getAll(),
                inventoryItemService.getAll({ status: 'Active' })
            ]);
            setVendors(vData);


            // Pre-fill products state with all active items (initialized to default values)
            const initialProducts = iData.map(item => ({
                id: `IEP-${item.id}`,
                inventoryItemId: item.id,
                inventoryItemName: item.name,
                sku: item.sku,
                unitCostBeforeTax: item.averageCost,
                taxPercentage: 0,
                taxAmount: 0,
                unitCostAfterTax: item.averageCost,
                purchaseQuantity: 1,
                subtotal: item.averageCost,
                lineTotal: item.averageCost
            }));
            setProducts(initialProducts);

        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search just filters what is visible in the table
    const visibleProducts = products.filter(p => {
        if (!searchQuery.trim()) return true;
        return p.inventoryItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const toggleProductSelection = (id: string) => {
        const newSelected = new Set(selectedProductIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedProductIds(newSelected);
    };

    const toggleAllVisible = () => {
        const allVisibleIds = visibleProducts.map(p => p.id);
        const allSelected = allVisibleIds.every(id => selectedProductIds.has(id));
        const newSelected = new Set(selectedProductIds);

        if (allSelected) {
            allVisibleIds.forEach(id => newSelected.delete(id));
        } else {
            allVisibleIds.forEach(id => newSelected.add(id));
        }
        setSelectedProductIds(newSelected);
    };

    // Auto-generate reference number if empty
    useEffect(() => {
        if (!referenceNo) {
            const timestamp = Date.now();
            setReferenceNo(`PO-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`);
        }
    }, [referenceNo]);



    // Update product quantity or cost
    const updateProduct = (id: string, field: keyof InventoryEntryProduct, value: number) => {
        setProducts(products.map(p => {
            if (p.id !== id) return p;

            const updated = { ...p, [field]: value };

            // Recalculate Logic
            if (field === 'purchaseQuantity' || field === 'unitCostBeforeTax' || field === 'taxPercentage') {
                const qty = updated.purchaseQuantity;
                const cost = updated.unitCostBeforeTax;
                const taxPct = updated.taxPercentage;

                updated.subtotal = qty * cost;

                // Tax Calculation Strategy: (Cost * Tax%) * Qty OR (Subtotal * Tax%)
                // Usually Tax Amount is per line total tax.
                // unitCostAfterTax = cost + (cost * taxPct / 100)
                const taxPerUnit = cost * (taxPct / 100);
                updated.unitCostAfterTax = cost + taxPerUnit;

                updated.taxAmount = taxPerUnit * qty;
                updated.lineTotal = updated.subtotal + updated.taxAmount;
            }

            return updated;
        }));
    };



    // Create Vendor
    const handleCreateVendor = async () => {
        if (!newVendorName) return alert('Vendor Name is required');

        setCreatingVendor(true);
        try {
            const newVendor = await vendorService.create({
                name: newVendorName,
                contactPerson: newVendorContact,
                phone: newVendorPhone,
                mobileNumber: newVendorMobile,
                email: newVendorEmail,
                website: newVendorWebsite,
                address: newVendorAddress,
                status: 'Active'
            });
            setVendors([...vendors, newVendor]);
            setSupplierId(newVendor.id);
            setShowVendorModal(false);
            // Reset form
            setNewVendorName('');
            setNewVendorContact('');
            setNewVendorPhone('');
            setNewVendorMobile('');
            setNewVendorEmail('');
            setNewVendorWebsite('');
            setNewVendorAddress('');
        } catch (error: any) {
            alert('Failed to create vendor: ' + error.message);
        } finally {
            setCreatingVendor(false);
        }
    };

    // Calculations
    // Calculations based only on SELECTED products
    const selectedProductsList = products.filter(p => selectedProductIds.has(p.id));
    const subtotal = selectedProductsList.reduce((sum, p) => sum + p.subtotal, 0);
    const totalTax = selectedProductsList.reduce((sum, p) => sum + p.taxAmount, 0); // Sum of line taxes
    const grandTotal = subtotal + totalTax + shippingCharges;

    const handleSave = async (status: InventoryStatus = 'Draft') => {
        if (!supplierId) {
            alert('Please select a supplier');
            return;
        }
        if (selectedProductsList.length === 0) {
            alert('Please select at least one product to add');
            return;
        }

        setSubmitting(true);
        try {
            // Align with CreateInventoryEntryDTO
            const payload = {
                supplierId,
                storeId,
                inventoryDate: inventoryDate, // renamed from transactionDate
                expectedDeliveryDate: inventoryDate,
                referenceNo,
                inventoryStatus: status,
                products: selectedProductsList, // Only send selected products
                additionalNotes,
                shippingCharges,
                purchaseTax: totalTax, // Global tax field
                otherExpenses: 0
            };

            // Using 'any' cast if DTO mismatch persists, but trying to be correct.
            // If createEntry expects a specific structure mapped, we map it.
            // But usually DTOs mirror the form structure.
            // Lint error said: "Argument ... is not assignable ... missing ... purchaseTax".

            await inventoryService.createEntry(payload as any, 'USER001', 'Admin User');

            alert(`Inventory Entry ${status === 'Received' ? 'Received' : 'Saved'} successfully!`);
            router.push('/backoffice/inventory/entries');
        } catch (error: any) {
            console.error('Failed to save:', error);
            alert('Failed to save entry: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add Inventory</h1>
                    <p className="text-sm text-slate-500 font-medium">Create new stock purchase order</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form & Grid */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Details */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Supplier *</label>
                                <select
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600 outline-none"
                                >
                                    <option value="">Select Supplier</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setShowVendorModal(true)}
                                    className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add New Supplier
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Date</label>
                                <input
                                    type="date"
                                    value={inventoryDate}
                                    onChange={(e) => setInventoryDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Ref No.</label>
                                <input
                                    type="text"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                                <select
                                    value={inventoryStatus}
                                    onChange={(e) => setInventoryStatus(e.target.value as InventoryStatus)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600 outline-none"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Ordered">Ordered</option>
                                    <option value="Received">Received</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>

                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Pay Term</label>
                                <input
                                    type="text"
                                    value={payTerm}
                                    onChange={(e) => setPayTerm(e.target.value)}
                                    placeholder="e.g. Net 30"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Attach Document</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload size={16} />
                                        {attachedDocument ? 'Document Attached' : 'Upload File'}
                                    </button>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => setAttachedDocument(e.target.files?.[0]?.name || null)}
                                    />
                                    {attachedDocument && (
                                        <button onClick={() => setAttachedDocument(null)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products in list..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 outline-none"
                                />
                            </div>
                            <div className="text-xs font-bold text-slate-500">
                                {selectedProductIds.size} selected
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left border-collapse relative">
                                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100 shadow-sm">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-4 py-3 text-center w-12">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                onChange={toggleAllVisible}
                                                checked={visibleProducts.length > 0 && visibleProducts.every(p => selectedProductIds.has(p.id))}
                                            />
                                        </th>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3 text-right">Qty</th>
                                        <th className="px-4 py-3 text-right">Unit Cost</th>
                                        <th className="px-4 py-3 text-right">Tax %</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {visibleProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">
                                                No products found.
                                            </td>
                                        </tr>
                                    ) : (
                                        visibleProducts.map(p => {
                                            const isSelected = selectedProductIds.has(p.id);
                                            return (
                                                <tr key={p.id} className={`transition-colors ${isSelected ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                            checked={isSelected}
                                                            onChange={() => toggleProductSelection(p.id)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 cursor-pointer" onClick={() => toggleProductSelection(p.id)}>
                                                        <div className={`text-sm font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>{p.inventoryItemName}</div>
                                                        <div className="text-[10px] text-slate-400">{p.sku}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="number"
                                                            value={p.purchaseQuantity}
                                                            disabled={!isSelected}
                                                            onChange={(e) => updateProduct(p.id, 'purchaseQuantity', parseFloat(e.target.value) || 0)}
                                                            className={`w-20 px-2 py-1 border rounded text-right text-sm focus:border-emerald-600 outline-none ${isSelected ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent text-slate-400'}`}
                                                            min="1"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="number"
                                                            value={p.unitCostBeforeTax}
                                                            disabled={!isSelected}
                                                            onChange={(e) => updateProduct(p.id, 'unitCostBeforeTax', parseFloat(e.target.value) || 0)}
                                                            className={`w-24 px-2 py-1 border rounded text-right text-sm focus:border-emerald-600 outline-none ${isSelected ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent text-slate-400'}`}
                                                            min="0"
                                                            step="0.01"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="number"
                                                            value={p.taxPercentage}
                                                            disabled={!isSelected}
                                                            onChange={(e) => updateProduct(p.id, 'taxPercentage', parseFloat(e.target.value) || 0)}
                                                            className={`w-16 px-2 py-1 border rounded text-right text-sm focus:border-emerald-600 outline-none ${isSelected ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent text-slate-400'}`}
                                                            min="0"
                                                            max="100"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td className={`px-4 py-3 text-right text-sm font-black ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                        ${p.lineTotal.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleProductSelection(p.id);
                                                            }}
                                                            disabled={!isSelected}
                                                            className={`p-2 rounded-lg transition-colors ${isSelected ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-transparent cursor-default'}`}
                                                            title="Remove from order"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Footer */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Shipping Charges</label>
                            <input
                                type="number"
                                value={shippingCharges}
                                onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Additional Notes</label>
                            <textarea
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-600 outline-none resize-none"
                            />
                        </div>
                        <div className="pt-4 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Subtotal</span>
                                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Total Tax</span>
                                <span className="font-bold text-emerald-600">${totalTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Shipping</span>
                                <span className="font-bold text-slate-900">${shippingCharges.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg pt-2 border-t border-slate-100">
                                <span className="font-black text-slate-900 uppercase">Grand Total</span>
                                <span className="font-black text-emerald-600">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => handleSave('Draft')}
                                disabled={submitting}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave(inventoryStatus === 'Received' ? 'Received' : 'Ordered')}
                                disabled={submitting}
                                className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : (inventoryStatus === 'Received' ? 'Recieve Now' : 'Add Inventory')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Add Vendor Modal */}
            {
                showVendorModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-black text-slate-900 mb-6">Add New Supplier</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supplier Name *</label>
                                    <input
                                        type="text"
                                        value={newVendorName}
                                        onChange={(e) => setNewVendorName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                        placeholder="e.g. Acme Supplies"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Person</label>
                                    <input
                                        type="text"
                                        value={newVendorContact}
                                        onChange={(e) => setNewVendorContact(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                                    <input
                                        type="text"
                                        value={newVendorPhone}
                                        onChange={(e) => setNewVendorPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                        placeholder="Landline"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
                                    <input
                                        type="text"
                                        value={newVendorMobile}
                                        onChange={(e) => setNewVendorMobile(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                        placeholder="Mobile"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newVendorEmail}
                                        onChange={(e) => setNewVendorEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Website</label>
                                    <input
                                        type="text"
                                        value={newVendorWebsite}
                                        onChange={(e) => setNewVendorWebsite(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                                <textarea
                                    value={newVendorAddress}
                                    onChange={(e) => setNewVendorAddress(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 outline-none resize-none"
                                    placeholder="Full address..."
                                />
                            </div>
                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    onClick={() => setShowVendorModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateVendor}
                                    disabled={creatingVendor}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {creatingVendor ? 'Saving...' : 'Add Supplier'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
