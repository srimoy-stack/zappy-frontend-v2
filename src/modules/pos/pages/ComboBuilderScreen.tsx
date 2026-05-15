'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Plus, Minus, ChevronRight } from 'lucide-react';
import '../styles/pos-rush.css';

// Mock combo product
const mockComboProduct = {
    id: 'COMBO001',
    name: 'Family Feast Combo',
    basePrice: 49.99,
    slots: [
        {
            id: 'SLOT1',
            name: 'Pizza 1',
            required: true,
            options: [
                { id: 'P1', name: 'Margherita Pizza', price: 0, image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=800&q=80' },
                { id: 'P2', name: 'Pepperoni Pizza', price: 2.00, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
                { id: 'P3', name: 'Veggie Supreme', price: 1.50, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
            ],
            variantGroups: [
                {
                    id: 'SIZE1',
                    name: 'Size',
                    required: true,
                    options: [
                        { id: 'S', name: 'Small', price: -3.00 },
                        { id: 'M', name: 'Medium', price: 0 },
                        { id: 'L', name: 'Large', price: 3.00 },
                    ]
                },
                {
                    id: 'CRUST1',
                    name: 'Crust',
                    required: true,
                    options: [
                        { id: 'THIN', name: 'Thin', price: 0 },
                        { id: 'THICK', name: 'Thick', price: 1.00 },
                        { id: 'STUFFED', name: 'Stuffed', price: 2.50 },
                    ]
                }
            ],
            modifierGroups: [
                {
                    id: 'TOPPINGS1',
                    name: 'Extra Toppings',
                    options: [
                        { id: 'CHEESE', name: 'Extra Cheese', price: 1.50 },
                        { id: 'OLIVES', name: 'Olives', price: 1.00 },
                        { id: 'MUSHROOMS', name: 'Mushrooms', price: 1.00 },
                    ]
                }
            ]
        },
        {
            id: 'SLOT2',
            name: 'Pizza 2',
            required: true,
            options: [
                { id: 'P1', name: 'Margherita Pizza', price: 0, image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=800&q=80' },
                { id: 'P2', name: 'Pepperoni Pizza', price: 2.00, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
                { id: 'P3', name: 'Veggie Supreme', price: 1.50, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
            ],
            variantGroups: [
                {
                    id: 'SIZE2',
                    name: 'Size',
                    required: true,
                    options: [
                        { id: 'S', name: 'Small', price: -3.00 },
                        { id: 'M', name: 'Medium', price: 0 },
                        { id: 'L', name: 'Large', price: 3.00 },
                    ]
                },
                {
                    id: 'CRUST2',
                    name: 'Crust',
                    required: true,
                    options: [
                        { id: 'THIN', name: 'Thin', price: 0 },
                        { id: 'THICK', name: 'Thick', price: 1.00 },
                        { id: 'STUFFED', name: 'Stuffed', price: 2.50 },
                    ]
                }
            ],
            modifierGroups: [
                {
                    id: 'TOPPINGS2',
                    name: 'Extra Toppings',
                    options: [
                        { id: 'CHEESE', name: 'Extra Cheese', price: 1.50 },
                        { id: 'OLIVES', name: 'Olives', price: 1.00 },
                        { id: 'MUSHROOMS', name: 'Mushrooms', price: 1.00 },
                    ]
                }
            ]
        },
        {
            id: 'SLOT3',
            name: 'Side',
            required: true,
            options: [
                { id: 'WINGS', name: 'Chicken Wings', price: 0, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80' },
                { id: 'FRIES', name: 'French Fries', price: 0, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80' },
                { id: 'SALAD', name: 'Garden Salad', price: 0, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
            ]
        },
        {
            id: 'SLOT4',
            name: 'Drink',
            required: true,
            options: [
                { id: 'COKE', name: 'Coca Cola', price: 0, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80' },
                { id: 'SPRITE', name: 'Sprite', price: 0, image: 'https://images.unsplash.com/photo-1625772290748-39126d794951?auto=format&fit=crop&w=800&q=80' },
                { id: 'FANTA', name: 'Fanta', price: 0, image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=800&q=80' },
            ]
        }
    ]
};

export const ComboBuilderScreen: React.FC = () => {
    const router = useRouter();
    const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
    const [slotSelections, setSlotSelections] = useState<any>({});

    const currentSlot = mockComboProduct.slots[currentSlotIndex];
    if (!currentSlot) return null;

    const currentSelection = slotSelections[currentSlot.id] || {};

    const calculateTotalPrice = () => {
        let total = mockComboProduct.basePrice;
        Object.values(slotSelections).forEach((selection: any) => {
            if (selection.option) total += selection.option.price;
            if (selection.variants) {
                Object.values(selection.variants).forEach((variant: any) => {
                    total += variant.price;
                });
            }
            if (selection.modifiers) {
                Object.values(selection.modifiers).forEach((modifier: any) => {
                    total += modifier.price * modifier.quantity;
                });
            }
        });
        return total;
    };

    const handleOptionSelect = (option: any) => {
        setSlotSelections({
            ...slotSelections,
            [currentSlot.id]: {
                ...currentSelection,
                option,
                variants: {},
                modifiers: {}
            }
        });
    };

    const handleVariantSelect = (groupId: string, variant: any) => {
        setSlotSelections({
            ...slotSelections,
            [currentSlot.id]: {
                ...currentSelection,
                variants: {
                    ...currentSelection.variants,
                    [groupId]: variant
                }
            }
        });
    };

    const handleModifierToggle = (modifierId: string, modifier: any) => {
        const currentMods = currentSelection.modifiers || {};
        const existing = currentMods[modifierId];

        setSlotSelections({
            ...slotSelections,
            [currentSlot.id]: {
                ...currentSelection,
                modifiers: {
                    ...currentMods,
                    [modifierId]: existing
                        ? { ...existing, quantity: existing.quantity + 1 }
                        : { ...modifier, quantity: 1 }
                }
            }
        });
    };

    const handleModifierRemove = (modifierId: string) => {
        const currentMods = { ...currentSelection.modifiers };
        if (currentMods[modifierId].quantity > 1) {
            currentMods[modifierId].quantity--;
        } else {
            delete currentMods[modifierId];
        }

        setSlotSelections({
            ...slotSelections,
            [currentSlot.id]: {
                ...currentSelection,
                modifiers: currentMods
            }
        });
    };

    const canProceed = () => {
        if (!currentSelection.option) return false;
        if (currentSlot.variantGroups) {
            for (const group of currentSlot.variantGroups) {
                if (group.required && !currentSelection.variants?.[group.id]) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleNext = () => {
        if (currentSlotIndex < mockComboProduct.slots.length - 1) {
            setCurrentSlotIndex(currentSlotIndex + 1);
        } else {
            // Add to cart and go back
            router.push('/pos/menu');
        }
    };

    const handleBack = () => {
        if (currentSlotIndex > 0) {
            setCurrentSlotIndex(currentSlotIndex - 1);
        } else {
            router.back();
        }
    };


    return (
        <div className="pos-screen">
            <div className="pos-split-layout">
                {/* LEFT: Combo Progress & Summary */}
                <div className="pos-left-panel">
                    {/* Header */}
                    <div style={{ padding: '24px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'white',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Package size={28} color="#1E3A8A" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                                    {mockComboProduct.name}
                                </h2>
                                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                    Base Price: ${mockComboProduct.basePrice.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700 }}>
                                    Progress
                                </span>
                                <span style={{ fontSize: '12px', color: 'white', fontWeight: 700 }}>
                                    {Object.keys(slotSelections).length} / {mockComboProduct.slots.length}
                                </span>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    background: 'white',
                                    height: '100%',
                                    width: `${(Object.keys(slotSelections).length / mockComboProduct.slots.length) * 100}%`,
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Slot Navigation */}
                    <div style={{ padding: '20px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Combo Items
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {mockComboProduct.slots.map((slot, idx) => (
                                <button
                                    key={slot.id}
                                    onClick={() => setCurrentSlotIndex(idx)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: currentSlotIndex === idx ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.15)',
                                        background: currentSlotIndex === idx ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                            {idx + 1}. {slot.name}
                                        </div>
                                        {slotSelections[slot.id]?.option && (
                                            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                                {slotSelections[slot.id].option.name}
                                            </div>
                                        )}
                                    </div>
                                    {slotSelections[slot.id]?.option ? (
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            background: '#10B981',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <span style={{ color: 'white', fontSize: '16px', fontWeight: 800 }}>✓</span>
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: '50%',
                                            border: '2px solid rgba(255, 255, 255, 0.3)'
                                        }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div style={{ padding: '20px', marginTop: 'auto' }}>
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '16px',
                            padding: '20px'
                        }}>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Total Price
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                                ${calculateTotalPrice().toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Current Slot Configuration */}
                <div className="pos-right-panel">
                    {/* Slot Header */}
                    <div style={{ padding: '24px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Step {currentSlotIndex + 1} of {mockComboProduct.slots.length}
                                </div>
                                <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
                                    Choose {currentSlot.name}
                                </h2>
                                {currentSlot.required && (
                                    <div className="pos-badge pos-badge-warning">REQUIRED</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }} className="pos-scroll">
                        {/* Options */}
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Select Item
                        </h3>
                        <div className="pos-grid-3" style={{ marginBottom: '32px' }}>
                            {currentSlot.options.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option)}
                                    style={{
                                        background: currentSelection.option?.id === option.id ? 'white' : 'rgba(255, 255, 255, 0.1)',
                                        border: currentSelection.option?.id === option.id ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        textAlign: 'center'
                                    }}
                                >
                                    <img src={option.image} alt={option.name} style={{ width: '100%', borderRadius: '12px', marginBottom: '12px' }} />
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        color: currentSelection.option?.id === option.id ? '#1E3A8A' : 'white',
                                        marginBottom: '4px'
                                    }}>
                                        {option.name}
                                    </div>
                                    {option.price > 0 && (
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: currentSelection.option?.id === option.id ? '#64748B' : 'rgba(255, 255, 255, 0.7)'
                                        }}>
                                            +${option.price.toFixed(2)}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Variants */}
                        {currentSelection.option && currentSlot.variantGroups && currentSlot.variantGroups.map(group => (
                            <div key={group.id} style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {group.name} {group.required && <span style={{ color: '#F59E0B' }}>*</span>}
                                </h3>
                                <div className="pos-grid-3">
                                    {group.options.map(variant => (
                                        <button
                                            key={variant.id}
                                            onClick={() => handleVariantSelect(group.id, variant)}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: currentSelection.variants?.[group.id]?.id === variant.id ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                                                background: currentSelection.variants?.[group.id]?.id === variant.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                                {variant.name}
                                            </div>
                                            {variant.price !== 0 && (
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                                                    {variant.price > 0 ? '+' : ''} ${variant.price.toFixed(2)}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Modifiers */}
                        {currentSelection.option && currentSlot.modifierGroups && currentSlot.modifierGroups.map(group => (
                            <div key={group.id} style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {group.name} (Optional)
                                </h3>
                                {group.options.map(modifier => {
                                    const qty = currentSelection.modifiers?.[modifier.id]?.quantity || 0;
                                    return (
                                        <div key={modifier.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '16px',
                                            background: qty > 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '12px',
                                            marginBottom: '12px',
                                            border: '2px solid rgba(255, 255, 255, 0.1)'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{modifier.name}</div>
                                                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>+${modifier.price.toFixed(2)}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <button
                                                    onClick={() => handleModifierRemove(modifier.id)}
                                                    disabled={qty === 0}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: qty > 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                        border: 'none',
                                                        cursor: qty > 0 ? 'pointer' : 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <Minus size={18} />
                                                </button>
                                                <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '16px', fontWeight: 700, color: 'white' }}>{qty}</span>
                                                <button
                                                    onClick={() => handleModifierToggle(modifier.id, modifier)}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: 'white',
                                                        color: '#1E3A8A',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div style={{ padding: '24px', borderTop: '2px solid rgba(255, 255, 255, 0.1)' }}>
                        <div className="pos-grid-2" style={{ gap: '12px' }}>
                            <button onClick={handleBack} className="pos-btn pos-btn-secondary">
                                {currentSlotIndex === 0 ? 'Cancel' : 'Back'}
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="pos-btn pos-btn-primary"
                            >
                                {currentSlotIndex === mockComboProduct.slots.length - 1 ? 'Add to Cart' : 'Next'}
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
