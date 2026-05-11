'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    MapPin,
    Truck,
    Bike,
    Clock,
    DollarSign,
    ChevronLeft,
    Plus,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import '../styles/pos-rush.css';

export const POSDeliveryDetailsPage: React.FC = () => {
    const router = useRouter();
    const {
        session,
        selectedCustomer,
        deliveryAddress,
        setDeliveryAddress
    } = usePOS();

    const [provider, setProvider] = useState<'SELF' | 'UBER'>('SELF');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: 'Home', text: '' });

    // Derived values for preview (mocked logic)
    const deliveryFee = provider === 'UBER' ? 6.50 : 3.00;
    const deliveryETA = provider === 'UBER' ? '25-35 min' : '45-55 min';

    useEffect(() => {
        // Auto-select default address if customer has one and none is selected
        if (selectedCustomer && !deliveryAddress) {
            const defaultAddr = selectedCustomer.addresses.find(a => a.isDefault) || selectedCustomer.addresses[0];
            if (defaultAddr) {
                setDeliveryAddress({ id: defaultAddr.id, text: defaultAddr.text, label: defaultAddr.label });
            }
        }
    }, [selectedCustomer, deliveryAddress, setDeliveryAddress]);

    const handleConfirm = () => {
        if (deliveryAddress) {
            router.push('/pos/menu');
        }
    };

    const handleSaveNewAddress = () => {
        if (newAddress.text.trim()) {
            const newAddrObj = {
                id: `new-${Date.now()}`,
                text: newAddress.text,
                label: newAddress.label
            };
            setDeliveryAddress(newAddrObj);
            setIsAddingNew(false);
        }
    };

    if (!session || session.channel !== 'Delivery') {
        // Safety redirect if accessed incorrectly
        useEffect(() => {
            router.push('/pos/fulfillment');
        }, []);
        return null;
    }

    return (
        <div className="pos-screen" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: 'var(--pos-bg-main)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <header style={{
                padding: '32px 48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                borderBottom: '1px solid var(--pos-border-subtle)',
                background: 'var(--pos-bg-surface)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => router.back()} className="pos-icon-btn">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0 }}>
                            Delivery Logistics
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--pos-text-muted)', fontWeight: 600, margin: '4px 0 0 0' }}>
                            Customer: <span style={{ color: 'var(--pos-action-primary)' }}>{selectedCustomer?.name || 'Walk-in Guest'}</span>
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                        padding: '10px 20px',
                        background: 'var(--pos-bg-card)',
                        borderRadius: '12px',
                        border: '1px solid var(--pos-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Clock size={18} color="var(--pos-state-warning)" />
                        <span style={{ fontSize: '16px', fontWeight: 800 }}>{deliveryETA}</span>
                    </div>
                    <div style={{
                        padding: '10px 20px',
                        background: 'var(--pos-bg-card)',
                        borderRadius: '12px',
                        border: '1px solid var(--pos-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <DollarSign size={18} color="var(--pos-state-success)" />
                        <span style={{ fontSize: '16px', fontWeight: 800 }}>${deliveryFee.toFixed(2)}</span>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, display: 'flex', padding: '48px', gap: '48px', overflow: 'hidden' }}>
                {/* Left: Address Selection */}
                <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Delivery Address
                        </h3>
                        {!isAddingNew && (
                            <button
                                onClick={() => setIsAddingNew(true)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--pos-action-primary)',
                                    fontWeight: 800,
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={16} /> ADD NEW
                            </button>
                        )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '12px' }}>
                        {isAddingNew ? (
                            <div style={{
                                padding: '32px',
                                background: 'var(--pos-bg-card)',
                                borderRadius: '24px',
                                border: '2px solid var(--pos-action-primary)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                animation: 'fadeIn 0.2s ease-out'
                            }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Label</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['Home', 'Office', 'Other'].map(l => (
                                            <button
                                                key={l}
                                                onClick={() => setNewAddress({ ...newAddress, label: l })}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    background: newAddress.label === l ? 'var(--pos-action-primary)' : 'var(--pos-bg-main)',
                                                    color: newAddress.label === l ? 'white' : 'var(--pos-text-secondary)',
                                                    border: 'none',
                                                    fontWeight: 700,
                                                    fontSize: '13px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Full Street Address</label>
                                    <textarea
                                        autoFocus
                                        value={newAddress.text}
                                        onChange={(e) => setNewAddress({ ...newAddress, text: e.target.value })}
                                        placeholder="Flat no, Building, Street name, Area, Landmarks..."
                                        style={{
                                            width: '100%',
                                            height: '100px',
                                            padding: '16px',
                                            background: 'var(--pos-bg-main)',
                                            border: '1px solid var(--pos-border-subtle)',
                                            borderRadius: '12px',
                                            color: 'var(--pos-text-primary)',
                                            fontSize: '16px',
                                            resize: 'none',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={handleSaveNewAddress}
                                        className="pos-btn pos-btn-primary"
                                        style={{ height: '52px', flex: 1 }}
                                    >
                                        USE THIS ADDRESS
                                    </button>
                                    <button
                                        onClick={() => setIsAddingNew(false)}
                                        style={{
                                            padding: '0 24px',
                                            background: 'transparent',
                                            color: 'var(--pos-text-secondary)',
                                            border: 'none',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {selectedCustomer?.addresses.map((addr) => (
                                    <button
                                        key={addr.id}
                                        onClick={() => setDeliveryAddress({ id: addr.id, text: addr.text, label: addr.label })}
                                        style={{
                                            padding: '24px',
                                            background: deliveryAddress?.id === addr.id ? 'var(--pos-bg-card)' : 'transparent',
                                            border: deliveryAddress?.id === addr.id ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                            borderRadius: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '20px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            background: deliveryAddress?.id === addr.id ? 'var(--pos-action-primary)' : 'var(--pos-bg-card)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <MapPin size={24} color={deliveryAddress?.id === addr.id ? 'white' : 'var(--pos-text-muted)'} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)', marginBottom: '4px' }}>
                                                {addr.label}
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', lineHeight: 1.4 }}>
                                                {addr.text}
                                            </div>
                                        </div>
                                        {deliveryAddress?.id === addr.id && (
                                            <CheckCircle2 size={24} color="var(--pos-state-success)" />
                                        )}
                                    </button>
                                ))}
                                {(!selectedCustomer || selectedCustomer.addresses.length === 0) && !isAddingNew && (
                                    <div style={{
                                        padding: '40px',
                                        textAlign: 'center',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '24px',
                                        border: '2px dashed var(--pos-border-subtle)'
                                    }}>
                                        <MapPin size={48} color="var(--pos-text-muted)" style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                                        <h4 style={{ color: 'var(--pos-text-secondary)', marginBottom: '8px' }}>No Saved Addresses</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--pos-text-muted)', marginBottom: '24px' }}>Please add a new delivery address to continue.</p>
                                        <button onClick={() => setIsAddingNew(true)} className="pos-btn" style={{ background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)' }}>
                                            + ADD FIRST ADDRESS
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Provider & Meta */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    <section>
                        <h3 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                            Delivery Provider
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button
                                onClick={() => setProvider('SELF')}
                                style={{
                                    padding: '24px',
                                    background: provider === 'SELF' ? 'var(--pos-bg-card)' : 'transparent',
                                    border: provider === 'SELF' ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: provider === 'SELF' ? 'var(--pos-action-primary)' : 'var(--pos-bg-surface)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Bike size={28} color={provider === 'SELF' ? 'white' : 'var(--pos-text-muted)'} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>Our Fleet</div>
                                    <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', marginTop: '2px' }}>Reliable service by store riders</div>
                                </div>
                            </button>

                            <button
                                onClick={() => setProvider('UBER')}
                                style={{
                                    padding: '24px',
                                    background: provider === 'UBER' ? 'var(--pos-bg-card)' : 'transparent',
                                    border: provider === 'UBER' ? '2px solid #06C167' : '1px solid var(--pos-border-subtle)',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: provider === 'UBER' ? '#06C167' : 'var(--pos-bg-surface)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Truck size={28} color={provider === 'UBER' ? 'white' : 'var(--pos-text-muted)'} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>Uber Direct</div>
                                    <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', marginTop: '2px' }}>Priority third-party fulfillment</div>
                                </div>
                            </button>
                        </div>
                    </section>

                    <section style={{
                        marginTop: 'auto',
                        background: 'var(--pos-bg-surface)',
                        padding: '32px',
                        borderRadius: '32px',
                        border: '1px solid var(--pos-border-subtle)'
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Distance-based Fee</span>
                                <span style={{ color: 'var(--pos-text-primary)', fontWeight: 800 }}>${deliveryFee.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Estimated Delivery Time</span>
                                <span style={{ color: 'var(--pos-state-warning)', fontWeight: 800 }}>{deliveryETA}</span>
                            </div>
                        </div>

                        <button
                            disabled={!deliveryAddress}
                            onClick={handleConfirm}
                            className={`pos-btn pos-btn-primary`}
                            style={{
                                width: '100%',
                                height: '72px',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                opacity: deliveryAddress ? 1 : 0.5,
                                cursor: deliveryAddress ? 'pointer' : 'not-allowed'
                            }}
                        >
                            CONFIRM & START ORDER <ArrowRight size={24} />
                        </button>
                        {!deliveryAddress && (
                            <p style={{ textAlign: 'center', color: '#EF4444', fontSize: '11px', fontWeight: 700, marginTop: '12px', textTransform: 'uppercase' }}>
                                ⚠️ Address selection is required
                            </p>
                        )}
                    </section>
                </div>
            </main>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
