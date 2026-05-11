import React, { useState, useEffect, useMemo } from 'react';
import { POSProduct } from '../types/pos';
import { X, Check, ShoppingCart, AlertCircle } from 'lucide-react';
import '../styles/pos-rush.css';

interface POSVariantModalProps {
    isOpen: boolean;
    product: POSProduct | null;
    initialItem?: any | null;
    onClose: () => void;
    onAddToCart: (cartItem: any) => void;
}

export const POSVariantModal: React.FC<POSVariantModalProps> = ({
    isOpen,
    product,
    initialItem,
    onClose,
    onAddToCart
}) => {
    // State
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // groupId -> optionId
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [isShaking, setIsShaking] = useState<string | null>(null);

    // Reset or populate when product changes
    useEffect(() => {
        if (isOpen && product) {
            if (initialItem) {
                const initial: Record<string, string> = {};
                initialItem.variants.forEach((v: any) => {
                    initial[v.groupId] = v.optionId;
                });
                setSelectedVariants(initial);
            } else {
                setSelectedVariants({});
            }
            setAttemptedSubmit(false);
        }
    }, [isOpen, product, initialItem]);

    const variantGroups = product?.variantGroups || [];

    // Calculate Current Total
    const currentPrice = useMemo(() => {
        if (!product) return 0;
        let total = product.price;
        variantGroups.forEach(group => {
            const selectedId = selectedVariants[group.id];
            if (selectedId) {
                const option = group.options.find(o => o.id === selectedId);
                if (option) total += option.additionalPrice;
            }
        });
        return total;
    }, [product, selectedVariants, variantGroups]);

    if (!isOpen || !product) return null;

    const handleSelect = (groupId: string, optionId: string) => {
        setSelectedVariants(prev => ({ ...prev, [groupId]: optionId }));
    };

    const isGroupSelected = (groupId: string) => !!selectedVariants[groupId];
    const isComplete = variantGroups.every(group => isGroupSelected(group.id));

    const handleConfirm = () => {
        setAttemptedSubmit(true);
        if (!isComplete) {
            // Find first missing group and "shake" it
            const missing = variantGroups.find(g => !isGroupSelected(g.id));
            if (missing) {
                setIsShaking(missing.id);
                setTimeout(() => setIsShaking(null), 500);
            }
            return;
        }

        const cartItem = {
            id: initialItem?.id || Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: currentPrice,
            quantity: initialItem?.quantity || 1,
            variants: Object.entries(selectedVariants).map(([groupId, optionId]) => {
                const group = variantGroups.find(g => g.id === groupId);
                const option = group?.options.find(o => o.id === optionId);
                return { groupId, optionId, name: option?.name || '' };
            }),
            modifiers: initialItem?.modifiers || [],
            notes: initialItem?.notes || ''
        };

        onAddToCart(cartItem);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: '440px', // Offset for cart panel to keep it visible
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
                    maxWidth: '520px',
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
                        Configure Item
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--pos-text-primary)', letterSpacing: '-0.02em' }}>
                        {product.name}
                    </h2>
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
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        className="hover-scale"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body - Scrollable only if needed, targeted for fast glances */}
                <div style={{
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px',
                    maxHeight: '55vh',
                    overflowY: 'auto'
                }} className="no-scrollbar">
                    {variantGroups.map(group => {
                        const isGroupComplete = isGroupSelected(group.id);
                        const showError = attemptedSubmit && !isGroupComplete;
                        const shaking = isShaking === group.id;

                        return (
                            <div key={group.id} style={{
                                animation: shaking ? 'posShake 0.4s cubic-bezier(.36,.07,.19,.97) both' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{
                                            fontSize: '14px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            color: showError ? 'var(--pos-state-error)' : 'var(--pos-text-secondary)'
                                        }}>
                                            {group.name}
                                        </h3>
                                        {isGroupComplete && <Check size={16} color="var(--pos-state-success)" strokeWidth={3} />}
                                    </div>

                                    {!isGroupComplete && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: showError ? 'var(--pos-state-error)' : 'var(--pos-text-muted)',
                                            background: showError ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                            padding: showError ? '4px 10px' : '0',
                                            borderRadius: '6px'
                                        }}>
                                            {showError && <AlertCircle size={12} />}
                                            REQUIRED
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                    gap: '12px'
                                }}>
                                    {group.options.map(option => {
                                        const isSelected = selectedVariants[group.id] === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSelect(group.id, option.id)}
                                                style={{
                                                    height: '72px',
                                                    borderRadius: '20px',
                                                    border: isSelected
                                                        ? '2px solid var(--pos-action-primary)'
                                                        : showError ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--pos-border-subtle)',
                                                    background: isSelected
                                                        ? 'linear-gradient(135deg, rgba(31, 164, 169, 0.2) 0%, rgba(31, 164, 169, 0.05) 100%)'
                                                        : 'var(--pos-bg-card)',
                                                    color: isSelected ? 'var(--pos-text-primary)' : 'var(--pos-text-secondary)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                    boxShadow: isSelected ? '0 8px 20px -8px var(--pos-action-primary)' : 'none'
                                                }}
                                                className={!isSelected ? 'hover-scale' : ''}
                                            >
                                                <div style={{ fontSize: '15px', fontWeight: 800 }}>{option.name}</div>
                                                {option.additionalPrice > 0 ? (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        color: isSelected ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)'
                                                    }}>
                                                        +${option.additionalPrice.toFixed(2)}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.4 }}>Included</div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer - Immediate Price Feedback */}
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
                        <div style={{ marginBottom: '4px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Price</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--pos-state-success)', marginTop: '2px' }}>
                                Immediate selection impact
                            </div>
                        </div>
                        <div
                            key={currentPrice}
                            style={{
                                fontSize: '42px',
                                fontWeight: 900,
                                color: 'var(--pos-text-primary)',
                                animation: 'posPriceUpdate 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                letterSpacing: '-0.03em'
                            }}
                        >
                            ${currentPrice.toFixed(2)}
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className={isComplete ? 'hover-scale' : ''}
                        style={{
                            width: '100%',
                            height: '80px',
                            borderRadius: '24px',
                            background: isComplete
                                ? 'linear-gradient(135deg, var(--pos-action-primary) 0%, #178d91 100%)'
                                : 'var(--pos-bg-surface)',
                            color: isComplete ? 'white' : 'var(--pos-text-muted)',
                            border: isComplete ? 'none' : '1px solid var(--pos-border-subtle)',
                            fontSize: '20px',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            cursor: isComplete ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: isComplete ? '0 20px 40px -12px rgba(31, 164, 169, 0.4)' : 'none'
                        }}
                    >
                        <ShoppingCart size={24} strokeWidth={2.5} />
                        {isComplete ? 'ADD TO BASKET' : 'SELECT OPTIONS'}
                    </button>

                    {!isComplete && attemptedSubmit && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '16px',
                            color: 'var(--pos-state-error)',
                            fontSize: '13px',
                            fontWeight: 700,
                            animation: 'posFadeIn 0.3s ease'
                        }}>
                            Please complete all mandatory selections
                        </div>
                    )}
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
                @keyframes posShake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
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
            `}</style>
        </div>
    );
};
