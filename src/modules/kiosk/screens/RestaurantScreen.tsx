'use client';

import { useKioskStore } from '@/store/kioskStore';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';

const RESTAURANTS = [
    {
        id: '1',
        name: 'Zyappy Kitchen',
        location: 'Downtown • 123 Main St',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
        color: '#FF6B35',
        status: 'Open',
        closesAt: '10:00 PM',
    },
    {
        id: '2',
        name: 'Zyappy Express',
        location: 'North Hub • 456 Plaza Way',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
        color: '#4dbe7e',
        status: 'Open',
        closesAt: '7:00 PM',
    },
    {
        id: '3',
        name: 'Zyappy Grill',
        location: 'Sunset Blvd • Coastal Road',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
        color: '#1a1a2e',
        status: 'Open',
        closesAt: '12:00 AM',
    },
];

export function RestaurantScreen() {
    const { setRestaurant, navigateTo, goBack } = useKioskStore();

    const handleSelect = (restaurant: typeof RESTAURANTS[0]) => {
        setRestaurant({
            id: restaurant.id,
            name: restaurant.name,
            location: restaurant.location,
            image: restaurant.image,
            color: restaurant.color,
        });
        navigateTo('menu');
    };

    return (
        <div className="kiosk-restaurant-screen">
            {/* Header */}
            <header className="kiosk-restaurant-header">
                <button onClick={goBack} className="kiosk-back-btn">
                    <ArrowLeft size={36} />
                </button>
                <div className="kiosk-restaurant-header-text">
                    <h1>Choose Your Craving</h1>
                    <p>Select a restaurant</p>
                </div>
                <div style={{ width: 68 }} />
            </header>

            {/* Restaurant Cards Grid */}
            <main className="kiosk-restaurant-main">
                <div className="kiosk-restaurant-grid">
                    {RESTAURANTS.map(restaurant => (
                        <button
                            key={restaurant.id}
                            onClick={() => handleSelect(restaurant)}
                            className="kiosk-restaurant-card"
                        >
                            <div className="kiosk-restaurant-card-inner">
                                <div className="kiosk-restaurant-card-image">
                                    <img src={restaurant.image} alt={restaurant.name} />
                                    <div className="kiosk-restaurant-card-overlay" />
                                </div>
                                <div className="kiosk-restaurant-card-content">
                                    <h3>{restaurant.name}</h3>
                                    <div className="kiosk-restaurant-card-meta">
                                        <div className="kiosk-restaurant-status">
                                            <div className="kiosk-restaurant-status-dot" />
                                            <span>{restaurant.status}</span>
                                        </div>
                                        <span className="kiosk-restaurant-closes">
                                            <Clock size={14} />
                                            Closes at {restaurant.closesAt}
                                        </span>
                                    </div>
                                    <div className="kiosk-restaurant-card-location">
                                        <MapPin size={16} />
                                        <span>{restaurant.location}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            {/* Security Notice */}
            <footer className="kiosk-restaurant-footer">
                <p>This kiosk is under 24-hour CCTV video monitoring for your safety and security.</p>
            </footer>
        </div>
    );
}
