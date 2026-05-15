'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { shopService } from '@/modules/shop/services/shopService';
import { ShopItem } from '@/modules/shop/types';
import { formatCurrency } from '@/utils';
import { Loader2, CheckCircle2, ShieldCheck, Truck, Zap, Plus, ShoppingBag, Heart, Share2, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/modules/shop/context/CartContext';
import { useToast } from '@/modules/shop/context/ToastContext';

export default function ItemDetailPage() {
    const params = useParams();
    const router = useRouter();
    const itemId = params.itemId as string;
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const [item, setItem] = useState<ShopItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await shopService.getItemById(itemId);
            if (data) {
                setItem(data);
                const initial: Record<string, string> = {};
                data.options?.forEach(opt => {
                    if (opt.type === 'select' && opt.choices) {
                        initial[opt.id] = opt.choices[0] || '';
                    } else if (opt.type === 'text') {
                        initial[opt.id] = '';
                    } else if (opt.type === 'file') {
                        initial[opt.id] = 'Pending Upload';
                    }
                });
                setSelections(initial);
            }
            setLoading(false);
        };
        load();
    }, [itemId]);

    const handleAddToCart = () => {
        if (!item) return;
        addToCart(item, selections, quantity);
        showToast(`${item.name} added to cart!`, 'success');
    };

    const handleBuyNow = () => {
        if (!item) return;
        addToCart(item, selections, quantity);
        router.push('/backoffice/shop/checkout');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Catalog...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="text-center py-40 space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto">
                    <X className="text-slate-300 w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Product Not Found</h1>
                <Link href="/backoffice/shop" className="inline-flex h-12 px-8 bg-emerald-600 text-white rounded-2xl items-center font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all">
                    Return to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-12 pb-20">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Link href="/backoffice/shop" className="hover:text-slate-900 transition-colors">Marketplace</Link>
                    <span className="opacity-30">/</span>
                    <Link href={`/backoffice/shop/${item.category}`} className="hover:text-slate-900 transition-colors">{item.category}</Link>
                    <span className="opacity-30">/</span>
                    <span className="text-slate-900">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setIsWishlisted(!isWishlisted);
                            showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
                        }}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isWishlisted ? 'bg-rose-50 border-rose-100 text-rose-500' : 'border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                            }`}
                    >
                        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            showToast('Link copied to clipboard', 'info');
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                {/* Left: Product Images (6 cols) */}
                <div className="lg:col-span-6 space-y-8 lg:sticky lg:top-40">
                    <div className="aspect-square rounded-[3.5rem] overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 group">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                    <div className="grid grid-cols-4 gap-4 px-2">
                        {[item.image, item.image, item.image, item.image].map((img, i) => (
                            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 hover:border-emerald-500 transition-all cursor-pointer group">
                                <img src={img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Product Details (6 cols) */}
                <div className="lg:col-span-6 space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
                                {item.stockStatus}
                            </span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">SKU: {item.id.toUpperCase()}</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                            {item.name}
                        </h1>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
                        {/* Pricing and Qty */}
                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Investment</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-900 tracking-tighter">
                                        {formatCurrency(item.price)}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                        {item.billingType === 'MONTHLY' ? '/ month' : 'one-time'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 font-black border border-slate-100 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                                >-</button>
                                <span className="w-10 text-center font-black text-slate-900 text-sm">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 font-black border border-slate-100 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                                >+</button>
                            </div>
                        </div>

                        {/* Customization Options */}
                        {item.options && item.options.length > 0 && (
                            <div className="space-y-8 pt-10 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Configuration Details</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-8">
                                    {item.options.map((opt) => (
                                        <div key={opt.id} className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                                                {opt.label}
                                                {opt.required && <span className="text-emerald-500">Required</span>}
                                            </label>
                                            {opt.type === 'select' ? (
                                                <div className="relative">
                                                    <select
                                                        value={selections[opt.id]}
                                                        onChange={(e) => setSelections(prev => ({ ...prev, [opt.id]: e.target.value }))}
                                                        className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[13px] outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all appearance-none cursor-pointer"
                                                    >
                                                        {opt.choices?.map(choice => (
                                                            <option key={choice} value={choice}>{choice}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                                        <Plus size={16} className="rotate-45" />
                                                    </div>
                                                </div>
                                            ) : opt.type === 'text' ? (
                                                <input
                                                    type="text"
                                                    placeholder={opt.placeholder}
                                                    value={selections[opt.id] || ''}
                                                    onChange={(e) => setSelections(prev => ({ ...prev, [opt.id]: e.target.value }))}
                                                    className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[13px] outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all"
                                                />
                                            ) : (
                                                <div className="group border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-white hover:border-emerald-500 transition-all cursor-pointer">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        <Plus size={24} className="text-emerald-600" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3">Upload Branding Assets</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">High-res PDF or PNG preferred</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features List */}
                        <div className="space-y-6 pt-10 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Service Guarantee</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                {item.includes.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-10 border-t border-slate-100 space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-xl shadow-slate-200"
                                >
                                    <ShoppingBag size={18} />
                                    Add To Manifest
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-2xl shadow-emerald-100"
                                >
                                    Confirm & Pay
                                </button>
                            </div>

                            <div className="flex items-center justify-around py-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                                <div className="flex flex-col items-center gap-2">
                                    <Truck size={16} className="text-slate-400" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">Express Delivery</span>
                                </div>
                                <div className="w-px h-8 bg-slate-100" />
                                <div className="flex flex-col items-center gap-2">
                                    <ShieldCheck size={16} className="text-slate-400" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">Secure Payment</span>
                                </div>
                                <div className="w-px h-8 bg-slate-100" />
                                <div className="flex flex-col items-center gap-2">
                                    <Zap size={16} className="text-slate-400" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
