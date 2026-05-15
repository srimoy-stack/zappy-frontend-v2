import React, { useState, useEffect, useMemo } from 'react';
import { POSProduct } from '../types/pos';
import { X, Check, ShoppingCart, Plus, Minus } from 'lucide-react';
import '../styles/pos-rush.css';

interface POSModifierModalProps {
    isOpen: boolean;
    product: POSProduct | null;
    variants?: { groupId: string; optionId: string; name: string }[];
    initialItem?: any | null;
    onClose: () => void;
    onAddToCart: (cartItem: any) => void;
}

export const POSModifierModal: React.FC<POSModifierModalProps> = ({
    isOpen,
    product,
    variants = [],
    initialItem,
    onClose,
    onAddToCart
}) => {
    // State: optionId -> quantity (0 = removed/deselected, 1 = normal, 2 = extra, etc.)
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState('');

    // Reset when product changes
    useEffect(() => {
        if (isOpen && product) {
            const initial: Record<string, number> = {};
            if (initialItem) {
                initialItem.modifiers.forEach((m: any) => {
                    initial[m.optionId] = m.quantity;
                });
                setNotes(initialItem.notes || '');
            } else {
                // Pre-select defaults from product data
                product.modifierGroups?.forEach(group => {
                    group.options.forEach(opt => {
                        if (opt.isDefault) initial[opt.id] = 1;
                    });
                });
                setNotes('');
            }
            setSelectedModifiers(initial);
        }
    }, [isOpen, product, initialItem]);

    const modifierGroups = product?.modifierGroups || [];

    // Calculate Price Breakdown
    const priceBreakdown = useMemo(() => {
        if (!product) return { base: 0, variantsPrice: 0, modifiersPrice: 0, total: 0 };

        const base = product.price;
        let variantsPrice = 0;
        variants.forEach(v => {
            const group = product.variantGroups?.find(g => g.id === v.groupId);
            const option = group?.options.find(o => o.id === v.optionId);
            if (option) variantsPrice += option.additionalPrice;
        });

        let modifiersPrice = 0;
        Object.entries(selectedModifiers).forEach(([optId, qty]) => {
            if (qty <= 0) return; // Removed ingredients or deselected
            let optPrice = 0;
            modifierGroups.forEach(g => {
                const found = g.options.find(o => o.id === optId);
                if (found) optPrice = found.price;
            });
            // If qty is 1, it's normal price. If qty is 2 (Extra), we add the price again.
            // Rule: Extra/Double increases price accordingly. 
            // We assume mod price is for "one unit" of modification.
            modifiersPrice += optPrice * qty;
        });

        return {
            base,
            variantsPrice,
            modifiersPrice,
            total: base + variantsPrice + modifiersPrice
        };
    }, [product, variants, selectedModifiers, modifierGroups]);

    if (!isOpen || !product) return null;

    const handleModifierAction = (optionId: string, action: 'toggle' | 'increment' | 'decrement') => {
        setSelectedModifiers(prev => {
            const next = { ...prev };
            const currentQty = next[optionId] || 0;

            if (action === 'toggle') {
                next[optionId] = currentQty > 0 ? 0 : 1;
            } else if (action === 'increment') {
                next[optionId] = Math.min(currentQty + 1, 2); // Limit to "Double" for POS simplicity
            } else if (action === 'decrement') {
                next[optionId] = Math.max(currentQty - 1, 0);
            }

            return next;
        });
    };

    const handleConfirm = () => {
        const cartItem = {
            id: initialItem?.id || Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: priceBreakdown.total,
            quantity: initialItem?.quantity || 1,
            variants: variants,
            modifiers: Object.entries(selectedModifiers)
                .filter(([_, qty]) => qty > 0)
                .map(([optId, qty]) => {
                    let mInfo: any;
                    modifierGroups.forEach(g => {
                        const f = g.options.find(o => o.id === optId);
                        if (f) mInfo = f;
                    });
                    return {
                        optionId: optId,
                        name: mInfo?.name || '',
                        price: mInfo?.price || 0,
                        quantity: qty
                    };
                }),
            notes: notes
        };

        onAddToCart(cartItem);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: '440px', // Maintain cart visibility
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
                    maxWidth: '600px',
                    background: 'var(--pos-bg-surface)',
                    borderRadius: '32px',
                    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    animation: 'posSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    margin: '20px'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '32px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
                    borderBottom: '1px solid var(--pos-border-subtle)',
                    position: 'relative'
                }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: 900,
                        color: 'var(--pos-action-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--pos-action-primary)', borderRadius: '50%' }} />
                        Addons & Modifiers
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--pos-text-primary)', letterSpacing: '-0.02em' }}>
                        {product.name}
                    </h2>
                    {variants.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            {variants.map(v => (
                                <span key={v.groupId} style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: 'var(--pos-text-muted)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {v.name}
                                </span>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            right: '24px',
                            top: '32px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            color: 'var(--pos-text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        className="hover-scale"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    maxHeight: '55vh',
                    overflowY: 'auto'
                }} className="no-scrollbar">
                    {modifierGroups.map(group => (
                        <div key={group.id}>
                            <h3 style={{
                                fontSize: '14px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--pos-text-muted)',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {group.name}
                                <div style={{ flex: 1, height: '1px', background: 'var(--pos-border-subtle)' }} />
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '16px'
                            }}>
                                {group.options.map(option => {
                                    const qty = selectedModifiers[option.id] || 0;
                                    const isSelected = qty > 0;

                                    return (
                                        <div
                                            key={option.id}
                                            style={{
                                                background: isSelected ? 'rgba(31, 164, 169, 0.05)' : 'var(--pos-bg-card)',
                                                borderRadius: '20px',
                                                border: isSelected ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                padding: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleModifierAction(option.id, 'toggle')}
                                        >
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '8px',
                                                border: isSelected ? 'none' : '2px solid var(--pos-border-subtle)',
                                                background: isSelected ? 'var(--pos-action-primary)' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}>
                                                {isSelected && <Check size={18} color="white" strokeWidth={3} />}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '15px', fontWeight: 800, color: isSelected ? 'var(--pos-text-primary)' : 'var(--pos-text-secondary)' }}>
                                                    {option.name}
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--pos-state-success)', marginTop: '2px' }}>
                                                    {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'No Charge'}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        background: 'var(--pos-bg-surface)',
                                                        borderRadius: '12px',
                                                        padding: '4px',
                                                        border: '1px solid var(--pos-border-subtle)'
                                                    }}
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <button
                                                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', color: 'var(--pos-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onClick={() => handleModifierAction(option.id, 'decrement')}
                                                    >
                                                        <Minus size={16} strokeWidth={3} />
                                                    </button>
                                                    <div style={{ minWidth: '32px', textAlign: 'center', fontSize: '16px', fontWeight: 900 }}>
                                                        {qty === 2 ? 'EXT' : qty}
                                                    </div>
                                                    <button
                                                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', color: 'var(--pos-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onClick={() => handleModifierAction(option.id, 'increment')}
                                                    >
                                                        <Plus size={16} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Special Instructions */}
                    <div>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--pos-text-muted)',
                            marginBottom: '16px'
                        }}>
                            Special Notes
                        </h3>
                        <textarea
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                background: 'var(--pos-bg-card)',
                                border: '1px solid var(--pos-border-subtle)',
                                borderRadius: '20px',
                                padding: '20px',
                                color: 'var(--pos-text-primary)',
                                fontSize: '15px',
                                fontWeight: 600,
                                resize: 'none',
                                outline: 'none'
                            }}
                            placeholder="Add specific instructions here (e.g. Extra spicy, No garlic...)"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer - Price Breakdown */}
                <div style={{
                    padding: '32px',
                    background: 'var(--pos-bg-card)',
                    borderTop: '1px solid var(--pos-border-subtle)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '24px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--pos-text-muted)' }}>
                                    BREAKDOWN
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--pos-text-secondary)', display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                                    <span>Base + Variants</span>
                                    <span>${(priceBreakdown.base + priceBreakdown.variantsPrice).toFixed(2)}</span>
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--pos-state-success)', display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                                    <span>Modifiers Impact</span>
                                    <span>+${priceBreakdown.modifiersPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div
                            key={priceBreakdown.total}
                            style={{
                                fontSize: '42px',
                                fontWeight: 900,
                                color: 'var(--pos-text-primary)',
                                animation: 'posPriceUpdate 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                letterSpacing: '-0.03em'
                            }}
                        >
                            ${priceBreakdown.total.toFixed(2)}
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="hover-scale"
                        style={{
                            width: '100%',
                            height: '80px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, var(--pos-action-primary) 0%, #178d91 100%)',
                            color: 'white',
                            border: 'none',
                            fontSize: '20px',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 20px 40px -12px rgba(31, 164, 169, 0.4)'
                        }}
                    >
                        <ShoppingCart size={24} strokeWidth={2.5} />
                        ADD TO BASKET
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes posFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes posSlideIn {
                    from { transform: translateY(30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes posPriceUpdate {
                    0% { transform: translateY(5px); opacity: 0.5; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .hover-scale {
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-scale:hover {
                    transform: scale(1.02);
                }
                .hover-scale:active {
                    transform: scale(0.98);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};
