import React from 'react';
import { ShoppingBag, Trash, Minus, Plus, Edit2, Pause, CreditCard, X, Utensils } from 'lucide-react';
import { POSCartItem, OrderChannel, POSStore } from '../types/pos';
import '../styles/pos-rush.css';

interface POSCartPanelProps {
    cart: POSCartItem[];
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
    onEditItem: (item: POSCartItem) => void;
    onClearCart: () => void;
    onHoldOrder: () => void;
    total: number;
    onCheckout: () => void;
    onUpdateItem?: (id: string, updates: Partial<POSCartItem>) => void;
    channel?: OrderChannel;
    onChannelChange?: (channel: OrderChannel) => void;
    deliveryAddress?: { id: string; text: string; label: string };
    onAddressChange?: (address: { id: string; text: string; label: string } | null) => void;
    selectedStore?: POSStore;
    onStoreChange?: (store: POSStore) => void;
    availableStores?: POSStore[];
}

export const POSCartPanel: React.FC<POSCartPanelProps> = ({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onEditItem,
    onClearCart,
    onHoldOrder,
    total,
    onCheckout,
    onUpdateItem
}) => {
    const [isConfirmingClear, setIsConfirmingClear] = React.useState(false);

    const handleRemoveCustomization = (item: POSCartItem, type: 'variant' | 'topping' | 'addOn' | 'removal' | 'modifier', id: string) => {
        if (!onUpdateItem) return;

        const updates: Partial<POSCartItem> = {};

        if (type === 'variant') {
            updates.variants = item.variants?.filter(v => v.groupId !== id);
        } else if (type === 'topping' && item.pizzaModifiers) {
            updates.pizzaModifiers = {
                ...item.pizzaModifiers,
                toppings: item.pizzaModifiers.toppings.filter(t => t.optionId !== id)
            };
        } else if (type === 'addOn' && item.pizzaModifiers) {
            updates.pizzaModifiers = {
                ...item.pizzaModifiers,
                addOns: item.pizzaModifiers.addOns.filter(a => a.optionId !== id)
            };
        } else if (type === 'removal' && item.pizzaModifiers) {
            updates.pizzaModifiers = {
                ...item.pizzaModifiers,
                removals: item.pizzaModifiers.removals.filter(r => r !== id)
            };
        } else if (type === 'modifier') {
            updates.modifiers = item.modifiers?.filter(m => m.optionId !== id);
        }

        onUpdateItem(item.id, updates);
    };

    const handleRemoveComboCustomization = (item: POSCartItem, slotId: string, type: 'variant' | 'topping' | 'modifier' | 'removal', subId: string) => {
        if (!onUpdateItem || !item.slots) return;

        const newSlots = item.slots.map((slot: any) => {
            if (slot.slotId !== slotId && slot.id !== slotId) return slot;

            const updatedSlot = { ...slot };

            if (type === 'variant' && slot.variants) {
                updatedSlot.variants = slot.variants.filter((v: any) => v.groupId !== subId);
            } else if (type === 'topping' && slot.pizzaModifiers) {
                updatedSlot.pizzaModifiers = {
                    ...slot.pizzaModifiers,
                    toppings: slot.pizzaModifiers.toppings.filter((t: any) => t.optionId !== subId)
                };
            } else if (type === 'modifier' && slot.modifiers) {
                updatedSlot.modifiers = slot.modifiers.filter((m: any) => m.optionId !== subId);
            } else if (type === 'removal' && slot.pizzaModifiers) {
                updatedSlot.pizzaModifiers = {
                    ...slot.pizzaModifiers,
                    removals: slot.pizzaModifiers.removals.filter((r: any) => r !== subId)
                };
            }

            return updatedSlot;
        });

        onUpdateItem(item.id, { slots: newSlots });
    };

    const touchButtonStyle: React.CSSProperties = {
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        cursor: 'pointer',
        marginLeft: '10px',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        color: '#EF4444',
        transition: 'all 0.2s ease',
        minWidth: '28px',
        minHeight: '28px'
    };

    return (
        <div style={{
            width: '440px',
            background: 'var(--pos-bg-surface)',
            borderLeft: '1px solid var(--pos-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.4)',
            zIndex: 10,
            height: '100%'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--pos-border-subtle)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(31, 164, 169, 0.2) 0%, rgba(31, 164, 169, 0.05) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(31, 164, 169, 0.2)'
                        }}>
                            <ShoppingBag size={18} color="var(--pos-action-primary)" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>Order Cart</div>
                            <div style={{ fontSize: '11px', color: 'var(--pos-text-muted)', fontWeight: 700 }}>
                                {cart.length} {cart.length === 1 ? 'item' : 'items'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={onHoldOrder}
                            disabled={cart.length === 0}
                            style={{
                                height: '36px',
                                padding: '0 12px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--pos-border-subtle)',
                                color: cart.length > 0 ? 'var(--pos-text-primary)' : 'var(--pos-text-muted)',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Pause size={14} /> Hold
                        </button>

                        <div style={{ position: 'relative' }}>
                            {!isConfirmingClear ? (
                                <button
                                    onClick={() => setIsConfirmingClear(true)}
                                    disabled={cart.length === 0}
                                    style={{
                                        height: '36px',
                                        padding: '0 12px',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        border: '1px solid rgba(239, 68, 68, 0.15)',
                                        color: cart.length > 0 ? '#EF4444' : 'var(--pos-text-muted)',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Trash size={14} /> Clear
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => { onClearCart(); setIsConfirmingClear(false); }}
                                        style={{ height: '36px', padding: '0 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
                                    >
                                        Sure?
                                    </button>
                                    <button
                                        onClick={() => setIsConfirmingClear(false)}
                                        style={{ height: '36px', padding: '0 12px', background: 'var(--pos-bg-surface)', color: 'var(--pos-text-muted)', border: '1px solid var(--pos-border-subtle)', borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
                                    >
                                        No
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={cart.length === 0}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: cart.length > 0 ? 'var(--pos-action-primary)' : 'rgba(255,255,255,0.05)',
                        color: cart.length > 0 ? 'white' : 'var(--pos-text-muted)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: cart.length > 0 ? '0 8px 16px -4px rgba(31, 164, 169, 0.4)' : 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <CreditCard size={18} /> PROCEED TO PAY - ${total.toFixed(2)}
                </button>
            </div>

            {/* Items List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }} className="no-scrollbar">
                {cart.length === 0 ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--pos-text-muted)',
                        gap: '20px',
                        padding: '40px'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'var(--pos-bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed var(--pos-border-subtle)',
                            opacity: 0.5
                        }}>
                            <ShoppingBag size={40} strokeWidth={1} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>Empty Cart</div>
                            <div style={{ fontSize: '13px', marginTop: '6px', fontWeight: 600 }}>No items added yet</div>
                        </div>
                    </div>
                ) : (
                    cart.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} style={{
                            padding: '16px',
                            background: 'var(--pos-bg-card)',
                            border: '1px solid var(--pos-border-subtle)',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            transition: 'all 0.2s ease-out',
                            position: 'relative'
                        }}>
                            {/* Item Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                        <span style={{ color: 'var(--pos-action-primary)', marginRight: '8px' }}>{item.quantity} ×</span>
                                        {item.name}
                                    </div>

                                    {/* Customization Details Container */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '4px' }}>
                                        {/* 1. Variants (Size, Crust, etc.) */}
                                        {item.variants && item.variants.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {item.variants.map(v => (
                                                    <div key={v.groupId} style={{ fontSize: '11px', color: 'var(--pos-text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                                        <span style={{ color: 'var(--pos-text-muted)', textTransform: 'uppercase', fontSize: '9px', marginRight: '4px' }}>
                                                            {v.groupId.includes('size') ? 'Size' : (v.groupId.includes('crust') ? 'Crust' : 'Opt')}:
                                                        </span>
                                                        {v.name}
                                                        {(v as any).price > 0 && <span style={{ color: 'var(--pos-action-primary)', marginLeft: '4px', fontWeight: 800 }}>+${(v as any).price.toFixed(2)}</span>}
                                                        <button
                                                            onClick={() => handleRemoveCustomization(item, 'variant', v.groupId)}
                                                            className="hover-scale"
                                                            style={touchButtonStyle}
                                                            title="Remove Variant"
                                                        >
                                                            <X size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* 2. Pizza Customizations */}
                                        {item.pizzaModifiers && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                {/* Portion-based Toppings */}
                                                {(['LEFT', 'RIGHT', 'WHOLE'] as const).map(portion => {
                                                    const toppings = item.pizzaModifiers!.toppings.filter(t => t.portion === portion);
                                                    if (toppings.length === 0) return null;
                                                    return (
                                                        <div key={portion} style={{ display: 'flex', flexDirection: 'column' }}>
                                                            {portion !== 'WHOLE' && (
                                                                <div style={{ fontSize: '10px', color: 'var(--pos-action-primary)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2px' }}>
                                                                    {portion} HALF:
                                                                </div>
                                                            )}
                                                            {toppings.map(t => (
                                                                <div key={t.optionId} style={{ fontSize: '11px', color: 'var(--pos-text-secondary)', fontWeight: 600, paddingLeft: portion !== 'WHOLE' ? '6px' : '0', display: 'flex', alignItems: 'center' }}>
                                                                    • {t.name} {t.level !== 'NORMAL' ? `(${t.level})` : ''}
                                                                    {t.basePrice > 0 && <span style={{ color: 'var(--pos-action-primary)', marginLeft: '6px', fontWeight: 800 }}>+${t.basePrice.toFixed(2)}</span>}
                                                                    <button
                                                                        onClick={() => handleRemoveCustomization(item, 'topping', t.optionId)}
                                                                        className="hover-scale"
                                                                        style={touchButtonStyle}
                                                                        title="Remove Topping"
                                                                    >
                                                                        <X size={14} strokeWidth={3} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })}

                                                {/* Add-ons */}
                                                {item.pizzaModifiers.addOns.map(a => (
                                                    <div key={a.optionId} style={{ fontSize: '11px', color: 'var(--pos-text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                                        + {a.name} {a.quantity > 1 ? `x${a.quantity}` : ''}
                                                        {a.price > 0 && <span style={{ color: 'var(--pos-action-primary)', marginLeft: '6px', fontWeight: 800 }}>+${(a.price * a.quantity).toFixed(2)}</span>}
                                                        <button
                                                            onClick={() => handleRemoveCustomization(item, 'addOn', a.optionId)}
                                                            className="hover-scale"
                                                            style={touchButtonStyle}
                                                            title="Remove Add-on"
                                                        >
                                                            <X size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Removals */}
                                                {item.pizzaModifiers.removals.map(r => (
                                                    <div key={r} style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700, textDecoration: 'line-through', display: 'flex', alignItems: 'center' }}>
                                                        - {r} (Removed)
                                                        <button
                                                            onClick={() => handleRemoveCustomization(item, 'removal', r)}
                                                            className="hover-scale"
                                                            style={touchButtonStyle}
                                                            title="Undo Removal"
                                                        >
                                                            <X size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* 3. Standard Modifiers (Side items, etc.) */}
                                        {!item.pizzaModifiers && !item.isCombo && item.modifiers && item.modifiers.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                {item.modifiers.map(m => (
                                                    <div key={m.optionId} style={{ fontSize: '11px', color: 'var(--pos-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                                        • {m.name} {m.quantity > 1 ? `x${m.quantity}` : ''}
                                                        {m.price > 0 && <span style={{ color: 'var(--pos-action-primary)', marginLeft: '6px', fontWeight: 800 }}>+${(m.price * m.quantity).toFixed(2)}</span>}
                                                        <button
                                                            onClick={() => handleRemoveCustomization(item, 'modifier', m.optionId)}
                                                            className="hover-scale"
                                                            style={touchButtonStyle}
                                                            title="Remove Modifier"
                                                        >
                                                            <X size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Combo Selection Breakdown */}
                                        {item.isCombo && item.slots?.map((slot: any) => (
                                            <div key={slot.slotId || slot.id} style={{ marginTop: '4px' }}>
                                                <div style={{ fontSize: '10px', color: 'var(--pos-action-primary)', fontWeight: 900, textTransform: 'uppercase' }}>
                                                    {slot.slotName || slot.name}:
                                                </div>
                                                <div style={{ paddingLeft: '8px', borderLeft: '1px solid rgba(31,164,169,0.2)' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                                        • {slot.option?.name || 'Standard Selection'}
                                                    </div>

                                                    {/* Nested variants for combo items */}
                                                    {slot.variants?.map((v: any) => (
                                                        <div key={v.groupId} style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 600, paddingLeft: '8px', display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                                                            - {v.name}
                                                            {v.price > 0 && <span style={{ color: 'var(--pos-action-primary)', marginLeft: '4px' }}>(+${v.price.toFixed(2)})</span>}
                                                            <button
                                                                onClick={() => handleRemoveComboCustomization(item, slot.slotId || slot.id, 'variant', v.groupId)}
                                                                className="hover-scale"
                                                                style={{ ...touchButtonStyle, padding: '4px', minWidth: '22px', minHeight: '22px', marginLeft: '6px' }}
                                                            >
                                                                <X size={12} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* Nested pizza modifiers for combo items */}
                                                    {slot.pizzaModifiers && (
                                                        <div style={{ paddingLeft: '8px' }}>
                                                            {slot.pizzaModifiers.toppings.map((t: any) => (
                                                                <div key={t.optionId} style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                                                                    - {t.name} {t.portion !== 'WHOLE' ? `(${t.portion})` : ''}
                                                                    {t.basePrice > 0 && <span style={{ color: 'var(--pos-action-primary)', marginLeft: '4px' }}>(+${t.basePrice.toFixed(2)})</span>}
                                                                    <button
                                                                        onClick={() => handleRemoveComboCustomization(item, slot.slotId || slot.id, 'topping', t.optionId)}
                                                                        className="hover-scale"
                                                                        style={{ ...touchButtonStyle, padding: '4px', minWidth: '22px', minHeight: '22px', marginLeft: '6px' }}
                                                                    >
                                                                        <X size={12} strokeWidth={3} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {slot.pizzaModifiers.removals?.map((r: any) => (
                                                                <div key={r} style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600, textDecoration: 'line-through', display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                                                                    - No {r}
                                                                    <button
                                                                        onClick={() => handleRemoveComboCustomization(item, slot.slotId || slot.id, 'removal', r)}
                                                                        className="hover-scale"
                                                                        style={{ ...touchButtonStyle, padding: '4px', minWidth: '22px', minHeight: '22px', marginLeft: '6px' }}
                                                                    >
                                                                        <X size={12} strokeWidth={3} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Nested standard modifiers for combo items */}
                                                    {slot.modifiers?.map((m: any) => (
                                                        <div key={m.optionId} style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 600, paddingLeft: '8px', display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                                                            - {m.name} {m.quantity > 1 ? `x${m.quantity}` : ''}
                                                            {m.price > 0 && <span style={{ color: 'var(--pos-action-primary)', marginLeft: '4px' }}>(+${(m.price * m.quantity).toFixed(2)})</span>}
                                                            <button
                                                                onClick={() => handleRemoveComboCustomization(item, slot.slotId || slot.id, 'modifier', m.optionId)}
                                                                className="hover-scale"
                                                                style={{ ...touchButtonStyle, padding: '4px', minWidth: '22px', minHeight: '22px', marginLeft: '6px' }}
                                                            >
                                                                <X size={12} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Kitchen Notes */}
                                        {(item.kitchenNote || item.notes) && (
                                            <div style={{
                                                marginTop: '6px',
                                                fontSize: '11px',
                                                color: 'var(--pos-action-primary)',
                                                fontWeight: 900,
                                                background: 'rgba(31, 164, 169, 0.08)',
                                                padding: '6px 10px',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <Utensils size={12} strokeWidth={2.5} />
                                                <span>KITCHEN: {item.kitchenNote || item.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>

                            {/* Item Controls */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => onEditItem(item)}
                                        style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--pos-bg-surface)', border: '1px solid var(--pos-border-subtle)', color: 'var(--pos-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        className="hover-scale"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        className="hover-scale"
                                    >
                                        <Trash size={20} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--pos-bg-surface)', borderRadius: '12px', border: '1px solid var(--pos-border-subtle)', padding: '4px' }}>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                        style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: 'var(--pos-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        className="hover-scale"
                                    >
                                        <Minus size={20} strokeWidth={3} />
                                    </button>
                                    <span style={{ fontSize: '16px', fontWeight: 900, minWidth: '40px', textAlign: 'center' }}>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                        style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: 'var(--pos-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        className="hover-scale"
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                @keyframes posFadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
