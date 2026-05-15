'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Construction } from 'lucide-react';

export const POSPlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
    const router = useRouter();

    return (
        <div className="pos-screen" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: 'var(--pos-bg-surface)'
        }}>
            <div style={{
                width: '120px',
                height: '120px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                marginBottom: '32px',
                animation: 'posBounce 2s infinite'
            }}>
                <Construction size={56} />
            </div>

            <h1 style={{
                fontSize: '48px',
                fontWeight: 900,
                color: 'white',
                marginBottom: '16px',
                letterSpacing: '-0.02em'
            }}>
                {title || 'Under Construction'}
            </h1>

            <p style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: '500px',
                margin: '0 auto 40px',
                fontWeight: 600,
                lineHeight: 1.6
            }}>
                This section of the POS system is currently being developed. Please check back soon or navigate to another area.
            </p>

            <button
                onClick={() => router.push('/pos/dashboard')}
                className="pos-btn pos-btn-primary"
                style={{
                    padding: '0 48px',
                    height: '72px',
                    fontSize: '18px',
                    borderRadius: '20px'
                }}
            >
                <ArrowLeft size={22} style={{ marginRight: '12px' }} />
                BACK TO DASHBOARD
            </button>

            <style>{`
                @keyframes posBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
};
