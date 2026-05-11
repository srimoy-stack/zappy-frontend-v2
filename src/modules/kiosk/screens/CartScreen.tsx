'use client';

import { useEffect, useState } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { menuService, type Product } from '@/services/kiosk/menuService';
import { ArrowLeft, Trash2, Plus, Minus, Edit3, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

export function CartScreen() {
    const {
        cart,
        totals,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        addToCart,
        navigateTo,
        goBack,
    } = useKioskStore();

    const [upsells, setUpsells] = useState<Product[]>([]);
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchUpsells = async () => {
            const data = await menuService.getUpsellProducts();
            setUpsells(data);
        };
        fetchUpsells();
    }, []);

    const toggleExpand = (index: number) => {
        setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleUpsellAdd = (product: Product) => {
        if (product.type === 'pizza') {
            navigateTo('builder');
            return;
        }
        addToCart({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            basePrice: product.price,
            image: product.image,
            selectedModifiers: {},
            selectedCombo: {},
            quantity: 1,
            kitchenNote: '',
            price: product.price,
            finalTotal: product.price,
            type: 'item',
        });
    };

    if (cart.length === 0) {
        return (
            <div className="kiosk-empty-cart">
                <div className="kiosk-empty-cart-icon">
                    <ShoppingBag size={100} />
                </div>
                <h1>Your cart is empty</h1>
                <p>Looks like you haven&apos;t added anything yet.</p>
                <button onClick={() => navigateTo('menu')} className="kiosk-empty-cart-btn">
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="kiosk-cart-screen">
            {/* Header */}
            <header className="kiosk-cart-header">
                <div className="kiosk-cart-header-left">
                    <button onClick={goBack} className="kiosk-back-btn">
                        <ArrowLeft size={32} />
                    </button>
                    <h1>Your Order</h1>
                </div>
                <div className="kiosk-cart-item-count">
                    <ShoppingBag size={20} />
                    <span>{cart.length} Item{cart.length !== 1 ? 's' : ''}</span>
                </div>
            </header>

            {/* Cart Items */}
            <main className="kiosk-cart-main">
                <div className="kiosk-cart-items">
                    {cart.map((item, index) => {
                        const hasCustomizations = (item.modifierNames?.length || 0) > 0 || (item.comboNames?.length || 0) > 0;
                        const isExpanded = expandedItems[index];

                        return (
                            <div key={`${item.productId}-${index}`} className="kiosk-cart-item">
                                <div className="kiosk-cart-item-row">
                                    <div className="kiosk-cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="kiosk-cart-item-details">
                                        <div className="kiosk-cart-item-top">
                                            <h3>{item.name}</h3>
                                            <span className="kiosk-cart-item-price">${item.finalTotal.toFixed(2)}</span>
                                        </div>

                                        {hasCustomizations && (
                                            <button onClick={() => toggleExpand(index)} className="kiosk-cart-item-details-btn">
                                                Details {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        )}

                                        {item.kitchenNote && (
                                            <span className="kiosk-cart-item-note">&quot;{item.kitchenNote}&quot;</span>
                                        )}

                                        <div className="kiosk-cart-item-actions">
                                            <div className="kiosk-cart-qty-control">
                                                <button onClick={() => updateCartItemQuantity(index, -1)} className="kiosk-qty-btn">
                                                    <Minus size={20} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateCartItemQuantity(index, 1)} className="kiosk-qty-btn">
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                            <div className="kiosk-cart-item-edit-btns">
                                                <button
                                                    onClick={() => navigateTo('product', { productId: item.productId, editIndex: index })}
                                                    className="kiosk-cart-edit-btn"
                                                >
                                                    <Edit3 size={20} />
                                                </button>
                                                <button onClick={() => removeCartItem(index)} className="kiosk-cart-delete-btn">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && hasCustomizations && (
                                    <div className="kiosk-cart-item-expanded">
                                        {item.comboNames && item.comboNames.length > 0 && (
                                            <div className="kiosk-cart-detail-group">
                                                <span className="kiosk-cart-detail-label">Combo Choices</span>
                                                {item.comboNames.map((name, i) => (
                                                    <span key={i} className="kiosk-cart-detail-value">• {name}</span>
                                                ))}
                                            </div>
                                        )}
                                        {item.modifierNames && item.modifierNames.length > 0 && (
                                            <div className="kiosk-cart-detail-group">
                                                <span className="kiosk-cart-detail-label">Modifiers</span>
                                                {item.modifierNames.map((name, i) => (
                                                    <span key={i} className="kiosk-cart-detail-value">• {name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Upsells */}
                {upsells.length > 0 && (
                    <div className="kiosk-cart-upsells">
                        <h4>Complete Your Meal</h4>
                        <div className="kiosk-cart-upsell-scroll">
                            {upsells.map(product => (
                                <div key={product.id} className="kiosk-cart-upsell-card">
                                    <div className="kiosk-cart-upsell-image">
                                        <img src={product.image} alt={product.name} />
                                    </div>
                                    <div className="kiosk-cart-upsell-info">
                                        <h5>{product.name}</h5>
                                        <span>${product.price.toFixed(2)}</span>
                                    </div>
                                    <button onClick={() => handleUpsellAdd(product)} className="kiosk-cart-upsell-add">
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pricing */}
                <div className="kiosk-cart-pricing">
                    <div className="kiosk-cart-pricing-row">
                        <span>Subtotal</span>
                        <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="kiosk-cart-pricing-row">
                        <span>Tax (10%)</span>
                        <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="kiosk-cart-pricing-row">
                        <span>Service Charge</span>
                        <span>${totals.serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="kiosk-cart-pricing-divider" />
                    <div className="kiosk-cart-pricing-total">
                        <span>Total</span>
                        <span>${totals.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Clear */}
                <button onClick={() => clearCart()} className="kiosk-cart-clear-btn">
                    Clear Order
                </button>
            </main>

            {/* Bottom Checkout */}
            <div className="kiosk-cart-bottom">
                <button onClick={() => navigateTo('review')} className="kiosk-cart-checkout-btn">
                    <span>Checkout Now</span>
                    <span className="kiosk-cart-checkout-total">${totals.total.toFixed(2)}</span>
                </button>
            </div>
        </div>
    );
}
