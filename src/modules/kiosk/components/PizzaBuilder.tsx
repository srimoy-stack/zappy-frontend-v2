'use client';

import { useState, useMemo } from 'react';
import { useKioskStore, type Topping } from '@/store/kioskStore';

const SIZES = [
    { id: 'small', name: 'Small', price: 10.99, size: '10"', icon: '🍕' },
    { id: 'medium', name: 'Medium', price: 13.99, size: '12"', icon: '🍕' },
    { id: 'large', name: 'Large', price: 16.99, size: '14"', icon: '🍕' },
];

const CRUSTS = [
    { id: 'thin', name: 'Thin Crust', upcharge: 0, desc: 'Classic crispy' },
    { id: 'pan', name: 'Pan Pizza', upcharge: 2.00, desc: 'Thick & fluffy' },
    { id: 'stuffed', name: 'Stuffed Crust', upcharge: 3.50, desc: 'Cheese filled' },
];

const TOPPINGS = [
    { id: 'pep', name: 'Pepperoni', icon: '🍖', category: 'meats' },
    { id: 'sausage', name: 'Sausage', icon: '🌭', category: 'meats' },
    { id: 'bacon', name: 'Bacon', icon: '🥓', category: 'meats' },
    { id: 'ham', name: 'Ham', icon: '🍗', category: 'meats' },
    { id: 'mush', name: 'Mushrooms', icon: '🍄', category: 'veggies' },
    { id: 'onion', name: 'Onions', icon: '🧅', category: 'veggies' },
    { id: 'olive', name: 'Olives', icon: '🫒', category: 'veggies' },
    { id: 'pepper', name: 'Bell Peppers', icon: '🫑', category: 'veggies' },
    { id: 'tomato', name: 'Tomatoes', icon: '🍅', category: 'veggies' },
    { id: 'pineapple', name: 'Pineapple', icon: '🍍', category: 'veggies' },
    { id: 'jalapeno', name: 'Jalapeños', icon: '🌶️', category: 'veggies' },
    { id: 'xcheese', name: 'Extra Cheese', icon: '🧀', category: 'cheese' },
];

const TIER_PRICE = 1.50;

interface PizzaBuilderProps {
    onAddToCart: (price: number) => void;
}

