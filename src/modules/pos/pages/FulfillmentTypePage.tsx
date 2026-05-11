'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Package, Truck, MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';
import '../styles/pos-rush.css';

const mockAddresses = [
    { id: 'A1', label: 'Home', street: '123 Main St', city: 'New York', zip: '10001', isDefault: true },
    { id: 'A2', label: 'Office', street: '456 Park Ave', city: 'New York', zip: '10002', isDefault: false },
];

const deliveryProviders = [
    { id: 'SELF', name: 'Self Delivery', fee: 3.99, eta: '30-40 min' },
    { id: 'UBER', name: 'Uber Eats', fee: 5.99, eta: '25-35 min' },
];

export const FulfillmentTypePage: React.FC = () => {
    const router = useRouter();
    const [fulfillmentType, setFulfillmentType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | null>(null);
    const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0]);
    const [deliveryProvider, setDeliveryProvider] = useState(deliveryProviders[0]);
    const [tableNumber, setTableNumber] = useState('');

    const handleContinue = () => {
        // Store fulfillment details in context
        router.push('/pos/menu');
    };

    return (
        <div className="pos-screen">
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
                        Order Type
                    </h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                        How would you like to receive your order?
                    </p>
                </div>

                {/* Fulfillment Type Selection */}
                <div className="pos-grid-3" style={{ marginBottom: '40px', gap: '24px' }}>
                    <button
                        onClick={() => setFulfillmentType('DINE_IN')}
                        style={{
                            background: fulfillmentType === 'DINE_IN' ? 'white' : 'rgba(255, 255, 255, 0.1)',
                            border: fulfillmentType === 'DINE_IN' ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '24px',
                            padding: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                    >
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: fulfillmentType === 'DINE_IN' ? 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Store size={48} color={fulfillmentType === 'DINE_IN' ? 'white' : 'rgba(255, 255, 255, 0.7)'} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 800,
                                color: fulfillmentType === 'DINE_IN' ? '#1E3A8A' : 'white',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Dine-In
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: fulfillmentType === 'DINE_IN' ? '#64748B' : 'rgba(255, 255, 255, 0.6)',
                                fontWeight: 600
                            }}>
                                Eat at restaurant
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setFulfillmentType('TAKEAWAY')}
                        style={{
                            background: fulfillmentType === 'TAKEAWAY' ? 'white' : 'rgba(255, 255, 255, 0.1)',
                            border: fulfillmentType === 'TAKEAWAY' ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '24px',
                            padding: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                    >
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: fulfillmentType === 'TAKEAWAY' ? 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Package size={48} color={fulfillmentType === 'TAKEAWAY' ? 'white' : 'rgba(255, 255, 255, 0.7)'} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 800,
                                color: fulfillmentType === 'TAKEAWAY' ? '#1E3A8A' : 'white',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Takeaway
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: fulfillmentType === 'TAKEAWAY' ? '#64748B' : 'rgba(255, 255, 255, 0.6)',
                                fontWeight: 600
                            }}>
                                Pickup order
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setFulfillmentType('DELIVERY')}
                        style={{
                            background: fulfillmentType === 'DELIVERY' ? 'white' : 'rgba(255, 255, 255, 0.1)',
                            border: fulfillmentType === 'DELIVERY' ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '24px',
                            padding: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                    >
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: fulfillmentType === 'DELIVERY' ? 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Truck size={48} color={fulfillmentType === 'DELIVERY' ? 'white' : 'rgba(255, 255, 255, 0.7)'} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 800,
                                color: fulfillmentType === 'DELIVERY' ? '#1E3A8A' : 'white',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Delivery
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: fulfillmentType === 'DELIVERY' ? '#64748B' : 'rgba(255, 255, 255, 0.6)',
                                fontWeight: 600
                            }}>
                                Deliver to address
                            </div>
                        </div>
                    </button>
                </div>

                {/* Conditional Details */}
                {fulfillmentType === 'DINE_IN' && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '32px',
                        marginBottom: '32px',
                        maxWidth: '600px',
                        margin: '0 auto 32px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Table Number
                        </h3>
                        <input
                            type="text"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="Enter table number..."
                            className="pos-input"
                            style={{ fontSize: '20px', textAlign: 'center' }}
                        />
                    </div>
                )}

                {fulfillmentType === 'DELIVERY' && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '32px',
                        marginBottom: '32px',
                        maxWidth: '800px',
                        margin: '0 auto 32px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Delivery Details
                        </h3>

                        {/* Address Selection */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Delivery Address
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {mockAddresses.map(addr => (
                                    <button
                                        key={addr.id}
                                        onClick={() => setSelectedAddress(addr)}
                                        style={{
                                            background: selectedAddress?.id === addr.id ? 'white' : 'rgba(255, 255, 255, 0.05)',
                                            border: selectedAddress?.id === addr.id ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                color: selectedAddress?.id === addr.id ? '#1E3A8A' : 'white',
                                                textTransform: 'uppercase'
                                            }}>
                                                <MapPin size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                                {addr.label}
                                            </div>
                                            {addr.isDefault && (
                                                <div style={{
                                                    padding: '4px 8px',
                                                    background: selectedAddress?.id === addr.id ? '#1E3A8A' : 'rgba(16, 185, 129, 0.2)',
                                                    color: selectedAddress?.id === addr.id ? 'white' : '#10B981',
                                                    borderRadius: '6px',
                                                    fontSize: '10px',
                                                    fontWeight: 700
                                                }}>
                                                    DEFAULT
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: '15px',
                                            color: selectedAddress?.id === addr.id ? '#64748B' : 'rgba(255, 255, 255, 0.9)',
                                            fontWeight: 600,
                                            lineHeight: 1.5
                                        }}>
                                            {addr.street}<br />
                                            {addr.city}, {addr.zip}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Provider */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Delivery Provider
                            </label>
                            <div className="pos-grid-2" style={{ gap: '12px' }}>
                                {deliveryProviders.map(provider => (
                                    <button
                                        key={provider.id}
                                        onClick={() => setDeliveryProvider(provider)}
                                        style={{
                                            background: deliveryProvider?.id === provider.id ? 'white' : 'rgba(255, 255, 255, 0.05)',
                                            border: deliveryProvider?.id === provider.id ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            color: deliveryProvider?.id === provider.id ? '#1E3A8A' : 'white',
                                            marginBottom: '12px'
                                        }}>
                                            {provider.name}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '13px',
                                            color: deliveryProvider?.id === provider.id ? '#64748B' : 'rgba(255, 255, 255, 0.7)',
                                            fontWeight: 600
                                        }}>
                                            <span>
                                                <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                                {provider.eta}
                                            </span>
                                            <span>
                                                <DollarSign size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                                ${provider.fee.toFixed(2)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Summary */}
                        <div style={{
                            marginTop: '24px',
                            padding: '20px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                                    Estimated Delivery
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>
                                    {deliveryProvider?.eta}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                                    Delivery Fee
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>
                                    ${deliveryProvider?.fee?.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Continue Button */}
                <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    <button
                        onClick={handleContinue}
                        disabled={!fulfillmentType || (fulfillmentType === 'DINE_IN' && !tableNumber)}
                        className="pos-btn pos-btn-primary"
                        style={{ width: '100%', fontSize: '18px' }}
                    >
                        Continue to Menu
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
