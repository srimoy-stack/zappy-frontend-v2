'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { SHOP_ITEMS } from '../mock/data';
import { formatCurrency } from '@/utils';
import { ShopItem } from '../types';

export const ShopSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ShopItem[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        if (searchQuery.length > 1) {
            const results = SHOP_ITEMS.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 5);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    return (
        <div className="flex-1 max-w-full relative group">
            <div className="relative z-10">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-brand' : 'text-brand/40'}`} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Search restaurant supplies, packaging, or software..."
                    className="w-full h-11 pl-12 pr-12 bg-brand/5 rounded-xl border-none font-medium text-xs text-brand placeholder:text-brand/20 focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all outline-none"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-brand/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
                    <div className="p-3 bg-brand/5 border-b border-brand/10 flex items-center justify-between">
                        <span className="text-[9px] font-black text-brand/40 uppercase tracking-widest">Recommended Products</span>
                        <span className="text-[9px] font-bold text-brand uppercase">{searchResults.length} Found</span>
                    </div>
                    <div className="p-1">
                        {searchResults.map(item => (
                            <Link
                                key={item.id}
                                href={`/backoffice/shop/${item.category}/${item.id}`}
                                className="flex items-center gap-4 p-3 hover:bg-brand/5 rounded-xl transition-all group"
                            >
                                <div className="w-14 h-14 bg-brand/5 rounded-xl overflow-hidden shrink-0">
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-brand truncate group-hover:text-brand-dark transition-colors">{item.name}</p>
                                    <p className="text-[10px] font-medium text-brand/40 uppercase tracking-widest">{item.category}</p>
                                </div>
                                <p className="text-sm font-bold text-brand">{formatCurrency(item.price)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
