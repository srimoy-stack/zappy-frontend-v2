'use client';

import React, { useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import '../styles/pos-rush.css';

const MOCK_KDS_ORDERS = [
    { id: '1001', items: ['2x Burger', '1x Fries'], time: 5, status: 'PREPARING' },
    { id: '1002', items: ['1x Pizza (Large)', '2x Coke'], time: 12, status: 'PREPARING' },
    { id: '1003', items: ['1x Salad', '1x Water'], time: 2, status: 'NEW' },
    { id: '1004', items: ['3x Tacos', '1x Nachos'], time: 8, status: 'PREPARING' },
    { id: '1005', items: ['1x Steak', '1x Wine'], time: 15, status: 'LATE' },
];

export const KitchenDisplayPage: React.FC = () => {
    const [orders, setOrders] = useState(MOCK_KDS_ORDERS);

    const handleBump = (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };

    return (
        <div className="pos-screen" style={{ padding: '24px' }}>
            <div className="pos-header" style={{ marginBottom: '24px', background: 'transparent', border: 'none', padding: 0 }}>
                <h1 className="pos-title-lg">Kitchen Display System (KDS)</h1>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="pos-badge pos-badge-info">Avg Time: 8m</div>
                    <div className="pos-badge pos-badge-warning">Late Orders: 1</div>
                </div>
            </div>

            <div className="pos-grid-4">
                {orders.map(order => (
                    <div
                        key={order.id}
                        className="pos-card"
                        style={{
                            borderTop: `4px solid ${order.status === 'LATE' ? 'var(--pos-state-error)' : order.status === 'NEW' ? 'var(--pos-state-success)' : 'var(--pos-action-primary)'}`,
                            minHeight: '300px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--pos-border-subtle)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>#{order.id}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: order.time > 10 ? 'var(--pos-state-error)' : 'var(--pos-text-muted)' }}>
                                <Clock size={16} />
                                {order.time}m
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            {order.items.map((item, idx) => (
                                <div key={idx} style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                                    {item}
                                </div>
                            ))}
                        </div>

                        <button
                            className="pos-btn-success"
                            style={{ marginTop: '16px', borderRadius: '8px', height: '48px' }}
                            onClick={() => handleBump(order.id)}
                        >
                            <CheckCircle size={20} style={{ marginRight: '8px' }} />
                            Bump
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KitchenDisplayPage;
