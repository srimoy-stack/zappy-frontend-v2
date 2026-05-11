import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    ShoppingCart,
    Plus,
    Minus,
    ArrowLeft,
    Check,
    Settings,
    Layers,
    RotateCcw,
    ChevronRight,
    Utensils
} from 'lucide-react';
import { POSProduct } from '../types/pos';
import '../styles/pos-rush.css';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type Portion = 'WHOLE' | 'LEFT' | 'RIGHT';
type Level = 'NORMAL' | 'EXTRA' | 'DOUBLE';

interface ToppingSelection {
    optionId: string;
    name: string;
    basePrice: number;
    portion: Portion;
    level: Level;
}

interface AddOnSelection {
    optionId: string;
    name: string;
    price: number;
    quantity: number;
}

interface POSPizzaModifierModalProps {
    isOpen: boolean;
    product: POSProduct | null;
    initialItem?: any | null;
    allProducts?: POSProduct[]; // Needed for combo slot selection
    onClose: () => void;
    onAddToCart: (cartItem: any) => void;
}

// ----------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------

export const POSPizzaModifierModal: React.FC<POSPizzaModifierModalProps> = ({
    isOpen,
    product,
    initialItem,
    allProducts = [],
    onClose,
    onAddToCart
}) => {
    // ------------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------------

    const [selectedToppings, setSelectedToppings] = useState<Record<string, ToppingSelection>>({});
    const [selectedAddOns, setSelectedAddOns] = useState<Record<string, AddOnSelection>>({});
    const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // groupId -> optionId
    const [activeCategory, setActiveCategory] = useState<'PRESELECTED' | 'BASE' | 'TOPPINGS' | 'ADDONS' | 'SLOTS'>('PRESELECTED');
    const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
    const [slotSelections, setSlotSelections] = useState<Record<string, { productId: string; toppings: Record<string, ToppingSelection>; removals: Set<string> }>>({});
    const [kitchenNotes, setKitchenNotes] = useState('');

    // ------------------------------------------------------------------
    // INITIALIZATION
    // ------------------------------------------------------------------

    useEffect(() => {
        if (isOpen && product) {
            if (initialItem) {
                const toppings: Record<string, ToppingSelection> = {};
                initialItem.pizzaModifiers?.toppings?.forEach((t: any) => {
                    toppings[t.optionId] = t;
                });
                setSelectedToppings(toppings);

                const addOns: Record<string, AddOnSelection> = {};
                initialItem.pizzaModifiers?.addOns?.forEach((a: any) => {
                    addOns[a.optionId] = a;
                });
                setSelectedAddOns(addOns);

                setRemovedIngredients(new Set(initialItem.pizzaModifiers?.removals || []));

                const variants: Record<string, string> = {};
                initialItem.variants?.forEach((v: any) => {
                    variants[v.groupId] = v.optionId;
                });
                setSelectedVariants(variants);

                if (initialItem.isCombo && initialItem.comboSelections) {
                    setSlotSelections(initialItem.comboSelections);
                } else {
                    setSlotSelections({});
                }
                setKitchenNotes(initialItem.kitchenNote || initialItem.notes || '');
            } else {
                // RUSH MODE: Auto-select first variants as defaults
                const defaultVariants: Record<string, string> = {};
                product.variantGroups?.forEach(group => {
                    if (group && group.options && group.options.length > 0) {
                        const firstOption = group.options[0];
                        if (firstOption) {
                            defaultVariants[group.id] = firstOption.id;
                        }
                    }
                });

                setSelectedVariants(defaultVariants);
                setSelectedToppings({});
                setSelectedAddOns({});
                setRemovedIngredients(new Set());
                setSlotSelections({});
                setKitchenNotes('');

                // Set best starting category
                setActiveCategory('PRESELECTED');
                setActiveSlotId(null);
            }
        }
    }, [isOpen, product, initialItem]);

    // ------------------------------------------------------------------
    // CALCULATIONS
    // ------------------------------------------------------------------

    const sizeMultiplier = useMemo(() => {
        const sizeGroup = product?.variantGroups?.find(g => g.name.toLowerCase().includes('size'));
        const selectedId = sizeGroup ? selectedVariants[sizeGroup.id] : null;
        const selectedOpt = sizeGroup?.options.find(o => o.id === selectedId);

        if (!selectedOpt) return 1.0;
        const name = selectedOpt.name.toLowerCase();
        if (name.includes('large') || name.includes('12')) return 1.5;
        if (name.includes('medium') || name.includes('10')) return 1.0;
        if (name.includes('regular') || name.includes('small') || name.includes('8')) return 0.8;
        return 1.0;
    }, [product, selectedVariants]);

    const pricing = useMemo(() => {
        if (!product) return { base: 0, crust: 0, toppings: 0, addOns: 0, total: 0 };

        const base = product.price;
        let variantExtra = 0;

        Object.entries(selectedVariants).forEach(([gId, oId]) => {
            const opt = product.variantGroups?.find(g => g.id === gId)?.options.find(o => o.id === oId);
            if (opt) variantExtra += opt.additionalPrice;
        });

        let toppingsTotal = 0;
        Object.values(selectedToppings).forEach(t => {
            const portionFactor = t.portion === 'WHOLE' ? 1.0 : 0.5;
            const levelFactor = t.level === 'NORMAL' ? 1.0 : (t.level === 'EXTRA' ? 1.5 : 2.0);
            toppingsTotal += t.basePrice * sizeMultiplier * portionFactor * levelFactor;
        });

        let addOnsTotal = 0;
        Object.values(selectedAddOns).forEach(a => {
            addOnsTotal += a.price * a.quantity;
        });

        return {
            base,
            crust: variantExtra,
            toppings: toppingsTotal,
            addOns: addOnsTotal,
            total: base + variantExtra + toppingsTotal + addOnsTotal
        };
    }, [product, selectedVariants, selectedToppings, selectedAddOns, sizeMultiplier]);

    // Validation - Improved to handle products with no variants defined and combo slots
    const isValid = useMemo(() => {
        if (!product) return false;
        const variantsValid = !product.variantGroups || product.variantGroups.length === 0 || product.variantGroups.every(g => !!selectedVariants[g.id]);
        if (!variantsValid) return false;

        if (product.isCombo && product.comboSlots) {
            return product.comboSlots.every(slot => !!slotSelections[slot.id]?.productId);
        }

        return true;
    }, [product, selectedVariants, slotSelections]);

    // Group Discovery Helpers
    const currentProductContext = useMemo(() => {
        if (!product) return null;
        if (product.isCombo && activeSlotId) {
            const slotProdId = slotSelections[activeSlotId]?.productId;
            return allProducts.find(p => p.id === slotProdId) || null;
        }
        return product;
    }, [product, activeSlotId, slotSelections, allProducts]);

    const toppingOptions = useMemo(() => {
        const target = currentProductContext;
        if (!target?.modifierGroups) return [];
        return target.modifierGroups
            .filter(g => g.name.toLowerCase().includes('topping') || g.name.toLowerCase().includes('extra'))
            .flatMap(g => g.options);
    }, [currentProductContext]);

    const addOnOptions = useMemo(() => {
        const target = product; // Add-ons are usually shared at combo level or product level
        if (!target?.modifierGroups) return [];
        return target.modifierGroups
            .filter(g => !g.name.toLowerCase().includes('topping') && !g.name.toLowerCase().includes('removal'))
            .flatMap(g => g.options);
    }, [product]);

    const removalIngredients = useMemo(() => {
        if (!product) return [];
        // Use provided ingredients list or fallback to common defaults
        return (product as any).ingredients || ['Tomato Sauce', 'Mozzarella', 'Basil', 'Oregano', 'Olive Oil', 'Garlic Paste'];
    }, [product]);

    // ------------------------------------------------------------------
    // HANDLERS
    // ------------------------------------------------------------------

    const handleVariantSelect = (groupId: string, optionId: string) => {
        setSelectedVariants(prev => ({ ...prev, [groupId]: optionId }));
    };

    const handleToppingToggle = (option: any) => {
        setSelectedToppings(prev => {
            const next = { ...prev };
            if (next[option.id]) {
                delete next[option.id];
            } else {
                next[option.id] = {
                    optionId: option.id,
                    name: option.name,
                    basePrice: option.price || 1.50,
                    portion: 'WHOLE',
                    level: 'NORMAL'
                };
            }
            return next;
        });
    };

    const updateTopping = (id: string, updates: Partial<ToppingSelection>) => {
        setSelectedToppings(prev => {
            const current = prev[id];
            if (!current) return prev;
            return {
                ...prev,
                [id]: { ...current, ...updates } as ToppingSelection
            };
        });
    };

    const handleAddOnQty = (option: any, delta: number) => {
        setSelectedAddOns(prev => {
            const next = { ...prev };
            const current = next[option.id] || { optionId: option.id, name: option.name, price: option.price, quantity: 0 };
            const newQty = Math.max(0, current.quantity + delta);
            if (newQty === 0) delete next[option.id];
            else next[option.id] = { ...current, quantity: newQty };
            return next;
        });
    };

    const handleRemovalToggle = (ingredientId: string) => {
        setRemovedIngredients(prev => {
            const next = new Set(prev);
            if (next.has(ingredientId)) next.delete(ingredientId);
            else next.add(ingredientId);
            return next;
        });
    };

    const handleReset = () => {
        setSelectedToppings({});
        setSelectedAddOns({});
        setRemovedIngredients(new Set());
        setSelectedVariants({});
        setActiveCategory('PRESELECTED');
        setKitchenNotes('');
    };

    const handleConfirm = () => {
        if (!product || !isValid) return;
        const cartItem = {
            id: initialItem?.id || Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: pricing.total,
            quantity: initialItem?.quantity || 1,
            variants: Object.entries(selectedVariants).map(([gId, oId]) => {
                const group = product.variantGroups?.find(g => g.id === gId);
                const option = group?.options.find(o => o.id === oId);
                return {
                    groupId: gId,
                    optionId: oId,
                    name: option?.name || '',
                    price: option?.additionalPrice || 0
                };
            }),
            pizzaModifiers: !product.isCombo ? {
                toppings: Object.values(selectedToppings),
                addOns: Object.values(selectedAddOns),
                removals: Array.from(removedIngredients)
            } : undefined,
            slots: product.isCombo ? Object.entries(slotSelections).map(([sId, sel]) => {
                const slotDef = product.comboSlots?.find(s => s.id === sId);
                const subProduct = allProducts.find(p => p.id === sel.productId);
                return {
                    slotId: sId,
                    slotName: slotDef?.name || 'Slot',
                    option: subProduct,
                    pizzaModifiers: {
                        toppings: Object.values(sel.toppings),
                        removals: Array.from(sel.removals)
                    }
                };
            }) : undefined,
            kitchenNote: kitchenNotes.trim(),
            notes: kitchenNotes.trim(),
            isPizza: true
        };
        onAddToCart(cartItem);
        onClose();
    };

    const handleSlotProductSelect = (slotId: string, prodId: string) => {
        setSlotSelections(prev => ({
            ...prev,
            [slotId]: {
                productId: prodId,
                toppings: {},
                removals: new Set()
            }
        }));
        setActiveSlotId(slotId);
        setActiveCategory('TOPPINGS');
    };

    if (!isOpen || !product) return null;

    return (
        <div className="pos-modal-overlay" onClick={onClose}
            style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(0, 0, 0, 0.9)',
                zIndex: 1100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0'
            }}>

            <div
                className="pos-custom-sheet"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100vw',
                    height: '100vh',
                    background: 'var(--pos-bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* COMPACT RUSH HEADER */}
                <div style={{
                    padding: '24px 40px',
                    background: 'var(--pos-bg-surface)',
                    borderBottom: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 100,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <button onClick={onClose} style={{ background: 'var(--pos-bg-main)', border: '1px solid var(--pos-border-subtle)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pos-text-primary)', cursor: 'pointer' }}>
                            <ArrowLeft size={28} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--pos-action-primary)', fontSize: '11px', fontWeight: 900, background: 'rgba(31, 164, 169, 0.08)', padding: '2px 10px', borderRadius: '6px', border: '1px solid rgba(31, 164, 169, 0.15)' }}>RUSH MODE v4.2.2</span>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 800 }}>ENGINE READY</span>
                            </div>
                            <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--pos-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{product.name}</h2>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ padding: '12px 24px', background: 'rgba(31, 164, 169, 0.05)', border: '1px solid rgba(31, 164, 169, 0.1)', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase' }}>Multiplier</div>
                            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{sizeMultiplier.toFixed(2)}x</div>
                        </div>
                        <button onClick={handleReset} style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }}>
                            <RotateCcw size={24} />
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* LEFT SIDEBAR: CATEGORIES & PREVIEW */}
                    <div style={{
                        width: '380px',
                        background: 'var(--pos-bg-surface)',
                        borderRight: '1px solid var(--pos-border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '24px'
                    }}>
                        {/* Interactive Visual Mini-Map */}
                        <div style={{ marginBottom: '32px', position: 'relative', width: '240px', height: '240px', margin: '0 auto' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle at 40% 40%, #F8FAFC 0%, #E2E8F0 100%)',
                                borderRadius: '50%',
                                border: '6px solid var(--pos-border-subtle)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ fontSize: '110px' }}>🍕</div>
                                <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
                                    {Object.values(selectedToppings).map((t, i) => (
                                        <div key={t.optionId} style={{
                                            position: 'absolute',
                                            top: `${20 + (i * 25) % 55}%`,
                                            left: `${t.portion === 'RIGHT' ? 55 : (t.portion === 'LEFT' ? 10 : 35)}%`,
                                            padding: '4px 10px',
                                            background: 'var(--pos-action-primary)',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            color: 'white',
                                            boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}>
                                            {t.name.split(' ')[0]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pos-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                            {[
                                { id: 'PRESELECTED', label: 'Pre-Selected', icon: <Check size={22} />, count: Object.keys(selectedVariants).length + Object.keys(selectedToppings).length + removedIngredients.size },
                                { id: 'BASE', label: 'Size & Crust', icon: <Settings size={22} />, count: Object.keys(selectedVariants).length },
                                ...(product.isCombo ? (product.comboSlots || []).map(slot => ({
                                    id: `SLOT_${slot.id}`,
                                    label: slot.name,
                                    icon: <Utensils size={22} />,
                                    count: slotSelections[slot.id] ? 1 : 0,
                                    isSlot: true,
                                    slotId: slot.id
                                })) : []),
                                { id: 'TOPPINGS', label: activeSlotId ? 'Toppings (Slot)' : 'Toppings', icon: <Plus size={22} />, count: Object.keys(selectedToppings).length, visible: toppingOptions.length > 0 },
                                { id: 'ADDONS', label: 'Add-ons', icon: <Layers size={22} />, count: Object.keys(selectedAddOns).length, visible: addOnOptions.length > 0 },
                            ].filter((c: any) => c.visible !== false).map((cat: any) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        if (cat.isSlot) {
                                            setActiveSlotId(cat.slotId);
                                            setActiveCategory('SLOTS');
                                        } else {
                                            if (cat.id !== 'TOPPINGS') setActiveSlotId(null);
                                            setActiveCategory(cat.id);
                                        }
                                    }}
                                    style={{
                                        padding: '24px 20px',
                                        borderRadius: '20px',
                                        background: (activeCategory === cat.id || (cat.isSlot && activeSlotId === cat.slotId && activeCategory === 'SLOTS')) ? 'rgba(31, 164, 169, 0.08)' : 'rgba(0,0,0,0.01)',
                                        border: (activeCategory === cat.id || (cat.isSlot && activeSlotId === cat.slotId && activeCategory === 'SLOTS')) ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: (activeCategory === cat.id || (cat.isSlot && activeSlotId === cat.slotId && activeCategory === 'SLOTS')) ? 'var(--pos-action-primary)' : 'var(--pos-bg-main)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: (activeCategory === cat.id || (cat.isSlot && activeSlotId === cat.slotId && activeCategory === 'SLOTS')) ? 'white' : 'var(--pos-text-muted)'
                                    }}>
                                        {cat.id === 'BASE' && !isValid ? <div className="pulse-warning"><Settings size={22} /></div> : (cat.id === 'BASE' ? <Settings size={22} /> : (cat.isSlot ? <Utensils size={22} /> : cat.icon))}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 900, color: (activeCategory === cat.id || (cat.isSlot && activeSlotId === cat.slotId && activeCategory === 'SLOTS')) ? 'var(--pos-text-primary)' : 'var(--pos-text-secondary)' }}>{cat.label}</div>
                                        {cat.count > 0 && <div style={{ fontSize: '12px', color: 'var(--pos-action-primary)', fontWeight: 800 }}>
                                            {cat.isSlot && slotSelections[cat.slotId!] ? (allProducts.find(p => p.id === slotSelections[cat.slotId!]?.productId)?.name || 'ACTIVE') : `${cat.count} ACTIVE`}
                                        </div>}
                                    </div>
                                    {(activeCategory === cat.id || (cat.isSlot && activeSlotId === cat.slotId && activeCategory === 'SLOTS')) && <ChevronRight size={20} color="var(--pos-action-primary)" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MAIN SELECTION GRID */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--pos-bg-main)' }} className="pos-scroll">

                        {activeCategory === 'SLOTS' && activeSlotId && (
                            <div style={{ animation: 'posFadeInUp 0.3s' }}>
                                <h3 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '40px' }}>Select {product.comboSlots?.find(s => s.id === activeSlotId)?.name}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                    {allProducts
                                        .filter(p => !p.isCombo && product.comboSlots?.find(s => s.id === activeSlotId)?.allowedCategoryIds.includes(p.categoryId))
                                        .map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSlotProductSelect(activeSlotId, p.id)}
                                                style={{
                                                    padding: '24px',
                                                    borderRadius: '24px',
                                                    background: slotSelections[activeSlotId]?.productId === p.id ? 'rgba(31, 164, 169, 0.05)' : 'var(--pos-bg-surface)',
                                                    border: slotSelections[activeSlotId]?.productId === p.id ? '2px solid var(--pos-action-primary)' : '1px solid var(--pos-border-subtle)',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                                }}
                                            >
                                                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '8px' }}>{p.name}</div>
                                                <div style={{ fontSize: '15px', color: 'var(--pos-text-muted)' }}>{p.sku}</div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}

                        {activeCategory === 'BASE' && (
                            <div style={{ animation: 'posFadeInUp 0.3s snappier' }}>
                                {product.variantGroups?.map(group => (
                                    <div key={group.id} style={{ marginBottom: '48px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', height: '2px', background: 'var(--pos-action-primary)' }} /> {group.name}
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                            {group.options.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleVariantSelect(group.id, opt.id)}
                                                    style={{
                                                        padding: '30px',
                                                        borderRadius: '24px',
                                                        background: selectedVariants[group.id] === opt.id ? 'rgba(31, 164, 169, 0.08)' : 'var(--pos-bg-surface)',
                                                        border: selectedVariants[group.id] === opt.id ? '3px solid var(--pos-action-primary)' : '2px solid var(--pos-border-subtle)',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--pos-text-primary)', marginBottom: '8px' }}>{opt.name}</div>
                                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>{opt.additionalPrice > 0 ? `+$${opt.additionalPrice.toFixed(2)}` : 'STANDARD'}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeCategory === 'TOPPINGS' && (
                            <div style={{ animation: 'posFadeInUp 0.3s' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                                    {toppingOptions.map(opt => {
                                        const selection = selectedToppings[opt.id];
                                        const isSelected = !!selection;
                                        return (
                                            <div key={opt.id} style={{
                                                background: isSelected ? 'rgba(31, 164, 169, 0.08)' : 'rgba(255,255,255,0.03)',
                                                border: isSelected ? '2px solid var(--pos-action-primary)' : '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '24px',
                                                padding: '24px',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '16px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => handleToppingToggle(opt)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '16px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            flex: 1,
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isSelected ? 'var(--pos-action-primary)' : 'var(--pos-bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : 'var(--pos-text-muted)' }}>
                                                            {isSelected ? <Check size={24} strokeWidth={4} /> : <Plus size={20} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{opt.name}</div>
                                                            <div style={{ fontSize: '13px', color: '#10B981', fontWeight: 700 }}>+${opt.price.toFixed(2)}</div>
                                                        </div>
                                                    </button>
                                                    {isSelected && (
                                                        <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-text-secondary)' }}>
                                                            ${(opt.price * sizeMultiplier * (selection.portion === 'WHOLE' ? 1 : 0.5) * (selection.level === 'NORMAL' ? 1 : (selection.level === 'EXTRA' ? 1.5 : 2.0))).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: '16px' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                                            {(['LEFT', 'WHOLE', 'RIGHT'] as Portion[]).map(p => (
                                                                <button key={p} onClick={() => updateTopping(opt.id, { portion: p })} style={{ height: '36px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, background: selection.portion === p ? 'var(--pos-action-primary)' : 'var(--pos-bg-surface)', color: selection.portion === p ? 'white' : 'var(--pos-text-secondary)', border: '1px solid var(--pos-border-subtle)', cursor: 'pointer' }}>{p}</button>
                                                            ))}
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                                            {(['NORMAL', 'EXTRA', 'DOUBLE'] as Level[]).map(l => (
                                                                <button key={l} onClick={() => updateTopping(opt.id, { level: l })} style={{ height: '36px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, background: selection.level === l ? 'var(--pos-action-primary)' : 'var(--pos-bg-surface)', color: selection.level === l ? 'white' : 'var(--pos-text-secondary)', border: '1px solid var(--pos-border-subtle)', cursor: 'pointer' }}>{l === 'NORMAL' ? '1.0x' : (l === 'EXTRA' ? '1.5x' : '2.0x')}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeCategory === 'ADDONS' && (
                            <div style={{ animation: 'posFadeInUp 0.3s' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                    {addOnOptions.map(opt => {
                                        const selection = selectedAddOns[opt.id];
                                        return (
                                            <div key={opt.id} style={{ padding: '24px', background: 'var(--pos-bg-surface)', borderRadius: '24px', border: '1px solid var(--pos-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                <div>
                                                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{opt.name}</div>
                                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>+${opt.price.toFixed(2)}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--pos-bg-main)', borderRadius: '12px', padding: '6px' }}>
                                                    <button onClick={() => handleAddOnQty(opt, -1)} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: 'var(--pos-text-primary)', cursor: 'pointer' }}><Minus size={20} /></button>
                                                    <span style={{ fontSize: '20px', fontWeight: 900, minWidth: '40px', textAlign: 'center', color: 'var(--pos-text-primary)' }}>{selection?.quantity || 0}</span>
                                                    <button onClick={() => handleAddOnQty(opt, 1)} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: 'var(--pos-text-primary)', cursor: 'pointer' }}><Plus size={20} /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeCategory === 'PRESELECTED' && (
                            <div style={{ animation: 'posFadeInUp 0.3s' }}>
                                {/* 1. CONFIGURATION SUMMARY (DEFAULTS) */}
                                <div style={{ marginBottom: '40px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '30px', height: '2px', background: 'var(--pos-action-primary)' }} /> Configuration Summary
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                        {/* Variants (Size & Crust) */}
                                        {product.variantGroups?.map(group => {
                                            const selectedId = selectedVariants[group.id];
                                            const option = group.options.find(o => o.id === selectedId);
                                            if (!option) return null;
                                            return (
                                                <div key={group.id} style={{ padding: '16px 20px', background: 'var(--pos-bg-surface)', borderRadius: '16px', border: '1px solid var(--pos-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>{group.name}</div>
                                                        <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{option.name}</div>
                                                    </div>
                                                    <Check size={20} color="var(--pos-action-primary)" strokeWidth={3} />
                                                </div>
                                            );
                                        })}

                                        {/* Active Toppings */}
                                        {Object.values(selectedToppings).map(t => (
                                            <div key={t.optionId} style={{ padding: '16px 20px', background: 'rgba(31, 164, 169, 0.05)', borderRadius: '16px', border: '1px solid rgba(31, 164, 169, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--pos-action-primary)', textTransform: 'uppercase' }}>TOPPING</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{t.name}</div>
                                                </div>
                                                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-action-primary)' }}>{t.level !== 'NORMAL' ? t.level : ''} {t.portion !== 'WHOLE' ? t.portion : ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. MODIFICATIONS (REMOVED DEFAULTS) */}
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '30px', height: '2px', background: '#EF4444' }} /> Modifications (Removed Defaults)
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                                        {removalIngredients.map((ing: string) => (
                                            <button
                                                key={ing}
                                                onClick={() => handleRemovalToggle(ing)}
                                                style={{
                                                    padding: '24px',
                                                    borderRadius: '20px',
                                                    background: removedIngredients.has(ing) ? 'rgba(239, 68, 68, 0.05)' : 'var(--pos-bg-surface)',
                                                    border: removedIngredients.has(ing) ? '2px solid #EF4444' : '1px solid var(--pos-border-subtle)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ fontSize: '18px', fontWeight: 900, color: removedIngredients.has(ing) ? '#EF4444' : 'var(--pos-text-primary)' }}>{ing}</span>
                                                {removedIngredients.has(ing) ? <X size={20} color="#EF4444" strokeWidth={3} /> : <Plus size={16} color="var(--pos-text-muted)" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* STICKY RUSH FOOTER */}
                <div style={{
                    padding: '24px 40px',
                    background: 'var(--pos-bg-surface)',
                    borderTop: '1px solid var(--pos-border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 100,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Configuration Value</div>
                            <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--pos-text-primary)', lineHeight: 1 }}>${pricing.total.toFixed(2)}</div>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'var(--pos-border-subtle)' }} />
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 800 }}>CORE</div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>${(pricing.base + pricing.crust).toFixed(2)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--pos-action-primary)', fontWeight: 800 }}>MODS</div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#10B981' }}>+${(pricing.toppings + pricing.addOns).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {/* --- KITCHEN NOTES SECTION (TOUCH OPTIMIZED) --- */}
                    <div style={{ flex: 1, margin: '0 40px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Utensils size={14} color="var(--pos-action-primary)" />
                                Kitchen Notes
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {kitchenNotes && (
                                    <button
                                        onClick={() => setKitchenNotes('')}
                                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}
                                    >
                                        Clear
                                    </button>
                                )}
                                <span style={{ fontSize: '11px', color: kitchenNotes.length >= 150 ? '#ef4444' : 'var(--pos-text-muted)', fontWeight: 800 }}>
                                    {kitchenNotes.length}/150
                                </span>
                            </div>
                        </div>
                        <textarea
                            value={kitchenNotes}
                            onChange={(e) => setKitchenNotes(e.target.value.slice(0, 150))}
                            placeholder="Tap instructions below or type here..."
                            style={{
                                width: '100%',
                                height: '56px',
                                padding: '12px 16px',
                                background: 'white',
                                border: '2px solid var(--pos-border-subtle)',
                                borderRadius: '14px',
                                fontSize: '15px',
                                fontWeight: 700,
                                resize: 'none',
                                color: 'var(--pos-text-primary)',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--pos-action-primary)')}
                            onBlur={(e) => (e.target.style.borderColor = 'var(--pos-border-subtle)')}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {['Extra Crispy', 'Light Bake', 'Well Done', 'Cut into 4', 'Cut into 6', 'No Oregano'].map(chip => (
                                <button
                                    key={chip}
                                    onClick={() => setKitchenNotes(prev => {
                                        const clean = prev.trim();
                                        if (clean.includes(chip)) return prev;
                                        return (clean ? `${clean}, ${chip}` : chip).slice(0, 150);
                                    })}
                                    style={{
                                        height: '42px',
                                        padding: '0 16px',
                                        borderRadius: '10px',
                                        background: kitchenNotes.includes(chip) ? 'var(--pos-action-primary)' : 'rgba(31, 164, 169, 0.05)',
                                        border: '1.5px solid rgba(31, 164, 169, 0.15)',
                                        fontSize: '13px',
                                        fontWeight: 800,
                                        color: kitchenNotes.includes(chip) ? 'white' : 'var(--pos-action-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                    className="hover-scale active-pop"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!isValid}
                        style={{
                            height: '80px',
                            minWidth: '380px',
                            borderRadius: '24px',
                            background: isValid ? 'var(--pos-action-primary)' : 'rgba(255,255,255,0.05)',
                            color: isValid ? 'white' : 'rgba(255,255,255,0.2)',
                            fontSize: '24px',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            cursor: isValid ? 'pointer' : 'not-allowed',
                            border: 'none',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase'
                        }}
                    >
                        <ShoppingCart size={28} strokeWidth={3} />
                        {isValid ? (initialItem ? 'UPDATE CONFIG' : 'DEPLOY TO BASKET') : 'SELECT CRUST/SIZE'}
                    </button>
                </div>
            </div>
        </div>
    );
};
