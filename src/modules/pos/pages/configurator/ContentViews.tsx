import React, { useState } from 'react';
import { Check, Plus, Minus, X } from 'lucide-react';
import { POSProduct, POSVariantGroup } from '../../types/pos';
import { ToppingSelection, AddOnSelection } from './types';

// ─── SIZE & CRUST VIEW ─────────────────────────────────────
interface SizeCrustProps {
    variantGroups: POSVariantGroup[];
    selectedVariants: Record<string, string>;
    onVariantSelect: (groupId: string, optionId: string) => void;
}

export const SizeCrustView: React.FC<SizeCrustProps> = ({ variantGroups, selectedVariants, onVariantSelect }) => (
    <div style={{ animation: 'posFadeInUp 0.3s' }}>
        {variantGroups.map(group => (
            <div key={group.id} style={{ marginBottom: '36px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '2px', background: 'var(--pos-action-primary)' }} /> {group.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {group.options.map(opt => {
                        const isSelected = selectedVariants[group.id] === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onVariantSelect(group.id, opt.id)}
                                style={{
                                    padding: '20px 16px',
                                    borderRadius: '16px',
                                    background: isSelected ? 'rgba(31, 164, 169, 0.06)' : 'var(--pos-bg-surface)',
                                    border: isSelected ? '2px solid var(--pos-action-primary)' : '1.5px solid var(--pos-border-subtle)',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)', marginBottom: '4px' }}>{opt.name}</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: opt.additionalPrice > 0 ? 'var(--pos-action-primary)' : '#10B981' }}>
                                    {opt.additionalPrice > 0 ? `+$${opt.additionalPrice.toFixed(2)}` : 'STANDARD'}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);

// ─── SAUCE & CHEESE VIEW ─────────────────────────────────────
interface SauceCheeseProps {
    sauceOptions: { id: string; name: string; price: number; isDefault?: boolean }[];
    cheeseOptions: { id: string; name: string; price: number; isDefault?: boolean }[];
    selectedSauce: string;
    selectedCheese: string;
    onSauceSelect: (id: string) => void;
    onCheeseSelect: (id: string) => void;
}

export const SauceCheeseView: React.FC<SauceCheeseProps> = ({
    sauceOptions, cheeseOptions, selectedSauce, selectedCheese, onSauceSelect, onCheeseSelect
}) => (
    <div style={{ animation: 'posFadeInUp 0.3s' }}>
        {/* SAUCE Section */}
        <div style={{ marginBottom: '36px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '2px', background: 'var(--pos-action-primary)' }} /> Sauce
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {sauceOptions.map(opt => {
                    const isSelected = selectedSauce === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onSauceSelect(opt.id)}
                            style={{
                                padding: '20px 16px',
                                borderRadius: '16px',
                                background: isSelected ? 'rgba(31, 164, 169, 0.06)' : 'var(--pos-bg-surface)',
                                border: isSelected ? '2px solid var(--pos-action-primary)' : '1.5px solid var(--pos-border-subtle)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)', marginBottom: '4px' }}>{opt.name}</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: opt.price > 0 ? 'var(--pos-action-primary)' : '#10B981' }}>
                                {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'STANDARD'}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* CHEESE Section */}
        <div style={{ marginBottom: '36px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '2px', background: 'var(--pos-action-primary)' }} /> Cheese
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {cheeseOptions.map(opt => {
                    const isSelected = selectedCheese === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onCheeseSelect(opt.id)}
                            style={{
                                padding: '20px 16px',
                                borderRadius: '16px',
                                background: isSelected ? 'rgba(31, 164, 169, 0.06)' : 'var(--pos-bg-surface)',
                                border: isSelected ? '2px solid var(--pos-action-primary)' : '1.5px solid var(--pos-border-subtle)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)', marginBottom: '4px' }}>{opt.name}</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: opt.price > 0 ? 'var(--pos-action-primary)' : '#10B981' }}>
                                {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'STANDARD'}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);

// ─── TOPPINGS VIEW (3 sub-tabs, NO auto-advance between tabs) ─────
interface ToppingCategory {
    id: string;
    label: string;
    options: { id: string; name: string; price: number }[];
}

interface PopularCombo {
    id: string;
    label: string;
    toppings: { id: string; name: string; price: number }[];
}

interface ToppingsProps {
    preSelected: string[];
    removedIngredients: Set<string>;
    onRemovalToggle: (name: string) => void;
    toppingCategories: ToppingCategory[];
    selectedToppings: Record<string, ToppingSelection>;
    onToppingToggle: (opt: { id: string; name: string; price: number }) => void;
    popularCombos?: PopularCombo[];
    onApplyCombo?: (combo: PopularCombo) => void;
}

export const ToppingsView: React.FC<ToppingsProps> = ({
    preSelected, removedIngredients, onRemovalToggle,
    toppingCategories, selectedToppings, onToppingToggle,
    popularCombos, onApplyCombo
}) => {
    const [activeTabIdx, setActiveTabIdx] = useState(0);
    const [comboPopup, setComboPopup] = useState<string | null>(null);
    const activeCategory = toppingCategories[activeTabIdx];

    // Check if a combo is fully applied
    const isComboApplied = (combo: PopularCombo) =>
        combo.toppings.every(t => !!selectedToppings[t.id]);

    const activeCombo = popularCombos?.find(c => c.id === comboPopup);

    return (
        <div style={{ animation: 'posFadeInUp 0.3s' }}>
            {/* ═══ COMPACT COMBO ROW ═══ */}
            {popularCombos && popularCombos.length > 0 && onApplyCombo && (
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Quick:</span>
                    {popularCombos.map(combo => {
                        const applied = isComboApplied(combo);
                        const isOpen = comboPopup === combo.id;
                        return (
                            <div key={combo.id} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setComboPopup(isOpen ? null : combo.id)}
                                    style={{
                                        padding: '7px 14px',
                                        borderRadius: '10px',
                                        border: applied ? '1.5px solid var(--pos-action-primary)' : isOpen ? '1.5px solid var(--pos-action-primary)' : '1.5px solid var(--pos-border-subtle)',
                                        background: applied ? 'rgba(31,164,169,0.08)' : isOpen ? 'rgba(31,164,169,0.04)' : 'var(--pos-bg-surface)',
                                        color: applied ? 'var(--pos-action-primary)' : 'var(--pos-text-primary)',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {applied && <Check size={13} strokeWidth={3} color="var(--pos-action-primary)" />}
                                    {combo.label}
                                    <span style={{ fontSize: '10px', color: 'var(--pos-text-muted)', fontWeight: 700 }}>({combo.toppings.length})</span>
                                </button>

                                {/* ─── Combo Detail Popup ─── */}
                                {isOpen && activeCombo && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 8px)',
                                            left: '0',
                                            width: '320px',
                                            background: 'var(--pos-bg-surface)',
                                            borderRadius: '16px',
                                            border: '1.5px solid var(--pos-border-subtle)',
                                            boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                                            zIndex: 100,
                                            animation: 'posFadeInUp 0.15s',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Popup Header */}
                                        <div style={{
                                            padding: '14px 18px',
                                            borderBottom: '1px solid var(--pos-border-subtle)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '11px', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ width: '12px', height: '2px', background: '#EF4444', display: 'inline-block' }} />
                                                    {activeCombo.label}
                                                </div>
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--pos-text-muted)' }}>
                                                    {activeCombo.toppings.length} toppings
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setComboPopup(null)}
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: '8px',
                                                    border: '1px solid var(--pos-border-subtle)', background: 'var(--pos-bg-main)',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--pos-text-muted)'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>

                                        {/* Topping pills */}
                                        <div style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {activeCombo.toppings.map(t => {
                                                const isActive = !!selectedToppings[t.id];
                                                return (
                                                    <span
                                                        key={t.id}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            background: isActive ? 'rgba(31,164,169,0.08)' : 'var(--pos-bg-main)',
                                                            border: isActive ? '1px solid rgba(31,164,169,0.2)' : '1px solid var(--pos-border-subtle)',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            color: isActive ? 'var(--pos-action-primary)' : 'var(--pos-text-secondary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        {t.name}
                                                        {t.price > 0 && <span style={{ fontSize: '10px', opacity: 0.7 }}>+${t.price.toFixed(2)}</span>}
                                                        {isActive && <Check size={12} strokeWidth={3} />}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        {/* Apply button */}
                                        <div style={{ padding: '0 18px 14px' }}>
                                            <button
                                                onClick={() => {
                                                    onApplyCombo!(activeCombo);
                                                    setComboPopup(null);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    height: '38px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    background: applied ? 'var(--pos-bg-main)' : 'var(--pos-action-primary)',
                                                    color: applied ? 'var(--pos-text-secondary)' : 'white',
                                                    fontSize: '12px',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                {applied ? '✓ Already Applied' : 'Apply All Toppings'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pre-selected row */}
            {preSelected.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '2px', background: 'var(--pos-action-primary)' }} /> Pre-Selected Topping
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {preSelected.map(name => (
                            <button
                                key={name}
                                onClick={() => onRemovalToggle(name)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '12px',
                                    background: removedIngredients.has(name) ? 'rgba(239,68,68,0.06)' : 'var(--pos-bg-surface)',
                                    border: removedIngredients.has(name) ? '1.5px solid #EF4444' : '1.5px solid var(--pos-border-subtle)',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: removedIngredients.has(name) ? '#EF4444' : 'var(--pos-text-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    textDecoration: removedIngredients.has(name) ? 'line-through' : 'none'
                                }}
                            >
                                {name}
                                {removedIngredients.has(name) ? <X size={14} /> : <span style={{ color: 'var(--pos-text-muted)' }}>×</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Topping Sub-Tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid var(--pos-border-subtle)' }}>
                {toppingCategories.map((cat, idx) => {
                    const isActive = activeTabIdx === idx;
                    const selectedCount = cat.options.filter(o => !!selectedToppings[o.id]).length;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTabIdx(idx)}
                            style={{
                                padding: '14px 28px',
                                border: 'none',
                                borderBottom: isActive ? '3px solid var(--pos-action-primary)' : '3px solid transparent',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 900,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: isActive ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                position: 'relative',
                                marginBottom: '-2px'
                            }}
                        >
                            {cat.label}
                            {selectedCount > 0 && (
                                <span style={{
                                    width: '22px', height: '22px', borderRadius: '50%',
                                    background: 'var(--pos-action-primary)', color: 'white',
                                    fontSize: '11px', fontWeight: 900,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {selectedCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active Tab Content - Grid of 16 items */}
            {activeCategory && (
                <div key={activeCategory.id} style={{ animation: 'posFadeInUp 0.2s' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {activeCategory.options.map(opt => {
                            const sel = selectedToppings[opt.id];
                            const isSelected = !!sel;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => onToppingToggle(opt)}
                                    style={{
                                        padding: '20px 16px',
                                        borderRadius: '16px',
                                        background: isSelected ? 'rgba(31,164,169,0.06)' : 'var(--pos-bg-surface)',
                                        border: isSelected ? '2px solid var(--pos-action-primary)' : '1.5px solid var(--pos-border-subtle)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '8px',
                                        background: isSelected ? 'var(--pos-action-primary)' : 'var(--pos-bg-main)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isSelected ? 'white' : 'var(--pos-text-muted)', flexShrink: 0,
                                        fontSize: '11px',
                                        fontWeight: 900
                                    }}>
                                        {isSelected && sel ? (
                                            sel.portion === 'LEFT' ? 'L' :
                                            sel.portion === 'RIGHT' ? 'R' :
                                            <Check size={16} strokeWidth={3} />
                                        ) : (
                                            <Plus size={14} />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {opt.name}
                                            {isSelected && sel && sel.portion !== 'WHOLE' && (
                                                <span style={{ fontSize: '10px', color: 'var(--pos-action-primary)', background: 'rgba(31,164,169,0.08)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                                    {sel.portion}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: opt.price > 0 ? 'var(--pos-action-primary)' : '#10B981' }}>
                                            {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'FREE'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── DIPS & DRINKS VIEW ─────────────────────────────────────
interface DipsDrinksProps {
    addOnOptions: { id: string; name: string; price: number }[];
    selectedAddOns: Record<string, AddOnSelection>;
    onAddOnQty: (opt: { id: string; name: string; price: number }, delta: number) => void;
}

export const DipsDrinksView: React.FC<DipsDrinksProps> = ({ addOnOptions, selectedAddOns, onAddOnQty }) => {
    const dips = addOnOptions.filter(o =>
        o.id.startsWith('dip') || o.name.toLowerCase().includes('dip') || o.name.toLowerCase().includes('sauce') || o.name.toLowerCase().includes('garlic')
    );
    const drinks = addOnOptions.filter(o =>
        o.id.startsWith('drink') || o.name.toLowerCase().includes('coke') || o.name.toLowerCase().includes('cola') || o.name.toLowerCase().includes('sprite') || o.name.toLowerCase().includes('juice')
    );
    const other = addOnOptions.filter(o => !dips.includes(o) && !drinks.includes(o));

    const renderGrid = (label: string, items: typeof addOnOptions) => {
        if (items.length === 0) return null;
        return (
            <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '2px', background: 'var(--pos-action-primary)' }} /> {label}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {items.map(opt => {
                        const sel = selectedAddOns[opt.id];
                        const qty = sel?.quantity || 0;
                        return (
                            <div key={opt.id} style={{
                                padding: '14px 16px',
                                borderRadius: '14px',
                                background: 'var(--pos-bg-surface)',
                                border: qty > 0 ? '2px solid var(--pos-action-primary)' : '1.5px solid var(--pos-border-subtle)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'border-color 0.15s'
                            }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--pos-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.name}</div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--pos-action-primary)' }}>+${opt.price.toFixed(2)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    <button onClick={() => onAddOnQty(opt, -1)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--pos-border-subtle)', background: 'var(--pos-bg-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pos-text-primary)', fontSize: '16px', fontWeight: 700 }}>
                                        <Minus size={14} />
                                    </button>
                                    <span style={{ fontSize: '15px', fontWeight: 900, minWidth: '20px', textAlign: 'center', color: qty > 0 ? 'var(--pos-action-primary)' : 'var(--pos-text-primary)' }}>{qty}</span>
                                    <button onClick={() => onAddOnQty(opt, 1)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--pos-border-subtle)', background: 'var(--pos-bg-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pos-text-primary)', fontSize: '16px', fontWeight: 700 }}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ animation: 'posFadeInUp 0.3s' }}>
            {renderGrid('DIPS', dips)}
            {renderGrid('DRINK', drinks)}
            {other.length > 0 && renderGrid('ADD-ONS', other)}
        </div>
    );
};

// ─── PRE-SELECTED / SUMMARY VIEW ─────────────────────────────────────
interface PreSelectedProps {
    product: POSProduct;
    selectedVariants: Record<string, string>;
    selectedToppings: Record<string, ToppingSelection>;
    removedIngredients: Set<string>;
    removalIngredients: string[];
    onRemovalToggle: (name: string) => void;
}

export const PreSelectedView: React.FC<PreSelectedProps> = ({
    product, selectedVariants,
    removedIngredients, removalIngredients, onRemovalToggle
}) => (
    <div style={{ animation: 'posFadeInUp 0.3s' }}>
        {/* Configuration Summary */}
        <div style={{ marginBottom: '36px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '2px', background: 'var(--pos-action-primary)' }} /> Configuration Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {product.variantGroups?.map(group => {
                    const selectedId = selectedVariants[group.id];
                    const option = group.options.find(o => o.id === selectedId);
                    if (!option) return null;
                    return (
                        <div key={group.id} style={{ padding: '16px 20px', background: 'var(--pos-bg-surface)', borderRadius: '14px', border: '1px solid var(--pos-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>{group.name}</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--pos-text-primary)' }}>{option.name}</div>
                            </div>
                            <Check size={18} color="var(--pos-action-primary)" strokeWidth={3} />
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Removed Defaults */}
        <div>
            <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '2px', background: '#EF4444' }} /> Modifications (Removed Defaults)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {removalIngredients.map(ing => (
                    <button
                        key={ing}
                        onClick={() => onRemovalToggle(ing)}
                        style={{
                            padding: '16px 20px',
                            borderRadius: '14px',
                            background: removedIngredients.has(ing) ? 'rgba(239,68,68,0.04)' : 'var(--pos-bg-surface)',
                            border: removedIngredients.has(ing) ? '2px solid #EF4444' : '1.5px solid var(--pos-border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >
                        <span style={{ fontSize: '15px', fontWeight: 800, color: removedIngredients.has(ing) ? '#EF4444' : 'var(--pos-text-primary)' }}>{ing}</span>
                        {removedIngredients.has(ing) ? <X size={18} color="#EF4444" strokeWidth={3} /> : <Plus size={14} color="var(--pos-text-muted)" />}
                    </button>
                ))}
            </div>
        </div>
    </div>
);
