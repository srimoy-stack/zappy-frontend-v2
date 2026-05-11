'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import '../styles/pos-rush.css';

const mockOrder = {
    id: 'ORD-1234',
    orderNumber: '#1234',
    total: 79.30,
    paymentMethod: 'CARD',
    cardLast4: '4242',
    items: [
        { id: 'I1', name: 'Large Pepperoni Pizza', quantity: 2, price: 47.98, refundable: true },
        { id: 'I2', name: 'Chicken Wings', quantity: 1, price: 12.99, refundable: true },
        { id: 'I3', name: 'Coca Cola', quantity: 2, price: 5.00, refundable: true }
    ]
};

export const RefundPage: React.FC = () => {
    const router = useRouter();
    const [refundType, setRefundType] = useState<'FULL' | 'PARTIAL'>('FULL');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [refundReason, setRefundReason] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const calculateRefundAmount = useCallback(() => {
        if (refundType === 'FULL') {
            return mockOrder.total;
        }
        if (customAmount) {
            const amount = parseFloat(customAmount);
            return isNaN(amount) ? 0 : Math.min(amount, mockOrder.total);
        }
        return mockOrder.items
            .filter(item => selectedItems.has(item.id))
            .reduce((sum, item) => sum + item.price, 0);
    }, [refundType, customAmount, selectedItems]);

    const handleItemToggle = useCallback((itemId: string) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    }, []);

    const handleProcessRefund = useCallback(async () => {
        const reason = refundReason.trim();
        if (!reason) {
            alert('Please provide a refund reason');
            return;
        }

        setProcessing(true);
        // Simulate API call
        setTimeout(() => {
            setProcessing(false);
            setSuccess(true);
            setTimeout(() => {
                router.push('/pos/dashboard');
            }, 2000);
        }, 2000);
    }, [refundReason, router]);

    const refundAmount = useMemo(() => calculateRefundAmount(), [calculateRefundAmount]);
    const canProcess = refundAmount > 0 && refundReason.trim().length > 0;

    if (success) {
        return <RefundSuccess amount={refundAmount} />;
    }

    return (
        <div className="pos-screen" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--pos-bg-main)' }}>
            {/* Header */}
            <div className="pos-header" style={{ height: '72px', background: 'var(--pos-bg-surface)', borderBottom: '1px solid var(--pos-border-subtle)', padding: '0 24px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--pos-action-primary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <RotateCcw size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)', textTransform: 'uppercase' }}>
                            PROCESS REFUND
                        </h1>
                        <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 700 }}>
                            ORDER {mockOrder.orderNumber} • THREAD ID: {mockOrder.id}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => router.back()}
                    className="pos-btn"
                    style={{ background: 'var(--pos-text-primary)', color: 'white', fontWeight: 900, padding: '0 24px', height: '48px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                    CANCEL
                </button>
            </div>

            <div className="pos-split-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* LEFT: Refund Configuration */}
                <div className="pos-left-panel" style={{ width: '60%', borderRight: '1px solid var(--pos-border-subtle)', overflowY: 'auto', background: 'var(--pos-bg-surface)' }}>
                    {/* Warning */}
                    <div style={{ padding: '24px' }}>
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '2px solid var(--pos-state-error)',
                            borderRadius: '20px',
                            padding: '20px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--pos-state-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertCircle size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-state-error)', marginBottom: '4px', textTransform: 'uppercase' }}>
                                    Refund Warning
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                                    This action cannot be undone. Please verify all operational parameters before final commitment.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Refund Type */}
                    <div style={{ padding: '0 24px 24px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            REFUND ARCHITECTURE
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button
                                onClick={() => {
                                    setRefundType('FULL');
                                    setCustomAmount('');
                                    setSelectedItems(new Set());
                                }}
                                style={{
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: refundType === 'FULL' ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                    background: refundType === 'FULL' ? 'var(--pos-bg-main)' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ fontSize: '13px', fontWeight: 900, color: refundType === 'FULL' ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    FULL REFUND
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                    ${mockOrder.total.toFixed(2)}
                                </div>
                            </button>

                            <button
                                onClick={() => setRefundType('PARTIAL')}
                                style={{
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: refundType === 'PARTIAL' ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                    background: refundType === 'PARTIAL' ? 'var(--pos-bg-main)' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ fontSize: '13px', fontWeight: 900, color: refundType === 'PARTIAL' ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    PARTIAL / CUSTOM
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pos-text-muted)' }}>
                                    Select line items or enter custom delta
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Partial Refund Options */}
                    {refundType === 'PARTIAL' && (
                        <div style={{ padding: '0 24px 24px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                LINE ITEM SELECTION
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                {mockOrder.items.map(item => (
                                    <label
                                        key={item.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '16px 20px',
                                            background: selectedItems.has(item.id) ? 'var(--pos-bg-main)' : 'white',
                                            borderRadius: '20px',
                                            border: selectedItems.has(item.id) ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => handleItemToggle(item.id)}
                                            style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: 'var(--pos-action-primary)' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)', marginBottom: '2px' }}>
                                                {item.quantity}x {item.name}
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                                ${item.price.toFixed(2)}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div style={{ background: 'var(--pos-bg-main)', padding: '24px', borderRadius: '24px', border: '1px solid var(--pos-border-subtle)' }}>
                                <h4 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    MANUAL OVERRIDE (AMOUNT)
                                </h4>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={24} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        max={mockOrder.total}
                                        value={customAmount}
                                        onChange={(e) => {
                                            setCustomAmount(e.target.value);
                                            setSelectedItems(new Set());
                                        }}
                                        placeholder="0.00"
                                        className="pos-input"
                                        style={{ paddingLeft: '60px', height: '64px', fontSize: '24px', fontWeight: 900, background: 'white' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Refund Reason */}
                    <div style={{ padding: '0 24px 24px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            REFUND JUSTIFICATION <span style={{ color: 'var(--pos-state-error)' }}>*</span>
                        </h3>
                        <textarea
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Provide systemic reason for refund sequence..."
                            className="pos-input pos-scroll"
                            style={{ minHeight: '140px', resize: 'none', padding: '20px', fontSize: '16px', fontWeight: 600, background: 'white' }}
                        />
                        <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 700, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={14} />
                            LOGGED TO CLOUD AUDIT TRAIL
                        </div>
                    </div>
                </div>

                {/* RIGHT: Refund Summary */}
                <div className="pos-right-panel" style={{ flex: 1, background: 'var(--pos-bg-main)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--pos-border-subtle)', background: 'white' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                            FINANCIAL SUMMARY
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            PRE-COMMITMENT REVIEW
                        </p>
                    </div>

                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                        {/* Order Info */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                SOURCE DATA
                            </h3>
                            <div className="pos-card" style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid var(--pos-border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>ORDER #</span>
                                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{mockOrder.orderNumber}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>ORIGINAL TOTAL</span>
                                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>${mockOrder.total.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px dotted var(--pos-border-subtle)' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>GATEWAY</span>
                                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                        {mockOrder.paymentMethod} •••• {mockOrder.cardLast4}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Refund Amount */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                background: 'var(--pos-text-primary)',
                                borderRadius: '24px',
                                padding: '32px 24px',
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    TOTAL REFUND DELTA
                                </div>
                                <div style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>
                                    ${refundAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Selected Items preview */}
                        {refundType === 'PARTIAL' && selectedItems.size > 0 && (
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    AFFECTED LINE ITEMS
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {mockOrder.items
                                        .filter(item => selectedItems.has(item.id))
                                        .map(item => (
                                            <div key={item.id} style={{ padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px solid var(--pos-border-subtle)', fontSize: '14px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>
                                                {item.quantity}x {item.name}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Process Button */}
                    <div style={{ padding: '24px', borderTop: '1px solid var(--pos-border-subtle)', background: 'white' }}>
                        <button
                            onClick={handleProcessRefund}
                            disabled={!canProcess || processing}
                            className="pos-btn"
                            style={{
                                width: '100%',
                                height: '72px',
                                background: canProcess ? 'var(--pos-state-error)' : 'var(--pos-bg-main)',
                                color: canProcess ? 'white' : 'var(--pos-text-muted)',
                                cursor: canProcess ? 'pointer' : 'not-allowed',
                                fontSize: '18px',
                                fontWeight: 900,
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                border: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <RotateCcw size={24} />
                            {processing ? 'EXECUTING SYSTEM REVERSAL...' : `AUTHORIZE REFUND - $${refundAmount.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RefundSuccess: React.FC<{ amount: number }> = ({ amount }) => (
    <div className="pos-screen" style={{ background: 'var(--pos-bg-main)' }}>
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', animation: 'posFadeInUp 0.5s ease-out' }}>
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
                    ${amount.toFixed(2)} has been refunded to the customer
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
                    Redirecting to dashboard...
                </div>
            </div>
        </div>
    </div>
);
