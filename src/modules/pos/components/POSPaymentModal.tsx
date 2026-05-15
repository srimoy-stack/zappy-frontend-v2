'use client';

import React from 'react';
import { X, Banknote, CreditCard, Terminal, Wallet, Gift, Columns } from 'lucide-react';
import '../styles/pos-rush.css';

interface POSPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    breakdown?: {
        subtotal: number;
        tax: number;
        discounts: number;
        deliveryFee: number;
        tip: number;
    };
    onSelectMethod: (method: string) => void;
    disabledMethods?: string[];
}

const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: '#10B981', description: 'Take physical currency' },
    { id: 'card', label: 'Card', icon: CreditCard, color: '#3B82F6', description: 'Swipe or Dip card' },
    { id: 'terminal', label: 'Terminal', icon: Terminal, color: '#8B5CF6', description: 'External device' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, color: '#F59E0B', description: 'Apple Pay, G-Pay, etc.' },
    { id: 'gift_card', label: 'Gift Card', icon: Gift, color: '#EC4899', description: 'Redeem store credit' },
    { id: 'split', label: 'Split Payment', icon: Columns, color: '#6366F1', description: 'Multiple methods' },
];

export const POSPaymentModal: React.FC<POSPaymentModalProps> = ({
    isOpen,
    onClose,
    total,
    breakdown,
    onSelectMethod,
    disabledMethods = []
}) => {
    if (!isOpen) return null;

    return (
        <div className="pos-modal-overlay">
            <div className="pos-modal" style={{ width: '900px', maxWidth: '95vw', display: 'flex', overflow: 'hidden' }}>
                {/* Left Panel: Breakdown */}
                {breakdown && (
                    <div style={{
                        width: '320px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRight: '1px solid var(--pos-border-subtle)',
                        padding: '40px 32px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pos-text-primary)' }}>Payment Summary</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                                <span>Subtotal</span>
                                <span style={{ color: 'var(--pos-text-primary)', fontWeight: 800 }}>${breakdown.subtotal.toFixed(2)}</span>
                            </div>
                            {breakdown.discounts > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#EF4444', fontWeight: 600 }}>
                                    <span>Discounts</span>
                                    <span style={{ fontWeight: 800 }}>-${breakdown.discounts.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                                <span>Tax (8%)</span>
                                <span style={{ color: 'var(--pos-text-primary)', fontWeight: 800 }}>${breakdown.tax.toFixed(2)}</span>
                            </div>
                            {breakdown.deliveryFee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                                    <span>Delivery Fee</span>
                                    <span style={{ color: 'var(--pos-text-primary)', fontWeight: 800 }}>${breakdown.deliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                            {breakdown.tip > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--pos-action-primary)', fontWeight: 600 }}>
                                    <span>Tip</span>
                                    <span style={{ fontWeight: 800 }}>${breakdown.tip.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--pos-border-subtle)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Total Amount Due</div>
                            <div style={{ fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>${total.toFixed(2)}</div>
                        </div>
                    </div>
                )}

                {/* Right Panel: Methods */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="pos-modal-header" style={{ padding: '32px' }}>
                        <div>
                            <div className="pos-title-md" style={{ fontSize: '24px', fontWeight: 900 }}>Select Payment Method</div>
                            <p style={{ fontSize: '14px', color: 'var(--pos-text-muted)', margin: '4px 0 0', fontWeight: 600 }}>Choose how the guest will pay for this order.</p>
                        </div>
                        <button
                            className="pos-btn-secondary"
                            onClick={onClose}
                            style={{ width: '48px', height: '48px', padding: 0, borderRadius: '16px' }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="pos-modal-body" style={{ padding: '0 32px 32px', flex: 1, overflowY: 'auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px'
                        }}>
                            {paymentMethods.map((method) => {
                                const isDisabled = disabledMethods.includes(method.id);
                                const Icon = method.icon;

                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => !isDisabled && onSelectMethod(method.id)}
                                        disabled={isDisabled}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '24px',
                                            background: isDisabled ? 'rgba(255,255,255,0.02)' : 'var(--pos-bg-card)',
                                            border: isDisabled ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--pos-border-subtle)',
                                            borderRadius: '20px',
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            gap: '20px',
                                            opacity: isDisabled ? 0.4 : 1,
                                            textAlign: 'left'
                                        }}
                                        className={!isDisabled ? "hover-scale" : ""}
                                    >
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '16px',
                                            background: isDisabled ? 'rgba(255,255,255,0.05)' : `${method.color}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isDisabled ? 'var(--pos-text-muted)' : method.color,
                                        }}>
                                            <Icon size={28} strokeWidth={2.5} />
                                        </div>

                                        <div>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: 800,
                                                color: isDisabled ? 'var(--pos-text-muted)' : 'var(--pos-text-primary)',
                                            }}>
                                                {method.label}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: 'var(--pos-text-muted)',
                                                fontWeight: 600,
                                            }}>
                                                {method.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSPaymentModal;