export default function PizzaBuilder({ onAddToCart }: PizzaBuilderProps) {
    const { pizzaBuilderState, updateBuilder, addTopping, removeTopping } = useKioskStore();
    const [step, setStep] = useState(1);
    const [selectedTopping, setSelectedTopping] = useState<string | null>(null);
    const [toppingCategory, setToppingCategory] = useState<'meats' | 'veggies' | 'cheese'>('meats');

    const handleZoneClick = (zone: 'left' | 'right' | 'whole') => {
        if (!selectedTopping) return;
        const existing = pizzaBuilderState.toppings.find(
            t => t.name === selectedTopping && t.zone === zone
        );
        if (existing) {
            removeTopping(selectedTopping, zone);
        } else {
            addTopping({ name: selectedTopping, zone, price: TIER_PRICE });
        }
    };

    const totalPrice = useMemo(() => {
        const sizePrice = SIZES.find(s => s.id === pizzaBuilderState.size)?.price || 0;
        const crustPrice = CRUSTS.find(c => c.id === pizzaBuilderState.crust)?.upcharge || 0;
        const toppingsPrice = pizzaBuilderState.toppings.length * TIER_PRICE;
        return sizePrice + crustPrice + toppingsPrice;
    }, [pizzaBuilderState.size, pizzaBuilderState.crust, pizzaBuilderState.toppings]);

    const filteredToppings = TOPPINGS.filter(t => t.category === toppingCategory);

    return (
        <div className="pizza-builder">
            {/* Progress Steps */}
            <div className="pizza-builder-progress">
                <div className={`pizza-builder-step ${step >= 1 ? 'active' : ''}`}>
                    <div className="pizza-builder-step-num">1</div>
                    <span>Size & Crust</span>
                </div>
                <div className="pizza-builder-step-line" />
                <div className={`pizza-builder-step ${step >= 2 ? 'active' : ''}`}>
                    <div className="pizza-builder-step-num">2</div>
                    <span>Toppings</span>
                </div>
            </div>

            {/* Step 1: Size & Crust */}
            {step === 1 && (
                <div className="pizza-builder-step1 kiosk-screen-enter">
                    <div className="pizza-builder-section">
                        <h2 className="pizza-builder-section-title">Choose Your Size</h2>
                        <div className="pizza-builder-size-grid">
                            {SIZES.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => updateBuilder({ size: s.id })}
                                    className={`pizza-builder-size-btn ${pizzaBuilderState.size === s.id ? 'selected' : ''}`}
                                >
                                    <span className="pizza-builder-size-icon">
                                        {s.id === 'small' ? '🍕' : s.id === 'medium' ? '🍕🍕' : '🍕🍕🍕'}
                                    </span>
                                    <span className="pizza-builder-size-name">{s.name}</span>
                                    <span className="pizza-builder-size-inches">{s.size}</span>
                                    <span className="pizza-builder-size-price">${s.price}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pizza-builder-section">
                        <h2 className="pizza-builder-section-title">Choose Your Crust</h2>
                        <div className="pizza-builder-crust-grid">
                            {CRUSTS.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => updateBuilder({ crust: c.id })}
                                    className={`pizza-builder-crust-btn ${pizzaBuilderState.crust === c.id ? 'selected' : ''}`}
                                >
                                    <span className="pizza-builder-crust-name">{c.name}</span>
                                    <span className="pizza-builder-crust-desc">{c.desc}</span>
                                    <span className="pizza-builder-crust-price">
                                        {c.upcharge > 0 ? `+$${c.upcharge.toFixed(2)}` : 'Included'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={!pizzaBuilderState.size || !pizzaBuilderState.crust}
                        onClick={() => setStep(2)}
                        className={`pizza-builder-next-btn ${(!pizzaBuilderState.size || !pizzaBuilderState.crust) ? 'disabled' : ''}`}
                    >
                        Next: Add Toppings →
                    </button>
                </div>
            )}

            {/* Step 2: Toppings */}
            {step === 2 && (
                <div className="pizza-builder-step2 kiosk-screen-enter">
                    <div className="pizza-builder-topping-layout">
                        {/* Left: Pizza Visual */}
                        <div className="pizza-builder-visual">
                            <div className="pizza-builder-instruction">
                                {selectedTopping
                                    ? <span>Tap a zone to place <strong>{selectedTopping}</strong></span>
                                    : <span>Select a topping, then tap the pizza</span>
                                }
                            </div>

                            <PizzaGraphic
                                toppings={pizzaBuilderState.toppings}
                                selectedTopping={selectedTopping}
                                onZoneClick={handleZoneClick}
                            />

                            {/* Active toppings list */}
                            <div className="pizza-builder-active-toppings">
                                <span className="pizza-builder-active-label">
                                    {pizzaBuilderState.toppings.length === 0
                                        ? 'Plain cheese — add toppings!'
                                        : `${pizzaBuilderState.toppings.length} topping${pizzaBuilderState.toppings.length !== 1 ? 's' : ''} added`
                                    }
                                </span>
                                <div className="pizza-builder-active-list">
                                    {pizzaBuilderState.toppings.map((t, i) => (
                                        <button
                                            key={i}
                                            onClick={() => removeTopping(t.name, t.zone)}
                                            className="pizza-builder-active-chip"
                                        >
                                            {TOPPINGS.find(to => to.name === t.name)?.icon} {t.name}
                                            <span className="pizza-builder-chip-zone">{t.zone}</span>
                                            <span className="pizza-builder-chip-x">×</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Topping Selector */}
                        <div className="pizza-builder-topping-panel">
                            {/* Category tabs */}
                            <div className="pizza-builder-topping-tabs">
                                {(['meats', 'veggies', 'cheese'] as const).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setToppingCategory(cat)}
                                        className={`pizza-builder-topping-tab ${toppingCategory === cat ? 'active' : ''}`}
                                    >
                                        {cat === 'meats' ? '🥩 Meats' : cat === 'veggies' ? '🥬 Veggies' : '🧀 Cheese'}
                                    </button>
                                ))}
                            </div>

                            {/* Topping grid */}
                            <div className="pizza-builder-topping-grid">
                                {filteredToppings.map(t => {
                                    const isSelected = selectedTopping === t.name;
                                    const count = pizzaBuilderState.toppings.filter(to => to.name === t.name).length;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTopping(isSelected ? null : t.name)}
                                            className={`pizza-builder-topping-btn ${isSelected ? 'selected' : ''} ${count > 0 ? 'used' : ''}`}
                                        >
                                            <span className="pizza-builder-topping-icon">{t.icon}</span>
                                            <span className="pizza-builder-topping-name">{t.name}</span>
                                            <span className="pizza-builder-topping-price">+${TIER_PRICE.toFixed(2)}</span>
                                            {count > 0 && (
                                                <span className="pizza-builder-topping-count">{count}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Zone hint */}
                            <div className="pizza-builder-zone-hint">
                                <div className="pizza-builder-zone-legend">
                                    <span className="pizza-builder-zone-dot left" /> Left Half
                                </div>
                                <div className="pizza-builder-zone-legend">
                                    <span className="pizza-builder-zone-dot right" /> Right Half
                                </div>
                                <div className="pizza-builder-zone-legend">
                                    <span className="pizza-builder-zone-dot whole" /> Whole Pizza
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pizza-builder-bottom">
                        <button onClick={() => setStep(1)} className="pizza-builder-back-btn">
                            ← Back
                        </button>
                        <div className="pizza-builder-price-summary">
                            <span className="pizza-builder-price-label">Your Pizza</span>
                            <span className="pizza-builder-price-value">${totalPrice.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => onAddToCart(totalPrice)}
                            className="pizza-builder-add-btn"
                        >
                            Add to Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Pizza Graphic Sub-Component */
function PizzaGraphic({
    toppings,
    selectedTopping,
    onZoneClick,
}: {
    toppings: Topping[];
    selectedTopping: string | null;
    onZoneClick: (zone: 'left' | 'right' | 'whole') => void;
}) {
    const leftToppings = toppings.filter(t => t.zone === 'left' || t.zone === 'whole');
    const rightToppings = toppings.filter(t => t.zone === 'right' || t.zone === 'whole');

    return (
        <div className="pizza-graphic">
            {/* Pizza base */}
            <div className="pizza-graphic-base">
                <div className="pizza-graphic-cheese" />

                {/* Rendered toppings */}
                {toppings.map((t, idx) => {
                    const topping = TOPPINGS.find(to => to.name === t.name);
                    if (!topping) return null;
                    const positions = getToppingPositions(idx, t.zone);
                    return positions.map((pos, pi) => (
                        <span
                            key={`${idx}-${pi}`}
                            className="pizza-graphic-topping"
                            style={{
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                fontSize: '1.4rem',
                                animationDelay: `${pi * 50}ms`,
                            }}
                        >
                            {topping.icon}
                        </span>
                    ));
                })}

                {/* Divider line */}
                <div className="pizza-graphic-divider" />
            </div>

            {/* Clickable zones */}
            <div className="pizza-graphic-zones">
                <button
                    className={`pizza-graphic-zone left ${selectedTopping ? 'active' : ''}`}
                    onClick={() => onZoneClick('left')}
                    disabled={!selectedTopping}
                >
                    <span className="pizza-graphic-zone-label">LEFT</span>
                    {leftToppings.length > 0 && (
                        <span className="pizza-graphic-zone-count">{leftToppings.length}</span>
                    )}
                </button>
                <button
                    className={`pizza-graphic-zone right ${selectedTopping ? 'active' : ''}`}
                    onClick={() => onZoneClick('right')}
                    disabled={!selectedTopping}
                >
                    <span className="pizza-graphic-zone-label">RIGHT</span>
                    {rightToppings.length > 0 && (
                        <span className="pizza-graphic-zone-count">{rightToppings.length}</span>
                    )}
                </button>
                <button
                    className={`pizza-graphic-zone whole ${selectedTopping ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onZoneClick('whole'); }}
                    disabled={!selectedTopping}
                >
                    WHOLE
                </button>
            </div>
        </div>
    );
}

/** Generate pseudo-random positions for topping icons on the pizza */
function getToppingPositions(index: number, zone: 'left' | 'right' | 'whole'): { x: number; y: number }[] {
    const count = 3;
    const positions: { x: number; y: number }[] = [];
    const seed = index * 137;
    for (let i = 0; i < count; i++) {
        const angle = ((seed + i * 120) % 360) * (Math.PI / 180);
        const radius = 20 + ((seed + i * 50) % 20);
        let x = 50 + Math.cos(angle) * radius;
        let y = 50 + Math.sin(angle) * radius;
        if (zone === 'left') x = Math.min(x, 46);
        if (zone === 'right') x = Math.max(x, 54);
        positions.push({ x: Math.max(15, Math.min(85, x)), y: Math.max(15, Math.min(85, y)) });
    }
    return positions;
}
