'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, Edit3, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { useKioskStore } from '@/store/kioskStore';
import { menuService, Product } from '@/services/kiosk/menuService';

export default function KioskCartPage() {
    const router = useRouter();
    const { cart, totals, updateCartItemQuantity, removeCartItem, clearCart, addToCart } = useKioskStore();
    const [upsells, setUpsells] = useState<Product[]>([]);
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchUpsells = async () => {
            const data = await menuService.getUpsellProducts();
            setUpsells(data);
        };
        fetchUpsells();
    }, []);

    const toggleExpand = (index: number) => {
        setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleCheckout = () => {
        router.push('/kiosk/review');
    };

    const handleUpsellAdd = (product: Product) => {
        if (product.type === 'pizza') {
            router.push('/kiosk/builder');
            return;
        }

        addToCart({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            basePrice: product.price,
            image: product.image,
            selectedModifiers: {},
            selectedCombo: {},
            quantity: 1,
            kitchenNote: '',
            price: product.price,
            finalTotal: product.price,
            type: 'item'
        });
    };

    if (cart.length === 0) {
        return (
            <div className="flex-1 flex flex-col bg-white h-screen items-center justify-center p-10 text-center">
                <div className="w-64 h-64 bg-zinc-50 rounded-full flex items-center justify-center mb-10 overflow-hidden">
                    <ShoppingBag size={120} className="text-zinc-200" />
                </div>
                <h1 className="text-6xl font-black text-zinc-900 mb-4">Your cart is empty</h1>
                <p className="text-2xl text-zinc-400 font-medium mb-12 max-w-md">
                    Looks like you haven't added anything to your order yet.
                </p>
                <button
                    onClick={() => router.push('/kiosk/menu')}
                    className="h-24 px-12 bg-brand text-white rounded-[40px] text-3xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-brand/20"
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden relative">
            {/* Header */}
            <header className="h-[100px] flex items-center justify-between px-10 border-b border-zinc-100 shrink-0 bg-white z-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push('/kiosk/menu')}
                        className="p-4 rounded-3xl bg-zinc-100 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={44} className="text-zinc-900" />
                    </button>
                    <h1 className="text-4xl font-black text-zinc-900">Your Order</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-zinc-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                        <ShoppingBag size={24} className="text-zinc-500" />
                        <span className="text-xl font-black text-zinc-900">{cart.length} Items</span>
                    </div>
                </div>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto pb-[220px] scrollbar-hide">
                <div className="p-10 space-y-8">
                    {/* Cart Items */}
                    <div className="space-y-6">
                        {cart.map((item, index) => {
                            const hasCustomizations = (item.modifierNames?.length || 0) > 0 || (item.comboNames?.length || 0) > 0;
                            const isExpanded = expandedItems[index];

                            return (
                                <div key={`${item.productId}-${index}`} className="bg-zinc-50/50 rounded-[48px] p-8 space-y-6 border border-zinc-100 shadow-sm relative overflow-hidden flex flex-col">
                                    <div className="flex gap-8">
                                        <div className="w-40 h-40 rounded-[32px] overflow-hidden shrink-0 shadow-lg">
                                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="text-3xl font-black text-zinc-900 truncate pr-4">{item.name}</h3>
                                                <span className="text-3xl font-black text-brand shrink-0">
                                                    ${item.finalTotal.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {hasCustomizations && (
                                                    <button
                                                        onClick={() => toggleExpand(index)}
                                                        className="flex items-center gap-2 text-brand font-black text-lg bg-brand/5 px-4 py-1 rounded-full active:scale-95"
                                                    >
                                                        Details
                                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </button>
                                                )}
                                                {item.kitchenNote && <span className="text-zinc-400 font-bold text-lg truncate flex-1 italic">"{item.kitchenNote}"</span>}
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-6 bg-white p-2 rounded-[24px] shadow-sm">
                                                    <button
                                                        onClick={() => updateCartItemQuantity(index, -1)}
                                                        className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center active:scale-90"
                                                    >
                                                        <Minus size={28} />
                                                    </button>
                                                    <span className="text-2xl font-black w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartItemQuantity(index, 1)}
                                                        className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center active:scale-90"
                                                    >
                                                        <Plus size={28} />
                                                    </button>
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => router.push(`/kiosk/product/${item.productId}?edit=${index}`)}
                                                        className="p-4 rounded-2xl bg-white text-zinc-400 active:scale-90 shadow-sm transition-all"
                                                    >
                                                        <Edit3 size={28} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeCartItem(index)}
                                                        className="p-4 rounded-2xl bg-red-50 text-red-500 active:scale-90 shadow-sm transition-all"
                                                    >
                                                        <Trash2 size={28} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Collapsible Details */}
                                    {isExpanded && hasCustomizations && (
                                        <div className="pt-6 border-t border-zinc-200 mt-2 animate-in slide-in-from-top-4 duration-300">
                                            <div className="space-y-4">
                                                {item.comboNames && item.comboNames.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-black text-zinc-400 uppercase tracking-widest">Combo Choices</p>
                                                        <ul className="space-y-1">
                                                            {item.comboNames.map((name, i) => (
                                                                <li key={i} className="text-xl font-bold text-zinc-700 flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-brand"></div>
                                                                    {name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {item.modifierNames && item.modifierNames.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-black text-zinc-400 uppercase tracking-widest">Modifiers</p>
                                                        <ul className="space-y-1">
                                                            {item.modifierNames.map((name, i) => (
                                                                <li key={i} className="text-xl font-bold text-zinc-700 flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                                                                    {name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="h-px bg-zinc-100"></div>

                    {/* Upsell Section */}
                    <div className="space-y-8 py-4">
                        <h4 className="text-3xl font-black text-zinc-900 px-2">Complete Your Meal</h4>
                        <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide px-2">
                            {upsells.map((product) => (
                                <div
                                    key={product.id}
                                    className="min-w-[320px] bg-white rounded-[40px] p-6 border border-zinc-100 shadow-xl shadow-zinc-200/20 flex flex-col gap-4"
                                >
                                    <div className="aspect-video rounded-[24px] overflow-hidden shadow-inner">
                                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-2xl font-black text-zinc-900 truncate">{product.name}</h5>
                                        <p className="text-xl font-black text-brand">${product.price.toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={() => handleUpsellAdd(product)}
                                        className="h-16 w-full bg-zinc-900 text-white rounded-[24px] text-lg font-black uppercase active:scale-95 transition-all"
                                    >
                                        Add to order
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-zinc-50 rounded-[48px] p-10 space-y-6">
                        <div className="flex justify-between text-2xl font-bold text-zinc-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-zinc-900">${totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-zinc-400 uppercase tracking-widest">
                            <span>Tax (10%)</span>
                            <span className="text-zinc-900">${totals.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-zinc-400 uppercase tracking-widest">
                            <span>Service Charge</span>
                            <span className="text-zinc-900">${totals.serviceCharge.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-zinc-200"></div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-4xl font-black text-zinc-900 uppercase tracking-tighter">Total Amount</span>
                            <span className="text-6xl font-black text-brand">${totals.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Safety Clear Button */}
                    <button
                        onClick={() => {
                            if (window.confirm("Clear entire order?")) clearCart();
                        }}
                        className="w-full py-8 text-xl font-black text-red-500/50 uppercase tracking-widest hover:text-red-500 active:scale-95 transition-all"
                    >
                        Clear Order
                    </button>
                </div>
            </main>

            {/* Sticky Bottom Checkout Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-10 bg-white border-t border-zinc-100 flex flex-col gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                <button
                    onClick={handleCheckout}
                    className="h-[110px] bg-brand text-white rounded-[40px] flex items-center justify-center gap-6 active:scale-[0.98] transition-transform shadow-[0_20px_40px_rgba(77,190,126,0.3)]"
                >
                    <span className="text-3xl font-black uppercase tracking-widest">Checkout Now</span>
                    <div className="w-1.5 h-10 bg-white/20 rounded-full"></div>
                    <span className="text-5xl font-black">${totals.total.toFixed(2)}</span>
                </button>
            </div>
        </div>
    );
}
