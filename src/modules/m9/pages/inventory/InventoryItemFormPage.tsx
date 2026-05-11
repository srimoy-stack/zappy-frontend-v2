'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import {
    ArrowLeft,
    Save,
    Package,
    AlertCircle
} from 'lucide-react';
import { BaseUnit, ItemStatus, CreateInventoryItemDTO } from '../../types/inventory';
import { inventoryItemService } from '../../services/inventoryService';

/**
 * Inventory Item Form Page (Create / Edit)
 * 
 * Used to define standard inventory items (ingredients).
 * Note: Stock is NOT managed here (use Adjust Stock or Inventory Entries).
 */
export const InventoryItemFormPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [baseUnit, setBaseUnit] = useState<BaseUnit>('Piece');
    const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
    const [status, setStatus] = useState<ItemStatus>('Active');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isEditMode && id) {
            loadItem(id);
        }
    }, [id, isEditMode]);

    const loadItem = async (itemId: string) => {
        try {
            const data = await inventoryItemService.getById(itemId);
            if (data) {
                setName(data.name);
                setSku(data.sku);
                setBaseUnit(data.baseUnit);
                setLowStockThreshold(data.lowStockThreshold);
                setStatus(data.status);
                setDescription(data.description || '');
            } else {
                alert('Item not found');
                router.push('/backoffice/inventory/list');
            }
        } catch (error) {
            console.error('Failed to load item:', error);
            alert('Error loading item details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('Item Name is required');
            return;
        }
        if (!sku.trim()) {
            alert('SKU is required');
            return;
        }

        setSubmitting(true);
        try {
            const itemData: CreateInventoryItemDTO = {
                name,
                sku,
                baseUnit,
                lowStockThreshold,
                status,
                description
            };

            if (isEditMode && id) {
                await inventoryItemService.update(id, itemData);
                alert('Item updated successfully');
            } else {
                await inventoryItemService.create(itemData, 'TENANT001');
                alert('Item created successfully');
            }
            router.push('/backoffice/inventory/list');
        } catch (error: any) {
            console.error('Failed to save item:', error);
            alert('Failed to save item: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Package className="w-12 h-12 text-slate-400 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading item details...</p>
                </div>
            </div>
        );
    }

    const units: BaseUnit[] = ['Piece', 'Gram', 'Kilogram', 'Liter', 'Milliliter'];

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.push(isEditMode ? `/backoffice/inventory/items/${id}` : '/backoffice/inventory/list')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isEditMode ? 'Edit Item' : 'Create New Item'}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {isEditMode ? 'Update item details' : 'Define new inventory ingredient'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Cheddar Cheese Block"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SKU *</label>
                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="e.g., ING-001"
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Base Unit *</label>
                            <select
                                value={baseUnit}
                                onChange={(e) => setBaseUnit(e.target.value as BaseUnit)}
                                disabled={isEditMode} // Usually risky to change unit if stock exists
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
                            >
                                {units.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                            {isEditMode && <p className="text-xs text-amber-500 mt-1 font-medium">Unit cannot be changed after creation</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Optional details about this item..."
                            className="w-full p-4 rounded-xl border border-slate-200 font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Low Stock Threshold
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={lowStockThreshold}
                                    onChange={(e) => setLowStockThreshold(parseFloat(e.target.value) || 0)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                    {baseUnit}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                            <div className="flex p-1 bg-slate-100 rounded-xl h-12 items-center">
                                {(['Active', 'Inactive'] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all h-10 ${status === s
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-800">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <p className="text-xs font-medium leading-relaxed">
                            <strong>Note:</strong> Initial stock cannot be set here. Use the "Adjust Stock" feature or "Receive Inventory" to add stock after creating the item.
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={() => router.push('/backoffice/inventory/list')}
                        className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {submitting ? 'Saving...' : (isEditMode ? 'Update Item' : 'Create Item')}
                    </button>
                </div>
            </div>
        </div>
    );
};
