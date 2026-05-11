'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2,
    MapPin,
    ChevronRight,
    Loader2,
    Search,
    Store
} from 'lucide-react';
import { merchantService } from '@/modules/m9/services/merchantService';
import { Merchant } from '@/modules/m9/types/merchant';

export default function MerchantsPage() {
    const router = useRouter();
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadMerchants();
    }, []);

    const loadMerchants = async () => {
        setLoading(true);
        try {
            const data = await merchantService.getMerchants();
            setMerchants(data);
        } catch (error) {
            console.error('Failed to load merchants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMerchants = merchants.filter(merchant =>
        merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto pb-24 space-y-8 animate-in fade-in duration-500 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl shadow-emerald-200">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Merchants</h1>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                            Manage your brand locations and operational settings
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search merchants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Merchants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMerchants.map((merchant) => (
                    <div
                        key={merchant.id}
                        onClick={() => router.push(`/backoffice/more/merchants/${merchant.id}`)}
                        className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {merchant.logoUrl ? (
                                    <img
                                        src={merchant.logoUrl}
                                        alt={merchant.name}
                                        className="w-12 h-12 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                                        {merchant.name}
                                    </h3>
                                    <span
                                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${merchant.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}
                                    >
                                        {merchant.status}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </div>

                        <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">
                            {merchant.description}
                        </p>

                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">
                                {merchant.totalLocations} {merchant.totalLocations === 1 ? 'Location' : 'Locations'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMerchants.length === 0 && (
                <div className="text-center py-16">
                    <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 mb-2">No merchants found</h3>
                    <p className="text-sm text-slate-500 font-medium">
                        {searchQuery ? 'Try adjusting your search query' : 'Get started by adding your first merchant'}
                    </p>
                </div>
            )}
        </div>
    );
}
