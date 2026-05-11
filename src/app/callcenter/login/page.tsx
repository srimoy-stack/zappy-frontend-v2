'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import { Phone, Lock, Mail, ShieldCheck, Chrome } from 'lucide-react';

export default function CallCenterLoginPage() {
    const router = useRouter();
    const { login, setChannel } = usePOS();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberDevice, setRememberDevice] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login('CALL_CENTER', {
                email,
                password,
                deviceId: `CC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
            });

            console.log('Login result:', result);

            // Set channel to phone as per requirement
            setChannel('Phone Order');

            if (result?.requiresStoreSelection) {
                // For now, redirect to dashboard which might need to handle store selection
                // or create a specific store selection page for call center
                router.push('/callcenter/dashboard');
            } else {
                router.push('/callcenter/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '24px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: 'white',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        background: '#3b82f6',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                    }}>
                        <Phone size={36} color="white" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                        Call Center
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>
                        Enterprise Order Management System
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '16px',
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        borderRadius: '12px',
                        color: '#dc2626',
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <ShieldCheck size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="email"
                            placeholder="Operator Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                height: '56px',
                                background: '#f8fafc',
                                border: '2px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '0 16px 0 48px',
                                fontSize: '16px',
                                fontWeight: 600,
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                height: '56px',
                                background: '#f8fafc',
                                border: '2px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '0 16px 0 48px',
                                fontSize: '16px',
                                fontWeight: 600,
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                        <input
                            type="checkbox"
                            checked={rememberDevice}
                            onChange={(e) => setRememberDevice(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                            Remember this device
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            height: '56px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginTop: '8px',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Chrome size={14} />
                        AUTHORIZED PERSONNEL ONLY
                    </div>
                </div>
            </div>
        </div>
    );
}
