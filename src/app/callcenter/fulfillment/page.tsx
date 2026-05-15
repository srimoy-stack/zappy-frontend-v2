'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    Truck,
    ShoppingBag,
    ChevronRight,
    MapPin,
    Store,
    Clock,
    ShieldCheck,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { mockStores } from '@/modules/pos/mock/posData';

export default function FulfillmentPage() {
    const router = useRouter();
    const {
        selectedCustomer,
        setChannel,
        setStore,
        setDeliveryAddress,
        session
    } = usePOS();

    const [fulfillment, setFulfillment] = useState<'Pickup' | 'Delivery' | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        selectedCustomer?.addresses.find(a => a.isDefault)?.id || (selectedCustomer?.addresses[0]?.id || null)
    );
    const [selectedStoreId, setSelectedStoreId] = useState<string>(session?.store?.id || mockStores[0]?.id || '');

    // Mock calculations
    const deliveryFee = 5.00;
    const deliveryETA = '35-45 mins';
    const pickupETA = '15-20 mins';

    const handleConfirm = () => {
        if (!fulfillment) return;

        if (fulfillment === 'Delivery') {
            const addr = selectedCustomer?.addresses.find(a => a.id === selectedAddressId);
            if (!addr) return;
            setChannel('Delivery');
            setDeliveryAddress({
                id: addr.id,
                text: addr.text,
                label: addr.label
            });
        } else {
            const store = mockStores.find(s => s.id === selectedStoreId);
            if (!store) return;
            setChannel('Pickup');
            setStore(store);
        }

        router.push('/callcenter/menu');
    };

    if (!selectedCustomer) {
        router.push('/callcenter/customer-lookup');
        return null;
    }

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
                    <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Fulfillment Details</h1>
                    <p style={{ fontSize: '14px', color: '#3b82f6', margin: 0 }}>
                        Setting up order for <span style={{ fontWeight: 800 }}>{selectedCustomer.name}</span>
                    </p>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '40px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px' }}>

                    {/* Left: Fulfillment Method Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose Method</h2>

                        <button
                            onClick={() => setFulfillment('Delivery')}
                            style={{
                                padding: '32px',
                                background: fulfillment === 'Delivery' ? '#1d4ed8' : '#1e293b',
                                border: fulfillment === 'Delivery' ? '2px solid #3b82f6' : '1px solid #334155',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: fulfillment === 'Delivery' ? '#3b82f6' : '#334155',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <Truck size={32} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>DELIVERY</div>
                                <div style={{ fontSize: '14px', color: fulfillment === 'Delivery' ? '#bfdbfe' : '#94a3b8' }}>To customer address</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setFulfillment('Pickup')}
                            style={{
                                padding: '32px',
                                background: fulfillment === 'Pickup' ? '#1d4ed8' : '#1e293b',
                                border: fulfillment === 'Pickup' ? '2px solid #3b82f6' : '1px solid #334155',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: fulfillment === 'Pickup' ? '#3b82f6' : '#334155',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <ShoppingBag size={32} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>PICKUP</div>
                                <div style={{ fontSize: '14px', color: fulfillment === 'Pickup' ? '#bfdbfe' : '#94a3b8' }}>Customer collects from store</div>
                            </div>
                        </button>
                    </div>

                    {/* Right: Method Configuration */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '32px',
                        border: '1px solid #334155',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {!fulfillment ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155', padding: '60px', textAlign: 'center' }}>
                                <AlertCircle size={64} style={{ marginBottom: '24px' }} />
                                <h3 style={{ fontSize: '24px', fontWeight: 900 }}>Select Fulfillment Method</h3>
                                <p style={{ fontSize: '16px', color: '#64748b' }}>Please choose between Delivery and Pickup to continue</p>
                            </div>
                        ) : fulfillment === 'Delivery' ? (
                            <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>Confirm Address</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '14px', fontWeight: 700 }}>
                                        <ShieldCheck size={18} /> IN DELIVERY ZONE
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                                    {selectedCustomer.addresses.map(addr => (
                                        <button
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            style={{
                                                padding: '24px',
                                                background: selectedAddressId === addr.id ? '#0f172a' : 'transparent',
                                                border: selectedAddressId === addr.id ? '2px solid #3b82f6' : '1px solid #334155',
                                                borderRadius: '20px',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '20px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                background: selectedAddressId === addr.id ? 'rgba(59, 130, 246, 0.1)' : '#1e293b',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: selectedAddressId === addr.id ? '#3b82f6' : '#64748b'
                                            }}>
                                                <MapPin size={22} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 900, color: selectedAddressId === addr.id ? '#3b82f6' : '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>{addr.label}</div>
                                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{addr.text}</div>
                                            </div>
                                            {selectedAddressId === addr.id && (
                                                <div style={{ width: '24px', height: '24px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <ChevronRight size={16} color="white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Delivery Fee</div>
                                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>${deliveryFee.toFixed(2)}</div>
                                    </div>
                                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>ETA</div>
                                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>{deliveryETA}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', marginBottom: '32px' }}>Pick-up Location</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                                    {mockStores.map(store => (
                                        <button
                                            key={store.id}
                                            onClick={() => setSelectedStoreId(store.id)}
                                            style={{
                                                padding: '24px',
                                                background: selectedStoreId === store.id ? '#0f172a' : 'transparent',
                                                border: selectedStoreId === store.id ? '2px solid #3b82f6' : '1px solid #334155',
                                                borderRadius: '20px',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '20px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                background: selectedStoreId === store.id ? 'rgba(59, 130, 246, 0.1)' : '#1e293b',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: selectedStoreId === store.id ? '#3b82f6' : '#64748b'
                                            }}>
                                                <Store size={22} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{store.name}</div>
                                                <div style={{ fontSize: '14px', color: '#94a3b8' }}>{store.address}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div style={{ background: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Clock size={24} color="#3b82f6" />
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Available Pickup Time</div>
                                            <div style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>Ready in {pickupETA}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Footer */}
            <footer style={{
                padding: '24px 40px',
                background: '#1e293b',
                borderTop: '1px solid #334155',
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <button
                    disabled={!fulfillment || (fulfillment === 'Delivery' && !selectedAddressId)}
                    onClick={handleConfirm}
                    style={{
                        padding: '16px 48px',
                        background: fulfillment ? '#3b82f6' : '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '18px',
                        fontWeight: 900,
                        cursor: fulfillment ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    PROCEED TO MENU
                    <ChevronRight size={24} strokeWidth={3} />
                </button>
            </footer>

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
            `}</style>
        </div>
    );
}
