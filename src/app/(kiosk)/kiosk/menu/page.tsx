'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Info } from 'lucide-react';
import { useKioskStore } from '@/store/kioskStore';
import { menuService, Product, MenuData } from '@/services/kiosk/menuService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function KioskMenuPage() {
    const router = useRouter();
    const {
        selectedRestaurant,
        activeCategory,
        setActiveCategory,
        cart,
        totals
    } = useKioskStore();

    const [loading, setLoading] = useState(true);
    const [menuData, setMenuData] = useState<MenuData | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const data = await menuService.getMenu(selectedRestaurant?.id || 'default');
                setMenuData(data);
                const firstCategory = data.categories?.[0];
                if (firstCategory && !activeCategory) {
                    setActiveCategory(firstCategory.id);
                }
            } catch (error) {
                console.error("Failed to fetch menu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [selectedRestaurant, activeCategory, setActiveCategory]);

    useEffect(() => {
        // Scroll product grid to top when category changes
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [activeCategory]);

    const filteredProducts = menuData?.products.filter(p => p.categoryId === activeCategory) || [];

    const handleProductClick = (product: Product) => {
        if (product.inventory === 0) return;

        if (product.categoryId === 'cat-byo' || product.type === 'pizza') {
            router.push('/kiosk/builder');
        } else {
            router.push(`/kiosk/product/${product.id}`);
        }
    };

    if (loading && !menuData) {
        return <MenuSkeleton />;
    }

    return (
        <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
            {/* Header */}
            <header className="h-[100px] flex items-center justify-between px-10 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push('/kiosk/start')}
                        className="p-4 rounded-3xl bg-zinc-100 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={44} className="text-zinc-900" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Ordering from</span>
                        <h2 className="text-2xl font-black text-zinc-900 truncate max-w-[300px]">
                            {selectedRestaurant?.name || 'Zyappy Kitchen'}
                        </h2>
                    </div>
                </div>

                <h1 className="text-4xl font-black text-zinc-900 absolute left-1/2 -translate-x-1/2">Menu</h1>

                <div className="relative p-4 bg-zinc-100 rounded-3xl">
                    <ShoppingCart size={40} className="text-zinc-900" />
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-brand text-white text-lg font-black w-10 h-10 flex items-center justify-center rounded-full border-4 border-white shadow-lg">
                            {cart.length}
                        </span>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Category Rail */}
                <aside className="w-[280px] h-full border-r border-zinc-100 overflow-y-auto scrollbar-hide shrink-0 bg-zinc-50/50 pt-6">
                    <div className="flex flex-col gap-4 px-4 pb-12">
                        {menuData?.categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={cn(
                                    "flex items-center min-h-[90px] px-8 rounded-[32px] text-left transition-all duration-200 active:scale-[0.96] group relative",
                                    activeCategory === category.id
                                        ? "bg-white shadow-xl shadow-zinc-200/50"
                                        : "hover:bg-zinc-100/50"
                                )}
                            >
                                {activeCategory === category.id && (
                                    <div className="absolute left-3 w-2 h-10 bg-brand rounded-full"></div>
                                )}
                                <span className={cn(
                                    "text-xl font-black tracking-tight",
                                    activeCategory === category.id ? "text-zinc-900 translate-x-1" : "text-zinc-400"
                                )}>
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Product Grid */}
                <main
                    ref={scrollRef}
                    className="flex-1 h-full overflow-y-auto p-10 scrollbar-hide pb-32"
                >
                    <div className="grid grid-cols-2 gap-10">
                        {filteredProducts.map((product) => {
                            const isSoldOut = product.inventory === 0;
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => handleProductClick(product)}
                                    className={cn(
                                        "bg-white rounded-[48px] overflow-hidden shadow-2xl transition-all border border-zinc-50 flex flex-col group relative",
                                        isSoldOut ? "opacity-60 grayscale cursor-not-allowed" : "active:scale-[0.97]"
                                    )}
                                >
                                    {isSoldOut && (
                                        <div className="absolute top-6 left-6 z-10 bg-red-600 text-white px-6 py-2 rounded-full font-black text-lg uppercase tracking-widest shadow-lg">
                                            Sold Out
                                        </div>
                                    )}
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        {product.calories && (
                                            <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
                                                <Info size={16} className="text-white" />
                                                <span className="text-white text-sm font-bold">{product.calories} kcal</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8 flex flex-col gap-4 flex-1">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-3xl font-black text-zinc-900 leading-tight">
                                                {product.name}
                                            </h3>
                                            <p className="text-zinc-400 text-lg line-clamp-2">
                                                {product.description}
                                            </p>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <span className="text-4xl font-black text-brand">
                                                ${product.price.toFixed(2)}
                                            </span>
                                            <div className={cn(
                                                "p-4 rounded-2xl transition-colors",
                                                isSoldOut ? "bg-zinc-200 text-zinc-400" : "bg-brand/10 text-brand active:bg-brand active:text-white"
                                            )}>
                                                <span className="text-2xl font-black">+</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>


            {/* Sticky Bottom Cart Bar */}
            {cart.length > 0 && (
                <div className="absolute bottom-10 left-10 right-10 z-50 animate-in slide-in-from-bottom duration-300">
                    <button
                        onClick={() => router.push('/kiosk/cart')}
                        className="w-full h-[120px] bg-brand rounded-[40px] flex items-center justify-between px-12 shadow-[0_20px_50px_rgba(77,190,126,0.3)] active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-6 text-white">
                            <div className="bg-white/20 p-4 rounded-3xl">
                                <ShoppingCart size={40} />
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-3xl font-black uppercase tracking-widest">{cart.length} Items</span>
                                <span className="text-white/70 text-lg font-bold">View My Order</span>
                            </div>
                        </div>
                        <div className="h-16 w-1 bg-white/20 rounded-full"></div>
                        <div className="text-white text-right">
                            <span className="block text-lg font-bold text-white/70 uppercase">Total amount</span>
                            <span className="text-5xl font-black">${totals.total.toFixed(2)}</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}

function MenuSkeleton() {
    return (
        <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden animate-pulse">
            <div className="h-[100px] border-b border-zinc-100 flex items-center px-10">
                <div className="w-16 h-16 bg-zinc-100 rounded-3xl"></div>
                <div className="ml-10 w-48 h-10 bg-zinc-100 rounded-full"></div>
            </div>
            <div className="flex-1 flex">
                <div className="w-[280px] border-r border-zinc-100 p-6 space-y-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-20 bg-zinc-100 rounded-[32px]"></div>
                    ))}
                </div>
                <div className="flex-1 p-10 grid grid-cols-2 gap-10">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[400px] bg-zinc-50 rounded-[48px]"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
