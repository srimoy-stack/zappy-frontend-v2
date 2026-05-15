'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Play,
    Trash2,
    Clock,
    Search,
    ArrowLeft,
    Phone,
    AlertCircle,
    ShoppingBag,
    Calendar
} from 'lucide-react';
import '../styles/pos-rush.css';

// Mock held orders
const enrichedMockHeldOrders = [
    {
        id: 'H001',
        orderNumber: '#H001',
        customer: 'Alice Brown',
        phone: '+1 (555) 111-2222',
        items: 4,
        total: 52.00,
        heldAt: '10:30 AM',
        heldBy: 'John (Cashier)',
        reason: 'Customer stepped away',
        itemsList: ['Large Pizza', 'Garlic Bread', 'Coke x2'],
        initials: 'AB'
    },
    {
        id: 'H002',
        orderNumber: '#H002',
        customer: 'Bob Wilson',
        phone: '+1 (555) 333-4444',
        items: 2,
        total: 24.50,
        heldAt: '10:45 AM',
        heldBy: 'Sarah (Cashier)',
        reason: 'Payment issue',
        itemsList: ['Medium Pizza', 'Fries'],
        initials: 'BW'
    },
    {
        id: 'H003',
        orderNumber: '#H003',
        customer: 'Carol Davis',
        phone: '+1 (555) 555-6666',
        items: 6,
        total: 78.25,
        heldAt: '11:00 AM',
        heldBy: 'Mike (Cashier)',
        reason: 'Waiting for additional items',
        itemsList: ['2x Large Pizza', 'Wings', 'Salad', 'Drinks x2'],
        initials: 'CD'
    }
];

