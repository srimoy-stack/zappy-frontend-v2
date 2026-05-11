'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    Search,
    Phone,
    UserPlus,
    ArrowRight,
    X,
    Clock,
    Star,
    Delete,
    SkipForward
} from 'lucide-react';
import '../styles/pos-rush.css';

export const CustomerLookupPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { session, setCustomer, customers } = usePOS();

    // Auto-detect incoming call from search params
    const incomingPhone = searchParams.get('phone') || '';
    const [searchQuery, setSearchQuery] = useState(incomingPhone);
    const [results, setResults] = useState(customers);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

    const isStorePOS = session?.posType === 'STORE';

    // Focus input on load
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Instant search logic
    useEffect(() => {
        const cleanQuery = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!cleanQuery) {
            setResults(customers.slice(0, 5)); // Show recent if empty
            return;
        }

        const filtered = customers.filter(c => {
            const cleanName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanPhone = c.phone.replace(/[^0-9]/g, '');
            return cleanName.includes(cleanQuery) || cleanPhone.includes(cleanQuery);
        });
        setResults(filtered);
    }, [searchQuery, customers]);

    const handleSelect = (customer: any) => {
        setCustomer(customer);
        if (session?.channel === 'Delivery') {
            router.push('/pos/delivery-details');
        } else {
            router.push('/pos/menu');
        }
    };

    const handleSkip = () => {
        setCustomer(null);
        if (session?.channel === 'Delivery') {
            router.push('/pos/delivery-details');
        } else {
            router.push('/pos/menu');
        }
    };

    const appendDigit = (digit: string) => {
        setSearchQuery(prev => prev + digit);
    };

    const handleBackspace = () => {
        setSearchQuery(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setSearchQuery('');
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomer.name || !newCustomer.phone) {
            alert('Name and Phone are required');
            return;
        }

        const customer = {
            id: `C${Math.floor(Math.random() * 90000) + 10000}`,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email,
            loyaltyPoints: 0,
            notes: 'New Customer registered via POS',
            addresses: [],
            recentOrders: [],
            isNew: true
        } as any;

        setCustomer(customer);
        router.push('/pos/menu');
    };

    return (
        <div className="pos-screen" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 1. HEADER / SEARCH BAR */}
            <div style={{
                padding: '24px',
                background: 'var(--pos-bg-surface)',
                borderBottom: '1px solid var(--pos-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                <button onClick={() => router.back()} className="pos-icon-btn" style={{ background: 'var(--pos-bg-card)' }}>
                    <X size={24} color="var(--pos-text-secondary)" />
                </button>

                <div style={{ flex: 1, position: 'relative' }}>
                    <Search
                        size={24}
                        color="var(--pos-text-muted)"
                        style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search by Phone or Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pos-input"
                        style={{
                            height: '72px',
                            paddingLeft: '64px',
                            fontSize: '24px',
                            fontWeight: 700,
                            background: 'var(--pos-bg-card)',
                            border: '2px solid var(--pos-border-subtle)',
                            borderRadius: '16px'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={handleClear}
                            style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--pos-text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                <button
                    onClick={handleSkip}
                    className="pos-btn pos-btn-secondary"
                    style={{
                        height: '72px',
                        padding: '0 32px',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'var(--pos-action-secondary)',
                        color: 'white'
                    }}
                >
                    <SkipForward size={24} />
                    SKIP / GUEST
                </button>
            </div>

            {/* 2. MAIN LAYOUT (Split for Store POS numpad) */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* 2.1 RESULTS PANEL */}
                <div style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto',
                    borderRight: isStorePOS ? '1px solid var(--pos-border-subtle)' : 'none'
                }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--pos-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {searchQuery ? <Search size={14} /> : <Clock size={14} />}
                        {searchQuery ? `Search Results (${results.length})` : 'Recent Customers'}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {results.length > 0 ? (
                            results.map(customer => (
                                <button
                                    key={customer.id}
                                    onClick={() => handleSelect(customer)}
                                    className="pos-card hover-scale"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '20px 24px',
                                        background: 'var(--pos-bg-surface)',
                                        border: '1px solid var(--pos-border-subtle)',
                                        borderRadius: '16px',
                                        textAlign: 'left',
                                        width: '100%'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            background: 'var(--pos-bg-card)',
                                            borderRadius: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            fontWeight: 800,
                                            color: 'var(--pos-action-primary)'
                                        }}>
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>
                                                {customer.name}
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Phone size={14} /> {customer.phone}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--pos-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Loyalty</div>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-state-warning)' }}>
                                                <Star size={12} fill="currentColor" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                                {customer.loyaltyPoints} pts
                                            </div>
                                        </div>
                                        <ArrowRight size={24} color="var(--pos-text-muted)" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div style={{
                                padding: '80px 24px',
                                textAlign: 'center',
                                color: 'var(--pos-text-muted)',
                                background: 'var(--pos-bg-surface)',
                                borderRadius: '16px',
                                border: '2px dashed var(--pos-border-subtle)'
                            }}>
                                <UserPlus size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pos-text-secondary)' }}>No matches found</div>
                                <div style={{ fontSize: '14px', marginBottom: '24px' }}>Would you like to register a new customer?</div>
                                <button
                                    onClick={() => {
                                        setNewCustomer(prev => ({ ...prev, phone: searchQuery }));
                                        setIsRegistering(true);
                                    }}
                                    className="pos-btn pos-btn-primary"
                                    style={{ width: 'auto', padding: '0 32px' }}
                                >
                                    REGISTER NEW CUSTOMER
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2.2 NUMPAD (Only for Store POS) */}
                {isStorePOS && (
                    <div style={{
                        width: '400px',
                        background: 'var(--pos-bg-card)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--pos-text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>
                            Fast Entry Keypad
                        </div>
                        <div className="pos-numpad" style={{ flex: 1, gap: '16px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => appendDigit(num.toString())}
                                    className="pos-numpad-btn"
                                    style={{ height: 'auto', aspectRatio: '1/1', fontSize: '28px' }}
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                onClick={handleClear}
                                className="pos-numpad-btn"
                                style={{ height: 'auto', aspectRatio: '1/1', color: 'var(--pos-state-error)' }}
                            >
                                <X size={28} />
                            </button>
                            <button
                                onClick={() => appendDigit('0')}
                                className="pos-numpad-btn"
                                style={{ height: 'auto', aspectRatio: '1/1', fontSize: '28px' }}
                            >
                                0
                            </button>
                            <button
                                onClick={handleBackspace}
                                className="pos-numpad-btn"
                                style={{ height: 'auto', aspectRatio: '1/1' }}
                            >
                                <Delete size={28} />
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setNewCustomer(prev => ({ ...prev, phone: searchQuery }));
                                setIsRegistering(true);
                            }}
                            className="pos-btn"
                            style={{ height: '64px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)' }}
                        >
                            <UserPlus size={20} />
                            NEW CUSTOMER
                        </button>
                    </div>
                )}
            </div>

            {/* CALL CENTER INDICATOR */}
            {/* REGISTRATION MODAL */}
            {isRegistering && (
                <div className="pos-modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="pos-modal" style={{ width: '450px', padding: '32px', animation: 'posFadeInUp 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0 }}>New Customer</h3>
                                <p style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontWeight: 600, margin: 0 }}>Register and attach to current order</p>
                            </div>
                            <button onClick={() => setIsRegistering(false)} className="pos-icon-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block' }}>Full Name *</label>
                                <input
                                    autoFocus
                                    required
                                    className="pos-input"
                                    placeholder="e.g. Harvey Specter"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block' }}>Phone Number *</label>
                                <input
                                    required
                                    className="pos-input"
                                    placeholder="+1 (###) ###-####"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="pos-input"
                                    placeholder="name@email.com"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="pos-btn pos-btn-primary"
                                style={{
                                    marginTop: '12px',
                                    height: '64px',
                                    fontSize: '16px',
                                    letterSpacing: '0.02em'
                                }}
                            >
                                <UserPlus size={20} /> REGISTER & ATTACH TO ORDER
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerLookupPage;
