'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Phone,
    MapPin,
    FileText,
    Star,
    Edit3,
    Save,
    MapPinned,
    History,
    CheckCircle2
} from 'lucide-react';
import { POSCustomer } from '../types/pos';
import '../styles/pos-rush.css';

interface CustomerProfilePanelProps {
    isOpen: boolean;
    onClose: () => void;
    customer: POSCustomer | null;
    onUpdateNotes?: (notes: string) => void;
    onSelectAddress?: (addressId: string) => void;
}

export const CustomerProfilePanel: React.FC<CustomerProfilePanelProps> = ({
    isOpen,
    onClose,
    customer,
    onUpdateNotes,
    onSelectAddress
}) => {
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [editedNotes, setEditedNotes] = useState('');
    const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);

    useEffect(() => {
        if (customer) {
            setEditedNotes(customer.notes);
            const defaultAddr = customer.addresses.find(a => a.isDefault);
            if (defaultAddr) setSelectedAddrId(defaultAddr.id);
        }
    }, [customer]);

    if (!isOpen || !customer) return null;

    const handleSaveNotes = () => {
        if (onUpdateNotes) {
            onUpdateNotes(editedNotes);
        }
        setIsEditingNotes(false);
    };

    const handleAddressClick = (addrId: string) => {
        setSelectedAddrId(addrId);
        if (onSelectAddress) {
            onSelectAddress(addrId);
        }
    };

    return (
        <>
            {/* Overlay Background */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 100,
                    animation: 'fadeIn 0.2s ease-out'
                }}
            />

            {/* Side Panel */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '450px',
                background: 'var(--pos-bg-surface)',
                borderLeft: '1px solid var(--pos-border-subtle)',
                zIndex: 101,
                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    background: 'var(--pos-bg-card)',
                    borderBottom: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'var(--pos-action-primary)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <User size={24} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--pos-text-primary)', margin: 0 }}>
                                Customer Profile
                            </h2>
                            <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                                {customer.id}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="pos-icon-btn"
                        style={{ background: 'var(--pos-bg-main)', width: '40px', height: '40px' }}
                    >
                        <X size={20} color="var(--pos-text-secondary)" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Basic Info */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--pos-text-primary)', marginBottom: '4px' }}>
                                    {customer.name}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pos-text-secondary)', fontSize: '15px', fontWeight: 600 }}>
                                    <Phone size={16} color="var(--pos-action-primary)" />
                                    {customer.phone}
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--pos-state-warning)', textTransform: 'uppercase' }}>Loyalty</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-state-warning)' }}>
                                    <Star size={14} fill="currentColor" style={{ marginRight: '4px' }} />
                                    {customer.loyaltyPoints}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Address List */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <MapPinned size={18} color="var(--pos-text-muted)" />
                            <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Saved Addresses
                            </h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {customer.addresses.map(addr => (
                                <button
                                    key={addr.id}
                                    onClick={() => handleAddressClick(addr.id)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: selectedAddrId === addr.id ? 'var(--pos-bg-card)' : 'transparent',
                                        border: selectedAddrId === addr.id ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                        borderRadius: '12px',
                                        textAlign: 'left',
                                        display: 'flex',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        background: selectedAddrId === addr.id ? 'var(--pos-action-primary)' : 'var(--pos-bg-card)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <MapPin size={18} color={selectedAddrId === addr.id ? 'white' : 'var(--pos-text-muted)'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>{addr.label}</span>
                                            {addr.isDefault && <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--pos-text-muted)', background: 'var(--pos-bg-main)', padding: '2px 6px', borderRadius: '4px' }}>DEFAULT</span>}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', lineHeight: 1.4 }}>
                                            {addr.text}
                                        </div>
                                    </div>
                                    {selectedAddrId === addr.id && (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <CheckCircle2 size={20} color="var(--pos-state-success)" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Past Orders */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <History size={18} color="var(--pos-text-muted)" />
                            <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Recent Orders
                            </h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--pos-bg-card)', borderRadius: '12px', border: '1px solid var(--pos-border-subtle)', overflow: 'hidden' }}>
                            {customer.recentOrders.slice(0, 3).map((order, idx) => (
                                <div key={order.id} style={{
                                    padding: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: idx < 2 ? '1px solid var(--pos-border-subtle)' : 'none'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pos-text-primary)', marginBottom: '4px' }}>
                                            {order.id}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)' }}>
                                            {order.date} • {order.items}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>
                                            ${order.amount.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 700 }}>{order.type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Notes (Editable Inline) */}
                    <section style={{
                        background: 'rgba(245, 158, 11, 0.05)',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid rgba(245, 158, 11, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} color="var(--pos-state-warning)" />
                                <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-state-warning)', textTransform: 'uppercase', margin: 0 }}>
                                    Staff Notes
                                </h3>
                            </div>
                            {!isEditingNotes ? (
                                <button
                                    onClick={() => setIsEditingNotes(true)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--pos-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
                                >
                                    <Edit3 size={14} /> EDIT
                                </button>
                            ) : (
                                <button
                                    onClick={handleSaveNotes}
                                    style={{ background: 'var(--pos-state-success)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
                                >
                                    <Save size={14} /> SAVE
                                </button>
                            )}
                        </div>

                        {isEditingNotes ? (
                            <textarea
                                value={editedNotes}
                                onChange={(e) => setEditedNotes(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    background: 'var(--pos-bg-card)',
                                    border: '1px solid var(--pos-border-subtle)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    color: 'var(--pos-text-primary)',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'none',
                                    outline: 'none',
                                    boxShadow: '0 0 0 2px rgba(31, 164, 169, 0.2)'
                                }}
                                autoFocus
                            />
                        ) : (
                            <p style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                                "{customer.notes || 'No special instructions recorded.'}"
                            </p>
                        )}
                    </section>
                </div>

                {/* Footer Action */}
                <div style={{ padding: '24px', background: 'var(--pos-bg-card)', borderTop: '1px solid var(--pos-border-subtle)' }}>
                    <button
                        onClick={onClose}
                        className="pos-btn pos-btn-primary"
                        style={{ width: '100%', height: '60px', fontSize: '16px' }}
                    >
                        CONFIRM & CONTINUE
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
};
