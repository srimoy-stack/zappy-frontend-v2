'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import '../styles/pos-rush.css';

const CANCELLATION_REASONS = [
    { id: 'customer_changed_mind', label: 'Customer Changed Mind' },
    { id: 'item_unavailable', label: 'Item Unavailable' },
    { id: 'payment_failed', label: 'Payment Failed' },
    { id: 'wrong_order', label: 'Wrong Order Entry' },
    { id: 'fraud_suspected', label: 'Fraud Suspected' },
    { id: 'duplicate_order', label: 'Duplicate Order' }
];

export const CancelOrderPage: React.FC = () => {
    const router = useRouter();
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState('');
    const [managerPin, setManagerPin] = useState('');
    const [needsApproval, setNeedsApproval] = useState(false);

    // Mock high value check
    const orderTotal = 150.00; // Mock total
    const highValueThreshold = 100.00;

    const handleSelectReason = (reasonId: string) => {
        setSelectedReason(reasonId);
        if (orderTotal > highValueThreshold || reasonId === 'fraud_suspected') {
            setNeedsApproval(true);
        } else {
            setNeedsApproval(false);
        }
    };

    const handleConfirmCancel = () => {
        if (needsApproval && managerPin !== '1234') {
            alert('Invalid Manager PIN');
            return;
        }
        // Proceed with cancellation
        router.push('/pos/dashboard');
    };

    return (
        <div className="pos-screen pos-layout">
            <div className="pos-left-zone" style={{ padding: '24px', borderRight: '1px solid var(--pos-border-subtle)' }}>
                <div style={{ marginBottom: '32px' }}>
                    <button
                        onClick={() => router.back()}
                        className="pos-btn-secondary"
                        style={{ width: '48px', height: '48px', padding: 0, marginBottom: '24px' }}
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <h1 className="pos-title-lg" style={{ color: 'var(--pos-state-error)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <XCircle size={32} />
                        Cancel Order #1234
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--pos-text-secondary)', marginTop: '8px' }}>
                        This action cannot be undone. Items will be returned to inventory.
                    </p>
                </div>

                <div className="pos-title-md" style={{ marginBottom: '16px' }}>Select Reason</div>
                <div className="pos-grid-2">
                    {CANCELLATION_REASONS.map(reason => (
                        <button
                            key={reason.id}
                            onClick={() => handleSelectReason(reason.id)}
                            className={`pos-btn ${selectedReason === reason.id ? 'pos-btn-danger' : 'pos-btn-secondary'}`}
                            style={{
                                justifyContent: 'start',
                                padding: '16px',
                                background: selectedReason === reason.id ? 'var(--pos-state-error)' : 'var(--pos-bg-card)',
                                borderColor: selectedReason === reason.id ? 'transparent' : 'var(--pos-border-subtle)'
                            }}
                        >
                            {reason.label}
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '24px' }}>
                    <div className="pos-title-md" style={{ marginBottom: '8px' }}>Additional Notes</div>
                    <textarea
                        className="pos-input"
                        style={{ height: '100px', resize: 'none', paddingTop: '12px' }}
                        placeholder="Optional details..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                    />
                </div>
            </div>

            <div className="pos-right-zone" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="pos-card" style={{ padding: '32px', textAlign: 'center', borderColor: 'var(--pos-state-error)' }}>
                    <div style={{ fontSize: '18px', color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Total Value to Void
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>
                        ${orderTotal.toFixed(2)}
                    </div>
                </div>

                {needsApproval && (
                    <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid var(--pos-state-warning)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--pos-state-warning)' }}>
                            <ShieldAlert size={24} />
                            <span className="pos-title-md">Manager Approval Required</span>
                        </div>
                        <input
                            type="password"
                            className="pos-input"
                            placeholder="Enter Manager PIN"
                            value={managerPin}
                            onChange={(e) => setManagerPin(e.target.value)}
                            style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                        />
                    </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={handleConfirmCancel}
                        disabled={!selectedReason || (needsApproval && managerPin.length < 4)}
                        className="pos-btn-danger"
                        style={{ width: '100%', height: '72px', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                    >
                        <XCircle size={24} />
                        Confirm Cancellation
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="pos-btn-secondary"
                        style={{ width: '100%', marginTop: '16px' }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderPage;
