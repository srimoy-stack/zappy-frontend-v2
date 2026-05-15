'use client';

import React from 'react';
import { usePOS } from '../context/POSContext';
import { RefreshCw, Download, Database, ShieldCheck } from 'lucide-react';

export const SyncingLoader: React.FC = () => {
    const { isSyncing } = usePOS();

    if (!isSyncing) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '32px'
        }}>
            {/* Spinning Logo Container */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '40px',
                    background: 'white',
                    border: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                    animation: 'pulse 2s infinite'
                }}>
                    <RefreshCw
                        size={48}
                        color="var(--pos-action-primary)"
                        style={{ animation: 'spin 2s linear infinite' }}
                    />
                </div>

                {/* Orbital dots */}
                <div className="sync-orbit" style={{
                    position: 'absolute',
                    inset: '-20px',
                    border: '2px dotted var(--pos-border-subtle)',
                    borderRadius: '50%',
                    animation: 'spin 15s linear infinite'
                }} />
            </div>

            <div style={{ textAlign: 'center' }}>
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: 'var(--pos-text-primary)',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em'
                }}>
                    Synchronizing System
                </h2>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    color: 'var(--pos-text-secondary)',
                    fontSize: '14px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={14} className="text-brand" /> CATALOG
                    </span>
                    <span style={{ width: '4px', height: '4px', background: 'var(--pos-border-subtle)', borderRadius: '50%' }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={14} className="text-brand" /> SECURITY
                    </span>
                    <span style={{ width: '4px', height: '4px', background: 'var(--pos-border-subtle)', borderRadius: '50%' }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={14} className="text-brand" /> ASSETS
                    </span>
                </div>
            </div>

            {/* Progress Track */}
            <div style={{
                width: '320px',
                height: '8px',
                background: 'var(--pos-border-subtle)',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid white'
            }}>
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '40%',
                    background: 'var(--pos-action-primary)',
                    borderRadius: '4px',
                    boxShadow: '0 0 20px rgba(31, 164, 169, 0.4)',
                    animation: 'syncProgress 2s ease-in-out infinite'
                }} />
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes syncProgress {
                    0% { left: -40%; width: 40%; }
                    50% { left: 30%; width: 60%; }
                    100% { left: 100%; width: 40%; }
                }
            `}</style>
        </div>
    );
};
