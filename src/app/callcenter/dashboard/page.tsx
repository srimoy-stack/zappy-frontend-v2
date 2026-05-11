'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    Plus,
    Phone,
    PhoneIncoming,
    PhoneMissed,
    Clock,
    User,
    ChevronRight,
    LogOut,
    X,
    MessageSquare
} from 'lucide-react';

export default function CallCenterDashboard() {
    const router = useRouter();
    const { session, logout, incomingCall, setIncomingCall, clearCart, setCustomer, setChannel } = usePOS();
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return () => clearInterval(timer);
    }, []);

    const handleNewOrder = () => {
        clearCart();
        setCustomer(null);
        setChannel('Phone Order');
        router.push('/callcenter/customer-lookup');
    };

    if (!session) return null;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
            {/* TOP HEADER */}
            <header style={{
                height: '64px',
                background: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                color: 'white',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={20} color="#3b82f6" />
                        <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '0.05em' }}>CALL CENTER</span>
                    </div>
                    <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
                        {session.user.name} • Operator ID: {session.user.id.substring(0, 6)}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'monospace' }}>
                        {currentTime}
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={16} />
                        LOGOUT
                    </button>
                </div>
            </header>

            {/* INCOMING CALL BANNER (CONDITIONAL) */}
            {incomingCall && (
                <div style={{
                    background: '#3b82f6',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                    animation: 'slideIn 0.3s ease-out',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'pulse 1.5s infinite'
                        }}>
                            <PhoneIncoming size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>{incomingCall.number}</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
                                {incomingCall.caller} • Past Orders: 5 • NY, New York
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => {
                                setChannel('Phone Order');
                                router.push('/callcenter/customer-lookup');
                            }}
                            style={{
                                padding: '10px 20px',
                                background: 'white',
                                color: '#3b82f6',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            CREATE NEW ORDER
                        </button>
                        <button
                            style={{
                                padding: '10px 20px',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            ATTACH TO EXISTING
                        </button>
                        <button
                            onClick={() => setIncomingCall(null)}
                            style={{
                                padding: '10px',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* LEFT PANEL: CALL QUEUE */}
                <aside style={{
                    width: '320px',
                    background: 'white',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Call Management
                        </h2>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {/* INCOMING QUEUE */}
                        <div style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>QUEUED CALLS (2)</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[1, 2].map(i => (
                                    <div key={i} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 800, color: '#334155' }}>+1 (555) 012-{i}00</span>
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>2m wait</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Region: Northeast</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MISSED CALLS */}
                        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <PhoneMissed size={16} color="#ef4444" />
                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444' }}>MISSED CALLS (5)</span>
                            </div>
                            <div style={{ opacity: 0.6 }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>+1 (555) 999-00{i}</span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>1h ago</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* CENTER PANEL: ACTION CENTER */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    {/* PRIMARY CTA */}
                    <button
                        onClick={handleNewOrder}
                        style={{
                            width: '100%',
                            height: '120px',
                            background: '#3b82f6',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '24px',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                            marginBottom: '32px'
                        }}
                    >
                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={32} strokeWidth={3} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>NEW ORDER ENTRY</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.8, marginTop: '4px' }}>F1 or Alt+N to start</div>
                        </div>
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* OPEN ORDERS */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Clock size={20} color="#3b82f6" />
                                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase' }}>Open Orders</h3>
                                </div>
                                <span style={{ background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>12</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>#ORD-990{i}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>James Wilson • Pickup</div>
                                        </div>
                                        <ChevronRight size={18} color="#94a3b8" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* HELD ORDERS */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Clock size={20} color="#f59e0b" />
                                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase' }}>Held Orders</h3>
                                </div>
                                <span style={{ background: '#f59e0b', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>4</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[1, 2].map(i => (
                                    <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#b45309' }}>#HELD-10{i}</div>
                                            <div style={{ fontSize: '12px', color: '#b45309', opacity: 0.8 }}>Pending Confirmation • 15:20</div>
                                        </div>
                                        <ChevronRight size={18} color="#b45309" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                {/* RIGHT PANEL: CALLER PREVIEW */}
                <aside style={{
                    width: '360px',
                    background: 'white',
                    borderLeft: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' }}>Active Intel</h2>
                    </div>

                    {incomingCall ? (
                        <div style={{ flex: 1, padding: '24px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: '#f1f5f9',
                                    margin: '0 auto 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <User size={40} color="#94a3b8" />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{incomingCall.caller}</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{incomingCall.number}</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>History</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 800 }}>5</div>
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>TOTAL ORDERS</div>
                                        </div>
                                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 800 }}>$142</div>
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>LIFETIME VALUE</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MessageSquare size={12} /> Operator Notes
                                    </div>
                                    <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fef3c7', fontSize: '13px', color: '#92400e', fontWeight: 600, lineHeight: 1.5 }}>
                                        Prefers thin crust. Always forgets to ask for extra napkins.
                                    </div>
                                </div>

                                <button style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#f1f5f9',
                                    color: '#1e293b',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}>
                                    VIEW FULL PROFILE
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', opacity: 0.4 }}>
                            <Phone size={48} color="#94a3b8" strokeWidth={1.5} />
                            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                                Waiting for connection...
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                }
                @keyframes slideIn {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
