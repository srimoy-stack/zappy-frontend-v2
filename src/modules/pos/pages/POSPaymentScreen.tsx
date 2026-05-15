'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    CreditCard, Banknote, Terminal, Wallet, Gift,
    ArrowLeft, AlertCircle,
    ChevronDown, ChevronUp, ShieldCheck,
    X, Loader2, Split, RotateCcw
} from 'lucide-react';
import { usePOS } from '@/modules/pos/context/POSContext';
import '../styles/pos-rush.css';

// --- Types ---
interface Transaction {
    id: string;
    method: string;
    amount: number;
    tip: number;
    timestamp: Date;
    status: 'approved' | 'reversed' | 'failed';
    reference_id?: string;
    last4?: string;
    authorization_code?: string;
    change?: number;
}

interface Discount {
    id: string;
    name: string;
    type: 'PERCENT' | 'FLAT';
    value: number;
    reason?: string;
    isManual?: boolean;
}

// --- Mock Data ---
const MOCK_COUPONS = [
    { id: 'save10', name: 'SAVE10', description: '10% off entire order', type: 'PERCENT' as const, value: 10 },
    { id: 'welcome5', name: 'WELCOME5', description: '$5 flat discount', type: 'FLAT' as const, value: 5 },
    { id: 'pizza20', name: 'PIZZA20', description: '20% off Pizzas', type: 'PERCENT' as const, value: 20 },
];

const MOCK_WALLETS: Record<string, number> = {
    'GIFT_123': 25.00,
    'USER_PAY': 50.00,
    'GC-9999': 100.00
};

const VALID_MANAGER_PIN = '1234';
const MANUAL_DISCOUNT_THRESHOLD = 20;

// --- Helpers ---
const validateLuhn = (num: string) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num.charAt(i));
        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0 && num.length >= 13;
};

