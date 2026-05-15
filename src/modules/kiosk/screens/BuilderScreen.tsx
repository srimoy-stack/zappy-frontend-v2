'use client';

import { useState } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import PizzaBuilder from '@/modules/kiosk/components/PizzaBuilder';
import { ArrowLeft } from 'lucide-react';

/**
 * Smart Upsell Logic (from requirements):
 *  - If pizza exists + No Drink → "Thirsty? Add a 2L Soda."
 *  - If pizza exists + No Dip → "Add Creamy Garlic Dipping Sauce."
 *  - If both exist → skip upsell
 */
function getSmartUpsell(cart: ReturnType<typeof useKioskStore.getState>['cart']) {
    const hasDrink = cart.some(item =>
        item.productId === 'drink-1' || item.name.toLowerCase().includes('cola') || item.name.toLowerCase().includes('soda')
    );
    const hasDip = cart.some(item =>
        item.productId === 'side-2' || item.name.toLowerCase().includes('dip')
    );

    if (!hasDrink) {
        return {
            type: 'drink' as const,
            title: 'Thirsty?',
            subtitle: 'Add a 2L Coca-Cola for just $3.49',
            image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
            product: {
                id: Math.random().toString(36).substr(2, 9),
                productId: 'drink-1',
                name: '2L Coca-Cola',
                basePrice: 3.49,
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
                selectedModifiers: {},
                selectedCombo: {},
                quantity: 1,
                kitchenNote: '',
                price: 3.49,
                finalTotal: 3.49,
                type: 'item' as const,
            },
            btnText: 'Add Drink — $3.49',
        };
    }

    if (!hasDip) {
        return {
            type: 'dip' as const,
            title: 'Perfect Pairing!',
            subtitle: 'Add Creamy Garlic Dipping Sauce for just $0.99',
            image: 'https://images.unsplash.com/photo-1571217623102-3f86e300971e?w=500',
            product: {
                id: Math.random().toString(36).substr(2, 9),
                productId: 'side-2',
                name: 'Creamy Garlic Dip',
                basePrice: 0.99,
                image: 'https://images.unsplash.com/photo-1571217623102-3f86e300971e?w=500',
                selectedModifiers: {},
                selectedCombo: {},
                quantity: 1,
                kitchenNote: '',
                price: 0.99,
                finalTotal: 0.99,
                type: 'item' as const,
            },
            btnText: 'Add Dip — $0.99',
        };
    }

    return null; // Both exist, skip upsell
}

export function BuilderScreen() {
    const { addToCart, cart, pizzaBuilderState, resetBuilder, navigateTo, goBack } = useKioskStore();
    const [showUpsell, setShowUpsell] = useState(false);
    const handleAddToCart = (price: number) => {

        // Add pizza to cart first
        const SIZES = [
            { id: 'small', price: 10.99 },
            { id: 'medium', price: 13.99 },
            { id: 'large', price: 16.99 },
        ];
        const sizeObj = SIZES.find(s => s.id === pizzaBuilderState.size);
        const sizeName = pizzaBuilderState.size
            ? pizzaBuilderState.size.charAt(0).toUpperCase() + pizzaBuilderState.size.slice(1)
            : '';
        const crustName = pizzaBuilderState.crust
            ? pizzaBuilderState.crust.charAt(0).toUpperCase() + pizzaBuilderState.crust.slice(1)
            : '';

        addToCart({
            id: Math.random().toString(36).substr(2, 9),
            productId: 'byo-pizza',
            name: `${sizeName} ${crustName} Pizza`,
            basePrice: sizeObj?.price || 0,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
            selectedModifiers: {},
            selectedCombo: {},
            toppings: pizzaBuilderState.toppings,
            size: pizzaBuilderState.size!,
            crust: pizzaBuilderState.crust!,
            quantity: 1,
            kitchenNote: '',
            price: price,
            finalTotal: price,
            type: 'pizza',
        });

        // Check if smart upsell should be shown
        const upsell = getSmartUpsell([...cart]); // use pre-add cart for check
        if (upsell) {
            setShowUpsell(true);
        } else {
            resetBuilder();
            navigateTo('menu');
        }
    };

    const handleAcceptUpsell = () => {
        const upsell = getSmartUpsell(cart);
        if (upsell) {
            addToCart(upsell.product);
        }
        resetBuilder();
        navigateTo('menu');
    };

    const handleDeclineUpsell = () => {
        resetBuilder();
        navigateTo('menu');
    };

    const upsellData = getSmartUpsell(cart);

    return (
        <div className="kiosk-builder-screen">
            <header className="kiosk-builder-header">
                <button onClick={goBack} className="kiosk-back-btn">
                    <ArrowLeft size={32} />
                </button>
                <h1>Build Your Pizza</h1>
                <div style={{ width: 68 }} />
            </header>

            <div className="kiosk-builder-body">
                <PizzaBuilder onAddToCart={handleAddToCart} />
            </div>

            {/* Smart Upsell Modal */}
            {showUpsell && upsellData && (
                <div className="kiosk-modal-overlay">
                    <div className="kiosk-modal kiosk-upsell-modal">
                        <h2>{upsellData.title}</h2>
                        <p>{upsellData.subtitle}</p>
                        <div className="kiosk-upsell-image">
                            <img src={upsellData.image} alt="Upsell" />
                        </div>
                        <div className="kiosk-upsell-actions">
                            <button onClick={handleAcceptUpsell} className="kiosk-upsell-yes">
                                {upsellData.btnText}
                            </button>
                            <button onClick={handleDeclineUpsell} className="kiosk-upsell-no">
                                No thanks, just the pizza
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
