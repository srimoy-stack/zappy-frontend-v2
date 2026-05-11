'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
    Store
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { POSCustomer } from '../mock/posData';
import { OrderChannel } from '../types/pos';
import { mockStores } from '../mock/posData';
import '../styles/pos-rush.css';

interface POSCustomerManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const POSCustomerManagementModal: React.FC<POSCustomerManagementModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const { setCustomer, addToCart, selectedCustomer: currentSelected, updateCustomer, setChannel, setStore, setDeliveryAddress: setContextDeliveryAddress, session, customers } = usePOS();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(currentSelected || null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
    const [orderType, setOrderType] = useState<OrderChannel>('Pickup');
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [deliveryAddress, setLocalDeliveryAddress] = useState<string>('');
    const [reorderExpandedId, setReorderExpandedId] = useState<string | null>(null);
    const [reorderConfig, setReorderConfig] = useState<{
        fulfillment: OrderChannel;
        address: string;
        storeId: string;
        tableId: string;
        tableName: string;
    }>({
        fulfillment: 'Pickup',
        address: '',
        storeId: '',
        tableId: '',
        tableName: ''
    });
    const [isSelectingTable, setIsSelectingTable] = useState(false);
    const { tables, setTable } = usePOS();

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;
        const q = searchQuery.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.email?.toLowerCase().includes(q)
        );
    }, [searchQuery, customers]);

    if (!isOpen) return null;

    const handleSelectCustomer = (customer: POSCustomer) => {
        setSelectedCustomer(customer);
        setCustomer(customer);
    };

    const handleReorderToggle = (order: any) => {
        if (reorderExpandedId === order.id) {
            setReorderExpandedId(null);
            return;
        }

        setReorderExpandedId(order.id);

        // Initialize reorder config from previous order or session
        const primaryAddress = selectedCustomer?.addresses.find(a => a.isDefault) || selectedCustomer?.addresses[0];

        setReorderConfig({
            fulfillment: (session?.channel as OrderChannel) || 'Pickup',
            address: primaryAddress?.text || '',
            storeId: session?.store?.id || '',
            tableId: '',
            tableName: ''
        });
    };

    const confirmReorder = (_order: any) => {
        if (selectedCustomer) {
            setCustomer(selectedCustomer);
        }

        // Apply selected fulfillment and details
        setChannel(reorderConfig.fulfillment);

        if (reorderConfig.fulfillment === 'Pickup' && reorderConfig.storeId) {
            const store = mockStores.find(s => s.id === reorderConfig.storeId);
            if (store) setStore(store);
        }

        if (reorderConfig.fulfillment === 'Delivery') {
            setContextDeliveryAddress({
                id: `addr-${Date.now()}`,
                text: reorderConfig.address,
                label: 'Delivery'
            });
        }

        if (reorderConfig.fulfillment === 'Dine-In' && reorderConfig.tableId) {
            const table = tables.find(t => t.id === reorderConfig.tableId);
            if (table) setTable(table);
        }

        // Mock reorder logic: Add items
        addToCart({
            id: `reorder-${Date.now()}`,
            name: 'Margherita Dream',
            price: 18.00,
            quantity: 1,
            variants: [],
            modifiers: []
        });

        onClose();
    };

    const handleSelectTableForReorder = (table: any) => {
        setReorderConfig({
            ...reorderConfig,
            tableId: table.id,
            tableName: table.name
        });
        setIsSelectingTable(false);
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

        // Pre-populate order type fields from session
        if (session?.channel) {
            setOrderType(session.channel);
        }

        // Pre-populate store if it's a pickup order
        if (session?.store && session?.channel === 'Pickup') {
            setSelectedStore(session.store.id);
        } else {
            setSelectedStore('');
        }

        // Pre-populate address from session delivery address or customer's primary address
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

        // Validate order type specific fields
        if (orderType === 'Pickup' && !selectedStore) {
            alert('Please select a pickup store');
            return;
        }

        // Address is mandatory for all order types
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

            // Update local state for immediate feedback
            const updatedCustomer = {
                ...selectedCustomer,
                ...updatedData,
                // Update addresses with the new address
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

            // Update global session context
            updateCustomer(selectedCustomer.id, updatedData);

            // Update order type in session
            setChannel(orderType);

            // Update store if pickup
            if (orderType === 'Pickup' && selectedStore) {
                const store = mockStores.find(s => s.id === selectedStore);
                if (store) {
                    setStore(store);
                }
            }

            // Update delivery address
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
            notes: `New Customer registered via POS - ${orderType}`,
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

        // Update POS context with order type
        setChannel(orderType);

        // If pickup, update the store in context
        if (orderType === 'Pickup' && selectedStore) {
            const store = mockStores.find(s => s.id === selectedStore);
            if (store) {
                setStore(store);
            }
        }

        // If delivery, set the delivery address
        if (orderType === 'Delivery' && deliveryAddress) {
            setContextDeliveryAddress({
                id: `addr-${Date.now()}`,
                text: deliveryAddress,
                label: 'Primary'
            });
        }

        setIsAddingNew(false);
    };

    return (
        <div className="pos-modal-overlay" style={{ zIndex: 1000 }}>
            <div className="pos-modal" style={{ width: '1100px', height: '85vh', maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div className="pos-modal-header" style={{ padding: '24px 32px' }}>
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
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-text-primary)', margin: 0 }}>Customer Management</h2>
                            <p style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontWeight: 600, margin: 0 }}>Search, Track, and Manage Customer Relationships</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="pos-icon-btn">
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* LEFT PANEL: Search & List */}
                    <div style={{
                        width: '400px',
                        borderRight: '1px solid var(--pos-border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(255,255,255,0.02)'
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

                        <div style={{ padding: '24px', borderTop: '1px solid var(--pos-border-subtle)' }}>
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="pos-btn"
                                style={{ width: '100%', background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)', color: 'var(--pos-action-primary)' }}
                            >
                                <UserPlus size={18} /> ADD NEW CUSTOMER
                            </button>
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
                                    background: 'var(--pos-bg-surface)',
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
                                            <React.Fragment key={order.id}>
                                                <div
                                                    style={{
                                                        background: 'var(--pos-bg-surface)',
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

                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleReorderToggle(order)}
                                                            className="pos-btn"
                                                            style={{
                                                                background: reorderExpandedId === order.id ? 'var(--pos-text-primary)' : 'var(--pos-state-success)',
                                                                color: 'white',
                                                                height: '44px',
                                                                fontSize: '12px',
                                                                padding: '0 16px',
                                                                borderRadius: '12px'
                                                            }}
                                                        >
                                                            <RotateCcw size={14} /> {reorderExpandedId === order.id ? 'CANCEL' : 'REORDER'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRefund(order)}
                                                            className="pos-btn"
                                                            style={{
                                                                background: 'transparent',
                                                                color: 'var(--pos-text-muted)',
                                                                border: '1px solid var(--pos-border-subtle)',
                                                                height: '44px',
                                                                fontSize: '12px',
                                                                padding: '0 16px',
                                                                borderRadius: '12px'
                                                            }}
                                                        >
                                                            <ArrowLeftRight size={14} /> REFUND
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded Reorder Section */}
                                                {reorderExpandedId === order.id && (
                                                    <div style={{
                                                        marginTop: '16px',
                                                        padding: '24px',
                                                        background: 'var(--pos-bg-main)',
                                                        borderRadius: '16px',
                                                        border: '1.5px solid var(--pos-action-primary)',
                                                        animation: 'posFadeInUp 0.3s ease'
                                                    }}>
                                                        <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Confirm Reorder Details</div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                                            {(['Dine-In', 'Pickup', 'Delivery'] as OrderChannel[]).map(type => (
                                                                <button
                                                                    key={type}
                                                                    onClick={() => setReorderConfig({ ...reorderConfig, fulfillment: type })}
                                                                    style={{
                                                                        padding: '12px',
                                                                        borderRadius: '10px',
                                                                        border: reorderConfig.fulfillment === type ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                                        background: reorderConfig.fulfillment === type ? 'white' : 'transparent',
                                                                        fontSize: '13px',
                                                                        fontWeight: 800,
                                                                        color: reorderConfig.fulfillment === type ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    {type}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {reorderConfig.fulfillment === 'Delivery' && (
                                                            <div style={{ marginBottom: '16px' }}>
                                                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', display: 'block', marginBottom: '6px' }}>CONFIRM ADDRESS</label>
                                                                <textarea
                                                                    className="pos-input"
                                                                    value={reorderConfig.address}
                                                                    onChange={e => setReorderConfig({ ...reorderConfig, address: e.target.value })}
                                                                    style={{ background: 'white', minHeight: '60px', padding: '12px' }}
                                                                />
                                                            </div>
                                                        )}

                                                        {reorderConfig.fulfillment === 'Pickup' && (
                                                            <div style={{ marginBottom: '16px' }}>
                                                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', display: 'block', marginBottom: '6px' }}>SELECT STORE</label>
                                                                <select
                                                                    className="pos-input"
                                                                    value={reorderConfig.storeId}
                                                                    onChange={e => setReorderConfig({ ...reorderConfig, storeId: e.target.value })}
                                                                    style={{ background: 'white' }}
                                                                >
                                                                    {mockStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                                </select>
                                                            </div>
                                                        )}

                                                        {reorderConfig.fulfillment === 'Dine-In' && (
                                                            <div style={{ marginBottom: '16px' }}>
                                                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', display: 'block', marginBottom: '6px' }}>ASSIGN TABLE</label>
                                                                <button
                                                                    onClick={() => setIsSelectingTable(!isSelectingTable)}
                                                                    className="pos-btn"
                                                                    style={{ width: '100%', background: 'white', border: '1px solid var(--pos-border-subtle)', justifyContent: 'space-between', color: 'var(--pos-text-primary)' }}
                                                                >
                                                                    {reorderConfig.tableName || 'CHOOSE A TABLE'} <ChevronRight size={16} />
                                                                </button>

                                                                {isSelectingTable && (
                                                                    <div style={{
                                                                        marginTop: '8px',
                                                                        display: 'grid',
                                                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                                                        gap: '8px',
                                                                        maxHeight: '150px',
                                                                        overflowY: 'auto',
                                                                        padding: '12px',
                                                                        background: 'white',
                                                                        borderRadius: '12px',
                                                                        border: '1px solid var(--pos-border-subtle)'
                                                                    }}>
                                                                        {tables.filter(t => t.status === 'FREE').map(table => (
                                                                            <button
                                                                                key={table.id}
                                                                                onClick={() => handleSelectTableForReorder(table)}
                                                                                style={{
                                                                                    padding: '10px',
                                                                                    borderRadius: '8px',
                                                                                    border: '1px solid var(--pos-border-subtle)',
                                                                                    background: 'var(--pos-bg-main)',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 800,
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                {table.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => confirmReorder(order)}
                                                            className="pos-btn pos-btn-primary"
                                                            style={{ width: '100%', height: '52px', fontSize: '14px' }}
                                                        >
                                                            CONFIRM & START REORDER
                                                        </button>
                                                    </div>
                                                )}
                                            </React.Fragment>
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
                <div className="pos-modal-footer" style={{ padding: '24px 32px' }}>
                    <button
                        disabled={!selectedCustomer}
                        onClick={() => {
                            if (selectedCustomer) {
                                setCustomer(selectedCustomer);
                            }
                            onClose();
                        }}
                        className="pos-btn pos-btn-primary"
                        style={{ width: '100%', height: '64px', fontSize: '18px' }}
                    >
                        {selectedCustomer ? `CONFIRM ${selectedCustomer.name.toUpperCase()} & CLOSE` : 'SELECT CUSTOMER TO CONTINUE'}
                    </button>
                </div>
            </div>

            {/* ADD NEW CUSTOMER MODAL (Simple overlay) */}
            {isAddingNew && (
                <div className="pos-modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="pos-modal" style={{ width: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 900 }}>{isEditing ? 'Edit Customer Info' : 'New Customer'}</h3>
                            <button onClick={() => { setIsAddingNew(false); setIsEditing(false); }} className="pos-icon-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Customer Information */}
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block' }}>Full Name *</label>
                                <input
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

                            {/* Order Type Selection */}
                            <div style={{ marginTop: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '12px', display: 'block' }}>Order Type *</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setOrderType('Dine-In')}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: orderType === 'Dine-In' ? '2px solid var(--pos-action-primary)' : '2px solid var(--pos-border-subtle)',
                                            background: orderType === 'Dine-In' ? 'rgba(59, 130, 246, 0.1)' : 'var(--pos-bg-surface)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-scale"
                                    >
                                        <UtensilsCrossed size={24} color={orderType === 'Dine-In' ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)'} />
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: orderType === 'Dine-In' ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)' }}>Dine-In</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrderType('Pickup')}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: orderType === 'Pickup' ? '2px solid var(--pos-action-primary)' : '2px solid var(--pos-border-subtle)',
                                            background: orderType === 'Pickup' ? 'rgba(59, 130, 246, 0.1)' : 'var(--pos-bg-surface)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-scale"
                                    >
                                        <ShoppingBag size={24} color={orderType === 'Pickup' ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)'} />
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: orderType === 'Pickup' ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)' }}>Takeaway</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrderType('Delivery')}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: orderType === 'Delivery' ? '2px solid var(--pos-action-primary)' : '2px solid var(--pos-border-subtle)',
                                            background: orderType === 'Delivery' ? 'rgba(59, 130, 246, 0.1)' : 'var(--pos-bg-surface)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-scale"
                                    >
                                        <Truck size={24} color={orderType === 'Delivery' ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)'} />
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: orderType === 'Delivery' ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)' }}>Delivery</span>
                                    </button>
                                </div>
                            </div>

                            {/* Store Selector - Only show for Pickup/Takeaway */}
                            {orderType === 'Pickup' && (
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block' }}>Pickup Store *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Store size={18} color="var(--pos-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                                        <select
                                            required
                                            className="pos-input"
                                            value={selectedStore}
                                            onChange={e => setSelectedStore(e.target.value)}
                                            style={{ paddingLeft: '48px', appearance: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="">Select a store...</option>
                                            {mockStores.map(store => (
                                                <option key={store.id} value={store.id}>
                                                    {store.name} - {store.address}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronRight size={18} color="var(--pos-text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
                                    </div>
                                </div>
                            )}

                            {/* Address Field - Mandatory for all order types */}
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '8px', display: 'block' }}>
                                    {orderType === 'Delivery' ? 'Delivery Address *' : 'Customer Address *'}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} color="var(--pos-text-muted)" style={{ position: 'absolute', left: '16px', top: '16px', zIndex: 1 }} />
                                    <textarea
                                        required
                                        className="pos-input"
                                        placeholder={orderType === 'Delivery' ? 'Enter full delivery address with landmarks...' : 'Enter customer address...'}
                                        value={deliveryAddress}
                                        onChange={e => setLocalDeliveryAddress(e.target.value)}
                                        rows={3}
                                        style={{ paddingLeft: '48px', resize: 'vertical', minHeight: '80px' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="pos-btn pos-btn-primary"
                                style={{ marginTop: '12px' }}
                            >
                                {isEditing ? 'UPDATE CUSTOMER' : 'REGISTER CUSTOMER'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
