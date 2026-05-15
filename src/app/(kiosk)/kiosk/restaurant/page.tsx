'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useKioskStore } from '@/store/kioskStore';

const RESTAURANTS = [
    {
        id: '1',
        name: 'Zyappy Kitchen - Downtown',
        location: '123 Main St, Central District',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000',
        color: 'bg-orange-500'
    },
    {
        id: '2',
        name: 'Zyappy Express - North Hub',
        location: '456 Plaza Way, Business Park',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000',
        color: 'bg-brand'
    },
    {
        id: '3',
        name: 'Zyappy Grill - Sunset Blvd',
        location: '789 Sunset Blvd, Coastal Road',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000',
        color: 'bg-zinc-800'
    }
];

export default function KioskRestaurantPage() {
    const router = useRouter();
    const setRestaurant = useKioskStore((state) => state.setRestaurant);

    const handleSelect = (restaurant: any) => {
        setRestaurant(restaurant);
        router.push('/kiosk/menu');
    };

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-12 py-12 relative">
                <button
                    onClick={() => router.push('/kiosk/start')}
                    className="p-6 rounded-3xl bg-zinc-100 active:scale-90 transition-transform"
                >
                    <ArrowLeft size={48} className="text-zinc-900" />
                </button>
                <h1 className="absolute left-1/2 -translate-x-1/2 text-5xl font-black text-zinc-900">
                    Select Restaurant
                </h1>
                <div className="w-[96px]"></div> {/* Spacer for symmetry */}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-12 pb-24 scrollbar-hide space-y-12">
                {RESTAURANTS.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        onClick={() => handleSelect(restaurant)}
                        className="relative w-full aspect-[16/10] rounded-[48px] overflow-hidden shadow-2xl active:scale-[0.97] transition-all duration-200 group"
                    >
                        {/* Background Image */}
                        <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                        {/* Content */}
                        <div className="absolute inset-x-0 bottom-0 p-12 flex flex-col gap-2">
                            <span className="text-zinc-300 text-xl font-bold uppercase tracking-widest">
                                {restaurant.location}
                            </span>
                            <h3 className="text-6xl font-black text-white tracking-tight">
                                {restaurant.name}
                            </h3>

                            <div className="mt-6 flex items-center gap-4">
                                <span className="bg-brand text-white px-6 py-2 rounded-full text-lg font-bold">
                                    OPEN NOW
                                </span>
                                <span className="text-white/60 text-lg">
                                    Fastest Pickup: 15 mins
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Safe Area Decoration if needed */}
            <div className="h-12 bg-white flex shrink-0"></div>
        </div>
    );
}
