'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, RefreshCw, CreditCard, ArrowRight } from 'lucide-react';
import '../styles/pos-rush.css';

export const POSPaymentConfirmationScreen: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get parameters from URL
    const status = searchParams.get('status') || 'success'; // 'success' or 'failure'
    const method = searchParams.get('method') || 'Card';
    const amount = searchParams.get('amount') || '0.00';
    const change = searchParams.get('change') || '0.00';
    const reason = searchParams.get('reason') || 'Generic Error';

    const isSuccess = status === 'success';

    const orderId = searchParams.get('orderId');

    // Auto-redirect for success (optional but requested to proceed automatically)
    // Rule: Success proceeds automatically to Order Confirmation
    useEffect(() => {
        if (!isSuccess) return;

        const timer = setTimeout(() => {
            router.push(`/pos/order-success/${orderId || 'last'}`);
        }, 3000);
        return () => clearTimeout(timer);
    }, [isSuccess, router, orderId]);

    return (
        <div className="pos-screen" style={{
            background: 'var(--pos-bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '600px',
                background: 'var(--pos-bg-card)',
                borderRadius: '32px',
                padding: '48px',
                textAlign: 'center',
                border: `2px solid ${isSuccess ? 'var(--pos-state-success)' : 'var(--pos-state-error)'}`,
                boxShadow: isSuccess
                    ? '0 30px 60px -15px rgba(16, 185, 129, 0.2)'
                    : '0 30px 60px -15px rgba(239, 68, 68, 0.2)',
                animation: 'posFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Result Icon */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '40px',
                    background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    color: isSuccess ? '#10B981' : '#EF4444'
                }}>
                    {isSuccess ? <CheckCircle2 size={80} strokeWidth={2.5} /> : <XCircle size={80} strokeWidth={2.5} />}
                </div>

                {/* Status Message */}
                <h1 style={{
                    fontSize: '42px',
                    fontWeight: 900,
                    marginBottom: '8px',
                    color: isSuccess ? '#10B981' : '#EF4444',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                }}>
                    {isSuccess ? 'Payment Approved' : 'Payment Failed'}
                </h1>

                {!isSuccess && (
                    <div style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'var(--pos-text-muted)',
                        marginBottom: '40px'
                    }}>
                        Reason: <span style={{ color: 'var(--pos-text-primary)' }}>{reason}</span>
                    </div>
                )}

                {/* Details Card */}
                <div style={{
                    background: 'var(--pos-bg-surface)',
                    borderRadius: '24px',
                    padding: '32px',
                    marginBottom: '40px',
                    border: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>Method</span>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{method.toUpperCase()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>Amount Received</span>
                        <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-action-primary)' }}>${parseFloat(amount).toFixed(2)}</span>
                    </div>

                    {isSuccess && parseFloat(change) > 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--pos-border-subtle)'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>Change Due</span>
                            <span style={{ fontSize: '32px', fontWeight: 900, color: '#10B981' }}>${parseFloat(change).toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {/* Transitions */}
                {isSuccess ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => router.push(`/pos/order-success/${orderId || 'last'}`)}
                            className="pos-btn-primary"
                            style={{ width: '100%', height: '72px', borderRadius: '18px', fontSize: '18px', fontWeight: 900 }}
                        >
                            CONTINUE <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                        <div style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                            Proceeding to Order Confirmation in 3 seconds...
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <button
                            onClick={() => router.back()}
                            className="pos-btn-secondary"
                            style={{ height: '72px', borderRadius: '18px', fontWeight: 900 }}
                        >
                            <RefreshCw size={20} style={{ marginRight: '8px' }} /> RETRY
                        </button>
                        <button
                            onClick={() => router.push('/pos/payment')}
                            className="pos-btn-secondary"
                            style={{ height: '72px', borderRadius: '18px', fontWeight: 900 }}
                        >
                            <CreditCard size={20} style={{ marginRight: '8px' }} /> CHANGE METHOD
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes posFadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default POSPaymentConfirmationScreen;
