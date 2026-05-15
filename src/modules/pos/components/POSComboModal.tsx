import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ShoppingCart, ChevronRight, Package, Plus, Minus } from 'lucide-react';
import '../styles/pos-rush.css';

interface POSComboModalProps {
    isOpen: boolean;
    product: any | null; // This will be the combo product object
    onClose: () => void;
    onAddToCart: (cartItem: any) => void;
}

export const POSComboModal: React.FC<POSComboModalProps> = ({
    isOpen,
    product,
    onClose,
    onAddToCart
}) => {
    // State
    const [activeSlotIndex, setActiveSlotIndex] = useState(0);
    const [slotSelections, setSlotSelections] = useState<Record<string, any>>({}); // slotId -> selection details
    const [isShaking, setIsShaking] = useState<string | null>(null);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    // Reset when product changes
    useEffect(() => {
        if (isOpen && product) {
            setActiveSlotIndex(0);
            setSlotSelections({});
            setAttemptedSubmit(false);
        }
    }, [isOpen, product]);

    const slots = product?.slots || [];
    const activeSlot = slots[activeSlotIndex];

    // Calculate Total Price
    const currentPrice = useMemo(() => {
        if (!product) return 0;
        let total = product.basePrice || 0;

        Object.values(slotSelections).forEach((sel: any) => {
            if (sel.option) total += sel.option.price || 0;
            if (sel.variants) {
                Object.values(sel.variants).forEach((v: any) => total += v.additionalPrice || 0);
            }
            if (sel.modifiers) {
                Object.values(sel.modifiers).forEach((m: any) => total += (m.price || 0) * (m.quantity || 1));
            }
        });

        return total;
    }, [product, slotSelections]);

    if (!isOpen || !product) return null;

    const isSlotComplete = (slotId: string) => {
        const selection = slotSelections[slotId];
        if (!selection || !selection.option) return false;

        // Check if required variants are selected for this slot's option
        const slot = slots.find((s: any) => s.id === slotId);
        if (slot?.variantGroups) {
            const missingRequired = slot.variantGroups.some((g: any) => g.required && !selection.variants?.[g.id]);
            if (missingRequired) return false;
        }

        return true;
    };

    const isAllComplete = slots.every((s: any) => isSlotComplete(s.id));

    const handleOptionSelect = (option: any) => {
        setSlotSelections(prev => ({
            ...prev,
            [activeSlot.id]: {
                ...prev[activeSlot.id],
                option,
                variants: {}, // Reset variants when option changes within a slot
                modifiers: {}
            }
        }));
    };

    const handleVariantSelect = (groupId: string, option: any) => {
        setSlotSelections(prev => ({
            ...prev,
            [activeSlot.id]: {
                ...prev[activeSlot.id],
                variants: {
                    ...prev[activeSlot.id]?.variants,
                    [groupId]: option
                }
            }
        }));
    };

    const handleModifierAction = (modifierId: string, modifier: any, action: 'increment' | 'decrement') => {
        setSlotSelections(prev => {
            const slotSel = prev[activeSlot.id] || { modifiers: {} };
            const mods = { ...slotSel.modifiers };
            const current = mods[modifierId] || { ...modifier, quantity: 0 };

            if (action === 'increment') {
                current.quantity = Math.min((current.quantity || 0) + 1, 2);
            } else {
                current.quantity = Math.max((current.quantity || 0) - 1, 0);
            }

            if (current.quantity === 0) {
                delete mods[modifierId];
            } else {
                mods[modifierId] = current;
            }

            return {
                ...prev,
                [activeSlot.id]: {
                    ...slotSel,
                    modifiers: mods
                }
            };
        });
    };

    const handleConfirm = () => {
        setAttemptedSubmit(true);
        if (!isAllComplete) {
            const firstIncomplete = slots.find((s: any) => !isSlotComplete(s.id));
            if (firstIncomplete) {
                setIsShaking(firstIncomplete.id);
                setTimeout(() => setIsShaking(null), 500);
                setActiveSlotIndex(slots.indexOf(firstIncomplete));
            }
            return;
        }

        const cartItem = {
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: currentPrice,
            quantity: 1,
            isCombo: true,
            slots: Object.entries(slotSelections).map(([slotId, sel]) => {
                const slot = slots.find((s: any) => s.id === slotId);
                return {
                    slotId,
                    slotName: slot.name,
                    option: sel.option,
                    variants: Object.entries(sel.variants || {}).map(([gId, opt]: [string, any]) => ({
                        groupId: gId,
                        optionId: opt.id,
                        name: opt.name
                    })),
                    modifiers: Object.values(sel.modifiers || {}).map((m: any) => ({
                        optionId: m.id,
                        name: m.name,
                        price: m.price,
                        quantity: m.quantity
                    }))
                };
            })
        };

        onAddToCart(cartItem);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: '440px',
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'posFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }} onClick={onClose}>
            <div
                style={{
                    width: '100%',
                    maxWidth: '820px',
                    height: '85vh',
                    background: 'var(--pos-bg-surface)',
                    borderRadius: '32px',
                    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    animation: 'posSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    margin: '20px'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* 1. LEFT SIDE: Slot Progress Sidebar */}
                <div style={{
                    width: '240px',
                    background: 'var(--pos-bg-card)',
                    borderRight: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--pos-action-primary)', marginBottom: '8px' }}>
                            <Package size={20} fontWeight={900} />
                            <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Combo Builder</span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{product.name}</h3>
                    </div>

                    <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }} className="no-scrollbar">
                        {slots.map((slot: any, idx: number) => {
                            const active = activeSlotIndex === idx;
                            const complete = isSlotComplete(slot.id);
                            const selection = slotSelections[slot.id];
                            const shaking = isShaking === slot.id;

                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => setActiveSlotIndex(idx)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '20px',
                                        background: active ? 'rgba(31, 164, 169, 0.1)' : 'transparent',
                                        border: active ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        animation: shaking ? 'posShake 0.4s both' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 900, color: active ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)', textTransform: 'uppercase' }}>
                                            Slot {idx + 1}
                                        </span>
                                        {complete && <Check size={14} color="var(--pos-state-success)" strokeWidth={3} />}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: active ? 'var(--pos-text-primary)' : 'var(--pos-text-secondary)' }}>
                                        {slot.name}
                                    </div>
                                    {selection?.option && (
                                        <div style={{ fontSize: '12px', color: 'var(--pos-action-primary)', fontWeight: 700, marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {selection.option.name}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ padding: '24px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Base Total</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>${currentPrice.toFixed(2)}</div>
                    </div>
                </div>

                {/* 2. RIGHT SIDE: Configuration Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div style={{ padding: '32px', borderBottom: '1px solid var(--pos-border-subtle)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                    Select {activeSlot.name}
                                </h2>
                                <p style={{ fontSize: '14px', color: 'var(--pos-text-muted)', fontWeight: 600, marginTop: '4px' }}>
                                    Choose an item to fill this combo slot
                                </p>
                            </div>
                            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '12px', color: 'var(--pos-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="no-scrollbar">
                        {/* Options Section */}
                        <div style={{ marginBottom: '40px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Item Options</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                                {activeSlot.options.map((opt: any) => {
                                    const isSelected = slotSelections[activeSlot.id]?.option?.id === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleOptionSelect(opt)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '24px',
                                                background: isSelected ? 'rgba(31, 164, 169, 0.1)' : 'var(--pos-bg-card)',
                                                border: isSelected ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer',
                                                textAlign: 'center'
                                            }}
                                            className={!isSelected ? 'hover-scale' : ''}
                                        >
                                            <div style={{ width: '100%', height: '100px', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' }}>
                                                <img src={opt.image} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>{opt.name}</div>
                                            {opt.price > 0 && <div style={{ fontSize: '12px', color: 'var(--pos-state-success)', fontWeight: 700, marginTop: '4px' }}>+${opt.price.toFixed(2)}</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Variants & Modifiers (Only if option selected) */}
                        {slotSelections[activeSlot.id]?.option && (
                            <div style={{ animation: 'posFadeIn 0.3s ease-out' }}>
                                {/* Variant Groups */}
                                {activeSlot.variantGroups?.map((group: any) => (
                                    <div key={group.id} style={{ marginBottom: '32px' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                                            {group.name} {group.required && <span style={{ color: 'var(--pos-state-error)' }}>*</span>}
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            {group.options.map((v: any) => {
                                                const isSelected = slotSelections[activeSlot.id]?.variants?.[group.id]?.id === v.id;
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => handleVariantSelect(group.id, v)}
                                                        style={{
                                                            padding: '14px 20px',
                                                            borderRadius: '14px',
                                                            background: isSelected ? 'var(--pos-action-primary)' : 'var(--pos-bg-card)',
                                                            border: 'none',
                                                            color: isSelected ? 'white' : 'var(--pos-text-secondary)',
                                                            fontWeight: 800,
                                                            fontSize: '13px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.1s'
                                                        }}
                                                    >
                                                        {v.name} {v.price !== 0 && `(${v.price > 0 ? '+' : ''}${v.price})`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Modifier Groups */}
                                {activeSlot.modifierGroups?.map((group: any) => (
                                    <div key={group.id}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                                            {group.name}
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            {group.options.map((m: any) => {
                                                const sel = slotSelections[activeSlot.id]?.modifiers?.[m.id];
                                                const isSelected = !!sel;
                                                return (
                                                    <div
                                                        key={m.id}
                                                        style={{
                                                            padding: '16px',
                                                            background: 'var(--pos-bg-card)',
                                                            borderRadius: '20px',
                                                            border: isSelected ? '1px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>{m.name}</div>
                                                            <div style={{ fontSize: '12px', color: 'var(--pos-state-success)', fontWeight: 700 }}>+${m.price.toFixed(2)}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--pos-bg-surface)', borderRadius: '12px', padding: '4px' }}>
                                                            <button
                                                                style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'var(--pos-text-primary)', cursor: 'pointer' }}
                                                                onClick={() => handleModifierAction(m.id, m, 'decrement')}
                                                            >
                                                                <Minus size={14} strokeWidth={3} />
                                                            </button>
                                                            <span style={{ fontSize: '14px', fontWeight: 900, minWidth: '24px', textAlign: 'center' }}>
                                                                {sel?.quantity || 0}
                                                            </span>
                                                            <button
                                                                style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'var(--pos-text-primary)', cursor: 'pointer' }}
                                                                onClick={() => handleModifierAction(m.id, m, 'increment')}
                                                            >
                                                                <Plus size={14} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Nav */}
                    <div style={{ padding: '32px', background: 'var(--pos-bg-card)', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={handleConfirm}
                                className="hover-scale"
                                style={{
                                    flex: 1,
                                    height: '80px',
                                    borderRadius: '24px',
                                    background: isAllComplete
                                        ? 'linear-gradient(135deg, var(--pos-action-primary) 0%, #178d91 100%)'
                                        : (attemptedSubmit ? 'rgba(239, 68, 68, 0.1)' : 'var(--pos-bg-surface)'),
                                    color: isAllComplete ? 'white' : (attemptedSubmit ? 'var(--pos-state-error)' : 'var(--pos-text-muted)'),
                                    border: isAllComplete ? 'none' : (attemptedSubmit ? '1px solid var(--pos-state-error)' : '1px solid var(--pos-border-subtle)'),
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '16px',
                                    cursor: isAllComplete ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: isAllComplete ? '0 20px 40px -12px rgba(31, 164, 169, 0.4)' : 'none'
                                }}
                            >
                                <ShoppingCart size={24} strokeWidth={2.5} />
                                {isAllComplete ? 'ADD COMBO TO BASKET' : 'COMPLETE ALL SLOTS'}
                            </button>

                            {activeSlotIndex < slots.length - 1 && isSlotComplete(activeStepId()) && (
                                <button
                                    onClick={() => setActiveSlotIndex(activeSlotIndex + 1)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '24px',
                                        background: 'var(--pos-bg-surface)',
                                        border: '1px solid var(--pos-border-subtle)',
                                        color: 'var(--pos-text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                    className="hover-scale"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes posFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes posSlideIn {
                    from { transform: translateY(30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes posShake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .hover-scale { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-scale:hover { transform: scale(1.02); }
                .hover-scale:active { transform: scale(0.98); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );

    function activeStepId() {
        return slots[activeSlotIndex]?.id;
    }
};
