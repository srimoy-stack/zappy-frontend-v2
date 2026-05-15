'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText, Clock, CreditCard,
    Printer, Mail, MessageSquare, RotateCcw, Edit,
    Package, Utensils, Truck, CheckCircle2
} from 'lucide-react';
import '../styles/pos-rush.css';

const mockOrder = {
    id: 'ORD-1234',
    orderNumber: '#1234',
    status: 'COMPLETED',
    placedAt: '2026-02-09 11:30 AM',
    completedAt: '2026-02-09 11:45 AM',
    estimatedReady: '11:45 AM',

    customer: {
        id: 'C001',
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@email.com',
        tier: 'VIP'
    },

    fulfillment: {
        type: 'DELIVERY',
        tableNumber: null,
        address: {
            label: 'Home',
            street: '123 Main St',
            city: 'New York',
            zip: '10001'
        },
        deliveryProvider: 'Uber Eats',
        deliveryFee: 5.99,
        estimatedDelivery: '12:00 PM'
    },

    items: [
        {
            id: 'I1',
            name: 'Large Pepperoni Pizza',
            quantity: 2,
            basePrice: 18.99,
            variants: [
                { name: 'Size', value: 'Large', price: 0 },
                { name: 'Crust', value: 'Stuffed', price: 2.50 }
            ],
            modifiers: [
                { name: 'Extra Cheese', quantity: 1, price: 1.50 },
                { name: 'Olives', quantity: 1, price: 1.00 }
            ],
            itemTotal: 47.98,
            notes: 'No onions'
        },
        {
            id: 'I2',
            name: 'Chicken Wings',
            quantity: 1,
            basePrice: 12.99,
            variants: [
                { name: 'Flavor', value: 'BBQ', price: 0 }
            ],
            modifiers: [],
            itemTotal: 12.99,
            notes: ''
        },
        {
            id: 'I3',
            name: 'Coca Cola',
            quantity: 2,
            basePrice: 2.50,
            variants: [],
            modifiers: [],
            itemTotal: 5.00,
            notes: ''
        }
    ],

    pricing: {
        subtotal: 65.97,
        discount: {
            type: 'COUPON',
            code: 'SAVE10',
            amount: 6.60
        },
        deliveryFee: 5.99,
        tax: 5.94,
        tip: 8.00,
        total: 79.30
    },

    payment: {
        method: 'CARD',
        cardLast4: '4242',
        cardBrand: 'Visa',
        transactionId: 'TXN-ABC123',
        paidAt: '2026-02-09 11:30 AM'
    },

    kitchen: {
        sentAt: '11:30 AM',
        startedAt: '11:32 AM',
        readyAt: '11:45 AM',
        station: 'Pizza Station'
    },

    notes: 'Customer requested extra napkins and utensils',
    createdBy: 'Sarah (Cashier #3)',
    channel: 'PHONE_ORDER'
};

