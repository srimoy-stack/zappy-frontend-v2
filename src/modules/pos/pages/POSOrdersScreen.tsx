'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    ArrowLeft,
    Pause,
    Play,
    RotateCcw,
    Printer,
    XCircle,
    ChevronRight,
    ShoppingBag,
    CheckCircle2
} from 'lucide-react';
import { mockRecentOrders } from '../mock/posData';
import '../styles/pos-rush.css';

export const POSOrdersScreen = () => {
    const router = useRouter();
    const [view, setView] = useState<'OPEN' | 'HELD' | 'CLOSED'>('OPEN');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // Filter logic
    const filteredOrders = mockRecentOrders.filter(o =>
        view === 'OPEN' ? o.status !== 'COMPLETED' && o.status !== 'CANCELLED' :
            view === 'CLOSED' ? o.status === 'COMPLETED' || o.status === 'CANCELLED' :
                true
    );

    const selectedOrder = mockRecentOrders.find(o => o.id === selectedOrderId);

    return (
        <div className="pos-orders-screen">
            <style>{`
                .pos-orders-screen {
                    height: 100vh;
                    display: flex;
                    background: var(--pos-bg-main);
                    color: var(--pos-text-primary);
                    font-family: var(--pos-font-family);
                    overflow: hidden;
                }

                .orders-sidebar {
                    width: 320px;
                    background: var(--pos-bg-surface);
                    border-right: 1px solid var(--pos-border-subtle);
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    z-index: 10;
                }

                .sidebar-header {
                    height: 90px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    border-bottom: 1px solid var(--pos-border-subtle);
                }

                .back-icon-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--pos-bg-main);
                    border: 1px solid var(--pos-border-subtle);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--pos-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .back-icon-btn:hover {
                    background: var(--pos-border-subtle);
                    color: var(--pos-text-primary);
                }

                .view-selector {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    overflow-y: auto;
                }

                .view-btn {
                    width: 100%;
                    padding: 20px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    transition: all 0.2s;
                    border: 1px solid var(--pos-border-subtle);
                    background: var(--pos-bg-surface);
                    cursor: pointer;
                    text-align: left;
                }

                .view-btn.active.open { background: var(--pos-state-success); color: white; border-color: var(--pos-state-success); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
                .view-btn.active.held { background: var(--pos-state-warning); color: white; border-color: var(--pos-state-warning); box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2); }
                .view-btn.active.closed { background: #3B82F6; color: white; border-color: #3B82F6; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2); }

                .view-btn:not(.active):hover {
                    border-color: var(--pos-action-primary);
                    color: var(--pos-action-primary);
                }

                .main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .main-header {
                    height: 90px;
                    padding: 0 32px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    background: var(--pos-bg-surface);
                    border-bottom: 1px solid var(--pos-border-subtle);
                }

                .search-box-container {
                    flex: 1;
                    position: relative;
                }

                .search-input-field {
                    width: 100%;
                    height: 56px;
                    background: var(--pos-bg-main);
                    border: 1px solid var(--pos-border-subtle);
                    border-radius: 12px;
                    padding-left: 48px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--pos-text-primary);
                    outline: none;
                }

                .order-list-area {
                    flex: 1;
                    padding: 32px;
                    overflow-y: auto;
                }

                .order-row-item {
                    width: 100%;
                    background: var(--pos-bg-surface);
                    border: 1px solid var(--pos-border-subtle);
                    border-radius: 16px;
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    border: 1px solid var(--pos-border-subtle);
                }

                .order-row-item:hover {
                    border-color: var(--pos-text-muted);
                    transform: translateY(-2px);
                }

                .order-row-item.selected {
                    border-color: var(--pos-action-primary);
                    background: var(--pos-action-secondary);
                }

                .details-aside {
                    width: 450px;
                    background: var(--pos-bg-surface);
                    border-left: 1px solid var(--pos-border-subtle);
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    z-index: 10;
                }

                .details-header-section {
                    padding: 32px;
                    border-bottom: 1px solid var(--pos-border-subtle);
                }

                .details-scrollable {
                    flex: 1;
                    padding: 32px;
                    overflow-y: auto;
                }

                .attribution-card {
                    background: #F8FAFC;
                    border: 1px solid var(--pos-border-subtle);
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .timeline-box {
                    position: relative;
                    padding-left: 24px;
                    margin-top: 24px;
                }

                .timeline-step {
                    position: relative;
                    padding-bottom: 24px;
                }

                .step-line {
                    position: absolute;
                    left: -16px;
                    top: 8px;
                    bottom: 0;
                    width: 2px;
                    background: var(--pos-border-subtle);
                }

                .step-dot {
                    position: absolute;
                    left: -20px;
                    top: 4px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--pos-state-success);
                    border: 2px solid white;
                }

                .footer-actions-container {
                    padding: 24px;
                    background: var(--pos-bg-surface);
                    border-top: 1px solid var(--pos-border-subtle);
                }

                .btn-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .control-btn {
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    text-transform: uppercase;
                    font-size: 13px;
                }

                .btn-primary { background: var(--pos-state-success); color: white; }
                .btn-secondary { background: var(--pos-bg-main); color: var(--pos-text-primary); border: 1px solid var(--pos-border-subtle); }
                .btn-error { background: #FEE2E2; color: var(--pos-state-error); border: 1px solid #FCA5A5; }

                .list-labels {
                    display: flex;
                    padding: 0 24px;
                    marginBottom: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--pos-text-muted);
                }
            `}</style>

            {/* SIDEBAR */}
            <aside className="orders-sidebar">
                <header className="sidebar-header">
                    <button onClick={() => router.push('/pos/dashboard')} className="back-icon-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <h3 style={{ fontSize: '20px', fontWeight: 900 }}>Order Vault</h3>
                </header>

                <div className="view-selector">
                    <button onClick={() => setView('OPEN')} className={`view-btn open ${view === 'OPEN' ? 'active' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Play size={24} fill={view === 'OPEN' ? 'currentColor' : 'none'} />
                            <span style={{ fontSize: '24px', fontWeight: 900 }}>12</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>Active Orders</span>
                    </button>

                    <button onClick={() => setView('HELD')} className={`view-btn held ${view === 'HELD' ? 'active' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Pause size={24} fill={view === 'HELD' ? 'currentColor' : 'none'} />
                            <span style={{ fontSize: '24px', fontWeight: 900 }}>04</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>Held Sessions</span>
                    </button>

                    <button onClick={() => setView('CLOSED')} className={`view-btn closed ${view === 'CLOSED' ? 'active' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <CheckCircle2 size={24} />
                            <span style={{ fontSize: '24px', fontWeight: 900 }}>48</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>Settled Today</span>
                    </button>
                </div>
            </aside>

            {/* LIST */}
            <main className="main-content">
                <header className="main-header">
                    <div className="search-box-container">
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} size={20} />
                        <input type="text" placeholder="Locate by ID or Guest Name..." className="search-input-field" />
                    </div>
                </header>

                <div className="order-list-area">
                    <div className="list-labels">
                        <div style={{ width: '100px' }}>TIMESTAMP</div>
                        <div style={{ flex: 1 }}>DETAILS</div>
                        <div style={{ width: '120px', textAlign: 'center' }}>STATUS</div>
                        <div style={{ width: '120px', textAlign: 'right' }}>TOTAL</div>
                        <div style={{ width: '40px' }}></div>
                    </div>

                    {filteredOrders.map(o => (
                        <div
                            key={o.id}
                            onClick={() => setSelectedOrderId(o.id)}
                            className={`order-row-item ${selectedOrderId === o.id ? 'selected' : ''}`}
                        >
                            <div style={{ width: '100px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{o.time}</div>
                                <div style={{ fontSize: '11px', color: 'var(--pos-action-primary)', fontWeight: 800 }}>{o.id}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 800 }}>{o.customer || 'Walk-In'}</div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>{o.type} {(o as any).tableId ? `• Table ${(o as any).tableId}` : ''}</div>
                            </div>
                            <div style={{ width: '120px', textAlign: 'center' }}>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 900,
                                    background: o.status === 'COMPLETED' ? '#ECFDF5' : o.status === 'PENDING' ? '#FFFBEB' : '#FEF2F2',
                                    color: o.status === 'COMPLETED' ? '#059669' : o.status === 'PENDING' ? '#B45309' : '#DC2626'
                                }}>
                                    {o.status}
                                </span>
                            </div>
                            <div style={{ width: '120px', textAlign: 'right', fontSize: '20px', fontWeight: 900 }}>
                                ${o.amount.toFixed(2)}
                            </div>
                            <div style={{ width: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                                <ChevronRight size={20} color={selectedOrderId === o.id ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)'} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* DETAILS */}
            <aside className="details-aside">
                {selectedOrder ? (
                    <>
                        <div className="details-header-section">
                            <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Transaction</span>
                            <h2 style={{ fontSize: '32px', fontWeight: 950, marginTop: '4px' }}>{selectedOrder.id}</h2>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <div style={{ flex: 1, padding: '12px', background: 'var(--pos-bg-main)', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 800 }}>AGENT</div>
                                    <div style={{ fontSize: '13px', fontWeight: 800 }}>Sarah A.</div>
                                </div>
                                <div style={{ flex: 1, padding: '12px', background: 'var(--pos-bg-main)', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 800 }}>STATION</div>
                                    <div style={{ fontSize: '13px', fontWeight: 800 }}>POS-01</div>
                                </div>
                            </div>
                        </div>

                        <div className="details-scrollable">
                            <div className="attribution-card">
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '52px', height: '52px', background: 'white', borderRadius: '14px', border: '1px solid var(--pos-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 950, color: 'var(--pos-action-primary)' }}>
                                        {selectedOrder.customer?.charAt(0) || 'W'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 850 }}>{selectedOrder.customer || 'Walk-In Customer'}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>+1 (555) 012-3456</div>
                                    </div>
                                </div>
                            </div>

                            <section>
                                <h4 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Order Synopsis</h4>
                                <div style={{ marginBottom: '24px' }}>
                                    {[1, 2].map(i => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--pos-action-primary)' }}>1x</span>
                                                <div style={{ fontSize: '14px', fontWeight: 800 }}>Premium Classic Item {i}</div>
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 800 }}>$12.50</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ paddingTop: '16px', borderTop: '2px dashed var(--pos-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 900 }}>DUE AMOUNT</span>
                                    <span style={{ fontSize: '28px', fontWeight: 950, color: 'var(--pos-state-success)' }}>${selectedOrder.amount.toFixed(2)}</span>
                                </div>
                            </section>

                            <section style={{ marginTop: '32px' }}>
                                <h4 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Status Log</h4>
                                <div className="timeline-box">
                                    {[
                                        { time: '11:20 AM', label: 'Order Registered', status: 'done' },
                                        { time: '11:25 AM', label: 'Kitchen Fired', status: 'done' },
                                        { time: '11:45 AM', label: 'Awaiting Pickup', status: 'pending' }
                                    ].map((step, idx) => (
                                        <div key={idx} className="timeline-step">
                                            {idx < 2 && <div className="step-line"></div>}
                                            <div className="step-dot" style={{ background: step.status === 'done' ? 'var(--pos-state-success)' : 'var(--pos-border-subtle)' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: step.status === 'done' ? 'var(--pos-text-primary)' : 'var(--pos-text-muted)' }}>{step.label}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--pos-text-muted)' }}>{step.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="footer-actions-container">
                            <div className="btn-grid" style={{ marginBottom: '12px' }}>
                                <button onClick={() => router.push('/pos/menu')} className="control-btn btn-primary">
                                    <Play size={18} fill="white" /> Resume Checkout
                                </button>
                                <button className="control-btn btn-secondary">
                                    <Printer size={18} /> Print Voucher
                                </button>
                            </div>
                            <div className="btn-grid">
                                <button className="control-btn btn-error">
                                    <RotateCcw size={18} /> Process Refund
                                </button>
                                <button className="control-btn btn-error">
                                    <XCircle size={18} /> Void Order
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--pos-text-muted)', padding: '40px', textAlign: 'center' }}>
                        <ShoppingBag size={80} style={{ opacity: 0.1, marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: 850, color: 'var(--pos-text-secondary)' }}>Insight Engine</h3>
                        <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>Select a transaction from the list to analyze its contents and lifecycle.</p>
                    </div>
                )}
            </aside>
        </div>
    );
};

export default POSOrdersScreen;
