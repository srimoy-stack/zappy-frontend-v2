'use client';

import React, { useState } from 'react';
import { X, Percent, DollarSign, Check, Lock, AlertCircle } from 'lucide-react';
import '../styles/pos-rush.css';

interface POSDiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyDiscount: (type: 'percentage' | 'amount', value: number, couponCode?: string) => void;
    subtotal: number;
}

const mockCoupons = [
    { code: 'SAVE10', description: '10% off orders above $50', type: 'percentage', value: 10, minOrder: 50 },
    { code: 'FREESHIP', description: 'Free delivery', type: 'amount', value: 5.99, minOrder: 40 },
    { code: 'COMBO20', description: '20% off combos', type: 'percentage', value: 20, minOrder: 0, disabled: true },
];

const MANAGER_PIN = '1234';
const DISCOUNT_LIMIT_PERCENT = 15; // >15% requires manager PIN

export const POSDiscountModal: React.FC<POSDiscountModalProps> = ({
    isOpen,
    onClose,
    onApplyDiscount,
    subtotal
}) => {
    const [mode, setMode] = useState<'COUPON' | 'MANUAL'>('COUPON');
    const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
    const [discountValue, setDiscountValue] = useState<string>('');
    const [couponCode, setCouponCode] = useState('');
    const [managerPin, setManagerPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleNumpadClick = (value: string) => {
        setError(null);
        if (showPinInput) {
            if (value === 'C') setManagerPin('');
            else if (value !== '.') setManagerPin(prev => (prev + value).slice(0, 4));
            return;
        }

        if (value === 'C') {
            setDiscountValue('');
        } else if (value === '.') {
            if (!discountValue.includes('.')) {
                setDiscountValue(prev => prev + value);
            }
        } else {
            setDiscountValue(prev => prev + value);
        }
    };

    const handleApplyManual = () => {
        setError(null);
        const val = parseFloat(discountValue);

        if (isNaN(val) || val <= 0) {
            setError('Please enter a valid value');
            return;
        }

        if (discountType === 'percentage' && val > 100) {
            setError('Percentage cannot exceed 100%');
            return;
        }

        if (discountType === 'amount' && val > subtotal) {
            setError('Amount cannot exceed subtotal');
            return;
        }

        // Check if authorization is needed
        const needsAuth = discountType === 'percentage' ? val > DISCOUNT_LIMIT_PERCENT : val > (subtotal * 0.15);

        if (needsAuth && !showPinInput) {
            setShowPinInput(true);
            return;
        }

        if (showPinInput) {
            if (managerPin === MANAGER_PIN) {
                onApplyDiscount(discountType, val);
                resetAndClose();
            } else {
                setError('Invalid Manager PIN');
                setManagerPin('');
            }
            return;
        }

        // No auth needed
        onApplyDiscount(discountType, val);
        resetAndClose();
    };

    const handleApplyCoupon = (coupon: any) => {
        if (coupon.disabled) return;
        if (subtotal < coupon.minOrder) {
            setError(`Order must be at least $${coupon.minOrder}`);
            return;
        }
        onApplyDiscount(coupon.type as any, coupon.value, coupon.code);
        resetAndClose();
    };

    const handleCustomCouponId = () => {
        setError(null);
        const coupon = mockCoupons.find(c => c.code === couponCode.toUpperCase());
        if (coupon) {
            handleApplyCoupon(coupon);
        } else {
            setError('Invalid or expired coupon code');
        }
    };

    const resetAndClose = () => {
        setDiscountValue('');
        setCouponCode('');
        setManagerPin('');
        setShowPinInput(false);
        setError(null);
        onClose();
    };

    return (
        <div className="pos-modal-overlay">
            <div className="pos-modal" style={{ width: '600px' }}>
                <div className="pos-modal-header" style={{ background: 'var(--pos-bg-surface)', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                    <div className="pos-title-md" style={{ fontWeight: 900 }}>Apply Discount</div>
                    <button
                        className="pos-btn-secondary"
                        onClick={resetAndClose}
                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="pos-modal-body" style={{ padding: 0 }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--pos-border-subtle)', background: 'var(--pos-bg-surface)' }}>
                        <button
                            onClick={() => { setMode('COUPON'); setShowPinInput(false); setError(null); }}
                            style={{
                                flex: 1,
                                padding: '20px',
                                background: mode === 'COUPON' ? 'rgba(31, 164, 169, 0.1)' : 'transparent',
                                color: mode === 'COUPON' ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)',
                                border: 'none',
                                fontWeight: 900,
                                cursor: 'pointer',
                                fontSize: '12px',
                                letterSpacing: '0.1em',
                                borderBottom: mode === 'COUPON' ? '2px solid var(--pos-action-primary)' : '2px solid transparent'
                            }}
                        >
                            COUPONS
                        </button>
                        <button
                            onClick={() => { setMode('MANUAL'); setShowPinInput(false); setError(null); }}
                            style={{
                                flex: 1,
                                padding: '20px',
                                background: mode === 'MANUAL' ? 'rgba(31, 164, 169, 0.1)' : 'transparent',
                                color: mode === 'MANUAL' ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)',
                                border: 'none',
                                fontWeight: 900,
                                cursor: 'pointer',
                                fontSize: '12px',
                                letterSpacing: '0.1em',
                                borderBottom: mode === 'MANUAL' ? '2px solid var(--pos-action-primary)' : '2px solid transparent'
                            }}
                        >
                            MANUAL
                        </button>
                    </div>

                    <div style={{ padding: '28px' }}>
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#EF4444',
                                fontSize: '13px',
                                fontWeight: 700,
                                marginBottom: '20px'
                            }}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {mode === 'COUPON' ? (
                            <div className="space-y-4">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {mockCoupons.map(coupon => (
                                        <div
                                            key={coupon.code}
                                            onClick={() => handleApplyCoupon(coupon)}
                                            style={{
                                                flex: '1 1 calc(50% - 6px)',
                                                padding: '20px',
                                                borderRadius: '20px',
                                                background: 'var(--pos-bg-card)',
                                                border: '1px solid var(--pos-border-subtle)',
                                                cursor: coupon.disabled ? 'not-allowed' : 'pointer',
                                                opacity: coupon.disabled ? 0.5 : 1,
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            }}
                                            className={!coupon.disabled ? "hover-scale" : ""}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ padding: '4px 10px', background: 'rgba(31, 164, 169, 0.1)', borderRadius: '8px', fontSize: '11px', fontWeight: 900, color: 'var(--pos-action-primary)', letterSpacing: '0.05em' }}>
                                                    {coupon.code}
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-action-primary)' }}>
                                                    {coupon.type === 'amount' ? '$' : ''}{coupon.value}{coupon.type === 'percentage' ? '%' : ''}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>{coupon.description}</div>
                                            {subtotal < coupon.minOrder && (
                                                <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 800 }}>Min. Order: ${coupon.minOrder}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '28px', padding: '24px', background: 'var(--pos-bg-surface)', borderRadius: '24px', border: '1px solid var(--pos-border-subtle)' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--pos-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apply Custom Coupon</label>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        <input
                                            type="text"
                                            className="pos-input"
                                            placeholder="ENTER CODE"
                                            style={{ flex: 1, letterSpacing: '0.1em', textAlign: 'center' }}
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        />
                                        <button
                                            onClick={handleCustomCouponId}
                                            className="pos-btn-primary"
                                            style={{ padding: '0 24px', borderRadius: '16px' }}
                                        >
                                            APPLY
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // MANUAL MODE
                            <div>
                                {showPinInput ? (
                                    <div style={{ textAlign: 'center', maxWidth: '340px', margin: '0 auto' }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '20px',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 20px',
                                            color: '#F59E0B'
                                        }}>
                                            <Lock size={32} />
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '8px' }}>Manager Approval</div>
                                        <p style={{ color: 'var(--pos-text-muted)', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>This discount requires authorization to proceed.</p>

                                        <div style={{
                                            fontSize: '40px',
                                            fontWeight: 900,
                                            letterSpacing: '12px',
                                            marginBottom: '28px',
                                            height: '48px',
                                            color: 'var(--pos-text-primary)'
                                        }}>
                                            {managerPin ? managerPin.replace(/./g, '•') : '••••'}
                                        </div>

                                        <div className="pos-grid-3" style={{ gap: '12px' }}>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'C'].map((val, idx) => (
                                                val === '' ? <div key={idx} /> :
                                                    <button
                                                        key={idx}
                                                        className="pos-btn-secondary"
                                                        style={{ height: '60px', fontSize: '20px', fontWeight: 900, borderRadius: '16px' }}
                                                        onClick={() => handleNumpadClick(val.toString())}
                                                    >
                                                        {val}
                                                    </button>
                                            ))}
                                        </div>
                                        <div className="pos-grid-2" style={{ marginTop: '24px', gap: '12px' }}>
                                            <button className="pos-btn-secondary" style={{ borderRadius: '16px', height: '56px' }} onClick={() => setShowPinInput(false)}>CANCEL</button>
                                            <button className="pos-btn-primary" style={{ borderRadius: '16px', height: '56px' }} onClick={handleApplyManual} disabled={managerPin.length < 4}>AUTHORIZE</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="pos-grid-2" style={{ marginBottom: '24px', gap: '12px' }}>
                                            <button
                                                className={`pos-btn ${discountType === 'percentage' ? 'pos-btn-primary' : 'pos-btn-secondary'}`}
                                                style={{ height: '60px', borderRadius: '16px', fontWeight: 900 }}
                                                onClick={() => setDiscountType('percentage')}
                                            >
                                                <Percent size={20} style={{ marginRight: '8px' }} /> Percentage
                                            </button>
                                            <button
                                                className={`pos-btn ${discountType === 'amount' ? 'pos-btn-primary' : 'pos-btn-secondary'}`}
                                                style={{ height: '60px', borderRadius: '16px', fontWeight: 900 }}
                                                onClick={() => setDiscountType('amount')}
                                            >
                                                <DollarSign size={20} style={{ marginRight: '8px' }} /> Amount
                                            </button>
                                        </div>

                                        <div style={{
                                            marginBottom: '28px',
                                            textAlign: 'center',
                                            padding: '24px',
                                            background: 'var(--pos-bg-surface)',
                                            borderRadius: '24px',
                                            border: '1px solid var(--pos-border-subtle)'
                                        }}>
                                            <div style={{ fontSize: '11px', color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }}>
                                                Discount Value
                                            </div>
                                            <div style={{ fontSize: '56px', fontWeight: 900, color: 'var(--pos-text-primary)', letterSpacing: '-0.02em' }}>
                                                {discountType === 'amount' ? '$' : ''}{discountValue || '0'}{discountType === 'percentage' ? '%' : ''}
                                            </div>
                                        </div>

                                        <div className="pos-grid-3" style={{ maxWidth: '400px', margin: '0 auto', marginBottom: '24px', gap: '12px' }}>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map((val, idx) => (
                                                <button
                                                    key={idx}
                                                    className="pos-btn-secondary"
                                                    style={{ height: '72px', fontSize: '24px', fontWeight: 900, borderRadius: '16px' }}
                                                    onClick={() => handleNumpadClick(val.toString())}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            className="pos-btn-primary"
                                            style={{ width: '100%', height: '72px', borderRadius: '20px', fontSize: '18px', fontWeight: 900 }}
                                            onClick={handleApplyManual}
                                            disabled={!discountValue || parseFloat(discountValue) <= 0}
                                        >
                                            <Check size={22} style={{ marginRight: '10px' }} strokeWidth={3} />
                                            APPLY DISCOUNT
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSDiscountModal;
