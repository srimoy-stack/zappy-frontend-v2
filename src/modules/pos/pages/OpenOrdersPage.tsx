'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Package, CheckCircle2, AlertCircle, Search, Eye, Printer, RefreshCw } from 'lucide-react';
import '../styles/pos-rush.css';

interface OpenOrder {
    id: string;
    orderNumber: string;
    customer: string;
    phone: string;
    fulfillmentType: string;
    tableNumber?: string;
    address?: string;
    items: number;
    total: number;
    status: 'PREPARING' | 'READY' | 'COMPLETED';
    placedAt: string;
    estimatedReady: string;
    completedAt?: string;
    itemsList: string[];
    payment: string;
}

const mockOpenOrders: OpenOrder[] = [
    {
        id: 'O001',
        orderNumber: '#1001',
        customer: 'John Doe',
        phone: '+1 (555) 123-4567',
        fulfillmentType: 'DINE_IN',
        tableNumber: '12',
        items: 3,
        total: 45.50,
        status: 'PREPARING',
        placedAt: '11:43 AM',
        estimatedReady: '12:00 PM',
        itemsList: ['Large Pizza', 'Garlic Bread', 'Coke'],
        payment: 'CARD'
    },
    {
        id: 'O002',
        orderNumber: '#1002',
        customer: 'Sarah Smith',
        phone: '+1 (555) 234-5678',
        fulfillmentType: 'TAKEAWAY',
        items: 2,
        total: 28.00,
        status: 'READY',
        placedAt: '11:58 AM',
        estimatedReady: '12:15 PM',
        itemsList: ['Medium Pizza', 'Fries'],
        payment: 'CASH'
    },
    {
        id: 'O003',
        orderNumber: '#1003',
        customer: 'Mike Johnson',
        phone: '+1 (555) 345-6789',
        fulfillmentType: 'DELIVERY',
        address: '123 Main St, NY',
        items: 5,
        total: 67.25,
        status: 'PREPARING',
        placedAt: '12:05 PM',
        estimatedReady: '12:30 PM',
        itemsList: ['2x Large Pizza', 'Wings', 'Salad', 'Drinks'],
        payment: 'CARD'
    },
    {
        id: 'O004',
        orderNumber: '#1004',
        customer: 'Emma Davis',
        phone: '+1 (555) 456-7890',
        fulfillmentType: 'DINE_IN',
        tableNumber: '8',
        items: 4,
        total: 52.75,
        status: 'COMPLETED',
        placedAt: '11:20 AM',
        estimatedReady: '11:35 AM',
        completedAt: '11:38 AM',
        itemsList: ['Large Pizza', 'Pasta', 'Salad', 'Wine'],
        payment: 'CARD'
    }
];

