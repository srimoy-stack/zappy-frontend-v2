'use client';

import React from 'react';
import { Tag, Clock, AlertTriangle } from 'lucide-react';
import '../styles/pos-rush.css';

const MOCK_PROMOTIONS = [
    { id: '1', name: 'Lunch Special', type: 'COMBO', value: '20% OFF', validUntil: '3:00 PM', status: 'ACTIVE' },
    { id: '2', name: 'Happy Hour', type: 'DISCOUNT', value: '50% OFF Drinks', validUntil: '6:00 PM', status: 'SCHEDULED' },
    { id: '3', name: 'Student Deal', type: 'FLAT', value: '$5 OFF', validUntil: 'All Day', status: 'ACTIVE' }
];

export const DynamicPricingPanel: React.FC = () => {
    return (
        <div className="pos-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="pos-header" style={{ padding: '16px', background: 'var(--pos-bg-card)', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={20} color="var(--pos-action-primary)" />
                    <span className="pos-title-md">Active Promotions</span>
                </div>
            </div>

            <div style={{ padding: '16px' }}>
                <div className="pos-grid-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {MOCK_PROMOTIONS.map(promo => (
                        <div
                            key={promo.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                background: promo.status === 'ACTIVE' ? 'rgba(31, 164, 169, 0.1)' : 'var(--pos-bg-surface)',
                                border: `1px solid ${promo.status === 'ACTIVE' ? 'var(--pos-action-primary)' : 'var(--pos-border-subtle)'}`,
                                borderRadius: '8px'
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--pos-text-primary)', marginBottom: '4px' }}>
                                    {promo.name}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--pos-action-primary)', fontWeight: 600 }}>
                                    {promo.value}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div className={`pos-badge ${promo.status === 'ACTIVE' ? 'pos-badge-success' : 'pos-badge-warning'}`} style={{ marginBottom: '4px' }}>
                                    {promo.status}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                    <Clock size={12} />
                                    {promo.validUntil}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <AlertTriangle size={20} color="var(--pos-state-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pos-state-warning)', marginBottom: '2px' }}>
                            Surge Pricing Active
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--pos-text-secondary)' }}>
                            Delivery orders +$2.00 due to rain.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicPricingPanel;
