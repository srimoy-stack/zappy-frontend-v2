import React, { useState, useEffect } from 'react';
import { POSProduct, POSModifierGroup } from '../types/pos';
import { X, Check, Minus, Plus } from 'lucide-react';
import '../styles/pos-rush.css';

interface ProductCustomizationModalProps {
    isOpen: boolean;
    product: POSProduct | null;
    initialItem?: any | null;
    onClose: () => void;
    onAddToCart: (cartItem: any) => void;
}

export const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
    isOpen,
    product,
    initialItem,
    onClose,
    onAddToCart
}) => {
    // State
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // groupId -> optionId
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, { optionId: string; quantity: number }>>({}); // optionId -> { optionId, quantity }
    const [notes, setNotes] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Reset when product changes
    useEffect(() => {
        if (isOpen && product) {
            if (initialItem) {
                // Populate from existing item
                const initialVariants: Record<string, string> = {};
                initialItem.variants.forEach((v: any) => {
                    initialVariants[v.groupId] = v.optionId;
                });
                setSelectedVariants(initialVariants);

                const initialMods: Record<string, any> = {};
                initialItem.modifiers.forEach((m: any) => {
                    initialMods[m.optionId] = { optionId: m.optionId, quantity: m.quantity };
                });
                setSelectedModifiers(initialMods);
                setNotes(initialItem.notes || '');
                setQuantity(initialItem.quantity);
            } else {
                // Reset with Defaults
                const defaultVariants: Record<string, string> = {};
                product.variantGroups?.forEach(g => {
                    const def = g.options.find((o: any) => o.isDefault) || g.options[0];
                    if (def) defaultVariants[g.id] = def.id;
                });

                const defaultMods: Record<string, { optionId: string; quantity: number }> = {};
                product.modifierGroups?.forEach(g => {
                    g.options.forEach(opt => {
                        if ((opt as any).isDefault) {
                            defaultMods[opt.id] = { optionId: opt.id, quantity: 1 };
                        }
                    });
                });

                setSelectedVariants(defaultVariants);
                setSelectedModifiers(defaultMods);
                setNotes('');
                setQuantity(1);
            }
        }
    }, [isOpen, product, initialItem]);

    if (!isOpen || !product) return null;

    // Logic
    const handleVariantSelect = (groupId: string, optionId: string) => {
        setSelectedVariants(prev => ({ ...prev, [groupId]: optionId }));
    };

    const handleModifierToggle = (group: POSModifierGroup, optionId: string) => {
        const existing = selectedModifiers[optionId];
        if (existing) {
            // Remove
            const next = { ...selectedModifiers };
            delete next[optionId];
            setSelectedModifiers(next);
        } else {
            // Add
            // Check max selection limit for group
            const currentGroupCount = group.options.filter(o => selectedModifiers[o.id]).length;
            if (group.maxSelection && currentGroupCount >= group.maxSelection) {
                // Ideally show toast/error, for now ignore
                return;
            }
            setSelectedModifiers(prev => ({ ...prev, [optionId]: { optionId, quantity: 1 } }));
        }
    };

    const handleModifierQuantity = (optionId: string, delta: number) => {
        const existing = selectedModifiers[optionId];
        if (!existing && delta > 0) return; // Should toggle first
        if (!existing) return;

        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
            const next = { ...selectedModifiers };
            delete next[optionId];
            setSelectedModifiers(next);
        } else {
            setSelectedModifiers(prev => ({ ...prev, [optionId]: { ...existing, quantity: newQty } }));
        }
    };

    // Calculate Price
    let totalPrice = product.price;

    // Add variants price
    product.variantGroups?.forEach(group => {
        const selectedId = selectedVariants[group.id];
        if (selectedId) {
            const option = group.options.find(o => o.id === selectedId);
            if (option) {
                totalPrice += option.additionalPrice; // Assuming additionalPrice in variants
            }
        }
    });

    // Add modifiers price
    Object.values(selectedModifiers).forEach(mod => {
        // Find modifier info
        let modInfo: any = null;
        product.modifierGroups?.forEach(g => {
            const found = g.options.find(o => o.id === mod.optionId);
            if (found) modInfo = found;
        });
        if (modInfo) {
            totalPrice += modInfo.price * mod.quantity;
        }
    });

    totalPrice *= quantity;

    // Validation
    const isComplete = product.variantGroups?.every(group => !!selectedVariants[group.id]) ?? true;

    const handleAddToOrder = () => {
        if (!isComplete) return;

        // Construct Cart Item
        const cartItem = {
            id: initialItem?.id || Math.random().toString(36).substr(2, 9), // Keep ID if editing
            productId: product.id,
            name: product.name,
            price: totalPrice / quantity, // Unit price
            quantity: quantity,
            variants: Object.entries(selectedVariants).map(([groupId, optionId]) => {
                const group = product.variantGroups?.find(g => g.id === groupId);
                const option = group?.options.find(o => o.id === optionId);
                return { groupId, optionId, name: option?.name || '' };
            }),
            modifiers: Object.entries(selectedModifiers).map(([optId, mod]) => {
                let mInfo: any;
                product.modifierGroups?.forEach(g => {
                    const f = g.options.find(o => o.id === optId);
                    if (f) mInfo = f;
                });
                return {
                    optionId: optId,
                    name: mInfo?.name || '',
                    price: mInfo?.price || 0,
                    quantity: mod.quantity
                };
            }),
            notes: notes
        };

        onAddToCart(cartItem);
        onClose();
    };

    return (
        <div className="pos-modal-overlay">
            <div className="pos-modal" style={{ maxWidth: '800px', height: '90vh' }}>

                {/* Header */}
                <div className="pos-modal-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--pos-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Customize Product
                        </div>
                        <h2 className="pos-title-lg" style={{ lineHeight: 1.2 }}>{product.name}</h2>
                    </div>
                    <button onClick={onClose} className="pos-btn-secondary" style={{ width: '48px', padding: 0 }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="pos-modal-body" style={{ padding: '0' }}>
                    <div style={{ padding: '24px' }}>

                        {/* --- PRE-SELECTED SECTION --- */}
                        <div className="pos-preselected-container" style={{
                            marginBottom: '32px',
                            padding: '20px',
                            background: 'rgba(31, 164, 169, 0.05)',
                            borderRadius: '16px',
                            border: '1px solid rgba(31, 164, 169, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Check size={18} color="var(--pos-action-primary)" strokeWidth={3} />
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)', margin: 0 }}>Pre-Selected</h3>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {/* Default Variants Items */}
                                {product.variantGroups?.map(group => {
                                    const selectedId = selectedVariants[group.id];
                                    const option = group.options.find(o => o.id === selectedId);
                                    if (!option) return null;
                                    return (
                                        <div key={group.id} style={{
                                            padding: '6px 12px',
                                            background: 'white',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            border: '1px solid var(--pos-border-subtle)'
                                        }}>
                                            <span style={{ color: 'var(--pos-text-muted)' }}>{group.name}: </span>
                                            {option.name}
                                        </div>
                                    );
                                })}

                                {/* Default Modifiers */}
                                {Object.values(selectedModifiers).map(mod => {
                                    const isDefaultInProduct = product.modifierGroups?.some(v => v.options.some(o => o.id === mod.optionId && (o as any).isDefault));
                                    if (!isDefaultInProduct) return null;

                                    let mName = '';
                                    product.modifierGroups?.forEach(g => {
                                        const f = g.options.find(o => o.id === mod.optionId);
                                        if (f) mName = f.name;
                                    });

                                    return (
                                        <div key={mod.optionId} style={{
                                            padding: '6px 12px',
                                            background: 'white',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            border: '1px solid var(--pos-border-subtle)'
                                        }}>
                                            {mName}
                                            {mod.quantity > 1 && <span style={{ color: 'var(--pos-action-primary)' }}> x{mod.quantity}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 6.1 VARIANTS */}
                        {product.variantGroups?.map(group => (
                            <div key={group.id} style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {group.name}
                                    </h3>
                                    <span className="pos-badge pos-badge-warning">REQUIRED</span>
                                </div>
                                <div className="pos-grid-3">
                                    {group.options.map(option => {
                                        const isSelected = selectedVariants[group.id] === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleVariantSelect(group.id, option.id)}
                                                style={{
                                                    padding: '20px',
                                                    borderRadius: '12px',
                                                    border: isSelected ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                    background: isSelected ? 'rgba(31, 164, 169, 0.1)' : 'var(--pos-bg-card)',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 700, color: isSelected ? 'var(--pos-action-primary)' : 'var(--pos-text-primary)' }}>
                                                        {option.name}
                                                    </span>
                                                    {isSelected && <Check size={16} color="var(--pos-action-primary)" />}
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'var(--pos-text-muted)', marginTop: '4px' }}>
                                                    {option.additionalPrice > 0 ? `+$${option.additionalPrice.toFixed(2)}` : 'Included'}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div style={{ height: '1px', background: 'var(--pos-border-subtle)', margin: '32px 0' }}></div>

                        {/* 6.2 MODIFIERS */}
                        {product.modifierGroups?.map(group => (
                            <div key={group.id} style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {group.name}
                                    </h3>
                                    <span style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 600 }}>
                                        {group.maxSelection ? `Max ${group.maxSelection}` : 'Optional'}
                                    </span>
                                </div>
                                <div className="pos-grid-2">
                                    {group.options.map(option => {
                                        const selection = selectedModifiers[option.id];
                                        const isSelected = !!selection;
                                        return (
                                            <div
                                                key={option.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: isSelected ? '1px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                    background: isSelected ? 'rgba(31, 164, 169, 0.05)' : 'var(--pos-bg-card)'
                                                }}
                                            >
                                                <div
                                                    onClick={() => handleModifierToggle(group, option.id)}
                                                    style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                                                >
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '4px',
                                                        border: isSelected ? 'none' : '2px solid var(--pos-text-muted)',
                                                        background: isSelected ? 'var(--pos-action-primary)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {isSelected && <Check size={14} color="white" />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--pos-text-primary)' }}>{option.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)' }}>+${option.price.toFixed(2)}</div>
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <div className="pos-quantity-control" style={{ background: 'var(--pos-bg-main)', transform: 'scale(0.9)' }}>
                                                        <button
                                                            className="pos-qty-btn"
                                                            onClick={(e) => { e.stopPropagation(); handleModifierQuantity(option.id, -1); }}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="pos-qty-value" style={{ fontSize: '14px', minWidth: '24px' }}>
                                                            {selection.quantity}
                                                        </span>
                                                        <button
                                                            className="pos-qty-btn"
                                                            onClick={(e) => { e.stopPropagation(); handleModifierQuantity(option.id, 1); }}
                                                        >
                                                            <Plus size={14} />
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
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
                                Special Instructions
                            </h3>
                            <textarea
                                className="pos-input"
                                style={{ minHeight: '100px', resize: 'none', padding: '16px' }}
                                placeholder="E.g. Well done, extra crispy, no garlic..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="pos-modal-footer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--pos-text-muted)' }}>
                            TOTAL PRICE
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>
                            ${totalPrice.toFixed(2)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="pos-quantity-control" style={{ height: '64px', padding: '8px 16px', background: 'var(--pos-bg-card)', border: '1px solid var(--pos-border-subtle)' }}>
                            <button className="pos-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                <Minus size={24} />
                            </button>
                            <span className="pos-qty-value" style={{ fontSize: '24px', minWidth: '40px' }}>{quantity}</span>
                            <button className="pos-qty-btn" onClick={() => setQuantity(quantity + 1)}>
                                <Plus size={24} />
                            </button>
                        </div>
                        <button
                            className="pos-btn pos-btn-primary"
                            style={{ flex: 1 }}
                            disabled={!isComplete}
                            onClick={handleAddToOrder}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                                <span>ADD TO ORDER</span>
                                {!isComplete && <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.8 }}>Select required options</span>}
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