export const OrderDetailsPage: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'TIMELINE' | 'PAYMENT'>('DETAILS');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10B981', text: '#6EE7B7' };
            case 'PREPARING':
                return { bg: 'rgba(245, 158, 11, 0.2)', border: '#F59E0B', text: '#FCD34D' };
            case 'CANCELLED':
                return { bg: 'rgba(239, 68, 68, 0.2)', border: '#EF4444', text: '#FCA5A5' };
            default:
                return { bg: 'rgba(59, 130, 246, 0.2)', border: '#3B82F6', text: '#93C5FD' };
        }
    };

    const statusColor = getStatusColor(mockOrder.status);

    return (
        <div className="pos-screen">
            {/* Header */}
            <div className="pos-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'white',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FileText size={28} color="#1E3A8A" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                            Order {mockOrder.orderNumber}
                        </h1>
                        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            {mockOrder.placedAt} • {mockOrder.channel}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="pos-btn pos-btn-secondary">
                        <Printer size={20} />
                        Print
                    </button>
                    <button
                        onClick={() => router.push('/pos/dashboard')}
                        className="pos-btn pos-btn-secondary"
                    >
                        Back
                    </button>
                </div>
            </div>

            <div className="pos-split-layout">
                {/* LEFT: Order Info */}
                <div className="pos-left-panel">
                    {/* Status */}
                    <div style={{ padding: '24px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 24px',
                            background: statusColor.bg,
                            border: `2px solid ${statusColor.border}`,
                            borderRadius: '16px',
                            marginBottom: '20px'
                        }}>
                            <CheckCircle2 size={24} color={statusColor.text} />
                            <span style={{ fontSize: '18px', fontWeight: 800, color: statusColor.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {mockOrder.status}
                            </span>
                        </div>

                        <div style={{ fontSize: '48px', fontWeight: 800, color: 'white', marginBottom: '8px', lineHeight: 1 }}>
                            {mockOrder.orderNumber}
                        </div>
                        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            Order ID: {mockOrder.id}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ padding: '20px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            {['DETAILS', 'TIMELINE', 'PAYMENT'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: activeTab === tab ? 'white' : 'rgba(255, 255, 255, 0.1)',
                                        color: activeTab === tab ? '#1E3A8A' : 'white',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }} className="pos-scroll">
                        {activeTab === 'DETAILS' && (
                            <>
                                {/* Customer */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Customer
                                    </h3>
                                    <div className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                                    {mockOrder.customer.name}
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, marginBottom: '2px' }}>
                                                    {mockOrder.customer.phone}
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                                                    {mockOrder.customer.email}
                                                </div>
                                            </div>
                                            <div className="pos-badge pos-badge-warning">{mockOrder.customer.tier}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fulfillment */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Fulfillment
                                    </h3>
                                    <div className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(59, 130, 246, 0.2)',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Truck size={20} color="#3B82F6" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>
                                                    {mockOrder.fulfillment.type}
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                                    via {mockOrder.fulfillment.deliveryProvider}
                                                </div>
                                            </div>
                                        </div>
                                        {mockOrder.fulfillment.address && (
                                            <div style={{
                                                padding: '12px',
                                                background: 'rgba(0, 0, 0, 0.2)',
                                                borderRadius: '10px'
                                            }}>
                                                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '4px' }}>
                                                    Delivery Address
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'white', fontWeight: 600, lineHeight: 1.5 }}>
                                                    {mockOrder.fulfillment.address.street}<br />
                                                    {mockOrder.fulfillment.address.city}, {mockOrder.fulfillment.address.zip}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Kitchen */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Kitchen
                                    </h3>
                                    <div className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, marginBottom: '8px' }}>
                                            Station: {mockOrder.kitchen.station}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                            Sent: {mockOrder.kitchen.sentAt} • Started: {mockOrder.kitchen.startedAt} • Ready: {mockOrder.kitchen.readyAt}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {mockOrder.notes && (
                                    <div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Order Notes
                                        </h3>
                                        <div className="pos-card" style={{ background: 'rgba(245, 158, 11, 0.2)', border: '2px solid #F59E0B' }}>
                                            <div style={{ fontSize: '14px', color: '#FCD34D', fontWeight: 600 }}>
                                                {mockOrder.notes}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'TIMELINE' && (
                            <div style={{ position: 'relative', paddingLeft: '32px' }}>
                                {/* Timeline line */}
                                <div style={{
                                    position: 'absolute',
                                    left: '11px',
                                    top: '12px',
                                    bottom: '12px',
                                    width: '2px',
                                    background: 'rgba(255, 255, 255, 0.2)'
                                }} />

                                {/* Events */}
                                {[
                                    { time: mockOrder.placedAt, event: 'Order Placed', icon: Package, color: '#3B82F6' },
                                    { time: mockOrder.payment.paidAt, event: 'Payment Received', icon: CreditCard, color: '#10B981' },
                                    { time: mockOrder.kitchen.sentAt, event: 'Sent to Kitchen', icon: Utensils, color: '#F59E0B' },
                                    { time: mockOrder.kitchen.startedAt, event: 'Preparation Started', icon: Clock, color: '#F59E0B' },
                                    { time: mockOrder.kitchen.readyAt, event: 'Order Ready', icon: CheckCircle2, color: '#10B981' },
                                    { time: mockOrder.completedAt, event: 'Order Completed', icon: CheckCircle2, color: '#10B981' },
                                ].map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={idx} style={{ position: 'relative', marginBottom: '24px' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: '-32px',
                                                width: '24px',
                                                height: '24px',
                                                background: item.color,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '3px solid #1E3A8A'
                                            }}>
                                                <Icon size={12} color="white" />
                                            </div>
                                            <div className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                                    {item.event}
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                                    {item.time}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'PAYMENT' && (
                            <>
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Payment Method
                                    </h3>
                                    <div className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(16, 185, 129, 0.2)',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <CreditCard size={20} color="#10B981" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>
                                                    {mockOrder.payment.cardBrand} •••• {mockOrder.payment.cardLast4}
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                                    Transaction: {mockOrder.payment.transactionId}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                            Paid at: {mockOrder.payment.paidAt}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Price Breakdown
                                    </h3>
                                    <div className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Subtotal</span>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>${mockOrder.pricing.subtotal.toFixed(2)}</span>
                                        </div>
                                        {mockOrder.pricing.discount && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 600 }}>
                                                    Discount ({mockOrder.pricing.discount.code})
                                                </span>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                                                    -${mockOrder.pricing.discount.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Delivery Fee</span>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>${mockOrder.pricing.deliveryFee.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Tax</span>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>${mockOrder.pricing.tax.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Tip</span>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>${mockOrder.pricing.tip.toFixed(2)}</span>
                                        </div>
                                        <div style={{
                                            paddingTop: '16px',
                                            borderTop: '2px solid rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span style={{ fontSize: '18px', color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                                            <span style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>${mockOrder.pricing.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT: Order Items */}
                <div className="pos-right-panel">
                    <div style={{ padding: '24px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                            Order Items
                        </h2>
                        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            {mockOrder.items.length} items
                        </p>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }} className="pos-scroll">
                        {mockOrder.items.map(item => (
                            <div key={item.id} className="pos-card" style={{ background: 'rgba(255, 255, 255, 0.1)', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                            {item.quantity}x {item.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                            Base: ${item.basePrice.toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>
                                        ${item.itemTotal.toFixed(2)}
                                    </div>
                                </div>

                                {item.variants.length > 0 && (
                                    <div style={{ marginBottom: '12px' }}>
                                        {item.variants.map((v, idx) => (
                                            <div key={idx} style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, marginBottom: '4px' }}>
                                                • {v.name}: {v.value} {v.price > 0 && `(+$${v.price.toFixed(2)})`}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {item.modifiers.length > 0 && (
                                    <div style={{ marginBottom: '12px' }}>
                                        {item.modifiers.map((m, idx) => (
                                            <div key={idx} style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, marginBottom: '4px' }}>
                                                • {m.name} x{m.quantity} (+${(m.price * m.quantity).toFixed(2)})
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {item.notes && (
                                    <div style={{
                                        padding: '8px 12px',
                                        background: 'rgba(245, 158, 11, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: '#FCD34D',
                                        fontWeight: 600
                                    }}>
                                        Note: {item.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '24px', borderTop: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <button className="pos-btn pos-btn-secondary">
                                <Mail size={20} />
                                Email
                            </button>
                            <button className="pos-btn pos-btn-secondary">
                                <MessageSquare size={20} />
                                SMS
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => router.push('/pos/refund')}
                                className="pos-btn pos-btn-secondary"
                                style={{ background: 'rgba(239, 68, 68, 0.2)', border: '2px solid #EF4444', color: '#FCA5A5' }}
                            >
                                <RotateCcw size={20} />
                                Refund
                            </button>
                            <button className="pos-btn pos-btn-secondary">
                                <Edit size={20} />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
