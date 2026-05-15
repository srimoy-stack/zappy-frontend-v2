'use client';

import { useEffect, useState, useMemo } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { menuService, type Product } from '@/services/kiosk/menuService';
import { ArrowLeft, Minus, Plus, AlertCircle, Check, ChevronDown } from 'lucide-react';

interface ProductScreenProps {
    productId?: string;
    editIndex?: number;
}

export function ProductScreen({ productId, editIndex }: ProductScreenProps) {
    const { addToCart, updateCartItem, cart, navigateTo, goBack } = useKioskStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [kitchenNote, setKitchenNote] = useState('');
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Record<string, number>>>({});
    const [selectedCombo, setSelectedCombo] = useState<Record<string, string>>({});
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [invalidGroups, setInvalidGroups] = useState<string[]>([]);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const isEditMode = editIndex !== undefined && editIndex >= 0;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                goBack();
                return;
            }
            setLoading(true);
            const data = await menuService.getProductById(productId);
            if (data) {
                setProduct(data);
                if (isEditMode) {
                    const existingItem = cart[editIndex];
                    if (existingItem) {
                        setQuantity(existingItem.quantity);
                        setKitchenNote(existingItem.kitchenNote);
                        setSelectedModifiers(existingItem.selectedModifiers);
                        setSelectedCombo(existingItem.selectedCombo);
                    }
                } else {
                    if (data.modifierGroups) {
                        const init: Record<string, Record<string, number>> = {};
                        data.modifierGroups.forEach(g => { init[g.id] = {}; });
                        setSelectedModifiers(init);
                    }
                    if (data.comboSteps) {
                        const init: Record<string, string> = {};
                        data.comboSteps.forEach(s => { init[s.id] = ''; });
                        setSelectedCombo(init);

                        // Auto-expand first step
                        const expInit: Record<string, boolean> = {};
                        data.comboSteps.forEach((s, i) => { expInit[s.id] = i === 0; });
                        setExpandedSections(expInit);
                    }
                }
            } else {
                goBack();
            }
            setLoading(false);
        };
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const totalPrice = useMemo(() => {
        if (!product) return 0;
        let price = product.price;
        if (product.modifierGroups) {
            Object.entries(selectedModifiers).forEach(([groupId, options]) => {
                const group = product.modifierGroups?.find(g => g.id === groupId);
                if (group) {
                    Object.entries(options).forEach(([optionId, qty]) => {
                        const option = group.options.find(o => o.id === optionId);
                        if (option) price += option.price * qty;
                    });
                }
            });
        }
        if (product.comboSteps) {
            Object.entries(selectedCombo).forEach(([stepId, optId]) => {
                const step = product.comboSteps?.find(s => s.id === stepId);
                const opt = step?.options.find(o => o.id === optId);
                if (opt) price += opt.price;
            });
        }
        return price * quantity;
    }, [product, selectedModifiers, selectedCombo, quantity]);

    const handleModifierToggle = (groupId: string, optionId: string) => {
        if (!product) return;
        const group = product.modifierGroups?.find(g => g.id === groupId);
        if (!group) return;
        setSelectedModifiers(prev => {
            const sel = { ...prev[groupId] };
            if (group.maxSelection === 1) {
                return { ...prev, [groupId]: { [optionId]: 1 } };
            }
            if (sel[optionId]) {
                delete sel[optionId];
            } else {
                const count = Object.values(sel).reduce((a, b) => a + b, 0);
                if (count < group.maxSelection) sel[optionId] = 1;
            }
            return { ...prev, [groupId]: sel };
        });
    };

    const handleQuantityModChange = (groupId: string, optionId: string, delta: number) => {
        if (!product) return;
        const group = product.modifierGroups?.find(g => g.id === groupId);
        if (!group) return;
        setSelectedModifiers(prev => {
            const sel = { ...(prev[groupId] || {}) };
            const cur = sel[optionId] || 0;
            const newQty = Math.max(0, cur + delta);
            const totalCount = Object.values(sel).reduce((a, b: number) => a + b, 0) - cur;
            if (newQty === 0) delete sel[optionId];
            else if (totalCount + newQty <= group.maxSelection) sel[optionId] = newQty;
            return { ...prev, [groupId]: sel };
        });
    };

    const validate = () => {
        if (!product) return false;
        const errors: string[] = [];
        const inv: string[] = [];
        product.modifierGroups?.forEach(group => {
            const sel = selectedModifiers[group.id] || {};
            const count = Object.values(sel).reduce((a, b) => a + b, 0);
            if (group.required && count < group.minSelection) {
                errors.push(`Please select at least ${group.minSelection} from ${group.title}`);
                inv.push(group.id);
            }
        });
        product.comboSteps?.forEach(step => {
            if (step.required && !selectedCombo[step.id]) {
                errors.push(`Please complete ${step.title}`);
                inv.push(step.id);
            }
        });
        setInvalidGroups(inv);
        if (errors.length > 0) {
            setValidationError(errors[0] || null);
            setShowValidationModal(true);
            return false;
        }
        return true;
    };

    const handleAddToOrder = () => {
        if (!product || !validate()) return;
        const modifierNames: string[] = [];
        Object.entries(selectedModifiers).forEach(([groupId, options]) => {
            const group = product.modifierGroups?.find(g => g.id === groupId);
            Object.entries(options).forEach(([optionId, qty]) => {
                const opt = group?.options.find(o => o.id === optionId);
                if (opt) modifierNames.push(`${qty > 1 ? `${qty}x ` : ''}${opt.name}`);
            });
        });
        const comboNames: string[] = [];
        Object.entries(selectedCombo).forEach(([stepId, optId]) => {
            const step = product.comboSteps?.find(s => s.id === stepId);
            const opt = step?.options.find(o => o.id === optId);
            if (opt) comboNames.push(opt.name);
        });

        const cartItem = {
            id: (isEditMode && cart[editIndex!]?.id) || Math.random().toString(36).substring(2, 11),
            productId: product.id,
            name: product.name,
            basePrice: product.price,
            image: product.image,
            selectedModifiers,
            selectedCombo,
            modifierNames,
            comboNames,
            quantity,
            kitchenNote,
            price: totalPrice / quantity,
            finalTotal: totalPrice,
            type: 'item' as const,
        };

        if (isEditMode) {
            updateCartItem(editIndex!, cartItem);
            navigateTo('cart');
        } else {
            addToCart(cartItem);
            navigateTo('menu');
        }
    };

    if (loading) {
        return (
            <div className="kiosk-loading-screen">
                <div className="kiosk-spinner-large" />
            </div>
        );
    }
    if (!product) return null;

    return (
        <div className="kiosk-product-screen">
            {/* Header */}
            <header className="kiosk-product-header">
                <button onClick={goBack} className="kiosk-back-btn">
                    <ArrowLeft size={32} />
                </button>
                <h1 className="kiosk-product-header-title">
                    {isEditMode ? 'Edit' : 'Customize'}
                </h1>
                <div style={{ width: 68 }} />
            </header>

            {/* Scrollable Content */}
            <main className="kiosk-product-main">
                {/* Hero */}
                <div className="kiosk-product-hero">
                    <img src={product.image} alt={product.name} className="parallax-img" />
                    <div className="kiosk-product-hero-gradient"></div>
                </div>

                <div className="kiosk-product-content">
                    {/* Product Info */}
                    <div className="kiosk-product-info">
                        <h2>{product.name}</h2>
                        <div className="kiosk-product-price-row">
                            <span className="kiosk-product-price">${product.price.toFixed(2)}</span>
                            {product.calories && (
                                <span className="kiosk-product-calories">{product.calories} cal</span>
                            )}
                        </div>
                        <p className="kiosk-product-desc">{product.description}</p>

                        {/* Quantity Selector under product name */}
                        <div className="kiosk-product-qty-inline">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="kiosk-qty-btn">
                                <Minus size={24} />
                            </button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="kiosk-qty-btn">
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Combo Steps */}
                    {product.comboSteps?.map(step => {
                        const selectedOpt = step.options.find(o => o.id === selectedCombo[step.id]);
                        const isExpanded = expandedSections[step.id] ?? false;
                        const isInvalid = invalidGroups.includes(step.id);

                        return (
                            <div
                                key={step.id}
                                id={step.id}
                                className={`kiosk-product-section ${isInvalid ? 'invalid' : ''} ${isExpanded ? 'expanded' : ''}`}
                            >
                                <button
                                    className="kiosk-product-section-header"
                                    onClick={() => setExpandedSections(prev => ({ ...prev, [step.id]: !prev[step.id] }))}
                                >
                                    <div className="kiosk-product-section-header-left">
                                        <ChevronDown size={20} className={`kiosk-chevron ${isExpanded ? 'expanded' : ''}`} />
                                        <span className="kiosk-product-section-title">{step.title}</span>
                                        {step.required && <span className="kiosk-required-badge">Required</span>}
                                    </div>
                                    {selectedOpt && (
                                        <span className="kiosk-product-section-selection">
                                            {selectedOpt.name}
                                            {selectedOpt.price > 0 && ` +$${selectedOpt.price.toFixed(2)}`}
                                        </span>
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="kiosk-product-section-body">
                                        {step.options.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSelectedCombo(prev => ({ ...prev, [step.id]: opt.id }))}
                                                className={`kiosk-product-option ${selectedCombo[step.id] === opt.id ? 'selected' : ''}`}
                                            >
                                                <div className="kiosk-product-option-left">
                                                    <div className={`kiosk-radio ${selectedCombo[step.id] === opt.id ? 'checked' : ''}`}>
                                                        {selectedCombo[step.id] === opt.id && <div className="kiosk-radio-inner" />}
                                                    </div>
                                                    <div className="kiosk-product-option-image">
                                                        <img src={opt.image} alt={opt.name} />
                                                    </div>
                                                    <span>{opt.name}</span>
                                                </div>
                                                {opt.price > 0 && <span className="kiosk-product-option-price">+${opt.price.toFixed(2)}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Modifier Groups */}
                    {product.modifierGroups?.map(group => {
                        const isInvalid = invalidGroups.includes(group.id);
                        return (
                            <div key={group.id} id={group.id} className={`kiosk-product-section ${isInvalid ? 'invalid' : ''}`}>
                                <div className="kiosk-product-section-header static">
                                    <div className="kiosk-product-section-header-left">
                                        <span className="kiosk-product-section-title">{group.title}</span>
                                        {group.required && <span className="kiosk-required-badge">Required</span>}
                                    </div>
                                    <span className="kiosk-product-section-hint">
                                        {group.maxSelection === 1 ? 'Select one' : `Up to ${group.maxSelection}`}
                                    </span>
                                </div>
                                <div className="kiosk-product-section-body">
                                    {group.options.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => !group.allowQuantity && handleModifierToggle(group.id, option.id)}
                                            className={`kiosk-product-option ${selectedModifiers[group.id]?.[option.id] ? 'selected' : ''}`}
                                        >
                                            <div className="kiosk-product-option-left">
                                                <div className={`kiosk-checkbox ${selectedModifiers[group.id]?.[option.id] ? 'checked' : ''}`}>
                                                    {selectedModifiers[group.id]?.[option.id] && <Check size={16} />}
                                                </div>
                                                <div className="kiosk-product-option-text">
                                                    <span>{option.name}</span>
                                                    {option.calories && <span className="kiosk-product-option-cal">{option.calories} kcal</span>}
                                                </div>
                                            </div>

                                            {group.allowQuantity ? (
                                                <div className="kiosk-product-option-qty" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => handleQuantityModChange(group.id, option.id, -1)} className="kiosk-qty-btn small">
                                                        <Minus size={18} />
                                                    </button>
                                                    <span>{selectedModifiers[group.id]?.[option.id] || 0}</span>
                                                    <button onClick={() => handleQuantityModChange(group.id, option.id, 1)} className="kiosk-qty-btn small">
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="kiosk-product-option-price">
                                                    {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'FREE'}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Kitchen Note */}
                    <div className="kiosk-product-section">
                        <div className="kiosk-product-section-header static">
                            <span className="kiosk-product-section-title">Special Instructions</span>
                        </div>
                        <div className="kiosk-product-section-body">
                            <textarea
                                value={kitchenNote}
                                onChange={e => setKitchenNote(e.target.value.slice(0, 120))}
                                placeholder="Example: No onions please..."
                                className="kiosk-product-textarea"
                            />
                            <p className="kiosk-product-textarea-count">{kitchenNote.length}/120</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom CTA */}
            <div className="kiosk-product-bottom">
                <button onClick={goBack} className="kiosk-product-back-btn">
                    Go back
                </button>
                <button onClick={handleAddToOrder} className="kiosk-product-add-btn">
                    <span>{isEditMode ? 'Update order' : 'Add to my order'}</span>
                    <span className="kiosk-product-add-price">${totalPrice.toFixed(2)}</span>
                </button>
            </div>

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="kiosk-modal-overlay">
                    <div className="kiosk-modal">
                        <div className="kiosk-modal-icon error">
                            <AlertCircle size={64} />
                        </div>
                        <h2>Selection Required</h2>
                        <p>{validationError}</p>
                        <button
                            onClick={() => {
                                setShowValidationModal(false);
                                const first = invalidGroups[0];
                                if (first) document.getElementById(first)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="kiosk-modal-btn"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
