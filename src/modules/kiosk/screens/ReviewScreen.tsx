'use client';

import { useState } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { posService } from '@/services/kiosk/posService';
import { ArrowLeft, X, Printer } from 'lucide-react';

export function ReviewScreen() {
    const {
        cart,
        totals,
        orderType,
        setOrderType,
        removeCartItem,
        navigateTo,
        goBack,
    } = useKioskStore();

    const [printerError, setPrinterError] = useState(false);

    const handlePayNow = async () => {
        // Hardware Handshake: Printer Check
        const printerStatus = await posService.checkPrinter();
        if (!printerStatus.hasPaper) {
            setPrinterError(true);
            return;
        }
        navigateTo('payment');
    };

    if (cart.length === 0) {
        return (
            <div className="kiosk-empty-cart">
                <h1>Your order is empty</h1>
                <button onClick={() => navigateTo('menu')} className="kiosk-empty-cart-btn">
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="kiosk-review-screen">
            {/* Header */}
            <header className="kiosk-review-header">
                <button onClick={goBack} className="kiosk-back-btn">
                    <ArrowLeft size={32} />
                </button>
                <h1>My Order</h1>
                <div style={{ width: 68 }} />
            </header>

            <main className="kiosk-review-main">
                {/* Order Type */}
                <div className="kiosk-review-order-type">
                    {(['dine-in', 'to-go'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setOrderType(type)}
                            className={`kiosk-review-type-btn ${orderType === type ? 'active' : ''}`}
                        >
                            {type === 'dine-in' ? '🍜 Dine In' : '🥡 To Go'}
                        </button>
                    ))}
                </div>

                {/* Items */}
                <div className="kiosk-review-items">
                    {cart.map((item, idx) => (
                        <div key={idx} className="kiosk-review-item">
                            <div className="kiosk-review-item-left">
                                <div className="kiosk-review-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="kiosk-review-item-info">
                                    <h3>{item.name}</h3>
                                    {item.toppings && item.toppings.length > 0 ? (
                                        <div className="kiosk-review-item-toppings">
                                            {item.toppings.map((t, i) => (
                                                <span key={i}>{t.name}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Standard Prep</p>
                                    )}
                                    {item.quantity > 1 && (
                                        <span className="kiosk-review-item-qty">Qty: {item.quantity}</span>
                                    )}
                                </div>
                            </div>
                            <div className="kiosk-review-item-right">
                                <span className="kiosk-review-item-price">${item.finalTotal.toFixed(2)}</span>
                                <button onClick={() => removeCartItem(idx)} className="kiosk-review-remove-btn">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="kiosk-review-summary">
                    <div className="kiosk-review-summary-row">
                        <span>Sub-total</span>
                        <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="kiosk-review-summary-row">
                        <span>Tax (HST)</span>
                        <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="kiosk-review-summary-divider" />
                    <div className="kiosk-review-summary-total">
                        <span>Total</span>
                        <span>${totals.total.toFixed(2)}</span>
                    </div>
                </div>
            </main>

            {/* Bottom Actions */}
            <div className="kiosk-review-bottom">
                <button onClick={() => navigateTo('menu')} className="kiosk-review-more-btn">
                    Order More
                </button>
                <button onClick={handlePayNow} className="kiosk-review-pay-btn">
                    <span>Confirm & Pay</span>
                    <span className="kiosk-review-pay-total">${totals.total.toFixed(2)}</span>
                </button>
            </div>

            {/* Printer Error */}
            {printerError && (
                <div className="kiosk-modal-overlay">
                    <div className="kiosk-modal">
                        <div className="kiosk-modal-icon error">
                            <Printer size={56} />
                        </div>
                        <h2>Printer Unavailable</h2>
                        <p>We are out of receipt paper. Please alert a staff member.</p>
                        <button onClick={() => setPrinterError(false)} className="kiosk-modal-btn">
                            Retry Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
