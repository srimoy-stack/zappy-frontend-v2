'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Search } from 'lucide-react';
import '../styles/pos-rush.css';

const MOCK_REFUNDS = [
    { id: 'REF-001', orderId: 'ORD-5506', amount: 45.50, reason: 'Item Unavailable', approver: 'John Store Manager', date: '2024-02-09' },
    { id: 'REF-002', orderId: 'ORD-5507', amount: 22.00, reason: 'Customer Changed Mind', approver: 'Sarah Staff', date: '2024-02-08' },
    { id: 'REF-003', orderId: 'ORD-5508', amount: 15.00, reason: 'Wrong Order', approver: 'John Store Manager', date: '2024-02-07' },
];

export const RefundHistoryPage: React.FC = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRefunds = MOCK_REFUNDS.filter(refund =>
        refund.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pos-screen" style={{ padding: '24px' }}>
            <div className="pos-header" style={{ marginBottom: '24px', background: 'transparent', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        className="pos-btn-secondary"
                        onClick={() => router.back()}
                        style={{ width: '48px', height: '48px', padding: 0 }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="pos-title-lg">Refund History</h1>
                        <div style={{ fontSize: '14px', color: 'var(--pos-text-secondary)' }}>
                            Track all processed refunds
                        </div>
                    </div>
                </div>

                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                    <input
                        className="pos-input"
                        style={{ paddingLeft: '48px' }}
                        placeholder="Search refunds..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="pos-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--pos-bg-surface)', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--pos-text-secondary)', width: '120px' }}>Refund ID</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--pos-text-secondary)', width: '120px' }}>Order ID</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: 'var(--pos-text-secondary)', width: '120px' }}>Amount</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--pos-text-secondary)' }}>Reason</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--pos-text-secondary)', width: '200px' }}>Approver</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: 'var(--pos-text-secondary)', width: '120px' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRefunds.map(refund => (
                            <tr key={refund.id} style={{ borderBottom: '1px solid var(--pos-border-subtle)' }}>
                                <td style={{ padding: '16px', fontWeight: '600', color: 'var(--pos-action-primary)' }}>{refund.id}</td>
                                <td style={{ padding: '16px', color: 'var(--pos-text-primary)' }}>{refund.orderId}</td>
                                <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: 'var(--pos-state-error)' }}>
                                    -${refund.amount.toFixed(2)}
                                </td>
                                <td style={{ padding: '16px', color: 'var(--pos-text-secondary)' }}>{refund.reason}</td>
                                <td style={{ padding: '16px', color: 'var(--pos-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={16} /> {refund.approver}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right', color: 'var(--pos-text-muted)' }}>
                                    {refund.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RefundHistoryPage;
