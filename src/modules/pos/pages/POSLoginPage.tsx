'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import { Lock, User, Mail, Eye, EyeOff, LogIn } from 'lucide-react';
import '../styles/pos-rush.css';

export const POSLoginPage: React.FC = () => {
    const router = useRouter();
    const { login, deviceId, isOffline } = usePOS();

    // Login type: STORE or CALL_CENTER
    const [loginType, setLoginType] = useState<'STORE' | 'CALL_CENTER'>('STORE');

    // Store POS fields
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');

    // Call Center fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Common fields
    const [rememberDevice, setRememberDevice] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if device is remembered


    useEffect(() => {
        const remembered = localStorage.getItem(`pos_remembered_${deviceId}`);
        if (remembered) {
            const data = JSON.parse(remembered);
            if (data.type === 'STORE') {
                setLoginType('STORE');
                setUsername(data.username || '');
            } else {
                setLoginType('CALL_CENTER');
                setEmail(data.email || '');
            }
        }
    }, [deviceId]);

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
        }
    };

    const handlePinDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handlePinClear = () => {
        setPin('');
    };

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            if (loginType === 'STORE') {
                if (!pin || pin.length < 4) {
                    throw new Error('Enter valid PIN');
                }
                await login('STORE', { pin, deviceId });

                if (rememberDevice) {
                    localStorage.setItem(`pos_remembered_${deviceId}`, JSON.stringify({
                        type: 'STORE',
                        username: username
                    }));
                }
            } else {
                if (!email || !password) {
                    throw new Error('Email and password required');
                }
                await login('CALL_CENTER', { email, password, deviceId });

                if (rememberDevice) {
                    localStorage.setItem(`pos_remembered_${deviceId}`, JSON.stringify({
                        type: 'CALL_CENTER',
                        email: email
                    }));
                }
            }

            // Sync animation duration is 1.5s in Context.
            // We wait just enough time for context to commit to localStorage and state
            setTimeout(() => {
                router.push('/pos/dashboard');
            }, 1600);

        } catch (err: any) {
            setError(err.message || 'Login failed');
            setLoading(false);
        }
    };



    const isFormValid = loginType === 'STORE'
        ? pin.length >= 4
        : email.length > 0 && password.length > 0;

    return (
        <div className="pos-screen" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--pos-bg-main)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* BACKGROUND DECOR */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'rgba(31, 164, 169, 0.02)', zIndex: 0 }} />

            {/* MAIN LAYOUT */}
            <div style={{
                flex: 1,
                display: 'flex',
                width: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                {/* LEFT SIDE: AUTH FORM & INFO (40%) */}
                <div style={{
                    width: '420px',
                    background: 'white',
                    borderRight: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '40px',
                    boxShadow: '10px 0 30px rgba(0,0,0,0.02)'
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--pos-action-primary)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                            boxShadow: '0 8px 16px rgba(31, 164, 169, 0.2)'
                        }}>
                            <Lock size={32} color="white" strokeWidth={2.5} />
                        </div>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: 900,
                            color: 'var(--pos-text-primary)',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                            marginBottom: '8px'
                        }}>
                            Zyappy POS
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>DEVICE ID: {deviceId}</span>
                            {isOffline && (
                                <div style={{
                                    padding: '2px 8px',
                                    background: 'var(--pos-state-warning)',
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 900
                                }}>OFFLINE</div>
                            )}
                        </div>
                    </div>

                    {/* Toggle */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        background: 'var(--pos-bg-main)',
                        padding: '6px',
                        borderRadius: '14px',
                        marginBottom: '32px'
                    }}>
                        <button
                            onClick={() => setLoginType('STORE')}
                            style={{
                                padding: '14px',
                                borderRadius: '10px',
                                border: 'none',
                                background: loginType === 'STORE' ? 'white' : 'transparent',
                                color: loginType === 'STORE' ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)',
                                fontSize: '14px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: loginType === 'STORE' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            STORE PIN
                        </button>
                        <button
                            onClick={() => setLoginType('CALL_CENTER')}
                            style={{
                                padding: '14px',
                                borderRadius: '10px',
                                border: 'none',
                                background: loginType === 'CALL_CENTER' ? 'white' : 'transparent',
                                color: loginType === 'CALL_CENTER' ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)',
                                fontSize: '14px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: loginType === 'CALL_CENTER' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            CALL CENTER
                        </button>
                    </div>

                    {/* Form Fields Section */}
                    <div style={{ flex: 1 }}>
                        {loginType === 'STORE' ? (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'block' }}>STAFF NAME (OPTIONAL)</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter staff name..."
                                        className="pos-input"
                                        style={{ height: '60px', paddingLeft: '52px', background: 'var(--pos-bg-main)', border: 'none' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'block' }}>EMAIL ADDRESS</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="agent@zyappy.com"
                                            className="pos-input"
                                            style={{ height: '60px', paddingLeft: '52px', background: 'var(--pos-bg-main)', border: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'block' }}>PASSWORD</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-muted)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter password"
                                            className="pos-input"
                                            style={{ height: '60px', paddingLeft: '52px', background: 'var(--pos-bg-main)', border: 'none' }}
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--pos-text-muted)', cursor: 'pointer' }}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            background: 'var(--pos-bg-main)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            marginBottom: '24px'
                        }}>
                            <input
                                type="checkbox"
                                checked={rememberDevice}
                                onChange={(e) => setRememberDevice(e.target.checked)}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--pos-action-primary)' }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>Remember this device</span>
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div>
                        {error && (
                            <div style={{ padding: '12px', background: 'var(--pos-state-error)', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
                        <button
                            onClick={handleLogin}
                            disabled={loading || !isFormValid}
                            className="pos-btn pos-btn-primary"
                            style={{ width: '100%', height: '72px', borderRadius: '18px', fontSize: '18px' }}
                        >
                            {loading ? 'AUTHENTICATING...' : (
                                <>
                                    <LogIn size={22} />
                                    LOGIN TO POS
                                </>
                            )}
                        </button>

                        <div style={{ marginTop: '24px', padding: '16px', borderTop: '1px solid var(--pos-border-subtle)', opacity: 0.6 }}>
                            <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Demo Access</div>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>PIN: 1234 or 5678</div>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>Login: alex@zyappy.com / password123</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: INTERACTION ZONE (60%) */}
                <div style={{
                    flex: 1,
                    padding: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {loginType === 'STORE' ? (
                        <div style={{ width: '100%', maxWidth: '500px' }}>
                            {/* PIN DISPLAY */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '40px'
                            }}>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>ENTER ACCESS PIN</div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '20px'
                                }}>
                                    {[0, 1, 2, 3].map((idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                width: '70px',
                                                height: '90px',
                                                background: 'white',
                                                border: pin.length > idx ? '3px solid var(--pos-action-primary)' : '2px solid var(--pos-border-subtle)',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '32px',
                                                fontWeight: 900,
                                                color: 'var(--pos-text-primary)',
                                                boxShadow: pin.length > idx ? '0 8px 20px rgba(31, 164, 169, 0.1)' : 'none'
                                            }}
                                        >
                                            {pin.length > idx ? '•' : ''}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* GIANT NUMPAD */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '16px'
                            }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'CLEAR', 0, 'DELETE'].map((val, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (val === 'DELETE') handlePinDelete();
                                            else if (val === 'CLEAR') handlePinClear();
                                            else handlePinInput(val.toString());
                                        }}
                                        className="pos-btn"
                                        style={{
                                            height: '90px',
                                            background: 'white',
                                            border: '1px solid var(--pos-border-subtle)',
                                            borderRadius: '20px',
                                            fontSize: typeof val === 'string' ? '14px' : '30px',
                                            fontWeight: 900,
                                            color: val === 'CLEAR' ? 'var(--pos-state-error)' : 'var(--pos-text-primary)',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                            transition: 'all 0.1s'
                                        }}
                                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '200px',
                                height: '200px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 40px',
                                border: '1px solid var(--pos-border-subtle)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                            }}>
                                <Mail size={80} color="var(--pos-action-primary)" strokeWidth={1} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '12px' }}>Call Center Mode</h2>
                            <p style={{ fontSize: '16px', color: 'var(--pos-text-muted)', maxWidth: '400px' }}>Enter your credentials on the left to access the unified multi-tenant dashboard.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default POSLoginPage;
