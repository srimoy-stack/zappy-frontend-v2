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

export const POSConfirmationScreen: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { session, clearCart, setCustomer, setTable, setChannel } = usePOS();

    const [printing, setPrinting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Order recovery (Priority: Context -> URL -> Mock)
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

    // Auto-print effect & Security
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
        console.log(`[SMS_LOG] Sent to: ${order.customer.phone} | Content: Order #${order.order_number} confirmed. ETA: ${order.eta}.`);
    };

    const handleSendEmail = () => {
        if (!order.customer.email) return;
        setToast({ message: `Receipt emailed to ${order.customer.email}`, type: 'success' });
        console.log(`[EMAIL_LOG] Sent to: ${order.customer.email} | Action: Receipt Copy`);
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
            case 'Dine-In': return <Utensils size={20} />;
            case 'Delivery': return <MapPin size={20} />;
            case 'Pickup': return <ShoppingBag size={20} />;
            default: return <ShoppingBag size={20} />;
        }
    };

    return (
        <div className="pos-screen" style={{
            background: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            minHeight: '100vh',
            overflow: 'hidden',
            color: 'white'
        }}>
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: toast.type === 'success' ? '#10B981' : '#EF4444',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <CheckCircle2 size={18} />
                    {toast.message}
                </div>
            )}

            <div style={{
                width: '100%',
                maxWidth: '680px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                {/* 1. HEADER SECTION */}
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '18px',
                        fontWeight: 900,
                        color: '#10B981',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '12px'
                    }}>
                        ORDER CONFIRMED
                    </h1>

                    <div style={{
                        padding: '48px 24px',
                        background: '#1E293B',
                        borderRadius: '32px',
                        border: '2px solid rgba(255,255,255,0.05)',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            fontSize: '64px',
                            fontWeight: 950,
                            color: 'white',
                            lineHeight: 1,
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase'
                        }}>
                            ORDER # {order.order_number}
                        </div>
                    </div>
                </div>

                {/* 2. CHANGE DUE - CRITICAL VISIBILITY */}
                {order.change_due > 0 && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        padding: '32px',
                        borderRadius: '28px',
                        border: '2px solid #10B981',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#10B981', textTransform: 'uppercase' }}>Change Due</div>
                        <div style={{ fontSize: '48px', fontWeight: 950, color: '#10B981' }}>${order.change_due.toFixed(2)}</div>
                    </div>
                )}

                {/* 3. ORDER DETAILS */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                }}>
                    <div style={{ background: '#1E293B', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px' }}>Fulfillment</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ color: '#3B82F6' }}>{getFulfillmentIcon()}</div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 900 }}>{order.fulfillment_type}</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>
                                    {order.fulfillment_type === 'Dine-In' ? order.table_id : (order.delivery_address || 'Takeaway')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#1E293B', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px' }}>Target Time</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ color: '#F59E0B' }}><Utensils size={20} /></div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#F59E0B' }}>{order.eta}</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>Approx 15-20 mins</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. ACTIONS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <button onClick={handlePrint} disabled={printing} className="pos-btn-secondary" style={{ height: '80px', background: '#1E293B', borderRadius: '20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 900, fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Printer size={24} /> {printing ? 'PRINTING...' : 'RECEIPT'}
                    </button>
                    <button onClick={handleSendSMS} disabled={!order.customer.phone} className="pos-btn-secondary" style={{ height: '80px', background: '#1E293B', borderRadius: '20px', color: order.customer.phone ? 'white' : '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 900, fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)', opacity: order.customer.phone ? 1 : 0.5 }}>
                        <MessageSquare size={24} /> SMS
                    </button>
                    <button onClick={handleSendEmail} disabled={!order.customer.email} className="pos-btn-secondary" style={{ height: '80px', background: '#1E293B', borderRadius: '20px', color: order.customer.email ? 'white' : '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 900, fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)', opacity: order.customer.email ? 1 : 0.5 }}>
                        <Mail size={24} /> EMAIL
                    </button>
                </div>

                {/* 5. START NEW ORDER */}
                <button onClick={handleStartNewOrder} className="pos-btn-primary" style={{ height: '90px', background: '#3B82F6', borderRadius: '28px', fontSize: '26px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 15px 30px rgba(59, 130, 246, 0.4)', marginTop: '20px', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    START NEW ORDER <ArrowRight size={28} />
                </button>
            </div>
        </div>
    );
};

export default POSConfirmationScreen;
