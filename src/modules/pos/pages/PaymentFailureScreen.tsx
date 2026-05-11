'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, CreditCard, RotateCcw, AlertCircle, DollarSign } from 'lucide-react';
import '../styles/pos-rush.css';

const mockPaymentFailure = {
    orderId: 'ORD-1234',
    orderNumber: '#1234',
    amount: 79.30,
    paymentMethod: 'CARD',
    cardLast4: '4242',
    errorCode: 'INSUFFICIENT_FUNDS',
    errorMessage: 'The card has insufficient funds to complete this transaction',
    timestamp: new Date().toLocaleString()
};

const errorReasons = {
    'INSUFFICIENT_FUNDS': 'Insufficient funds on card',
    'CARD_DECLINED': 'Card was declined by issuer',
    'EXPIRED_CARD': 'Card has expired',
    'INVALID_CVV': 'Invalid CVV code',
    'NETWORK_ERROR': 'Network connection error',
    'TIMEOUT': 'Transaction timed out'
};

export const PaymentFailureScreen: React.FC = () => {
    const router = useRouter();
    const [retrying, setRetrying] = useState(false);

    const handleRetry = () => {
        setRetrying(true);
        setTimeout(() => {
            setRetrying(false);
            router.push('/pos/payment');
        }, 1500);
    };

    const handleSwitchMethod = () => {
        router.push('/pos/payment');
    };

    const handleCancel = () => {
        if (confirm('Cancel this order? All items will be lost.')) {
            router.push('/pos/dashboard');
        }
    };

    return (
        <div className="pos-screen">
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)'
            }}>
                <div style={{ width: '100%', maxWidth: '700px' }}>
                    {/* Error Icon */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{
                            width: '140px',
                            height: '140px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '4px solid #EF4444',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 32px',
                            animation: 'shake 0.5s'
                        }}>
                            <XCircle size={80} color="#FCA5A5" strokeWidth={2.5} />
                        </div>

                        <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
                            Payment Failed
                        </h1>
                        <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                            We couldn't process your payment
                        </p>
                    </div>

                    {/* Error Details */}
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '32px',
                        marginBottom: '32px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        {/* Order Info */}
                        <div style={{
                            paddingBottom: '24px',
                            borderBottom: '2px solid #E5E7EB',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Order Number
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: 800, color: '#1E3A8A', lineHeight: 1, marginBottom: '16px' }}>
                                {mockPaymentFailure.orderNumber}
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1E293B' }}>
                                ${mockPaymentFailure.amount.toFixed(2)}
                            </div>
                        </div>

                        {/* Error Reason */}
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '2px solid #EF4444',
                            borderRadius: '16px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <AlertCircle size={24} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#EF4444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {errorReasons[mockPaymentFailure.errorCode as keyof typeof errorReasons]}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#DC2626', fontWeight: 600, lineHeight: 1.5 }}>
                                        {mockPaymentFailure.errorMessage}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{
                            background: '#F8FAFC',
                            borderRadius: '16px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Payment Method Attempted
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: '#EEF2FF',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CreditCard size={20} color="#1E3A8A" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>
                                        {mockPaymentFailure.paymentMethod} •••• {mockPaymentFailure.cardLast4}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                                        {mockPaymentFailure.timestamp}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Code */}
                        <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textAlign: 'center' }}>
                            Error Code: {mockPaymentFailure.errorCode}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="pos-btn pos-btn-primary"
                            style={{
                                width: '100%',
                                background: 'white',
                                color: '#1E3A8A',
                                fontSize: '18px',
                                padding: '20px'
                            }}
                        >
                            <RotateCcw size={24} />
                            {retrying ? 'Retrying...' : 'Retry Payment'}
                        </button>

                        <button
                            onClick={handleSwitchMethod}
                            className="pos-btn pos-btn-secondary"
                            style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                fontSize: '16px'
                            }}
                        >
                            <DollarSign size={20} />
                            Try Different Payment Method
                        </button>

                        <button
                            onClick={handleCancel}
                            className="pos-btn pos-btn-secondary"
                            style={{
                                width: '100%',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '2px solid #EF4444',
                                color: '#FCA5A5',
                                fontSize: '16px'
                            }}
                        >
                            <XCircle size={20} />
                            Cancel Order
                        </button>
                    </div>

                    {/* Help Text */}
                    <div style={{
                        marginTop: '32px',
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        textAlign: 'center',
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 600,
                        lineHeight: 1.6
                    }}>
                        <strong style={{ color: 'white' }}>Need help?</strong><br />
                        Contact your bank or try a different payment method.<br />
                        Your order has been saved and can be completed later.
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `}</style>
        </div>
    );
};
