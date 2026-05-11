'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    ArrowLeft,
    Clock,
    Truck,
    ShoppingBag,
    ChevronRight,
    Calendar,
    Phone
} from 'lucide-react';
import { usePOS } from '@/modules/pos/context/POSContext';

// Mock orders for Call Center
const CALL_CENTER_ORDERS = [
    { id: 'CALL-782910', customer: 'John Smith', phone: '555-0101', type: 'Delivery', status: 'In Kitchen', amount: 45.50, time: '10 mins ago', store: 'Downtown' },
    { id: 'CALL-782911', customer: 'Sarah Williams', phone: '555-0102', type: 'Pickup', status: 'Ready', amount: 22.00, time: '15 mins ago', store: 'Express' },
    { id: 'CALL-782912', customer: 'Michael Brown', phone: '555-0103', type: 'Delivery', status: 'On the Way', amount: 68.25, time: '20 mins ago', store: 'Downtown' },
    { id: 'CALL-782913', customer: 'Emma Davis', phone: '555-0104', type: 'Delivery', status: 'Scheduled', amount: 35.00, time: '35 mins ago', store: 'Uptown' },
    { id: 'CALL-782914', customer: 'James Miller', phone: '555-0105', type: 'Pickup', status: 'Completed', amount: 15.50, time: '1 hour ago', store: 'Downtown' },
];

export default function OrdersPage() {
    const router = useRouter();
    const { } = usePOS();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredOrders = useMemo(() => {
        return CALL_CENTER_ORDERS.filter(o => {
            const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.phone.includes(searchQuery);
            const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    const statusColors: any = {
        'In Kitchen': '#3b82f6',
        'Ready': '#10b981',
        'On the Way': '#f59e0b',
        'Scheduled': '#8b5cf6',
        'Completed': '#64748b'
    };

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
                        onClick={() => router.push('/callcenter/dashboard')}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Call Center Orders</h1>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Showing internal cross-store orders</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {['All', 'In Kitchen', 'On the Way', 'Ready', 'Scheduled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '10px 20px',
                                background: statusFilter === status ? '#3b82f6' : '#334155',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {status.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ flex: 1, overflow: 'hidden', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '600px' }}>
                    <Search color="#64748b" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search By Order ID, Name or Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            height: '64px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '16px',
                            paddingLeft: '60px',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 700,
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Orders Grid */}
                <div style={{ flex: 1, overflowY: 'auto' }} className="pos-scroll">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredOrders.length > 0 ? filteredOrders.map(order => (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/callcenter/order/${order.id}`)}
                                style={{
                                    background: '#1e293b',
                                    padding: '24px 32px',
                                    borderRadius: '24px',
                                    border: '1px solid #334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                className="order-row"
                            >
                                <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                                    <div style={{ width: '120px' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#3b82f6', marginBottom: '4px' }}>#{order.id}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: 700 }}>
                                            <Clock size={14} /> {order.time}
                                        </div>
                                    </div>

                                    <div style={{ width: '200px' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>{order.customer}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: 700 }}>
                                            <Phone size={14} /> {order.phone}
                                        </div>
                                    </div>

                                    <div style={{ width: '150px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            {order.type === 'Delivery' ? <Truck size={16} color="#f59e0b" /> : <ShoppingBag size={16} color="#3b82f6" />}
                                            <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{order.type.toUpperCase()}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>at {order.store}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 950, color: 'white' }}>${order.amount.toFixed(2)}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>PAID FULL</div>
                                    </div>

                                    <div style={{
                                        padding: '8px 16px',
                                        background: `${statusColors[order.status]}20`,
                                        color: statusColors[order.status],
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        height: 'fit-content',
                                        minWidth: '120px',
                                        textAlign: 'center'
                                    }}>
                                        {order.status}
                                    </div>

                                    <ChevronRight color="#334155" />
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '100px', textAlign: 'center', color: '#334155' }}>
                                <Calendar size={80} style={{ marginBottom: '24px' }} />
                                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>No Orders Found</h2>
                                <p style={{ fontSize: '16px', color: '#64748b' }}>Try adjusting your search or filter</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .pos-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .pos-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .pos-scroll::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .order-row:hover {
                    border-color: #3b82f6 !important;
                    background: #232d3f !important;
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
}
