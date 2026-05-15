'use client';

import { useEffect, useState } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { paymentService, type TerminalEvent } from '@/services/kiosk/paymentService';
import { posService } from '@/services/kiosk/posService';
import { CreditCard, Smartphone, Wifi, XCircle, CheckCircle2, RefreshCcw } from 'lucide-react';

type PaymentPhase = 'initializing' | 'waiting' | 'card_detected' | 'processing' | 'approved' | 'declined' | 'error';

export function PaymentScreen() {
    const {
        cart,
        totals,
        orderType,
        identity,
        selectedRestaurant,
        setPaymentStatus,
        navigateTo,
        goBack,
    } = useKioskStore();

    const [phase, setPhase] = useState<PaymentPhase>('initializing');
    const [statusMessage, setStatusMessage] = useState('Initializing terminal...');

    useEffect(() => {
        startPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startPayment = async () => {
        setPhase('initializing');
        setStatusMessage('Connecting to terminal...');

        // Initialize terminal
        await paymentService.initTerminal();

        // Submit order to POS first
        try {
            const orderResponse = await posService.submitOrder({
                items: cart,
                orderType,
                customerId: identity?.id,
                restaurantId: selectedRestaurant?.id || 'default',
                subtotal: totals.subtotal,
                tax: totals.tax,
                total: totals.total,
            });


            // Now process payment
            const result = await paymentService.processPayment(
                { amount: totals.total, orderId: orderResponse.orderId },
                (event: TerminalEvent) => {
                    switch (event.type) {
                        case 'waiting':
                            setPhase('waiting');
                            setStatusMessage(event.message);
                            break;
                        case 'card_detected':
                            setPhase('card_detected');
                            setStatusMessage(event.message);
                            break;
                        case 'processing':
                            setPhase('processing');
                            setStatusMessage(event.message);
                            break;
                        case 'approved':
                            setPhase('approved');
                            setStatusMessage('Payment approved!');
                            break;
                        case 'declined':
                            setPhase('declined');
                            setStatusMessage(event.message);
                            break;
                        case 'error':
                            setPhase('error');
                            setStatusMessage(event.message);
                            break;
                    }
                }
            );

            if (result.success) {
                setPaymentStatus('success', 'Payment successful');
                setTimeout(() => {
                    navigateTo('success');
                }, 1200);
            }
        } catch {
            setPhase('error');
            setStatusMessage('An error occurred. Please try again.');
        }
    };

    const handleRetry = () => {
        startPayment();
    };

    const handleCancel = async () => {
        await paymentService.cancelPayment();
        setPaymentStatus('idle', '');
        goBack();
    };

    return (
        <div className="kiosk-payment-screen">
            <div className="kiosk-payment-content">
                {/* Amount */}
                <div className="kiosk-payment-amount">
                    <span className="kiosk-payment-amount-label">Amount Due</span>
                    <span className="kiosk-payment-amount-value">${totals.total.toFixed(2)}</span>
                </div>

                {/* Terminal Animation */}
                <div className="kiosk-payment-terminal">
                    {(phase === 'initializing' || phase === 'waiting') && (
                        <div className="kiosk-payment-icon-group">
                            <div className="kiosk-payment-icon pulse">
                                <CreditCard size={80} />
                            </div>
                            <div className="kiosk-payment-divider-icon">
                                <Wifi size={32} />
                            </div>
                            <div className="kiosk-payment-icon pulse delay">
                                <Smartphone size={80} />
                            </div>
                        </div>
                    )}

                    {phase === 'card_detected' && (
                        <div className="kiosk-payment-icon-single pulse">
                            <CreditCard size={100} />
                        </div>
                    )}

                    {phase === 'processing' && (
                        <div className="kiosk-payment-processing">
                            <div className="kiosk-payment-spinner" />
                        </div>
                    )}

                    {phase === 'approved' && (
                        <div className="kiosk-payment-icon-single success">
                            <CheckCircle2 size={100} />
                        </div>
                    )}

                    {(phase === 'declined' || phase === 'error') && (
                        <div className="kiosk-payment-icon-single error">
                            <XCircle size={100} />
                        </div>
                    )}
                </div>

                {/* Status Message */}
                <div className="kiosk-payment-status">
                    <h2>{statusMessage}</h2>
                    {phase === 'waiting' && (
                        <p className="kiosk-payment-hint">Tap, insert, or swipe your card on the terminal below</p>
                    )}
                </div>

                {/* Actions */}
                <div className="kiosk-payment-actions">
                    {(phase === 'declined' || phase === 'error') && (
                        <button onClick={handleRetry} className="kiosk-payment-retry-btn">
                            <RefreshCcw size={24} /> Try Again
                        </button>
                    )}
                    {phase !== 'approved' && phase !== 'processing' && (
                        <button onClick={handleCancel} className="kiosk-payment-cancel-btn">
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
