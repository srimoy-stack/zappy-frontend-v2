'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    PhoneIncoming, PhoneOff, FileText, CheckCircle2,
    ArrowRight, ChevronRight, ArrowLeft, Clock, MapPin
} from 'lucide-react';
import '../styles/pos-rush.css';

export const POSCallCenterScreen: React.FC = () => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<'INCOMING' | 'ACTIVE'>('INCOMING');
    const [activeCallTime, setActiveCallTime] = useState('04:12');

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (callStatus === 'ACTIVE') {
            timer = setInterval(() => {
                // Mock timer logic for demo purposes
                setActiveCallTime(prev => {
                    const [mins = 0, secs = 0] = prev.split(':').map(Number);
                    let newSecs = secs + 1;
                    let newMins = mins;
                    if (newSecs >= 60) {
                        newSecs = 0;
                        newMins += 1;
                    }
                    return `${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [callStatus]);

    return (
        <div className="pos-screen pos-layout">
            {/* LEFT: Queue & History */}
            <div className="pos-left-zone" style={{ width: '300px', borderRight: '1px solid var(--pos-border-subtle)', display: 'flex', flexDirection: 'column' }}>
                <div className="pos-header" style={{ padding: '20px', height: 'auto' }}>
                    <button onClick={() => router.back()} className="pos-btn-secondary" style={{ width: '40px', height: '40px', padding: 0 }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="pos-header-title" style={{ fontSize: '18px' }}>Agent Console</div>
                </div>

                <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
                    <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                        Active Queue
                    </div>

                    {[1, 2].map((i) => (
                        <div key={i} className="pos-card" style={{
                            marginBottom: '12px',
                            border: i === 1 && callStatus === 'INCOMING' ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                            background: i === 1 && callStatus === 'INCOMING' ? 'rgba(59, 130, 246, 0.1)' : 'var(--pos-bg-card)',
                            animation: i === 1 && callStatus === 'INCOMING' ? 'pulse 2s infinite' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '10px',
                                    background: i === 1 ? 'var(--pos-action-primary)' : 'rgba(255, 255, 255, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <PhoneIncoming size={20} color={i === 1 ? 'white' : 'var(--pos-text-muted)'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>+1 (555) 234-56...</div>
                                    <div style={{ fontSize: '11px', color: 'var(--pos-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={10} />
                                        Waiting: 0{i}:22
                                    </div>
                                </div>
                                <ChevronRight size={16} color="var(--pos-text-muted)" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CENTER: Call Management */}
            <div className="pos-right-zone" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div style={{ maxWidth: '600px', width: '100%' }}>
                    {callStatus === 'INCOMING' ? (
                        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                            <div style={{
                                width: '120px', height: '120px',
                                background: 'var(--pos-action-primary)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 32px',
                                boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)',
                                position: 'relative'
                            }}>
                                <PhoneIncoming size={64} color="white" />
                                <div style={{
                                    position: 'absolute', inset: -10, borderRadius: '50%',
                                    border: '2px solid var(--pos-action-primary)', opacity: 0.5,
                                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                                }} />
                            </div>

                            <h2 className="pos-title-lg" style={{ fontSize: '48px', marginBottom: '8px' }}>Incoming Call</h2>
                            <p style={{ fontSize: '16px', color: 'var(--pos-text-muted)', marginBottom: '48px', fontWeight: 600 }}>
                                Identify caller metadata before pickup
                            </p>

                            <div className="pos-card" style={{ padding: '32px', marginBottom: '48px', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{
                                        width: '80px', height: '80px',
                                        background: 'var(--pos-bg-hover)',
                                        borderRadius: '20px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '32px', fontWeight: 800, color: 'var(--pos-text-primary)'
                                    }}>
                                        S
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-action-primary)', marginBottom: '4px', textTransform: 'uppercase' }}>Probable Match</div>
                                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--pos-text-primary)', marginBottom: '4px', lineHeight: 1 }}>Sarah Google</div>
                                        <div style={{ fontSize: '16px', color: 'var(--pos-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={14} /> San Francisco, CA • +1 (415) 555-0192
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="pos-badge pos-badge-warning" style={{ fontSize: '12px', marginBottom: '8px' }}>GOLD TIER</div>
                                    <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 700 }}>FREQ: 8/mo</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setCallStatus('ACTIVE')}
                                    className="pos-btn pos-btn-primary"
                                    style={{ padding: '24px 48px', borderRadius: '100px', fontSize: '18px', gap: '12px' }}
                                >
                                    Accept Call <CheckCircle2 size={24} />
                                </button>
                                <button
                                    className="pos-btn pos-btn-danger"
                                    style={{ padding: '24px 48px', borderRadius: '100px', fontSize: '18px', gap: '12px' }}
                                >
                                    Reject <PhoneOff size={24} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ animation: 'slideUp 0.5s ease' }}>
                            {/* Active Call Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{
                                        width: '64px', height: '64px',
                                        background: 'var(--pos-action-primary)',
                                        borderRadius: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        <PhoneIncoming size={32} color="white" />
                                        <div style={{
                                            position: 'absolute', top: -4, right: -4,
                                            width: '12px', height: '12px',
                                            background: '#10B981', borderRadius: '50%',
                                            border: '2px solid var(--pos-bg-card)'
                                        }} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--pos-text-primary)', lineHeight: 1, marginBottom: '8px' }}>
                                            Sarah Google
                                        </h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
                                            Active Call • {activeCallTime}
                                        </div>
                                    </div>
                                </div>
                                <button className="pos-btn pos-btn-danger" style={{ padding: '12px 24px', fontSize: '14px' }}>
                                    Terminate Call
                                </button>
                            </div>

                            {/* Info & Notes */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={16} /> Disposition & Landmarks
                                </div>
                                <div className="pos-grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                                    <textarea
                                        className="pos-input"
                                        placeholder="Special Instructions..."
                                        style={{ height: '120px', resize: 'none' }}
                                    />
                                    <textarea
                                        className="pos-input"
                                        placeholder="Delivery Landmarks..."
                                        style={{ height: '120px', resize: 'none' }}
                                    />
                                </div>
                                <div className="pos-grid-4" style={{ gap: '12px' }}>
                                    {['Sale Finalized', 'Inquiry Only', 'Customer Support', 'Dropped Call'].map(code => (
                                        <button
                                            key={code}
                                            className="pos-btn-secondary"
                                            style={{ fontSize: '12px', padding: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        >
                                            {code}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/pos/menu')}
                                className="pos-btn pos-btn-primary"
                                style={{ width: '100%', height: '72px', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                            >
                                Start Order for Customer <ArrowRight size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; border-color: var(--pos-action-primary); }
                    50% { opacity: 0.7; border-color: transparent; }
                    100% { opacity: 1; border-color: var(--pos-action-primary); }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default POSCallCenterScreen;
