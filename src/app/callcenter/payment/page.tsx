'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    CreditCard,
    Banknote,
    Wallet,
    Gift,
    ArrowLeft,
    ShieldCheck,
    Loader2,
    MapPin,
    Phone,
    User,
    Info,
    CheckCircle2
} from 'lucide-react';

export default function CallCenterPaymentPage() {
    const router = useRouter();
    const {
        cartTotal,
        clearCart,
        selectedCustomer,
        session,
        addOrderToCustomerHistory,
        cart
    } = usePOS();

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'gift' | 'cod' | null>(null);
    const [state, setState] = useState<'SELECTING' | 'ENTERING' | 'PROCESSING' | 'COMPLETED'>('SELECTING');

    // Card Form
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    // Mock calculations
    const deliveryFee = session?.channel === 'Delivery' ? 5.00 : 0;
    const tax = cartTotal * 0.08;
    const total = cartTotal + deliveryFee + tax;

    useEffect(() => {
        if (!selectedCustomer || cart.length === 0) {
            router.push('/callcenter/menu');
        }
    }, [selectedCustomer, cart, router]);

    const handleProcessPayment = async () => {
        setState('PROCESSING');
        // Simulate processing
        await new Promise(r => setTimeout(r, 2000));

        const orderId = `CALL-${Math.floor(100000 + Math.random() * 900000)}`;

        // Save to history
        if (selectedCustomer) {
            addOrderToCustomerHistory(selectedCustomer.id, {
                id: orderId,
                date: new Date().toISOString().split('T')[0],
                amount: total,
                items: cart.map(i => `${i.quantity}x ${i.name}`).join(', ')
            });
        }

        clearCart();
        setState('COMPLETED');
        setTimeout(() => {
            router.push(`/callcenter/order-success/${orderId}`);
        }, 1500);
    };

    if (!selectedCustomer) return null;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
            {/* Header */}
            <header style={{
                padding: '24px 40px',
                background: '#1e293b',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: '24px'
            }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Secure Checkout</h1>
                    <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Final step to confirm order for {selectedCustomer.name}</p>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left: Payment Method & Details */}
                <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }} className="pos-scroll">
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        {state === 'PROCESSING' ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '100px 0' }}>
                                <Loader2 size={80} className="spin" color="#3b82f6" />
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Processing Payment</h2>
                                    <p style={{ fontSize: '18px', color: '#94a3b8' }}>Securing transaction and routing to kitchen...</p>
                                </div>
                            </div>
                        ) : state === 'COMPLETED' ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '100px 0' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: '#10b981',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CheckCircle2 color="white" size={60} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Payment Successful</h2>
                                    <p style={{ fontSize: '18px', color: '#94a3b8' }}>Redirecting to confirmation screen...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '13px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Select Payment Method</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
                                    {[
                                        { id: 'card', label: 'Manual Card Entry', icon: CreditCard },
                                        { id: 'wallet', label: 'E-Wallet / App', icon: Wallet },
                                        { id: 'gift', label: 'Gift Card / Voucher', icon: Gift },
                                        { id: 'cod', label: 'Cash on Delivery', icon: Banknote }
                                    ].map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setPaymentMethod(m.id as any)}
                                            style={{
                                                padding: '24px',
                                                background: paymentMethod === m.id ? '#1d4ed8' : '#1e293b',
                                                border: paymentMethod === m.id ? '2px solid #3b82f6' : '1px solid #334155',
                                                borderRadius: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '20px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <div style={{
                                                width: '52px',
                                                height: '52px',
                                                background: paymentMethod === m.id ? '#3b82f6' : '#334155',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                <m.icon size={28} />
                                            </div>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>{m.label}</div>
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'card' && (
                                    <div style={{
                                        animation: 'posFadeInUp 0.3s ease-out',
                                        background: '#1e293b',
                                        padding: '40px',
                                        borderRadius: '32px',
                                        border: '1px solid #334155'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShieldCheck color="#3b82f6" size={24} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>Secure Card Input</h3>
                                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>PCI Compliant • No full card storage</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Cardholder Name</label>
                                                <input
                                                    className="pos-input"
                                                    style={{ width: '100%', height: '56px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 16px', color: 'white', fontSize: '16px', fontWeight: 700 }}
                                                    placeholder="e.g. HARVEY SPECTER"
                                                    value={cardData.name}
                                                    onChange={e => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Card Number</label>
                                                <input
                                                    className="pos-input"
                                                    style={{ width: '100%', height: '56px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 16px', color: 'white', fontSize: '18px', fontWeight: 800, letterSpacing: '0.1em' }}
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    value={cardData.number}
                                                    onChange={e => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) })}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div>
                                                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Expiry (MM/YY)</label>
                                                    <input
                                                        className="pos-input"
                                                        style={{ width: '100%', height: '56px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 16px', color: 'white', fontSize: '16px', fontWeight: 800 }}
                                                        placeholder="MM/YY"
                                                        value={cardData.expiry}
                                                        onChange={e => setCardData({ ...cardData, expiry: e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5) })}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>CVV</label>
                                                    <input
                                                        type="password"
                                                        className="pos-input"
                                                        style={{ width: '100%', height: '56px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 16px', color: 'white', fontSize: '16px', fontWeight: 800 }}
                                                        placeholder="***"
                                                        value={cardData.cvv}
                                                        onChange={e => setCardData({ ...cardData, cvv: e.target.value.slice(0, 4) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod && paymentMethod !== 'card' && (
                                    <div style={{
                                        animation: 'posFadeInUp 0.3s ease-out',
                                        background: '#1e293b',
                                        padding: '40px',
                                        borderRadius: '32px',
                                        border: '1px solid #334155',
                                        textAlign: 'center'
                                    }}>
                                        <Info size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
                                        <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>Confirm {paymentMethod.toUpperCase()}</h3>
                                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '8px 0 0 0' }}>Proceed to authorize transaction for ${total.toFixed(2)}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div style={{ width: '450px', background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }} className="pos-scroll">
                        <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', marginBottom: '24px' }}>Order Summary</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{ fontWeight: 900, color: '#3b82f6' }}>{item.quantity}x</span>
                                            <span style={{ fontWeight: 800, color: 'white' }}>{item.name}</span>
                                        </div>
                                        {item.variants.length > 0 && (
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                {item.variants.map(v => v.name).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontWeight: 800, color: 'white' }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '2px dashed #334155', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 700 }}>
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 700 }}>
                                <span>Tax (8%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            {deliveryFee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 700 }}>
                                    <span>Delivery Fee</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                color: 'white',
                                fontSize: '24px',
                                fontWeight: 900,
                                marginTop: '12px',
                                padding: '16px',
                                background: '#0f172a',
                                borderRadius: '16px'
                            }}>
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>Order Profile</h3>
                            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <User size={16} color="#3b82f6" />
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{selectedCustomer.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Phone size={16} color="#3b82f6" />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>{selectedCustomer.phone}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <MapPin size={16} color="#3b82f6" style={{ marginTop: '2px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', lineHeight: 1.4 }}>
                                        {session?.deliveryAddress?.text || session?.store?.address || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '32px', background: '#0f172a', borderTop: '1px solid #334155' }}>
                        <button
                            disabled={!paymentMethod || state !== 'SELECTING'}
                            onClick={handleProcessPayment}
                            style={{
                                width: '100%',
                                height: '72px',
                                background: paymentMethod ? '#10b981' : '#334155',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '20px',
                                fontWeight: 900,
                                cursor: paymentMethod ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                boxShadow: paymentMethod ? '0 12px 24px -10px rgba(16, 185, 129, 0.5)' : 'none'
                            }}
                        >
                            {paymentMethod === 'cod' ? 'CONFIRM ORDER (COD)' : `PAY $${total.toFixed(2)} NOW`}
                        </button>
                    </div>
                </div>
            </div>

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
                @keyframes posFadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
