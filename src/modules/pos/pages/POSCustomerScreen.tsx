'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    X,
    Search,
    UserPlus,
    Phone,
    History,
    RotateCcw,
    ArrowLeftRight,
    Star,
    ChevronRight,
    MapPin,
    User,
    UtensilsCrossed,
    ShoppingBag,
    Truck,
    Store,
    Calendar,
    Clock as ClockIcon,
    Table,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { POSCustomer, mockPOSCustomers } from '../mock/posData';
import { OrderChannel } from '../types/pos';
import { mockStores } from '../mock/posData';
import '../styles/pos-rush.css';
import { POSBackButton } from '../components/POSBackButton';

export const POSCustomerScreen: React.FC = () => {
    const router = useRouter();
    const { setCustomer, addToCart, selectedCustomer: currentSelected, updateCustomer, setChannel, setStore, setDeliveryAddress: setContextDeliveryAddress, session } = usePOS();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(currentSelected || null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
    const [orderType, setOrderType] = useState<OrderChannel>('Pickup');
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [deliveryAddress, setLocalDeliveryAddress] = useState<string>('');
    const [isAdvanceOrder, setIsAdvanceOrder] = useState(false);
    const [advanceDate, setAdvanceDate] = useState('');
    const [advanceTime, setAdvanceTime] = useState('');

    const searchParams = useSearchParams();
    const openModalParam = searchParams.get('openModal');

    // Persistence Effect: Restore state if returning from table selection or other redirects
    useEffect(() => {
        if (openModalParam === 'true') {
            setIsAddingNew(true);
            const savedForm = sessionStorage.getItem('pending_customer_form');
            if (savedForm) {
                try {
                    const data = JSON.parse(savedForm);
                    setNewCustomer(data.newCustomer);
                    setOrderType(data.orderType);
                    setLocalDeliveryAddress(data.deliveryAddress);
                    setSelectedStore(data.selectedStore);
                    setIsAdvanceOrder(data.isAdvanceOrder);
                    setAdvanceDate(data.advanceDate);
                    setAdvanceTime(data.advanceTime);
                    setIsEditing(data.isEditing);
                } catch (e) {
                    console.error('Failed to restore customer form state', e);
                }
                // Clean up after restoration
                sessionStorage.removeItem('pending_customer_form');
            }
        }
    }, [openModalParam]);

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return mockPOSCustomers;
        const q = searchQuery.toLowerCase();
        return mockPOSCustomers.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.email.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const handleSelectCustomer = (customer: POSCustomer) => {
        setSelectedCustomer(customer);
        setCustomer(customer);
    };

    const handleReorder = (order: any) => {
        alert(`Reordering items from ${order.id}. Cart will be updated with current prices.`);
        addToCart({
            id: 'p1',
            name: 'Margherita Dream',
            price: 18.00,
            quantity: 1,
            variants: [],
            modifiers: []
        });
        router.push('/pos/menu');
    };

    const handleRefund = (_order: any) => {
        if (selectedCustomer) {
            router.push(`/pos/refund-management?customerId=${selectedCustomer.id}&customerName=${encodeURIComponent(selectedCustomer.name)}`);
        } else {
            router.push('/pos/refund-management');
        }
    };

    const handleEdit = (customer: POSCustomer) => {
        setNewCustomer({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || ''
        });

        if (session?.channel) {
            setOrderType(session.channel);
        }

        if (session?.store && session?.channel === 'Pickup') {
            setSelectedStore(session.store.id);
        } else {
            setSelectedStore('');
        }

        if (session?.deliveryAddress?.text) {
            setLocalDeliveryAddress(session.deliveryAddress.text);
        } else if (customer.addresses && customer.addresses.length > 0) {
            const primaryAddress = customer.addresses.find(addr => addr.isDefault) || customer.addresses[0];
            setLocalDeliveryAddress(primaryAddress?.text || '');
        } else {
            setLocalDeliveryAddress('');
        }

        setIsEditing(true);
        setIsAddingNew(true);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomer.name || !newCustomer.phone) {
            alert('Name and Phone are required');
            return;
        }

        if (orderType === 'Pickup' && !selectedStore) {
            alert('Please select a pickup store');
            return;
        }

        if (!deliveryAddress.trim()) {
            alert('Please enter an address');
            return;
        }

        if (isEditing && selectedCustomer) {
            const updatedData = {
                name: newCustomer.name,
                phone: newCustomer.phone,
                email: newCustomer.email
            };

            const updatedCustomer = {
                ...selectedCustomer,
                ...updatedData,
                addresses: [{
                    id: selectedCustomer.addresses[0]?.id || `addr-${Date.now()}`,
                    label: orderType === 'Delivery' ? 'Delivery' : 'Primary',
                    type: orderType === 'Delivery' ? 'HOME' : 'OTHER',
                    street: deliveryAddress,
                    text: deliveryAddress,
                    isDefault: true
                }],
                notes: `${selectedCustomer.notes} - Updated: ${orderType}`
            };
            setSelectedCustomer(updatedCustomer);
            updateCustomer(selectedCustomer.id, updatedData);
            setChannel(orderType);

            if (orderType === 'Pickup' && selectedStore) {
                const store = mockStores.find(s => s.id === selectedStore);
                if (store) setStore(store);
            }

            setContextDeliveryAddress({
                id: `addr-${Date.now()}`,
                text: deliveryAddress,
                label: orderType === 'Delivery' ? 'Delivery' : 'Primary'
            });

            setIsEditing(false);
            setIsAddingNew(false);
            return;
        }

        const customer: POSCustomer = {
            id: `C${Math.floor(Math.random() * 90000) + 10000}`,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email,
            loyaltyPoints: 0,
            notes: `New Customer registered via POS - ${orderType}${isAdvanceOrder ? ` (ADVANCE: ${advanceDate} ${advanceTime})` : ''}`,
            addresses: [{
                id: `addr-${Date.now()}`,
                label: orderType === 'Delivery' ? 'Delivery' : 'Primary',
                type: orderType === 'Delivery' ? 'HOME' : 'OTHER',
                street: deliveryAddress,
                text: deliveryAddress,
                isDefault: true
            }],
            recentOrders: [],
        };

        setCustomer(customer);
        setSelectedCustomer(customer);
        setChannel(orderType);

        if (orderType === 'Pickup' && selectedStore) {
            const store = mockStores.find(s => s.id === selectedStore);
            if (store) setStore(store);
        }

        if (orderType === 'Delivery' && deliveryAddress) {
            setContextDeliveryAddress({
                id: `addr-${Date.now()}`,
                text: deliveryAddress,
                label: 'Primary'
            });
        }

        setIsAddingNew(false);
        setIsAdvanceOrder(false);
        setAdvanceDate('');
        setAdvanceTime('');
        router.push('/pos/menu');
    };

    const handleSelectTable = () => {
        // Persist current form state before navigating
        const formData = {
            newCustomer,
            orderType,
            deliveryAddress,
            selectedStore,
            isAdvanceOrder,
            advanceDate,
            advanceTime,
            isEditing
        };
        sessionStorage.setItem('pending_customer_form', JSON.stringify(formData));

        // Navigate with a flag to return and re-open modal
        router.push('/pos/table-selection?redirect=/pos/customers&openModal=true');
    };

    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--pos-bg-main)' }}>
            {/* Header */}
            <div className="pos-modal-header" style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <POSBackButton onClick={() => router.push('/pos/menu')} label="BACK TO MENU" />
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
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0 }}>Customer Management</h2>
                            <p style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontWeight: 600, margin: 0 }}>Search, Track, and Manage Customer Relationships</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => {
                                setCustomer(null);
                                router.push('/pos/menu');
                            }}
                            className="pos-btn pos-btn-secondary"
                            style={{ width: 'auto', padding: '0 24px', height: '52px', fontWeight: 800 }}
                        >
                            SKIP TO GUEST
                        </button>
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="pos-btn pos-btn-primary"
                            style={{ width: 'auto', padding: '0 24px', height: '52px' }}
                        >
                            <UserPlus size={18} /> REGISTER NEW CUSTOMER
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* LEFT PANEL: Search & List */}
                <div style={{
                    width: '400px',
                    borderRight: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white'
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color="var(--pos-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Name, Phone, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pos-input"
                                style={{ paddingLeft: '48px', height: '52px', borderRadius: '12px' }}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                        {filteredCustomers.map(customer => (
                            <button
                                key={customer.id}
                                onClick={() => handleSelectCustomer(customer)}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    background: selectedCustomer?.id === customer.id ? 'var(--pos-bg-card)' : 'transparent',
                                    border: selectedCustomer?.id === customer.id ? '1.5px solid var(--pos-action-primary)' : '1.5px solid transparent',
                                    textAlign: 'left',
                                    marginBottom: '8px',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    background: selectedCustomer?.id === customer.id ? 'var(--pos-action-primary)' : 'var(--pos-bg-surface)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    fontWeight: 800,
                                    color: selectedCustomer?.id === customer.id ? 'white' : 'var(--pos-action-primary)'
                                }}>
                                    {customer.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>{customer.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>{customer.phone}</div>
                                </div>
                                {selectedCustomer?.id === customer.id && <ChevronRight size={18} color="var(--pos-action-primary)" />}
                            </button>
                        ))}
                    </div>


                </div>

                {/* RIGHT PANEL: Details & History */}
                <div style={{ flex: 1, overflowY: 'auto', background: 'var(--pos-bg-main)' }}>
                    {selectedCustomer ? (
                        <div style={{ padding: '40px' }}>
                            {/* Profile Summary */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '40px',
                                background: 'white',
                                padding: '32px',
                                borderRadius: '24px',
                                border: '1px solid var(--pos-border-subtle)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                        <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0 }}>{selectedCustomer.name}</h2>
                                        <button
                                            onClick={() => handleEdit(selectedCustomer)}
                                            style={{ padding: '6px 12px', background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)', borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: 'var(--pos-action-primary)', cursor: 'pointer' }}
                                            className="hover-scale"
                                        >
                                            EDIT PROFILE
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                                            <Phone size={16} className="text-brand" /> {selectedCustomer.phone}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                                            <MapPin size={16} className="text-brand" /> {selectedCustomer.addresses[0]?.label || 'No Address'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-state-warning)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Loyalty Member</div>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-state-warning)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                        <Star size={24} fill="currentColor" /> {selectedCustomer.loyaltyPoints} PTS
                                    </div>
                                </div>
                            </div>

                            {/* Order History Section */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <History size={20} className="text-brand" />
                                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Purchases</h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {selectedCustomer.recentOrders.length > 0 ? selectedCustomer.recentOrders.map(order => (
                                        <div
                                            key={order.id}
                                            style={{
                                                background: 'white',
                                                borderRadius: '20px',
                                                padding: '24px',
                                                border: '1px solid var(--pos-border-subtle)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{order.id}</span>
                                                    <span style={{ padding: '4px 8px', background: 'var(--pos-bg-main)', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--pos-text-muted)' }}>{order.date}</span>
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>{order.items}</div>
                                                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-action-primary)', marginTop: '8px' }}>${order.amount.toFixed(2)}</div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    onClick={() => handleReorder(order)}
                                                    className="pos-btn"
                                                    style={{
                                                        background: 'var(--pos-state-success)',
                                                        color: 'white',
                                                        height: '52px',
                                                        fontSize: '13px',
                                                        padding: '0 20px'
                                                    }}
                                                >
                                                    <RotateCcw size={16} /> REORDER
                                                </button>
                                                <button
                                                    onClick={() => handleRefund(order)}
                                                    className="pos-btn"
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#EF4444',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        height: '52px',
                                                        fontSize: '13px',
                                                        padding: '0 20px'
                                                    }}
                                                >
                                                    <ArrowLeftRight size={16} /> REFUND
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '2px dashed var(--pos-border-subtle)' }}>
                                            <History size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                                            <p style={{ color: 'var(--pos-text-muted)', fontWeight: 600 }}>No order history found for this customer.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                            <User size={80} color="var(--pos-text-muted)" />
                            <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-text-muted)', marginTop: '24px' }}>Select a Customer to Manage</h3>
                            <p style={{ fontSize: '14px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>Choose from the left panel or search by identifier</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="pos-modal-footer" style={{ padding: '24px 32px', background: 'white', borderTop: '1px solid var(--pos-border-subtle)' }}>
                <button
                    disabled={!selectedCustomer}
                    onClick={() => router.push('/pos/menu')}
                    className="pos-btn pos-btn-primary"
                    style={{ width: '100%', height: '64px', fontSize: '18px' }}
                >
                    {selectedCustomer ? `CONFIRM ${selectedCustomer.name.toUpperCase()} & CLOSE` : 'SELECT CUSTOMER TO CONTINUE'}
                </button>
            </div>

            {/* ENHANCED FULL-PAGE ADD NEW CUSTOMER MODAL */}
            {isAddingNew && (
                <div className="pos-modal-overlay" style={{ zIndex: 1100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', padding: '40px' }}>
                    <div className="pos-modal" style={{
                        width: '100%',
                        maxWidth: '1200px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0,
                        overflow: 'hidden',
                        borderRadius: '32px',
                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '32px 48px',
                            background: 'white',
                            borderBottom: '1px solid var(--pos-border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0 }}>
                                    {isEditing ? 'Update Customer Profile' : 'New Customer Registration'}
                                </h3>
                                <p style={{ fontSize: '15px', color: 'var(--pos-text-muted)', fontWeight: 600, margin: '8px 0 0 0' }}> Complete the profile to link with active session </p>
                            </div>
                            <button
                                onClick={() => { setIsAddingNew(false); setIsEditing(false); }}
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'var(--pos-bg-main)',
                                    border: '1px solid var(--pos-border-subtle)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                className="hover-scale"
                            >
                                <X size={32} color="var(--pos-text-primary)" />
                            </button>
                        </div>

                        {/* Modal Body - 2 Column Layout */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '48px', background: 'var(--pos-bg-main)' }}>
                            <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

                                {/* LEFT COLUMN: Basic Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--pos-border-subtle)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--pos-action-primary)', margin: 0 }}>Basic Information</h4>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '12px', display: 'block' }}>Full Name *</label>
                                            <input
                                                required
                                                className="pos-input"
                                                style={{ height: '64px', fontSize: '18px', fontWeight: 700 }}
                                                placeholder="e.g. Harvey Specter"
                                                value={newCustomer.name}
                                                onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '12px', display: 'block' }}>Phone Number *</label>
                                            <input
                                                required
                                                className="pos-input"
                                                style={{ height: '64px', fontSize: '18px', fontWeight: 700 }}
                                                placeholder="+1 (###) ###-####"
                                                value={newCustomer.phone}
                                                onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '12px', display: 'block' }}>Email Address (Optional)</label>
                                            <input
                                                type="email"
                                                className="pos-input"
                                                style={{ height: '64px', fontSize: '18px', fontWeight: 700 }}
                                                placeholder="name@email.com"
                                                value={newCustomer.email}
                                                onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Advance Ordering Section */}
                                    <div style={{
                                        background: isAdvanceOrder ? 'rgba(31, 164, 169, 0.05)' : 'white',
                                        padding: '32px',
                                        borderRadius: '24px',
                                        border: isAdvanceOrder ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isAdvanceOrder ? '32px' : 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', background: isAdvanceOrder ? 'var(--pos-action-primary)' : 'var(--pos-bg-surface)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Calendar size={20} color={isAdvanceOrder ? 'white' : 'var(--pos-text-muted)'} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0 }}>Advance Ordering</h4>
                                                    <p style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 600, margin: 0 }}>Schedule this order for a future date</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsAdvanceOrder(!isAdvanceOrder)}
                                                style={{
                                                    width: '64px',
                                                    height: '32px',
                                                    borderRadius: '16px',
                                                    background: isAdvanceOrder ? 'var(--pos-action-primary)' : '#E2E8F0',
                                                    position: 'relative',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'white',
                                                    position: 'absolute',
                                                    top: '4px',
                                                    left: isAdvanceOrder ? '36px' : '4px',
                                                    transition: 'all 0.3s',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }} />
                                            </button>
                                        </div>

                                        {isAdvanceOrder && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', animation: 'posFadeInUp 0.3s ease-out' }}>
                                                <div>
                                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block' }}>Execution Date</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <Calendar size={18} color="var(--pos-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                                        <input
                                                            type="date"
                                                            className="pos-input"
                                                            style={{ paddingLeft: '48px', height: '56px' }}
                                                            value={advanceDate}
                                                            onChange={e => setAdvanceDate(e.target.value)}
                                                            required={isAdvanceOrder}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block' }}>Execution Time</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <ClockIcon size={18} color="var(--pos-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                                        <input
                                                            type="time"
                                                            className="pos-input"
                                                            style={{ paddingLeft: '48px', height: '56px' }}
                                                            value={advanceTime}
                                                            onChange={e => setAdvanceTime(e.target.value)}
                                                            required={isAdvanceOrder}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Fulfillment & Address */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                                    {/* Order Mode Selection */}
                                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--pos-border-subtle)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--pos-action-primary)', margin: 0 }}>Fulfillment Details</h4>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                            {(['Dine-In', 'Pickup', 'Delivery'] as const).map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setOrderType(mode)}
                                                    style={{
                                                        padding: '24px 16px',
                                                        borderRadius: '20px',
                                                        border: orderType === mode ? '2.5px solid var(--pos-action-primary)' : '2.5px solid var(--pos-border-subtle)',
                                                        background: orderType === mode ? 'rgba(31, 164, 169, 0.05)' : 'transparent',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        color: orderType === mode ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)'
                                                    }}
                                                    className="hover-scale"
                                                >
                                                    {mode === 'Dine-In' ? <UtensilsCrossed size={28} /> : mode === 'Pickup' ? <ShoppingBag size={28} /> : <Truck size={28} />}
                                                    <span style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }}>{mode === 'Pickup' ? 'Takeaway' : mode}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Context Specific Actions */}
                                        {orderType === 'Dine-In' ? (
                                            <div style={{ animation: 'posFadeInUp 0.3s ease-out' }}>
                                                <button
                                                    type="button"
                                                    onClick={handleSelectTable}
                                                    style={{
                                                        width: '100%',
                                                        height: '80px',
                                                        background: 'var(--pos-action-primary)',
                                                        color: 'white',
                                                        borderRadius: '16px',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '16px',
                                                        fontSize: '18px',
                                                        fontWeight: 900,
                                                        cursor: 'pointer',
                                                        boxShadow: '0 8px 16px -4px rgba(31, 164, 169, 0.5)'
                                                    }}
                                                    className="hover-scale"
                                                >
                                                    <Table size={24} strokeWidth={2.5} />
                                                    {session?.activeTable ? `TABLE: ${session.activeTable.name} (Change)` : 'SELECT DINING TABLE'}
                                                </button>
                                            </div>
                                        ) : orderType === 'Pickup' ? (
                                            <div style={{ animation: 'posFadeInUp 0.3s ease-out' }}>
                                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '12px', display: 'block' }}>Pickup Store Location *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Store size={20} color="var(--pos-text-muted)" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                                                    <select
                                                        required={orderType === 'Pickup'}
                                                        className="pos-input"
                                                        value={selectedStore}
                                                        onChange={e => setSelectedStore(e.target.value)}
                                                        style={{ height: '64px', paddingLeft: '56px', fontSize: '16px', fontWeight: 700, appearance: 'none' }}
                                                    >
                                                        <option value="">Choose nearest branch...</option>
                                                        {mockStores.map(store => (
                                                            <option key={store.id} value={store.id}>{store.name} - {store.address}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronRight size={20} color="var(--pos-text-muted)" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Address & Notes */}
                                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--pos-border-subtle)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--pos-action-primary)', margin: 0 }}>Location & Logistics</h4>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '12px', display: 'block' }}>
                                                {orderType === 'Delivery' ? 'Full Delivery Address *' : 'Primary Contact Address'}
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <MapPin size={20} color="var(--pos-text-muted)" style={{ position: 'absolute', left: '20px', top: '24px' }} />
                                                <textarea
                                                    required
                                                    className="pos-input"
                                                    style={{ minHeight: '140px', padding: '24px 24px 24px 56px', fontSize: '16px', fontWeight: 600, lineHeight: 1.6 }}
                                                    placeholder={orderType === 'Delivery' ? 'Enter street, building, and landmarks...' : 'Enter customer residence info...'}
                                                    value={deliveryAddress}
                                                    onChange={e => setLocalDeliveryAddress(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '32px 48px',
                            background: 'white',
                            borderTop: '1px solid var(--pos-border-subtle)',
                            display: 'flex',
                            gap: '24px'
                        }}>
                            <button
                                onClick={() => { setIsAddingNew(false); setIsEditing(false); }}
                                type="button"
                                style={{
                                    flex: 1,
                                    height: '72px',
                                    borderRadius: '16px',
                                    background: 'var(--pos-bg-main)',
                                    border: '1px solid var(--pos-border-subtle)',
                                    fontSize: '18px',
                                    fontWeight: 900,
                                    color: 'var(--pos-text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                ABANDON REGISTRATION
                            </button>
                            <button
                                onClick={() => (document.querySelector('form') as any)?.requestSubmit()}
                                type="button"
                                style={{
                                    flex: 2,
                                    height: '72px',
                                    borderRadius: '16px',
                                    background: 'var(--pos-action-primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    boxShadow: '0 12px 24px -6px rgba(31, 164, 169, 0.4)',
                                    cursor: 'pointer'
                                }}
                                className="hover-scale"
                            >
                                {isEditing ? 'COMMIT UPDATES' : 'FINALIZE & LINK TO ORDER'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
