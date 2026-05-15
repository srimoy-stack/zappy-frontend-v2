'use client';

import React, { useState } from 'react';
import {  ArrowRight, Loader2, Trash2, ShieldCheck, Zap, Info, CreditCard } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '@/utils';
import { useToast } from '../context/ToastContext';

interface CheckoutFormProps {
    items: CartItem[];
    onSuccess: (email: string) => void;
    onRemove?: (id: string, selections?: Record<string, string>) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ items, onSuccess, onRemove }) => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return showToast('Identity required for transaction', 'error');
        if (items.length === 0) return showToast('Catalog is currently empty', 'info');

        setIsProcessing(true);
        showToast('Initiating encrypted payment gateway...', 'info');

        await new Promise(resolve => setTimeout(resolve, 2500));

        setIsProcessing(false);
        onSuccess(email);
        showToast('Payment Authorized.', 'success');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Payment Details (7 cols) */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-12 order-2 lg:order-1">
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black">01</div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Customer Identity</h3>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Electronic Mail Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. procurement@enterprise.com"
                                className="w-full h-18 px-6 bg-white border-2 border-slate-100 rounded-3xl font-black text-slate-900 focus:border-emerald-600 focus:ring-8 focus:ring-emerald-600/5 transition-all outline-none text-lg"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black">02</div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Settlement Method</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-[2rem] flex gap-2">
                                <button type="button" className="flex-1 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
                                    <CreditCard size={16} />
                                    Credit Card
                                </button>
                                <button type="button" className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                    PayPal
                                </button>
                                <button type="button" className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                    Bank Transfer
                                </button>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="relative group">
                                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-emerald-600 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="4242 4242 4242 4242"
                                        defaultValue="4242 4242 4242 4242"
                                        className="w-full h-18 pl-16 pr-6 bg-white border-2 border-slate-100 rounded-3xl font-black text-slate-900 focus:border-emerald-600 focus:ring-8 focus:ring-emerald-600/5 transition-all outline-none text-lg"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="MM / YY"
                                        defaultValue="12 / 26"
                                        className="h-18 px-6 bg-white border-2 border-slate-100 rounded-3xl font-black text-slate-900 focus:border-emerald-600 focus:ring-8 focus:ring-emerald-600/5 transition-all outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVC"
                                        defaultValue="123"
                                        className="h-18 px-6 bg-white border-2 border-slate-100 rounded-3xl font-black text-slate-900 focus:border-emerald-600 focus:ring-8 focus:ring-emerald-600/5 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <button
                        type="submit"
                        disabled={isProcessing || items.length === 0}
                        className="w-full h-20 bg-emerald-600 shadow-2xl shadow-emerald-100 text-white rounded-[2.5rem] flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.2em] hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin w-6 h-6" />
                                Processing Transaction...
                            </>
                        ) : (
                            <>
                                Authorize Payment {formatCurrency(subtotal)}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    <div className="flex items-center justify-center gap-12 py-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-4 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Stripe_Logo%2C_revised_2016.png" alt="Stripe" className="h-6 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                    </div>
                </div>
            </form>

            {/* Purchase Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-12 order-1 lg:order-2 sticky top-32">
                <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-60" />

                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Investment Summary</h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{items.length} Packages</span>
                    </div>

                    <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                        {items.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="flex gap-5 group">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 group-hover:scale-105 transition-transform">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 truncate mb-1">{item.name}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(item.selections).map(([key, value]) => (
                                            <span key={key} className="text-[8px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
                                                {value}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Qty: {item.quantity}</p>
                                        <p className="text-xs font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                                {onRemove && (
                                    <button
                                        onClick={() => {
                                            onRemove(item.id, item.selections);
                                            showToast('Item removed from manifest', 'info');
                                        }}
                                        className="text-slate-300 hover:text-rose-500 transition-colors pt-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {items.length === 0 && (
                            <div className="py-16 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <Info className="text-slate-200" size={32} />
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Manifest is Empty</p>
                                <Link href="/backoffice/shop" className="inline-block text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">Explore Products</Link>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-8 border-t border-slate-100">
                        <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            <span>Subtotal Manifest</span>
                            <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            <span>Global Shipping</span>
                            <span className="text-emerald-600">FREE</span>
                        </div>
                        <div className="flex justify-between text-4xl font-black text-slate-900 pt-8 border-t border-slate-100 tracking-tighter items-end">
                            <span className="text-sm uppercase tracking-widest text-slate-400 leading-none pb-1 font-black">Total Due Now</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50/30 rounded-2xl flex flex-col gap-2 border border-blue-100/30">
                            <ShieldCheck className="text-blue-600" size={18} />
                            <p className="text-[8px] font-black text-blue-900 uppercase tracking-widest leading-relaxed">
                                End-to-End Encryption Enabled
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50/30 rounded-2xl flex flex-col gap-2 border border-emerald-100/30">
                            <Zap className="text-emerald-600" size={18} />
                            <p className="text-[8px] font-black text-emerald-900 uppercase tracking-widest leading-relaxed">
                                Guaranteed 48h Provisioning
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Link helper
import Link from 'next/link';