export const POSPaymentScreen: React.FC = () => {
    const router = useRouter();
    const { cartTotal, clearCart, session, selectedCustomer, addOrderToCustomerHistory, cart } = usePOS();

    // --- State ---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isSplitMode, setIsSplitMode] = useState(false);
    const [currentMethod, setCurrentMethod] = useState<string | null>(null);
    const [paymentState, setPaymentState] = useState<'SELECTING' | 'ENTERING_DETAILS' | 'PROCESSING' | 'COMPLETED'>('SELECTING');

    // Pricing & Discounts
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
    const [showDiscountPanel, setShowDiscountPanel] = useState(false);
    const [isDiscountsExpanded] = useState(true);
    const [tipAmount, setTipAmount] = useState(0);

    // Input / Processing State
    const [inputValue, setInputValue] = useState('');
    const [terminalStatus, setTerminalStatus] = useState<string>('');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [changeDue, setChangeDue] = useState(0);

    // PIN Flow State
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const [pinValue, setPinValue] = useState('');
    const [pinPurpose, setPinPurpose] = useState<'DISCOUNT' | 'REVERSAL'>('DISCOUNT');
    const [pendingManualDiscount, setPendingManualDiscount] = useState<any>(null);
    const [transactionToReverse, setTransactionToReverse] = useState<string | null>(null);

    // Manual Discount Inputs
    const [manualValue, setManualValue] = useState('');
    const [manualType, setManualType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
    const [manualReason, setManualReason] = useState('');

    // --- Method Specific States ---
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [giftCardData, setGiftCardData] = useState({ number: '', pin: '', balance: null as number | null });
    const [walletData, setWalletData] = useState({ mobile: '', otp: '', type: 'Store Wallet' });
    const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
    const [showCustomerHistory, setShowCustomerHistory] = useState(false);

    // Get customer data - use selectedCustomer from context as primary source
    const customer = selectedCustomer || session?.activeCustomer;
    const availableLoyaltyPoints = customer?.loyaltyPoints || 0;
    const POINTS_TO_DOLLAR_RATE = 100; // 100 points = $1

    // --- Calculations ---
    const subtotal = cartTotal;
    const discountAmount = useMemo(() => {
        if (!appliedDiscount) return 0;
        return appliedDiscount.type === 'PERCENT'
            ? (subtotal * appliedDiscount.value) / 100
            : appliedDiscount.value;
    }, [subtotal, appliedDiscount]);

    const taxAmount = Math.max(0, (subtotal - discountAmount) * 0.08);
    const deliveryFee = session?.channel === 'Delivery' ? 5.99 : 0;
    const totalAmountDue = Math.max(0, subtotal - discountAmount + taxAmount + deliveryFee + tipAmount);

    const amountPaid = useMemo(() =>
        transactions
            .filter(t => t.status === 'approved')
            .reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const remainingBalance = Math.max(0, totalAmountDue - amountPaid);
    const isFullyPaid = remainingBalance <= 0.005;

    // Debug: Log customer data
    useEffect(() => {
        console.log('🔍 Payment Screen - Customer Data:', {
            customer,
            selectedCustomer,
            sessionActiveCustomer: session?.activeCustomer,
            availableLoyaltyPoints,
            customerName: customer?.name
        });
    }, [customer, selectedCustomer, session?.activeCustomer, availableLoyaltyPoints]);

    // --- Effects ---
    useEffect(() => {
        if (remainingBalance > 0) {
            setInputValue(remainingBalance.toFixed(2));
        } else {
            setInputValue('0.00');
        }
    }, [remainingBalance, currentMethod, isSplitMode]);

    // --- Handlers ---
    const handleMethodSelect = (methodId: string) => {
        if (methodId === 'split') {
            setIsSplitMode(true);
            setCurrentMethod(null);
        } else {
            setCurrentMethod(methodId);
            setPaymentState('ENTERING_DETAILS');
            setPaymentError(null);
            setInputValue(remainingBalance.toFixed(2));
        }
    };

    const handleApplyCoupon = (coupon: typeof MOCK_COUPONS[0]) => {
        setAppliedDiscount({ ...coupon, isManual: false });
        setShowDiscountPanel(false);
    };

    const handleApplyManualDiscountRequest = () => {
        const val = parseFloat(manualValue);
        if (isNaN(val) || val <= 0) return;
        if (!manualReason) {
            setPaymentError('Manager requires reason for manual overrides');
            return;
        }

        const discountData = { id: 'manual', name: 'Manual Override', type: manualType, value: val, reason: manualReason, isManual: true };

        if (manualType === 'PERCENT' && val > MANUAL_DISCOUNT_THRESHOLD) {
            setPendingManualDiscount(discountData);
            setPinPurpose('DISCOUNT');
            setShowPinPrompt(true);
        } else {
            setAppliedDiscount(discountData);
            setShowDiscountPanel(false);
            resetManualInputs();
        }
    };

    const resetManualInputs = () => {
        setManualValue('');
        setManualReason('');
        setPendingManualDiscount(null);
    };

    const handlePinSubmit = () => {
        if (pinValue === VALID_MANAGER_PIN) {
            if (pinPurpose === 'DISCOUNT' && pendingManualDiscount) {
                setAppliedDiscount(pendingManualDiscount);
                setShowDiscountPanel(false);
                resetManualInputs();
            } else if (pinPurpose === 'REVERSAL' && transactionToReverse) {
                setTransactions(prev => prev.filter(t => t.id !== transactionToReverse));
                setTransactionToReverse(null);
            }
            setShowPinPrompt(false);
            setPinValue('');
            setPaymentError(null);
        } else {
            setPaymentError('Access Denied: Invalid PIN');
            setPinValue('');
        }
    };

    const logTransaction = (data: Partial<Transaction>) => {
        const newTxn: Transaction = {
            id: `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            method: currentMethod || 'Cash',
            amount: data.amount || 0,
            tip: data.tip || 0,
            timestamp: new Date(),
            status: 'approved',
            ...data
        } as Transaction;
        setTransactions(prev => [...prev, newTxn]);
    };

    const handleProcessTransaction = async () => {
        const amountToTender = parseFloat(inputValue);
        if (isNaN(amountToTender) || amountToTender <= 0) {
            setPaymentError('Invalid amount entered');
            return;
        }

        if (currentMethod === 'card') {
            // In STORE mode, card payment is handled via terminal, so skip manual validation
            if (session?.posType !== 'STORE') {
                if (!validateLuhn(cardData.number.replace(/\s/g, ''))) {
                    setPaymentError('Invalid Card Number (Luhn Check Failed)');
                    return;
                }
                if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
                    setPaymentError('Invalid Expiry Format (MM/YY)');
                    return;
                }
                if (cardData.cvv.length < 3) {
                    setPaymentError('Invalid CVV');
                    return;
                }
            }
        }

        if (currentMethod === 'gift_card') {
            if (!giftCardData.number) {
                setPaymentError('Enter Gift Card Number');
                return;
            }
            const balance = MOCK_WALLETS[giftCardData.number] || 20.00;
            if (amountToTender > balance) {
                setPaymentError(`Insufficient Balance ($${balance.toFixed(2)})`);
                setInputValue(balance.toFixed(2));
                return;
            }
        }

        if (currentMethod === 'loyalty_points') {
            if (loyaltyPointsToRedeem <= 0) {
                setPaymentError('Please select points to redeem');
                return;
            }
            const maxPointsValue = availableLoyaltyPoints / POINTS_TO_DOLLAR_RATE;
            if (amountToTender > maxPointsValue) {
                setPaymentError(`Insufficient Points (max $${maxPointsValue.toFixed(2)})`);
                return;
            }
            if (loyaltyPointsToRedeem > availableLoyaltyPoints) {
                setPaymentError('Insufficient loyalty points');
                return;
            }
        }

        if (currentMethod !== 'cash' && amountToTender > remainingBalance + 0.01) {
            setPaymentError('Amount exceeds remaining balance');
            return;
        }

        setPaymentState('PROCESSING');
        setPaymentError(null);

        try {
            if (currentMethod === 'terminal' || (currentMethod === 'card' && session?.posType === 'STORE')) {
                setTerminalStatus('Sending to Terminal...');
                await new Promise(r => setTimeout(r, 1200));
                setTerminalStatus('Waiting for Swipe/Tap...');
                await new Promise(r => setTimeout(r, 2000));
                setTerminalStatus('Authorizing...');
                await new Promise(r => setTimeout(r, 1500));
            } else {
                setTerminalStatus('Processing Authorization...');
                await new Promise(r => setTimeout(r, 1800));
            }

            let actualAmount = amountToTender;
            let change = 0;

            if (currentMethod === 'cash') {
                if (amountToTender > remainingBalance) {
                    change = amountToTender - remainingBalance;
                    actualAmount = remainingBalance;
                    setChangeDue(change);
                }
            }

            const isManualCard = currentMethod === 'card' && session?.posType !== 'STORE';

            logTransaction({
                amount: actualAmount,
                tip: currentMethod === 'card' ? tipAmount : 0,
                reference_id: Math.random().toString(36).substr(2, 10).toUpperCase(),
                last4: isManualCard ? cardData.number.slice(-4) : (currentMethod === 'card' || currentMethod === 'terminal' ? '1234' : undefined),
                authorization_code: 'APP-' + Math.floor(100000 + Math.random() * 900000),
                change: change > 0 ? change : undefined
            });

            setPaymentState('SELECTING');
            setCurrentMethod(null);
            setTipAmount(0);
            setCardData({ number: '', expiry: '', cvv: '', name: '' });
            setGiftCardData({ number: '', pin: '', balance: null });
            setLoyaltyPointsToRedeem(0);

        } catch (err) {
            setPaymentError('Transaction Failed: Communication Error');
            setPaymentState('ENTERING_DETAILS');
        }
    };

    const initiateReversal = (txnId: string) => {
        if (transactions.length > 0 && transactions[transactions.length - 1]?.id === txnId) {
            setTransactionToReverse(txnId);
            setPinPurpose('REVERSAL');
            setShowPinPrompt(true);
        } else {
            setPaymentError('Enterprise Rule: Only the most recent transaction can be reversed');
        }
    };

    const handleCompleteOrder = () => {
        if (!isFullyPaid) return;
        const orderId = session?.activeTable?.orderId || `ORD-${Date.now().toString().slice(-6)}`;
        const fulfillment = session?.channel || 'Takeaway';

        // Add to customer order history if customer is selected
        if (customer) {
            const newOrder = {
                id: orderId,
                date: new Date().toISOString().split('T')[0],
                amount: totalAmountDue,
                items: cart.map(item => `${item.quantity}x ${item.name}`).join(', ')
            };
            addOrderToCustomerHistory(customer.id, newOrder);
        }

        clearCart();
        router.push(`/pos/order-success/${orderId}?fulfillment=${fulfillment}${changeDue > 0 ? `&change=${changeDue}` : ''}`);
    };

    // --- Sub-Components ---
    const PricingRow = ({ label, value, isBold = false, color = 'var(--pos-text-primary)', isNeg = false, onExpand }: any) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--pos-border-subtle)', fontSize: isBold ? '18px' : '15px', fontWeight: isBold ? 800 : 700, color }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {onExpand && <button onClick={onExpand} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--pos-text-muted)' }}>
                    {isDiscountsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>}
                <span>{label}</span>
            </div>
            <span>{isNeg ? '-' : ''}${Math.abs(value).toFixed(2)}</span>
        </div>
    );

    const MethodPanel = () => {
        if (!currentMethod) return null;

        const InputRow = ({ label, value, onChange, placeholder, type = 'text', masked = false, mode = 'text' }: any) => (
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>{label}</label>
                <input
                    type={type}
                    inputMode={mode as any}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        height: '56px',
                        background: 'var(--pos-bg-surface)',
                        border: '2px solid var(--pos-border-subtle)',
                        borderRadius: '12px',
                        padding: '0 16px',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'var(--pos-text-primary)',
                        letterSpacing: masked ? '4px' : 'normal'
                    }}
                />
            </div>
        );

        switch (currentMethod) {
            case 'card':
                if (session?.posType === 'STORE') {
                    // Store Mode: Terminal Integration Only
                    return (
                        <div style={{ animation: 'posFadeInUp 0.3s' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Card Payment (Terminal)</h2>

                            <div style={{ textAlign: 'center', padding: '24px', background: 'var(--pos-bg-surface)', borderRadius: '16px', border: '2px dashed var(--pos-border-subtle)', marginBottom: '24px' }}>
                                <Terminal size={48} color="var(--pos-action-primary)" style={{ marginBottom: '12px' }} />
                                <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>Integrated Terminal</p>
                                <p style={{ fontSize: '12px', color: 'var(--pos-text-muted)' }}>Proceed to send amount to payment device.</p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Add Gratuity (Tip)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    {[0.10, 0.15, 0.20].map(pct => (
                                        <button key={pct} onClick={() => setTipAmount(subtotal * pct)} style={{ height: '48px', borderRadius: '10px', background: tipAmount === (subtotal * pct) ? 'var(--pos-action-primary)' : 'var(--pos-bg-surface)', color: tipAmount === (subtotal * pct) ? 'white' : 'var(--pos-text-primary)', fontWeight: 800, border: '1px solid var(--pos-border-subtle)', cursor: 'pointer' }}>
                                            {pct * 100}%
                                        </button>
                                    ))}
                                    <input type="text" placeholder="Custom" value={tipAmount || ''} onChange={e => setTipAmount(parseFloat(e.target.value) || 0)} style={{ height: '48px', borderRadius: '10px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)', textAlign: 'center', fontWeight: 800 }} />
                                </div>
                            </div>
                        </div>
                    );
                }

                // Call Center Mode: Manual Entry
                return (
                    <div style={{ animation: 'posFadeInUp 0.3s' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Secure Card Entry</h2>
                        <InputRow label="Cardholder Name" value={cardData.name} onChange={(v: string) => setCardData({ ...cardData, name: v })} placeholder="J. DOE" />
                        <InputRow label="Card Number" value={cardData.number} onChange={(v: string) => setCardData({ ...cardData, number: v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) })} placeholder="0000 0000 0000 0000" masked mode="numeric" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <InputRow label="Expiry" value={cardData.expiry} onChange={(v: string) => setCardData({ ...cardData, expiry: v.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5) })} placeholder="MM/YY" mode="numeric" />
                            <InputRow label="CVV" value={cardData.cvv} onChange={(v: string) => setCardData({ ...cardData, cvv: v.slice(0, 4) })} placeholder="***" type="password" masked mode="numeric" />
                        </div>
                        <div style={{ marginTop: '24px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Add Gratuity (Tip)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {[0.10, 0.15, 0.20].map(pct => (
                                    <button key={pct} onClick={() => setTipAmount(subtotal * pct)} style={{ height: '48px', borderRadius: '10px', background: tipAmount === (subtotal * pct) ? 'var(--pos-action-primary)' : 'var(--pos-bg-surface)', color: tipAmount === (subtotal * pct) ? 'white' : 'var(--pos-text-primary)', fontWeight: 800, border: '1px solid var(--pos-border-subtle)', cursor: 'pointer' }}>
                                        {pct * 100}%
                                    </button>
                                ))}
                                <input type="text" placeholder="Custom" value={tipAmount || ''} onChange={e => setTipAmount(parseFloat(e.target.value) || 0)} style={{ height: '48px', borderRadius: '10px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)', textAlign: 'center', fontWeight: 800 }} />
                            </div>
                        </div>
                    </div>
                );
            case 'cash':
                return (
                    <div style={{ animation: 'posFadeInUp 0.3s' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Cash Settlement</h2>
                        <div style={{ background: 'var(--pos-bg-surface)', padding: '24px', borderRadius: '20px', marginBottom: '24px', border: '1px solid var(--pos-border-subtle)' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '4px' }}>REMAINING DUE</div>
                            <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--pos-action-primary)' }}>${remainingBalance.toFixed(2)}</div>
                        </div>
                        <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Quick Amount</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                            {Array.from(new Set([Math.ceil(remainingBalance), 10, 20, 50])).slice(0, 4).map((amt, idx) => (
                                <button key={`amt-${idx}-${amt}`} onClick={() => setInputValue(amt.toFixed(2))} style={{ height: '60px', borderRadius: '12px', background: 'var(--pos-bg-card)', border: '2px solid var(--pos-border-subtle)', fontWeight: 900, fontSize: '18px', cursor: 'pointer' }}>${amt}</button>
                            ))}
                        </div>
                        <InputRow label="Amount Tendered" value={inputValue} onChange={setInputValue} placeholder="0.00" />
                        {parseFloat(inputValue) > remainingBalance && (
                            <div style={{ padding: '16px', borderRadius: '12px', background: '#10B98115', border: '1px solid #10B98140', color: '#10B981', fontWeight: 800, textAlign: 'center' }}>
                                Change to be returned: ${(parseFloat(inputValue) - remainingBalance).toFixed(2)}
                            </div>
                        )}
                    </div>
                );
            case 'terminal':
                return (
                    <div style={{ textAlign: 'center', padding: '40px 0', animation: 'posFadeInUp 0.3s' }}>
                        <Terminal size={80} color="var(--pos-action-primary)" style={{ marginBottom: '24px' }} />
                        <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Integrated Terminal</h2>
                        <p style={{ color: 'var(--pos-text-muted)', fontWeight: 600, marginBottom: '32px' }}>Awaiting hardware handshake...</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', borderRadius: '100px', background: '#10B98115', color: '#10B981', fontWeight: 800, fontSize: '13px' }}>
                            <div className="pulse-dot" /> TERMINAL ID: T-800-ONLINE
                        </div>
                    </div>
                );
            case 'gift_card':
                return (
                    <div style={{ animation: 'posFadeInUp 0.3s' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Gift Card Redemption</h2>
                        <InputRow label="Gift Card Number" value={giftCardData.number} onChange={(v: string) => setGiftCardData({ ...giftCardData, number: v })} placeholder="GC-XXXX-XXXX" />
                        <InputRow label="PIN (Optional)" value={giftCardData.pin} onChange={(v: string) => setGiftCardData({ ...giftCardData, pin: v })} placeholder="****" type="password" />
                        <button
                            onClick={() => setGiftCardData({ ...giftCardData, balance: MOCK_WALLETS[giftCardData.number] || 0 })}
                            style={{ width: '100%', height: '48px', borderRadius: '10px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-action-primary)', color: 'var(--pos-action-primary)', fontWeight: 800, cursor: 'pointer', marginBottom: '20px' }}
                        >CHECK BALANCE</button>
                        {giftCardData.balance !== null && (
                            <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)', textAlign: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', display: 'block' }}>AVAILABLE BALANCE</span>
                                <span style={{ fontSize: '28px', fontWeight: 900, color: giftCardData.balance >= remainingBalance ? '#10B981' : '#F59E0B' }}>${giftCardData.balance.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                );
            case 'wallet':
                return (
                    <div style={{ animation: 'posFadeInUp 0.3s' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Digital Wallet / App</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                            {['Apple Pay', 'Google Pay', 'Store Wallet'].map(w => (
                                <button key={w} onClick={() => setWalletData({ ...walletData, type: w })} style={{ height: '60px', borderRadius: '12px', border: '2px solid', borderColor: walletData.type === w ? 'var(--pos-action-primary)' : 'var(--pos-border-subtle)', background: walletData.type === w ? 'rgba(31,164,169,0.1)' : 'var(--pos-bg-card)', color: walletData.type === w ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>{w.toUpperCase()}</button>
                            ))}
                        </div>
                        <InputRow label="Mobile Number" value={walletData.mobile} onChange={(v: string) => setWalletData({ ...walletData, mobile: v })} placeholder="+1 (555) 000-0000" />
                        {walletData.type === 'Store Wallet' && <InputRow label="Authorization OTP" value={walletData.otp} onChange={(v: string) => setWalletData({ ...walletData, otp: v })} placeholder="6-digit code" />}
                    </div>
                );
            case 'loyalty_points':
                const maxPointsValue = availableLoyaltyPoints / POINTS_TO_DOLLAR_RATE;
                const maxRedeemable = Math.min(maxPointsValue, remainingBalance);
                return (
                    <div style={{ animation: 'posFadeInUp 0.3s' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Redeem Loyalty Points</h2>
                        <div style={{ background: 'var(--pos-bg-surface)', padding: '24px', borderRadius: '20px', marginBottom: '24px', border: '1px solid var(--pos-border-subtle)' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-muted)', marginBottom: '4px' }}>AVAILABLE POINTS</div>
                            <div style={{ fontSize: '42px', fontWeight: 900, color: '#F97316' }}>{availableLoyaltyPoints.toLocaleString()}</div>
                            <div style={{ fontSize: '14px', color: 'var(--pos-text-muted)', marginTop: '8px' }}>= ${maxPointsValue.toFixed(2)} ({POINTS_TO_DOLLAR_RATE} points = $1)</div>
                        </div>
                        <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Points to Redeem</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                            {[25, 50, 75, 100].map(pct => {
                                const points = Math.floor((maxRedeemable * pct / 100) * POINTS_TO_DOLLAR_RATE);
                                const value = points / POINTS_TO_DOLLAR_RATE;
                                return (
                                    <button key={pct} onClick={() => { setLoyaltyPointsToRedeem(points); setInputValue(value.toFixed(2)); }} style={{ height: '60px', borderRadius: '12px', background: loyaltyPointsToRedeem === points ? 'var(--pos-action-primary)' : 'var(--pos-bg-card)', color: loyaltyPointsToRedeem === points ? 'white' : 'var(--pos-text-primary)', border: '2px solid var(--pos-border-subtle)', fontWeight: 900, fontSize: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div>{pct}%</div>
                                        <div style={{ fontSize: '11px', opacity: 0.7 }}>{points} pts</div>
                                    </button>
                                );
                            })}
                        </div>
                        <input type="number" placeholder="Enter points" value={loyaltyPointsToRedeem || ''} onChange={e => { const pts = parseInt(e.target.value) || 0; const capped = Math.min(pts, Math.floor(maxRedeemable * POINTS_TO_DOLLAR_RATE)); setLoyaltyPointsToRedeem(capped); setInputValue((capped / POINTS_TO_DOLLAR_RATE).toFixed(2)); }} style={{ width: '100%', height: '56px', background: 'var(--pos-bg-surface)', border: '2px solid var(--pos-border-subtle)', borderRadius: '12px', padding: '0 16px', fontSize: '18px', fontWeight: 700, color: 'var(--pos-text-primary)', marginBottom: '16px' }} />
                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', color: '#F97316', fontWeight: 700, textAlign: 'center' }}>
                            Redeeming {loyaltyPointsToRedeem} points = ${(loyaltyPointsToRedeem / POINTS_TO_DOLLAR_RATE).toFixed(2)}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="pos-screen" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--pos-bg-main)' }}>

            {/* Header */}
            <header style={{ height: '80px', background: 'var(--pos-bg-surface)', borderBottom: '1px solid var(--pos-border-subtle)', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button onClick={() => router.back()} className="pos-btn-secondary" style={{ height: '56px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 900 }}>
                        <ArrowLeft size={20} /> BACK
                    </button>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 900 }}>Enterprise Payment System</h1>
                        <span style={{ fontSize: '11px', color: 'var(--pos-text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                            {session?.store?.name || 'TERMINAL 01'} • {isSplitMode ? 'SPLIT PAYMENT ACTIVE' : 'SELECT TENDER'}
                        </span>
                    </div>
                </div>
                <button disabled={!isFullyPaid} onClick={handleCompleteOrder} className="pos-btn-primary" style={{ height: '56px', padding: '0 32px', borderRadius: '12px', background: isFullyPaid ? '#10B981' : 'var(--pos-bg-surface)', border: 'none', fontWeight: 900, boxShadow: isFullyPaid ? '0 8px 16px rgba(16,185,129,0.3)' : 'none', opacity: isFullyPaid ? 1 : 0.5, cursor: isFullyPaid ? 'pointer' : 'not-allowed' }}>
                    COMPLETE SESSION
                </button>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* LEFT: Interaction */}
                <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    {paymentState === 'PROCESSING' ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                            <Loader2 size={80} className="spin" color="var(--pos-action-primary)" />
                            <div style={{ textAlign: 'center' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>{terminalStatus}</h1>
                                <p style={{ color: 'var(--pos-text-muted)', fontSize: '18px', fontWeight: 600 }}>Awaiting backend confirmation...</p>
                            </div>
                        </div>
                    ) : (paymentState === 'SELECTING' && !isSplitMode) ? (
                        <div style={{ animation: 'posFadeInUp 0.3s' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '24px' }}>Primary Tender Selection</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                {[
                                    { id: 'cash', label: 'CASH', icon: Banknote, color: '#10B981' },
                                    { id: 'card', label: 'DEBIT/CREDIT', icon: CreditCard, color: '#3B82F6' },
                                    { id: 'terminal', label: 'INTEGRATED Terminal', icon: Terminal, color: '#8B5CF6' },
                                    { id: 'wallet', label: 'E-WALLET / APP', icon: Wallet, color: '#F59E0B' },
                                    { id: 'gift_card', label: 'GIFT VOUCHER', icon: Gift, color: '#EC4899' },
                                    { id: 'loyalty_points', label: 'LOYALTY POINTS', icon: Gift, color: '#F97316', disabled: !customer || availableLoyaltyPoints === 0 },
                                    { id: 'split', label: 'SPLIT PAYMENT', icon: Split, color: '#64748B' },
                                ].map(m => (
                                    <button key={m.id} onClick={() => !m.disabled && handleMethodSelect(m.id)} className="pos-card hover-glow" style={{ padding: '32px', borderRadius: '24px', border: '2px solid var(--pos-border-subtle)', background: 'var(--pos-bg-card)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '24px', cursor: m.disabled ? 'not-allowed' : 'pointer', opacity: m.disabled ? 0.5 : 1 }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><m.icon size={36} /></div>
                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: 900 }}>{m.label}</div>
                                            {m.id === 'loyalty_points' && (
                                                <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', marginTop: '4px' }}>
                                                    {customer ? `${availableLoyaltyPoints} pts available` : 'No customer selected'}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'posFadeInUp 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{currentMethod ? 'Payment Details' : 'Select Split Method'}</h2>
                                <button onClick={() => { setCurrentMethod(null); setPaymentState('SELECTING'); }} className="pos-btn-secondary" style={{ height: '40px', padding: '0 16px', borderRadius: '10px' }}>CANCEL</button>
                            </div>

                            {isSplitMode && !currentMethod && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    {[
                                        { id: 'cash', icon: Banknote, label: 'CASH' },
                                        { id: 'card', icon: CreditCard, label: 'CARD' },
                                        { id: 'terminal', icon: Terminal, label: 'TERMINAL' },
                                        { id: 'wallet', icon: Wallet, label: 'WALLET' },
                                        { id: 'gift_card', icon: Gift, label: 'GIFT' },
                                        { id: 'loyalty_points', icon: Gift, label: 'LOYALTY', disabled: !customer || availableLoyaltyPoints === 0 },
                                    ].map(m => (
                                        <button key={m.id} onClick={() => !m.disabled && handleMethodSelect(m.id)} style={{ height: '100px', borderRadius: '20px', border: '2px solid var(--pos-border-subtle)', background: 'var(--pos-bg-card)', color: 'var(--pos-text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: m.disabled ? 'not-allowed' : 'pointer', fontWeight: 800, opacity: m.disabled ? 0.5 : 1 }}>
                                            <m.icon size={32} />
                                            <span style={{ fontSize: '12px' }}>{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentMethod && (
                                <div className="pos-card" style={{ padding: '32px', borderRadius: '24px', background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)', marginBottom: '32px' }}>
                                    <MethodPanel />
                                    {paymentError && <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#EF4444', fontWeight: 700, margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}><AlertCircle size={20} /> {paymentError}</div>}
                                    <div style={{ marginTop: '32px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Tender Amount</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '32px', fontWeight: 900, color: 'var(--pos-text-muted)' }}>$</span>
                                            <input type="text" value={inputValue} readOnly={currentMethod !== 'cash'} onChange={e => setInputValue(e.target.value)} style={{ width: '100%', height: '80px', background: 'var(--pos-bg-surface)', border: '2px solid var(--pos-action-primary)', borderRadius: '16px', padding: '0 20px 0 50px', fontSize: '38px', fontWeight: 900, color: 'var(--pos-text-primary)' }} />
                                        </div>
                                    </div>
                                    <button onClick={handleProcessTransaction} disabled={isFullyPaid} className="pos-btn-primary" style={{ width: '100%', height: '80px', borderRadius: '20px', fontSize: '20px', fontWeight: 900, marginTop: '32px' }}>CONFIRM & PROCESS</button>
                                </div>
                            )}

                            {currentMethod === 'cash' && (
                                <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map(v => (
                                        <button key={v} onClick={() => {
                                            if (v === 'C') setInputValue('');
                                            else if (v === '.') !inputValue.includes('.') && setInputValue(prev => prev + String(v));
                                            else setInputValue(prev => (prev === '0.00' || prev === '0') ? String(v) : prev + String(v));
                                        }} style={{ height: '70px', borderRadius: '16px', background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)', fontSize: '24px', fontWeight: 800, color: 'var(--pos-text-primary)', cursor: 'pointer' }}>{v}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: Summary */}
                <div style={{ width: '500px', background: 'var(--pos-bg-surface)', borderLeft: '1px solid var(--pos-border-subtle)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                        {/* Total Paid and Remaining Section - Moved to Top */}
                        <div style={{ padding: '24px', background: 'var(--pos-bg-card)', borderRadius: '16px', border: '1px solid var(--pos-border-subtle)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ fontWeight: 800, color: 'var(--pos-text-muted)' }}>TOTAL PAID</span><span style={{ fontWeight: 900, fontSize: '20px', color: '#10B981' }}>${amountPaid.toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 800, color: 'var(--pos-text-muted)' }}>REMAINING</span><span style={{ fontWeight: 900, fontSize: '32px', color: remainingBalance > 0 ? 'var(--pos-action-primary)' : '#10B981' }}>${remainingBalance.toFixed(2)}</span></div>
                            {changeDue > 0 && (
                                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                                    <span style={{ fontWeight: 800 }}>CHANGE DUE</span>
                                    <span style={{ fontWeight: 950, fontSize: '24px' }}>${changeDue.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Customer Info & Loyalty Points */}
                        {customer && (
                            <div className="pos-card" style={{ padding: '20px', borderRadius: '16px', background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 900 }}>{customer.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>{customer.phone}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 800 }}>LOYALTY</div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#F97316' }}>{availableLoyaltyPoints}</div>
                                    </div>
                                </div>
                                {customer.recentOrders && customer.recentOrders.length > 0 && (
                                    <button onClick={() => setShowCustomerHistory(!showCustomerHistory)} style={{ width: '100%', padding: '8px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: 'var(--pos-action-primary)', cursor: 'pointer', marginTop: '12px' }}>
                                        {showCustomerHistory ? 'HIDE' : 'VIEW'} ORDER HISTORY ({customer.recentOrders.length})
                                    </button>
                                )}
                                {showCustomerHistory && customer.recentOrders && (
                                    <div style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {customer.recentOrders.map((order, idx) => (
                                            <div key={idx} style={{ padding: '12px', background: 'var(--pos-bg-surface)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--pos-border-subtle)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-action-primary)' }}>{order.id}</span>
                                                    <span style={{ fontSize: '12px', fontWeight: 900 }}>${order.amount.toFixed(2)}</span>
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--pos-text-muted)', marginBottom: '4px' }}>{order.date}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--pos-text-primary)' }}>{order.items}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 900 }}>Payment Breakdown</h3>
                            <button onClick={() => setShowDiscountPanel(!showDiscountPanel)} className="pos-btn-secondary" style={{ height: '36px', padding: '0 12px', borderRadius: '8px', color: 'var(--pos-action-primary)', fontSize: '12px', fontWeight: 800 }}>+ DISCOUNT</button>
                        </div>

                        {showDiscountPanel && (
                            <div className="pos-card" style={{ marginBottom: '24px', padding: '20px', border: '2px solid var(--pos-action-primary)', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span style={{ fontWeight: 900, fontSize: '14px' }}>PROMOTIONS</span><X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowDiscountPanel(false)} /></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                    {MOCK_COUPONS.map(c => <button key={c.id} onClick={() => handleApplyCoupon(c)} style={{ padding: '12px', borderRadius: '10px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)', textAlign: 'left', cursor: 'pointer' }}><div style={{ fontWeight: 900, fontSize: '13px', color: 'var(--pos-action-primary)' }}>{c.name}</div><div style={{ fontSize: '11px', color: 'var(--pos-text-muted)' }}>{c.description}</div></button>)}
                                </div>
                                <div style={{ borderTop: '1px solid var(--pos-border-subtle)', paddingTop: '16px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 900, display: 'block', marginBottom: '12px' }}>MANUAL ADJUSTMENT</span>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '8px', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', background: 'var(--pos-bg-surface)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--pos-border-subtle)' }}>
                                            <button onClick={() => setManualType('PERCENT')} style={{ padding: '8px 12px', background: manualType === 'PERCENT' ? 'var(--pos-action-primary)' : 'transparent', color: manualType === 'PERCENT' ? 'white' : 'var(--pos-text-muted)', border: 'none', fontWeight: 900 }}>%</button>
                                            <button onClick={() => setManualType('FLAT')} style={{ padding: '8px 12px', background: manualType === 'FLAT' ? 'var(--pos-action-primary)' : 'transparent', color: manualType === 'FLAT' ? 'white' : 'var(--pos-text-muted)', border: 'none', fontWeight: 900 }}>$</button>
                                        </div>
                                        <input type="text" placeholder="Value" value={manualValue} onChange={e => setManualValue(e.target.value)} style={{ height: '40px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)', borderRadius: '8px', padding: '0 12px', fontWeight: 800 }} />
                                    </div>
                                    <input type="text" placeholder="Reason for override..." value={manualReason} onChange={e => setManualReason(e.target.value)} style={{ width: '100%', height: '40px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)', borderRadius: '8px', padding: '0 12px', fontWeight: 600, fontSize: '12px', marginBottom: '12px' }} />
                                    <button onClick={handleApplyManualDiscountRequest} className="pos-btn-primary" style={{ width: '100%', height: '44px', borderRadius: '10px', fontSize: '13px' }}>APPLY ADJUSTMENT</button>
                                </div>
                            </div>
                        )}

                        <div className="pos-card" style={{ padding: '24px', borderRadius: '20px', background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)' }}>
                            <PricingRow label="Order Subtotal" value={subtotal} />
                            {appliedDiscount && <PricingRow label={`${appliedDiscount.name} (${appliedDiscount.type === 'PERCENT' ? appliedDiscount.value + '%' : '$' + appliedDiscount.value})`} value={discountAmount} isNeg color="#EF4444" />}
                            <PricingRow label="Tax (8%)" value={taxAmount} />
                            {deliveryFee > 0 && <PricingRow label="Delivery Fee" value={deliveryFee} />}
                            {tipAmount > 0 && <PricingRow label="Gratuity (Tip)" value={tipAmount} color="var(--pos-action-primary)" />}
                            <div style={{ margin: '20px 0', borderTop: '2px dashed var(--pos-border-subtle)' }} />
                            <PricingRow label="TOTAL AMOUNT" value={totalAmountDue} isBold />
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '16px', color: 'var(--pos-text-muted)' }}>TRANSACTION HISTORY</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {transactions.map((t, idx) => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)', animation: 'posFadeInUp 0.3s' }}>
                                        <div>
                                            <div style={{ fontWeight: 900, fontSize: '14px' }}>{t.method.toUpperCase()} {t.last4 ? `(****${t.last4})` : ''}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--pos-text-muted)', fontWeight: 700 }}>{t.timestamp.toLocaleTimeString()} • {t.reference_id}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div>
                                                <div style={{ fontWeight: 900, fontSize: '16px', color: '#10B981' }}>+ ${t.amount.toFixed(2)}</div>
                                                {t.tip > 0 && <div style={{ fontSize: '11px', color: 'var(--pos-action-primary)', fontWeight: 800 }}>Tip: ${t.tip.toFixed(2)}</div>}
                                            </div>
                                            {idx === transactions.length - 1 && (
                                                <button onClick={() => initiateReversal(t.id)} style={{ color: '#EF4444', border: 'none', background: 'transparent', cursor: 'pointer' }} title="Reverse Transaction"><RotateCcw size={18} /></button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--pos-text-muted)', fontWeight: 600, border: '2px dashed var(--pos-border-subtle)', borderRadius: '20px' }}>No payments recorded</div>}
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* PIN Prompt Modal */}
            {showPinPrompt && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'posFadeInUp 0.1s' }}>
                    <div className="pos-card" style={{ width: '400px', padding: '48px', borderRadius: '32px', textAlign: 'center', background: 'var(--pos-bg-card)' }}>
                        <ShieldCheck size={64} color="var(--pos-action-primary)" style={{ marginBottom: '24px' }} />
                        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Manager PIN</h2>
                        <p style={{ color: 'var(--pos-text-muted)', fontWeight: 600, marginBottom: '32px' }}>{pinPurpose === 'DISCOUNT' ? 'Authorize high-value discount' : 'Authorize transaction reversal'}</p>
                        <input type="password" placeholder="••••" value={pinValue} onChange={e => setPinValue(e.target.value)} autoFocus style={{ width: '100%', height: '72px', background: 'var(--pos-bg-surface)', border: '2px solid var(--pos-border-subtle)', borderRadius: '16px', textAlign: 'center', fontSize: '48px', letterSpacing: '16px', fontWeight: 900, marginBottom: '32px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button onClick={() => { setShowPinPrompt(false); setPinValue(''); }} className="pos-btn-secondary" style={{ height: '60px', borderRadius: '14px' }}>CANCEL</button>
                            <button onClick={handlePinSubmit} className="pos-btn-primary" style={{ height: '60px', borderRadius: '14px' }}>CONFIRM</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spin { animation: spin 0.8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes posFadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .hover-glow:hover { box-shadow: 0 0 35px rgba(31, 164, 169, 0.2); border-color: var(--pos-action-primary) !important; transform: translateY(-2px); }
                .pulse-dot { width: 8px; height: 8px; background: #10B981; border-radius: 50%; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
            `}</style>
        </div>
    );
};

export default POSPaymentScreen;
