'use client';

import { useRouter, useParams } from 'next/navigation';
import {
    CheckCircle2,
    Printer,
    Plus,
    Home,
    ShoppingBag,
    Clock,
    ArrowRight
} from 'lucide-react';
import { usePOS } from '@/modules/pos/context/POSContext';

export default function OrderSuccessPage() {
    const router = useRouter();
    const params = useParams();
    const { session } = usePOS();
    const orderId = params.order_id;

    const eta = session?.channel === 'Delivery' ? '35-45 mins' : '15-20 mins';

    return (
        <div style={{
            height: '100vh',
            background: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
        }}>
            <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 40px',
                    boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.4)'
                }}>
                    <CheckCircle2 color="white" size={64} />
                </div>

                <h1 style={{ fontSize: '48px', fontWeight: 950, color: 'white', margin: '0 0 16px 0' }}>Order Confirmed!</h1>
                <p style={{ fontSize: '20px', color: '#94a3b8', margin: '0 0 48px 0' }}>
                    Order <span style={{ color: '#3b82f6', fontWeight: 900 }}>#{orderId}</span> has been routed to the kitchen.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
                    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>
                            <ShoppingBag size={16} /> Fulfillment
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>{session?.channel || 'Order'}</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>
                            <Clock size={16} /> Estimated Time
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>{eta}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button
                        onClick={() => router.push('/callcenter/customer-lookup')}
                        style={{
                            width: '100%',
                            height: '72px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '20px',
                            fontWeight: 900,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: '0 12px 24px -10px rgba(59, 130, 246, 0.5)'
                        }}
                    >
                        <Plus size={24} strokeWidth={3} /> START NEW ORDER
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <button
                            onClick={() => window.print()}
                            style={{
                                height: '64px',
                                background: '#1e293b',
                                color: '#94a3b8',
                                border: '1px solid #334155',
                                borderRadius: '20px',
                                fontSize: '16px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Printer size={20} /> PRINT RECEIPT
                        </button>
                        <button
                            onClick={() => router.push('/callcenter/dashboard')}
                            style={{
                                height: '64px',
                                background: '#1e293b',
                                color: '#94a3b8',
                                border: '1px solid #334155',
                                borderRadius: '20px',
                                fontSize: '16px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Home size={20} /> DASHBOARD
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '64px', fontSize: '14px', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    STAY ON CALL FOR CUSTOMER FEEDBACK <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
}
