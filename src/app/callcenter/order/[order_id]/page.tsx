'use client';

import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Printer,
    RotateCcw,
    User,
    Phone,
    MapPin,
    Truck,
    CheckCircle2,
    MessageSquare
} from 'lucide-react';

// Mock detailed order
const MOCK_ORDER = {
    id: 'CALL-782910',
    status: 'In Kitchen',
    time: '2026-02-14 18:30',
    customer: {
        name: 'John Smith',
        phone: '555-0101',
        email: 'john.smith@example.com',
        address: '123 Main St, Apt 4B, New York, NY 10001'
    },
    fulfillment: {
        type: 'Delivery',
        store: 'Downtown Store',
        fee: 5.00,
        eta: '30-40 mins'
    },
    items: [
        {
            id: 'i1',
            name: 'Margherita Pizza',
            quantity: 2,
            price: 12.99,
            modifiers: ['Large 12"', 'Cheese Burst', 'Extra Cheese']
        },
        {
            id: 'i2',
            name: 'Classic Burger',
            quantity: 1,
            price: 8.99,
            modifiers: ['No Onions']
        },
        {
            id: 'i3',
            name: 'Coca Cola',
            quantity: 3,
            price: 2.50,
            modifiers: ['No Ice']
        }
    ],
    summary: {
        subtotal: 42.47,
        tax: 3.40,
        delivery: 5.00,
        total: 50.87
    },
    timeline: [
        { status: 'Order Created', time: '18:30', active: true },
        { status: 'Payment Confirmed', time: '18:31', active: true },
        { status: 'Sent to Kitchen', time: '18:32', active: true },
        { status: 'Out for Delivery', time: '--:--', active: false },
        { status: 'Completed', time: '--:--', active: false }
    ]
};

export default function OrderDetailsPage() {
    const router = useRouter();

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
            {/* Header */}
            <header style={{
                padding: '24px 40px',
                background: '#1e293b',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Order Details</h1>
                        <p style={{ fontSize: '14px', color: '#3b82f6', margin: 0 }}>#{MOCK_ORDER.id} • {MOCK_ORDER.time}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={() => window.print()}
                        style={{
                            padding: '12px 24px',
                            background: '#334155',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Printer size={18} /> PRINT INVOICE
                    </button>
                    <button
                        style={{
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <RotateCcw size={18} /> REPEAT ORDER
                    </button>
                </div>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }} className="pos-scroll">
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>

                    {/* Left Column: Items and Customer */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Status Banner */}
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid #3b82f6',
                            padding: '24px',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}>
                            <div style={{ width: '48px', height: '48px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle2 color="white" size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase' }}>Current Status</div>
                                <div style={{ fontSize: '24px', fontWeight: 950, color: 'white' }}>Order is being prepared in kitchen</div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ background: '#1e293b', borderRadius: '32px', border: '1px solid #334155', overflow: 'hidden' }}>
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid #334155', background: '#232d3f' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>Itemized Receipt</h2>
                            </div>
                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {MOCK_ORDER.items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: '#0f172a',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#3b82f6',
                                                    fontWeight: 900
                                                }}>
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>{item.name}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                                        {item.modifiers.map((m, idx) => (
                                                            <span key={idx} style={{ fontSize: '11px', background: '#334155', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>{m}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ borderTop: '2px dashed #334155', marginTop: '40px', paddingTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 700 }}>
                                            <span>Subtotal</span>
                                            <span>${MOCK_ORDER.summary.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 700 }}>
                                            <span>Tax (GST 8%)</span>
                                            <span>${MOCK_ORDER.summary.tax.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 700 }}>
                                            <span>Delivery Fee</span>
                                            <span>${MOCK_ORDER.summary.delivery.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '24px', fontWeight: 950, marginTop: '16px' }}>
                                            <span>TOTAL PAID</span>
                                            <span>${MOCK_ORDER.summary.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Sidebar Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Customer Profile */}
                        <div style={{ background: '#1e293b', borderRadius: '32px', border: '1px solid #334155', padding: '32px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Customer Profile</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User color="white" size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>{MOCK_ORDER.customer.name}</div>
                                        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 700 }}>Registered Member</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button style={{ flex: 1, padding: '12px', background: '#334155', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Phone size={16} /> CALL
                                    </button>
                                    <button style={{ flex: 1, padding: '12px', background: '#334155', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <MessageSquare size={16} /> SMS
                                    </button>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #334155', marginTop: '24px', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <MapPin size={18} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600, lineHeight: 1.5 }}>
                                        {MOCK_ORDER.customer.address}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Truck size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                                    <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>Routed to: <span style={{ color: 'white', fontWeight: 800 }}>{MOCK_ORDER.fulfillment.store}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Live Timeline */}
                        <div style={{ background: '#1e293b', borderRadius: '32px', border: '1px solid #334155', padding: '32px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Order Journey
                                <span style={{ fontSize: '10px', background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '100px' }}>LIVE</span>
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {MOCK_ORDER.timeline.map((step, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '20px', minHeight: '60px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: step.active ? '#3b82f6' : '#334155',
                                                border: step.active ? '4px solid rgba(59, 130, 246, 0.2)' : 'none',
                                                zIndex: 1
                                            }} />
                                            {idx !== MOCK_ORDER.timeline.length - 1 && (
                                                <div style={{ width: '2px', flex: 1, background: step.active && MOCK_ORDER.timeline[idx + 1]?.active ? '#3b82f6' : '#334155', margin: '4px 0' }} />
                                            )}
                                        </div>
                                        <div style={{ paddingBottom: '20px' }}>
                                            <div style={{ fontSize: '15px', fontWeight: 800, color: step.active ? 'white' : '#475569' }}>{step.status}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{step.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <style jsx global>{`
                .pos-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .pos-scroll::-webkit-scrollbar-track { background: transparent; }
                .pos-scroll::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
