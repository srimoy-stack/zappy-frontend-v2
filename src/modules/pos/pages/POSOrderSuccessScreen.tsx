'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Printer, Mail, MessageSquare, CheckCircle2, MapPin, Utensils, ShoppingBag, ArrowRight } from 'lucide-react';
import { usePOS } from '@/modules/pos/context/POSContext';
import '../styles/pos-rush.css';

interface OrderData {
    order_id: string;
    order_number: string;
    fulfillment_type: 'Dine-In' | 'Pickup' | 'Delivery';
    table_id?: string;
    delivery_address?: string;
    eta: string;
    customer: {
        name: string;
        phone?: string;
        email?: string;
    };
    change_due: number;
}

export const POSOrderSuccessScreen: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { session, clearCart, setCustomer, setTable, setChannel } = usePOS();

    const [printing, setPrinting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Order recovery
    const orderId = (params?.orderId as string) || searchParams.get('orderId') || '10452';

    const [order] = useState<OrderData>(() => {
        const fulfillment = (session?.channel as any) || searchParams.get('fulfillment') || 'Pickup';

        // Calculate ETA
        const now = new Date();
        let mins = 18;
        if (fulfillment === 'Dine-In') mins = 15;
        if (fulfillment === 'Delivery') mins = 35;
        const etaTime = new Date(now.getTime() + mins * 60000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toUpperCase();

        return {
            order_id: orderId,
            order_number: orderId,
            fulfillment_type: fulfillment,
            table_id: session?.activeTable?.name || 'GENERIC',
            delivery_address: session?.deliveryAddress?.text || '',
            eta: etaTime,
            customer: {
                name: session?.activeCustomer?.name || 'Guest Customer',
                phone: session?.activeCustomer?.phone,
                email: session?.activeCustomer?.email,
            },
            change_due: parseFloat(searchParams?.get('change') || '0')
        };
    });

    // Toast handler
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    // Security & Navigation lock
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
            setToast({ message: 'Navigation locked during order completion', type: 'error' });
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handlePrint = () => {
        setPrinting(true);
        const timestamp = new Date().toISOString();
        console.log(`[PRINT_LOG] Order #${order.order_number} | Action: REPRINT | Cashier: ${session?.user?.name || 'SYSTEM'} | Time: ${timestamp}`);

        setTimeout(() => {
            setPrinting(false);
            setToast({ message: 'Receipt printed successfully', type: 'success' });
        }, 1200);
    };

    const handleSendSMS = () => {
        if (!order.customer.phone) return;
        setToast({ message: `SMS sent to ${order.customer.phone}`, type: 'success' });
    };

    const handleSendEmail = () => {
        if (!order.customer.email) return;
        setToast({ message: `Receipt emailed to ${order.customer.email}`, type: 'success' });
    };

    const handleStartNewOrder = () => {
        clearCart();
        setCustomer(null);
        setTable(null);
        setChannel('Pickup');
        router.replace('/pos/dashboard');
    };

    const getFulfillmentIcon = () => {
        switch (order.fulfillment_type) {
            case 'Dine-In': return <Utensils size={24} />;
            case 'Delivery': return <MapPin size={24} />;
            case 'Pickup': return <ShoppingBag size={24} />;
            default: return <ShoppingBag size={24} />;
        }
    };

    return (
        <div className="pos-screen" style={{
            background: 'var(--pos-bg-main)', // Unified light theme background
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            minHeight: '100vh',
            color: 'var(--pos-text-primary)'
        }}>
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: toast.type === 'success' ? 'var(--pos-state-success)' : 'var(--pos-state-error)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <CheckCircle2 size={18} />
                    {toast.message}
                </div>
            )}

            <div style={{
                width: '100%',
                maxWidth: '720px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                animation: 'posFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* 1. STATUS RADIANCE */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--pos-state-success)',
                        fontWeight: 900,
                        fontSize: '16px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '16px'
                    }}>
                        <CheckCircle2 size={20} />
                        Order Confirmed
                    </div>

                    <div style={{
                        background: 'var(--pos-bg-surface)',
                        padding: '48px 24px',
                        borderRadius: '32px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                        border: '1px solid var(--pos-border-subtle)',
                        marginBottom: '8px'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--pos-text-muted)',
                            textTransform: 'uppercase',
                            marginBottom: '4px'
                        }}>
                            Ticket Number
                        </div>
                        <div style={{
                            fontSize: '72px',
                            fontWeight: 950,
                            color: 'var(--pos-text-primary)',
                            lineHeight: 1,
                            letterSpacing: '-0.02em'
                        }}>
                            #{order.order_number.replace('ORD-', '')}
                        </div>
                    </div>

                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--pos-text-secondary)' }}>
                        {order.fulfillment_type} • <span style={{ color: 'var(--pos-action-primary)' }}>Ready at {order.eta}</span>
                    </div>
                </div>

                {/* 2. CHANGE DUE - HIGH VISIBILITY CRITICAL */}
                {order.change_due > 0 && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '24px 32px',
                        borderRadius: '24px',
                        border: '2px dashed var(--pos-state-success)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-state-success)', textTransform: 'uppercase' }}>Change to Return</div>
                        <div style={{ fontSize: '42px', fontWeight: 950, color: 'var(--pos-state-success)' }}>${order.change_due.toFixed(2)}</div>
                    </div>
                )}

                {/* 3. DETAILS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'var(--pos-bg-surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--pos-border-subtle)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ color: 'var(--pos-action-primary)' }}>{getFulfillmentIcon()}</div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>Destination</div>
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>{order.fulfillment_type === 'Dine-In' ? `Table ${order.table_id}` : (order.delivery_address || 'Takeaway')}</div>
                        </div>
                    </div>
                    <div style={{ background: 'var(--pos-bg-surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--pos-border-subtle)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ color: 'var(--pos-state-warning)' }}><Utensils size={24} /></div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>Customer</div>
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>{order.customer.name}</div>
                        </div>
                    </div>
                </div>

                {/* 4. ACTIONS - UNIFIED CONTRAST */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <button onClick={handlePrint} disabled={printing} className="pos-btn-secondary" style={{
                        height: '80px',
                        background: 'var(--pos-bg-surface)',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 900,
                        fontSize: '13px',
                        color: 'var(--pos-text-primary)' // HIGH VISIBILITY
                    }}>
                        <Printer size={22} color="var(--pos-action-primary)" />
                        {printing ? 'PRINTING...' : 'PRINT RECEIPT'}
                    </button>
                    <button onClick={handleSendSMS} disabled={!order.customer.phone} className="pos-btn-secondary" style={{
                        height: '80px',
                        background: 'var(--pos-bg-surface)',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 900,
                        fontSize: '13px',
                        color: order.customer.phone ? 'var(--pos-text-primary)' : 'var(--pos-text-muted)',
                        opacity: order.customer.phone ? 1 : 0.5
                    }}>
                        <MessageSquare size={22} color={order.customer.phone ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)'} />
                        SEND SMS
                    </button>
                    <button onClick={handleSendEmail} disabled={!order.customer.email} className="pos-btn-secondary" style={{
                        height: '80px',
                        background: 'var(--pos-bg-surface)',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 900,
                        fontSize: '13px',
                        color: order.customer.email ? 'var(--pos-text-primary)' : 'var(--pos-text-muted)',
                        opacity: order.customer.email ? 1 : 0.5
                    }}>
                        <Mail size={22} color={order.customer.email ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)'} />
                        SEND EMAIL
                    </button>
                </div>

                {/* 5. PRIMARY ACTION */}
                <button onClick={handleStartNewOrder} className="pos-btn-primary" style={{
                    height: '88px',
                    background: 'var(--pos-action-primary)',
                    borderRadius: '28px',
                    fontSize: '24px',
                    fontWeight: 950,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 15px 40px rgba(31, 164, 169, 0.25)',
                    marginTop: '12px'
                }}>
                    Start New Order <ArrowRight size={28} style={{ marginLeft: '12px' }} />
                </button>
            </div>
        </div>
    );
};

export default POSOrderSuccessScreen;
