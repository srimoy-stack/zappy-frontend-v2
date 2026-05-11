'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X, Search, ArrowRight } from 'lucide-react';
import '../styles/pos-rush.css';

const mockUnavailableItem = {
    id: 'P001',
    name: 'Large Pepperoni Pizza',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    reason: 'Out of stock'
};

const mockSubstitutes = [
    { id: 'P002', name: 'Large Margherita Pizza', price: 16.99, image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=800&q=80', similarity: 95 },
    { id: 'P003', name: 'Large Veggie Supreme', price: 17.99, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', similarity: 90 },
    { id: 'P004', name: 'Medium Pepperoni Pizza', price: 14.99, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', similarity: 85 },
];

export const ItemUnavailableScreen: React.FC = () => {
    const router = useRouter();
    const [selectedSubstitute, setSelectedSubstitute] = useState<typeof mockSubstitutes[0] | null>(null);

    const handleRemoveItem = () => {
        // Remove from cart and go back
        router.back();
    };

    const handleSubstitute = () => {
        if (selectedSubstitute) {
            // Replace in cart and go back
            router.back();
        }
    };

    const handleBrowseMenu = () => {
        router.push('/pos/menu');
    };

    return (
        <div className="pos-screen">
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
            }}>
                <div style={{ width: '100%', maxWidth: '900px' }}>
                    {/* Error Header */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '3px solid #EF4444',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <AlertCircle size={60} color="#FCA5A5" />
                        </div>
                        <h1 style={{ fontSize: '40px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
                            Item Unavailable
                        </h1>
                        <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            This item is currently out of stock
                        </p>
                    </div>

                    {/* Unavailable Item */}
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid #EF4444',
                        borderRadius: '24px',
                        padding: '24px',
                        marginBottom: '32px'
                    }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <img src={mockUnavailableItem.image} alt={mockUnavailableItem.name} style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
                                    {mockUnavailableItem.name}
                                </div>
                                <div style={{ fontSize: '16px', color: '#FCA5A5', fontWeight: 700, marginBottom: '8px' }}>
                                    {mockUnavailableItem.reason}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)' }}>
                                    ${mockUnavailableItem.price.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggested Substitutes */}
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '20px', textAlign: 'center' }}>
                            Suggested Substitutes
                        </h2>
                        <div className="pos-grid-3" style={{ gap: '16px' }}>
                            {mockSubstitutes.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedSubstitute(item)}
                                    style={{
                                        background: selectedSubstitute?.id === item.id ? 'white' : 'rgba(255, 255, 255, 0.1)',
                                        border: selectedSubstitute?.id === item.id ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '20px',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        textAlign: 'center'
                                    }}
                                >
                                    <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '12px', marginBottom: '12px' }} />
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: selectedSubstitute?.id === item.id ? '#1E3A8A' : 'white',
                                        marginBottom: '8px'
                                    }}>
                                        {item.name}
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 800,
                                        color: selectedSubstitute?.id === item.id ? '#1E3A8A' : 'white',
                                        marginBottom: '8px'
                                    }}>
                                        ${item.price.toFixed(2)}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: selectedSubstitute?.id === item.id ? '#64748B' : 'rgba(255, 255, 255, 0.7)'
                                    }}>
                                        {item.similarity}% match
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pos-grid-3" style={{ gap: '16px' }}>
                        <button
                            onClick={handleRemoveItem}
                            className="pos-btn pos-btn-secondary"
                            style={{ background: 'rgba(239, 68, 68, 0.2)', border: '2px solid #EF4444', color: '#FCA5A5' }}
                        >
                            <X size={20} />
                            Remove Item
                        </button>

                        <button
                            onClick={handleBrowseMenu}
                            className="pos-btn pos-btn-secondary"
                        >
                            <Search size={20} />
                            Browse Menu
                        </button>

                        <button
                            onClick={handleSubstitute}
                            disabled={!selectedSubstitute}
                            className="pos-btn pos-btn-primary"
                            style={{
                                background: selectedSubstitute ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                                cursor: selectedSubstitute ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Use Substitute
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