export const HeldOrdersPage: React.FC = () => {
    const router = useRouter();
    const [selectedOrder, setSelectedOrder] = useState<typeof enrichedMockHeldOrders[0] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = useMemo(() => enrichedMockHeldOrders.filter(order =>
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery)
    ), [searchQuery]);

    const handleResumeOrder = (_order: typeof enrichedMockHeldOrders[0]) => {
        router.push('/pos/menu');
    };

    const handleDeleteOrder = (orderId: string) => {
        if (confirm(`Are you sure you want to void order ${orderId}?`)) {
            alert(`Order ${orderId} has been voided.`);
        }
    };

    return (
        <div className="pos-held-orders-container">
            <style>{`
                .pos-held-orders-container {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: var(--pos-bg-main);
                    color: var(--pos-text-primary);
                    font-family: var(--pos-font-family);
                }

                .held-header {
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    background: var(--pos-bg-surface);
                    border-bottom: 1px solid var(--pos-border-subtle);
                    z-index: 10;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .main-layout {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                    padding: 24px;
                    gap: 24px;
                }

                .left-column {
                    width: 420px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .search-container {
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--pos-text-muted);
                }

                .search-input {
                    width: 100%;
                    height: 60px;
                    background: var(--pos-bg-surface);
                    border: 1px solid var(--pos-border-subtle);
                    border-radius: 16px;
                    padding-left: 52px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--pos-text-primary);
                    outline: none;
                    transition: all 0.2s;
                }

                .search-input:focus {
                    border-color: var(--pos-action-primary);
                    box-shadow: 0 4px 12px rgba(31, 164, 169, 0.08);
                }

                .orders-list {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding-right: 4px;
                }

                .order-card {
                    background: var(--pos-bg-surface);
                    border: 1px solid var(--pos-border-subtle);
                    border-radius: 20px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                }

                .order-card:hover {
                    border-color: var(--pos-text-muted);
                    transform: translateY(-2px);
                }

                .order-card.selected {
                    background: var(--pos-action-secondary);
                    border-color: var(--pos-action-primary);
                }

                .avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    background: rgba(31, 164, 169, 0.1);
                    color: var(--pos-action-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 18px;
                }

                .details-panel {
                    flex: 1;
                    background: var(--pos-bg-surface);
                    border: 1px solid var(--pos-border-subtle);
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .details-header {
                    padding: 40px;
                    border-bottom: 1px solid var(--pos-border-subtle);
                    background: #FAFBFC;
                }

                .reason-box {
                    background: #FFFBEB;
                    border: 1px solid #FEF3C7;
                    border-radius: 16px;
                    padding: 20px;
                    margin-top: 24px;
                    display: flex;
                    gap: 16px;
                }

                .items-content {
                    padding: 40px;
                    flex: 1;
                    overflow-y: auto;
                }

                .items-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }

                .item-card {
                    padding: 16px 20px;
                    background: var(--pos-bg-main);
                    border: 1px solid var(--pos-border-subtle);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 600;
                }

                .details-footer {
                    padding: 32px 40px;
                    background: #FAFBFC;
                    border-top: 1px solid var(--pos-border-subtle);
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }

                .resume-button {
                    flex: 2;
                    height: 64px;
                    background: var(--pos-action-primary);
                    color: white;
                    border: none;
                    border-radius: 16px;
                    font-size: 18px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .resume-button:hover {
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(31, 164, 169, 0.2);
                }

                .void-button {
                    flex: 1;
                    height: 64px;
                    background: #FEE2E2;
                    color: #EF4444;
                    border: 2px solid #FEE2E2;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .void-button:hover {
                    background: #FECACA;
                    border-color: #F87171;
                }

                .empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--pos-text-muted);
                }

                .orders-list::-webkit-scrollbar { width: 4px; }
                .orders-list::-webkit-scrollbar-thumb { background: var(--pos-border-subtle); border-radius: 10px; }
            `}</style>

            <header className="held-header">
                <div className="header-left">
                    <button
                        onClick={() => router.push('/pos/dashboard')}
                        style={{
                            background: 'white',
                            border: '1px solid var(--pos-border-subtle)',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--pos-text-primary)'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Held Orders</h1>
                        <p style={{ margin: 0, color: 'var(--pos-text-muted)', fontSize: '13px', fontWeight: 600 }}>Recover deferred transactions from previous sessions</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>System Status</div>
                        <div style={{ color: 'var(--pos-state-success)', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: 8, height: 8, background: 'var(--pos-state-success)', borderRadius: '50%' }} />
                            STABLE & SYNCED
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-layout">
                <div className="left-column">
                    <div className="search-container">
                        <Search className="search-icon" size={20} />
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search by customer or order..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="orders-list">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <button
                                    key={order.id}
                                    className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div className="avatar">
                                            {order.initials}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '16px', fontWeight: 800 }}>{order.customer}</span>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--pos-action-primary)' }}>{order.orderNumber}</span>
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>{order.phone}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 800 }}>${order.total.toFixed(2)}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--pos-text-muted)', fontSize: '12px', fontWeight: 700 }}>
                                            <Clock size={14} />
                                            {order.heldAt}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="empty-state">
                                <AlertCircle size={40} />
                                <p style={{ fontWeight: 700, marginTop: '12px' }}>No matches found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="details-panel">
                    {selectedOrder ? (
                        <>
                            <div className="details-header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                                            Active Selection
                                        </div>
                                        <h2 style={{ fontSize: '40px', fontWeight: 950, margin: 0, color: 'var(--pos-text-primary)' }}>{selectedOrder.customer}</h2>
                                        <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                                <Phone size={16} /> {selectedOrder.phone}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                                <Calendar size={16} /> Held at {selectedOrder.heldAt}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '4px' }}>ORDER ID</div>
                                        <div style={{ fontSize: '28px', fontWeight: 900 }}>{selectedOrder.orderNumber}</div>
                                    </div>
                                </div>

                                <div className="reason-box">
                                    <AlertCircle size={24} color="var(--pos-state-warning)" />
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-state-warning)', textTransform: 'uppercase' }}>Hold Context</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{selectedOrder.reason}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontWeight: 600, marginTop: '4px' }}>By Agent: {selectedOrder.heldBy}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="items-content">
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>
                                    Items Breakdown ({selectedOrder.items})
                                </h3>
                                <div className="items-list">
                                    {selectedOrder.itemsList.map((item, i) => (
                                        <div key={i} className="item-card">
                                            <div style={{ width: 8, height: 8, background: 'var(--pos-action-primary)', borderRadius: '50%' }} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="details-footer">
                                <div style={{ flex: 1, borderLeft: '4px solid var(--pos-action-primary)', paddingLeft: '24px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-text-muted)' }}>RECOVERABLE AMOUNT</div>
                                    <div style={{ fontSize: '32px', fontWeight: 950 }}>${selectedOrder.total.toFixed(2)}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', flex: 2 }}>
                                    <button className="resume-button" onClick={() => handleResumeOrder(selectedOrder)}>
                                        <Play size={22} fill="currentColor" />
                                        RESUME ORDER
                                    </button>
                                    <button className="void-button" onClick={() => handleDeleteOrder(selectedOrder.id)}>
                                        <Trash2 size={20} />
                                        VOID
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <ShoppingBag size={80} style={{ opacity: 0.1, marginBottom: '24px' }} />
                            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--pos-text-secondary)' }}>Select an order to resume</h2>
                            <p style={{ fontWeight: 600, maxWidth: '300px', textAlign: 'center' }}>Choose an order from the list on the left to see full details and resume checkout.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HeldOrdersPage;
