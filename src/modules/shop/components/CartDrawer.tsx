'use client';

import React from 'react';
import { ShoppingBag, X, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '@/utils';
import Link from 'next/link';

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, cartTotal, cartCount } = useCart();

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-brand/20 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                {/* Header */}
                <div className="p-8 border-b border-brand/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-brand" />
                        <div>
                            <h3 className="text-xl font-black text-brand tracking-tight">Your Cart</h3>
                            <p className="text-[10px] font-bold text-brand/40 uppercase tracking-widest">{cartCount} Items Selected</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-brand/5 rounded-2xl text-brand/40 hover:text-brand transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {cartItems.length > 0 ? (
                        cartItems.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                                <div className="w-20 h-20 bg-brand/5 rounded-2xl overflow-hidden shrink-0 border border-brand/10">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className="text-sm font-black text-brand truncate">{item.name}</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(item.selections).map(([key, value]) => (
                                            <span key={key} className="text-[9px] font-bold text-brand/40 bg-brand/5 px-1.5 py-0.5 rounded border border-brand/10 border-dashed uppercase">
                                                {value}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-sm font-black text-brand">{formatCurrency(item.price * item.quantity)}</p>
                                        <button
                                            onClick={() => removeFromCart(item.id, item.selections)}
                                            className="text-brand/20 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <ShoppingBag size={48} className="text-brand/20" />
                            <p className="text-sm font-bold text-brand uppercase tracking-widest leading-relaxed">
                                Your catalog is empty.<br />Start adding products.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-8 border-t border-brand/10 bg-brand/5 space-y-6">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] font-black text-brand/40 uppercase tracking-widest mb-1">Estimated Total</p>
                                <p className="text-3xl font-black text-brand tracking-tighter">{formatCurrency(cartTotal)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-brand/40 uppercase">Taxes included at checkout</p>
                            </div>
                        </div>

                        <Link
                            href="/backoffice/shop/checkout"
                            onClick={onClose}
                            className="w-full h-16 bg-brand text-white rounded-[2rem] flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-brand-dark shadow-xl shadow-brand/10 active:scale-95 transition-all"
                        >
                            Proceed to Checkout
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};
