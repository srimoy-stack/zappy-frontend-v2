'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/modules/pos/context/POSContext';
import { useRouter } from 'next/navigation';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    ChevronRight,
    User,
    Utensils,
    ArrowLeft,
    Trash2
} from 'lucide-react';

// Mock product data
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    image?: string;
    description?: string;
}

interface CartItem extends Product {
    quantity: number;
}

const mockProducts: Product[] = [
    { id: 'P001', name: 'Margherita Pizza', category: 'Pizza', price: 12.99, description: 'Classic tomato & mozzarella' },
    { id: 'P002', name: 'Pepperoni Pizza', category: 'Pizza', price: 14.99, description: 'Loaded with pepperoni' },
    { id: 'P003', name: 'Truffle Pizza', category: 'Pizza', price: 18.99, description: 'Premium truffle oil & mushrooms' },
    { id: 'P004', name: 'BBQ Chicken Pizza', category: 'Pizza', price: 16.99, description: 'BBQ sauce, chicken, onions' },
    { id: 'P005', name: 'Veggie Supreme', category: 'Pizza', price: 15.99, description: 'Fresh vegetables & herbs' },
    { id: 'P006', name: 'Caesar Salad', category: 'Salads', price: 8.99, description: 'Romaine, parmesan, croutons' },
    { id: 'P007', name: 'Greek Salad', category: 'Salads', price: 9.99, description: 'Feta, olives, cucumber' },
    { id: 'P008', name: 'Garlic Bread', category: 'Sides', price: 4.99, description: 'Toasted with garlic butter' },
    { id: 'P009', name: 'Mozzarella Sticks', category: 'Sides', price: 6.99, description: 'Crispy fried cheese sticks' },
    { id: 'P010', name: 'Coca-Cola', category: 'Beverages', price: 2.99, description: '330ml can' },
    { id: 'P011', name: 'Sprite', category: 'Beverages', price: 2.99, description: '330ml can' },
    { id: 'P012', name: 'Orange Juice', category: 'Beverages', price: 3.99, description: 'Fresh squeezed' },
];

const categories = ['All', 'Pizza', 'Salads', 'Sides', 'Beverages'];

export const MenuPage: React.FC = () => {
    const { session } = usePOS();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<CartItem[]>([]);

    // Filter products
    const filteredProducts = mockProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Cart operations
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + delta;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            }).filter(item => item.quantity > 0);
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        // Navigate to payment/checkout
        router.push('/pos/checkout');
    };

    useEffect(() => {
        if (!session) {
            router.push('/pos/login');
        }
    }, [session, router]);

    if (!session) return null;

    return (
        <div className="flex h-screen bg-[#050505] text-neutral-100 font-sans overflow-hidden">
            {/* LEFT: MENU & PRODUCTS */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* HEADER */}
                <header className="h-20 bg-neutral-900 border-b border-neutral-800 px-8 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all shadow-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white">Menu</h1>
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                {session.channel} Order
                            </p>
                        </div>
                    </div>

                    {/* Customer Info (if selected) */}
                    {session.activeCustomer && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl">
                            <User size={16} className="text-brand" />
                            <div>
                                <div className="text-sm font-black text-white">{session.activeCustomer.name}</div>
                                <div className="text-[10px] font-bold text-brand uppercase tracking-widest">
                                    {session.activeCustomer.loyaltyPoints} PTS
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* SEARCH & CATEGORIES */}
                <div className="bg-neutral-900 border-b border-neutral-800 p-6 space-y-4 flex-shrink-0">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search menu items..."
                            className="w-full h-14 bg-neutral-800 border border-neutral-700 rounded-2xl pl-12 pr-6 text-base font-bold focus:border-brand focus:bg-neutral-700 outline-none transition-all placeholder:text-neutral-600 text-white"
                        />
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRODUCTS GRID */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="group bg-[#0a0a0a] border border-neutral-800 rounded-[2.5rem] p-6 text-left hover:border-brand hover:bg-neutral-900 transition-all active:scale-95 shadow-xl"
                            >
                                {/* Product Image Placeholder */}
                                <div className="w-full h-32 bg-neutral-900 rounded-3xl mb-4 flex items-center justify-center text-neutral-800 group-hover:bg-neutral-800 transition-all">
                                    <Utensils size={48} />
                                </div>

                                <h3 className="text-lg font-black text-white mb-1">{product.name}</h3>
                                <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{product.description}</p>

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-brand">${product.price.toFixed(2)}</span>
                                    <div className="p-2 bg-brand rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-brand/20">
                                        <Plus size={20} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-neutral-800/50 rounded-3xl flex items-center justify-center text-neutral-700 mx-auto mb-6">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">No items found</h3>
                            <p className="text-neutral-500">Try adjusting your search or category filter</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: CART */}
            <div className="w-[450px] bg-neutral-900 border-l border-neutral-800 flex flex-col flex-shrink-0">
                {/* Cart Header */}
                <div className="p-8 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingCart size={24} className="text-brand" />
                        <h3 className="text-2xl font-black text-white">Current Order</h3>
                    </div>
                    <span className="px-4 py-2 bg-neutral-800 rounded-xl text-sm font-black text-neutral-300">
                        {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}
                    </span>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-20 h-20 bg-neutral-800/50 rounded-3xl flex items-center justify-center text-neutral-700 mb-6">
                                <ShoppingCart size={32} />
                            </div>
                            <h4 className="text-lg font-black text-white mb-2">Cart is empty</h4>
                            <p className="text-neutral-500 text-sm">Add items from the menu to get started</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700">
                                <div className="flex items-start justify-between mb-3 text-white">
                                    <div className="flex-1">
                                        <h4 className="font-black text-white mb-1">{item.name}</h4>
                                        <p className="text-xs text-neutral-500">${item.price.toFixed(2)} each</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 bg-neutral-900 rounded-xl p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center text-white hover:bg-neutral-700 transition-all"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-black text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white hover:bg-brand-dark transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <span className="text-lg font-black text-brand">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer */}
                <div className="p-8 bg-[#0a0a0a]/50 border-t border-neutral-800 space-y-6">
                    {/* Order Summary */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-neutral-500">Subtotal</span>
                            <span className="text-white">${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-neutral-500">Tax (10%)</span>
                            <span className="text-white">${(cartTotal * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-neutral-800"></div>
                        <div className="flex justify-between">
                            <span className="text-lg font-black text-white">Total</span>
                            <span className="text-2xl font-black text-brand">
                                ${(cartTotal * 1.1).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className="w-full py-5 bg-brand text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-brand/20 hover:bg-brand-dark active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            Proceed to Payment <ChevronRight size={20} />
                        </button>
                        <button
                            className="w-full py-4 bg-neutral-800 text-neutral-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-neutral-700 hover:text-white transition-all shadow-lg"
                        >
                            Hold Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
