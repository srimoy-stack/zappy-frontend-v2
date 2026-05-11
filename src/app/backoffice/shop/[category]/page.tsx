'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/modules/shop/components/ProductCard';
import { shopService } from '@/modules/shop/services/shopService';
import { ShopItem, Category } from '@/modules/shop/types';
import { Loader2, Plus, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

export default function CategoryListingPage() {
    const params = useParams();
    const categoryId = params.category as string;

    const [items, setItems] = useState<ShopItem[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(8);

    // Filter and Sort State
    const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');
    const [filterStock, setFilterStock] = useState<string>('All');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [catInfo, catItems] = await Promise.all([
                shopService.getCategoryById(categoryId),
                shopService.getItems(categoryId)
            ]);
            setCategory(catInfo || null);
            setItems(catItems);
            setLoading(false);
        };
        load();
    }, [categoryId]);

    // Apply Filters and Sorting
    const processedItems = useCallback(() => {
        let result = [...items];

        // Apply Filters
        if (filterStock !== 'All') {
            result = result.filter(item => item.stockStatus === filterStock);
        }

        // Apply Sorting
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // 'featured' - keep original order
                break;
        }

        return result;
    }, [items, sortBy, filterStock])();

    const handleLoadMore = useCallback(async () => {
        setIsMoreLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setVisibleCount(prev => prev + 4);
        setIsMoreLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
                <div className="space-y-2 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initializing Catalog</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase">Synchronizing inventory assets...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[4rem] max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Collection Not Available</h1>
                <p className="text-slate-500 font-medium mb-8">This collection is currently undergoing seasonal updates.</p>
                <Link href="/backoffice/shop" className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">Browse Active Categories</Link>
            </div>
        );
    }

    const itemsToShow = processedItems.slice(0, visibleCount);
    const hasMore = visibleCount < processedItems.length;

    return (
        <div className="space-y-16 animate-in fade-in duration-1000 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 px-2">
                <div className="max-w-3xl space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span>Catalog</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-slate-900">{category.name} Edition</span>
                    </div>
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.85]">
                        {category.title}
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                        {category.subtitle}
                    </p>
                </div>

                {/* Filter / Sort UI */}
                <div className="flex items-center gap-3 relative">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }}
                            className={cn(
                                "h-14 px-8 border rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                                filterStock !== 'All'
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white border-slate-100 text-slate-900 hover:border-emerald-600"
                            )}
                        >
                            <SlidersHorizontal size={16} />
                            {filterStock === 'All' ? 'Filter' : filterStock}
                        </button>

                        {showFilterDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 bg-slate-50 border-b border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                                </div>
                                <div className="p-1">
                                    {['All', 'In Stock', 'Low Stock', 'Best Seller'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => { setFilterStock(status); setShowFilterDropdown(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors",
                                                filterStock === status ? "bg-emerald-50 text-emerald-700 font-black" : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}
                            className="h-14 px-8 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:border-emerald-600 transition-all shadow-sm"
                        >
                            Sort By
                            <ChevronDown size={16} className={cn("text-slate-400 transition-transform", showSortDropdown && "rotate-180")} />
                        </button>

                        {showSortDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 bg-slate-50 border-b border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sorting Method</p>
                                </div>
                                <div className="p-1">
                                    {[
                                        { id: 'featured', label: 'Featured' },
                                        { id: 'price-asc', label: 'Price: Low to High' },
                                        { id: 'price-desc', label: 'Price: High to Low' },
                                        { id: 'name-asc', label: 'A-Z' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setSortBy(opt.id as any); setShowSortDropdown(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors",
                                                sortBy === opt.id ? "bg-emerald-50 text-emerald-700 font-black" : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {itemsToShow.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 px-2">
                    {itemsToShow.map((item, idx) => (
                        <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
                            <ProductCard item={item} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                    <p className="text-xl font-black text-slate-300 uppercase tracking-tighter">No items match your criteria</p>
                    <button
                        onClick={() => { setFilterStock('All'); setSortBy('featured'); }}
                        className="mt-6 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}

            {/* Load More Section */}
            {hasMore && (
                <div className="flex flex-col items-center pt-20">
                    <button
                        onClick={handleLoadMore}
                        disabled={isMoreLoading}
                        className="group flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-[2.5rem] text-sm font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200/50 disabled:opacity-50"
                    >
                        {isMoreLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Explore More
                                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            </>
                        )}
                    </button>
                    <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Showing {itemsToShow.length} of {processedItems.length} Products</p>
                </div>
            )}
        </div>
    );
}

// Internal Link helper
import Link from 'next/link';
