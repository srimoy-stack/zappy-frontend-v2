'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MapPin, Clock, Package, PhoneOff } from 'lucide-react';
import '../styles/pos-rush.css';

const mockIncomingCall = {
    phoneNumber: '+1 (555) 123-4567',
    callerId: 'John Doe',
    customer: {
        id: 'C001',
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@email.com',
        tier: 'VIP',
        addresses: [
            { id: 'A1', label: 'Home', street: '123 Main St', city: 'New York', zip: '10001', isDefault: true },
            { id: 'A2', label: 'Office', street: '456 Park Ave', city: 'New York', zip: '10002', isDefault: false },
        ],
        recentOrders: [
            { id: 'O1', date: '2 days ago', total: 45.50, items: 'Large Pizza, Coke' },
            { id: 'O2', date: '1 week ago', total: 32.00, items: 'Medium Pizza, Wings' },
            { id: 'O3', date: '2 weeks ago', total: 56.75, items: '2x Large Pizza, Salad' },
        ],
        totalOrders: 24,
        totalSpent: 1247.50,
        notes: 'No onions, Extra cheese'
    }
};

export const IncomingCallScreen: React.FC = () => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<'RINGING' | 'ANSWERED' | 'ENDED'>('RINGING');
    const [callDuration, setCallDuration] = useState(0);

    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStatus === 'ANSWERED') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [callStatus]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = () => {
        setCallStatus('ANSWERED');
    };

    const handleReject = () => {
        setCallStatus('ENDED');
        setTimeout(() => router.push('/pos/dashboard'), 1500);
    };

    const handleCreateOrder = () => {
        // Auto-populate customer and go to menu
        router.push('/pos/menu');
    };

    const handleReorder = (_orderId: string) => {
        // Load previous order and go to menu
        router.push('/pos/menu');
    };

    if (callStatus === 'RINGING') {
        return (
            <div className="pos-screen">
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    animation: 'pulse 1.5s infinite'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
                        {/* Ringing Animation */}
                        <div style={{
                            width: '160px',
                            height: '160px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 40px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            animation: 'scaleIn 0.5s ease'
                        }}>
                            <Phone size={80} color="#10B981" />
                        </div>

                        <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
                            Incoming Call
                        </h1>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '24px',
                            padding: '32px',
                            marginBottom: '40px'
                        }}>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
                                {mockIncomingCall.callerId}
                            </div>
                            <div style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, marginBottom: '20px' }}>
                                {mockIncomingCall.phoneNumber}
                            </div>
                            <div className="pos-badge pos-badge-warning" style={{ fontSize: '14px', padding: '10px 20px' }}>
                                {mockIncomingCall.customer.tier} CUSTOMER
                            </div>
                        </div>

                        <div className="pos-grid-2" style={{ gap: '20px' }}>
                            <button
                                onClick={handleReject}
                                style={{
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: 'white',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <PhoneOff size={24} />
                                Reject
                            </button>

                            <button
                                onClick={handleAnswer}
                                style={{
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: 'white',
                                    color: '#10B981',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <Phone size={24} />
                                Answer
                            </button>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.8; }
                    }
                    @keyframes scaleIn {
                        from {
                            transform: scale(0);
                            opacity: 0;
                        }
                        to {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        );
    }

    if (callStatus === 'ENDED') {
        return (
            <div className="pos-screen">
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
                            Call Ended
                        </div>
                        <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            Returning to dashboard...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ANSWERED state
    return (
        <div className="pos-screen">
            {/* Call Status Bar */}
            <div style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Phone size={24} color="#10B981" />
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                            Call with {mockIncomingCall.callerId}
                        </div>
                        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                            {mockIncomingCall.phoneNumber} • {formatDuration(callDuration)}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleReject}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#EF4444',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <PhoneOff size={18} />
                    End Call
                </button>
            </div>

            <div className="pos-split-layout">
                {/* LEFT: Customer Info */}
                <div className="pos-left-panel">
                    {/* Customer Header */}
                    <div style={{ padding: '24px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
                                    {mockIncomingCall.customer.name}
                                </h2>
                                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, marginBottom: '4px' }}>
                                    {mockIncomingCall.customer.phone}
                                </div>
                                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                                    {mockIncomingCall.customer.email}
                                </div>
                            </div>
                            <div className="pos-badge pos-badge-warning">{mockIncomingCall.customer.tier}</div>
                        </div>

                        {/* Stats */}
                        <div className="pos-grid-3" style={{ gap: '12px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                                    {mockIncomingCall.customer.totalOrders}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, textTransform: 'uppercase' }}>
                                    Orders
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                                    ${mockIncomingCall.customer.totalSpent.toFixed(0)}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, textTransform: 'uppercase' }}>
                                    Spent
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                                    {mockIncomingCall.customer.addresses.length}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, textTransform: 'uppercase' }}>
                                    Addresses
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div style={{ padding: '24px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Saved Addresses
                        </h3>
                        {mockIncomingCall.customer.addresses.map(addr => (
                            <div key={addr.id} className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>
                                        <MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} />
                                        {addr.label}
                                    </div>
                                    {addr.isDefault && (
                                        <div className="pos-badge pos-badge-success">DEFAULT</div>
                                    )}
                                </div>
                                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, lineHeight: 1.5 }}>
                                    {addr.street}<br />
                                    {addr.city}, {addr.zip}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Notes */}
                    {mockIncomingCall.customer.notes && (
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Customer Notes
                            </h3>
                            <div className="pos-card" style={{ background: 'rgba(245, 158, 11, 0.2)', border: '2px solid #F59E0B' }}>
                                <div style={{ fontSize: '14px', color: '#FCD34D', fontWeight: 600 }}>
                                    {mockIncomingCall.customer.notes}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Recent Orders & Actions */}
                <div className="pos-right-panel">
                    <div style={{ padding: '24px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                            Recent Orders
                        </h2>
                        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            Quick reorder or create new
                        </p>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }} className="pos-scroll">
                        {mockIncomingCall.customer.recentOrders.map(order => (
                            <div key={order.id} className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, marginBottom: '4px' }}>
                                            <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                            {order.date}
                                        </div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                                            {order.items}
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>
                                            ${order.total.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleReorder(order.id)}
                                    className="pos-btn pos-btn-secondary"
                                    style={{ width: '100%', marginTop: '12px' }}
                                >
                                    <Package size={18} />
                                    Reorder
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Create New Order */}
                    <div style={{ padding: '24px', borderTop: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <button
                            onClick={handleCreateOrder}
                            className="pos-btn pos-btn-primary"
                            style={{ width: '100%', background: '#10B981', fontSize: '16px' }}
                        >
                            <Package size={20} />
                            Create New Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
