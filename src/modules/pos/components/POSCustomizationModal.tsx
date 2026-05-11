import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Check,
    ShoppingCart,
    Plus,
    Minus
} from 'lucide-react';
import { POSProduct, POSModifierGroup } from '../types/pos';
import '../styles/pos-rush.css';

interface POSCustomizationModalProps {
    isOpen: boolean;
    product: POSProduct | null;
    initialItem?: any | null; // For editing existing cart item
    onClose: () => void;
    onAddToCart: (cartItem: any) => void;
}

// ----------------------------------------------------------------------
// HELPER INTERFACES FOR STATE
// ----------------------------------------------------------------------

interface ModifierSelection {
    optionId: string;
    quantity: number;
    price: number;
    name: string;
}

interface SlotSelection {
    option: any; // The selected product for the slot
    variants: Record<string, string>; // groupId -> optionId
    modifiers: Record<string, ModifierSelection>; // optionId -> details
}

// ----------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------

export const POSCustomizationModal: React.FC<POSCustomizationModalProps> = ({
    isOpen,
    product,
    initialItem,
    onClose,
    onAddToCart
}) => {
    // ------------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------------

    // Global
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [animating, setAnimating] = useState(false);

    // Standard Product State
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierSelection>>({});

    // Combo Product State
    const GLOBAL_SETTINGS_ID = 'GLOBAL_SETTINGS';
    const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
    const [slotSelections, setSlotSelections] = useState<Record<string, SlotSelection>>({});
    const [shakingSlot, setShakingSlot] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // EFFECTS
    // ------------------------------------------------------------------

    useEffect(() => {
        if (isOpen) {
            setAnimating(true);
            return;
        }

        const timer = setTimeout(() => setAnimating(false), 300);
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Reset or Initialize when product opens
    useEffect(() => {
        if (isOpen && product) {
            // Standard Product Init
            if (!product.isCombo) {
                if (initialItem) {
                    // Populate from existing item
                    const initialVariants: Record<string, string> = {};
                    initialItem.variants?.forEach((v: any) => {
                        initialVariants[v.groupId] = v.optionId;
                    });
                    setSelectedVariants(initialVariants);

                    const initialMods: Record<string, ModifierSelection> = {};
                    initialItem.modifiers?.forEach((m: any) => {
                        initialMods[m.optionId] = {
                            optionId: m.optionId,
                            quantity: m.quantity,
                            price: m.price,
                            name: m.name
                        };
                    });
                    setSelectedModifiers(initialMods);
                    setNotes(initialItem.notes || '');
                    setQuantity(initialItem.quantity || 1);
                } else {
                    // Reset with Defaults
                    const defaultVariants: Record<string, string> = {};
                    product.variantGroups?.forEach(g => {
                        const def = g.options.find((o: any) => o.isDefault) || g.options[0];
                        if (def) defaultVariants[g.id] = def.id;
                    });

                    const defaultMods: Record<string, ModifierSelection> = {};
                    product.modifierGroups?.forEach(g => {
                        g.options.forEach(opt => {
                            if ((opt as any).isDefault) {
                                defaultMods[opt.id] = {
                                    optionId: opt.id,
                                    quantity: 1,
                                    price: opt.price,
                                    name: opt.name
                                };
                            }
                        });
                    });

                    setSelectedVariants(defaultVariants);
                    setSelectedModifiers(defaultMods);
                    setNotes('');
                    setQuantity(1);
                }
            }
            // Combo Product Init
            else {
                // Determine initial view (Global Settings if they exist, else First Slot)
                const hasGlobalOptions = (product.variantGroups?.length || 0) > 0 || (product.modifierGroups?.length || 0) > 0;

                if (hasGlobalOptions) {
                    setActiveSlotId(GLOBAL_SETTINGS_ID);
                } else if (product.slots && product.slots.length > 0) {
                    setActiveSlotId(product.slots[0].id);
                }

                if (initialItem && initialItem.isCombo) {
                    // Rehydrate combo state 
                    const initialSlotSels: Record<string, SlotSelection> = {};
                    initialItem.slots?.forEach((s: any) => {
                        const mods: Record<string, ModifierSelection> = {};
                        s.modifiers?.forEach((m: any) => {
                            mods[m.optionId] = m;
                        });
                        initialSlotSels[s.slotId] = {
                            option: s.option,
                            variants: s.variants || {},
                            modifiers: mods
                        };
                    });
                    setSlotSelections(initialSlotSels);
                    setQuantity(initialItem.quantity || 1);
                    setNotes(initialItem.notes || '');

                    // Rehydrate global options for combo
                    const initialVariants: Record<string, string> = {};
                    initialItem.variants?.forEach((v: any) => {
                        initialVariants[v.groupId] = v.optionId;
                    });
                    setSelectedVariants(initialVariants);

                    const initialMods: Record<string, ModifierSelection> = {};
                    initialItem.modifiers?.forEach((m: any) => {
                        initialMods[m.optionId] = m;
                    });
                    setSelectedModifiers(initialMods);
                } else {
                    setSlotSelections({});
                    setQuantity(1);
                    setNotes('');
                    setSelectedVariants({});
                    setSelectedModifiers({});
                }
            }
        }
    }, [isOpen, product, initialItem]);

    // Derived Constants (Safe access for null product)
    const isCombo = product ? (!!product.isCombo || !!product.comboSlots || (product.slots && product.slots.length > 0)) : false;
    const slots = product?.slots || [];
    const activeSlot = isCombo ? slots.find((s: any) => s.id === activeSlotId) : null;

    // ------------------------------------------------------------------
    // CALCULATIONS & VALIDATION (Moved Before Returns)
    // ------------------------------------------------------------------

    const { totalPrice, modifierTotal } = useMemo(() => {
        if (!product) return { modifierTotal: 0, totalPrice: 0 };

        let base = product.price;
        let mods = 0;

        // 1. Calculate Global Options (Both Standard and Combo)
        product.variantGroups?.forEach(g => {
            const sId = selectedVariants[g.id];
            if (sId) {
                const opt = g.options.find(o => o.id === sId);
                if (opt) base += opt.additionalPrice;
            }
        });

        Object.values(selectedModifiers).forEach(m => {
            mods += m.price * m.quantity;
        });

        // 2. Calculate Slot-specific Options (Combo only)
        if (isCombo) {
            Object.values(slotSelections).forEach((sel: any) => {
                if (sel.option) base += sel.option.price || 0;
                if (sel.modifiers) {
                    Object.values(sel.modifiers).forEach((m: any) => {
                        mods += m.price * m.quantity;
                    });
                }

                // Slot-specific variants price
                if (sel.option && sel.variants) {
                    // Note: Usually slot options themselves have the price, 
                    // and variants might add to it. Assuming sel.option.price 
                    // covers the base slot product.
                }
            });
        }

        return {
            modifierTotal: mods,
            totalPrice: (base + mods) * quantity
        };
    }, [product, isCombo, selectedVariants, selectedModifiers, slotSelections, quantity]);

    const validation = useMemo(() => {
        if (!product) return { isValid: false, incompleteSlots: [], missingGlobal: false };

        // 1. Check Global Options (Always)
        const missingVariantGroups = product.variantGroups?.filter(g => !selectedVariants[g.id]) || [];
        const missingModifierGroups = product.modifierGroups?.filter(g => {
            if (!g.minSelection) return false;
            const count = g.options.filter(o => selectedModifiers[o.id]).length;
            return count < g.minSelection;
        }) || [];

        const isGlobalValid = missingVariantGroups.length === 0 && missingModifierGroups.length === 0;

        if (!isCombo) {
            return {
                isValid: isGlobalValid,
                incompleteSlots: [] as any[],
                missingGlobal: !isGlobalValid
            };
        } else {
            // 2. Check Combo Slots
            const incompleteSlots = slots.filter((s: any) => {
                const sel = slotSelections[s.id];
                if (!sel || !sel.option) return true;
                if (activeSlot?.id === s.id) { // Only validate variants if it's the current option
                    // Additional per-slot validation could go here
                }
                // Check required variants for the slot selection
                if (s.variantGroups) {
                    const missingVars = s.variantGroups.some((g: any) => g.required && !sel.variants?.[g.id]);
                    if (missingVars) return true;
                }
                return false;
            });

            return {
                isValid: isGlobalValid && incompleteSlots.length === 0,
                incompleteSlots,
                missingGlobal: !isGlobalValid
            };
        }
    }, [product, isCombo, selectedVariants, selectedModifiers, slotSelections, slots]);

    // ------------------------------------------------------------------
    // HANDLERS
    // ------------------------------------------------------------------

    const handleStandardVariantSelect = (groupId: string, optionId: string) => {
        setSelectedVariants(prev => ({ ...prev, [groupId]: optionId }));
    };

    const handleStandardModifierToggle = (group: POSModifierGroup, option: any) => {
        const existing = selectedModifiers[option.id];

        if (existing) {
            // Remove
            const next = { ...selectedModifiers };
            delete next[option.id];
            setSelectedModifiers(next);
        } else {
            // Add - Check Max Selection
            // Count current selections in this group
            const currentCount = group.options.filter(o => selectedModifiers[o.id]).length;
            if (group.maxSelection && currentCount >= group.maxSelection) {
                // If single select (max 1), replace. Else ignore or shake?
                if (group.maxSelection === 1) {
                    // Find the existing one and remove it, then add new
                    const otherOption = group.options.find(o => selectedModifiers[o.id]);
                    const next = { ...selectedModifiers };
                    if (otherOption) delete next[otherOption.id];
                    next[option.id] = { optionId: option.id, quantity: 1, price: option.price, name: option.name };
                    setSelectedModifiers(next);
                    return;
                }
                return; // Max reached
            }

            setSelectedModifiers(prev => ({
                ...prev,
                [option.id]: { optionId: option.id, quantity: 1, price: option.price, name: option.name }
            }));
        }
    };

    const handleStandardModifierQty = (optionId: string, delta: number) => {
        const existing = selectedModifiers[optionId];
        if (!existing) return;

        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
            const next = { ...selectedModifiers };
            delete next[optionId];
            setSelectedModifiers(next);
        } else {
            setSelectedModifiers(prev => ({
                ...prev,
                [optionId]: { ...existing, quantity: newQty }
            }));
        }
    };

    // ------------------------------------------------------------------
    // LOGIC: COMBO PRODUCT
    // ------------------------------------------------------------------

    const handleSlotOptionSelect = (option: any) => {
        if (!activeSlot) return;
        setSlotSelections(prev => ({
            ...prev,
            [activeSlot.id]: {
                option,
                variants: {},
                modifiers: {}
            }
        }));
    };

    const handleSlotVariantSelect = (groupId: string, option: any) => {
        if (!activeSlot) return;
        setSlotSelections(prev => ({
            ...prev,
            [activeSlot.id]: {
                ...prev[activeSlot.id],
                variants: {
                    ...prev[activeSlot.id]?.variants,
                    [groupId]: option.id
                }
            }
        }));
    };

    const handleSlotModifierToggle = (group: POSModifierGroup, option: any) => {
        if (!activeSlot) return;
        const currentSlotSel = slotSelections[activeSlot.id] || { option: null, variants: {}, modifiers: {} };
        const currentModifiers = { ...currentSlotSel.modifiers };

        if (currentModifiers[option.id]) {
            delete currentModifiers[option.id];
        } else {
            // Max check
            const currentCount = group.options.filter(o => currentModifiers[o.id]).length;
            if (group.maxSelection && currentCount >= group.maxSelection) {
                if (group.maxSelection === 1) {
                    const other = group.options.find(o => currentModifiers[o.id]);
                    if (other) delete currentModifiers[other.id];
                    currentModifiers[option.id] = { optionId: option.id, quantity: 1, price: option.price, name: option.name };
                } else {
                    return;
                }
            } else {
                currentModifiers[option.id] = { optionId: option.id, quantity: 1, price: option.price, name: option.name };
            }
        }

        setSlotSelections(prev => ({
            ...prev,
            [activeSlot.id]: { ...currentSlotSel, modifiers: currentModifiers }
        }));
    };

    const handleSlotModifierQty = (optionId: string, delta: number) => {
        if (!activeSlot) return;
        const currentSlotSel = slotSelections[activeSlot.id];
        if (!currentSlotSel) return;

        const currentModifiers = { ...currentSlotSel.modifiers };
        const mod = currentModifiers[optionId];
        if (!mod) return;

        const newQty = mod.quantity + delta;
        if (newQty <= 0) {
            delete currentModifiers[optionId];
        } else {
            currentModifiers[optionId] = { ...mod, quantity: newQty };
        }

        setSlotSelections(prev => ({
            ...prev,
            [activeSlot.id]: { ...currentSlotSel, modifiers: currentModifiers }
        }));
    };

    const handleSubmit = () => {
        if (!validation.isValid) {
            // Shake/Highlight Logic
            if (validation.missingGlobal) {
                setActiveSlotId(GLOBAL_SETTINGS_ID);
                return;
            }

            if (isCombo && validation.incompleteSlots.length > 0) {
                const first = validation.incompleteSlots[0];
                setShakingSlot(first.id);
                setTimeout(() => setShakingSlot(null), 500);
                setActiveSlotId(first.id);
            }
            return;
        }

        if (!product) return;

        const cartItem = {
            id: initialItem?.id || Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: totalPrice / quantity,
            quantity: quantity,
            isCombo,
            kitchenNote: notes.trim(),
            notes: notes.trim(),
            // Standard Fields
            variants: Object.entries(selectedVariants).map(([gId, oId]) => {
                const group = product.variantGroups?.find(g => g.id === gId);
                const option = group?.options.find(o => o.id === oId);
                return {
                    groupId: gId,
                    optionId: oId,
                    name: option?.name,
                    price: option?.additionalPrice || 0
                };
            }),
            modifiers: Object.values(selectedModifiers).map(m => ({
                optionId: m.optionId,
                name: m.name,
                price: m.price,
                quantity: m.quantity
            })),
            // Combo Fields
            slots: isCombo ? Object.entries(slotSelections).map(([sId, sel]) => {
                const slotDef = product.slots?.find(s => s.id === sId);
                return {
                    slotId: sId,
                    slotName: slotDef?.name || 'Slot',
                    option: sel.option,
                    variants: Object.entries(sel.variants).map(([vgId, voId]) => {
                        const variantOption = (slotDef as any)?.variantGroups?.find((g: any) => g.id === vgId)?.options.find((o: any) => o.id === voId);
                        return {
                            groupId: vgId,
                            optionId: voId,
                            name: variantOption?.name || 'Standard',
                            price: variantOption?.additionalPrice || 0
                        };
                    }),
                    modifiers: Object.values(sel.modifiers)
                };
            }) : undefined
        };

        onAddToCart(cartItem);
        onClose();
    };

    // ------------------------------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------------------------------

    const renderCounter = (count: number, onMinus: () => void, onPlus: () => void, size = 'sm') => (
        <div className={`pos-quantity-control ${size === 'lg' ? 'pos-qty-lg' : ''}`} style={{ background: 'var(--pos-bg-main)' }}>
            <button className="pos-qty-btn" onClick={(e) => { e.stopPropagation(); onMinus(); }}>
                <Minus size={size === 'lg' ? 20 : 14} strokeWidth={3} />
            </button>
            <span className="pos-qty-value" style={{ fontSize: size === 'lg' ? '18px' : '14px' }}>{count}</span>
            <button className="pos-qty-btn" onClick={(e) => { e.stopPropagation(); onPlus(); }}>
                <Plus size={size === 'lg' ? 20 : 14} strokeWidth={3} />
            </button>
        </div>
    );

    // ------------------------------------------------------------------
    // EARLY RETURN / RENDER
    // ------------------------------------------------------------------

    if (!isOpen && !animating) return null;
    if (!product) return null;

    return (
        <div className="pos-modal-overlay" onClick={onClose}
            style={{
                backdropFilter: 'blur(12px)',
                background: 'rgba(0,0,0,0.6)',
                transition: 'opacity 0.2s',
                opacity: isOpen ? 1 : 0,
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                padding: 0
            }}>

            {/* MAIN MODAL CONTAINER */}
            <div
                className="pos-custom-sheet"
                onClick={e => e.stopPropagation()}
                style={{
                    width: 'calc(100% - 400px)', // Leave 400px for cart on right
                    maxWidth: '1000px', // But don't get too wide on huge screens
                    marginLeft: '20px', // Gaps
                    marginRight: 'auto',
                    marginTop: '20px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--pos-bg-surface)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    overflow: 'hidden',
                    border: '1px solid var(--pos-border-subtle)',
                    transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* 1. HEADER */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--pos-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--pos-bg-card)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className={`pos-badge ${isCombo ? 'pos-badge-warning' : 'pos-badge-success'}`}>
                                {isCombo ? 'COMBO BUILDER' : 'CUSTOMIZE'}
                            </span>
                            {product.isFavorite && <span className="pos-badge">FAVORITE</span>}
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.1, color: 'var(--pos-text-primary)' }}>
                            {product.name}
                        </h2>
                        <div style={{ fontSize: '16px', color: 'var(--pos-text-muted)', fontWeight: 600, marginTop: '4px' }}>
                            Base Price: <span style={{ color: 'var(--pos-text-primary)' }}>${product.price ? product.price.toFixed(2) : '0.00'}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="pos-btn-secondary" style={{ width: '48px', height: '48px', borderRadius: '12px', padding: 0 }}>
                        <X size={24} />
                    </button>
                </div>

                {/* 2. BODY CONTENT */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* COMBO SIDEBAR (Left) */}
                    {isCombo && (
                        <div style={{ width: '260px', background: 'var(--pos-bg-main)', borderRight: '1px solid var(--pos-border-subtle)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                            <div style={{ padding: '24px 16px 16px' }}>
                                <h4 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
                                    Combo Slots
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* Global Options Button */}
                                    {((product.variantGroups?.length || 0) > 0 || (product.modifierGroups?.length || 0) > 0) && (
                                        <button
                                            onClick={() => setActiveSlotId(GLOBAL_SETTINGS_ID)}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                textAlign: 'left',
                                                background: activeSlotId === GLOBAL_SETTINGS_ID ? 'var(--pos-bg-surface)' : 'transparent',
                                                border: activeSlotId === GLOBAL_SETTINGS_ID ? '1px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                marginBottom: '12px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 800, color: activeSlotId === GLOBAL_SETTINGS_ID ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)' }}>
                                                    COMBO OPTIONS
                                                </span>
                                                {!validation.missingGlobal && <Check size={14} color="var(--pos-state-success)" strokeWidth={3} />}
                                            </div>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>Shared Settings</div>
                                        </button>
                                    )}

                                    {slots.map((slot: any, idx: number) => {
                                        const active = activeSlotId === slot.id;
                                        const complete = !validation.incompleteSlots.find((s: any) => s.id === slot.id);
                                        const shaking = shakingSlot === slot.id;
                                        const sel = slotSelections[slot.id];

                                        return (
                                            <button
                                                key={slot.id}
                                                onClick={() => setActiveSlotId(slot.id)}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    textAlign: 'left',
                                                    background: active ? 'var(--pos-bg-surface)' : 'transparent',
                                                    border: active ? '1px solid var(--pos-action-primary)' : '1px solid transparent',
                                                    position: 'relative',
                                                    animation: shaking ? 'posShake 0.4s both' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 800, color: active ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)' }}>
                                                        SLOT {idx + 1}
                                                    </span>
                                                    {complete && <Check size={14} color="var(--pos-state-success)" strokeWidth={3} />}
                                                </div>
                                                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--pos-text-primary)' }}>{slot.name}</div>
                                                {sel?.option && (
                                                    <div style={{ fontSize: '13px', color: 'var(--pos-text-secondary)', marginTop: '4px' }}>{sel.option.name}</div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MAIN SCROLL AREA */}
                    <div style={{ flex: 1, padding: '0', overflowY: 'auto', background: 'var(--pos-bg-surface)' }} className="pos-scroll">
                        <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>

                            {/* --- PRE-SELECTED SECTION (Configuration Summary) --- */}
                            <div className="pos-preselected-container" style={{
                                marginBottom: '24px',
                                padding: '16px 20px',
                                background: 'rgba(31, 164, 169, 0.02)',
                                borderRadius: '16px',
                                border: '1px solid var(--pos-border-subtle)',
                                boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-action-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pre-Selected</h3>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--pos-text-muted)', background: 'var(--pos-bg-main)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--pos-border-subtle)' }}>
                                        ACTIVE CONFIGURATION
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}>
                                    {/* All Variants */}
                                    {product.variantGroups?.map(group => {
                                        const selectedId = selectedVariants[group.id];
                                        const option = group.options.find(o => o.id === selectedId);
                                        if (!option) return null;
                                        const isOriginalDefault = option.isDefault;

                                        return (
                                            <div key={group.id} style={{
                                                padding: '6px 12px',
                                                background: isOriginalDefault ? 'white' : 'rgba(245, 158, 11, 0.05)',
                                                borderRadius: '8px',
                                                border: isOriginalDefault ? '1px solid var(--pos-border-subtle)' : '1px solid rgba(245, 158, 11, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '8px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>{group.name}</span>
                                                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>{option.name}</span>
                                                </div>
                                                {isOriginalDefault ? <Check size={10} color="var(--pos-action-primary)" strokeWidth={4} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }} />}
                                            </div>
                                        );
                                    })}

                                    {/* Selected Preset Modifiers */}
                                    {product.modifierGroups?.flatMap(g => g.options.filter(o => (o as any).isDefault && selectedModifiers[o.id])).map(mod => {
                                        const selection = selectedModifiers[mod.id];
                                        if (!selection) return null;
                                        return (
                                            <div key={mod.id} style={{
                                                padding: '6px 12px',
                                                background: 'white',
                                                borderRadius: '8px',
                                                border: '1px solid var(--pos-border-subtle)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '8px', fontWeight: 800, color: 'var(--pos-action-primary)', textTransform: 'uppercase' }}>PRESET</span>
                                                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>
                                                        {mod.name}
                                                        {selection.quantity > 1 && <span style={{ color: 'var(--pos-action-primary)', marginLeft: '4px' }}>x{selection.quantity}</span>}
                                                    </span>
                                                </div>
                                                <Check size={10} color="var(--pos-action-primary)" strokeWidth={4} />
                                            </div>
                                        );
                                    })}

                                    {/* Excluded Defaults */}
                                    {product.modifierGroups?.flatMap(g => g.options.filter(o => (o as any).isDefault && !selectedModifiers[o.id])).map(mod => (
                                        <div key={mod.id} style={{
                                            padding: '6px 12px',
                                            background: 'rgba(239, 68, 68, 0.02)',
                                            borderRadius: '8px',
                                            border: '1px dashed rgba(239, 68, 68, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            opacity: 0.8
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '8px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>REMOVED</span>
                                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444' }}>NO {mod.name.toUpperCase()}</span>
                                            </div>
                                            <X size={10} color="#ef4444" strokeWidth={4} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- SCENARIO A: STANDARD PRODUCT OR GLOBAL SETTINGS --- */}
                            {(!isCombo || activeSlotId === GLOBAL_SETTINGS_ID) && (
                                <>
                                    {/* Variants */}
                                    {product.variantGroups?.map(group => (
                                        <div key={group.id} style={{ marginBottom: '40px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{group.name}</h3>
                                                <span className="pos-badge pos-badge-warning">REQUIRED</span>
                                            </div>
                                            <div className="pos-grid-3">
                                                {group.options.map(option => {
                                                    const isSelected = selectedVariants[group.id] === option.id;
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleStandardVariantSelect(group.id, option.id)}
                                                            style={{
                                                                padding: '20px',
                                                                borderRadius: '16px',
                                                                border: isSelected ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                                background: isSelected ? 'rgba(31, 164, 169, 0.1)' : 'var(--pos-bg-card)',
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s'
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: 700, color: isSelected ? 'var(--pos-action-primary)' : 'var(--pos-text-primary)', marginBottom: '4px' }}>{option.name}</div>
                                                            <div style={{ fontSize: '13px', color: 'var(--pos-text-muted)' }}>
                                                                {option.additionalPrice > 0 ? `+$${option.additionalPrice.toFixed(2)}` : 'Included'}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ height: '1px', background: 'var(--pos-border-subtle)', margin: '32px 0' }} />

                                    {/* Modifiers */}
                                    {product.modifierGroups?.map(group => (
                                        <div key={group.id} style={{ marginBottom: '40px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{group.name}</h3>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pos-text-muted)' }}>
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
                                                            onClick={() => handleStandardModifierToggle(group, option)}
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '16px',
                                                                borderRadius: '16px',
                                                                border: isSelected ? '1px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                                background: isSelected ? 'rgba(31, 164, 169, 0.05)' : 'var(--pos-bg-card)',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: 600, color: 'var(--pos-text-primary)' }}>{option.name}</div>
                                                                <div style={{ fontSize: '13px', color: 'var(--pos-text-muted)' }}>+${option.price.toFixed(2)}</div>
                                                            </div>
                                                            {isSelected ? (
                                                                renderCounter(
                                                                    selection.quantity,
                                                                    () => handleStandardModifierQty(option.id, -1),
                                                                    () => handleStandardModifierQty(option.id, 1)
                                                                )
                                                            ) : (
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--pos-text-muted)', opacity: 0.5 }}></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* --- SCENARIO B: COMBO SLOT CONFIG --- */}
                            {isCombo && activeSlot && (
                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--pos-text-muted)', marginBottom: '24px', letterSpacing: '0.1em' }}>
                                        Select {activeSlot.name}
                                    </h3>

                                    {/* 1. Slot Options */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                                        {activeSlot.options?.map((opt: any) => {
                                            const isSelected = slotSelections[activeSlot.id]?.option?.id === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleSlotOptionSelect(opt)}
                                                    style={{
                                                        padding: '16px',
                                                        borderRadius: '16px',
                                                        border: isSelected ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                        background: isSelected ? 'rgba(31, 164, 169, 0.1)' : 'var(--pos-bg-card)',
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.1s'
                                                    }}
                                                    className={!isSelected ? 'hover-scale' : ''}
                                                >
                                                    <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px', background: 'var(--pos-bg-main)', marginBottom: '12px', overflow: 'hidden' }}>
                                                        {opt.image && <img src={opt.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <div style={{ fontWeight: 800, fontSize: '15px' }}>{opt.name}</div>
                                                    {opt.price > 0 && <div style={{ color: 'var(--pos-state-success)', fontWeight: 700, fontSize: '13px' }}>+${opt.price}</div>}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* 2. Slot Config (Variants/Modifiers) */}
                                    {slotSelections[activeSlot.id]?.option && (
                                        <div style={{ padding: '24px', background: 'var(--pos-bg-card)', borderRadius: '16px', border: '1px solid var(--pos-border-subtle)' }}>
                                            {/* Slot Variants */}
                                            {activeSlot.variantGroups?.map((group: any) => (
                                                <div key={group.id} style={{ marginBottom: '24px' }}>
                                                    <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: 'var(--pos-text-muted)' }}>{group.name}</h4>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        {group.options.map((v: any) => {
                                                            const isSel = slotSelections[activeSlot.id]?.variants?.[group.id] === v.id;
                                                            return (
                                                                <button
                                                                    key={v.id}
                                                                    onClick={() => handleSlotVariantSelect(group.id, v)}
                                                                    style={{
                                                                        padding: '10px 16px',
                                                                        borderRadius: '10px',
                                                                        background: isSel ? 'var(--pos-action-primary)' : 'var(--pos-bg-surface)',
                                                                        color: isSel ? 'white' : 'var(--pos-text-secondary)',
                                                                        border: '1px solid transparent',
                                                                        fontWeight: 700,
                                                                        fontSize: '13px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    {v.name}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Slot Modifiers */}
                                            {activeSlot.modifierGroups?.map((group: any) => (
                                                <div key={group.id} style={{ marginTop: '24px' }}>
                                                    <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: 'var(--pos-text-muted)' }}>{group.name}</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                        {group.options.map((m: any) => {
                                                            const sel = slotSelections[activeSlot.id]?.modifiers?.[m.id];
                                                            return (
                                                                <div key={m.id}
                                                                    onClick={() => handleSlotModifierToggle(group, m)}
                                                                    style={{ padding: '12px', background: 'var(--pos-bg-surface)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: sel ? '1px solid var(--pos-action-primary)' : '1px solid transparent' }}>
                                                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{m.name} <span style={{ color: 'var(--pos-state-success)' }}>+${m.price}</span></div>
                                                                    {sel ? (
                                                                        renderCounter(sel.quantity, () => handleSlotModifierQty(m.id, -1), () => handleSlotModifierQty(m.id, 1))
                                                                    ) : <Plus size={16} />}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes Field (Always visible at bottom) */}
                        </div>
                    </div>
                </div>

                {/* 3. PRICE & ACTION FOOTER */}
                <div style={{ background: 'var(--pos-bg-card)', borderTop: '1px solid var(--pos-border-subtle)', padding: '24px 32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        {/* Quantity Control */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--pos-text-muted)' }}>Quantity</span>
                            {renderCounter(quantity, () => setQuantity(Math.max(1, quantity - 1)), () => setQuantity(quantity + 1), 'lg')}
                        </div>

                        {/* Kitchen Notes (Touch Optimized) */}
                        <div style={{ flex: 1, margin: '0 32px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '12px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Kitchen Notes <span style={{ color: 'var(--pos-action-primary)' }}>(Internal)</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {notes && (
                                        <button
                                            onClick={() => setNotes('')}
                                            style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            CLEAR
                                        </button>
                                    )}
                                    <span style={{ fontSize: '10px', color: notes.length >= 150 ? '#ef4444' : 'var(--pos-text-muted)', fontWeight: 800 }}>
                                        {notes.length}/150
                                    </span>
                                </div>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, 150))}
                                placeholder="prepare instructions..."
                                style={{
                                    width: '100%',
                                    height: '42px',
                                    padding: '10px 14px',
                                    background: 'var(--pos-bg-main)',
                                    border: '1.5px solid var(--pos-border-subtle)',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    resize: 'none',
                                    color: 'var(--pos-text-primary)'
                                }}
                            />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {['Extra Crispy', 'Light Bake', 'Well Done', 'Cut into 4', 'Cut into 6'].map(chip => (
                                    <button
                                        key={chip}
                                        onClick={() => setNotes(prev => {
                                            const clean = prev.trim();
                                            if (clean.includes(chip)) return prev;
                                            return (clean ? `${clean}, ${chip}` : chip).slice(0, 150);
                                        })}
                                        style={{
                                            height: '34px',
                                            padding: '0 12px',
                                            borderRadius: '8px',
                                            background: notes.includes(chip) ? 'var(--pos-action-primary)' : 'rgba(31, 164, 169, 0.05)',
                                            border: '1px solid rgba(31, 164, 169, 0.15)',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: notes.includes(chip) ? 'white' : 'var(--pos-action-primary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                        className="hover-scale"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Totals Breakdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '32px' }}>
                            <div style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', marginBottom: '4px' }}>
                                Modifiers: <span style={{ color: 'var(--pos-text-primary)' }}>${modifierTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>
                                ${totalPrice.toFixed(2)}
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!validation.isValid}
                            style={{
                                height: '72px',
                                padding: '0 48px',
                                borderRadius: '16px',
                                background: validation.isValid ? 'var(--pos-action-primary)' : 'var(--pos-border-subtle)',
                                color: validation.isValid ? 'white' : 'var(--pos-text-muted)',
                                border: 'none',
                                fontSize: '20px',
                                fontWeight: 800,
                                cursor: validation.isValid ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                transition: 'all 0.2s',
                                boxShadow: validation.isValid ? '0 10px 20px -5px rgba(31, 164, 169, 0.4)' : 'none'
                            }}
                        >
                            <ShoppingCart size={24} strokeWidth={3} />
                            {validation.isValid ? 'ADD TO ORDER' : 'COMPLETE SELECTIONS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
