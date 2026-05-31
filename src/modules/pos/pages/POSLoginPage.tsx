'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import { Lock, User, Mail, Eye, EyeOff, LogIn } from 'lucide-react';
import { env } from '@/shared/config/env';
import { mockPOSUsers } from '@/modules/pos/mock/posData';
import { getStoreCashiers, POSCashier } from '@/modules/pos/services/posAuthService';
import '../styles/pos-rush.css';

const getErrorMessage = (err: unknown, fallback: string) => {
    if (err && typeof err === 'object') {
        const error = err as { message?: string; response?: { data?: { message?: string } } };
        return error.response?.data?.message || error.message || fallback;
    }

    return fallback;
};

export const POSLoginPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { session, login, deviceId, isOffline } = usePOS();    

    const STATIC_ID = 'b5f99b0e-a431-462f-8dc4-5e4a8fb1a215';
    const storeIdParam = searchParams?.get('store_id') || searchParams?.get('storeId') || '';

    // Login type: STORE or CALL_CENTER
    const [loginType, setLoginType] = useState<'STORE' | 'CALL_CENTER'>('STORE');

    // Store POS fields
    const [username, setUsername] = useState('');
    const [storeId, setStoreId] = useState(storeIdParam);
    const [selectedCashier, setSelectedCashier] = useState<POSCashier | null>(null);
    const [cashiers, setCashiers] = useState<POSCashier[]>([]);
    const [cashiersLoading, setCashiersLoading] = useState(false);
    const [cashiersError, setCashiersError] = useState('');
    const [pin, setPin] = useState('');
    const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
    const [staffSearch, setStaffSearch] = useState('');

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
        if (session) {
            router.replace('/pos/dashboard');
        }
    }, [session, router]);

    useEffect(() => {
        const remembered = localStorage.getItem(`pos_remembered_${deviceId}`);
        if (remembered) {
            const data = JSON.parse(remembered);
            if (data.type === 'STORE') {
                setLoginType('STORE');
                setUsername(data.username || '');
                if (data.cashierId || data.cashierEmail || data.username) {
                    setSelectedCashier({
                        id: data.cashierId || data.cashierEmail || data.username,
                        name: data.username || data.cashierEmail || 'Cashier',
                        email: data.cashierEmail
                    });
                }
            } else {
                setLoginType('CALL_CENTER');
                setEmail(data.email || '');
            }
        }
    }, [deviceId]);

    useEffect(() => {
        setStoreId(storeIdParam);
    }, [storeIdParam]);

    useEffect(() => {
        let active = true;

        const loadCashiers = async () => {
            if (loginType !== 'STORE') return;

            setCashiersError('');
            setCashiersLoading(true);

            try {
                const resolvedStoreId = storeId.trim();
                console.info('[POSLogin] Loading cashiers', {
                    storeId: resolvedStoreId || null,
                    apiBaseUrl: env.apiBaseUrl,
                });

                if (!resolvedStoreId) {
                    console.warn('[POSLogin] Cashier API skipped because store id is empty.');
                    setCashiers([]);
                    setSelectedCashier(null);
                    setUsername('');
                    setCashiersError('Enter store id to load cashiers.');
                    return;
                }

                const cashierList = await getStoreCashiers(resolvedStoreId);
                console.info('[POSLogin] Cashiers loaded', {
                    storeId: resolvedStoreId,
                    count: cashierList.length,
                });
                if (!active) return;
                setCashiers(cashierList);
            } catch (err: unknown) {
                if (!active) return;
                const fallbackCashiers = env.apiMode === 'mock'
                    ? mockPOSUsers
                        .filter(user => user.role !== 'CALL_CENTER_AGENT')
                        .map(user => ({
                            id: user.id,
                            name: user.name,
                            role: user.role
                        }))
                    : [];

                console.error('[POSLogin] Unable to load cashiers from backend', err);
                setCashiers(fallbackCashiers);
                setCashiersError(fallbackCashiers.length > 0 ? '' : getErrorMessage(err, 'Unable to load cashiers'));
            } finally {
                if (active) setCashiersLoading(false);
            }
        };

        loadCashiers();

        return () => {
            active = false;
        };
    }, [loginType, storeId]);

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
                if (env.apiMode === 'live' && !selectedCashier) {
                    throw new Error('Select cashier');
                }
                if (!pin || pin.length < 4) {
                    throw new Error('Enter valid PIN');
                }
                await login('STORE', {
                    pin,
                    deviceId,
                    cashierId: selectedCashier?.id,
                    cashierName: selectedCashier?.name,
                    storeId: storeId.trim(),
                    cashierEmail: selectedCashier?.email
                });

                if (rememberDevice) {
                    localStorage.setItem(`pos_remembered_${deviceId}`, JSON.stringify({
                        type: 'STORE',
                        username: selectedCashier?.name || username,
                        cashierId: selectedCashier?.id,
                        cashierEmail: selectedCashier?.email
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

        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Login failed'));
            setLoading(false);
        }
    };



    const isStoreLoginValid = pin.length >= 4 && (env.apiMode !== 'live' || !!selectedCashier);
    const isFormValid = loginType === 'STORE'
        ? isStoreLoginValid
        : email.length > 0 && password.length > 0;

    const filteredCashiers = cashiers.filter(cashier =>
        cashier.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        (cashier.email || '').toLowerCase().includes(staffSearch.toLowerCase())
    );

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
                            <span style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>DEVICE ID: {STATIC_ID}</span>
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
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'block' }}>STORE ID</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={storeId}
                                            onChange={(e) => {
                                                setStoreId(e.target.value);
                                                setSelectedCashier(null);
                                                setUsername('');
                                                setStaffSearch('');
                                            }}
                                            placeholder="Enter backend store id"
                                            className="pos-input"
                                            style={{ height: '60px', paddingLeft: '18px', background: 'var(--pos-bg-main)', border: 'none', width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'block' }}>CASHIER NAME</label>
                                    <div style={{ position: 'relative' }}>
                                        <div
                                            onClick={() => setStaffDropdownOpen(!staffDropdownOpen)}
                                            className="pos-input"
                                            style={{ height: '60px', paddingLeft: '52px', paddingRight: '40px', background: 'var(--pos-bg-main)', border: 'none', width: '100%', color: username ? 'var(--pos-text-primary)' : 'var(--pos-text-muted)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                        >
                                            <User size={20} style={{ position: 'absolute', left: '16px', color: 'var(--pos-text-muted)' }} />
                                            <span>{username || (cashiersLoading ? 'Loading cashiers...' : 'Select cashier name...')}</span>
                                            <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pos-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={staffDropdownOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}/></svg>
                                            </div>
                                        </div>

                                        {staffDropdownOpen && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--pos-border-subtle)', borderRadius: '12px', marginTop: '8px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                                <div style={{ padding: '12px', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Search cashier..."
                                                        value={staffSearch}
                                                        onChange={(e) => setStaffSearch(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--pos-border-subtle)', outline: 'none', fontSize: '14px', color: 'var(--pos-text-primary)' }}
                                                    />
                                                </div>
                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {cashiersLoading && (
                                                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--pos-text-muted)', fontSize: '13px' }}>
                                                            Loading cashiers...
                                                        </div>
                                                    )}
                                                    {!cashiersLoading && cashiersError && (
                                                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--pos-state-error)', fontSize: '13px', fontWeight: 700 }}>
                                                            {cashiersError}
                                                        </div>
                                                    )}
                                                    {!cashiersLoading && !cashiersError && filteredCashiers.map((cashier) => (
                                                        <div
                                                            key={cashier.id}
                                                            onClick={() => { setSelectedCashier(cashier); setUsername(cashier.name); setStaffDropdownOpen(false); setStaffSearch(''); }}
                                                            style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid var(--pos-border-subtle)', background: selectedCashier?.id === cashier.id ? 'var(--pos-bg-main)' : 'white', color: 'var(--pos-text-primary)' }}
                                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--pos-bg-main)')}
                                                            onMouseLeave={(e) => (e.currentTarget.style.background = selectedCashier?.id === cashier.id ? 'var(--pos-bg-main)' : 'white')}
                                                        >
                                                            <div style={{ fontWeight: 800 }}>{cashier.name}</div>
                                                            {cashier.email && (
                                                                <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', marginTop: '2px' }}>
                                                                    {cashier.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {!cashiersLoading && !cashiersError && filteredCashiers.length === 0 && (
                                                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--pos-text-muted)', fontSize: '13px' }}>
                                                            No cashiers found
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {!staffDropdownOpen && cashiersError && (
                                            <div style={{ marginTop: '8px', color: 'var(--pos-state-error)', fontSize: '12px', fontWeight: 700 }}>
                                                {cashiersError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
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
