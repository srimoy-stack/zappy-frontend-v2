'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    Utensils,
    ShoppingBag,
    Truck,
    ChevronLeft,
    Clock,
    ArrowRight
} from 'lucide-react';
import { OrderChannel } from '@/modules/pos/types/pos';
import '../styles/pos-rush.css';

const FULFILLMENT_OPTIONS = [
    {
        id: 'Dine-In' as OrderChannel,
        label: 'Dine-In',
        icon: Utensils,
        color: '#22C55E', // Green
        description: 'Table service & in-store dining',
        features: ['Table Assignment', 'Kitchen Printing', 'Pay Later']
    },
    {
        id: 'Pickup' as OrderChannel,
        label: 'Takeaway / Pickup',
        icon: ShoppingBag,
        color: '#3B82F6', // Blue
        description: 'Customer self-collection',
        features: ['Express Prep', 'Packaging', 'Instant Pay']
    },
    {
        id: 'Delivery' as OrderChannel,
        label: 'Delivery',
        icon: Truck,
        color: '#F59E0B', // Amber
        description: 'Home delivery service',
        features: ['Courier Assignment', 'Address Details', 'ETA Tracking']
    }
];

export const POSFulfillmentPage: React.FC = () => {
    const router = useRouter();
    const { setChannel, session } = usePOS();

    const handleSelect = (channel: OrderChannel) => {
        setChannel(channel);

        // Exact behavior rules from requirements
        if (channel === 'Dine-In') {
            // Dine-In -> no address required
            router.push('/pos/menu');
        } else if (channel === 'Pickup') {
            // Takeaway -> minimal customer info
            router.push('/pos/customer-search');
        } else if (channel === 'Delivery') {
            // Delivery -> triggers Delivery Details screen (will follow customer lookup)
            router.push('/pos/customer-search');
        }
    };

    return (
        <div className="pos-screen" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: 'var(--pos-bg-main)',
            overflow: 'hidden'
        }}>
            {/* Header Area */}
            <header style={{
                padding: '40px 60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={() => router.push('/pos/dashboard')}
                        className="pos-icon-btn"
                        style={{ width: '64px', height: '64px', background: 'var(--pos-bg-surface)' }}
                    >
                        <ChevronLeft size={32} color="var(--pos-text-primary)" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                            Order Fulfillment
                        </h1>
                        <p style={{ fontSize: '18px', color: 'var(--pos-text-muted)', fontWeight: 600, margin: '8px 0 0 0' }}>
                            Select service type for {session?.store?.name}
                        </p>
                    </div>
                </div>

                <div style={{
                    background: 'var(--pos-bg-surface)',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    border: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Clock size={20} color="var(--pos-action-primary)" />
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--pos-text-primary)', fontFamily: 'monospace' }}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </header>

            {/* Selection Grid */}
            <main style={{
                flex: 1,
                padding: '0 60px 60px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '32px',
                alignItems: 'center'
            }}>
                {FULFILLMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            style={{
                                height: '100%',
                                maxHeight: '550px',
                                background: 'var(--pos-bg-surface)',
                                border: '2px solid var(--pos-border-subtle)',
                                borderRadius: '40px',
                                padding: '60px 40px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '24px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02) translateY(-10px)';
                                e.currentTarget.style.borderColor = option.color;
                                e.currentTarget.style.boxShadow = `0 25px 50px -12px ${option.color}40`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--pos-border-subtle)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -12px rgba(0, 0, 0, 0.5)';
                            }}
                        >
                            <div style={{
                                width: '140px',
                                height: '140px',
                                background: 'var(--pos-bg-main)',
                                borderRadius: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `4px solid ${option.color}20`
                            }}>
                                <Icon size={72} color={option.color} strokeWidth={2.5} />
                            </div>

                            <div>
                                <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: '0 0 12px 0' }}>
                                    {option.label}
                                </h2>
                                <p style={{ fontSize: '16px', color: 'var(--pos-text-secondary)', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                                    {option.description}
                                </p>
                            </div>

                            <div style={{
                                width: '100%',
                                marginTop: '12px',
                                padding: '24px',
                                background: 'var(--pos-bg-main)',
                                borderRadius: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                textAlign: 'left'
                            }}>
                                {option.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: option.color }}></div>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pos-text-muted)' }}>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                marginTop: 'auto',
                                width: '100%',
                                padding: '20px',
                                borderRadius: '20px',
                                background: `${option.color}10`,
                                color: option.color,
                                fontSize: '16px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                SELECT TYPE <ArrowRight size={20} />
                            </div>
                        </button>
                    );
                })}
            </main>

            {/* Subtle Footer */}
            <footer style={{
                padding: '30px 60px',
                textAlign: 'center',
                color: 'var(--pos-text-muted)',
                fontSize: '14px',
                fontWeight: 600,
                borderTop: '1px solid var(--pos-border-subtle)',
                flexShrink: 0
            }}>
                Session: <span style={{ color: 'var(--pos-text-primary)' }}>{session?.posType}</span>
                {' • '}
                Store: <span style={{ color: 'var(--pos-text-primary)' }}>{session?.store?.name}</span>
            </footer>
        </div>
    );
};
