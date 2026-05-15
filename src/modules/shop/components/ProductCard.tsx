'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, Heart, Eye } from 'lucide-react';
import { ShopItem } from '../types';
import { formatCurrency } from '@/utils';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
    item: ShopItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [added, setAdded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleAddToCart = () => {
        const defaultSelections: Record<string, string> = {};
        item.options?.forEach(opt => {
            if (opt.type === 'select' && opt.choices) {
                defaultSelections[opt.id] = opt.choices[0] || '';
            } else if (opt.type === 'text') {
                defaultSelections[opt.id] = '';
            } else if (opt.type === 'file') {
                defaultSelections[opt.id] = 'Pending Upload';
            }
        });

        addToCart(item, defaultSelections);
        setAdded(true);
        showToast(`${item.name} added to cart!`, 'success');
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative">
            {/* Quick Actions Overlay */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <button
                    onClick={() => {
                        setIsWishlisted(!isWishlisted);
                        showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 hover:text-rose-500'
                        }`}
                >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                <Link
                    href={`/backoffice/shop/${item.category}/${item.id}`}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-lg transition-all"
                >
                    <Eye size={18} />
                </Link>
            </div>

            {/* Image Container */}
            <div className="h-80 bg-slate-50 relative overflow-hidden group-hover:bg-white transition-colors">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="p-10 space-y-6">
                <div className="space-y-3 min-h-[110px]">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${item.stockStatus === 'In Stock' ? 'bg-emerald-50 text-emerald-600' :
                            item.stockStatus === 'Best Seller' ? 'bg-amber-50 text-amber-600' :
                                'bg-rose-50 text-rose-600'
                            }`}>
                            {item.stockStatus}
                        </div>
                    </div>
                    <Link href={`/backoffice/shop/${item.category}/${item.id}`}>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                            {item.name}
                        </h3>
                    </Link>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {item.shortDescription}
                    </p>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Price per unit</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                            {formatCurrency(item.price)}
                            {item.billingType === 'MONTHLY' && <span className="text-xs text-slate-400 font-bold tracking-normal ml-1">/mo</span>}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={handleAddToCart}
                        className={`flex items-center justify-center gap-2 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${added
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                            : 'bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white'
                            }`}
                    >
                        {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                        {added ? 'Added to Cart' : 'Quick Add to Cart'}
                    </button>
                    <Link
                        href={`/backoffice/shop/${item.category}/${item.id}`}
                        className="flex items-center justify-center h-14 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-100"
                    >
                        View Details & Configure
                    </Link>
                </div>
            </div>
        </div>
    );
};