export const OpenOrdersPage: React.FC = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<OpenOrder[]>(mockOpenOrders);
    const [selectedOrder, setSelectedOrder] = useState<OpenOrder | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PREPARING' | 'READY' | 'COMPLETED'>('ALL');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.phone.includes(searchQuery);
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleUpdateStatus = () => {
        if (!selectedOrder) return;

        const nextStatus: 'PREPARING' | 'READY' | 'COMPLETED' =
            selectedOrder.status === 'PREPARING' ? 'READY' : 'COMPLETED';

        if (selectedOrder.status === 'COMPLETED') return;

        const updatedOrders: OpenOrder[] = orders.map(o => {
            if (o.id === selectedOrder.id) {
                return {
                    ...o,
                    status: nextStatus,
                    completedAt: nextStatus === 'COMPLETED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : o.completedAt
                };
            }
            return o;
        });

        setOrders(updatedOrders);
        const newSelected = updatedOrders.find(o => o.id === selectedOrder.id);
        if (newSelected) setSelectedOrder(newSelected);
    };

    const handleAction = (label: string) => {
        alert(`${label} integration triggered for ${selectedOrder?.orderNumber}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PREPARING':
                return { bg: 'rgba(245, 158, 11, 0.1)', border: 'var(--pos-state-warning)', text: 'var(--pos-state-warning)' };
            case 'READY':
                return { bg: 'rgba(16, 185, 129, 0.1)', border: 'var(--pos-state-success)', text: 'var(--pos-state-success)' };
            case 'COMPLETED':
                return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', text: '#3B82F6' };
            default:
                return { bg: 'var(--pos-bg-main)', border: 'var(--pos-border-subtle)', text: 'var(--pos-text-secondary)' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PREPARING': return Clock;
            case 'READY': return Package;
            case 'COMPLETED': return CheckCircle2;
            default: return AlertCircle;
        }
    };

    return (
        <div className="pos-screen" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header */}
            <header style={{
                height: '64px',
                background: 'var(--pos-bg-surface)',
                borderBottom: '1px solid var(--pos-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--pos-action-primary)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Clock size={20} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                            OPEN ORDERS
                        </h1>
                        <div style={{ fontSize: '11px', color: 'var(--pos-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {orders.length} Active System Threads
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleRefresh}
                        className="pos-btn pos-btn-secondary"
                        style={{ height: '40px', padding: '0 12px', fontSize: '12px' }}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        REFRESH
                    </button>
                    <button
                        onClick={() => router.push('/pos/dashboard')}
                        className="pos-btn"
                        style={{ height: '40px', padding: '0 16px', fontSize: '12px', background: 'var(--pos-text-primary)', color: 'white' }}
                    >
                        BACK TO DASHBOARD
                    </button>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* LEFT: Orders List */}
                <div style={{
                    width: '380px',
                    background: 'var(--pos-bg-surface)',
                    borderRight: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Search & Filter */}
                    <div style={{ padding: '16px', background: 'var(--pos-bg-main)', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pos-input"
                                style={{ paddingLeft: '36px', height: '44px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                            {['ALL', 'PREP', 'READY', 'DONE'].map((label, idx) => {
                                const statuses = ['ALL', 'PREPARING', 'READY', 'COMPLETED'];
                                const status = statuses[idx];
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status as any)}
                                        style={{
                                            height: '32px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--pos-border-subtle)',
                                            background: filterStatus === status ? 'var(--pos-action-primary)' : 'white',
                                            color: filterStatus === status ? 'white' : 'var(--pos-text-secondary)',
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="pos-scroll">
                        {filteredOrders.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredOrders.map(order => {
                                    const statusColor = getStatusColor(order.status);
                                    const StatusIcon = getStatusIcon(order.status);
                                    const isActive = selectedOrder?.id === order.id;

                                    return (
                                        <button
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            style={{
                                                padding: '12px 16px',
                                                background: isActive ? 'var(--pos-bg-main)' : 'white',
                                                border: isActive ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div>
                                                    <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                                        {order.orderNumber}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                                        {order.customer}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '4px 8px',
                                                    background: statusColor.bg,
                                                    border: `1px solid ${statusColor.border}`,
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <StatusIcon size={10} color={statusColor.text} />
                                                    <span style={{ fontSize: '9px', fontWeight: 900, color: statusColor.text, textTransform: 'uppercase' }}>
                                                        {order.status === 'PREPARING' ? 'PREP' : order.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                                    ${order.total.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 700, textAlign: 'right' }}>
                                                    {order.placedAt}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="pos-empty" style={{ paddingTop: '40px' }}>
                                <Clock size={32} color="var(--pos-border-subtle)" />
                                <div className="pos-empty-text" style={{ fontSize: '10px' }}>Empty Grid</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Order Details */}
                <div style={{ flex: 1, background: 'var(--pos-bg-main)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedOrder ? (
                        <>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="pos-scroll">
                                <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                Active Thread
                                            </div>
                                            <h2 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--pos-text-primary)', lineHeight: 1 }}>
                                                {selectedOrder.orderNumber}
                                            </h2>
                                        </div>
                                        {(() => {
                                            const statusColor = getStatusColor(selectedOrder.status);
                                            const StatusIcon = getStatusIcon(selectedOrder.status);
                                            return (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px 20px',
                                                    background: statusColor.bg,
                                                    border: `2px solid ${statusColor.border}`,
                                                    borderRadius: '12px'
                                                }}>
                                                    <StatusIcon size={20} color={statusColor.text} />
                                                    <span style={{ fontSize: '16px', fontWeight: 900, color: statusColor.text, textTransform: 'uppercase' }}>
                                                        {selectedOrder.status}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid var(--pos-border-subtle)' }}>
                                            <div style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>Customer</div>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>{selectedOrder.customer}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>{selectedOrder.phone}</div>
                                            <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
                                                <span style={{ padding: '4px 8px', background: 'var(--pos-bg-main)', borderRadius: '6px', fontSize: '9px', fontWeight: 700 }}>VIP</span>
                                                <span style={{ padding: '4px 8px', background: 'var(--pos-bg-main)', borderRadius: '6px', fontSize: '9px', fontWeight: 700 }}>{selectedOrder.payment}</span>
                                                <span style={{ padding: '4px 8px', background: 'var(--pos-bg-main)', borderRadius: '6px', fontSize: '9px', fontWeight: 700 }}>{selectedOrder.fulfillmentType}</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid var(--pos-border-subtle)' }}>
                                            <div style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>Operational Timing</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '12px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Start</span>
                                                    <span style={{ fontSize: '12px', color: 'var(--pos-text-primary)', fontWeight: 800 }}>{selectedOrder.placedAt}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '12px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>ETA</span>
                                                    <span style={{ fontSize: '12px', color: 'var(--pos-text-primary)', fontWeight: 800 }}>{selectedOrder.estimatedReady}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--pos-border-subtle)', overflow: 'hidden', marginBottom: '24px' }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--pos-border-subtle)', background: 'var(--pos-bg-main)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-primary)', textTransform: 'uppercase' }}>Line Items ({selectedOrder.items})</span>
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>QUANTITY</span>
                                        </div>
                                        <div style={{ padding: '4px 0' }}>
                                            {selectedOrder.itemsList.map((item, idx) => (
                                                <div key={idx} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: idx < selectedOrder.itemsList.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>{item}</div>
                                                    <div style={{ width: '24px', height: '24px', background: 'var(--pos-bg-main)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>1</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ background: 'var(--pos-text-primary)', padding: '20px', borderRadius: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>Final Balance</div>
                                            <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>${selectedOrder.total.toFixed(2)}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>Payment Method</div>
                                            <div style={{ fontSize: '14px', fontWeight: 800 }}>{selectedOrder.payment}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '16px 24px',
                                background: 'var(--pos-bg-surface)',
                                borderTop: '1px solid var(--pos-border-subtle)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleAction('Kitchen Print')} className="pos-btn pos-btn-secondary" style={{ height: '52px', padding: '0 20px', fontSize: '12px' }}>
                                        <Printer size={18} />
                                        KITCHEN
                                    </button>
                                    <button onClick={() => handleAction('Audit')} className="pos-btn pos-btn-secondary" style={{ height: '52px', padding: '0 20px', fontSize: '12px' }}>
                                        <Eye size={18} />
                                        AUDIT
                                    </button>
                                </div>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="pos-btn"
                                    style={{
                                        height: '52px',
                                        flex: 1,
                                        maxWidth: '300px',
                                        background: selectedOrder.status === 'COMPLETED' ? 'var(--pos-state-success)' : 'var(--pos-action-primary)',
                                        color: 'white',
                                        opacity: selectedOrder.status === 'COMPLETED' ? 0.7 : 1,
                                        pointerEvents: selectedOrder.status === 'COMPLETED' ? 'none' : 'auto'
                                    }}
                                >
                                    {selectedOrder.status === 'PREPARING' ? 'MARK AS READY' : selectedOrder.status === 'READY' ? 'FINALIZE ORDER' : 'COMPLETED'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                            <Package size={64} color="var(--pos-text-muted)" />
                            <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '16px' }}>
                                SELECT THREAD
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
