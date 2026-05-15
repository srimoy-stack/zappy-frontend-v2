'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    RotateCcw,
    Search,
    CheckCircle2,
    X,
    User,
    Calendar,
    FileText,
    ChevronRight
} from 'lucide-react';
import '../styles/pos-rush.css';
import { POSBackButton } from '../components/POSBackButton';

// Mock data
const MOCK_ORDERS = [
    {
        id: 'ORD-5506',
        customer: 'Jessica Pearson',
        amount: 79.30,
        date: '2024-02-09',
        items: [
            { id: 'item-1', name: 'Large Pepperoni Pizza', price: 24.99, quantity: 2 },
            { id: 'item-2', name: 'Chicken Wings', price: 12.99, quantity: 1 },
            { id: 'item-3', name: 'Coca Cola', price: 2.50, quantity: 2 },
            { id: 'item-4', name: 'Garlic Bread', price: 5.99, quantity: 1 }
        ]
    },
    {
        id: 'ORD-5507',
        customer: 'Harvey Specter',
        amount: 45.50,
        date: '2024-02-09',
        items: [
            { id: 'item-5', name: 'Truffle Pizza', price: 28.50, quantity: 1 },
            { id: 'item-6', name: 'Garlic Knots', price: 7.50, quantity: 2 },
            { id: 'item-7', name: 'Sprite', price: 2.50, quantity: 1 }
        ]
    },
    {
        id: 'ORD-5508',
        customer: 'Mike Ross',
        amount: 22.00,
        date: '2024-02-08',
        items: [
            { id: 'item-8', name: 'Margherita Pizza', price: 18.00, quantity: 1 },
            { id: 'item-9', name: 'Iced Tea', price: 4.00, quantity: 1 }
        ]
    },
];

const REFUND_REASONS = [
    'Incorrect Item',
    'Poor Quality',
    'Customer Changed Mind',
    'Order Cancelled',
    'Delayed Delivery',
    'Damaged Packaging',
    'Other'
];

const REFUND_METHODS = [
    'Original Payment Method',
    'Cash',
    'Store Credit (Gift Card)',
    'Bank Transfer'
];

const MOCK_REFUNDS = [
    { id: 'REF-001', orderId: 'ORD-5506', customer: 'Jessica Pearson', amount: 45.50, reason: 'Item Unavailable', approver: 'John Store Manager', date: '2024-02-09', items: ['2x Large Pepperoni Pizza'], method: 'Original Payment Method' },
    { id: 'REF-002', orderId: 'ORD-5507', customer: 'Harvey Specter', amount: 22.00, reason: 'Customer Changed Mind', approver: 'Sarah Staff', date: '2024-02-08', items: ['1x Garlic Knots'], method: 'Cash' },
];

