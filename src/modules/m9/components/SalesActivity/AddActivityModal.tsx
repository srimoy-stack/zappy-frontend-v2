'use client';

import React, { useState } from 'react';
import { X, Save, DollarSign, User, Hash, Tag, CreditCard, Layout, Package } from 'lucide-react';
import { TransactionEvent } from '../../types/sales-activity';

interface AddActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (transaction: Partial<TransactionEvent>) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
    isOpen,
    onClose,
    onAdd
}) => {
    const [formData, setFormData] = useState<Partial<TransactionEvent>>({
        type: 'ORDER_PAID',
        channel: 'POS',
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        currency: 'USD',
        status: 'completed',
        totalItems: 1,
        totalAmount: 0,
        basePrice: 0,
        tax: 0,
        netPrice: 0,
        sellPrice: 0,
        returnAmount: 0,
        shipping: 0,
        netDue: 0,
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            id: `TX-${Math.floor(Math.random() * 10000)}`,
            timestamp: new Date().toISOString(),
            userId: 'sys-01', // Mock user
            userName: 'Current User', // Mock user
        });
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Sales Activity</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manual Transaction Entry</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Content */}
                    <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Section: Basic Info */}
                            <div className="space-y-5">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5" /> General Information
                                </h4>

                                <FormInput label="Invoice Number" icon={Hash}>
                                    <input
                                        required
                                        type="text"
                                        name="invoiceNo"
                                        value={formData.invoiceNo || ''}
                                        onChange={handleChange}
                                        placeholder="e.g. S4724"
                                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </FormInput>

                                <FormInput label="Transaction Type" icon={Layout}>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                                    >
                                        <option value="ORDER_PAID">Order Paid</option>
                                        <option value="REFUND">Refund</option>
                                        <option value="PARTIAL_REFUND">Partial Refund</option>
                                    </select>
                                </FormInput>

                                <FormInput label="Customer Name" icon={User}>
                                    <input
                                        required
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName || ''}
                                        onChange={handleChange}
                                        placeholder="Guest Customer"
                                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </FormInput>

                                <FormInput label="Channel" icon={Tag}>
                                    <select
                                        name="channel"
                                        value={formData.channel}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                                    >
                                        <option value="POS">In-Store (POS)</option>
                                        <option value="ONLINE">Online Store</option>
                                        <option value="UBER">Uber Eats</option>
                                        <option value="PHONE">Phone Order</option>
                                    </select>
                                </FormInput>
                            </div>

                            {/* Section: Financials & Status */}
                            <div className="space-y-5">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5" /> Financial Details
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="Total Amount" icon={DollarSign}>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            name="totalAmount"
                                            value={formData.totalAmount}
                                            onChange={handleChange}
                                            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        />
                                    </FormInput>
                                    <FormInput label="Total Items" icon={Package}>
                                        <input
                                            required
                                            type="number"
                                            name="totalItems"
                                            value={formData.totalItems}
                                            onChange={handleChange}
                                            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        />
                                    </FormInput>
                                </div>

                                <FormInput label="Payment Method" icon={CreditCard}>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Credit/Debit Card</option>
                                        <option value="Online">Online Payment</option>
                                    </select>
                                </FormInput>

                                <FormInput label="Payment Status" icon={Layout}>
                                    <select
                                        name="paymentStatus"
                                        value={formData.paymentStatus}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                                    >
                                        <option value="Paid">Fully Paid</option>
                                        <option value="Partial">Partially Paid</option>
                                        <option value="Due">Payment Due</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </FormInput>

                                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                    <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-2">Location Context</p>
                                    <p className="text-[11px] text-emerald-600 leading-relaxed font-medium">
                                        This record will be tagged to your current active store location automatically for audit consistency.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all shadow-xl shadow-slate-200 active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Force Record Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FormInput = ({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
            </div>
            {children}
        </div>
    </div>
);
