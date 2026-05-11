'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { Banknote, Clock, FileText, ChevronRight, Lock } from 'lucide-react';

export const ShiftOpeningModal: React.FC = () => {
    const { session, startShift, isSyncing } = usePOS();
    const [openingCash, setOpeningCash] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [currentTime, setCurrentTime] = useState<string | null>(null);

    // Update clock every minute
    useEffect(() => {
        setCurrentTime(new Date().toLocaleString());
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleString());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    if (isSyncing || !session || session.posType === 'CALL_CENTER' || session.shift || !session.store) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cash = parseFloat(openingCash);
        if (isNaN(cash) || cash < 0) return;
        startShift(cash, notes);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
                background: 'var(--pos-bg-surface)',
                borderRadius: '32px',
                border: '1px solid var(--pos-border-subtle)',
                boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.12)',
                overflow: 'hidden',
                animation: 'posFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '40px 40px 32px',
                    textAlign: 'center',
                    borderBottom: '1px solid var(--pos-border-subtle)'
                }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        background: 'var(--pos-action-primary)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: 'white',
                        boxShadow: '0 12px 24px rgba(31, 164, 169, 0.3)'
                    }}>
                        <Lock size={32} strokeWidth={2.5} />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                        Shift Opening
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                        Terminal readiness check for <span className="text-brand">{session.store.name}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                        {/* Date/Time (Read-only) */}
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px' }}>
                                System Handshake Time
                            </label>
                            <div style={{
                                width: '100%',
                                height: '60px',
                                background: 'var(--pos-bg-main)',
                                border: '1px solid var(--pos-border-subtle)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 20px',
                                gap: '12px',
                                color: 'var(--pos-text-primary)',
                                fontSize: '16px',
                                fontWeight: 700
                            }}>
                                <Clock size={18} className="text-brand" />
                                {currentTime || 'Validating...'}
                            </div>
                        </div>

                        {/* Opening Cash Amount */}
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px' }}>
                                Initial Float (Cash) *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--pos-text-muted)',
                                    pointerEvents: 'none'
                                }}>
                                    <Banknote size={20} />
                                </div>
                                <input
                                    type="number"
                                    required
                                    value={openingCash}
                                    onChange={(e) => setOpeningCash(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    autoFocus
                                    className="pos-input"
                                    style={{
                                        width: '100%',
                                        height: '60px',
                                        padding: '0 20px 0 56px',
                                        background: 'white',
                                        border: '2px solid var(--pos-border-subtle)',
                                        borderRadius: '16px',
                                        fontSize: '20px',
                                        fontWeight: 800,
                                        color: 'var(--pos-text-primary)',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Notes (Optional) */}
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px' }}>
                                Personnel Notes (Optional)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '20px',
                                    color: 'var(--pos-text-muted)',
                                    pointerEvents: 'none'
                                }}>
                                    <FileText size={20} />
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any shift notes here..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '18px 20px 18px 56px',
                                        background: 'white',
                                        border: '2px solid var(--pos-border-subtle)',
                                        borderRadius: '16px',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        color: 'var(--pos-text-primary)',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                height: '64px',
                                background: 'var(--pos-action-primary)',
                                color: 'white',
                                borderRadius: '18px',
                                fontSize: '16px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                boxShadow: '0 12px 24px rgba(31, 164, 169, 0.2)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Open Shift Registry <ChevronRight size={20} />
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                @keyframes posFadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .pos-input:focus {
                    border-color: var(--pos-action-primary) !important;
                    box-shadow: 0 0 0 4px rgba(31, 164, 169, 0.1);
                }
            `}</style>
        </div>
    );
};