export const RefundManagementPage: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [selectedRefund, setSelectedRefund] = useState<any>(null);
    const [refundItems, setRefundItems] = useState<Record<string, number>>({});
    const [refundReason, setRefundReason] = useState(REFUND_REASONS[0]);
    const [refundMethod, setRefundMethod] = useState(REFUND_METHODS[0]);
    const [processing, setProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [refunds, setRefunds] = useState(MOCK_REFUNDS);

    // Get customer filter from URL
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const filterCustomerId = searchParams?.get('customerId');
    const filterCustomerName = searchParams?.get('customerName');

    const totalRefundAmount = useMemo(() => {
        if (!selectedOrder) return 0;
        return selectedOrder.items.reduce((acc: number, item: any) => {
            const qty = refundItems[item.id] || 0;
            return acc + (item.price * qty);
        }, 0);
    }, [selectedOrder, refundItems]);

    const handleSelectOrder = (order: any) => {
        setSelectedOrder(order);
        // Initialize with 0 items for refund (Partial Refund mode by default in many systems)
        // Or could initialize with all items for Full Refund
        const initialItems: Record<string, number> = {};
        setRefundItems(initialItems);
        setRefundReason(REFUND_REASONS[0]);
        setRefundMethod(REFUND_METHODS[0]);
    };

    const handleQuantityChange = (itemId: string, delta: number, max: number) => {
        setRefundItems(prev => {
            const current = prev[itemId] || 0;
            const nextValue = Math.max(0, Math.min(max, current + delta));
            return { ...prev, [itemId]: nextValue };
        });
    };

    const handleFullRefund = () => {
        if (!selectedOrder) return;
        const allItems: Record<string, number> = {};
        selectedOrder.items.forEach((item: any) => {
            allItems[item.id] = item.quantity;
        });
        setRefundItems(allItems);
    };

    // Filter orders by customer if customerId is provided
    const customerOrders = filterCustomerId
        ? MOCK_ORDERS.filter(order => order.customer === filterCustomerName)
        : MOCK_ORDERS;

    const filteredOrders = customerOrders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter refunds by customer if customerId is provided
    const customerRefunds = filterCustomerId
        ? refunds.filter(refund => refund.customer === filterCustomerName)
        : refunds;

    const filteredRefunds = customerRefunds.filter(refund =>
        refund.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        refund.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        refund.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleProcessRefund = () => {
        if (totalRefundAmount <= 0 || !refundReason || !selectedOrder) {
            alert('Please select items to refund and a reason');
            return;
        }

        const currentOrder = selectedOrder;
        setProcessing(true);
        setTimeout(() => {
            const itemsSummary = currentOrder.items
                .filter((i: any) => (refundItems[i.id] || 0) > 0)
                .map((i: any) => `${refundItems[i.id] || 0}x ${i.name}`);

            // Add new refund to state
            const newRefund = {
                id: `REF-${Math.floor(Math.random() * 90) + 100}`,
                orderId: currentOrder.id,
                customer: currentOrder.customer,
                amount: totalRefundAmount,
                reason: refundReason,
                approver: 'John Store Manager',
                date: new Date().toISOString().split('T')[0] ?? '',
                items: itemsSummary,
                method: refundMethod || 'Original Method'
            };

            setRefunds([newRefund, ...refunds]);
            setProcessing(false);
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                setSelectedOrder(null);
                setRefundItems({});
                setActiveTab('history');
            }, 2000);
        }, 1500);
    };

    if (showSuccess) {
        return (
            <div className="pos-screen" style={{ background: 'var(--pos-bg-main)' }}>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'var(--pos-bg-surface)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 32px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
                            border: '4px solid var(--pos-state-success)'
                        }}>
                            <CheckCircle2 size={70} color="var(--pos-state-success)" />
                        </div>
                        <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '16px' }}>
                            Refund Processed
                        </h1>
                        <p style={{ fontSize: '18px', color: 'var(--pos-text-secondary)', fontWeight: 700, marginBottom: '32px' }}>
                            ${totalRefundAmount.toFixed(2)} has been refunded successfully
                        </p>
                        <div style={{
                            background: 'var(--pos-bg-surface)',
                            border: '1px solid var(--pos-border-subtle)',
                            borderRadius: '20px',
                            padding: '24px',
                            fontSize: '14px',
                            color: 'var(--pos-text-muted)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            Redirecting to refund history...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pos-screen" style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <POSBackButton />
                    <div>
                        <h1 className="pos-title-lg">Refund Management</h1>
                        <div style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                            Process refunds and view history
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '8px', background: 'var(--pos-bg-surface)', padding: '4px', borderRadius: '12px' }}>
                    <button
                        onClick={() => setActiveTab('create')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === 'create' ? 'var(--pos-action-primary)' : 'transparent',
                            color: activeTab === 'create' ? 'white' : 'var(--pos-text-secondary)',
                            fontSize: '14px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        CREATE REFUND
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === 'history' ? 'var(--pos-action-primary)' : 'transparent',
                            color: activeTab === 'history' ? 'white' : 'var(--pos-text-secondary)',
                            fontSize: '14px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        REFUND HISTORY
                    </button>
                </div>
            </div>

            {/* Customer Filter Indicator */}
            {filterCustomerId && filterCustomerName && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px 20px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid var(--pos-action-primary)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={20} color="var(--pos-action-primary)" />
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-action-primary)', textTransform: 'uppercase' }}>
                                Viewing Customer
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                {filterCustomerName}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/pos/refund-management')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '2px solid var(--pos-action-primary)',
                            background: 'transparent',
                            color: 'var(--pos-action-primary)',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        className="hover-scale"
                    >
                        VIEW ALL
                    </button>
                </div>
            )}

            {/* CREATE REFUND TAB */}
            {activeTab === 'create' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
                    {/* Left: Order Search & Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                            <input
                                className="pos-input"
                                style={{ paddingLeft: '48px', height: '56px' }}
                                placeholder="Search by Order ID or Customer Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Order List */}
                        <div className="pos-card" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
                                {filterCustomerName ? `${filterCustomerName}'s Orders` : 'Recent Orders'}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {filteredOrders.map(order => (
                                    <button
                                        key={order.id}
                                        onClick={() => handleSelectOrder(order)}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: selectedOrder?.id === order.id ? '2px solid var(--pos-action-primary)' : '2px solid var(--pos-border-subtle)',
                                            background: selectedOrder?.id === order.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--pos-bg-surface)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-scale"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-action-primary)' }}>{order.id}</div>
                                                <div style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>{order.customer}</div>
                                            </div>
                                            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                                ${order.amount.toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                                            {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Refund Form */}
                    <div className="pos-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        {selectedOrder ? (
                            <>
                                <div style={{ padding: '24px', borderBottom: '1px solid var(--pos-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '8px' }}>
                                            New Refund
                                        </h2>
                                        <p style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                                            Order: {selectedOrder.id} • {selectedOrder.customer}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleFullRefund}
                                        className="pos-btn-secondary"
                                        style={{ padding: '8px 16px', fontSize: '12px' }}
                                    >
                                        FULL REFUND
                                    </button>
                                </div>

                                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                                    {/* Item List for Refund */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '16px', display: 'block', textTransform: 'uppercase' }}>
                                            Select Items to Refund
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {selectedOrder.items.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '12px',
                                                        background: 'var(--pos-bg-surface)',
                                                        borderRadius: '12px',
                                                        border: (refundItems[item.id] || 0) > 0 ? '2px solid var(--pos-action-primary)' : '2px solid transparent'
                                                    }}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>{item.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                                                            ${item.price.toFixed(2)} • Max: {item.quantity}
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '8px' }}>
                                                            <button
                                                                onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                                                                style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'var(--pos-bg-surface)', color: 'var(--pos-text-primary)', cursor: 'pointer' }}
                                                            >-</button>
                                                            <span style={{ fontSize: '16px', fontWeight: 900, minWidth: '24px', textAlign: 'center' }}>
                                                                {refundItems[item.id] || 0}
                                                            </span>
                                                            <button
                                                                onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                                                                style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'var(--pos-bg-surface)', color: 'var(--pos-text-primary)', cursor: 'pointer' }}
                                                            >+</button>
                                                        </div>
                                                        <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)', minWidth: '70px', textAlign: 'right' }}>
                                                            ${((refundItems[item.id] || 0) * item.price).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {/* Refund Reason */}
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>
                                                Refund Reason
                                            </label>
                                            <select
                                                className="pos-input"
                                                value={refundReason}
                                                onChange={(e) => setRefundReason(e.target.value)}
                                                style={{ height: '48px' }}
                                            >
                                                {REFUND_REASONS.map(reason => (
                                                    <option key={reason} value={reason}>{reason}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Refund Method */}
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>
                                                Refund Method
                                            </label>
                                            <select
                                                className="pos-input"
                                                value={refundMethod}
                                                onChange={(e) => setRefundMethod(e.target.value)}
                                                style={{ height: '48px' }}
                                            >
                                                {REFUND_METHODS.map(method => (
                                                    <option key={method} value={method}>{method}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '24px', borderTop: '1px solid var(--pos-border-subtle)', background: 'rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-secondary)' }}>Total Refund</span>
                                        <span style={{ fontSize: '32px', fontWeight: 900, color: 'var(--pos-state-error)' }}>
                                            ${totalRefundAmount.toFixed(2)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleProcessRefund}
                                        disabled={totalRefundAmount <= 0 || processing}
                                        className="pos-btn pos-btn-primary"
                                        style={{
                                            width: '100%',
                                            background: totalRefundAmount > 0 ? 'var(--pos-state-error)' : 'var(--pos-bg-surface)',
                                            color: totalRefundAmount > 0 ? 'white' : 'var(--pos-text-muted)',
                                            cursor: totalRefundAmount > 0 ? 'pointer' : 'not-allowed',
                                            height: '64px',
                                            fontSize: '18px'
                                        }}
                                    >
                                        {processing ? (
                                            'PROCESSING...'
                                        ) : (
                                            <>
                                                <RotateCcw size={24} />
                                                CONFIRM REFUND
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
                                <RotateCcw size={64} color="var(--pos-text-muted)" style={{ opacity: 0.3, marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px' }}>
                                    Select an Order
                                </h3>
                                <p style={{ fontSize: '14px', color: 'var(--pos-text-muted)', textAlign: 'center' }}>
                                    Choose an order from the list to process a refund
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* REFUND HISTORY TAB */}
            {activeTab === 'history' && (
                <div style={{ display: 'grid', gridTemplateColumns: selectedRefund ? '1fr 1fr' : '1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
                    {/* Refund List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                            <input
                                className="pos-input"
                                style={{ paddingLeft: '48px', height: '56px' }}
                                placeholder="Search refunds..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Refund List */}
                        <div className="pos-card" style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                            {filteredRefunds.map((refund, index) => (
                                <button
                                    key={refund.id}
                                    onClick={() => setSelectedRefund(refund)}
                                    style={{
                                        width: '100%',
                                        padding: '20px 24px',
                                        borderBottom: index < filteredRefunds.length - 1 ? '1px solid var(--pos-border-subtle)' : 'none',
                                        background: selectedRefund?.id === refund.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                        border: 'none',
                                        borderLeft: selectedRefund?.id === refund.id ? '4px solid var(--pos-action-primary)' : '4px solid transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover-scale"
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-action-primary)' }}>{refund.id}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Order: {refund.orderId}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-state-error)' }}>
                                                -${refund.amount.toFixed(2)}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                                                {refund.date}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                                        {refund.customer}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                                        {refund.reason}
                                    </div>
                                    {selectedRefund?.id !== refund.id && (
                                        <ChevronRight size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Refund Details */}
                    {selectedRefund && (
                        <div className="pos-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--pos-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '8px' }}>
                                        Refund Details
                                    </h2>
                                    <p style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                                        {selectedRefund.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedRefund(null)}
                                    className="pos-icon-btn"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                                {/* Refund Amount */}
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '2px solid var(--pos-state-error)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{ fontSize: '12px', color: 'var(--pos-state-error)', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase' }}>
                                        Refunded Amount
                                    </div>
                                    <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--pos-state-error)', lineHeight: 1 }}>
                                        ${selectedRefund.amount.toFixed(2)}
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={16} /> Order ID
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>
                                            {selectedRefund.orderId}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={16} /> Customer
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>
                                            {selectedRefund.customer}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={16} /> Date
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>
                                            {selectedRefund.date}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Reason
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--pos-text-secondary)', padding: '12px', background: 'var(--pos-bg-surface)', borderRadius: '8px' }}>
                                            {selectedRefund.reason}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Refunded Items
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {selectedRefund.items.map((item: string, idx: number) => (
                                                <div key={idx} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--pos-text-secondary)', padding: '12px', background: 'var(--pos-bg-surface)', borderRadius: '8px' }}>
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={16} /> Approved By
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>
                                            {selectedRefund.approver}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RefundManagementPage;
