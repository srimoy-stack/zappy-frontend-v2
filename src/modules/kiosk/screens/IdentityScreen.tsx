'use client';

import { useState } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { loyaltyService } from '@/services/kiosk/loyaltyService';
import { ArrowLeft, User, Mail, Phone, History, Plus, Shield, ChevronRight, Delete, X } from 'lucide-react';

export function IdentityScreen() {
    const { setIdentity, addToCart, navigateTo, goBack } = useKioskStore();

    const [mode, setMode] = useState<'phone' | 'email'>('phone');
    const [inputValue, setInputValue] = useState('');
    const [step, setStep] = useState<'identify' | 'otp' | 'profile'>('identify');
    const [otpValue, setOtpValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<ReturnType<typeof loyaltyService.buildIdentity>>(null);
    const [otpError, setOtpError] = useState('');

    const handleKeyPress = (key: string) => {
        if (mode === 'phone' && inputValue.length >= 10) return;
        setInputValue(prev => prev + key);
    };

    const handleDelete = () => {
        setInputValue(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setInputValue('');
    };

    const handleIdentify = async () => {
        if (mode === 'phone' && inputValue.length < 10) return;
        if (mode === 'email' && !inputValue.includes('@')) return;

        setLoading(true);
        try {
            const res = await loyaltyService.identifyCustomer(inputValue);
            if (res.exists && res.customer) {
                const identity = loyaltyService.buildIdentity(res.customer);
                setCustomerData(identity);
                await loyaltyService.sendOtp(inputValue);
                setStep('otp');
            } else {
                // New customer
                setIdentity({ id: inputValue, authenticated: false });
                navigateTo('menu');
            }
        } catch {
            setIdentity({ id: inputValue, authenticated: false });
            navigateTo('menu');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpValue.length < 4) return;
        setLoading(true);
        setOtpError('');
        const result = await loyaltyService.verifyOtp(inputValue, otpValue);
        if (result.verified && customerData) {
            const authedIdentity = { ...customerData, authenticated: true };
            setIdentity(authedIdentity);
            setCustomerData(authedIdentity);
            setStep('profile');
        } else {
            setOtpError(result.message);
        }
        setLoading(false);
    };

    const handleQuickAdd = async (order: any) => {
        if (!order || !order.items) return;
        setLoading(true);
        // Add items one by one to ensure proper state updates if needed
        for (const item of order.items) {
            addToCart({ ...item, id: Math.random().toString(36).substr(2, 9) });
        }
        navigateTo('menu');
    };

    const handleSkip = () => {
        setIdentity({ id: 'guest', authenticated: false });
        navigateTo('menu');
    };

    const formatPhone = (val: string) => {
        if (val.length <= 3) return val;
        if (val.length <= 6) return `(${val.slice(0, 3)}) ${val.slice(3)}`;
        return `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
    };

    const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'CLR'];

    const qwertyRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '_', '-'],
        ['@gmail.com', '@yahoo.com', '@outlook.com', '.com']
    ];

    return (
        <div className="kiosk-identity-screen">
            {/* Header */}
            <header className="kiosk-identity-header">
                <button
                    onClick={() => step === 'otp' ? setStep('identify') : step === 'profile' ? setStep('otp') : goBack()}
                    className="kiosk-back-btn"
                >
                    <ArrowLeft size={36} />
                </button>
                <div className="kiosk-identity-header-badge">
                    <Shield size={22} className="accent" />
                    <span>Loyalty & Rewards</span>
                </div>
                <div style={{ width: 68 }} />
            </header>

            <main className="kiosk-identity-main">
                {step === 'identify' && (
                    <div className="kiosk-identity-identify kiosk-screen-enter">
                        <div className="kiosk-identity-hero-text">
                            <h1>Welcome Back</h1>
                            <p>Enter your details to earn points and see your favorites.</p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="kiosk-identity-mode-toggle">
                            <button
                                onClick={() => { setMode('phone'); setInputValue(''); }}
                                className={`kiosk-identity-mode-btn ${mode === 'phone' ? 'active' : ''}`}
                            >
                                <Phone size={24} /> <span>Phone Number</span>
                            </button>
                            <button
                                onClick={() => { setMode('email'); setInputValue(''); }}
                                className={`kiosk-identity-mode-btn ${mode === 'email' ? 'active' : ''}`}
                            >
                                <Mail size={24} /> <span>Email Address</span>
                            </button>
                        </div>

                        {/* Input Display Area */}
                        <div className="kiosk-identity-input-container">
                            <div className={`kiosk-identity-input-box ${inputValue ? 'has-value' : ''}`}>
                                {mode === 'phone' ? (
                                    <span className="kiosk-identity-input-value">
                                        {inputValue ? formatPhone(inputValue) : 'Enter Area Code & Number'}
                                    </span>
                                ) : (
                                    <span className="kiosk-identity-input-value email">
                                        {inputValue || 'your@email.com'}
                                    </span>
                                )}
                                {inputValue && (
                                    <button onClick={handleClear} className="kiosk-identity-clear-x">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Keypad or Keyboard */}
                        <div className="kiosk-identity-input-wrapper">
                            {mode === 'phone' ? (
                                <div className="kiosk-keypad">
                                    {keypadKeys.map(key => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                if (key === 'CLR') handleClear();
                                                else if (key === '⌫') handleDelete();
                                                else handleKeyPress(key);
                                            }}
                                            className={`kiosk-keypad-key ${key === 'CLR' || key === '⌫' ? 'special' : ''}`}
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="kiosk-qwerty">
                                    {qwertyRows.map((row, ridx) => (
                                        <div key={ridx} className="kiosk-qwerty-row">
                                            {row.map(key => (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        if (key.startsWith('@') || key.startsWith('.')) setInputValue(prev => prev + key);
                                                        else setInputValue(prev => prev + key.toLowerCase());
                                                    }}
                                                    className={`kiosk-qwerty-key ${key.length > 2 ? 'wide' : ''}`}
                                                >
                                                    {key}
                                                </button>
                                            ))}
                                            {ridx === 2 && (
                                                <button onClick={handleDelete} className="kiosk-qwerty-key delete">
                                                    <Delete size={24} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Primary Action */}
                        <button
                            disabled={loading || (mode === 'phone' ? inputValue.length < 10 : !inputValue.includes('@'))}
                            onClick={handleIdentify}
                            className={`kiosk-identity-continue-btn ${loading || (mode === 'phone' ? inputValue.length < 10 : !inputValue.includes('@')) ? 'disabled' : ''}`}
                        >
                            {loading ? <div className="kiosk-spinner" /> : <>Identify Me <ChevronRight size={28} /></>}
                        </button>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="kiosk-identity-otp kiosk-screen-enter">
                        <div className="kiosk-identity-hero-text">
                            <h1>Verification Required</h1>
                            <p>We sent a 4-digit code to <span className="accent">{mode === 'phone' ? formatPhone(inputValue) : inputValue}</span></p>
                        </div>

                        <div className="kiosk-otp-display">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`kiosk-otp-dot ${otpValue[i] ? 'filled' : ''}`}>
                                    {otpValue[i] || ''}
                                </div>
                            ))}
                        </div>

                        {otpError && <p className="kiosk-otp-error">{otpError}</p>}

                        <div className="kiosk-keypad">
                            {keypadKeys.map(key => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        if (key === 'CLR') setOtpValue('');
                                        else if (key === '⌫') setOtpValue(prev => prev.slice(0, -1));
                                        else if (otpValue.length < 4) setOtpValue(prev => prev + key);
                                    }}
                                    className={`kiosk-keypad-key ${key === 'CLR' || key === '⌫' ? 'special' : ''}`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading || otpValue.length < 4}
                            className={`kiosk-identity-verify-btn ${loading || otpValue.length < 4 ? 'disabled' : ''}`}
                        >
                            {loading ? <div className="kiosk-spinner" /> : 'Unlock My Profile'}
                        </button>
                    </div>
                )}

                {step === 'profile' && customerData && (
                    <div className="kiosk-identity-profile kiosk-screen-enter">
                        <div className="kiosk-identity-profile-card">
                            <div className="kiosk-identity-avatar">
                                <User size={56} />
                            </div>
                            <h2>Hi, {customerData.name}!</h2>
                            <div className="kiosk-identity-points-badge">
                                <History size={20} className="accent" />
                                <span>{customerData.points} Points Available</span>
                            </div>
                        </div>

                        {customerData.pastOrders && customerData.pastOrders.length > 0 && (
                            <div className="kiosk-identity-reorder">
                                <div className="kiosk-identity-section-header">
                                    <History size={24} />
                                    <h3>Quick Reorder</h3>
                                </div>
                                <div className="kiosk-identity-past-orders">
                                    {customerData.pastOrders.slice(0, 3).map((order, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickAdd(order)}
                                            className="kiosk-identity-order-card"
                                        >
                                            <div className="kiosk-identity-order-card-icon">
                                                <Plus size={28} />
                                            </div>
                                            <div className="kiosk-identity-order-card-content">
                                                <p className="kiosk-identity-order-items">
                                                    {order.items?.map((it: any) => it.name).join(' & ')}
                                                </p>
                                                <span className="kiosk-identity-order-total-pill">${order.total}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button onClick={() => navigateTo('menu')} className="kiosk-identity-menu-btn">
                            New Order <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </main>

            {/* Bottom Skip Section */}
            {step !== 'profile' && (
                <div className="kiosk-identity-bottom">
                    <div className="kiosk-identity-divider">
                        <span /> <span>OR</span> <span />
                    </div>
                    <button onClick={handleSkip} className="kiosk-identity-skip-btn">
                        <span>Order as Guest</span>
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}
