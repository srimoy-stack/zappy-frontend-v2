'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    Search,
    UserPlus,
    Phone,
    History,
    ChevronRight,
    MapPin,
    User,
    X,
    RotateCcw
} from 'lucide-react';
import { POSCustomer } from '@/modules/pos/mock/posData';

export default function CustomerLookupPage() {
    const router = useRouter();
    const {
        customers,
        setCustomer,
        incomingCall,
        selectedCustomer: currentCustomer
    } = usePOS();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(currentCustomer?.id || null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // New Customer Form
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    // Handle auto-fill from incoming call
    useEffect(() => {
        if (incomingCall?.number && !searchQuery) {
            setSearchQuery(incomingCall.number);
        }
    }, [incomingCall]);

    const filteredCustomers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query) return customers.slice(0, 10); // Show recent or first few
        return customers.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.phone.includes(query) ||
            c.email?.toLowerCase().includes(query)
        );
    }, [searchQuery, customers]);

    const activeCustomer = useMemo(() =>
        customers.find(c => c.id === selectedId),
        [selectedId, customers]);

    const handleSelect = (customer: POSCustomer) => {
        setSelectedId(customer.id);
    };

    const handleConfirm = () => {
        if (activeCustomer) {
            setCustomer(activeCustomer);
            router.push('/callcenter/fulfillment');
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const customer: POSCustomer = {
            id: `C${Math.floor(Math.random() * 90000) + 10000}`,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email,
            loyaltyPoints: 0,
            notes: 'Registered via Call Center',
            addresses: [{
                id: `addr-${Date.now()}`,
                label: 'Home',
                type: 'HOME',
                street: newCustomer.address,
                text: newCustomer.address,
                isDefault: true
            }],
            recentOrders: []
        };

        setCustomer(customer);
        setSelectedId(customer.id);
        setShowRegisterModal(false);
        // Maybe auto-confirm or stay on page to show profile? 
        // User requested "Customer must be selected before menu access", confirming selection is better.
        router.push('/callcenter/fulfillment');
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
            {/* Header */}
            <header style={{
                padding: '24px 40px',
                background: '#1e293b',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#3b82f6',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Search color="white" size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Customer Lookup</h1>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Identify caller before proceeding to order</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowRegisterModal(true)}
                    style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        border: '1px solid #3b82f6',
                        color: '#3b82f6',
                        borderRadius: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}
                >
                    <UserPlus size={20} /> NEW CUSTOMER
                </button>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Search & List Panel */}
                <div style={{
                    width: '450px',
                    borderRight: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#0f172a'
                }}>
                    <div style={{ padding: '32px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} color="#64748b" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search Name or Phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '64px',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '16px',
                                    paddingLeft: '56px',
                                    color: 'white',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    outline: 'none'
                                }}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }} className="pos-scroll">
                        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                            <button
                                key={customer.id}
                                onClick={() => handleSelect(customer)}
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    background: selectedId === customer.id ? '#1d4ed8' : '#1e293b',
                                    borderRadius: '16px',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    marginBottom: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: selectedId === customer.id ? '#3b82f6' : '#334155',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 800
                                }}>
                                    {customer.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{customer.name}</div>
                                    <div style={{ fontSize: '14px', color: selectedId === customer.id ? '#bfdbfe' : '#94a3b8' }}>{customer.phone}</div>
                                </div>
                                {selectedId === customer.id && <ChevronRight color="white" />}
                            </button>
                        )) : (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <p style={{ color: '#64748b' }}>No customers found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Preview Panel */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a', padding: '40px' }} className="pos-scroll">
                    {activeCustomer ? (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            {/* Profile Card */}
                            <div style={{
                                background: '#1e293b',
                                borderRadius: '24px',
                                padding: '40px',
                                border: '1px solid #334155',
                                marginBottom: '40px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'white', margin: '0 0 8px 0' }}>{activeCustomer.name}</h2>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '16px' }}>
                                                <Phone size={18} /> {activeCustomer.phone}
                                            </div>
                                            {activeCustomer.email && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '16px' }}>
                                                    <User size={18} /> {activeCustomer.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            background: '#1d4ed8',
                                            color: '#bfdbfe',
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}>
                                            Loyalty Member
                                        </span>
                                        <div style={{ marginTop: '12px', color: '#fbbf24', fontSize: '24px', fontWeight: 900 }}>
                                            {activeCustomer.loyaltyPoints} <span style={{ fontSize: '14px', color: '#94a3b8' }}>POINTS</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    {/* Addresses */}
                                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={16} /> Saved Addresses
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {activeCustomer.addresses.map(addr => (
                                                <div key={addr.id} style={{ padding: '12px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#3b82f6', marginBottom: '4px' }}>{addr.label}</div>
                                                    <div style={{ fontSize: '14px', color: 'white' }}>{addr.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>Operator Notes</h3>
                                        <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                                            {activeCustomer.notes || 'No notes available for this customer.'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <History size={20} color="#3b82f6" /> Past 5 Orders
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {activeCustomer.recentOrders.length > 0 ? activeCustomer.recentOrders.map(order => (
                                        <div key={order.id} style={{
                                            background: '#1e293b',
                                            padding: '24px',
                                            borderRadius: '20px',
                                            border: '1px solid #334155',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                                    <span style={{ color: 'white', fontWeight: 900, fontSize: '18px' }}>{order.id}</span>
                                                    <span style={{ color: '#64748b', fontSize: '14px' }}>{order.date}</span>
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: '14px' }}>{order.items}</div>
                                                <div style={{ color: '#3b82f6', fontWeight: 800, marginTop: '8px' }}>${order.amount.toFixed(2)}</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setCustomer(activeCustomer);
                                                    router.push('/callcenter/menu');
                                                }}
                                                style={{
                                                    padding: '12px 20px',
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    border: '1px solid #3b82f6',
                                                    color: '#3b82f6',
                                                    borderRadius: '12px',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <RotateCcw size={16} /> REORDER
                                            </button>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '40px', textAlign: 'center', background: '#1e293b', borderRadius: '24px', border: '1px dashed #334155' }}>
                                            <p style={{ color: '#64748b' }}>No order history found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                            <User size={80} />
                            <h3 style={{ fontSize: '24px', fontWeight: 900, marginTop: '24px' }}>Select Customer to View Profile</h3>
                            <p style={{ fontSize: '16px', color: '#64748b' }}>Search or select from the list on the left</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div style={{
                padding: '24px 40px',
                background: '#1e293b',
                borderTop: '1px solid #334155',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                <button
                    disabled={!activeCustomer}
                    onClick={handleConfirm}
                    style={{
                        padding: '16px 48px',
                        background: activeCustomer ? '#3b82f6' : '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '18px',
                        fontWeight: 900,
                        cursor: activeCustomer ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                    }}
                >
                    {activeCustomer ? `USE ${activeCustomer.name.toUpperCase()} & CONTINUE` : 'CONFIRM CUSTOMER'}
                    <ChevronRight size={24} strokeWidth={3} />
                </button>
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '600px',
                        background: '#1e293b',
                        borderRadius: '32px',
                        border: '1px solid #334155',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '32px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Register New Customer</h2>
                            <button onClick={() => setShowRegisterModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleRegister} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Full Name *</label>
                                <input
                                    required
                                    className="pos-input"
                                    style={{ width: '100%', height: '56px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 16px', color: 'white' }}
                                    placeholder="Enter customer name..."
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Phone Number *</label>
                                <input
                                    required
                                    className="pos-input"
                                    style={{ width: '100%', height: '56px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 16px', color: 'white' }}
                                    placeholder="+1 (555) 000-0000"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="pos-input"
                                    style={{ width: '100%', height: '56px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 16px', color: 'white' }}
                                    placeholder="customer@email.com"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Primary Delivery Address</label>
                                <textarea
                                    className="pos-input"
                                    style={{ width: '100%', height: '100px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', color: 'white', resize: 'none' }}
                                    placeholder="Full street address, city, zip..."
                                    value={newCustomer.address}
                                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                <button type="button" onClick={() => setShowRegisterModal(false)} style={{ flex: 1, padding: '16px', background: '#334155', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>CANCEL</button>
                                <button type="submit" style={{ flex: 1, padding: '16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' }}>REGISTER & CONTINUE</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .pos-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .pos-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .pos-scroll::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .pos-input:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
                }
            `}</style>
        </div>
    );
}
