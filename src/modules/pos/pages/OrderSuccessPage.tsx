'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Printer, Mail, MessageSquare, Clock, Package, Utensils } from 'lucide-react';
import { usePOS } from '@/modules/pos/context/POSContext';
import '../styles/pos-rush.css';

export const OrderSuccessPage: React.FC = () => {
    const router = useRouter();
    const { clearCart, setCustomer, setChannel, setTable } = usePOS();
    const [printing, setPrinting] = useState(false);
    const [sendingSMS, setSendingSMS] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // Mock order data (In real app, this would come from context or query param)
    const order = {
        id: '1234',
        number: '#1234',
        fulfillmentType: 'DINE_IN',
        tableNumber: '12',
        items: 3,
        total: 45.50,
        eta: '15-20 min',
        customer: {
            name: 'John Doe',
            phone: '+1 (555) 123-4567',
            email: 'john.doe@email.com'
        },
        payment: 'CARD',
        timestamp: new Date().toLocaleTimeString()
    };

    const handlePrintReceipt = () => {
        setPrinting(true);
        setTimeout(() => {
            setPrinting(false);
            alert('Receipt printed!');
        }, 1500);
    };

    const handleSendSMS = () => {
        setSendingSMS(true);
        setTimeout(() => {
            setSendingSMS(false);
            alert('SMS sent to ' + order.customer.phone);
        }, 1500);
    };

    const handleSendEmail = () => {
        setSendingEmail(true);
        setTimeout(() => {
            setSendingEmail(false);
            alert('Email sent to ' + order.customer.email);
        }, 1500);
    };

    const handleNewOrder = () => {
        clearCart();
        setCustomer(null);
        setTable(null);
        setChannel('Pickup');
        router.push('/pos/dashboard');
    };

    const handleBackToDashboard = () => {
        router.push('/pos/dashboard');
    };

    const getFulfillmentIcon = () => {
        switch (order.fulfillmentType) {
            case 'DINE_IN': return Utensils;
            case 'TAKEAWAY': return Package;
            case 'DELIVERY': return Package;
            default: return Package;
        }
    };

    const FulfillmentIcon = getFulfillmentIcon();

    return (
        <div className="pos-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>

                {/* Success Icon */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    border: '2px solid var(--pos-state-success)'
                }}>
                    <CheckCircle2 size={64} color="var(--pos-state-success)" />
                </div>

                <h1 className="pos-title-lg" style={{ fontSize: '40px', marginBottom: '16px', color: 'var(--pos-text-primary)' }}>
                    Order Placed!
                </h1>

                <p style={{ fontSize: '18px', color: 'var(--pos-text-secondary)', marginBottom: '40px' }}>
                    Order {order.number} has been successfully placed
                </p>

                {/* Details Card */}
                <div className="pos-card" style={{ padding: '32px', marginBottom: '32px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid var(--pos-border-subtle)', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Order Number</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--pos-action-primary)' }}>{order.number}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Amount</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>${order.total.toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="pos-grid-2" style={{ gap: '24px' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: 'var(--pos-text-muted)', marginBottom: '8px' }}>Fulfillment</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 600 }}>
                                <FulfillmentIcon size={20} />
                                {order.fulfillmentType.replace('_', ' ')}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: 'var(--pos-text-muted)', marginBottom: '8px' }}>Estimated Time</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 600 }}>
                                <Clock size={20} color="var(--pos-state-warning)" />
                                {order.eta}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pos-grid-3" style={{ marginBottom: '16px' }}>
                    <button onClick={handlePrintReceipt} className="pos-btn-secondary" style={{ flexDirection: 'column', height: 'auto', padding: '16px' }}>
                        <Printer size={24} style={{ marginBottom: '8px' }} /> {printing ? 'Printing...' : 'Receipt'}
                    </button>
                    <button onClick={handleSendSMS} className="pos-btn-secondary" style={{ flexDirection: 'column', height: 'auto', padding: '16px' }}>
                        <MessageSquare size={24} style={{ marginBottom: '8px' }} /> {sendingSMS ? 'Sending...' : 'SMS'}
                    </button>
                    <button onClick={handleSendEmail} className="pos-btn-secondary" style={{ flexDirection: 'column', height: 'auto', padding: '16px' }}>
                        <Mail size={24} style={{ marginBottom: '8px' }} /> {sendingEmail ? 'Sending...' : 'Email'}
                    </button>
                </div>

                <button onClick={handleNewOrder} className="pos-btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
                    Start New Order
                </button>

                <button onClick={handleBackToDashboard} className="pos-btn-secondary" style={{ width: '100%' }}>
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
};

export default OrderSuccessPage;
