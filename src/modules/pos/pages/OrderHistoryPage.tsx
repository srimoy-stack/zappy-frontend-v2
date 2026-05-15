'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search, Download, Eye, Printer } from 'lucide-react';
import '../styles/pos-rush.css';

const mockOrders = [
    {
        id: 'O001',
        orderNumber: '#1234',
        date: '2026-02-09',
        time: '11:30 AM',
        customer: 'John Doe',
        phone: '+1 (555) 123-4567',
        fulfillment: 'DELIVERY',
        status: 'COMPLETED',
        total: 79.30,
        items: 3,
        paymentMethod: 'CARD'
    },
    {
        id: 'O002',
        orderNumber: '#1233',
        date: '2026-02-09',
        time: '11:15 AM',
        customer: 'Sarah Smith',
        phone: '+1 (555) 234-5678',
        fulfillment: 'DINE_IN',
        status: 'COMPLETED',
        total: 45.50,
        items: 2,
        paymentMethod: 'CASH'
    },
    {
        id: 'O003',
        orderNumber: '#1232',
        date: '2026-02-09',
        time: '10:45 AM',
        customer: 'Mike Johnson',
        phone: '+1 (555) 345-6789',
        fulfillment: 'TAKEAWAY',
        status: 'REFUNDED',
        total: 32.00,
        items: 1,
        paymentMethod: 'CARD'
    },
    {
        id: 'O004',
        orderNumber: '#1231',
        date: '2026-02-08',
        time: '08:20 PM',
        customer: 'Emma Davis',
        phone: '+1 (555) 456-7890',
        fulfillment: 'DELIVERY',
        status: 'COMPLETED',
        total: 156.75,
        items: 8,
        paymentMethod: 'CARD'
    },
    {
        id: 'O005',
        orderNumber: '#1230',
        date: '2026-02-08',
        time: '07:45 PM',
        customer: 'Guest',
        phone: 'N/A',
        fulfillment: 'DINE_IN',
        status: 'CANCELLED',
        total: 0,
        items: 0,
        paymentMethod: 'N/A'
    },
];

export const OrderHistoryPage: React.FC = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'>('ALL');
    const [dateRange, setDateRange] = useState('TODAY');

    const filteredOrders = mockOrders.filter(order => {
        const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.phone.includes(searchQuery);
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10B981', text: '#6EE7B7' };
            case 'REFUNDED':
                return { bg: 'rgba(245, 158, 11, 0.2)', border: '#F59E0B', text: '#FCD34D' };
            case 'CANCELLED':
                return { bg: 'rgba(239, 68, 68, 0.2)', border: '#EF4444', text: '#FCA5A5' };
            default:
                return { bg: 'rgba(59, 130, 246, 0.2)', border: '#3B82F6', text: '#93C5FD' };
        }
    };

    const totalRevenue = filteredOrders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + o.total, 0);

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
                        <History size={28} color="#1E3A8A" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                            Order History
                        </h1>
                        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            {filteredOrders.length} orders • ${totalRevenue.toFixed(2)} revenue
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="pos-btn pos-btn-secondary">
                        <Download size={20} />
                        Export
                    </button>
                    <button
                        onClick={() => router.push('/pos/dashboard')}
                        className="pos-btn pos-btn-secondary"
                    >
                        Back
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 88px)' }}>
                {/* Filters */}
                <div style={{ padding: '20px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                    <div className="pos-grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                            <input
                                type="text"
                                placeholder="Search orders, customers, phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pos-input"
                                style={{ paddingLeft: '48px' }}
                            />
                        </div>

                        {/* Date Range */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="pos-input"
                        >
                            <option value="TODAY">Today</option>
                            <option value="YESTERDAY">Yesterday</option>
                            <option value="WEEK">This Week</option>
                            <option value="MONTH">This Month</option>
                            <option value="CUSTOM">Custom Range</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {['ALL', 'COMPLETED', 'REFUNDED', 'CANCELLED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: filterStatus === status ? 'white' : 'rgba(255, 255, 255, 0.1)',
                                    color: filterStatus === status ? '#1E3A8A' : 'white',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div style={{ flex: 1, overflow: 'auto', padding: '20px' }} className="pos-scroll">
                    {filteredOrders.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredOrders.map(order => {
                                const statusColor = getStatusColor(order.status);
                                return (
                                    <div
                                        key={order.id}
                                        className="pos-card"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            display: 'grid',
                                            gridTemplateColumns: '200px 1fr 150px 150px 120px 150px',
                                            gap: '20px',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {/* Order Number & Time */}
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                                                {order.orderNumber}
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                                {order.date} • {order.time}
                                            </div>
                                        </div>

                                        {/* Customer */}
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                                {order.customer}
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                                {order.phone}
                                            </div>
                                        </div>

                                        {/* Fulfillment */}
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>
                                                {order.fulfillment}
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
                                                {order.items} items
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <div style={{
                                                padding: '8px 12px',
                                                background: statusColor.bg,
                                                border: `2px solid ${statusColor.border}`,
                                                borderRadius: '10px',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total & Actions */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>
                                                ${order.total.toFixed(2)}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => router.push(`/pos/order-details?id=${order.id}`)}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="pos-empty">
                            <History className="pos-empty-icon" />
                            <div className="pos-empty-text">No Orders Found</div>
                        </div>
                    )}
                </div>

                {/* Summary Footer */}
                <div style={{
                    padding: '20px',
                    borderTop: '2px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    <div className="pos-grid-4" style={{ gap: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                                Total Orders
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>
                                {filteredOrders.length}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                                Completed
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#6EE7B7' }}>
                                {filteredOrders.filter(o => o.status === 'COMPLETED').length}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                                Refunded
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FCD34D' }}>
                                {filteredOrders.filter(o => o.status === 'REFUNDED').length}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                                Total Revenue
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>
                                ${totalRevenue.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
